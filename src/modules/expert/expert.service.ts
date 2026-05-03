import status from "http-status";

import AppError from "../../errorHelpers/AppError";
import { updateExpertInterface } from "./expert.interface";

import { IqueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utilis/queryBuilder";

import { expertFilterableFields, expertIncludeConfig, expertSearchableFields } from "./expert.constant";
import { Expert, ExpertApplicationStatus, Prisma, Role, UserStatus } from "../../generated/client";
import { any } from "zod";
import { prisma } from "../../lib/prisma";

const getAllExperts = async (query: IqueryParams) => {
  const qb = new QueryBuilder<
    Expert,
    Prisma.ExpertWhereInput,
    Prisma.ExpertInclude
  >(prisma.expert, query, {
    searchableFields: expertSearchableFields,
    filterableFields: expertFilterableFields,
  });

  const result = await qb
    .search()
    .filter()
    .where({
      isDeleted: false,
      // Only surface experts whose linked user and industry are still active.
      // This prevents "ghost" expert cards on the landing page that 404 on detail.
      user: { is: { isDeleted: false } },
      industry: { is: { isDeleted: false } },
    })
    .include({
      user: true,
      industry: true,
    })
    .dynamicInclude(expertIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .excute();

  return result;
};


const getExpertById = async (id: string) => {
  const expert = await prisma.expert.findFirst({
    where: {
      id,
      isDeleted: false,
      user: { is: { isDeleted: false } },
      industry: { is: { isDeleted: false } },
    },
    include: {
      user: true,
      industry: true,
      schedules: {
        where: {
          isDeleted: false,
          isPublished: true,
          isBooked: false,
          schedule: {
            isDeleted: false,
            // Only return future / currently-active slots so that the
            // "next available time" reflects upcoming availability rather
            // than slots created earlier in time.
            endDateTime: { gt: new Date() },
          },
        },
        include: { schedule: true },
        // Order by the actual slot start time so that the nearest upcoming
        // slot appears first, regardless of when it was created.
        orderBy: { schedule: { startDateTime: "asc" } },
      },
      consultations: {
        include: {
          client: true,
          expertSchedule: true,
        },
      },
      testimonials: true,
      verification: true,
    },
  });

  if (!expert) {
    throw new AppError(status.NOT_FOUND, "Expert not found");
  }

  return expert;
};








const updateExpert = async (id: string, payload: updateExpertInterface) => {
  const existingExpert = await prisma.expert.findUnique({
    where: { id, isDeleted: false },
  });

  if (!existingExpert) {
    throw new AppError(status.NOT_FOUND, "Expert not found");
  }

  const { expert: expertData } = payload;

  await prisma.expert.update({
    where: { id },
    data: {
      ...expertData,
    },
  });

  return await getExpertById(id);
};




const deleteExpert = async (id: string) => {
  const expert = await prisma.expert.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!expert) {
    throw new AppError(status.NOT_FOUND, "Expert not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.expert.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: expert.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: { userId: expert.userId },
    });
  });

  return { message: "Expert deleted successfully" };
};




//apply expert

const applyExpert = async (userId: string, payload: any) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
    throw new AppError(status.UNAUTHORIZED, "Active user account is required");
  }

  if (user.role !== Role.CLIENT) {
    throw new AppError(
      status.FORBIDDEN,
      "Only clients can submit expert applications."
    );
  }

  const existingExpert = await prisma.expert.findFirst({
    where: { userId, isDeleted: false },
  });

  if (existingExpert) {
    throw new AppError(status.BAD_REQUEST, "You are already an expert");
  }

  const pendingApplication = await prisma.expertApplication.findFirst({
    where: {
      userId,
      status: ExpertApplicationStatus.PENDING,
    },
    orderBy: { createdAt: "desc" },
  });

  if (pendingApplication) {
    throw new AppError(status.BAD_REQUEST, "You already have a pending application");
  }

  const parsedExperience = Number(payload.experience ?? 0);
  const parsedConsultationFee = Number(payload.consultationFee);
  const fullName = String(payload.fullName ?? user.name ?? "").trim();
  const email = String(payload.email ?? user.email ?? "").trim();

  // Accept industry as either an id (UUID) or a human-readable name.
  // Frontend may submit any of: industryId, industryName, industry.
  const rawIndustry = String(
    payload.industryId ??
      payload.industryName ??
      payload.industry ??
      ""
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

  const application = await prisma.$transaction(async (tx) => {
    const createdApplication = await tx.expertApplication.create({
      data: {
        userId,
        industryId,
        fullName,
        email,
        phone: payload.phone ? String(payload.phone).trim() : null,
        bio: payload.bio ? String(payload.bio).trim() : null,
        title: payload.title ? String(payload.title).trim() : null,
        experience: parsedExperience,
        consultationFee: parsedConsultationFee,
        profilePhoto: payload.profilePhoto ? String(payload.profilePhoto).trim() : user.image,
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
          message: `${createdApplication.fullName} submitted an expert application`,
          userId: admin.id,
        })),
      });
    }

    return createdApplication;
  });

  return application;
};





export const expertService = {
    getAllExperts,
    updateExpert,
    getExpertById,
    deleteExpert,
    applyExpert
}