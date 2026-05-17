import { z } from "zod";
import { ExpertIdSchema } from "./stats.validation";

export const getStatsByExpertIdParamsSchema = z.object({
  expertId: ExpertIdSchema,
});
