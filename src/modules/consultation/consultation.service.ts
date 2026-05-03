import status from "http-status";
import { v7 as uuidv7 } from "uuid";

import {
  IBookConsultationPayload,
  ICancelConsultationPayload,
  ICompleteConsultationPayload,
  IRescheduleConsultationPayload,
  IUpdateConsultationStatusPayload,
} from "./consultation.interface";

import { ConsultationStatus, PaymentStatus, Role } from "../../generated/enums";
import { envVars } from "../../config/env";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { stripe } from "../../config/stripe.config";


import { Consultation, Prisma } from "../../generated/client";
import {
  bookingSearchableFields,
  bookingFilterableFields,
  bookingIncludeConfig,
} from "./consultation.constant";
import { QueryBuilder } from "../../utilis/queryBuilder";
import { couponService } from "../coupon/coupon.service";

const SESSION_JOIN_LEAD_MINUTES = 15;
const SESSION_JOIN_GRACE_MINUTES = 30;

const consultationInclude = {
  client: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  },
  expert: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  },
  payment: true,
  expertSchedule: {
    include: {
      schedule: true,
    },
  },
  testimonial: true,
};

const sendConsultationNotifications = async ({
  type,
  clientUserId,
  expertUserId,
  clientMessage,
  expertMessage,
}: {
  type: string;
  clientUserId?: string | null;
  expertUserId?: string | null;
  clientMessage?: string;
  expertMessage?: string;
}) => {
  const notifications = [
    clientUserId && clientMessage
      ? {
          type,
          message: clientMessage,
          userId: clientUserId,
        }
      : null,
    expertUserId && expertMessage
      ? {
          type,
          message: expertMessage,
          userId: expertUserId,
        }
      : null,
  ].filter(
    (
      item
    ): item is {
      type: string;
      message: string;
      userId: string;
    } => Boolean(item)
  );

  if (notifications.length) {
    await prisma.notification.createMany({
      data: notifications,
    });
  }
};

const getSessionMeta = (consultation: {
  date: Date;
  status: ConsultationStatus;
  paymentStatus: PaymentStatus;
  expertSchedule?: {
    schedule?: {
      startDateTime: Date;
      endDateTime: Date;
    } | null;
  } | null;
}) => {
  const scheduledStart = consultation.expertSchedule?.schedule?.startDateTime ?? consultation.date;
  const scheduledEnd =
    consultation.expertSchedule?.schedule?.endDateTime ??
    new Date(scheduledStart.getTime() + 60 * 60 * 1000);

  const joinAvailableFrom = new Date(
    scheduledStart.getTime() - SESSION_JOIN_LEAD_MINUTES * 60 * 1000
  );
  const joinAvailableUntil = new Date(
    scheduledEnd.getTime() + SESSION_JOIN_GRACE_MINUTES * 60 * 1000
  );

  const now = new Date();
  let canJoinNow = false;
  let joinMessage = "Session is ready to start.";

  if (consultation.status === ConsultationStatus.CANCELLED) {
    joinMessage = "This consultation has been cancelled.";
  } else if (consultation.status === ConsultationStatus.COMPLETED) {
    joinMessage = "This consultation has already been completed.";
  } else if (consultation.paymentStatus !== PaymentStatus.PAID) {
    joinMessage = "Payment must be completed before the session can start.";
  } else if (now < joinAvailableFrom) {
    joinMessage = `Session can be joined ${SESSION_JOIN_LEAD_MINUTES} minutes before the scheduled start time.`;
  } else if (now > joinAvailableUntil && consultation.status !== ConsultationStatus.ONGOING) {
    joinMessage = "The join window for this session has passed.";
  } else {
    canJoinNow = true;

    if (consultation.status === ConsultationStatus.ONGOING) {
      joinMessage = "Session is currently ongoing.";
    }
  }

  return {
    canJoinNow,
    scheduledStart,
    scheduledEnd,
    joinAvailableFrom,
    joinAvailableUntil,
    joinMessage,
  };
};

const enrichConsultation = <T extends {
  date: Date;
  status: ConsultationStatus;
  paymentStatus: PaymentStatus;
  expertSchedule?: {
    schedule?: {
      startDateTime: Date;
      endDateTime: Date;
    } | null;
  } | null;
}>(consultation: T) => ({
  ...consultation,
  sessionMeta: getSessionMeta(consultation),
});

const getConsultationWithAccess = async (
  consultationId: string,
  user: IRequestUser
) => {
  if (user.role === Role.ADMIN) {
    return prisma.consultation.findUniqueOrThrow({
      where: { id: consultationId },
      include: consultationInclude,
    });
  }

  if (user.role === Role.CLIENT) {
    const client = await prisma.client.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });

    if (!client) {
      throw new AppError(status.NOT_FOUND, "Client profile not found");
    }

    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        clientId: client.id,
      },
      include: consultationInclude,
    });

    if (!consultation) {
      throw new AppError(status.NOT_FOUND, "Consultation not found");
    }

    return consultation;
  }

  if (user.role === Role.EXPERT) {
    const expert = await prisma.expert.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });

    if (!expert) {
      throw new AppError(status.NOT_FOUND, "Expert profile not found");
    }

    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        expertId: expert.id,
      },
      include: consultationInclude,
    });

    if (!consultation) {
      throw new AppError(status.NOT_FOUND, "Consultation not found");
    }

    return consultation;
  }

  throw new AppError(status.FORBIDDEN, "Only clients, experts, or admins can access consultations");
};

const validateBookableExpertSchedule = async (
  expertId: string,
  expertScheduleId: string
) => {
  const expertSchedule = await prisma.expertSchedule.findFirst({
    where: {
      id: expertScheduleId,
      expertId,
      isDeleted: false,
    },
    include: {
      schedule: true,
    },
  });

  if (!expertSchedule) {
    throw new AppError(
      status.NOT_FOUND,
      "The selected availability slot was not found for this expert"
    );
  }

  if (!expertSchedule.isPublished) {
    throw new AppError(status.BAD_REQUEST, "This schedule is not published for booking yet");
  }

  if (expertSchedule.isBooked) {
    throw new AppError(
      status.BAD_REQUEST,
      "This schedule is already booked for another consultation"
    );
  }

  return expertSchedule;
};

const syncUnpaidConsultationsWithStripe = async (where: {
  clientId?: string;
  expertId?: string;
}) => {
  const unpaidConsultations = await prisma.consultation.findMany({
    where: {
      ...where,
      paymentStatus: PaymentStatus.UNPAID,
      status: {
        in: [ConsultationStatus.PENDING, ConsultationStatus.CONFIRMED],
      },
      payment: {
        is: {
          status: PaymentStatus.UNPAID,
        },
      },
    },
    select: {
      id: true,
      status: true,
      client: {
        select: {
          userId: true,
        },
      },
      expert: {
        select: {
          userId: true,
        },
      },
      payment: {
        select: {
          id: true,
          transactionId: true,
        },
      },
    },
  });

  if (!unpaidConsultations.length) {
    return;
  }

  const consultationMap = new Map(
    unpaidConsultations
      .filter((item) => Boolean(item.payment?.id && item.payment?.transactionId))
      .map((item) => [
        item.id,
        {
          paymentId: item.payment!.id,
          transactionId: item.payment!.transactionId,
        },
      ])
  );

  if (!consultationMap.size) {
    return;
  }

  const paidMatches = new Map<
    string,
    {
      paymentId: string;
      transactionId: string;
      gatewayData: Record<string, unknown>;
    }
  >();

  let startingAfter: string | undefined;

  for (let page = 0; page < 5; page += 1) {
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const session of sessions.data) {
      if (session.payment_status !== "paid" || session.status !== "complete") {
        continue;
      }

      const consultationId = session.metadata?.consultationId;
      const paymentId = session.metadata?.paymentId;
      const transactionId = session.metadata?.transactionId;

      if (!consultationId || !paymentId || !transactionId) {
        continue;
      }

      const local = consultationMap.get(consultationId);

      if (!local) {
        continue;
      }

      if (local.paymentId !== paymentId || local.transactionId !== transactionId) {
        continue;
      }

      paidMatches.set(consultationId, {
        paymentId,
        transactionId,
        gatewayData: session as unknown as Record<string, unknown>,
      });
    }

    if (!sessions.has_more || sessions.data.length === 0) {
      break;
    }

    startingAfter = sessions.data[sessions.data.length - 1]?.id;
  }

  if (!paidMatches.size) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const [consultationId, match] of paidMatches) {
      await tx.payment.update({
        where: { id: match.paymentId },
        data: {
          status: PaymentStatus.PAID,
          paymentGatewayData: match.gatewayData as any,
        },
      });

      await tx.consultation.update({
        where: { id: consultationId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: ConsultationStatus.CONFIRMED,
        },
      });
    }
  });
};

// BOOK CONSULTATION WITH IMMEDIATE PAYMENT (checkout URL)
const bookConsultation = async (
  payload: IBookConsultationPayload,
  user: IRequestUser
) => {
  const client = await prisma.client.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  const expert = await prisma.expert.findUniqueOrThrow({
    where: {
      id: payload.expertId,
      isDeleted: false,
    },
  });

  const expertSchedule = await validateBookableExpertSchedule(
    expert.id,
    payload.expertScheduleId
  );

  // Apply coupon (if any) to the expert's fee.
  const originalFee = expert.consultationFee;
  let finalAmount = originalFee;
  let discountAmount = 0;
  let couponCode: string | null = null;

  if (payload.couponCode) {
    const preview = await couponService.validateCoupon(
      payload.couponCode,
      originalFee
    );
    finalAmount = preview.finalAmount;
    discountAmount = preview.discountAmount;
    couponCode = preview.code;
  }

  const videoCallId = uuidv7();

  const result = await prisma.$transaction(async (tx) => {
    const consultation = await tx.consultation.create({
      data: {
        clientId: client.id,
        expertId: expert.id,
        expertScheduleId: expertSchedule.id,
        videoCallId,
        date: expertSchedule.schedule.startDateTime,
        status: ConsultationStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
      },
      include: {
        expert: true,
      },
    });

    await tx.expertSchedule.update({
      where: { id: expertSchedule.id },
      data: {
        isBooked: true,
        consultationId: consultation.id,
      },
    });

    const transactionId = uuidv7();

    const payment = await tx.payment.create({
      data: {
        consultationId: consultation.id,
        amount: finalAmount,
        originalAmount: originalFee,
        discountAmount,
        couponCode,
        transactionId,
        status: PaymentStatus.UNPAID,
      },
    });

    // Set notification message based on payment status
    const isPaid = payment.status === PaymentStatus.PAID;
    await tx.notification.createMany({
      data: [
        {
          type: "CONSULTATION_BOOKED",
          message: isPaid
            ? `Your consultation with ${expert.fullName} has been booked and paid successfully.`
            : `Your consultation with ${expert.fullName} has been booked successfully. Please complete the payment to confirm it.`,
          userId: client.userId,
        },
        {
          type: "CONSULTATION_BOOKED",
          message: isPaid
            ? `${client.fullName} booked and paid for a consultation with you for ${expertSchedule.schedule.startDateTime.toLocaleString()}.`
            : `${client.fullName} booked a consultation with you for ${expertSchedule.schedule.startDateTime.toLocaleString()}. Payment confirmation is pending.`,
          userId: expert.userId,
        },
      ],
    });

    const successParams = new URLSearchParams({
      consultationId: consultation.id,
      paymentId: payment.id,
      transactionId,
      status: "success",
      amount: String(finalAmount),
    });

    const cancelParams = new URLSearchParams({
      consultationId: consultation.id,
      paymentId: payment.id,
      transactionId,
      status: "cancelled",
      amount: String(finalAmount),
    });

    const stripeUnitAmount = Math.max(0, Math.round(finalAmount * 100));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Consultation with ${expert.fullName}`,
            },
            unit_amount: stripeUnitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        consultationId: consultation.id,
        paymentId: payment.id,
        transactionId,
        amount: String(finalAmount),
        originalAmount: String(originalFee),
        discountAmount: String(discountAmount),
        couponCode: couponCode ?? "",
      },
      success_url: `${envVars.FRONTEND_URL}/dashboard/payment/consultation-success?${successParams.toString()}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${envVars.FRONTEND_URL}/dashboard/consultations?${cancelParams.toString()}`,
    });

    return {
      consultation,
      payment,
      paymentUrl: session.url,
    };
  });

  if (couponCode) {
    // Reserve a coupon use as soon as the booking is created. We
    // intentionally don't await failure here — usage is best-effort and
    // the booking should still succeed if the counter update misses.
    couponService.incrementUsage(couponCode).catch((error) => {
      console.error("Failed to increment coupon usage", error);
    });
  }

  return {
    consultation: result.consultation,
    payment: result.payment,
    paymentUrl: result.paymentUrl,
  };
};

// BOOK CONSULTATION WITH PAY LATER
const bookConsultationWithPayLater = async (
  payload: IBookConsultationPayload,
  user: IRequestUser
) => {
  const client = await prisma.client.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  const expert = await prisma.expert.findUniqueOrThrow({
    where: {
      id: payload.expertId,
      isDeleted: false,
    },
  });

  const expertSchedule = await validateBookableExpertSchedule(
    expert.id,
    payload.expertScheduleId
  );

  const originalFee = expert.consultationFee;
  let finalAmount = originalFee;
  let discountAmount = 0;
  let couponCode: string | null = null;

  if (payload.couponCode) {
    const preview = await couponService.validateCoupon(
      payload.couponCode,
      originalFee
    );
    finalAmount = preview.finalAmount;
    discountAmount = preview.discountAmount;
    couponCode = preview.code;
  }

  const videoCallId = uuidv7();

  const result = await prisma.$transaction(async (tx) => {
    const consultation = await tx.consultation.create({
      data: {
        clientId: client.id,
        expertId: expert.id,
        expertScheduleId: expertSchedule.id,
        videoCallId,
        date: expertSchedule.schedule.startDateTime,
        status: ConsultationStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
      },
      include: {
        expert: true,
      },
    });

    await tx.expertSchedule.update({
      where: { id: expertSchedule.id },
      data: {
        isBooked: true,
        consultationId: consultation.id,
      },
    });

    const transactionId = String(uuidv7());

    const payment = await tx.payment.create({
      data: {
        consultationId: consultation.id,
        amount: finalAmount,
        originalAmount: originalFee,
        discountAmount,
        couponCode,
        transactionId,
        status: PaymentStatus.UNPAID,
      },
    });

    // Set notification message based on payment status
    const isPaid = payment.status === PaymentStatus.PAID;
    await tx.notification.createMany({
      data: [
        {
          type: "CONSULTATION_BOOKED",
          message: isPaid
            ? `Your consultation with ${expert.fullName} has been booked and paid successfully.`
            : `Your consultation with ${expert.fullName} has been booked successfully. Please complete payment before the session starts.`,
          userId: client.userId,
        },
        {
          type: "CONSULTATION_BOOKED",
          message: isPaid
            ? `${client.fullName} booked and paid for a consultation with you for ${expertSchedule.schedule.startDateTime.toLocaleString()}.`
            : `${client.fullName} booked a consultation with you for ${expertSchedule.schedule.startDateTime.toLocaleString()}.`,
          userId: expert.userId,
        },
      ],
    });

    return {
      consultation,
      payment,
    };
  });

  if (couponCode) {
    couponService.incrementUsage(couponCode).catch((error) => {
      console.error("Failed to increment coupon usage", error);
    });
  }

  return result;
};

// GET MY BOOKINGS FOR CLIENT / EXPERT
const getMyBookings = async (user: IRequestUser) => {
  if (user.role === Role.CLIENT) {
    const client = await prisma.client.findUniqueOrThrow({
      where: { userId: user.userId },
    });

    // Keep booking state consistent even when webhook delivery is delayed.
    try {
      await syncUnpaidConsultationsWithStripe({ clientId: client.id });
    } catch (error) {
      console.error("Failed to sync unpaid consultations for client:", error);
    }

    const consultations = await prisma.consultation.findMany({
      where: { clientId: client.id },
      include: consultationInclude,
      orderBy: { createdAt: "desc" },
    });

    return consultations.map((consultation) => enrichConsultation(consultation));
  }

  if (user.role === Role.EXPERT) {
    const expert = await prisma.expert.findUniqueOrThrow({
      where: { userId: user.userId },
    });

    // Keep booking state consistent even when webhook delivery is delayed.
    try {
      await syncUnpaidConsultationsWithStripe({ expertId: expert.id });
    } catch (error) {
      console.error("Failed to sync unpaid consultations for expert:", error);
    }

    const consultations = await prisma.consultation.findMany({
      where: { expertId: expert.id },
      include: consultationInclude,
      orderBy: { createdAt: "desc" },
    });

    return consultations.map((consultation) => enrichConsultation(consultation));
  }

  throw new AppError(status.FORBIDDEN, "Only clients and experts can view their bookings");
};

// INITIATE PAYMENT FOR EXISTING CONSULTATION
const initiateConsultationPayment = async (
  consultationId: string,
  user: IRequestUser
) => {
  const client = await prisma.client.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  const consultation = await prisma.consultation.findFirst({
    where: {
      id: consultationId,
      clientId: client.id,
    },
    include: {
      expert: true,
      payment: true,
    },
  });

  if (!consultation) {
    throw new AppError(status.NOT_FOUND, "Consultation not found");
  }

  if (!consultation.payment) {
    throw new AppError(status.BAD_REQUEST, "Payment not found for this consultation");
  }

  if (consultation.payment.status === PaymentStatus.PAID) {
    throw new AppError(
      status.BAD_REQUEST,
      "Payment already completed for this consultation"
    );
  }

  if (
    consultation.status === ConsultationStatus.CANCELLED ||
    consultation.status === ConsultationStatus.COMPLETED ||
    consultation.status === ConsultationStatus.ONGOING
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Payment cannot be initiated for a cancelled, completed, or ongoing consultation."
    );
  }

  const successParams = new URLSearchParams({
    consultationId: consultation.id,
    paymentId: consultation.payment.id,
    transactionId: consultation.payment.transactionId,
    status: "success",
    amount: String(consultation.payment.amount),
  });

  const cancelParams = new URLSearchParams({
    consultationId: consultation.id,
    paymentId: consultation.payment.id,
    transactionId: consultation.payment.transactionId,
    status: "cancelled",
    amount: String(consultation.payment.amount),
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Consultation with ${consultation.expert?.fullName}`,
          },
          unit_amount: consultation.payment.amount * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      consultationId: consultation.id,
      paymentId: consultation.payment.id,
      transactionId: consultation.payment.transactionId,
      amount: String(consultation.payment.amount),
    },
    success_url: `${envVars.FRONTEND_URL}/dashboard/payment/consultation-success?${successParams.toString()}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.FRONTEND_URL}/dashboard/consultations?${cancelParams.toString()}`,
  });

  return {
    paymentUrl: session.url,
  };
};

const getSessionAccess = async (consultationId: string, user: IRequestUser) => {
  const consultation = await getConsultationWithAccess(consultationId, user);
  const sessionMeta = getSessionMeta(consultation);

  return {
    consultation: enrichConsultation(consultation),
    videoCallId: consultation.videoCallId,
    ...sessionMeta,
  };
};

const startSession = async (consultationId: string, user: IRequestUser) => {
  const consultation = await getConsultationWithAccess(consultationId, user);

  if (consultation.status === ConsultationStatus.CANCELLED) {
    throw new AppError(status.BAD_REQUEST, "This consultation has been cancelled.");
  }

  if (consultation.status === ConsultationStatus.COMPLETED) {
    throw new AppError(status.BAD_REQUEST, "This consultation is already completed.");
  }

  const sessionMeta = getSessionMeta(consultation);

  if (!sessionMeta.canJoinNow && consultation.status !== ConsultationStatus.ONGOING) {
    throw new AppError(status.BAD_REQUEST, sessionMeta.joinMessage);
  }

  if (consultation.status === ConsultationStatus.ONGOING) {
    return enrichConsultation(consultation);
  }

  const updatedConsultation = await prisma.consultation.update({
    where: { id: consultation.id },
    data: {
      status: ConsultationStatus.ONGOING,
      startedAt: consultation.startedAt ?? new Date(),
    },
    include: consultationInclude,
  });

  await sendConsultationNotifications({
    type: "CONSULTATION_STARTED",
    clientUserId: updatedConsultation.client.userId,
    expertUserId: updatedConsultation.expert?.userId,
    clientMessage: `Your session with ${updatedConsultation.expert?.fullName ?? "your expert"} is now live.`,
    expertMessage: `Your session with ${updatedConsultation.client.fullName} is now live.`,
  });

  return enrichConsultation(updatedConsultation);
};

const completeSession = async (
  consultationId: string,
  user: IRequestUser,
  payload: ICompleteConsultationPayload
) => {
  const consultation = await getConsultationWithAccess(consultationId, user);

  if (consultation.status === ConsultationStatus.CANCELLED) {
    throw new AppError(status.BAD_REQUEST, "Cancelled consultations cannot be completed.");
  }

  if (consultation.status === ConsultationStatus.COMPLETED) {
    return enrichConsultation(consultation);
  }

  if (
    consultation.status !== ConsultationStatus.ONGOING &&
    consultation.paymentStatus !== PaymentStatus.PAID
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Only paid or ongoing consultations can be completed."
    );
  }

  const updatedConsultation = await prisma.consultation.update({
    where: { id: consultation.id },
    data: {
      status: ConsultationStatus.COMPLETED,
      endedAt: new Date(),
      sessionSummary: payload.sessionSummary?.trim() || consultation.sessionSummary,
    },
    include: consultationInclude,
  });

  await sendConsultationNotifications({
    type: "CONSULTATION_COMPLETED",
    clientUserId: updatedConsultation.client.userId,
    expertUserId: updatedConsultation.expert?.userId,
    clientMessage: `Your consultation with ${updatedConsultation.expert?.fullName ?? "your expert"} has been completed. You can now leave a review.`,
    expertMessage: `Your consultation with ${updatedConsultation.client.fullName} has been marked as completed.`,
  });

  return enrichConsultation(updatedConsultation);
};

const cancelConsultation = async (
  consultationId: string,
  user: IRequestUser,
  payload: ICancelConsultationPayload
) => {
  const consultation = await getConsultationWithAccess(consultationId, user);

  if (consultation.status === ConsultationStatus.CANCELLED) {
    return enrichConsultation(consultation);
  }

  if (consultation.status === ConsultationStatus.COMPLETED) {
    throw new AppError(status.BAD_REQUEST, "Completed consultations cannot be cancelled.");
  }

  if (consultation.status === ConsultationStatus.ONGOING && user.role !== Role.ADMIN) {
    throw new AppError(
      status.BAD_REQUEST,
      "An ongoing session cannot be cancelled. Please complete it instead."
    );
  }

  const reason = payload.reason.trim();

  const updatedConsultation = await prisma.$transaction(async (tx) => {
    await tx.expertSchedule.update({
      where: { id: consultation.expertScheduleId },
      data: {
        isBooked: false,
        consultationId: null,
      },
    });

    return tx.consultation.update({
      where: { id: consultation.id },
      data: {
        status: ConsultationStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: reason,
        cancelledBy: user.role,
      },
      include: consultationInclude,
    });
  });

  await sendConsultationNotifications({
    type: "CONSULTATION_CANCELLED",
    clientUserId: updatedConsultation.client.userId,
    expertUserId: updatedConsultation.expert?.userId,
    clientMessage: `Your consultation with ${updatedConsultation.expert?.fullName ?? "your expert"} has been cancelled. Reason: ${reason}`,
    expertMessage: `Your consultation with ${updatedConsultation.client.fullName} has been cancelled. Reason: ${reason}`,
  });

  if (updatedConsultation.paymentStatus === PaymentStatus.PAID) {
    const admins = await prisma.user.findMany({
      where: {
        role: Role.ADMIN,
        isDeleted: false,
      },
      select: { id: true },
    });

    if (admins.length) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          type: "CONSULTATION_REFUND_REVIEW",
          message: `A paid consultation cancellation may need refund review. Consultation ID: ${updatedConsultation.id}`,
          userId: admin.id,
        })),
      });
    }
  }

  return enrichConsultation(updatedConsultation);
};

const rescheduleConsultation = async (
  consultationId: string,
  user: IRequestUser,
  payload: IRescheduleConsultationPayload
) => {
  const consultation = await getConsultationWithAccess(consultationId, user);

  if (consultation.status === ConsultationStatus.CANCELLED) {
    throw new AppError(status.BAD_REQUEST, "Cancelled consultations cannot be rescheduled.");
  }

  if (consultation.status === ConsultationStatus.COMPLETED) {
    throw new AppError(status.BAD_REQUEST, "Completed consultations cannot be rescheduled.");
  }

  if (consultation.status === ConsultationStatus.ONGOING) {
    throw new AppError(status.BAD_REQUEST, "An ongoing consultation cannot be rescheduled.");
  }

  if (consultation.expertScheduleId === payload.newExpertScheduleId) {
    throw new AppError(
      status.BAD_REQUEST,
      "Please choose a different schedule for rescheduling."
    );
  }

  const newExpertSchedule = await prisma.expertSchedule.findFirst({
    where: {
      id: payload.newExpertScheduleId,
      expertId: consultation.expertId ?? undefined,
      isDeleted: false,
    },
    include: {
      schedule: true,
    },
  });

  if (!newExpertSchedule) {
    throw new AppError(status.NOT_FOUND, "The new schedule slot was not found.");
  }

  if (!newExpertSchedule.isPublished) {
    throw new AppError(status.BAD_REQUEST, "The selected schedule is not published.");
  }

  if (newExpertSchedule.isBooked) {
    throw new AppError(status.BAD_REQUEST, "The selected schedule is already booked.");
  }

  if (newExpertSchedule.schedule.startDateTime <= new Date()) {
    throw new AppError(
      status.BAD_REQUEST,
      "Please choose a future schedule slot for rescheduling."
    );
  }

  const updatedConsultation = await prisma.$transaction(async (tx) => {
    await tx.expertSchedule.update({
      where: { id: consultation.expertScheduleId },
      data: {
        isBooked: false,
        consultationId: null,
      },
    });

    await tx.expertSchedule.update({
      where: { id: newExpertSchedule.id },
      data: {
        isBooked: true,
        consultationId: consultation.id,
      },
    });

    return tx.consultation.update({
      where: { id: consultation.id },
      data: {
        expertScheduleId: newExpertSchedule.id,
        date: newExpertSchedule.schedule.startDateTime,
        status:
          consultation.paymentStatus === PaymentStatus.PAID
            ? ConsultationStatus.CONFIRMED
            : ConsultationStatus.PENDING,
        rescheduledAt: new Date(),
        rescheduleReason: payload.reason?.trim() || null,
        rescheduledBy: user.role,
        startedAt: null,
        endedAt: null,
      },
      include: consultationInclude,
    });
  });

  const reasonSuffix = payload.reason?.trim()
    ? ` Reason: ${payload.reason.trim()}`
    : "";

  await sendConsultationNotifications({
    type: "CONSULTATION_RESCHEDULED",
    clientUserId: updatedConsultation.client.userId,
    expertUserId: updatedConsultation.expert?.userId,
    clientMessage: `Your consultation with ${updatedConsultation.expert?.fullName ?? "your expert"} has been rescheduled to ${updatedConsultation.date.toLocaleString()}.${reasonSuffix}`,
    expertMessage: `Your consultation with ${updatedConsultation.client.fullName} has been rescheduled to ${updatedConsultation.date.toLocaleString()}.${reasonSuffix}`,
  });

  return enrichConsultation(updatedConsultation);
};

const updateConsultationStatus = async (
  consultationId: string,
  user: IRequestUser,
  payload: IUpdateConsultationStatusPayload
) => {
  const nextStatus = payload.status;

  if (nextStatus === ConsultationStatus.ONGOING) {
    return startSession(consultationId, user);
  }

  if (nextStatus === ConsultationStatus.COMPLETED) {
    return completeSession(consultationId, user, {
      sessionSummary: payload.sessionSummary,
    });
  }

  if (nextStatus === ConsultationStatus.CANCELLED) {
    return cancelConsultation(consultationId, user, {
      reason: payload.reason?.trim() || "Cancelled via consultation status update.",
    });
  }

  const consultation = await getConsultationWithAccess(consultationId, user);

  if (consultation.status === ConsultationStatus.CANCELLED) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cancelled consultations cannot be updated to another status."
    );
  }

  if (consultation.status === ConsultationStatus.COMPLETED) {
    throw new AppError(
      status.BAD_REQUEST,
      "Completed consultations cannot be updated to another status."
    );
  }

  if (consultation.status === nextStatus) {
    return enrichConsultation(consultation);
  }

  if (nextStatus === ConsultationStatus.CONFIRMED) {
    if (consultation.paymentStatus !== PaymentStatus.PAID) {
      throw new AppError(
        status.BAD_REQUEST,
        "Only paid consultations can be confirmed."
      );
    }

    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        status: ConsultationStatus.CONFIRMED,
      },
      include: consultationInclude,
    });

    await sendConsultationNotifications({
      type: "CONSULTATION_CONFIRMED",
      clientUserId: updatedConsultation.client.userId,
      expertUserId: updatedConsultation.expert?.userId,
      clientMessage: `Your consultation with ${updatedConsultation.expert?.fullName ?? "your expert"} is now confirmed.`,
      expertMessage: `Your consultation with ${updatedConsultation.client.fullName} is now confirmed.`,
    });

    return enrichConsultation(updatedConsultation);
  }

  if (nextStatus === ConsultationStatus.PENDING) {
    if (user.role !== Role.ADMIN) {
      throw new AppError(
        status.FORBIDDEN,
        "Only admins can set consultation status to pending."
      );
    }

    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        status: ConsultationStatus.PENDING,
        startedAt: null,
        endedAt: null,
      },
      include: consultationInclude,
    });

    return enrichConsultation(updatedConsultation);
  }

  throw new AppError(status.BAD_REQUEST, "Unsupported consultation status transition.");
};

// CANCEL UNPAID CONSULTATIONS AFTER 30 MINUTES
const cancelUnpaidConsultations = async () => {
  const now = new Date();
  const cutoffTime = new Date(now.getTime() + 30 * 60 * 1000);

  const unpaidConsultations = await prisma.consultation.findMany({
    where: {
      date: { lte: cutoffTime },
      paymentStatus: PaymentStatus.UNPAID,
      status: ConsultationStatus.PENDING,
    },
    select: {
      id: true,
      expertScheduleId: true,
      client: {
        select: {
          userId: true,
        },
      },
      expert: {
        select: {
          userId: true,
          fullName: true,
        },
      },
    },
  });

  if (!unpaidConsultations.length) {
    return { count: 0 };
  }

  const consultationIds = unpaidConsultations.map((item) => item.id);
  const scheduleIds = unpaidConsultations.map((item) => item.expertScheduleId);

  await prisma.$transaction(async (tx) => {
    await tx.consultation.updateMany({
      where: { id: { in: consultationIds } },
      data: {
        status: ConsultationStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: "Automatically cancelled because payment was not completed in time.",
      },
    });

    await tx.payment.deleteMany({
      where: { consultationId: { in: consultationIds } },
    });

    await tx.expertSchedule.updateMany({
      where: { id: { in: scheduleIds } },
      data: {
        isBooked: false,
        consultationId: null,
      },
    });
  });

  await prisma.notification.createMany({
    data: unpaidConsultations.flatMap((consultation) => {
      const notifications = [] as Array<{
        type: string;
        message: string;
        userId: string;
      }>;

      if (consultation.client.userId) {
        notifications.push({
          type: "CONSULTATION_CANCELLED",
          message: `Your consultation${consultation.expert?.fullName ? ` with ${consultation.expert.fullName}` : ""} was cancelled because payment was not completed in time.`,
          userId: consultation.client.userId,
        });
      }

      if (consultation.expert?.userId) {
        notifications.push({
          type: "CONSULTATION_CANCELLED",
          message: "A scheduled consultation was automatically cancelled because the client did not complete payment in time.",
          userId: consultation.expert.userId,
        });
      }

      return notifications;
    }),
  });

  return { count: consultationIds.length };
};






export const getAllConsultationsAdmin = async (query: any) => {
  const queryBuilder = new QueryBuilder<
    Consultation,
    Prisma.ConsultationWhereInput,
    Prisma.ConsultationInclude
  >(prisma.consultation, query, {
    searchableFields: bookingSearchableFields,
    filterableFields: bookingFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .include(bookingIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .excute();

  return result;
};


export const consultationService = {
  bookConsultation,
  bookConsultationWithPayLater,
  getMyBookings,
  initiateConsultationPayment,
  getSessionAccess,
  startSession,
  completeSession,
  cancelConsultation,
  rescheduleConsultation,
  updateConsultationStatus,
  cancelUnpaidConsultations,
  getAllConsultationsAdmin,
};