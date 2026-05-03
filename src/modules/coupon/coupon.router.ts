import { Router } from "express";

import { checkAuth } from "../../middleware/cheackAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { Role } from "../../generated/enums";
import { couponController } from "./coupon.controller";
import {
  couponIdParamValidation,
  createCouponValidation,
  updateCouponValidation,
  validateCouponValidation,
} from "./coupon.validation";

const router = Router();

// Public/auth-aware: validate a coupon for a given amount.
router.post(
  "/validate",
  validateRequest(validateCouponValidation),
  couponController.validateCoupon
);

// Admin CRUD
router.post(
  "/",
  checkAuth(Role.ADMIN),
  validateRequest(createCouponValidation),
  couponController.createCoupon
);

router.get("/", checkAuth(Role.ADMIN), couponController.listCoupons);

router.get(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(couponIdParamValidation),
  couponController.getCouponById
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(updateCouponValidation),
  couponController.updateCoupon
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(couponIdParamValidation),
  couponController.deleteCoupon
);

export const couponRouter = router;
