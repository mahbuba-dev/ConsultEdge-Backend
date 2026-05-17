import type { Request, Response } from "express";
import { catchAsync } from "../../../shared/catchAsync";
import { aiProfileSuggestService } from "../services/aiProfileSuggest.service";
import { sendAIResponse } from "../utils/response";
import { sanitizeObject, sanitizeText } from "../utils/sanitize";

export const profileSuggest = catchAsync(async (req: Request, res: Response) => {
  const payload = sanitizeObject(req.body) as { industry: string; feedback?: string };
  const { data, meta } = await aiProfileSuggestService.profileSuggest(payload);
  sendAIResponse(res, data, meta);
});
