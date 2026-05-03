import z from "zod";
import { CouponDiscountType } from "../../generated/enums";

export const validateCouponValidation = z.object({
  body: z.object({
    code: z.string().trim().min(1, "Coupon code is required"),
    amount: z.coerce.number().positive("Amount must be positive"),
  }),
});

export const createCouponValidation = z.object({
  body: z.object({
    code: z.string().trim().min(2).max(40),
    description: z.string().trim().max(200).optional(),
    discountType: z.nativeEnum(CouponDiscountType),
    discountValue: z.coerce.number().positive(),
    maxDiscount: z.coerce.number().positive().optional(),
    minAmount: z.coerce.number().nonnegative().optional(),
    expiresAt: z.string().datetime().optional(),
    maxUses: z.coerce.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateCouponValidation = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    code: z.string().trim().min(2).max(40).optional(),
    description: z.string().trim().max(200).nullable().optional(),
    discountType: z.nativeEnum(CouponDiscountType).optional(),
    discountValue: z.coerce.number().positive().optional(),
    maxDiscount: z.coerce.number().positive().nullable().optional(),
    minAmount: z.coerce.number().nonnegative().nullable().optional(),
    expiresAt: z.string().datetime().nullable().optional(),
    maxUses: z.coerce.number().int().positive().nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const couponIdParamValidation = z.object({
  params: z.object({ id: z.string().uuid() }),
});
