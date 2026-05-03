import status from "http-status";
import { Request, Response } from "express";

import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponsr";
import { couponService } from "./coupon.service";

const validateCoupon = catchAsync(async (req: Request, res: Response) => {
  const { code, amount } = req.body as { code: string; amount: number };
  const preview = await couponService.validateCoupon(code, Number(amount));

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Coupon is valid",
    data: preview,
  });
});

const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const coupon = await couponService.createCoupon(req.body);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Coupon created",
    data: coupon,
  });
});

const listCoupons = catchAsync(async (req: Request, res: Response) => {
  const result = await couponService.listCoupons(req.query as any);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Coupons fetched",
    data: result.data,
    meta: result.meta,
  });
});

const getCouponById = catchAsync(async (req: Request, res: Response) => {
  const coupon = await couponService.getCouponById(req.params.id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Coupon fetched",
    data: coupon,
  });
});

const updateCoupon = catchAsync(async (req: Request, res: Response) => {
  const coupon = await couponService.updateCoupon(
    req.params.id as string,
    req.body
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Coupon updated",
    data: coupon,
  });
});

const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  const coupon = await couponService.deleteCoupon(req.params.id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Coupon deleted",
    data: coupon,
  });
});

export const couponController = {
  validateCoupon,
  createCoupon,
  listCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
};
