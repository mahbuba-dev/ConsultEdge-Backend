import { CouponDiscountType } from "../../generated/enums";

export interface ICreateCouponPayload {
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscount?: number;
  minAmount?: number;
  expiresAt?: string | Date;
  maxUses?: number;
  isActive?: boolean;
}

export interface IUpdateCouponPayload {
  code?: string;
  description?: string;
  discountType?: CouponDiscountType;
  discountValue?: number;
  maxDiscount?: number | null;
  minAmount?: number | null;
  expiresAt?: string | Date | null;
  maxUses?: number | null;
  isActive?: boolean;
}

export interface IValidateCouponPayload {
  code: string;
  amount: number;
}

export interface ICouponPreview {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}
