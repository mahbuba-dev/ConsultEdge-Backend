import z from "zod";
import { ConsultationStatus } from "../../generated/enums";

const consultationIdParamsSchema = z.object({
  consultationId: z.string().uuid("Invalid consultation id"),
});

export const bookConsultationValidation = z.object({
  body: z.object({
    expertId: z.string().uuid("Invalid expert id"),
    expertScheduleId: z.string().uuid("Invalid expert schedule id"),
    couponCode: z.string().trim().min(1).max(40).optional(),
  }),
});

export const initiateConsultationPaymentValidation = z.object({
  params: consultationIdParamsSchema,
});

export const consultationSessionAccessValidation = z.object({
  params: consultationIdParamsSchema,
});

export const startConsultationSessionValidation = z.object({
  params: consultationIdParamsSchema,
});

export const completeConsultationValidation = z.object({
  params: consultationIdParamsSchema,
  body: z
    .object({
      sessionSummary: z.string().trim().max(2000).optional(),
    })
    .default({}),
});

export const cancelConsultationValidation = z.object({
  params: consultationIdParamsSchema,
  body: z.object({
    reason: z
      .string()
      .trim()
      .min(3, "Cancellation reason is required")
      .max(500),
  }),
});

export const rescheduleConsultationValidation = z.object({
  params: consultationIdParamsSchema,
  body: z.object({
    newExpertScheduleId: z.string().uuid("Invalid expert schedule id"),
    reason: z.string().trim().max(500).optional(),
  }),
});

export const updateConsultationStatusValidation = z.object({
  params: consultationIdParamsSchema,
  body: z.object({
    status: z.nativeEnum(ConsultationStatus),
    reason: z.string().trim().min(3).max(500).optional(),
    sessionSummary: z.string().trim().max(2000).optional(),
  }),
});