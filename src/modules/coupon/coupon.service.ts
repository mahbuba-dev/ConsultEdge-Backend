import status from "http-status";

import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { CouponDiscountType } from "../../generated/enums";
import type {
  ICouponPreview,
  ICreateCouponPayload,
  IUpdateCouponPayload,
} from "./coupon.interface";

const normalizeCode = (code: string) => String(code ?? "").trim().toUpperCase();

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Compute the discount amount and final price for a given coupon + cart amount.
 * Throws if the coupon cannot be applied.
 */
const computeDiscount = (
  coupon: {
    code: string;
    discountType: CouponDiscountType;
    discountValue: number;
    maxDiscount: number | null;
    minAmount: number | null;
    expiresAt: Date | null;
    maxUses: number | null;
    usedCount: number;
    isActive: boolean;
    isDeleted: boolean;
  },
  amount: number
): ICouponPreview => {
  if (!coupon.isActive || coupon.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "Coupon is not active");
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    throw new AppError(status.BAD_REQUEST, "Coupon has expired");
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    throw new AppError(status.BAD_REQUEST, "Coupon usage limit reached");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError(status.BAD_REQUEST, "Amount must be a positive number");
  }
  if (coupon.minAmount != null && amount < coupon.minAmount) {
    throw new AppError(
      status.BAD_REQUEST,
      `Coupon requires a minimum amount of ${coupon.minAmount}`
    );
  }

  let discount = 0;
  if (coupon.discountType === CouponDiscountType.PERCENT) {
    discount = (amount * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }

  if (coupon.maxDiscount != null) {
    discount = Math.min(discount, coupon.maxDiscount);
  }
  discount = Math.max(0, Math.min(discount, amount));

  const finalAmount = Math.max(0, amount - discount);

  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    originalAmount: round2(amount),
    discountAmount: round2(discount),
    finalAmount: round2(finalAmount),
  };
};

const findActiveCouponByCode = async (rawCode: string) => {
  const code = normalizeCode(rawCode);
  if (!code) {
    throw new AppError(status.BAD_REQUEST, "Coupon code is required");
  }

  const coupon = await prisma.coupon.findFirst({
    where: { code, isDeleted: false },
  });

  if (!coupon) {
    throw new AppError(status.NOT_FOUND, "Coupon not found");
  }

  return coupon;
};

const validateCoupon = async (rawCode: string, amount: number) => {
  const coupon = await findActiveCouponByCode(rawCode);
  return computeDiscount(coupon, amount);
};

const incrementUsage = async (rawCode: string) => {
  const code = normalizeCode(rawCode);
  if (!code) return;
  await prisma.coupon.updateMany({
    where: { code, isDeleted: false },
    data: { usedCount: { increment: 1 } },
  });
};

const decrementUsage = async (rawCode: string) => {
  const code = normalizeCode(rawCode);
  if (!code) return;
  await prisma.coupon.updateMany({
    where: { code, isDeleted: false, usedCount: { gt: 0 } },
    data: { usedCount: { decrement: 1 } },
  });
};

// ============== Admin CRUD ==============

const createCoupon = async (payload: ICreateCouponPayload) => {
  const code = normalizeCode(payload.code);
  if (!code) throw new AppError(status.BAD_REQUEST, "Code is required");

  if (
    payload.discountType === CouponDiscountType.PERCENT &&
    (payload.discountValue <= 0 || payload.discountValue > 100)
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Percent discount must be between 1 and 100"
    );
  }
  if (
    payload.discountType === CouponDiscountType.FIXED &&
    payload.discountValue <= 0
  ) {
    throw new AppError(status.BAD_REQUEST, "Fixed discount must be positive");
  }

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing && !existing.isDeleted) {
    throw new AppError(status.CONFLICT, "Coupon code already exists");
  }

  const data = {
    code,
    description: payload.description ?? null,
    discountType: payload.discountType,
    discountValue: payload.discountValue,
    maxDiscount: payload.maxDiscount ?? null,
    minAmount: payload.minAmount ?? null,
    expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
    maxUses: payload.maxUses ?? null,
    isActive: payload.isActive ?? true,
    isDeleted: false,
    deletedAt: null,
    usedCount: 0,
  };

  if (existing) {
    return prisma.coupon.update({ where: { code }, data });
  }
  return prisma.coupon.create({ data });
};

const listCoupons = async (query: { page?: string; limit?: string; search?: string; isActive?: string }) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: any = { isDeleted: false };
  if (query.isActive === "true") where.isActive = true;
  if (query.isActive === "false") where.isActive = false;
  if (query.search) {
    where.code = { contains: String(query.search).toUpperCase() };
  }

  const [data, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.coupon.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getCouponById = async (id: string) => {
  const coupon = await prisma.coupon.findFirst({
    where: { id, isDeleted: false },
  });
  if (!coupon) throw new AppError(status.NOT_FOUND, "Coupon not found");
  return coupon;
};

const updateCoupon = async (id: string, payload: IUpdateCouponPayload) => {
  const existing = await getCouponById(id);

  if (payload.code) {
    const newCode = normalizeCode(payload.code);
    if (newCode !== existing.code) {
      const dup = await prisma.coupon.findUnique({ where: { code: newCode } });
      if (dup && dup.id !== existing.id && !dup.isDeleted) {
        throw new AppError(status.CONFLICT, "Coupon code already exists");
      }
    }
  }

  const data: any = {};
  if (payload.code !== undefined) data.code = normalizeCode(payload.code);
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.discountType !== undefined) data.discountType = payload.discountType;
  if (payload.discountValue !== undefined) data.discountValue = payload.discountValue;
  if (payload.maxDiscount !== undefined) data.maxDiscount = payload.maxDiscount;
  if (payload.minAmount !== undefined) data.minAmount = payload.minAmount;
  if (payload.expiresAt !== undefined)
    data.expiresAt = payload.expiresAt ? new Date(payload.expiresAt) : null;
  if (payload.maxUses !== undefined) data.maxUses = payload.maxUses;
  if (payload.isActive !== undefined) data.isActive = payload.isActive;

  return prisma.coupon.update({ where: { id }, data });
};

const deleteCoupon = async (id: string) => {
  await getCouponById(id);
  return prisma.coupon.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date(), isActive: false },
  });
};

export const couponService = {
  computeDiscount,
  findActiveCouponByCode,
  validateCoupon,
  incrementUsage,
  decrementUsage,
  createCoupon,
  listCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
};
