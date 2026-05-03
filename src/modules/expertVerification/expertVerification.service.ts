import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import {
  ExpertApplicationStatus,
  Role,
  UserStatus,
  VerificationStatus,
} from "../../generated/enums";
import type { Prisma } from "../../generated/client";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../utilis/email";
import type { IqueryParams } from "../../interfaces/query.interface";

type SubmitApplicationPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  title?: string;
  experience?: number | string;
  consultationFee?: number | string;
  industryId?: string;
  industryName?: string;
  industry?: string;
  profilePhoto?: string;
  resume?: {
    resumeUrl: string;
    resumeFileName: string;
    resumeFileType: string;
    resumeFileSize: number;
  };
};

type ReviewApplicationPayload = {
  status: ExpertApplicationStatus.APPROVED | ExpertApplicationStatus.REJECTED;
  notes?: string;
};

type AdminListFilters = {
  status?: ExpertApplicationStatus;
  industryId?: string;
  reviewedBy?: string;
  searchTerm?: string;
};

const normalizePagination = (query: IqueryParams) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const normalizeSort = (query: IqueryParams) => {
  const allowedSortBy = new Set(["createdAt", "updatedAt", "reviewedAt", "fullName"]);
  const sortByRaw = typeof query.sortBy === "string" ? query.sortBy : "createdAt";
  const sortBy = allowedSortBy.has(sortByRaw) ? sortByRaw : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  return {
    [sortBy]: sortOrder,
  } as Prisma.ExpertApplicationOrderByWithRelationInput;
};

const normalizeFilters = (query: IqueryParams): AdminListFilters => {
  const statusValue = typeof query.status === "string" ? query.status.toUpperCase() : undefined;
  const status =
    statusValue && Object.values(ExpertApplicationStatus).includes(statusValue as ExpertApplicationStatus)
      ? (statusValue as ExpertApplicationStatus)
      : undefined;

  return {
    status,
    industryId: typeof query.industryId === "string" ? query.industryId : undefined,
    reviewedBy: typeof query.reviewedBy === "string" ? query.reviewedBy : undefined,
    searchTerm: typeof query.searchTerm === "string" ? query.searchTerm.trim() : undefined,
  };
};

const buildWhere = (filters: AdminListFilters): Prisma.ExpertApplicationWhereInput => {
  const where: Prisma.ExpertApplicationWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.industryId) {
    where.industryId = filters.industryId;
  }

  if (filters.reviewedBy) {
    where.reviewedBy = filters.reviewedBy;
  }

  if (filters.searchTerm) {
    where.OR = [
      { fullName: { contains: filters.searchTerm, mode: "insensitive" } },
      { email: { contains: filters.searchTerm, mode: "insensitive" } },
      { title: { contains: filters.searchTerm, mode: "insensitive" } },
      { user: { name: { contains: filters.searchTerm, mode: "insensitive" } } },
      { user: { email: { contains: filters.searchTerm, mode: "insensitive" } } },
      { industry: { name: { contains: filters.searchTerm, mode: "insensitive" } } },
    ];
  }

  return where;
};

const submitApplication = async (userId: string, payload: SubmitApplicationPayload) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
    throw new AppError(status.UNAUTHORIZED, "Active user account is required");
  }

  const existingExpert = await prisma.expert.findFirst({
    where: { userId, isDeleted: false },
  });

  if (existingExpert) {
    throw new AppError(status.BAD_REQUEST, "You are already registered as an expert");
  }

  const existingPending = await prisma.expertApplication.findFirst({
    where: {
      userId,
      status: ExpertApplicationStatus.PENDING,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingPending) {
    throw new AppError(status.BAD_REQUEST, "You already have a pending expert application");
  }

  const parsedExperience = Number(payload.experience ?? 0);
  const parsedConsultationFee = Number(payload.consultationFee);
  const fullName = String(payload.fullName ?? user.name ?? "").trim();
  const email = String(payload.email ?? user.email ?? "").trim();

  // Accept industry as either an id (UUID) or a human-readable name.
  const rawIndustry = String(
    payload.industryId ?? payload.industryName ?? payload.industry ?? ""
  ).trim();

  if (!fullName) {
    throw new AppError(status.BAD_REQUEST, "Full name is required");
  }
  if (!email) {
    throw new AppError(status.BAD_REQUEST, "Email is required");
  }
  if (!rawIndustry) {
    throw new AppError(status.BAD_REQUEST, "Industry is required");
  }

  if (!Number.isInteger(parsedExperience) || parsedExperience < 0) {
    throw new AppError(status.BAD_REQUEST, "Experience must be a non-negative integer");
  }

  if (!Number.isInteger(parsedConsultationFee) || parsedConsultationFee <= 0) {
    throw new AppError(status.BAD_REQUEST, "Consultation fee must be a positive integer");
  }

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = UUID_REGEX.test(rawIndustry);

  const industry = isUuid
    ? await prisma.industry.findFirst({
        where: { id: rawIndustry, isDeleted: false },
        select: { id: true },
      })
    : await prisma.industry.findFirst({
        where: {
          isDeleted: false,
          name: { equals: rawIndustry, mode: "insensitive" },
        },
        select: { id: true },
      });

  if (!industry) {
    throw new AppError(status.NOT_FOUND, "Industry not found");
  }

  const industryId = industry.id;

  const createdApplication = await prisma.$transaction(async (tx) => {
    const application = await tx.expertApplication.create({
      data: {
        userId,
        industryId,
        fullName,
        email,
        phone: payload.phone?.trim() || null,
        bio: payload.bio?.trim() || null,
        title: payload.title?.trim() || null,
        experience: parsedExperience,
        consultationFee: parsedConsultationFee,
        profilePhoto: payload.profilePhoto?.trim() || user.image,
        resumeUrl: payload.resume?.resumeUrl ?? null,
        resumeFileName: payload.resume?.resumeFileName ?? null,
        resumeFileType: payload.resume?.resumeFileType ?? null,
        resumeFileSize: payload.resume?.resumeFileSize ?? null,
      },
      include: {
        industry: true,
      },
    });

    const admins = await tx.user.findMany({
      where: {
        role: Role.ADMIN,
        isDeleted: false,
        status: UserStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (admins.length > 0) {
      await tx.notification.createMany({
        data: admins.map((admin) => ({
          type: "EXPERT_APPLICATION",
          message: `${application.fullName} submitted an expert application`,
          userId: admin.id,
        })),
      });
    }

    return application;
  });

  return createdApplication;
};

const getMyApplications = async (userId: string) => {
  return prisma.expertApplication.findMany({
    where: { userId },
    include: {
      industry: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getAllApplications = async (query: IqueryParams) => {
  const { page, limit, skip } = normalizePagination(query);
  const orderBy = normalizeSort(query);
  const filters = normalizeFilters(query);
  const where = buildWhere(filters);

  const [data, total] = await Promise.all([
    prisma.expertApplication.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            image: true,
          },
        },
        industry: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.expertApplication.count({ where }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getNewApplicants = async (query: IqueryParams) => {
  return getAllApplications({
    ...query,
    status: ExpertApplicationStatus.PENDING,
  });
};

const getAdminResumeAccess = async (applicationId: string) => {
  const application = await prisma.expertApplication.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      resumeUrl: true,
      resumeFileName: true,
      resumeFileType: true,
    },
  });

  if (!application) {
    throw new AppError(status.NOT_FOUND, "Expert application not found");
  }

  if (!application.resumeUrl || !application.resumeFileName || !application.resumeFileType) {
    throw new AppError(status.BAD_REQUEST, "No resume uploaded for this application");
  }

  return {
    id: application.id,
    resumeUrl: application.resumeUrl,
    resumeFileName: application.resumeFileName,
    resumeFileType: application.resumeFileType,
  };
};

const getApplicationById = async (id: string) => {
  const application = await prisma.expertApplication.findUnique({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          image: true,
        },
      },
      industry: true,
    },
    where: { id },
  });

  if (!application) {
    throw new AppError(status.NOT_FOUND, "Expert application not found");
  }

  return application;
};

const reviewApplication = async (
  applicationId: string,
  adminId: string,
  payload: ReviewApplicationPayload
) => {
  const application = await prisma.expertApplication.findUnique({
    where: { id: applicationId },
    include: { user: true },
  });

  if (!application) {
    throw new AppError(status.NOT_FOUND, "Expert application not found");
  }

  if (application.status !== ExpertApplicationStatus.PENDING) {
    throw new AppError(status.BAD_REQUEST, "This application has already been reviewed");
  }

  const now = new Date();

  const reviewed = await prisma.$transaction(async (tx) => {
    let expertId: string | null = null;

    if (payload.status === ExpertApplicationStatus.APPROVED) {
      const existingExpert = await tx.expert.findFirst({
        where: {
          userId: application.userId,
          isDeleted: false,
        },
      });

      const expert =
        existingExpert ||
        (await tx.expert.create({
          data: {
            userId: application.userId,
            fullName: application.fullName,
            email: application.email,
            phone: application.phone,
            bio: application.bio,
            title: application.title,
            experience: application.experience,
            consultationFee: application.consultationFee,
            industryId: application.industryId,
            profilePhoto: application.profilePhoto || application.user.image,
            isVerified: true,
          },
        }));

      expertId = expert.id;

      await tx.expertVerification.upsert({
        where: { expertId: expert.id },
        create: {
          expertId: expert.id,
          status: VerificationStatus.APPROVED,
          notes: payload.notes,
          verifiedBy: adminId,
          verifiedAt: now,
        },
        update: {
          status: VerificationStatus.APPROVED,
          notes: payload.notes,
          verifiedBy: adminId,
          verifiedAt: now,
        },
      });

      await tx.expert.update({
        where: { id: expert.id },
        data: { isVerified: true },
      });

      await tx.user.update({
        where: { id: application.userId },
        data: { role: Role.EXPERT },
      });

      const clientProfile = await tx.client.findUnique({
        where: { userId: application.userId },
      });

      if (clientProfile && !clientProfile.isDeleted) {
        await tx.client.update({
          where: { id: clientProfile.id },
          data: {
            isDeleted: true,
            deletedAt: now,
          },
        });
      }
    }

    const updatedApplication = await tx.expertApplication.update({
      where: { id: applicationId },
      data: {
        status: payload.status,
        reviewNotes: payload.notes,
        reviewedBy: adminId,
        reviewedAt: now,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        industry: true,
      },
    });

    const message =
      payload.status === ExpertApplicationStatus.APPROVED
        ? "Your expert application has been approved. You can now continue as an expert."
        : `Your expert application has been rejected${payload.notes ? `: ${payload.notes}` : "."}`;

    await tx.notification.create({
      data: {
        type: "EXPERT_APPLICATION_REVIEWED",
        message,
        userId: application.userId,
      },
    });

    return {
      ...updatedApplication,
      expertId,
    };
  });

  try {
    await sendEmail({
      to: application.email,
      subject:
        payload.status === ExpertApplicationStatus.APPROVED
          ? "Your ConsultEdge expert application was approved"
          : "Your ConsultEdge expert application was reviewed",
      templateName: "expertApplicationDecision",
      templateData: {
        name: application.fullName,
        status: payload.status,
        notes: payload.notes,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to send expert application review email", error);
  }

  return reviewed;
};

const verifyExpert = async (
  expertId: string,
  adminId: string,
  payload: { status: VerificationStatus; notes?: string }
) => {
  const expert = await prisma.expert.findUnique({
    where: { id: expertId, isDeleted: false },
  });

  if (!expert) {
    throw new AppError(status.NOT_FOUND, "Expert not found");
  }

  const verificationMessage =
    payload.status === VerificationStatus.APPROVED
      ? "Your expert profile has been approved by the admin."
      : payload.status === VerificationStatus.REJECTED
      ? `Your expert verification request has been rejected${
          payload.notes ? `: ${payload.notes}` : "."
        }`
      : "Your expert verification status is now pending review.";

  // Create or update verification record
  const verification = await prisma.$transaction(async (tx) => {
    const record = await tx.expertVerification.upsert({
      where: { expertId },
      create: {
        expertId,
        status: payload.status,
        notes: payload.notes,
        verifiedBy: adminId,
        verifiedAt: new Date(),
      },
      update: {
        status: payload.status,
        notes: payload.notes,
        verifiedBy: adminId,
        verifiedAt: new Date(),
      },
    });

    // Update expert isVerified field
    await tx.expert.update({
      where: { id: expertId },
      data: {
        isVerified: payload.status === VerificationStatus.APPROVED,
      },
    });

    await tx.notification.create({
      data: {
        type: "EXPERT_VERIFICATION_UPDATE",
        message: verificationMessage,
        userId: expert.userId,
      },
    });

    return record;
  });

  return verification;
};

export const expertVerificationService = {
  submitApplication,
  getMyApplications,
  getAdminResumeAccess,
  getAllApplications,
  getNewApplicants,
  getApplicationById,
  reviewApplication,
  verifyExpert,
};