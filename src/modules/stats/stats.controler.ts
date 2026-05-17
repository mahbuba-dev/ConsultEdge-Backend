import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";


import { StatsService } from "./stats.service";
import { sendResponse } from "../../shared/sendResponsr";
import { getStatsByExpertIdParamsSchema } from "./stats.schemas";


const getDashboardStatsData = catchAsync(async (req: Request, res: Response) => {
  const user = req.user; // comes from checkAuth middleware
  const result = await StatsService.getDashboardStatsData(user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Dashboard stats retrieved successfully!",
    data: result,
  });
});

// New: GET /expert/:expertId (UUID or email)
const getStatsByExpertId = catchAsync(async (req: Request, res: Response) => {
  const { expertId } = getStatsByExpertIdParamsSchema.parse(req.params);
  const result = await StatsService.getStatsByExpertId(expertId);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Expert stats retrieved successfully!",
    data: result,
  });
});

export const StatsController = {
  getDashboardStatsData,
  getStatsByExpertId,
};