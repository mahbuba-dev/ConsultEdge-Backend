import { ConsultationStatus } from "../../generated/enums";

export interface IBookConsultationPayload {
  expertId: string;
  expertScheduleId: string;
  couponCode?: string;
}

export interface IInitiatePaymentPayload {
  consultationId: string;
}

export interface ICancelConsultationPayload {
  reason: string;
}

export interface IRescheduleConsultationPayload {
  newExpertScheduleId: string;
  reason?: string;
}

export interface ICompleteConsultationPayload {
  sessionSummary?: string;
}

export interface IUpdateConsultationStatusPayload {
  status: ConsultationStatus;
  reason?: string;
  sessionSummary?: string;
}