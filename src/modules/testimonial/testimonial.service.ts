import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { prisma } from "../../lib/prisma";
import { IqueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utilis/queryBuilder";
import {
  ICreateTestimonialPayload,
  IReplyToTestimonialPayload,
  IUpdateReviewStatusPayload,
  IUpdateTestimonialPayload,
} from "./testimonial.types";
import {
  testimonialFilterableFields,
  testimonialIncludeConfig,
  testimonialSearchableFields,
} from "./testimonial.constant";
import { ReviewStatus } from "../../generated/enums";

const attachClientIdentity = async <
  T extends { clientId: string; client?: unknown }
>(rows: T[]) => {
  if (rows.length === 0) {
    return rows;
  }

  const clientIds = Array.from(new Set(rows.map((row) => row.clientId).filter(Boolean)));

  if (clientIds.length === 0) {
    return rows;
  }

  const clients = await prisma.client.findMany({
    where: {
      id: {
        in: clientIds,
      },
    },
    select: {
      id: true,
      fullName: true,
      profilePhoto: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  const clientById = new Map(clients.map((client) => [client.id, client]));

  return rows.map((row) => {
    const existingClient = row.client as
      | {
          fullName?: string | null;
          profilePhoto?: string | null;
          user?: { name?: string | null; image?: string | null } | null;
        }
      | undefined;

    const hydratedClient = existingClient ?? clientById.get(row.clientId) ?? null;

    const reviewerName =
      hydratedClient?.fullName?.trim() || hydratedClient?.user?.name?.trim() || null;

    const reviewerImage = hydratedClient?.profilePhoto || hydratedClient?.user?.image || null;

    return {
      ...row,
      client: hydratedClient,
      reviewerName,
      reviewerImage,
    };
  });
};

// ------------------------------
// CREATE TESTIMONIAL
// ------------------------------
const createTestimonial = async (
  userId: string,
  payload: ICreateTestimonialPayload
) => {
  const { rating, comment, consultationId } = payload;

  console.log("AUTH USER ID:", userId);
  console.log("PAYLOAD:", payload);

  // ✅ STEP 1: Get client from userId
  const client = await prisma.client.findUnique({
    where: { userId },
  });

  if (!client) {
    throw new AppError(status.NOT_FOUND, "Client not found");
  }

  console.log("CLIENT ID:", client.id);

  // ✅ STEP 2: Find consultation
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
  });

  console.log("CONSULTATION CLIENT ID:", consultation?.clientId);

  if (!consultation) {
    throw new AppError(status.NOT_FOUND, "Consultation not found");
  }

  // ✅ STEP 3: Correct comparison (FIXED)
  if (consultation.clientId !== client.id) {
    throw new AppError(status.FORBIDDEN, "Not your consultation");
  }

  if (!consultation.expertId) {
    throw new AppError(
      status.BAD_REQUEST,
      "Consultation has no expert assigned"
    );
  }

  const expertId = consultation.expertId;

  // ✅ STEP 4: Transaction
  const testimonial = await prisma.$transaction(async (tx) => {
    const createdTestimonial = await tx.testimonial.create({
      data: {
        rating,
        comment,
        clientId: client.id, // ✅ FIXED
        expertId,
        consultationId,
        status: ReviewStatus.PENDING,
      },
    });

    const expert = await tx.expert.findUnique({
      where: { id: expertId },
      select: { userId: true },
    });

    if (expert) {
      await tx.notification.create({
        data: {
          type: "NEW_TESTIMONIAL",
          message: "You received a new review from a client.",
          userId: expert.userId,
        },
      });
    }

    return createdTestimonial;
  });

  return testimonial;
};




// ------------------------------
// GET ALL TESTIMONIALS
// ------------------------------
const getAllTestimonials = async (
  query: IqueryParams,
  includeAll = false
) => {
  // ✅ Ensure status logic is safe
  const effectiveQuery = { ...query };

  if (!includeAll) {
    effectiveQuery.status = ReviewStatus.APPROVED;
  }

  const qb = new QueryBuilder(prisma.testimonial, effectiveQuery, {
    searchableFields: testimonialSearchableFields,
    filterableFields: testimonialFilterableFields,
  });

  const result = await qb
    .search()
    .filter()
    .paginate()
    .dynamicInclude(testimonialIncludeConfig)
    .sort()
    .fields()
    .excute();

  const dataWithClientIdentity = await attachClientIdentity(
    (result.data ?? []) as Array<{ clientId: string; client?: unknown }>
  );

  return {
    ...result,
    data: dataWithClientIdentity,
  };
};

const getAllTestimonialsForAdmin = async (
  query: IqueryParams,
  includeAll = true
) => {
  return getAllTestimonials(query, includeAll);
};




// ------------------------------
// GET TESTIMONIALS BY EXPERT
// ------------------------------
const getTestimonialsByExpert = async (expertId: string) => {

  // Accept either UUID (v4) or email as expertId (consistent with validation)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  let realExpertId = expertId;
  if (!uuidRegex.test(expertId)) {
    // Try to resolve by email
    const expertByEmail = await prisma.expert.findUnique({ where: { email: expertId } });
    if (!expertByEmail) {
      throw new AppError(status.BAD_REQUEST, "Invalid expertId: must be a valid UUID or a valid expert email");
    }
    realExpertId = expertByEmail.id;
  }
  const expert = await prisma.expert.findUnique({
    where: { id: realExpertId },
  });
  if (!expert) {
    throw new AppError(status.NOT_FOUND, "Expert not found");
  }

  // const result = await prisma.testimonial.findMany({
  //   where: {
  //     expertId,
  //     status: ReviewStatus.APPROVED,
  //   },
  //   include: testimonialIncludeConfig,
  //   orderBy: { createdAt: "desc" },
  // });
const result = await prisma.testimonial.findMany({
  where: {
    expertId: realExpertId,
  },
  include: testimonialIncludeConfig,
});

  return attachClientIdentity(
    result as Array<{ clientId: string; client?: unknown }>
  );
};


// ------------------------------
// EXPERT REPLY TO TESTIMONIAL
// ------------------------------
const replyToTestimonial = async (
  id: string,
  expertUserId: string,
  payload: IReplyToTestimonialPayload
) => {
  const expert = await prisma.expert.findUnique({
    where: { userId: expertUserId },
    select: { id: true, fullName: true },
  });

  if (!expert) {
    throw new AppError(status.NOT_FOUND, "Expert profile not found");
  }

  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
    include: {
      client: {
        select: { userId: true },
      },
    },
  });

  if (!testimonial) {
    throw new AppError(status.NOT_FOUND, "Testimonial not found");
  }

  if (testimonial.expertId !== expert.id) {
    throw new AppError(status.FORBIDDEN, "You can only reply to your own reviews");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedTestimonial = await tx.testimonial.update({
      where: { id },
      data: {
        expertReply: payload.expertReply,
        expertRepliedAt: new Date(),
      },
    });

    await tx.notification.create({
      data: {
        type: "REVIEW_REPLY",
        message: `${expert.fullName} replied to your review.`,
        userId: testimonial.client.userId,
      },
    });

    return updatedTestimonial;
  });

  return result;
};

// ------------------------------
// ADMIN UPDATE REVIEW STATUS
// ------------------------------
const updateTestimonial = async (
  id: string,
  userId: string,
  payload: IUpdateTestimonialPayload
) => {
  // ✅ get client
  const client = await prisma.client.findUnique({
    where: { userId },
  });

  if (!client) {
    throw new AppError(status.NOT_FOUND, "Client not found");
  }

  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
  });

  if (!testimonial) {
    throw new AppError(status.NOT_FOUND, "Testimonial not found");
  }

  // ✅ FIXED comparison
  if (testimonial.clientId !== client.id) {
    throw new AppError(status.FORBIDDEN, "Not your testimonial");
  }

  return prisma.testimonial.update({
    where: { id },
    data: {
      ...payload,
      status: ReviewStatus.PENDING,
    },
  });
};

const updateReviewStatus = async (
  id: string,
  payload: IUpdateReviewStatusPayload
) => {
  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
  });

  if (!testimonial) {
    throw new AppError(status.NOT_FOUND, "Testimonial not found");
  }

  return prisma.testimonial.update({
  where: { id },
  data: {
    status: payload.status,
  },
  include: testimonialIncludeConfig,
});
};




export const testimonialService = {
  createTestimonial,
  getAllTestimonials,
  getAllTestimonialsForAdmin,
  getTestimonialsByExpert,
  updateTestimonial,
  updateReviewStatus,
  replyToTestimonial,
  
  
};