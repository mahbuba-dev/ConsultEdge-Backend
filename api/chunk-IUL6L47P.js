var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/index.ts
import { Router as Router18 } from "express";

// src/modules/expertVerification/expertVerification.router.ts
import { Router } from "express";

// src/modules/expertVerification/expertVerification.validation.ts
import z from "zod";
var submitApplicationValidationSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    phone: z.string().trim().optional(),
    bio: z.string().trim().optional(),
    title: z.string().trim().optional(),
    experience: z.coerce.number().int().min(0).optional(),
    consultationFee: z.coerce.number().int().min(1).optional(),
    // Industry can arrive as any one of these. The service layer resolves
    // it to a real Industry row by id (UUID) or name. Don't restrict to
    // .uuid() here because the frontend may send the human-readable name
    // (e.g. "Technology") from the dropdown.
    industryId: z.string().trim().min(1).optional(),
    industryName: z.string().trim().min(1).optional(),
    industry: z.string().trim().min(1).optional(),
    profilePhoto: z.string().trim().optional(),
    resume: z.object({
      resumeUrl: z.string().url(),
      resumeFileName: z.string().trim().min(1),
      resumeFileType: z.string().trim().min(1),
      resumeFileSize: z.coerce.number().int().min(1)
    }).optional()
  })
});
var verifyExpertValidationSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).refine((v) => !!v, { message: "Verification status is required" }),
    notes: z.string().optional()
  })
});
var reviewApplicationValidationSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    notes: z.string().max(1e3).optional()
  }),
  params: z.object({
    id: z.string().uuid("Application ID must be a valid UUID")
  })
});
var applicationIdParamValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Application ID must be a valid UUID")
  })
});
var adminApplicationsListValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    searchTerm: z.string().trim().optional(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    industryId: z.string().uuid().optional(),
    reviewedBy: z.string().optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "reviewedAt", "fullName"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional()
  })
});
var adminNewApplicantsListValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    searchTerm: z.string().trim().optional(),
    industryId: z.string().uuid().optional(),
    reviewedBy: z.string().optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "reviewedAt", "fullName"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional()
  })
});
var applicationResumeAccessValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Application ID must be a valid UUID")
  }),
  query: z.object({
    download: z.enum(["true", "false"]).optional()
  })
});

// src/middleware/cheackAuth.ts
import status3 from "http-status";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";

// src/config/env.ts
import dotenv from "dotenv";
import status from "http-status";

// src/errorHelpers/AppError.ts
var AppError = class extends Error {
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/config/env.ts
dotenv.config({ quiet: true });
var loadEnvVariables = () => {
  const requiredEnvVariables = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_URL",
    "BETTER_AUTH_SECRET",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRY",
    "REFRESH_TOKEN_EXPIRY",
    "EMAIL_SENDER_SMTP_USER",
    "EMAIL_SENDER_SMTP_PASSWORD",
    "EMAIL_SENDER_SMTP_HOST",
    "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_SMTP_FROM",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
    "FRONTEND_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD"
    // "BETTER_AUTH_SESSION_TOKEN_EXPIRY",
    // "BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE"
  ];
  requiredEnvVariables.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError_default(status.INTERNAL_SERVER_ERROR, `Environment variable "${variable}" is required but missing in the .env file.`);
    }
  });
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
    EMAIL_SENDER: {
      SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER,
      SMTP_PASSWORD: process.env.EMAIL_SENDER_SMTP_PASSWORD,
      SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST,
      SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT,
      SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM
    },
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
    },
    STRIPE: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
    },
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",
    ABLY_API_KEY: process.env.ABLY_API_KEY,
    AI_PROVIDER: process.env.AI_PROVIDER || (process.env.NODE_ENV === "production" ? "openai" : "gemini"),
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.0-flash"
    // BETTER_AUTH_SESSION_TOKEN_EXPIRY: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRY as string,
    // BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE as string
  };
};
var envVars = loadEnvVariables();

// src/lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

// src/generated/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.5.0",
  "engineVersion": "280c870be64f457428992c43c1f6d557fab6e29e",
  "activeProvider": "postgresql",
  "inlineSchema": 'model Admin {\n  id            String    @id @default(uuid())\n  userId        String    @unique\n  name          String\n  email         String    @unique\n  profilePhoto  String?\n  contactNumber String?\n  isDeleted     Boolean   @default(false)\n  deletedAt     DateTime?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)\n\n  @@map("admin")\n}\n\nmodel AIConversation {\n  id        String          @id @default(uuid()) @db.Uuid\n  userId    String\n  user      User            @relation(fields: [userId], references: [id], onDelete: Cascade)\n  title     String          @db.VarChar(160)\n  messages  AIChatMessage[]\n  createdAt DateTime        @default(now())\n  updatedAt DateTime        @updatedAt\n\n  @@index([userId])\n  @@map("ai_conversations")\n}\n\nmodel AIChatMessage {\n  id             String             @id @default(uuid()) @db.Uuid\n  conversationId String             @db.Uuid\n  conversation   AIConversation     @relation(fields: [conversationId], references: [id], onDelete: Cascade)\n  role           AIChatMessageRole\n  content        String\n  model          String?            @db.VarChar(120)\n  provider       String?            @db.VarChar(40)\n  tokensUsed     Int?\n  latencyMs      Int?\n  feedback       AIMessageFeedback?\n  createdAt      DateTime           @default(now())\n\n  @@index([conversationId])\n  @@map("ai_chat_messages")\n}\n\nmodel Attachment {\n  id        String  @id @default(uuid())\n  messageId String  @unique\n  message   Message @relation(fields: [messageId], references: [id], onDelete: Cascade)\n\n  fileUrl  String\n  fileName String\n  fileType String\n  fileSize Int\n\n  createdAt DateTime @default(now())\n\n  @@map("attachments")\n}\n\nmodel User {\n  id                 String              @id\n  name               String\n  email              String\n  emailVerified      Boolean             @default(false)\n  role               Role                @default(CLIENT)\n  status             UserStatus          @default(ACTIVE)\n  needPasswordChange Boolean             @default(false)\n  isDeleted          Boolean             @default(false)\n  deletedAt          DateTime?\n  image              String?\n  createdAt          DateTime            @default(now())\n  updatedAt          DateTime            @updatedAt\n  sessions           Session[]\n  accounts           Account[]\n  client             Client?\n  expert             Expert?\n  admin              Admin?\n  notifications      Notification[]\n  messageReactions   MessageReaction[]\n  aiConversations    AIConversation[]\n  expertApplications ExpertApplication[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Call {\n  id     String   @id @default(uuid())\n  roomId String\n  room   ChatRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)\n\n  status    CallStatus @default(PENDING)\n  startedAt DateTime?\n  endedAt   DateTime?\n  createdAt DateTime   @default(now())\n\n  participants CallParticipant[]\n\n  @@index([roomId])\n  @@map("calls")\n}\n\nmodel CallParticipant {\n  id     String @id @default(uuid())\n  callId String\n  call   Call   @relation(fields: [callId], references: [id], onDelete: Cascade)\n\n  userId String\n  role   UserRole\n\n  joinedAt DateTime?\n  leftAt   DateTime?\n\n  @@index([callId])\n  @@index([userId])\n  @@map("call_participants")\n}\n\nmodel ChatRoom {\n  id             String        @id @default(uuid())\n  consultationId String?       @db.Uuid\n  consultation   Consultation? @relation(fields: [consultationId], references: [id], onDelete: SetNull)\n\n  clientId String @db.Uuid\n  client   Client @relation("ClientChatRooms", fields: [clientId], references: [id], onDelete: Cascade)\n\n  expertId String @db.Uuid\n  expert   Expert @relation("ExpertChatRooms", fields: [expertId], references: [id], onDelete: Cascade)\n\n  messages Message[]\n  calls    Call[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([clientId, expertId])\n  @@index([consultationId])\n  @@index([clientId])\n  @@index([expertId])\n  @@map("chat_rooms")\n}\n\nmodel Client {\n  id           String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  fullName     String\n  email        String  @unique\n  profilePhoto String?\n  phone        String?\n  address      String?\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n\n  // User Relation\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)\n\n  // Relations\n  consultations Consultation[]\n  testimonials  Testimonial[]\n  chatRooms     ChatRoom[]     @relation("ClientChatRooms")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([email], name: "idx_client_email")\n  @@index([isDeleted], name: "idx_client_isDeleted")\n  @@map("clients")\n}\n\nmodel Consultation {\n  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n\n  videoCallId   String             @unique @db.Uuid()\n  status        ConsultationStatus @default(PENDING)\n  paymentStatus PaymentStatus      @default(UNPAID)\n\n  date DateTime\n\n  startedAt        DateTime?\n  endedAt          DateTime?\n  cancelledAt      DateTime?\n  cancelReason     String?\n  cancelledBy      Role?\n  rescheduledAt    DateTime?\n  rescheduleReason String?\n  rescheduledBy    Role?\n  sessionSummary   String?\n\n  // Relations\n  clientId String @db.Uuid\n  client   Client @relation(fields: [clientId], references: [id], onDelete: Cascade)\n\n  expertScheduleId String         @unique @db.Uuid\n  expertSchedule   ExpertSchedule @relation("ExpertScheduleToConsultation", fields: [expertScheduleId], references: [id])\n\n  payment     Payment?\n  testimonial Testimonial?\n  chatRooms   ChatRoom[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  expert    Expert?  @relation(fields: [expertId], references: [id])\n  expertId  String?  @db.Uuid\n\n  @@index([clientId])\n  @@index([expertScheduleId])\n  @@index([status])\n  @@map("consultations")\n}\n\nmodel Coupon {\n  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n\n  code          String             @unique\n  description   String?\n  discountType  CouponDiscountType\n  // For PERCENT: 1-100. For FIXED: absolute amount in same currency as fee.\n  discountValue Float\n\n  // Optional cap for percent discounts (e.g. 20% off up to $50).\n  maxDiscount Float?\n\n  // Optional minimum cart amount required to redeem.\n  minAmount Float?\n\n  expiresAt DateTime?\n  maxUses   Int?\n  usedCount Int       @default(0)\n\n  isActive  Boolean   @default(true)\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([code])\n  @@index([isActive])\n  @@map("coupons")\n}\n\nenum ConsultationStatus {\n  PENDING\n  CONFIRMED\n  ONGOING\n  COMPLETED\n  CANCELLED\n}\n\nenum PaymentStatus {\n  PAID\n  REFUNDED\n  FAILED\n  UNPAID\n}\n\nenum MessageType {\n  TEXT\n  FILE\n  SYSTEM\n}\n\nenum UserRole {\n  CLIENT\n  EXPERT\n  ADMIN\n}\n\nenum CallStatus {\n  PENDING\n  ACTIVE\n  ENDED\n}\n\nenum VerificationStatus {\n  PENDING\n  APPROVED\n  REJECTED\n}\n\nenum ReviewStatus {\n  PENDING\n  APPROVED\n  HIDDEN\n}\n\nenum Role {\n  ADMIN\n  EXPERT\n  CLIENT\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  DELETED\n  SUSPENDED\n}\n\nenum AIChatMessageRole {\n  USER\n  ASSISTANT\n  SYSTEM\n}\n\nenum AIMessageFeedback {\n  LIKE\n  DISLIKE\n}\n\nenum ExpertApplicationStatus {\n  PENDING\n  APPROVED\n  REJECTED\n}\n\nenum CouponDiscountType {\n  PERCENT\n  FIXED\n}\n\nmodel Expert {\n  id              String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  fullName        String\n  email           String  @unique\n  profilePhoto    String?\n  phone           String?\n  bio             String?\n  title           String?\n  experience      Int     @default(0)\n  consultationFee Int\n  isVerified      Boolean @default(false)\n  isSeeded        Boolean @default(false)\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  industryId String   @db.Uuid\n  industry   Industry @relation(fields: [industryId], references: [id])\n\n  schedules     ExpertSchedule[]\n  consultations Consultation[]\n  testimonials  Testimonial[]\n  verification  ExpertVerification?\n  chatRooms     ChatRoom[]          @relation("ExpertChatRooms")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("expert")\n}\n\nmodel ExpertApplication {\n  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  userId     String\n  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  industryId String   @db.Uuid\n  industry   Industry @relation(fields: [industryId], references: [id])\n\n  fullName        String\n  email           String\n  phone           String?\n  bio             String?\n  title           String?\n  experience      Int     @default(0)\n  consultationFee Int\n  profilePhoto    String?\n\n  resumeUrl      String?\n  resumeFileName String?\n  resumeFileType String?\n  resumeFileSize Int?\n\n  status      ExpertApplicationStatus @default(PENDING)\n  reviewNotes String?\n  reviewedBy  String?\n  reviewedAt  DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([userId])\n  @@index([industryId])\n  @@index([status])\n  @@map("expert_applications")\n}\n\nmodel ExpertSchedule {\n  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n\n  expertId String @db.Uuid\n  expert   Expert @relation(fields: [expertId], references: [id], onDelete: Cascade, onUpdate: Cascade)\n\n  scheduleId String   @db.Uuid\n  schedule   Schedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade, onUpdate: Cascade)\n\n  consultationId String?       @db.Uuid\n  consultation   Consultation? @relation("ExpertScheduleToConsultation")\n\n  isBooked    Boolean   @default(false)\n  isPublished Boolean   @default(false)\n  isDeleted   Boolean   @default(false)\n  deletedAt   DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([expertId, scheduleId])\n  @@index([expertId])\n  @@index([scheduleId])\n  @@map("expert_schedules")\n}\n\nmodel ExpertVerification {\n  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n\n  expertId String @unique @db.Uuid\n  expert   Expert @relation(fields: [expertId], references: [id])\n\n  status     VerificationStatus @default(PENDING)\n  notes      String?\n  verifiedBy String?\n  verifiedAt DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("expert_verifications")\n}\n\n// model TeamMemberVerification {\n//     id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n\n//     teamMemberId String     @unique @db.Uuid\n//     teamMember   TeamMember @relation(fields: [teamMemberId], references: [id], onDelete: Cascade)\n\n//     status     VerificationStatus @default(PENDING)\n//     notes      String?\n//     verifiedBy String? // admin userId\n//     verifiedAt DateTime?\n\n//     createdAt DateTime @default(now())\n//     updatedAt DateTime @updatedAt\n\n//     @@map("team_member_verifications")\n// }\n\nmodel Industry {\n  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n\n  name        String  @unique @db.VarChar(100)\n  description String? @db.Text\n  icon        String? @db.VarChar(255)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n\n  experts            Expert[]\n  expertApplications ExpertApplication[]\n\n  @@index([isDeleted], name: "idx_industry_isDeleted")\n  @@index([name], name: "idx_industry_name")\n  @@map("industries")\n}\n\nmodel Message {\n  id     String   @id @default(uuid())\n  roomId String\n  room   ChatRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)\n\n  senderId   String\n  senderRole UserRole\n\n  type       MessageType       @default(TEXT)\n  text       String?\n  attachment Attachment?\n  reactions  MessageReaction[]\n\n  createdAt DateTime @default(now())\n\n  @@index([roomId])\n  @@index([senderId])\n  @@map("messages")\n}\n\nmodel MessageReaction {\n  id        String   @id @default(uuid())\n  messageId String\n  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  emoji     String   @db.VarChar(32)\n  createdAt DateTime @default(now())\n\n  @@unique([messageId, userId, emoji])\n  @@index([messageId])\n  @@index([userId])\n  @@map("message_reactions")\n}\n\nmodel Notification {\n  id        String   @id @default(uuid())\n  type      String\n  message   String\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  createdAt DateTime @default(now())\n  read      Boolean  @default(false)\n}\n\nmodel Payment {\n  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n\n  consultationId String       @unique @db.Uuid\n  consultation   Consultation @relation(fields: [consultationId], references: [id], onDelete: Cascade)\n\n  amount Float\n  status PaymentStatus @default(UNPAID)\n\n  // Coupon snapshot (kept on payment to preserve historical pricing).\n  originalAmount Float?\n  discountAmount Float?  @default(0)\n  couponCode     String?\n\n  transactionId      String  @unique\n  stripeEventId      String? @unique\n  paymentGatewayData Json?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([consultationId])\n  @@index([transactionId])\n  @@map("payments")\n}\n\n// model Payment {\n//     id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n\n//     projectId String\n//     project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)\n\n//     clientId String\n//     client   User   @relation(fields: [clientId], references: [id])\n\n//     amount Float\n//     status PaymentStatus @default(UNPAID)\n\n//     transactionId      String  @unique\n//     stripeEventId      String? @unique\n//     paymentGatewayData Json?\n\n//     createdAt DateTime @default(now())\n//     updatedAt DateTime @updatedAt\n\n//     @@index([projectId])\n//     @@index([transactionId])\n//     @@map("payments")\n// }\n\nmodel Schedule {\n  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  startDateTime DateTime\n  endDateTime   DateTime\n\n  expertSchedules ExpertSchedule[]\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("schedules")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../src/generated"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Testimonial {\n  id      String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  rating  Int\n  comment String?\n  status  ReviewStatus @default(PENDING)\n\n  expertReply     String?\n  expertRepliedAt DateTime?\n\n  clientId String @db.Uuid\n  client   Client @relation(fields: [clientId], references: [id])\n\n  expertId String @db.Uuid\n  expert   Expert @relation(fields: [expertId], references: [id])\n\n  consultationId String?       @unique @db.Uuid\n  consultation   Consultation? @relation(fields: [consultationId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("testimonials")\n}\n\nmodel TypingState {\n  id        String   @id @default(uuid())\n  roomId    String\n  userId    String\n  isTyping  Boolean  @default(false)\n  updatedAt DateTime @updatedAt\n\n  @@unique([roomId, userId])\n  @@index([roomId])\n  @@map("typing_states")\n}\n\nmodel UserPresence {\n  userId   String   @id\n  isOnline Boolean  @default(false)\n  lastSeen DateTime @default(now())\n\n  @@map("user_presence")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Admin":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"AdminToUser"}],"dbName":"admin"},"AIConversation":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AIConversationToUser"},{"name":"title","kind":"scalar","type":"String"},{"name":"messages","kind":"object","type":"AIChatMessage","relationName":"AIChatMessageToAIConversation"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"ai_conversations"},"AIChatMessage":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"conversationId","kind":"scalar","type":"String"},{"name":"conversation","kind":"object","type":"AIConversation","relationName":"AIChatMessageToAIConversation"},{"name":"role","kind":"enum","type":"AIChatMessageRole"},{"name":"content","kind":"scalar","type":"String"},{"name":"model","kind":"scalar","type":"String"},{"name":"provider","kind":"scalar","type":"String"},{"name":"tokensUsed","kind":"scalar","type":"Int"},{"name":"latencyMs","kind":"scalar","type":"Int"},{"name":"feedback","kind":"enum","type":"AIMessageFeedback"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"ai_chat_messages"},"Attachment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"messageId","kind":"scalar","type":"String"},{"name":"message","kind":"object","type":"Message","relationName":"AttachmentToMessage"},{"name":"fileUrl","kind":"scalar","type":"String"},{"name":"fileName","kind":"scalar","type":"String"},{"name":"fileType","kind":"scalar","type":"String"},{"name":"fileSize","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"attachments"},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"client","kind":"object","type":"Client","relationName":"ClientToUser"},{"name":"expert","kind":"object","type":"Expert","relationName":"ExpertToUser"},{"name":"admin","kind":"object","type":"Admin","relationName":"AdminToUser"},{"name":"notifications","kind":"object","type":"Notification","relationName":"NotificationToUser"},{"name":"messageReactions","kind":"object","type":"MessageReaction","relationName":"MessageReactionToUser"},{"name":"aiConversations","kind":"object","type":"AIConversation","relationName":"AIConversationToUser"},{"name":"expertApplications","kind":"object","type":"ExpertApplication","relationName":"ExpertApplicationToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Call":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"roomId","kind":"scalar","type":"String"},{"name":"room","kind":"object","type":"ChatRoom","relationName":"CallToChatRoom"},{"name":"status","kind":"enum","type":"CallStatus"},{"name":"startedAt","kind":"scalar","type":"DateTime"},{"name":"endedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"participants","kind":"object","type":"CallParticipant","relationName":"CallToCallParticipant"}],"dbName":"calls"},"CallParticipant":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"callId","kind":"scalar","type":"String"},{"name":"call","kind":"object","type":"Call","relationName":"CallToCallParticipant"},{"name":"userId","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"joinedAt","kind":"scalar","type":"DateTime"},{"name":"leftAt","kind":"scalar","type":"DateTime"}],"dbName":"call_participants"},"ChatRoom":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"consultationId","kind":"scalar","type":"String"},{"name":"consultation","kind":"object","type":"Consultation","relationName":"ChatRoomToConsultation"},{"name":"clientId","kind":"scalar","type":"String"},{"name":"client","kind":"object","type":"Client","relationName":"ClientChatRooms"},{"name":"expertId","kind":"scalar","type":"String"},{"name":"expert","kind":"object","type":"Expert","relationName":"ExpertChatRooms"},{"name":"messages","kind":"object","type":"Message","relationName":"ChatRoomToMessage"},{"name":"calls","kind":"object","type":"Call","relationName":"CallToChatRoom"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"chat_rooms"},"Client":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ClientToUser"},{"name":"consultations","kind":"object","type":"Consultation","relationName":"ClientToConsultation"},{"name":"testimonials","kind":"object","type":"Testimonial","relationName":"ClientToTestimonial"},{"name":"chatRooms","kind":"object","type":"ChatRoom","relationName":"ClientChatRooms"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"clients"},"Consultation":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"videoCallId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"ConsultationStatus"},{"name":"paymentStatus","kind":"enum","type":"PaymentStatus"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"startedAt","kind":"scalar","type":"DateTime"},{"name":"endedAt","kind":"scalar","type":"DateTime"},{"name":"cancelledAt","kind":"scalar","type":"DateTime"},{"name":"cancelReason","kind":"scalar","type":"String"},{"name":"cancelledBy","kind":"enum","type":"Role"},{"name":"rescheduledAt","kind":"scalar","type":"DateTime"},{"name":"rescheduleReason","kind":"scalar","type":"String"},{"name":"rescheduledBy","kind":"enum","type":"Role"},{"name":"sessionSummary","kind":"scalar","type":"String"},{"name":"clientId","kind":"scalar","type":"String"},{"name":"client","kind":"object","type":"Client","relationName":"ClientToConsultation"},{"name":"expertScheduleId","kind":"scalar","type":"String"},{"name":"expertSchedule","kind":"object","type":"ExpertSchedule","relationName":"ExpertScheduleToConsultation"},{"name":"payment","kind":"object","type":"Payment","relationName":"ConsultationToPayment"},{"name":"testimonial","kind":"object","type":"Testimonial","relationName":"ConsultationToTestimonial"},{"name":"chatRooms","kind":"object","type":"ChatRoom","relationName":"ChatRoomToConsultation"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"expert","kind":"object","type":"Expert","relationName":"ConsultationToExpert"},{"name":"expertId","kind":"scalar","type":"String"}],"dbName":"consultations"},"Coupon":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"discountType","kind":"enum","type":"CouponDiscountType"},{"name":"discountValue","kind":"scalar","type":"Float"},{"name":"maxDiscount","kind":"scalar","type":"Float"},{"name":"minAmount","kind":"scalar","type":"Float"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"maxUses","kind":"scalar","type":"Int"},{"name":"usedCount","kind":"scalar","type":"Int"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"coupons"},"Expert":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"experience","kind":"scalar","type":"Int"},{"name":"consultationFee","kind":"scalar","type":"Int"},{"name":"isVerified","kind":"scalar","type":"Boolean"},{"name":"isSeeded","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ExpertToUser"},{"name":"industryId","kind":"scalar","type":"String"},{"name":"industry","kind":"object","type":"Industry","relationName":"ExpertToIndustry"},{"name":"schedules","kind":"object","type":"ExpertSchedule","relationName":"ExpertToExpertSchedule"},{"name":"consultations","kind":"object","type":"Consultation","relationName":"ConsultationToExpert"},{"name":"testimonials","kind":"object","type":"Testimonial","relationName":"ExpertToTestimonial"},{"name":"verification","kind":"object","type":"ExpertVerification","relationName":"ExpertToExpertVerification"},{"name":"chatRooms","kind":"object","type":"ChatRoom","relationName":"ExpertChatRooms"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"expert"},"ExpertApplication":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ExpertApplicationToUser"},{"name":"industryId","kind":"scalar","type":"String"},{"name":"industry","kind":"object","type":"Industry","relationName":"ExpertApplicationToIndustry"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"experience","kind":"scalar","type":"Int"},{"name":"consultationFee","kind":"scalar","type":"Int"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"resumeUrl","kind":"scalar","type":"String"},{"name":"resumeFileName","kind":"scalar","type":"String"},{"name":"resumeFileType","kind":"scalar","type":"String"},{"name":"resumeFileSize","kind":"scalar","type":"Int"},{"name":"status","kind":"enum","type":"ExpertApplicationStatus"},{"name":"reviewNotes","kind":"scalar","type":"String"},{"name":"reviewedBy","kind":"scalar","type":"String"},{"name":"reviewedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"expert_applications"},"ExpertSchedule":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expertId","kind":"scalar","type":"String"},{"name":"expert","kind":"object","type":"Expert","relationName":"ExpertToExpertSchedule"},{"name":"scheduleId","kind":"scalar","type":"String"},{"name":"schedule","kind":"object","type":"Schedule","relationName":"ExpertScheduleToSchedule"},{"name":"consultationId","kind":"scalar","type":"String"},{"name":"consultation","kind":"object","type":"Consultation","relationName":"ExpertScheduleToConsultation"},{"name":"isBooked","kind":"scalar","type":"Boolean"},{"name":"isPublished","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"expert_schedules"},"ExpertVerification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expertId","kind":"scalar","type":"String"},{"name":"expert","kind":"object","type":"Expert","relationName":"ExpertToExpertVerification"},{"name":"status","kind":"enum","type":"VerificationStatus"},{"name":"notes","kind":"scalar","type":"String"},{"name":"verifiedBy","kind":"scalar","type":"String"},{"name":"verifiedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"expert_verifications"},"Industry":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"icon","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"experts","kind":"object","type":"Expert","relationName":"ExpertToIndustry"},{"name":"expertApplications","kind":"object","type":"ExpertApplication","relationName":"ExpertApplicationToIndustry"}],"dbName":"industries"},"Message":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"roomId","kind":"scalar","type":"String"},{"name":"room","kind":"object","type":"ChatRoom","relationName":"ChatRoomToMessage"},{"name":"senderId","kind":"scalar","type":"String"},{"name":"senderRole","kind":"enum","type":"UserRole"},{"name":"type","kind":"enum","type":"MessageType"},{"name":"text","kind":"scalar","type":"String"},{"name":"attachment","kind":"object","type":"Attachment","relationName":"AttachmentToMessage"},{"name":"reactions","kind":"object","type":"MessageReaction","relationName":"MessageToMessageReaction"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"messages"},"MessageReaction":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"messageId","kind":"scalar","type":"String"},{"name":"message","kind":"object","type":"Message","relationName":"MessageToMessageReaction"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"MessageReactionToUser"},{"name":"emoji","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"message_reactions"},"Notification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"type","kind":"scalar","type":"String"},{"name":"message","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"NotificationToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"read","kind":"scalar","type":"Boolean"}],"dbName":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"consultationId","kind":"scalar","type":"String"},{"name":"consultation","kind":"object","type":"Consultation","relationName":"ConsultationToPayment"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"originalAmount","kind":"scalar","type":"Float"},{"name":"discountAmount","kind":"scalar","type":"Float"},{"name":"couponCode","kind":"scalar","type":"String"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"stripeEventId","kind":"scalar","type":"String"},{"name":"paymentGatewayData","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"payments"},"Schedule":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"startDateTime","kind":"scalar","type":"DateTime"},{"name":"endDateTime","kind":"scalar","type":"DateTime"},{"name":"expertSchedules","kind":"object","type":"ExpertSchedule","relationName":"ExpertScheduleToSchedule"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"schedules"},"Testimonial":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"ReviewStatus"},{"name":"expertReply","kind":"scalar","type":"String"},{"name":"expertRepliedAt","kind":"scalar","type":"DateTime"},{"name":"clientId","kind":"scalar","type":"String"},{"name":"client","kind":"object","type":"Client","relationName":"ClientToTestimonial"},{"name":"expertId","kind":"scalar","type":"String"},{"name":"expert","kind":"object","type":"Expert","relationName":"ExpertToTestimonial"},{"name":"consultationId","kind":"scalar","type":"String"},{"name":"consultation","kind":"object","type":"Consultation","relationName":"ConsultationToTestimonial"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"testimonials"},"TypingState":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"roomId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"isTyping","kind":"scalar","type":"Boolean"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"typing_states"},"UserPresence":{"fields":[{"name":"userId","kind":"scalar","type":"String"},{"name":"isOnline","kind":"scalar","type":"Boolean"},{"name":"lastSeen","kind":"scalar","type":"DateTime"}],"dbName":"user_presence"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","client","experts","industry","expertApplications","_count","schedules","consultations","expert","consultation","testimonials","verification","room","message","attachment","reactions","messages","call","participants","calls","chatRooms","expertSchedules","schedule","expertSchedule","payment","testimonial","admin","notifications","messageReactions","conversation","aiConversations","Admin.findUnique","Admin.findUniqueOrThrow","Admin.findFirst","Admin.findFirstOrThrow","Admin.findMany","data","Admin.createOne","Admin.createMany","Admin.createManyAndReturn","Admin.updateOne","Admin.updateMany","Admin.updateManyAndReturn","create","update","Admin.upsertOne","Admin.deleteOne","Admin.deleteMany","having","_min","_max","Admin.groupBy","Admin.aggregate","AIConversation.findUnique","AIConversation.findUniqueOrThrow","AIConversation.findFirst","AIConversation.findFirstOrThrow","AIConversation.findMany","AIConversation.createOne","AIConversation.createMany","AIConversation.createManyAndReturn","AIConversation.updateOne","AIConversation.updateMany","AIConversation.updateManyAndReturn","AIConversation.upsertOne","AIConversation.deleteOne","AIConversation.deleteMany","AIConversation.groupBy","AIConversation.aggregate","AIChatMessage.findUnique","AIChatMessage.findUniqueOrThrow","AIChatMessage.findFirst","AIChatMessage.findFirstOrThrow","AIChatMessage.findMany","AIChatMessage.createOne","AIChatMessage.createMany","AIChatMessage.createManyAndReturn","AIChatMessage.updateOne","AIChatMessage.updateMany","AIChatMessage.updateManyAndReturn","AIChatMessage.upsertOne","AIChatMessage.deleteOne","AIChatMessage.deleteMany","_avg","_sum","AIChatMessage.groupBy","AIChatMessage.aggregate","Attachment.findUnique","Attachment.findUniqueOrThrow","Attachment.findFirst","Attachment.findFirstOrThrow","Attachment.findMany","Attachment.createOne","Attachment.createMany","Attachment.createManyAndReturn","Attachment.updateOne","Attachment.updateMany","Attachment.updateManyAndReturn","Attachment.upsertOne","Attachment.deleteOne","Attachment.deleteMany","Attachment.groupBy","Attachment.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Call.findUnique","Call.findUniqueOrThrow","Call.findFirst","Call.findFirstOrThrow","Call.findMany","Call.createOne","Call.createMany","Call.createManyAndReturn","Call.updateOne","Call.updateMany","Call.updateManyAndReturn","Call.upsertOne","Call.deleteOne","Call.deleteMany","Call.groupBy","Call.aggregate","CallParticipant.findUnique","CallParticipant.findUniqueOrThrow","CallParticipant.findFirst","CallParticipant.findFirstOrThrow","CallParticipant.findMany","CallParticipant.createOne","CallParticipant.createMany","CallParticipant.createManyAndReturn","CallParticipant.updateOne","CallParticipant.updateMany","CallParticipant.updateManyAndReturn","CallParticipant.upsertOne","CallParticipant.deleteOne","CallParticipant.deleteMany","CallParticipant.groupBy","CallParticipant.aggregate","ChatRoom.findUnique","ChatRoom.findUniqueOrThrow","ChatRoom.findFirst","ChatRoom.findFirstOrThrow","ChatRoom.findMany","ChatRoom.createOne","ChatRoom.createMany","ChatRoom.createManyAndReturn","ChatRoom.updateOne","ChatRoom.updateMany","ChatRoom.updateManyAndReturn","ChatRoom.upsertOne","ChatRoom.deleteOne","ChatRoom.deleteMany","ChatRoom.groupBy","ChatRoom.aggregate","Client.findUnique","Client.findUniqueOrThrow","Client.findFirst","Client.findFirstOrThrow","Client.findMany","Client.createOne","Client.createMany","Client.createManyAndReturn","Client.updateOne","Client.updateMany","Client.updateManyAndReturn","Client.upsertOne","Client.deleteOne","Client.deleteMany","Client.groupBy","Client.aggregate","Consultation.findUnique","Consultation.findUniqueOrThrow","Consultation.findFirst","Consultation.findFirstOrThrow","Consultation.findMany","Consultation.createOne","Consultation.createMany","Consultation.createManyAndReturn","Consultation.updateOne","Consultation.updateMany","Consultation.updateManyAndReturn","Consultation.upsertOne","Consultation.deleteOne","Consultation.deleteMany","Consultation.groupBy","Consultation.aggregate","Coupon.findUnique","Coupon.findUniqueOrThrow","Coupon.findFirst","Coupon.findFirstOrThrow","Coupon.findMany","Coupon.createOne","Coupon.createMany","Coupon.createManyAndReturn","Coupon.updateOne","Coupon.updateMany","Coupon.updateManyAndReturn","Coupon.upsertOne","Coupon.deleteOne","Coupon.deleteMany","Coupon.groupBy","Coupon.aggregate","Expert.findUnique","Expert.findUniqueOrThrow","Expert.findFirst","Expert.findFirstOrThrow","Expert.findMany","Expert.createOne","Expert.createMany","Expert.createManyAndReturn","Expert.updateOne","Expert.updateMany","Expert.updateManyAndReturn","Expert.upsertOne","Expert.deleteOne","Expert.deleteMany","Expert.groupBy","Expert.aggregate","ExpertApplication.findUnique","ExpertApplication.findUniqueOrThrow","ExpertApplication.findFirst","ExpertApplication.findFirstOrThrow","ExpertApplication.findMany","ExpertApplication.createOne","ExpertApplication.createMany","ExpertApplication.createManyAndReturn","ExpertApplication.updateOne","ExpertApplication.updateMany","ExpertApplication.updateManyAndReturn","ExpertApplication.upsertOne","ExpertApplication.deleteOne","ExpertApplication.deleteMany","ExpertApplication.groupBy","ExpertApplication.aggregate","ExpertSchedule.findUnique","ExpertSchedule.findUniqueOrThrow","ExpertSchedule.findFirst","ExpertSchedule.findFirstOrThrow","ExpertSchedule.findMany","ExpertSchedule.createOne","ExpertSchedule.createMany","ExpertSchedule.createManyAndReturn","ExpertSchedule.updateOne","ExpertSchedule.updateMany","ExpertSchedule.updateManyAndReturn","ExpertSchedule.upsertOne","ExpertSchedule.deleteOne","ExpertSchedule.deleteMany","ExpertSchedule.groupBy","ExpertSchedule.aggregate","ExpertVerification.findUnique","ExpertVerification.findUniqueOrThrow","ExpertVerification.findFirst","ExpertVerification.findFirstOrThrow","ExpertVerification.findMany","ExpertVerification.createOne","ExpertVerification.createMany","ExpertVerification.createManyAndReturn","ExpertVerification.updateOne","ExpertVerification.updateMany","ExpertVerification.updateManyAndReturn","ExpertVerification.upsertOne","ExpertVerification.deleteOne","ExpertVerification.deleteMany","ExpertVerification.groupBy","ExpertVerification.aggregate","Industry.findUnique","Industry.findUniqueOrThrow","Industry.findFirst","Industry.findFirstOrThrow","Industry.findMany","Industry.createOne","Industry.createMany","Industry.createManyAndReturn","Industry.updateOne","Industry.updateMany","Industry.updateManyAndReturn","Industry.upsertOne","Industry.deleteOne","Industry.deleteMany","Industry.groupBy","Industry.aggregate","Message.findUnique","Message.findUniqueOrThrow","Message.findFirst","Message.findFirstOrThrow","Message.findMany","Message.createOne","Message.createMany","Message.createManyAndReturn","Message.updateOne","Message.updateMany","Message.updateManyAndReturn","Message.upsertOne","Message.deleteOne","Message.deleteMany","Message.groupBy","Message.aggregate","MessageReaction.findUnique","MessageReaction.findUniqueOrThrow","MessageReaction.findFirst","MessageReaction.findFirstOrThrow","MessageReaction.findMany","MessageReaction.createOne","MessageReaction.createMany","MessageReaction.createManyAndReturn","MessageReaction.updateOne","MessageReaction.updateMany","MessageReaction.updateManyAndReturn","MessageReaction.upsertOne","MessageReaction.deleteOne","MessageReaction.deleteMany","MessageReaction.groupBy","MessageReaction.aggregate","Notification.findUnique","Notification.findUniqueOrThrow","Notification.findFirst","Notification.findFirstOrThrow","Notification.findMany","Notification.createOne","Notification.createMany","Notification.createManyAndReturn","Notification.updateOne","Notification.updateMany","Notification.updateManyAndReturn","Notification.upsertOne","Notification.deleteOne","Notification.deleteMany","Notification.groupBy","Notification.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Schedule.findUnique","Schedule.findUniqueOrThrow","Schedule.findFirst","Schedule.findFirstOrThrow","Schedule.findMany","Schedule.createOne","Schedule.createMany","Schedule.createManyAndReturn","Schedule.updateOne","Schedule.updateMany","Schedule.updateManyAndReturn","Schedule.upsertOne","Schedule.deleteOne","Schedule.deleteMany","Schedule.groupBy","Schedule.aggregate","Testimonial.findUnique","Testimonial.findUniqueOrThrow","Testimonial.findFirst","Testimonial.findFirstOrThrow","Testimonial.findMany","Testimonial.createOne","Testimonial.createMany","Testimonial.createManyAndReturn","Testimonial.updateOne","Testimonial.updateMany","Testimonial.updateManyAndReturn","Testimonial.upsertOne","Testimonial.deleteOne","Testimonial.deleteMany","Testimonial.groupBy","Testimonial.aggregate","TypingState.findUnique","TypingState.findUniqueOrThrow","TypingState.findFirst","TypingState.findFirstOrThrow","TypingState.findMany","TypingState.createOne","TypingState.createMany","TypingState.createManyAndReturn","TypingState.updateOne","TypingState.updateMany","TypingState.updateManyAndReturn","TypingState.upsertOne","TypingState.deleteOne","TypingState.deleteMany","TypingState.groupBy","TypingState.aggregate","UserPresence.findUnique","UserPresence.findUniqueOrThrow","UserPresence.findFirst","UserPresence.findFirstOrThrow","UserPresence.findMany","UserPresence.createOne","UserPresence.createMany","UserPresence.createManyAndReturn","UserPresence.updateOne","UserPresence.updateMany","UserPresence.updateManyAndReturn","UserPresence.upsertOne","UserPresence.deleteOne","UserPresence.deleteMany","UserPresence.groupBy","UserPresence.aggregate","AND","OR","NOT","userId","isOnline","lastSeen","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","id","roomId","isTyping","updatedAt","roomId_userId","rating","comment","ReviewStatus","status","expertReply","expertRepliedAt","clientId","expertId","consultationId","createdAt","startDateTime","endDateTime","isDeleted","deletedAt","every","some","none","amount","PaymentStatus","originalAmount","discountAmount","couponCode","transactionId","stripeEventId","paymentGatewayData","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","type","read","messageId","emoji","senderId","UserRole","senderRole","MessageType","text","name","description","icon","VerificationStatus","notes","verifiedBy","verifiedAt","scheduleId","isBooked","isPublished","industryId","fullName","email","phone","bio","title","experience","consultationFee","profilePhoto","resumeUrl","resumeFileName","resumeFileType","resumeFileSize","ExpertApplicationStatus","reviewNotes","reviewedBy","reviewedAt","isVerified","isSeeded","code","CouponDiscountType","discountType","discountValue","maxDiscount","minAmount","expiresAt","maxUses","usedCount","isActive","videoCallId","ConsultationStatus","paymentStatus","date","startedAt","endedAt","cancelledAt","cancelReason","Role","cancelledBy","rescheduledAt","rescheduleReason","rescheduledBy","sessionSummary","expertScheduleId","address","callId","role","joinedAt","leftAt","CallStatus","identifier","value","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","emailVerified","UserStatus","needPasswordChange","image","fileUrl","fileName","fileType","fileSize","conversationId","AIChatMessageRole","content","model","provider","tokensUsed","latencyMs","AIMessageFeedback","feedback","contactNumber","messageId_userId_emoji","clientId_expertId","expertId_scheduleId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "-AzxAbADDgMAAMoGACDcAwAA_QYAMN0DAABVABDeAwAA_QYAMN8DAQAAAAHtAwEAAAAB8ANAAO8FACH7A0AA7wUAIf4DIADuBQAh_wNAAIgGACGaBAEA7QUAIaYEAQAAAAGsBAEAmgYAIfUEAQCaBgAhAQAAAAEAIAwDAADKBgAg3AMAAKMHADDdAwAAAwAQ3gMAAKMHADDfAwEA7QUAIe0DAQDtBQAh8ANAAO8FACH7A0AA7wUAIb0EQADvBQAh4QQBAO0FACHiBAEAmgYAIeMEAQCaBgAhAwMAAIkKACDiBAAArQcAIOMEAACtBwAgDAMAAMoGACDcAwAAowcAMN0DAAADABDeAwAAowcAMN8DAQDtBQAh7QMBAAAAAfADQADvBQAh-wNAAO8FACG9BEAA7wUAIeEEAQAAAAHiBAEAmgYAIeMEAQCaBgAhAwAAAAMAIAEAAAQAMAIAAAUAIBEDAADKBgAg3AMAAKIHADDdAwAABwAQ3gMAAKIHADDfAwEA7QUAIe0DAQDtBQAh8ANAAO8FACH7A0AA7wUAIdgEAQDtBQAh2QQBAO0FACHaBAEAmgYAIdsEAQCaBgAh3AQBAJoGACHdBEAAiAYAId4EQACIBgAh3wQBAJoGACHgBAEAmgYAIQgDAACJCgAg2gQAAK0HACDbBAAArQcAINwEAACtBwAg3QQAAK0HACDeBAAArQcAIN8EAACtBwAg4AQAAK0HACARAwAAygYAINwDAACiBwAw3QMAAAcAEN4DAACiBwAw3wMBAO0FACHtAwEAAAAB8ANAAO8FACH7A0AA7wUAIdgEAQDtBQAh2QQBAO0FACHaBAEAmgYAIdsEAQCaBgAh3AQBAJoGACHdBEAAiAYAId4EQACIBgAh3wQBAJoGACHgBAEAmgYAIQMAAAAHACABAAAIADACAAAJACASAwAAygYAIAwAAMsGACAPAADMBgAgGQAAzQYAINwDAADJBgAw3QMAAAsAEN4DAADJBgAw3wMBAO0FACHtAwEAhwYAIfADQADvBQAh-wNAAO8FACH-AyAA7gUAIf8DQACIBgAhpQQBAO0FACGmBAEA7QUAIacEAQCaBgAhrAQBAJoGACHQBAEAmgYAIQEAAAALACAcBgAAjgcAIA0AAOUGACAZAADNBgAgHAAAnwcAIB0AAKAHACAeAAChBwAg3AMAAJwHADDdAwAADQAQ3gMAAJwHADDtAwEAhwYAIfADQADvBQAh9QMAAJ0HwwQi-AMBAIcGACH5AwEAjAcAIfsDQADvBQAhwQQBAIcGACHDBAAAmAaFBCLEBEAA7wUAIcUEQACIBgAhxgRAAIgGACHHBEAAiAYAIcgEAQCaBgAhygQAAJ4HygQjywRAAIgGACHMBAEAmgYAIc0EAACeB8oEI84EAQCaBgAhzwQBAIcGACEQBgAAoQsAIA0AAMgJACAZAACMCgAgHAAAygsAIB0AAMsLACAeAADMCwAg-QMAAK0HACDFBAAArQcAIMYEAACtBwAgxwQAAK0HACDIBAAArQcAIMoEAACtBwAgywQAAK0HACDMBAAArQcAIM0EAACtBwAgzgQAAK0HACAcBgAAjgcAIA0AAOUGACAZAADNBgAgHAAAnwcAIB0AAKAHACAeAAChBwAg3AMAAJwHADDdAwAADQAQ3gMAAJwHADDtAwEAAAAB8ANAAO8FACH1AwAAnQfDBCL4AwEAhwYAIfkDAQCMBwAh-wNAAO8FACHBBAEAAAABwwQAAJgGhQQixARAAO8FACHFBEAAiAYAIcYEQACIBgAhxwRAAIgGACHIBAEAmgYAIcoEAACeB8oEI8sEQACIBgAhzAQBAJoGACHNBAAAngfKBCPOBAEAmgYAIc8EAQAAAAEDAAAADQAgAQAADgAwAgAADwAgGwMAAMoGACAIAACZBwAgCwAAiQYAIAwAAMsGACAPAADMBgAgEAAAmwcAIBkAAM0GACDcAwAAmgcAMN0DAAARABDeAwAAmgcAMN8DAQDtBQAh7QMBAIcGACHwA0AA7wUAIfsDQADvBQAh_gMgAO4FACH_A0AAiAYAIaQEAQCHBgAhpQQBAO0FACGmBAEA7QUAIacEAQCaBgAhqAQBAJoGACGpBAEAmgYAIaoEAgDABgAhqwQCAMAGACGsBAEAmgYAIbUEIADuBQAhtgQgAO4FACEMAwAAiQoAIAgAAMgLACALAADECAAgDAAAigoAIA8AAIsKACAQAADJCwAgGQAAjAoAIP8DAACtBwAgpwQAAK0HACCoBAAArQcAIKkEAACtBwAgrAQAAK0HACAbAwAAygYAIAgAAJkHACALAACJBgAgDAAAywYAIA8AAMwGACAQAACbBwAgGQAAzQYAINwDAACaBwAw3QMAABEAEN4DAACaBwAw3wMBAAAAAe0DAQAAAAHwA0AA7wUAIfsDQADvBQAh_gMgAO4FACH_A0AAiAYAIaQEAQCHBgAhpQQBAO0FACGmBAEAAAABpwQBAJoGACGoBAEAmgYAIakEAQCaBgAhqgQCAMAGACGrBAIAwAYAIawEAQCaBgAhtQQgAO4FACG2BCAA7gUAIQMAAAARACABAAASADACAAATACAaAwAAygYAIAgAAJkHACDcAwAAlwcAMN0DAAAVABDeAwAAlwcAMN8DAQDtBQAh7QMBAIcGACHwA0AA7wUAIfUDAACYB7IEIvsDQADvBQAhpAQBAIcGACGlBAEA7QUAIaYEAQDtBQAhpwQBAJoGACGoBAEAmgYAIakEAQCaBgAhqgQCAMAGACGrBAIAwAYAIawEAQCaBgAhrQQBAJoGACGuBAEAmgYAIa8EAQCaBgAhsAQCAL8GACGyBAEAmgYAIbMEAQCaBgAhtARAAIgGACENAwAAiQoAIAgAAMgLACCnBAAArQcAIKgEAACtBwAgqQQAAK0HACCsBAAArQcAIK0EAACtBwAgrgQAAK0HACCvBAAArQcAILAEAACtBwAgsgQAAK0HACCzBAAArQcAILQEAACtBwAgGgMAAMoGACAIAACZBwAg3AMAAJcHADDdAwAAFQAQ3gMAAJcHADDfAwEA7QUAIe0DAQAAAAHwA0AA7wUAIfUDAACYB7IEIvsDQADvBQAhpAQBAIcGACGlBAEA7QUAIaYEAQDtBQAhpwQBAJoGACGoBAEAmgYAIakEAQCaBgAhqgQCAMAGACGrBAIAwAYAIawEAQCaBgAhrQQBAJoGACGuBAEAmgYAIa8EAQCaBgAhsAQCAL8GACGyBAEAmgYAIbMEAQCaBgAhtARAAIgGACEDAAAAFQAgAQAAFgAwAgAAFwAgAQAAABEAIAEAAAAVACAQDQAAsAYAIA4AAI0HACAbAACWBwAg3AMAAJUHADDdAwAAGwAQ3gMAAJUHADDtAwEAhwYAIfADQADvBQAh-QMBAIcGACH6AwEAjAcAIfsDQADvBQAh_gMgAO4FACH_A0AAiAYAIaEEAQCHBgAhogQgAO4FACGjBCAA7gUAIQUNAADICQAgDgAAzAgAIBsAAMcLACD6AwAArQcAIP8DAACtBwAgEQ0AALAGACAOAACNBwAgGwAAlgcAINwDAACVBwAw3QMAABsAEN4DAACVBwAw7QMBAAAAAfADQADvBQAh-QMBAIcGACH6AwEAjAcAIfsDQADvBQAh_gMgAO4FACH_A0AAiAYAIaEEAQCHBgAhogQgAO4FACGjBCAA7gUAIfgEAACUBwAgAwAAABsAIAEAABwAMAIAAB0AIAMAAAANACABAAAOADACAAAPACARBgAAjgcAIA0AALAGACAOAACNBwAg3AMAAJIHADDdAwAAIAAQ3gMAAJIHADDtAwEAhwYAIfADQADvBQAh8gMCAMAGACHzAwEAmgYAIfUDAACTB_UDIvYDAQCaBgAh9wNAAIgGACH4AwEAhwYAIfkDAQCHBgAh-gMBAIwHACH7A0AA7wUAIQcGAAChCwAgDQAAyAkAIA4AAMwIACDzAwAArQcAIPYDAACtBwAg9wMAAK0HACD6AwAArQcAIBEGAACOBwAgDQAAsAYAIA4AAI0HACDcAwAAkgcAMN0DAAAgABDeAwAAkgcAMO0DAQAAAAHwA0AA7wUAIfIDAgDABgAh8wMBAJoGACH1AwAAkwf1AyL2AwEAmgYAIfcDQACIBgAh-AMBAIcGACH5AwEAhwYAIfoDAQAAAAH7A0AA7wUAIQMAAAAgACABAAAhADACAAAiACABAAAADQAgDA0AALAGACDcAwAArgYAMN0DAAAlABDeAwAArgYAMO0DAQCHBgAh8ANAAO8FACH1AwAArwaeBCL5AwEAhwYAIfsDQADvBQAhngQBAJoGACGfBAEAmgYAIaAEQACIBgAhAQAAACUAIA4GAACOBwAgDQAAsAYAIA4AAI0HACAVAACPBwAgGAAAkAcAINwDAACLBwAw3QMAACcAEN4DAACLBwAw7QMBAO0FACHwA0AA7wUAIfgDAQCHBgAh-QMBAIcGACH6AwEAjAcAIfsDQADvBQAhBgYAAKELACANAADICQAgDgAAzAgAIBUAAMULACAYAADGCwAg-gMAAK0HACAPBgAAjgcAIA0AALAGACAOAACNBwAgFQAAjwcAIBgAAJAHACDcAwAAiwcAMN0DAAAnABDeAwAAiwcAMO0DAQAAAAHwA0AA7wUAIfgDAQCHBgAh-QMBAIcGACH6AwEAjAcAIfsDQADvBQAh9wQAAIoHACADAAAAJwAgAQAAKAAwAgAAKQAgAQAAAA0AIA0RAACDBwAgEwAAiQcAIBQAAOgGACDcAwAAhwcAMN0DAAAsABDeAwAAhwcAMO0DAQDtBQAh7gMBAO0FACH7A0AA7wUAIZEEAACIB5kEIpUEAQDtBQAhlwQAAP8GlwQimQQBAJoGACEEEQAAwgsAIBMAAMQLACAUAACkCwAgmQQAAK0HACANEQAAgwcAIBMAAIkHACAUAADoBgAg3AMAAIcHADDdAwAALAAQ3gMAAIcHADDtAwEAAAAB7gMBAO0FACH7A0AA7wUAIZEEAACIB5kEIpUEAQDtBQAhlwQAAP8GlwQimQQBAJoGACEDAAAALAAgAQAALQAwAgAALgAgCxIAAOwGACDcAwAA6wYAMN0DAAAwABDeAwAA6wYAMO0DAQDtBQAh-wNAAO8FACGTBAEA7QUAIegEAQDtBQAh6QQBAO0FACHqBAEA7QUAIesEAgDABgAhAQAAADAAIAoDAADKBgAgEgAA7AYAINwDAACGBwAw3QMAADIAEN4DAACGBwAw3wMBAO0FACHtAwEA7QUAIfsDQADvBQAhkwQBAO0FACGUBAEA7QUAIQIDAACJCgAgEgAArQsAIAsDAADKBgAgEgAA7AYAINwDAACGBwAw3QMAADIAEN4DAACGBwAw3wMBAO0FACHtAwEAAAAB-wNAAO8FACGTBAEA7QUAIZQEAQDtBQAh9gQAAIUHACADAAAAMgAgAQAAMwAwAgAANAAgAQAAADIAIAsRAACDBwAgFwAAhAcAINwDAACBBwAw3QMAADcAEN4DAACBBwAw7QMBAO0FACHuAwEA7QUAIfUDAACCB9YEIvsDQADvBQAhxQRAAIgGACHGBEAAiAYAIQQRAADCCwAgFwAAwwsAIMUEAACtBwAgxgQAAK0HACALEQAAgwcAIBcAAIQHACDcAwAAgQcAMN0DAAA3ABDeAwAAgQcAMO0DAQAAAAHuAwEA7QUAIfUDAACCB9YEIvsDQADvBQAhxQRAAIgGACHGBEAAiAYAIQMAAAA3ACABAAA4ADACAAA5ACAKFgAAgAcAINwDAAD-BgAw3QMAADsAEN4DAAD-BgAw3wMBAO0FACHtAwEA7QUAIdEEAQDtBQAh0gQAAP8GlwQi0wRAAIgGACHUBEAAiAYAIQMWAADBCwAg0wQAAK0HACDUBAAArQcAIAoWAACABwAg3AMAAP4GADDdAwAAOwAQ3gMAAP4GADDfAwEA7QUAIe0DAQAAAAHRBAEA7QUAIdIEAAD_BpcEItMEQACIBgAh1ARAAIgGACEDAAAAOwAgAQAAPAAwAgAAPQAgAQAAADsAIAEAAAAsACABAAAANwAgAQAAABsAIAEAAAANACABAAAAIAAgAQAAACcAIAMAAAAbACABAAAcADACAAAdACABAAAAGwAgAQAAAA0AIBAOAACcBgAg3AMAAJYGADDdAwAASQAQ3gMAAJYGADDtAwEAhwYAIfADQADvBQAh9QMAAJgGhQQi-gMBAIcGACH7A0AA7wUAIYMECACXBgAhhQQIAJkGACGGBAgAmQYAIYcEAQCaBgAhiAQBAO0FACGJBAEAmgYAIYoEAACbBgAgAQAAAEkAIAEAAAAgACADAAAAJwAgAQAAKAAwAgAAKQAgAQAAABEAIAEAAAAnACADAAAAIAAgAQAAIQAwAgAAIgAgAwAAACcAIAEAACgAMAIAACkAIAEAAAANACABAAAAIAAgAQAAACcAIAEAAAARACAOAwAAygYAINwDAAD9BgAw3QMAAFUAEN4DAAD9BgAw3wMBAO0FACHtAwEA7QUAIfADQADvBQAh-wNAAO8FACH-AyAA7gUAIf8DQACIBgAhmgQBAO0FACGmBAEA7QUAIawEAQCaBgAh9QQBAJoGACEBAAAAVQAgCgMAAMoGACASAQDtBQAh3AMAAPwGADDdAwAAVwAQ3gMAAPwGADDfAwEA7QUAIe0DAQDtBQAh-wNAAO8FACGRBAEA7QUAIZIEIADuBQAhAQMAAIkKACAKAwAAygYAIBIBAO0FACHcAwAA_AYAMN0DAABXABDeAwAA_AYAMN8DAQDtBQAh7QMBAAAAAfsDQADvBQAhkQQBAO0FACGSBCAA7gUAIQMAAABXACABAABYADACAABZACADAAAAMgAgAQAAMwAwAgAANAAgCgMAAMoGACAVAAD7BgAg3AMAAPoGADDdAwAAXAAQ3gMAAPoGADDfAwEA7QUAIe0DAQCHBgAh8ANAAO8FACH7A0AA7wUAIakEAQDtBQAhAgMAAIkKACAVAADACwAgCgMAAMoGACAVAAD7BgAg3AMAAPoGADDdAwAAXAAQ3gMAAPoGADDfAwEA7QUAIe0DAQAAAAHwA0AA7wUAIfsDQADvBQAhqQQBAO0FACEDAAAAXAAgAQAAXQAwAgAAXgAgDiIAAPkGACDcAwAA9gYAMN0DAABgABDeAwAA9gYAMO0DAQCHBgAh-wNAAO8FACHSBAAA9wbuBCLsBAEAhwYAIe4EAQDtBQAh7wQBAJoGACHwBAEAmgYAIfEEAgC_BgAh8gQCAL8GACH0BAAA-Ab0BCMGIgAAvwsAIO8EAACtBwAg8AQAAK0HACDxBAAArQcAIPIEAACtBwAg9AQAAK0HACAOIgAA-QYAINwDAAD2BgAw3QMAAGAAEN4DAAD2BgAw7QMBAAAAAfsDQADvBQAh0gQAAPcG7gQi7AQBAIcGACHuBAEA7QUAIe8EAQCaBgAh8AQBAJoGACHxBAIAvwYAIfIEAgC_BgAh9AQAAPgG9AQjAwAAAGAAIAEAAGEAMAIAAGIAIAEAAABgACADAAAAFQAgAQAAFgAwAgAAFwAgAQAAAAMAIAEAAAAHACABAAAAVwAgAQAAADIAIAEAAABcACABAAAAFQAgAQAAAAEAIAQDAACJCgAg_wMAAK0HACCsBAAArQcAIPUEAACtBwAgAwAAAFUAIAEAAG0AMAIAAAEAIAMAAABVACABAABtADACAAABACADAAAAVQAgAQAAbQAwAgAAAQAgCwMAAL4LACDfAwEAAAAB7QMBAAAAAfADQAAAAAH7A0AAAAAB_gMgAAAAAf8DQAAAAAGaBAEAAAABpgQBAAAAAawEAQAAAAH1BAEAAAABASkAAHEAIArfAwEAAAAB7QMBAAAAAfADQAAAAAH7A0AAAAAB_gMgAAAAAf8DQAAAAAGaBAEAAAABpgQBAAAAAawEAQAAAAH1BAEAAAABASkAAHMAMAEpAABzADALAwAAvQsAIN8DAQCnBwAh7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIZoEAQCnBwAhpgQBAKcHACGsBAEAtAcAIfUEAQC0BwAhAgAAAAEAICkAAHYAIArfAwEApwcAIe0DAQCnBwAh8ANAAKkHACH7A0AAqQcAIf4DIACoBwAh_wNAALYHACGaBAEApwcAIaYEAQCnBwAhrAQBALQHACH1BAEAtAcAIQIAAABVACApAAB4ACACAAAAVQAgKQAAeAAgAwAAAAEAIDAAAHEAIDEAAHYAIAEAAAABACABAAAAVQAgBgoAALoLACA2AAC8CwAgNwAAuwsAIP8DAACtBwAgrAQAAK0HACD1BAAArQcAIA3cAwAA9QYAMN0DAAB_ABDeAwAA9QYAMN8DAQDiBQAh7QMBAOIFACHwA0AA5AUAIfsDQADkBQAh_gMgAOMFACH_A0AA-AUAIZoEAQDiBQAhpgQBAOIFACGsBAEA9gUAIfUEAQD2BQAhAwAAAFUAIAEAAH4AMDUAAH8AIAMAAABVACABAABtADACAAABACABAAAAXgAgAQAAAF4AIAMAAABcACABAABdADACAABeACADAAAAXAAgAQAAXQAwAgAAXgAgAwAAAFwAIAEAAF0AMAIAAF4AIAcDAAC5CwAgFQAA2QoAIN8DAQAAAAHtAwEAAAAB8ANAAAAAAfsDQAAAAAGpBAEAAAABASkAAIcBACAF3wMBAAAAAe0DAQAAAAHwA0AAAAAB-wNAAAAAAakEAQAAAAEBKQAAiQEAMAEpAACJAQAwBwMAALgLACAVAADJCgAg3wMBAKcHACHtAwEApwcAIfADQACpBwAh-wNAAKkHACGpBAEApwcAIQIAAABeACApAACMAQAgBd8DAQCnBwAh7QMBAKcHACHwA0AAqQcAIfsDQACpBwAhqQQBAKcHACECAAAAXAAgKQAAjgEAIAIAAABcACApAACOAQAgAwAAAF4AIDAAAIcBACAxAACMAQAgAQAAAF4AIAEAAABcACADCgAAtQsAIDYAALcLACA3AAC2CwAgCNwDAAD0BgAw3QMAAJUBABDeAwAA9AYAMN8DAQDiBQAh7QMBAPQFACHwA0AA5AUAIfsDQADkBQAhqQQBAOIFACEDAAAAXAAgAQAAlAEAMDUAAJUBACADAAAAXAAgAQAAXQAwAgAAXgAgAQAAAGIAIAEAAABiACADAAAAYAAgAQAAYQAwAgAAYgAgAwAAAGAAIAEAAGEAMAIAAGIAIAMAAABgACABAABhADACAABiACALIgAAtAsAIO0DAQAAAAH7A0AAAAAB0gQAAADuBALsBAEAAAAB7gQBAAAAAe8EAQAAAAHwBAEAAAAB8QQCAAAAAfIEAgAAAAH0BAAAAPQEAwEpAACdAQAgCu0DAQAAAAH7A0AAAAAB0gQAAADuBALsBAEAAAAB7gQBAAAAAe8EAQAAAAHwBAEAAAAB8QQCAAAAAfIEAgAAAAH0BAAAAPQEAwEpAACfAQAwASkAAJ8BADALIgAAswsAIO0DAQCnBwAh-wNAAKkHACHSBAAA1AruBCLsBAEApwcAIe4EAQCnBwAh7wQBALQHACHwBAEAtAcAIfEEAgDrCAAh8gQCAOsIACH0BAAA1Qr0BCMCAAAAYgAgKQAAogEAIArtAwEApwcAIfsDQACpBwAh0gQAANQK7gQi7AQBAKcHACHuBAEApwcAIe8EAQC0BwAh8AQBALQHACHxBAIA6wgAIfIEAgDrCAAh9AQAANUK9AQjAgAAAGAAICkAAKQBACACAAAAYAAgKQAApAEAIAMAAABiACAwAACdAQAgMQAAogEAIAEAAABiACABAAAAYAAgCgoAAK4LACA2AACxCwAgNwAAsAsAIFgAAK8LACBZAACyCwAg7wQAAK0HACDwBAAArQcAIPEEAACtBwAg8gQAAK0HACD0BAAArQcAIA3cAwAA7QYAMN0DAACrAQAQ3gMAAO0GADDtAwEA9AUAIfsDQADkBQAh0gQAAO4G7gQi7AQBAPQFACHuBAEA4gUAIe8EAQD2BQAh8AQBAPYFACHxBAIAswYAIfIEAgCzBgAh9AQAAO8G9AQjAwAAAGAAIAEAAKoBADA1AACrAQAgAwAAAGAAIAEAAGEAMAIAAGIAIAsSAADsBgAg3AMAAOsGADDdAwAAMAAQ3gMAAOsGADDtAwEAAAAB-wNAAO8FACGTBAEAAAAB6AQBAO0FACHpBAEA7QUAIeoEAQDtBQAh6wQCAMAGACEBAAAArgEAIAEAAACuAQAgARIAAK0LACADAAAAMAAgAQAAsQEAMAIAAK4BACADAAAAMAAgAQAAsQEAMAIAAK4BACADAAAAMAAgAQAAsQEAMAIAAK4BACAIEgAArAsAIO0DAQAAAAH7A0AAAAABkwQBAAAAAegEAQAAAAHpBAEAAAAB6gQBAAAAAesEAgAAAAEBKQAAtQEAIAftAwEAAAAB-wNAAAAAAZMEAQAAAAHoBAEAAAAB6QQBAAAAAeoEAQAAAAHrBAIAAAABASkAALcBADABKQAAtwEAMAgSAACrCwAg7QMBAKcHACH7A0AAqQcAIZMEAQCnBwAh6AQBAKcHACHpBAEApwcAIeoEAQCnBwAh6wQCALMHACECAAAArgEAICkAALoBACAH7QMBAKcHACH7A0AAqQcAIZMEAQCnBwAh6AQBAKcHACHpBAEApwcAIeoEAQCnBwAh6wQCALMHACECAAAAMAAgKQAAvAEAIAIAAAAwACApAAC8AQAgAwAAAK4BACAwAAC1AQAgMQAAugEAIAEAAACuAQAgAQAAADAAIAUKAACmCwAgNgAAqQsAIDcAAKgLACBYAACnCwAgWQAAqgsAIArcAwAA6gYAMN0DAADDAQAQ3gMAAOoGADDtAwEA4gUAIfsDQADkBQAhkwQBAOIFACHoBAEA4gUAIekEAQDiBQAh6gQBAOIFACHrBAIA9QUAIQMAAAAwACABAADCAQAwNQAAwwEAIAMAAAAwACABAACxAQAwAgAArgEAIBgEAADiBgAgBQAA4wYAIAYAAOQGACAJAACpBgAgDQAA5QYAIB8AAOYGACAgAADnBgAgIQAA6AYAICMAAOkGACDcAwAA3wYAMN0DAADJAQAQ3gMAAN8GADDtAwEAAAAB8ANAAO8FACH1AwAA4QbmBCL7A0AA7wUAIf4DIADuBQAh_wNAAIgGACGaBAEA7QUAIaYEAQAAAAHSBAAA4AbKBCLkBCAA7gUAIeYEIADuBQAh5wQBAJoGACEBAAAAxgEAIAEAAADGAQAgGAQAAOIGACAFAADjBgAgBgAA5AYAIAkAAKkGACANAADlBgAgHwAA5gYAICAAAOcGACAhAADoBgAgIwAA6QYAINwDAADfBgAw3QMAAMkBABDeAwAA3wYAMO0DAQDtBQAh8ANAAO8FACH1AwAA4QbmBCL7A0AA7wUAIf4DIADuBQAh_wNAAIgGACGaBAEA7QUAIaYEAQDtBQAh0gQAAOAGygQi5AQgAO4FACHmBCAA7gUAIecEAQCaBgAhCwQAAJ8LACAFAACgCwAgBgAAoQsAIAkAAMIJACANAADICQAgHwAAogsAICAAAKMLACAhAACkCwAgIwAApQsAIP8DAACtBwAg5wQAAK0HACADAAAAyQEAIAEAAMoBADACAADGAQAgAwAAAMkBACABAADKAQAwAgAAxgEAIAMAAADJAQAgAQAAygEAMAIAAMYBACAVBAAAlgsAIAUAAJcLACAGAACYCwAgCQAAngsAIA0AAJkLACAfAACaCwAgIAAAmwsAICEAAJwLACAjAACdCwAg7QMBAAAAAfADQAAAAAH1AwAAAOYEAvsDQAAAAAH-AyAAAAAB_wNAAAAAAZoEAQAAAAGmBAEAAAAB0gQAAADKBALkBCAAAAAB5gQgAAAAAecEAQAAAAEBKQAAzgEAIAztAwEAAAAB8ANAAAAAAfUDAAAA5gQC-wNAAAAAAf4DIAAAAAH_A0AAAAABmgQBAAAAAaYEAQAAAAHSBAAAAMoEAuQEIAAAAAHmBCAAAAAB5wQBAAAAAQEpAADQAQAwASkAANABADAVBAAArAoAIAUAAK0KACAGAACuCgAgCQAAtAoAIA0AAK8KACAfAACwCgAgIAAAsQoAICEAALIKACAjAACzCgAg7QMBAKcHACHwA0AAqQcAIfUDAACrCuYEIvsDQACpBwAh_gMgAKgHACH_A0AAtgcAIZoEAQCnBwAhpgQBAKcHACHSBAAAqgrKBCLkBCAAqAcAIeYEIACoBwAh5wQBALQHACECAAAAxgEAICkAANMBACAM7QMBAKcHACHwA0AAqQcAIfUDAACrCuYEIvsDQACpBwAh_gMgAKgHACH_A0AAtgcAIZoEAQCnBwAhpgQBAKcHACHSBAAAqgrKBCLkBCAAqAcAIeYEIACoBwAh5wQBALQHACECAAAAyQEAICkAANUBACACAAAAyQEAICkAANUBACADAAAAxgEAIDAAAM4BACAxAADTAQAgAQAAAMYBACABAAAAyQEAIAUKAACnCgAgNgAAqQoAIDcAAKgKACD_AwAArQcAIOcEAACtBwAgD9wDAADYBgAw3QMAANwBABDeAwAA2AYAMO0DAQDiBQAh8ANAAOQFACH1AwAA2gbmBCL7A0AA5AUAIf4DIADjBQAh_wNAAPgFACGaBAEA4gUAIaYEAQDiBQAh0gQAANkGygQi5AQgAOMFACHmBCAA4wUAIecEAQD2BQAhAwAAAMkBACABAADbAQAwNQAA3AEAIAMAAADJAQAgAQAAygEAMAIAAMYBACABAAAABQAgAQAAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAkDAACmCgAg3wMBAAAAAe0DAQAAAAHwA0AAAAAB-wNAAAAAAb0EQAAAAAHhBAEAAAAB4gQBAAAAAeMEAQAAAAEBKQAA5AEAIAjfAwEAAAAB7QMBAAAAAfADQAAAAAH7A0AAAAABvQRAAAAAAeEEAQAAAAHiBAEAAAAB4wQBAAAAAQEpAADmAQAwASkAAOYBADAJAwAApQoAIN8DAQCnBwAh7QMBAKcHACHwA0AAqQcAIfsDQACpBwAhvQRAAKkHACHhBAEApwcAIeIEAQC0BwAh4wQBALQHACECAAAABQAgKQAA6QEAIAjfAwEApwcAIe0DAQCnBwAh8ANAAKkHACH7A0AAqQcAIb0EQACpBwAh4QQBAKcHACHiBAEAtAcAIeMEAQC0BwAhAgAAAAMAICkAAOsBACACAAAAAwAgKQAA6wEAIAMAAAAFACAwAADkAQAgMQAA6QEAIAEAAAAFACABAAAAAwAgBQoAAKIKACA2AACkCgAgNwAAowoAIOIEAACtBwAg4wQAAK0HACAL3AMAANcGADDdAwAA8gEAEN4DAADXBgAw3wMBAOIFACHtAwEA4gUAIfADQADkBQAh-wNAAOQFACG9BEAA5AUAIeEEAQDiBQAh4gQBAPYFACHjBAEA9gUAIQMAAAADACABAADxAQAwNQAA8gEAIAMAAAADACABAAAEADACAAAFACABAAAACQAgAQAAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIA4DAAChCgAg3wMBAAAAAe0DAQAAAAHwA0AAAAAB-wNAAAAAAdgEAQAAAAHZBAEAAAAB2gQBAAAAAdsEAQAAAAHcBAEAAAAB3QRAAAAAAd4EQAAAAAHfBAEAAAAB4AQBAAAAAQEpAAD6AQAgDd8DAQAAAAHtAwEAAAAB8ANAAAAAAfsDQAAAAAHYBAEAAAAB2QQBAAAAAdoEAQAAAAHbBAEAAAAB3AQBAAAAAd0EQAAAAAHeBEAAAAAB3wQBAAAAAeAEAQAAAAEBKQAA_AEAMAEpAAD8AQAwDgMAAKAKACDfAwEApwcAIe0DAQCnBwAh8ANAAKkHACH7A0AAqQcAIdgEAQCnBwAh2QQBAKcHACHaBAEAtAcAIdsEAQC0BwAh3AQBALQHACHdBEAAtgcAId4EQAC2BwAh3wQBALQHACHgBAEAtAcAIQIAAAAJACApAAD_AQAgDd8DAQCnBwAh7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh2AQBAKcHACHZBAEApwcAIdoEAQC0BwAh2wQBALQHACHcBAEAtAcAId0EQAC2BwAh3gRAALYHACHfBAEAtAcAIeAEAQC0BwAhAgAAAAcAICkAAIECACACAAAABwAgKQAAgQIAIAMAAAAJACAwAAD6AQAgMQAA_wEAIAEAAAAJACABAAAABwAgCgoAAJ0KACA2AACfCgAgNwAAngoAINoEAACtBwAg2wQAAK0HACDcBAAArQcAIN0EAACtBwAg3gQAAK0HACDfBAAArQcAIOAEAACtBwAgENwDAADWBgAw3QMAAIgCABDeAwAA1gYAMN8DAQDiBQAh7QMBAOIFACHwA0AA5AUAIfsDQADkBQAh2AQBAOIFACHZBAEA4gUAIdoEAQD2BQAh2wQBAPYFACHcBAEA9gUAId0EQAD4BQAh3gRAAPgFACHfBAEA9gUAIeAEAQD2BQAhAwAAAAcAIAEAAIcCADA1AACIAgAgAwAAAAcAIAEAAAgAMAIAAAkAIAncAwAA1QYAMN0DAACOAgAQ3gMAANUGADDtAwEAAAAB8ANAAO8FACH7A0AA7wUAIb0EQADvBQAh1gQBAO0FACHXBAEA7QUAIQEAAACLAgAgAQAAAIsCACAJ3AMAANUGADDdAwAAjgIAEN4DAADVBgAw7QMBAO0FACHwA0AA7wUAIfsDQADvBQAhvQRAAO8FACHWBAEA7QUAIdcEAQDtBQAhAAMAAACOAgAgAQAAjwIAMAIAAIsCACADAAAAjgIAIAEAAI8CADACAACLAgAgAwAAAI4CACABAACPAgAwAgAAiwIAIAbtAwEAAAAB8ANAAAAAAfsDQAAAAAG9BEAAAAAB1gQBAAAAAdcEAQAAAAEBKQAAkwIAIAbtAwEAAAAB8ANAAAAAAfsDQAAAAAG9BEAAAAAB1gQBAAAAAdcEAQAAAAEBKQAAlQIAMAEpAACVAgAwBu0DAQCnBwAh8ANAAKkHACH7A0AAqQcAIb0EQACpBwAh1gQBAKcHACHXBAEApwcAIQIAAACLAgAgKQAAmAIAIAbtAwEApwcAIfADQACpBwAh-wNAAKkHACG9BEAAqQcAIdYEAQCnBwAh1wQBAKcHACECAAAAjgIAICkAAJoCACACAAAAjgIAICkAAJoCACADAAAAiwIAIDAAAJMCACAxAACYAgAgAQAAAIsCACABAAAAjgIAIAMKAACaCgAgNgAAnAoAIDcAAJsKACAJ3AMAANQGADDdAwAAoQIAEN4DAADUBgAw7QMBAOIFACHwA0AA5AUAIfsDQADkBQAhvQRAAOQFACHWBAEA4gUAIdcEAQDiBQAhAwAAAI4CACABAACgAgAwNQAAoQIAIAMAAACOAgAgAQAAjwIAMAIAAIsCACABAAAAOQAgAQAAADkAIAMAAAA3ACABAAA4ADACAAA5ACADAAAANwAgAQAAOAAwAgAAOQAgAwAAADcAIAEAADgAMAIAADkAIAgRAACZCgAgFwAAhQgAIO0DAQAAAAHuAwEAAAAB9QMAAADWBAL7A0AAAAABxQRAAAAAAcYEQAAAAAEBKQAAqQIAIAbtAwEAAAAB7gMBAAAAAfUDAAAA1gQC-wNAAAAAAcUEQAAAAAHGBEAAAAABASkAAKsCADABKQAAqwIAMAgRAACYCgAgFwAA9gcAIO0DAQCnBwAh7gMBAKcHACH1AwAA9AfWBCL7A0AAqQcAIcUEQAC2BwAhxgRAALYHACECAAAAOQAgKQAArgIAIAbtAwEApwcAIe4DAQCnBwAh9QMAAPQH1gQi-wNAAKkHACHFBEAAtgcAIcYEQAC2BwAhAgAAADcAICkAALACACACAAAANwAgKQAAsAIAIAMAAAA5ACAwAACpAgAgMQAArgIAIAEAAAA5ACABAAAANwAgBQoAAJUKACA2AACXCgAgNwAAlgoAIMUEAACtBwAgxgQAAK0HACAJ3AMAANAGADDdAwAAtwIAEN4DAADQBgAw7QMBAOIFACHuAwEA4gUAIfUDAADRBtYEIvsDQADkBQAhxQRAAPgFACHGBEAA-AUAIQMAAAA3ACABAAC2AgAwNQAAtwIAIAMAAAA3ACABAAA4ADACAAA5ACABAAAAPQAgAQAAAD0AIAMAAAA7ACABAAA8ADACAAA9ACADAAAAOwAgAQAAPAAwAgAAPQAgAwAAADsAIAEAADwAMAIAAD0AIAcWAACUCgAg3wMBAAAAAe0DAQAAAAHRBAEAAAAB0gQAAACXBALTBEAAAAAB1ARAAAAAAQEpAAC_AgAgBt8DAQAAAAHtAwEAAAAB0QQBAAAAAdIEAAAAlwQC0wRAAAAAAdQEQAAAAAEBKQAAwQIAMAEpAADBAgAwBxYAAJMKACDfAwEApwcAIe0DAQCnBwAh0QQBAKcHACHSBAAAgQiXBCLTBEAAtgcAIdQEQAC2BwAhAgAAAD0AICkAAMQCACAG3wMBAKcHACHtAwEApwcAIdEEAQCnBwAh0gQAAIEIlwQi0wRAALYHACHUBEAAtgcAIQIAAAA7ACApAADGAgAgAgAAADsAICkAAMYCACADAAAAPQAgMAAAvwIAIDEAAMQCACABAAAAPQAgAQAAADsAIAUKAACQCgAgNgAAkgoAIDcAAJEKACDTBAAArQcAINQEAACtBwAgCdwDAADPBgAw3QMAAM0CABDeAwAAzwYAMN8DAQDiBQAh7QMBAOIFACHRBAEA4gUAIdIEAACgBpcEItMEQAD4BQAh1ARAAPgFACEDAAAAOwAgAQAAzAIAMDUAAM0CACADAAAAOwAgAQAAPAAwAgAAPQAgAQAAACkAIAEAAAApACADAAAAJwAgAQAAKAAwAgAAKQAgAwAAACcAIAEAACgAMAIAACkAIAMAAAAnACABAAAoADACAAApACALBgAAqwgAIA0AAKwIACAOAACMCQAgFQAArQgAIBgAAK4IACDtAwEAAAAB8ANAAAAAAfgDAQAAAAH5AwEAAAAB-gMBAAAAAfsDQAAAAAEBKQAA1QIAIAbtAwEAAAAB8ANAAAAAAfgDAQAAAAH5AwEAAAAB-gMBAAAAAfsDQAAAAAEBKQAA1wIAMAEpAADXAgAwAQAAAA0AIAsGAADmBwAgDQAA5wcAIA4AAIoJACAVAADoBwAgGAAA6QcAIO0DAQCnBwAh8ANAAKkHACH4AwEApwcAIfkDAQCnBwAh-gMBALQHACH7A0AAqQcAIQIAAAApACApAADbAgAgBu0DAQCnBwAh8ANAAKkHACH4AwEApwcAIfkDAQCnBwAh-gMBALQHACH7A0AAqQcAIQIAAAAnACApAADdAgAgAgAAACcAICkAAN0CACABAAAADQAgAwAAACkAIDAAANUCACAxAADbAgAgAQAAACkAIAEAAAAnACAECgAAjQoAIDYAAI8KACA3AACOCgAg-gMAAK0HACAJ3AMAAM4GADDdAwAA5QIAEN4DAADOBgAw7QMBAOIFACHwA0AA5AUAIfgDAQD0BQAh-QMBAPQFACH6AwEA-QUAIfsDQADkBQAhAwAAACcAIAEAAOQCADA1AADlAgAgAwAAACcAIAEAACgAMAIAACkAIBIDAADKBgAgDAAAywYAIA8AAMwGACAZAADNBgAg3AMAAMkGADDdAwAACwAQ3gMAAMkGADDfAwEAAAAB7QMBAAAAAfADQADvBQAh-wNAAO8FACH-AyAA7gUAIf8DQACIBgAhpQQBAO0FACGmBAEAAAABpwQBAJoGACGsBAEAmgYAIdAEAQCaBgAhAQAAAOgCACABAAAA6AIAIAgDAACJCgAgDAAAigoAIA8AAIsKACAZAACMCgAg_wMAAK0HACCnBAAArQcAIKwEAACtBwAg0AQAAK0HACADAAAACwAgAQAA6wIAMAIAAOgCACADAAAACwAgAQAA6wIAMAIAAOgCACADAAAACwAgAQAA6wIAMAIAAOgCACAPAwAAhQoAIAwAAIYKACAPAACHCgAgGQAAiAoAIN8DAQAAAAHtAwEAAAAB8ANAAAAAAfsDQAAAAAH-AyAAAAAB_wNAAAAAAaUEAQAAAAGmBAEAAAABpwQBAAAAAawEAQAAAAHQBAEAAAABASkAAO8CACAL3wMBAAAAAe0DAQAAAAHwA0AAAAAB-wNAAAAAAf4DIAAAAAH_A0AAAAABpQQBAAAAAaYEAQAAAAGnBAEAAAABrAQBAAAAAdAEAQAAAAEBKQAA8QIAMAEpAADxAgAwDwMAAOYJACAMAADnCQAgDwAA6AkAIBkAAOkJACDfAwEApwcAIe0DAQCnBwAh8ANAAKkHACH7A0AAqQcAIf4DIACoBwAh_wNAALYHACGlBAEApwcAIaYEAQCnBwAhpwQBALQHACGsBAEAtAcAIdAEAQC0BwAhAgAAAOgCACApAAD0AgAgC98DAQCnBwAh7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIaUEAQCnBwAhpgQBAKcHACGnBAEAtAcAIawEAQC0BwAh0AQBALQHACECAAAACwAgKQAA9gIAIAIAAAALACApAAD2AgAgAwAAAOgCACAwAADvAgAgMQAA9AIAIAEAAADoAgAgAQAAAAsAIAcKAADjCQAgNgAA5QkAIDcAAOQJACD_AwAArQcAIKcEAACtBwAgrAQAAK0HACDQBAAArQcAIA7cAwAAyAYAMN0DAAD9AgAQ3gMAAMgGADDfAwEA4gUAIe0DAQD0BQAh8ANAAOQFACH7A0AA5AUAIf4DIADjBQAh_wNAAPgFACGlBAEA4gUAIaYEAQDiBQAhpwQBAPYFACGsBAEA9gUAIdAEAQD2BQAhAwAAAAsAIAEAAPwCADA1AAD9AgAgAwAAAAsAIAEAAOsCADACAADoAgAgAQAAAA8AIAEAAAAPACADAAAADQAgAQAADgAwAgAADwAgAwAAAA0AIAEAAA4AMAIAAA8AIAMAAAANACABAAAOADACAAAPACAZBgAAuwgAIA0AAL8IACAZAAC-CAAgHAAArAkAIB0AALwIACAeAAC9CAAg7QMBAAAAAfADQAAAAAH1AwAAAMMEAvgDAQAAAAH5AwEAAAAB-wNAAAAAAcEEAQAAAAHDBAAAAIUEAsQEQAAAAAHFBEAAAAABxgRAAAAAAccEQAAAAAHIBAEAAAABygQAAADKBAPLBEAAAAABzAQBAAAAAc0EAAAAygQDzgQBAAAAAc8EAQAAAAEBKQAAhQMAIBPtAwEAAAAB8ANAAAAAAfUDAAAAwwQC-AMBAAAAAfkDAQAAAAH7A0AAAAABwQQBAAAAAcMEAAAAhQQCxARAAAAAAcUEQAAAAAHGBEAAAAABxwRAAAAAAcgEAQAAAAHKBAAAAMoEA8sEQAAAAAHMBAEAAAABzQQAAADKBAPOBAEAAAABzwQBAAAAAQEpAACHAwAwASkAAIcDADABAAAAEQAgGQYAANYHACANAADaBwAgGQAA2QcAIBwAAKoJACAdAADXBwAgHgAA2AcAIO0DAQCnBwAh8ANAAKkHACH1AwAA0wfDBCL4AwEApwcAIfkDAQC0BwAh-wNAAKkHACHBBAEApwcAIcMEAADUB4UEIsQEQACpBwAhxQRAALYHACHGBEAAtgcAIccEQAC2BwAhyAQBALQHACHKBAAA1QfKBCPLBEAAtgcAIcwEAQC0BwAhzQQAANUHygQjzgQBALQHACHPBAEApwcAIQIAAAAPACApAACLAwAgE-0DAQCnBwAh8ANAAKkHACH1AwAA0wfDBCL4AwEApwcAIfkDAQC0BwAh-wNAAKkHACHBBAEApwcAIcMEAADUB4UEIsQEQACpBwAhxQRAALYHACHGBEAAtgcAIccEQAC2BwAhyAQBALQHACHKBAAA1QfKBCPLBEAAtgcAIcwEAQC0BwAhzQQAANUHygQjzgQBALQHACHPBAEApwcAIQIAAAANACApAACNAwAgAgAAAA0AICkAAI0DACABAAAAEQAgAwAAAA8AIDAAAIUDACAxAACLAwAgAQAAAA8AIAEAAAANACANCgAA4AkAIDYAAOIJACA3AADhCQAg-QMAAK0HACDFBAAArQcAIMYEAACtBwAgxwQAAK0HACDIBAAArQcAIMoEAACtBwAgywQAAK0HACDMBAAArQcAIM0EAACtBwAgzgQAAK0HACAW3AMAAMEGADDdAwAAlQMAEN4DAADBBgAw7QMBAPQFACHwA0AA5AUAIfUDAADCBsMEIvgDAQD0BQAh-QMBAPkFACH7A0AA5AUAIcEEAQD0BQAhwwQAAI0GhQQixARAAOQFACHFBEAA-AUAIcYEQAD4BQAhxwRAAPgFACHIBAEA9gUAIcoEAADDBsoEI8sEQAD4BQAhzAQBAPYFACHNBAAAwwbKBCPOBAEA9gUAIc8EAQD0BQAhAwAAAA0AIAEAAJQDADA1AACVAwAgAwAAAA0AIAEAAA4AMAIAAA8AIBLcAwAAvQYAMN0DAACbAwAQ3gMAAL0GADDtAwEAAAAB8ANAAO8FACH7A0AA7wUAIf4DIADuBQAh_wNAAIgGACGbBAEAmgYAIbcEAQAAAAG5BAAAvga5BCK6BAgAlwYAIbsECACZBgAhvAQIAJkGACG9BEAAiAYAIb4EAgC_BgAhvwQCAMAGACHABCAA7gUAIQEAAACYAwAgAQAAAJgDACAS3AMAAL0GADDdAwAAmwMAEN4DAAC9BgAw7QMBAIcGACHwA0AA7wUAIfsDQADvBQAh_gMgAO4FACH_A0AAiAYAIZsEAQCaBgAhtwQBAO0FACG5BAAAvga5BCK6BAgAlwYAIbsECACZBgAhvAQIAJkGACG9BEAAiAYAIb4EAgC_BgAhvwQCAMAGACHABCAA7gUAIQb_AwAArQcAIJsEAACtBwAguwQAAK0HACC8BAAArQcAIL0EAACtBwAgvgQAAK0HACADAAAAmwMAIAEAAJwDADACAACYAwAgAwAAAJsDACABAACcAwAwAgAAmAMAIAMAAACbAwAgAQAAnAMAMAIAAJgDACAP7QMBAAAAAfADQAAAAAH7A0AAAAAB_gMgAAAAAf8DQAAAAAGbBAEAAAABtwQBAAAAAbkEAAAAuQQCugQIAAAAAbsECAAAAAG8BAgAAAABvQRAAAAAAb4EAgAAAAG_BAIAAAABwAQgAAAAAQEpAACgAwAgD-0DAQAAAAHwA0AAAAAB-wNAAAAAAf4DIAAAAAH_A0AAAAABmwQBAAAAAbcEAQAAAAG5BAAAALkEAroECAAAAAG7BAgAAAABvAQIAAAAAb0EQAAAAAG-BAIAAAABvwQCAAAAAcAEIAAAAAEBKQAAogMAMAEpAACiAwAwD-0DAQCnBwAh8ANAAKkHACH7A0AAqQcAIf4DIACoBwAh_wNAALYHACGbBAEAtAcAIbcEAQCnBwAhuQQAAN8JuQQiugQIALkIACG7BAgAuggAIbwECAC6CAAhvQRAALYHACG-BAIA6wgAIb8EAgCzBwAhwAQgAKgHACECAAAAmAMAICkAAKUDACAP7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIZsEAQC0BwAhtwQBAKcHACG5BAAA3wm5BCK6BAgAuQgAIbsECAC6CAAhvAQIALoIACG9BEAAtgcAIb4EAgDrCAAhvwQCALMHACHABCAAqAcAIQIAAACbAwAgKQAApwMAIAIAAACbAwAgKQAApwMAIAMAAACYAwAgMAAAoAMAIDEAAKUDACABAAAAmAMAIAEAAACbAwAgCwoAANoJACA2AADdCQAgNwAA3AkAIFgAANsJACBZAADeCQAg_wMAAK0HACCbBAAArQcAILsEAACtBwAgvAQAAK0HACC9BAAArQcAIL4EAACtBwAgEtwDAAC5BgAw3QMAAK4DABDeAwAAuQYAMO0DAQD0BQAh8ANAAOQFACH7A0AA5AUAIf4DIADjBQAh_wNAAPgFACGbBAEA9gUAIbcEAQDiBQAhuQQAALoGuQQiugQIAIwGACG7BAgAjgYAIbwECACOBgAhvQRAAPgFACG-BAIAswYAIb8EAgD1BQAhwAQgAOMFACEDAAAAmwMAIAEAAK0DADA1AACuAwAgAwAAAJsDACABAACcAwAwAgAAmAMAIAEAAAATACABAAAAEwAgAwAAABEAIAEAABIAMAIAABMAIAMAAAARACABAAASADACAAATACADAAAAEQAgAQAAEgAwAgAAEwAgGAMAALkJACAIAADZCQAgCwAAugkAIAwAALsJACAPAAC8CQAgEAAAvQkAIBkAAL4JACDfAwEAAAAB7QMBAAAAAfADQAAAAAH7A0AAAAAB_gMgAAAAAf8DQAAAAAGkBAEAAAABpQQBAAAAAaYEAQAAAAGnBAEAAAABqAQBAAAAAakEAQAAAAGqBAIAAAABqwQCAAAAAawEAQAAAAG1BCAAAAABtgQgAAAAAQEpAAC2AwAgEd8DAQAAAAHtAwEAAAAB8ANAAAAAAfsDQAAAAAH-AyAAAAAB_wNAAAAAAaQEAQAAAAGlBAEAAAABpgQBAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAgAAAAGrBAIAAAABrAQBAAAAAbUEIAAAAAG2BCAAAAABASkAALgDADABKQAAuAMAMBgDAAD8CAAgCAAA2AkAIAsAAP0IACAMAAD-CAAgDwAA_wgAIBAAAIAJACAZAACBCQAg3wMBAKcHACHtAwEApwcAIfADQACpBwAh-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhpAQBAKcHACGlBAEApwcAIaYEAQCnBwAhpwQBALQHACGoBAEAtAcAIakEAQC0BwAhqgQCALMHACGrBAIAswcAIawEAQC0BwAhtQQgAKgHACG2BCAAqAcAIQIAAAATACApAAC7AwAgEd8DAQCnBwAh7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIaQEAQCnBwAhpQQBAKcHACGmBAEApwcAIacEAQC0BwAhqAQBALQHACGpBAEAtAcAIaoEAgCzBwAhqwQCALMHACGsBAEAtAcAIbUEIACoBwAhtgQgAKgHACECAAAAEQAgKQAAvQMAIAIAAAARACApAAC9AwAgAwAAABMAIDAAALYDACAxAAC7AwAgAQAAABMAIAEAAAARACAKCgAA0wkAIDYAANYJACA3AADVCQAgWAAA1AkAIFkAANcJACD_AwAArQcAIKcEAACtBwAgqAQAAK0HACCpBAAArQcAIKwEAACtBwAgFNwDAAC4BgAw3QMAAMQDABDeAwAAuAYAMN8DAQDiBQAh7QMBAPQFACHwA0AA5AUAIfsDQADkBQAh_gMgAOMFACH_A0AA-AUAIaQEAQD0BQAhpQQBAOIFACGmBAEA4gUAIacEAQD2BQAhqAQBAPYFACGpBAEA9gUAIaoEAgD1BQAhqwQCAPUFACGsBAEA9gUAIbUEIADjBQAhtgQgAOMFACEDAAAAEQAgAQAAwwMAMDUAAMQDACADAAAAEQAgAQAAEgAwAgAAEwAgAQAAABcAIAEAAAAXACADAAAAFQAgAQAAFgAwAgAAFwAgAwAAABUAIAEAABYAMAIAABcAIAMAAAAVACABAAAWADACAAAXACAXAwAA8AgAIAgAANIJACDfAwEAAAAB7QMBAAAAAfADQAAAAAH1AwAAALIEAvsDQAAAAAGkBAEAAAABpQQBAAAAAaYEAQAAAAGnBAEAAAABqAQBAAAAAakEAQAAAAGqBAIAAAABqwQCAAAAAawEAQAAAAGtBAEAAAABrgQBAAAAAa8EAQAAAAGwBAIAAAABsgQBAAAAAbMEAQAAAAG0BEAAAAABASkAAMwDACAV3wMBAAAAAe0DAQAAAAHwA0AAAAAB9QMAAACyBAL7A0AAAAABpAQBAAAAAaUEAQAAAAGmBAEAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQCAAAAAasEAgAAAAGsBAEAAAABrQQBAAAAAa4EAQAAAAGvBAEAAAABsAQCAAAAAbIEAQAAAAGzBAEAAAABtARAAAAAAQEpAADOAwAwASkAAM4DADAXAwAA7ggAIAgAANEJACDfAwEApwcAIe0DAQCnBwAh8ANAAKkHACH1AwAA7AiyBCL7A0AAqQcAIaQEAQCnBwAhpQQBAKcHACGmBAEApwcAIacEAQC0BwAhqAQBALQHACGpBAEAtAcAIaoEAgCzBwAhqwQCALMHACGsBAEAtAcAIa0EAQC0BwAhrgQBALQHACGvBAEAtAcAIbAEAgDrCAAhsgQBALQHACGzBAEAtAcAIbQEQAC2BwAhAgAAABcAICkAANEDACAV3wMBAKcHACHtAwEApwcAIfADQACpBwAh9QMAAOwIsgQi-wNAAKkHACGkBAEApwcAIaUEAQCnBwAhpgQBAKcHACGnBAEAtAcAIagEAQC0BwAhqQQBALQHACGqBAIAswcAIasEAgCzBwAhrAQBALQHACGtBAEAtAcAIa4EAQC0BwAhrwQBALQHACGwBAIA6wgAIbIEAQC0BwAhswQBALQHACG0BEAAtgcAIQIAAAAVACApAADTAwAgAgAAABUAICkAANMDACADAAAAFwAgMAAAzAMAIDEAANEDACABAAAAFwAgAQAAABUAIBAKAADMCQAgNgAAzwkAIDcAAM4JACBYAADNCQAgWQAA0AkAIKcEAACtBwAgqAQAAK0HACCpBAAArQcAIKwEAACtBwAgrQQAAK0HACCuBAAArQcAIK8EAACtBwAgsAQAAK0HACCyBAAArQcAILMEAACtBwAgtAQAAK0HACAY3AMAALIGADDdAwAA2gMAEN4DAACyBgAw3wMBAOIFACHtAwEA9AUAIfADQADkBQAh9QMAALQGsgQi-wNAAOQFACGkBAEA9AUAIaUEAQDiBQAhpgQBAOIFACGnBAEA9gUAIagEAQD2BQAhqQQBAPYFACGqBAIA9QUAIasEAgD1BQAhrAQBAPYFACGtBAEA9gUAIa4EAQD2BQAhrwQBAPYFACGwBAIAswYAIbIEAQD2BQAhswQBAPYFACG0BEAA-AUAIQMAAAAVACABAADZAwAwNQAA2gMAIAMAAAAVACABAAAWADACAAAXACABAAAAHQAgAQAAAB0AIAMAAAAbACABAAAcADACAAAdACADAAAAGwAgAQAAHAAwAgAAHQAgAwAAABsAIAEAABwAMAIAAB0AIA0NAADBCAAgDgAAwggAIBsAALcJACDtAwEAAAAB8ANAAAAAAfkDAQAAAAH6AwEAAAAB-wNAAAAAAf4DIAAAAAH_A0AAAAABoQQBAAAAAaIEIAAAAAGjBCAAAAABASkAAOIDACAK7QMBAAAAAfADQAAAAAH5AwEAAAAB-gMBAAAAAfsDQAAAAAH-AyAAAAAB_wNAAAAAAaEEAQAAAAGiBCAAAAABowQgAAAAAQEpAADkAwAwASkAAOQDADANDQAAzAcAIA4AAM0HACAbAAC1CQAg7QMBAKcHACHwA0AAqQcAIfkDAQCnBwAh-gMBALQHACH7A0AAqQcAIf4DIACoBwAh_wNAALYHACGhBAEApwcAIaIEIACoBwAhowQgAKgHACECAAAAHQAgKQAA5wMAIArtAwEApwcAIfADQACpBwAh-QMBAKcHACH6AwEAtAcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIaEEAQCnBwAhogQgAKgHACGjBCAAqAcAIQIAAAAbACApAADpAwAgAgAAABsAICkAAOkDACADAAAAHQAgMAAA4gMAIDEAAOcDACABAAAAHQAgAQAAABsAIAUKAADJCQAgNgAAywkAIDcAAMoJACD6AwAArQcAIP8DAACtBwAgDdwDAACxBgAw3QMAAPADABDeAwAAsQYAMO0DAQD0BQAh8ANAAOQFACH5AwEA9AUAIfoDAQD5BQAh-wNAAOQFACH-AyAA4wUAIf8DQAD4BQAhoQQBAPQFACGiBCAA4wUAIaMEIADjBQAhAwAAABsAIAEAAO8DADA1AADwAwAgAwAAABsAIAEAABwAMAIAAB0AIAwNAACwBgAg3AMAAK4GADDdAwAAJQAQ3gMAAK4GADDtAwEAAAAB8ANAAO8FACH1AwAArwaeBCL5AwEAAAAB-wNAAO8FACGeBAEAmgYAIZ8EAQCaBgAhoARAAIgGACEBAAAA8wMAIAEAAADzAwAgBA0AAMgJACCeBAAArQcAIJ8EAACtBwAgoAQAAK0HACADAAAAJQAgAQAA9gMAMAIAAPMDACADAAAAJQAgAQAA9gMAMAIAAPMDACADAAAAJQAgAQAA9gMAMAIAAPMDACAJDQAAxwkAIO0DAQAAAAHwA0AAAAAB9QMAAACeBAL5AwEAAAAB-wNAAAAAAZ4EAQAAAAGfBAEAAAABoARAAAAAAQEpAAD6AwAgCO0DAQAAAAHwA0AAAAAB9QMAAACeBAL5AwEAAAAB-wNAAAAAAZ4EAQAAAAGfBAEAAAABoARAAAAAAQEpAAD8AwAwASkAAPwDADAJDQAAxgkAIO0DAQCnBwAh8ANAAKkHACH1AwAAkgmeBCL5AwEApwcAIfsDQACpBwAhngQBALQHACGfBAEAtAcAIaAEQAC2BwAhAgAAAPMDACApAAD_AwAgCO0DAQCnBwAh8ANAAKkHACH1AwAAkgmeBCL5AwEApwcAIfsDQACpBwAhngQBALQHACGfBAEAtAcAIaAEQAC2BwAhAgAAACUAICkAAIEEACACAAAAJQAgKQAAgQQAIAMAAADzAwAgMAAA-gMAIDEAAP8DACABAAAA8wMAIAEAAAAlACAGCgAAwwkAIDYAAMUJACA3AADECQAgngQAAK0HACCfBAAArQcAIKAEAACtBwAgC9wDAACqBgAw3QMAAIgEABDeAwAAqgYAMO0DAQD0BQAh8ANAAOQFACH1AwAAqwaeBCL5AwEA9AUAIfsDQADkBQAhngQBAPYFACGfBAEA9gUAIaAEQAD4BQAhAwAAACUAIAEAAIcEADA1AACIBAAgAwAAACUAIAEAAPYDADACAADzAwAgDQcAAKgGACAJAACpBgAg3AMAAKcGADDdAwAAjgQAEN4DAACnBgAw7QMBAAAAAfADQADvBQAh-wNAAO8FACH-AyAA7gUAIf8DQACIBgAhmgQBAAAAAZsEAQCaBgAhnAQBAJoGACEBAAAAiwQAIAEAAACLBAAgDQcAAKgGACAJAACpBgAg3AMAAKcGADDdAwAAjgQAEN4DAACnBgAw7QMBAIcGACHwA0AA7wUAIfsDQADvBQAh_gMgAO4FACH_A0AAiAYAIZoEAQDtBQAhmwQBAJoGACGcBAEAmgYAIQUHAADBCQAgCQAAwgkAIP8DAACtBwAgmwQAAK0HACCcBAAArQcAIAMAAACOBAAgAQAAjwQAMAIAAIsEACADAAAAjgQAIAEAAI8EADACAACLBAAgAwAAAI4EACABAACPBAAwAgAAiwQAIAoHAAC_CQAgCQAAwAkAIO0DAQAAAAHwA0AAAAAB-wNAAAAAAf4DIAAAAAH_A0AAAAABmgQBAAAAAZsEAQAAAAGcBAEAAAABASkAAJMEACAI7QMBAAAAAfADQAAAAAH7A0AAAAAB_gMgAAAAAf8DQAAAAAGaBAEAAAABmwQBAAAAAZwEAQAAAAEBKQAAlQQAMAEpAACVBAAwCgcAAN8IACAJAADgCAAg7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIZoEAQCnBwAhmwQBALQHACGcBAEAtAcAIQIAAACLBAAgKQAAmAQAIAjtAwEApwcAIfADQACpBwAh-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhmgQBAKcHACGbBAEAtAcAIZwEAQC0BwAhAgAAAI4EACApAACaBAAgAgAAAI4EACApAACaBAAgAwAAAIsEACAwAACTBAAgMQAAmAQAIAEAAACLBAAgAQAAAI4EACAGCgAA3AgAIDYAAN4IACA3AADdCAAg_wMAAK0HACCbBAAArQcAIJwEAACtBwAgC9wDAACmBgAw3QMAAKEEABDeAwAApgYAMO0DAQD0BQAh8ANAAOQFACH7A0AA5AUAIf4DIADjBQAh_wNAAPgFACGaBAEA4gUAIZsEAQD2BQAhnAQBAPYFACEDAAAAjgQAIAEAAKAEADA1AAChBAAgAwAAAI4EACABAACPBAAwAgAAiwQAIAEAAAAuACABAAAALgAgAwAAACwAIAEAAC0AMAIAAC4AIAMAAAAsACABAAAtADACAAAuACADAAAALAAgAQAALQAwAgAALgAgChEAANsIACATAACoCAAgFAAAqQgAIO0DAQAAAAHuAwEAAAAB-wNAAAAAAZEEAAAAmQQClQQBAAAAAZcEAAAAlwQCmQQBAAAAAQEpAACpBAAgB-0DAQAAAAHuAwEAAAAB-wNAAAAAAZEEAAAAmQQClQQBAAAAAZcEAAAAlwQCmQQBAAAAAQEpAACrBAAwASkAAKsEADAKEQAA2ggAIBMAAJIIACAUAACTCAAg7QMBAKcHACHuAwEApwcAIfsDQACpBwAhkQQAAJAImQQilQQBAKcHACGXBAAAgQiXBCKZBAEAtAcAIQIAAAAuACApAACuBAAgB-0DAQCnBwAh7gMBAKcHACH7A0AAqQcAIZEEAACQCJkEIpUEAQCnBwAhlwQAAIEIlwQimQQBALQHACECAAAALAAgKQAAsAQAIAIAAAAsACApAACwBAAgAwAAAC4AIDAAAKkEACAxAACuBAAgAQAAAC4AIAEAAAAsACAECgAA1wgAIDYAANkIACA3AADYCAAgmQQAAK0HACAK3AMAAJ8GADDdAwAAtwQAEN4DAACfBgAw7QMBAOIFACHuAwEA4gUAIfsDQADkBQAhkQQAAKEGmQQilQQBAOIFACGXBAAAoAaXBCKZBAEA9gUAIQMAAAAsACABAAC2BAAwNQAAtwQAIAMAAAAsACABAAAtADACAAAuACABAAAANAAgAQAAADQAIAMAAAAyACABAAAzADACAAA0ACADAAAAMgAgAQAAMwAwAgAANAAgAwAAADIAIAEAADMAMAIAADQAIAcDAAChCAAgEgAA1ggAIN8DAQAAAAHtAwEAAAAB-wNAAAAAAZMEAQAAAAGUBAEAAAABASkAAL8EACAF3wMBAAAAAe0DAQAAAAH7A0AAAAABkwQBAAAAAZQEAQAAAAEBKQAAwQQAMAEpAADBBAAwBwMAAJ8IACASAADVCAAg3wMBAKcHACHtAwEApwcAIfsDQACpBwAhkwQBAKcHACGUBAEApwcAIQIAAAA0ACApAADEBAAgBd8DAQCnBwAh7QMBAKcHACH7A0AAqQcAIZMEAQCnBwAhlAQBAKcHACECAAAAMgAgKQAAxgQAIAIAAAAyACApAADGBAAgAwAAADQAIDAAAL8EACAxAADEBAAgAQAAADQAIAEAAAAyACADCgAA0ggAIDYAANQIACA3AADTCAAgCNwDAACeBgAw3QMAAM0EABDeAwAAngYAMN8DAQDiBQAh7QMBAOIFACH7A0AA5AUAIZMEAQDiBQAhlAQBAOIFACEDAAAAMgAgAQAAzAQAMDUAAM0EACADAAAAMgAgAQAAMwAwAgAANAAgAQAAAFkAIAEAAABZACADAAAAVwAgAQAAWAAwAgAAWQAgAwAAAFcAIAEAAFgAMAIAAFkAIAMAAABXACABAABYADACAABZACAHAwAA0QgAIBIBAAAAAd8DAQAAAAHtAwEAAAAB-wNAAAAAAZEEAQAAAAGSBCAAAAABASkAANUEACAGEgEAAAAB3wMBAAAAAe0DAQAAAAH7A0AAAAABkQQBAAAAAZIEIAAAAAEBKQAA1wQAMAEpAADXBAAwBwMAANAIACASAQCnBwAh3wMBAKcHACHtAwEApwcAIfsDQACpBwAhkQQBAKcHACGSBCAAqAcAIQIAAABZACApAADaBAAgBhIBAKcHACHfAwEApwcAIe0DAQCnBwAh-wNAAKkHACGRBAEApwcAIZIEIACoBwAhAgAAAFcAICkAANwEACACAAAAVwAgKQAA3AQAIAMAAABZACAwAADVBAAgMQAA2gQAIAEAAABZACABAAAAVwAgAwoAAM0IACA2AADPCAAgNwAAzggAIAkSAQDiBQAh3AMAAJ0GADDdAwAA4wQAEN4DAACdBgAw3wMBAOIFACHtAwEA4gUAIfsDQADkBQAhkQQBAOIFACGSBCAA4wUAIQMAAABXACABAADiBAAwNQAA4wQAIAMAAABXACABAABYADACAABZACAQDgAAnAYAINwDAACWBgAw3QMAAEkAEN4DAACWBgAw7QMBAAAAAfADQADvBQAh9QMAAJgGhQQi-gMBAAAAAfsDQADvBQAhgwQIAJcGACGFBAgAmQYAIYYECACZBgAhhwQBAJoGACGIBAEAAAABiQQBAAAAAYoEAACbBgAgAQAAAOYEACABAAAA5gQAIAYOAADMCAAghQQAAK0HACCGBAAArQcAIIcEAACtBwAgiQQAAK0HACCKBAAArQcAIAMAAABJACABAADpBAAwAgAA5gQAIAMAAABJACABAADpBAAwAgAA5gQAIAMAAABJACABAADpBAAwAgAA5gQAIA0OAADLCAAg7QMBAAAAAfADQAAAAAH1AwAAAIUEAvoDAQAAAAH7A0AAAAABgwQIAAAAAYUECAAAAAGGBAgAAAABhwQBAAAAAYgEAQAAAAGJBAEAAAABigSAAAAAAQEpAADtBAAgDO0DAQAAAAHwA0AAAAAB9QMAAACFBAL6AwEAAAAB-wNAAAAAAYMECAAAAAGFBAgAAAABhgQIAAAAAYcEAQAAAAGIBAEAAAABiQQBAAAAAYoEgAAAAAEBKQAA7wQAMAEpAADvBAAwDQ4AAMoIACDtAwEApwcAIfADQACpBwAh9QMAANQHhQQi-gMBAKcHACH7A0AAqQcAIYMECAC5CAAhhQQIALoIACGGBAgAuggAIYcEAQC0BwAhiAQBAKcHACGJBAEAtAcAIYoEgAAAAAECAAAA5gQAICkAAPIEACAM7QMBAKcHACHwA0AAqQcAIfUDAADUB4UEIvoDAQCnBwAh-wNAAKkHACGDBAgAuQgAIYUECAC6CAAhhgQIALoIACGHBAEAtAcAIYgEAQCnBwAhiQQBALQHACGKBIAAAAABAgAAAEkAICkAAPQEACACAAAASQAgKQAA9AQAIAMAAADmBAAgMAAA7QQAIDEAAPIEACABAAAA5gQAIAEAAABJACAKCgAAxQgAIDYAAMgIACA3AADHCAAgWAAAxggAIFkAAMkIACCFBAAArQcAIIYEAACtBwAghwQAAK0HACCJBAAArQcAIIoEAACtBwAgD9wDAACLBgAw3QMAAPsEABDeAwAAiwYAMO0DAQD0BQAh8ANAAOQFACH1AwAAjQaFBCL6AwEA9AUAIfsDQADkBQAhgwQIAIwGACGFBAgAjgYAIYYECACOBgAhhwQBAPYFACGIBAEA4gUAIYkEAQD2BQAhigQAAI8GACADAAAASQAgAQAA-gQAMDUAAPsEACADAAAASQAgAQAA6QQAMAIAAOYEACALGgAAiQYAINwDAACGBgAw3QMAAIEFABDeAwAAhgYAMO0DAQAAAAHwA0AA7wUAIfsDQADvBQAh_ANAAO8FACH9A0AA7wUAIf4DIADuBQAh_wNAAIgGACEBAAAA_gQAIAEAAAD-BAAgCxoAAIkGACDcAwAAhgYAMN0DAACBBQAQ3gMAAIYGADDtAwEAhwYAIfADQADvBQAh-wNAAO8FACH8A0AA7wUAIf0DQADvBQAh_gMgAO4FACH_A0AAiAYAIQIaAADECAAg_wMAAK0HACADAAAAgQUAIAEAAIIFADACAAD-BAAgAwAAAIEFACABAACCBQAwAgAA_gQAIAMAAACBBQAgAQAAggUAMAIAAP4EACAIGgAAwwgAIO0DAQAAAAHwA0AAAAAB-wNAAAAAAfwDQAAAAAH9A0AAAAAB_gMgAAAAAf8DQAAAAAEBKQAAhgUAIAftAwEAAAAB8ANAAAAAAfsDQAAAAAH8A0AAAAAB_QNAAAAAAf4DIAAAAAH_A0AAAAABASkAAIgFADABKQAAiAUAMAgaAADABwAg7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_ANAAKkHACH9A0AAqQcAIf4DIACoBwAh_wNAALYHACECAAAA_gQAICkAAIsFACAH7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_ANAAKkHACH9A0AAqQcAIf4DIACoBwAh_wNAALYHACECAAAAgQUAICkAAI0FACACAAAAgQUAICkAAI0FACADAAAA_gQAIDAAAIYFACAxAACLBQAgAQAAAP4EACABAAAAgQUAIAQKAAC9BwAgNgAAvwcAIDcAAL4HACD_AwAArQcAIArcAwAAhQYAMN0DAACUBQAQ3gMAAIUGADDtAwEA9AUAIfADQADkBQAh-wNAAOQFACH8A0AA5AUAIf0DQADkBQAh_gMgAOMFACH_A0AA-AUAIQMAAACBBQAgAQAAkwUAMDUAAJQFACADAAAAgQUAIAEAAIIFADACAAD-BAAgAQAAACIAIAEAAAAiACADAAAAIAAgAQAAIQAwAgAAIgAgAwAAACAAIAEAACEAMAIAACIAIAMAAAAgACABAAAhADACAAAiACAOBgAAugcAIA0AALsHACAOAAC8BwAg7QMBAAAAAfADQAAAAAHyAwIAAAAB8wMBAAAAAfUDAAAA9QMC9gMBAAAAAfcDQAAAAAH4AwEAAAAB-QMBAAAAAfoDAQAAAAH7A0AAAAABASkAAJwFACAL7QMBAAAAAfADQAAAAAHyAwIAAAAB8wMBAAAAAfUDAAAA9QMC9gMBAAAAAfcDQAAAAAH4AwEAAAAB-QMBAAAAAfoDAQAAAAH7A0AAAAABASkAAJ4FADABKQAAngUAMAEAAAANACAOBgAAtwcAIA0AALgHACAOAAC5BwAg7QMBAKcHACHwA0AAqQcAIfIDAgCzBwAh8wMBALQHACH1AwAAtQf1AyL2AwEAtAcAIfcDQAC2BwAh-AMBAKcHACH5AwEApwcAIfoDAQC0BwAh-wNAAKkHACECAAAAIgAgKQAAogUAIAvtAwEApwcAIfADQACpBwAh8gMCALMHACHzAwEAtAcAIfUDAAC1B_UDIvYDAQC0BwAh9wNAALYHACH4AwEApwcAIfkDAQCnBwAh-gMBALQHACH7A0AAqQcAIQIAAAAgACApAACkBQAgAgAAACAAICkAAKQFACABAAAADQAgAwAAACIAIDAAAJwFACAxAACiBQAgAQAAACIAIAEAAAAgACAJCgAArgcAIDYAALEHACA3AACwBwAgWAAArwcAIFkAALIHACDzAwAArQcAIPYDAACtBwAg9wMAAK0HACD6AwAArQcAIA7cAwAA8wUAMN0DAACsBQAQ3gMAAPMFADDtAwEA9AUAIfADQADkBQAh8gMCAPUFACHzAwEA9gUAIfUDAAD3BfUDIvYDAQD2BQAh9wNAAPgFACH4AwEA9AUAIfkDAQD0BQAh-gMBAPkFACH7A0AA5AUAIQMAAAAgACABAACrBQAwNQAArAUAIAMAAAAgACABAAAhADACAAAiACAJ3AMAAPEFADDdAwAAsgUAEN4DAADxBQAw3wMBAO0FACHtAwEAAAAB7gMBAO0FACHvAyAA7gUAIfADQADvBQAh8QMAAPIFACABAAAArwUAIAEAAACvBQAgCNwDAADxBQAw3QMAALIFABDeAwAA8QUAMN8DAQDtBQAh7QMBAO0FACHuAwEA7QUAIe8DIADuBQAh8ANAAO8FACEAAwAAALIFACABAACzBQAwAgAArwUAIAMAAACyBQAgAQAAswUAMAIAAK8FACADAAAAsgUAIAEAALMFADACAACvBQAgBd8DAQAAAAHtAwEAAAAB7gMBAAAAAe8DIAAAAAHwA0AAAAABASkAALcFACAF3wMBAAAAAe0DAQAAAAHuAwEAAAAB7wMgAAAAAfADQAAAAAEBKQAAuQUAMAEpAAC5BQAwBd8DAQCnBwAh7QMBAKcHACHuAwEApwcAIe8DIACoBwAh8ANAAKkHACECAAAArwUAICkAALwFACAF3wMBAKcHACHtAwEApwcAIe4DAQCnBwAh7wMgAKgHACHwA0AAqQcAIQIAAACyBQAgKQAAvgUAIAIAAACyBQAgKQAAvgUAIAMAAACvBQAgMAAAtwUAIDEAALwFACABAAAArwUAIAEAAACyBQAgAwoAAKoHACA2AACsBwAgNwAAqwcAIAjcAwAA8AUAMN0DAADFBQAQ3gMAAPAFADDfAwEA4gUAIe0DAQDiBQAh7gMBAOIFACHvAyAA4wUAIfADQADkBQAhAwAAALIFACABAADEBQAwNQAAxQUAIAMAAACyBQAgAQAAswUAMAIAAK8FACAG3AMAAOwFADDdAwAAywUAEN4DAADsBQAw3wMBAAAAAeADIADuBQAh4QNAAO8FACEBAAAAyAUAIAEAAADIBQAgBtwDAADsBQAw3QMAAMsFABDeAwAA7AUAMN8DAQDtBQAh4AMgAO4FACHhA0AA7wUAIQADAAAAywUAIAEAAMwFADACAADIBQAgAwAAAMsFACABAADMBQAwAgAAyAUAIAMAAADLBQAgAQAAzAUAMAIAAMgFACAD3wMBAAAAAeADIAAAAAHhA0AAAAABASkAANAFACAD3wMBAAAAAeADIAAAAAHhA0AAAAABASkAANIFADABKQAA0gUAMAPfAwEApwcAIeADIACoBwAh4QNAAKkHACECAAAAyAUAICkAANUFACAD3wMBAKcHACHgAyAAqAcAIeEDQACpBwAhAgAAAMsFACApAADXBQAgAgAAAMsFACApAADXBQAgAwAAAMgFACAwAADQBQAgMQAA1QUAIAEAAADIBQAgAQAAAMsFACADCgAApAcAIDYAAKYHACA3AAClBwAgBtwDAADhBQAw3QMAAN4FABDeAwAA4QUAMN8DAQDiBQAh4AMgAOMFACHhA0AA5AUAIQMAAADLBQAgAQAA3QUAMDUAAN4FACADAAAAywUAIAEAAMwFADACAADIBQAgBtwDAADhBQAw3QMAAN4FABDeAwAA4QUAMN8DAQDiBQAh4AMgAOMFACHhA0AA5AUAIQ4KAADmBQAgNgAA6wUAIDcAAOsFACDiAwEAAAAB4wMBAAAABOQDAQAAAATlAwEAAAAB5gMBAAAAAecDAQAAAAHoAwEAAAAB6QMBAOoFACHqAwEAAAAB6wMBAAAAAewDAQAAAAEFCgAA5gUAIDYAAOkFACA3AADpBQAg4gMgAAAAAekDIADoBQAhCwoAAOYFACA2AADnBQAgNwAA5wUAIOIDQAAAAAHjA0AAAAAE5ANAAAAABOUDQAAAAAHmA0AAAAAB5wNAAAAAAegDQAAAAAHpA0AA5QUAIQsKAADmBQAgNgAA5wUAIDcAAOcFACDiA0AAAAAB4wNAAAAABOQDQAAAAATlA0AAAAAB5gNAAAAAAecDQAAAAAHoA0AAAAAB6QNAAOUFACEI4gMCAAAAAeMDAgAAAATkAwIAAAAE5QMCAAAAAeYDAgAAAAHnAwIAAAAB6AMCAAAAAekDAgDmBQAhCOIDQAAAAAHjA0AAAAAE5ANAAAAABOUDQAAAAAHmA0AAAAAB5wNAAAAAAegDQAAAAAHpA0AA5wUAIQUKAADmBQAgNgAA6QUAIDcAAOkFACDiAyAAAAAB6QMgAOgFACEC4gMgAAAAAekDIADpBQAhDgoAAOYFACA2AADrBQAgNwAA6wUAIOIDAQAAAAHjAwEAAAAE5AMBAAAABOUDAQAAAAHmAwEAAAAB5wMBAAAAAegDAQAAAAHpAwEA6gUAIeoDAQAAAAHrAwEAAAAB7AMBAAAAAQviAwEAAAAB4wMBAAAABOQDAQAAAATlAwEAAAAB5gMBAAAAAecDAQAAAAHoAwEAAAAB6QMBAOsFACHqAwEAAAAB6wMBAAAAAewDAQAAAAEG3AMAAOwFADDdAwAAywUAEN4DAADsBQAw3wMBAO0FACHgAyAA7gUAIeEDQADvBQAhC-IDAQAAAAHjAwEAAAAE5AMBAAAABOUDAQAAAAHmAwEAAAAB5wMBAAAAAegDAQAAAAHpAwEA6wUAIeoDAQAAAAHrAwEAAAAB7AMBAAAAAQLiAyAAAAAB6QMgAOkFACEI4gNAAAAAAeMDQAAAAATkA0AAAAAE5QNAAAAAAeYDQAAAAAHnA0AAAAAB6ANAAAAAAekDQADnBQAhCNwDAADwBQAw3QMAAMUFABDeAwAA8AUAMN8DAQDiBQAh7QMBAOIFACHuAwEA4gUAIe8DIADjBQAh8ANAAOQFACEI3AMAAPEFADDdAwAAsgUAEN4DAADxBQAw3wMBAO0FACHtAwEA7QUAIe4DAQDtBQAh7wMgAO4FACHwA0AA7wUAIQLfAwEAAAAB7gMBAAAAAQ7cAwAA8wUAMN0DAACsBQAQ3gMAAPMFADDtAwEA9AUAIfADQADkBQAh8gMCAPUFACHzAwEA9gUAIfUDAAD3BfUDIvYDAQD2BQAh9wNAAPgFACH4AwEA9AUAIfkDAQD0BQAh-gMBAPkFACH7A0AA5AUAIQsKAADmBQAgNgAA6wUAIDcAAOsFACDiAwEAAAAB4wMBAAAABOQDAQAAAATlAwEAAAAB5gMBAAAAAecDAQAAAAHoAwEAAAAB6QMBAIQGACENCgAA5gUAIDYAAOYFACA3AADmBQAgWAAAgwYAIFkAAOYFACDiAwIAAAAB4wMCAAAABOQDAgAAAATlAwIAAAAB5gMCAAAAAecDAgAAAAHoAwIAAAAB6QMCAIIGACEOCgAA-wUAIDYAAPwFACA3AAD8BQAg4gMBAAAAAeMDAQAAAAXkAwEAAAAF5QMBAAAAAeYDAQAAAAHnAwEAAAAB6AMBAAAAAekDAQCBBgAh6gMBAAAAAesDAQAAAAHsAwEAAAABBwoAAOYFACA2AACABgAgNwAAgAYAIOIDAAAA9QMC4wMAAAD1AwjkAwAAAPUDCOkDAAD_BfUDIgsKAAD7BQAgNgAA_gUAIDcAAP4FACDiA0AAAAAB4wNAAAAABeQDQAAAAAXlA0AAAAAB5gNAAAAAAecDQAAAAAHoA0AAAAAB6QNAAP0FACELCgAA-wUAIDYAAPwFACA3AAD8BQAg4gMBAAAAAeMDAQAAAAXkAwEAAAAF5QMBAAAAAeYDAQAAAAHnAwEAAAAB6AMBAAAAAekDAQD6BQAhCwoAAPsFACA2AAD8BQAgNwAA_AUAIOIDAQAAAAHjAwEAAAAF5AMBAAAABeUDAQAAAAHmAwEAAAAB5wMBAAAAAegDAQAAAAHpAwEA-gUAIQjiAwIAAAAB4wMCAAAABeQDAgAAAAXlAwIAAAAB5gMCAAAAAecDAgAAAAHoAwIAAAAB6QMCAPsFACEL4gMBAAAAAeMDAQAAAAXkAwEAAAAF5QMBAAAAAeYDAQAAAAHnAwEAAAAB6AMBAAAAAekDAQD8BQAh6gMBAAAAAesDAQAAAAHsAwEAAAABCwoAAPsFACA2AAD-BQAgNwAA_gUAIOIDQAAAAAHjA0AAAAAF5ANAAAAABeUDQAAAAAHmA0AAAAAB5wNAAAAAAegDQAAAAAHpA0AA_QUAIQjiA0AAAAAB4wNAAAAABeQDQAAAAAXlA0AAAAAB5gNAAAAAAecDQAAAAAHoA0AAAAAB6QNAAP4FACEHCgAA5gUAIDYAAIAGACA3AACABgAg4gMAAAD1AwLjAwAAAPUDCOQDAAAA9QMI6QMAAP8F9QMiBOIDAAAA9QMC4wMAAAD1AwjkAwAAAPUDCOkDAACABvUDIg4KAAD7BQAgNgAA_AUAIDcAAPwFACDiAwEAAAAB4wMBAAAABeQDAQAAAAXlAwEAAAAB5gMBAAAAAecDAQAAAAHoAwEAAAAB6QMBAIEGACHqAwEAAAAB6wMBAAAAAewDAQAAAAENCgAA5gUAIDYAAOYFACA3AADmBQAgWAAAgwYAIFkAAOYFACDiAwIAAAAB4wMCAAAABOQDAgAAAATlAwIAAAAB5gMCAAAAAecDAgAAAAHoAwIAAAAB6QMCAIIGACEI4gMIAAAAAeMDCAAAAATkAwgAAAAE5QMIAAAAAeYDCAAAAAHnAwgAAAAB6AMIAAAAAekDCACDBgAhCwoAAOYFACA2AADrBQAgNwAA6wUAIOIDAQAAAAHjAwEAAAAE5AMBAAAABOUDAQAAAAHmAwEAAAAB5wMBAAAAAegDAQAAAAHpAwEAhAYAIQrcAwAAhQYAMN0DAACUBQAQ3gMAAIUGADDtAwEA9AUAIfADQADkBQAh-wNAAOQFACH8A0AA5AUAIf0DQADkBQAh_gMgAOMFACH_A0AA-AUAIQsaAACJBgAg3AMAAIYGADDdAwAAgQUAEN4DAACGBgAw7QMBAIcGACHwA0AA7wUAIfsDQADvBQAh_ANAAO8FACH9A0AA7wUAIf4DIADuBQAh_wNAAIgGACEI4gMBAAAAAeMDAQAAAATkAwEAAAAE5QMBAAAAAeYDAQAAAAHnAwEAAAAB6AMBAAAAAekDAQCKBgAhCOIDQAAAAAHjA0AAAAAF5ANAAAAABeUDQAAAAAHmA0AAAAAB5wNAAAAAAegDQAAAAAHpA0AA_gUAIQOABAAAGwAggQQAABsAIIIEAAAbACAI4gMBAAAAAeMDAQAAAATkAwEAAAAE5QMBAAAAAeYDAQAAAAHnAwEAAAAB6AMBAAAAAekDAQCKBgAhD9wDAACLBgAw3QMAAPsEABDeAwAAiwYAMO0DAQD0BQAh8ANAAOQFACH1AwAAjQaFBCL6AwEA9AUAIfsDQADkBQAhgwQIAIwGACGFBAgAjgYAIYYECACOBgAhhwQBAPYFACGIBAEA4gUAIYkEAQD2BQAhigQAAI8GACANCgAA5gUAIDYAAIMGACA3AACDBgAgWAAAgwYAIFkAAIMGACDiAwgAAAAB4wMIAAAABOQDCAAAAATlAwgAAAAB5gMIAAAAAecDCAAAAAHoAwgAAAAB6QMIAJUGACEHCgAA5gUAIDYAAJQGACA3AACUBgAg4gMAAACFBALjAwAAAIUECOQDAAAAhQQI6QMAAJMGhQQiDQoAAPsFACA2AACSBgAgNwAAkgYAIFgAAJIGACBZAACSBgAg4gMIAAAAAeMDCAAAAAXkAwgAAAAF5QMIAAAAAeYDCAAAAAHnAwgAAAAB6AMIAAAAAekDCACRBgAhDwoAAPsFACA2AACQBgAgNwAAkAYAIOIDgAAAAAHlA4AAAAAB5gOAAAAAAecDgAAAAAHoA4AAAAAB6QOAAAAAAYsEAQAAAAGMBAEAAAABjQQBAAAAAY4EgAAAAAGPBIAAAAABkASAAAAAAQziA4AAAAAB5QOAAAAAAeYDgAAAAAHnA4AAAAAB6AOAAAAAAekDgAAAAAGLBAEAAAABjAQBAAAAAY0EAQAAAAGOBIAAAAABjwSAAAAAAZAEgAAAAAENCgAA-wUAIDYAAJIGACA3AACSBgAgWAAAkgYAIFkAAJIGACDiAwgAAAAB4wMIAAAABeQDCAAAAAXlAwgAAAAB5gMIAAAAAecDCAAAAAHoAwgAAAAB6QMIAJEGACEI4gMIAAAAAeMDCAAAAAXkAwgAAAAF5QMIAAAAAeYDCAAAAAHnAwgAAAAB6AMIAAAAAekDCACSBgAhBwoAAOYFACA2AACUBgAgNwAAlAYAIOIDAAAAhQQC4wMAAACFBAjkAwAAAIUECOkDAACTBoUEIgTiAwAAAIUEAuMDAAAAhQQI5AMAAACFBAjpAwAAlAaFBCINCgAA5gUAIDYAAIMGACA3AACDBgAgWAAAgwYAIFkAAIMGACDiAwgAAAAB4wMIAAAABOQDCAAAAATlAwgAAAAB5gMIAAAAAecDCAAAAAHoAwgAAAAB6QMIAJUGACEQDgAAnAYAINwDAACWBgAw3QMAAEkAEN4DAACWBgAw7QMBAIcGACHwA0AA7wUAIfUDAACYBoUEIvoDAQCHBgAh-wNAAO8FACGDBAgAlwYAIYUECACZBgAhhgQIAJkGACGHBAEAmgYAIYgEAQDtBQAhiQQBAJoGACGKBAAAmwYAIAjiAwgAAAAB4wMIAAAABOQDCAAAAATlAwgAAAAB5gMIAAAAAecDCAAAAAHoAwgAAAAB6QMIAIMGACEE4gMAAACFBALjAwAAAIUECOQDAAAAhQQI6QMAAJQGhQQiCOIDCAAAAAHjAwgAAAAF5AMIAAAABeUDCAAAAAHmAwgAAAAB5wMIAAAAAegDCAAAAAHpAwgAkgYAIQviAwEAAAAB4wMBAAAABeQDAQAAAAXlAwEAAAAB5gMBAAAAAecDAQAAAAHoAwEAAAAB6QMBAPwFACHqAwEAAAAB6wMBAAAAAewDAQAAAAEM4gOAAAAAAeUDgAAAAAHmA4AAAAAB5wOAAAAAAegDgAAAAAHpA4AAAAABiwQBAAAAAYwEAQAAAAGNBAEAAAABjgSAAAAAAY8EgAAAAAGQBIAAAAABHgYAAI4HACANAADlBgAgGQAAzQYAIBwAAJ8HACAdAACgBwAgHgAAoQcAINwDAACcBwAw3QMAAA0AEN4DAACcBwAw7QMBAIcGACHwA0AA7wUAIfUDAACdB8MEIvgDAQCHBgAh-QMBAIwHACH7A0AA7wUAIcEEAQCHBgAhwwQAAJgGhQQixARAAO8FACHFBEAAiAYAIcYEQACIBgAhxwRAAIgGACHIBAEAmgYAIcoEAACeB8oEI8sEQACIBgAhzAQBAJoGACHNBAAAngfKBCPOBAEAmgYAIc8EAQCHBgAh-QQAAA0AIPoEAAANACAJEgEA4gUAIdwDAACdBgAw3QMAAOMEABDeAwAAnQYAMN8DAQDiBQAh7QMBAOIFACH7A0AA5AUAIZEEAQDiBQAhkgQgAOMFACEI3AMAAJ4GADDdAwAAzQQAEN4DAACeBgAw3wMBAOIFACHtAwEA4gUAIfsDQADkBQAhkwQBAOIFACGUBAEA4gUAIQrcAwAAnwYAMN0DAAC3BAAQ3gMAAJ8GADDtAwEA4gUAIe4DAQDiBQAh-wNAAOQFACGRBAAAoQaZBCKVBAEA4gUAIZcEAACgBpcEIpkEAQD2BQAhBwoAAOYFACA2AAClBgAgNwAApQYAIOIDAAAAlwQC4wMAAACXBAjkAwAAAJcECOkDAACkBpcEIgcKAADmBQAgNgAAowYAIDcAAKMGACDiAwAAAJkEAuMDAAAAmQQI5AMAAACZBAjpAwAAogaZBCIHCgAA5gUAIDYAAKMGACA3AACjBgAg4gMAAACZBALjAwAAAJkECOQDAAAAmQQI6QMAAKIGmQQiBOIDAAAAmQQC4wMAAACZBAjkAwAAAJkECOkDAACjBpkEIgcKAADmBQAgNgAApQYAIDcAAKUGACDiAwAAAJcEAuMDAAAAlwQI5AMAAACXBAjpAwAApAaXBCIE4gMAAACXBALjAwAAAJcECOQDAAAAlwQI6QMAAKUGlwQiC9wDAACmBgAw3QMAAKEEABDeAwAApgYAMO0DAQD0BQAh8ANAAOQFACH7A0AA5AUAIf4DIADjBQAh_wNAAPgFACGaBAEA4gUAIZsEAQD2BQAhnAQBAPYFACENBwAAqAYAIAkAAKkGACDcAwAApwYAMN0DAACOBAAQ3gMAAKcGADDtAwEAhwYAIfADQADvBQAh-wNAAO8FACH-AyAA7gUAIf8DQACIBgAhmgQBAO0FACGbBAEAmgYAIZwEAQCaBgAhA4AEAAARACCBBAAAEQAgggQAABEAIAOABAAAFQAggQQAABUAIIIEAAAVACAL3AMAAKoGADDdAwAAiAQAEN4DAACqBgAw7QMBAPQFACHwA0AA5AUAIfUDAACrBp4EIvkDAQD0BQAh-wNAAOQFACGeBAEA9gUAIZ8EAQD2BQAhoARAAPgFACEHCgAA5gUAIDYAAK0GACA3AACtBgAg4gMAAACeBALjAwAAAJ4ECOQDAAAAngQI6QMAAKwGngQiBwoAAOYFACA2AACtBgAgNwAArQYAIOIDAAAAngQC4wMAAACeBAjkAwAAAJ4ECOkDAACsBp4EIgTiAwAAAJ4EAuMDAAAAngQI5AMAAACeBAjpAwAArQaeBCIMDQAAsAYAINwDAACuBgAw3QMAACUAEN4DAACuBgAw7QMBAIcGACHwA0AA7wUAIfUDAACvBp4EIvkDAQCHBgAh-wNAAO8FACGeBAEAmgYAIZ8EAQCaBgAhoARAAIgGACEE4gMAAACeBALjAwAAAJ4ECOQDAAAAngQI6QMAAK0GngQiHQMAAMoGACAIAACZBwAgCwAAiQYAIAwAAMsGACAPAADMBgAgEAAAmwcAIBkAAM0GACDcAwAAmgcAMN0DAAARABDeAwAAmgcAMN8DAQDtBQAh7QMBAIcGACHwA0AA7wUAIfsDQADvBQAh_gMgAO4FACH_A0AAiAYAIaQEAQCHBgAhpQQBAO0FACGmBAEA7QUAIacEAQCaBgAhqAQBAJoGACGpBAEAmgYAIaoEAgDABgAhqwQCAMAGACGsBAEAmgYAIbUEIADuBQAhtgQgAO4FACH5BAAAEQAg-gQAABEAIA3cAwAAsQYAMN0DAADwAwAQ3gMAALEGADDtAwEA9AUAIfADQADkBQAh-QMBAPQFACH6AwEA-QUAIfsDQADkBQAh_gMgAOMFACH_A0AA-AUAIaEEAQD0BQAhogQgAOMFACGjBCAA4wUAIRjcAwAAsgYAMN0DAADaAwAQ3gMAALIGADDfAwEA4gUAIe0DAQD0BQAh8ANAAOQFACH1AwAAtAayBCL7A0AA5AUAIaQEAQD0BQAhpQQBAOIFACGmBAEA4gUAIacEAQD2BQAhqAQBAPYFACGpBAEA9gUAIaoEAgD1BQAhqwQCAPUFACGsBAEA9gUAIa0EAQD2BQAhrgQBAPYFACGvBAEA9gUAIbAEAgCzBgAhsgQBAPYFACGzBAEA9gUAIbQEQAD4BQAhDQoAAPsFACA2AAD7BQAgNwAA-wUAIFgAAJIGACBZAAD7BQAg4gMCAAAAAeMDAgAAAAXkAwIAAAAF5QMCAAAAAeYDAgAAAAHnAwIAAAAB6AMCAAAAAekDAgC3BgAhBwoAAOYFACA2AAC2BgAgNwAAtgYAIOIDAAAAsgQC4wMAAACyBAjkAwAAALIECOkDAAC1BrIEIgcKAADmBQAgNgAAtgYAIDcAALYGACDiAwAAALIEAuMDAAAAsgQI5AMAAACyBAjpAwAAtQayBCIE4gMAAACyBALjAwAAALIECOQDAAAAsgQI6QMAALYGsgQiDQoAAPsFACA2AAD7BQAgNwAA-wUAIFgAAJIGACBZAAD7BQAg4gMCAAAAAeMDAgAAAAXkAwIAAAAF5QMCAAAAAeYDAgAAAAHnAwIAAAAB6AMCAAAAAekDAgC3BgAhFNwDAAC4BgAw3QMAAMQDABDeAwAAuAYAMN8DAQDiBQAh7QMBAPQFACHwA0AA5AUAIfsDQADkBQAh_gMgAOMFACH_A0AA-AUAIaQEAQD0BQAhpQQBAOIFACGmBAEA4gUAIacEAQD2BQAhqAQBAPYFACGpBAEA9gUAIaoEAgD1BQAhqwQCAPUFACGsBAEA9gUAIbUEIADjBQAhtgQgAOMFACES3AMAALkGADDdAwAArgMAEN4DAAC5BgAw7QMBAPQFACHwA0AA5AUAIfsDQADkBQAh_gMgAOMFACH_A0AA-AUAIZsEAQD2BQAhtwQBAOIFACG5BAAAuga5BCK6BAgAjAYAIbsECACOBgAhvAQIAI4GACG9BEAA-AUAIb4EAgCzBgAhvwQCAPUFACHABCAA4wUAIQcKAADmBQAgNgAAvAYAIDcAALwGACDiAwAAALkEAuMDAAAAuQQI5AMAAAC5BAjpAwAAuwa5BCIHCgAA5gUAIDYAALwGACA3AAC8BgAg4gMAAAC5BALjAwAAALkECOQDAAAAuQQI6QMAALsGuQQiBOIDAAAAuQQC4wMAAAC5BAjkAwAAALkECOkDAAC8BrkEIhLcAwAAvQYAMN0DAACbAwAQ3gMAAL0GADDtAwEAhwYAIfADQADvBQAh-wNAAO8FACH-AyAA7gUAIf8DQACIBgAhmwQBAJoGACG3BAEA7QUAIbkEAAC-BrkEIroECACXBgAhuwQIAJkGACG8BAgAmQYAIb0EQACIBgAhvgQCAL8GACG_BAIAwAYAIcAEIADuBQAhBOIDAAAAuQQC4wMAAAC5BAjkAwAAALkECOkDAAC8BrkEIgjiAwIAAAAB4wMCAAAABeQDAgAAAAXlAwIAAAAB5gMCAAAAAecDAgAAAAHoAwIAAAAB6QMCAPsFACEI4gMCAAAAAeMDAgAAAATkAwIAAAAE5QMCAAAAAeYDAgAAAAHnAwIAAAAB6AMCAAAAAekDAgDmBQAhFtwDAADBBgAw3QMAAJUDABDeAwAAwQYAMO0DAQD0BQAh8ANAAOQFACH1AwAAwgbDBCL4AwEA9AUAIfkDAQD5BQAh-wNAAOQFACHBBAEA9AUAIcMEAACNBoUEIsQEQADkBQAhxQRAAPgFACHGBEAA-AUAIccEQAD4BQAhyAQBAPYFACHKBAAAwwbKBCPLBEAA-AUAIcwEAQD2BQAhzQQAAMMGygQjzgQBAPYFACHPBAEA9AUAIQcKAADmBQAgNgAAxwYAIDcAAMcGACDiAwAAAMMEAuMDAAAAwwQI5AMAAADDBAjpAwAAxgbDBCIHCgAA-wUAIDYAAMUGACA3AADFBgAg4gMAAADKBAPjAwAAAMoECeQDAAAAygQJ6QMAAMQGygQjBwoAAPsFACA2AADFBgAgNwAAxQYAIOIDAAAAygQD4wMAAADKBAnkAwAAAMoECekDAADEBsoEIwTiAwAAAMoEA-MDAAAAygQJ5AMAAADKBAnpAwAAxQbKBCMHCgAA5gUAIDYAAMcGACA3AADHBgAg4gMAAADDBALjAwAAAMMECOQDAAAAwwQI6QMAAMYGwwQiBOIDAAAAwwQC4wMAAADDBAjkAwAAAMMECOkDAADHBsMEIg7cAwAAyAYAMN0DAAD9AgAQ3gMAAMgGADDfAwEA4gUAIe0DAQD0BQAh8ANAAOQFACH7A0AA5AUAIf4DIADjBQAh_wNAAPgFACGlBAEA4gUAIaYEAQDiBQAhpwQBAPYFACGsBAEA9gUAIdAEAQD2BQAhEgMAAMoGACAMAADLBgAgDwAAzAYAIBkAAM0GACDcAwAAyQYAMN0DAAALABDeAwAAyQYAMN8DAQDtBQAh7QMBAIcGACHwA0AA7wUAIfsDQADvBQAh_gMgAO4FACH_A0AAiAYAIaUEAQDtBQAhpgQBAO0FACGnBAEAmgYAIawEAQCaBgAh0AQBAJoGACEaBAAA4gYAIAUAAOMGACAGAADkBgAgCQAAqQYAIA0AAOUGACAfAADmBgAgIAAA5wYAICEAAOgGACAjAADpBgAg3AMAAN8GADDdAwAAyQEAEN4DAADfBgAw7QMBAO0FACHwA0AA7wUAIfUDAADhBuYEIvsDQADvBQAh_gMgAO4FACH_A0AAiAYAIZoEAQDtBQAhpgQBAO0FACHSBAAA4AbKBCLkBCAA7gUAIeYEIADuBQAh5wQBAJoGACH5BAAAyQEAIPoEAADJAQAgA4AEAAANACCBBAAADQAgggQAAA0AIAOABAAAIAAggQQAACAAIIIEAAAgACADgAQAACcAIIEEAAAnACCCBAAAJwAgCdwDAADOBgAw3QMAAOUCABDeAwAAzgYAMO0DAQDiBQAh8ANAAOQFACH4AwEA9AUAIfkDAQD0BQAh-gMBAPkFACH7A0AA5AUAIQncAwAAzwYAMN0DAADNAgAQ3gMAAM8GADDfAwEA4gUAIe0DAQDiBQAh0QQBAOIFACHSBAAAoAaXBCLTBEAA-AUAIdQEQAD4BQAhCdwDAADQBgAw3QMAALcCABDeAwAA0AYAMO0DAQDiBQAh7gMBAOIFACH1AwAA0QbWBCL7A0AA5AUAIcUEQAD4BQAhxgRAAPgFACEHCgAA5gUAIDYAANMGACA3AADTBgAg4gMAAADWBALjAwAAANYECOQDAAAA1gQI6QMAANIG1gQiBwoAAOYFACA2AADTBgAgNwAA0wYAIOIDAAAA1gQC4wMAAADWBAjkAwAAANYECOkDAADSBtYEIgTiAwAAANYEAuMDAAAA1gQI5AMAAADWBAjpAwAA0wbWBCIJ3AMAANQGADDdAwAAoQIAEN4DAADUBgAw7QMBAOIFACHwA0AA5AUAIfsDQADkBQAhvQRAAOQFACHWBAEA4gUAIdcEAQDiBQAhCdwDAADVBgAw3QMAAI4CABDeAwAA1QYAMO0DAQDtBQAh8ANAAO8FACH7A0AA7wUAIb0EQADvBQAh1gQBAO0FACHXBAEA7QUAIRDcAwAA1gYAMN0DAACIAgAQ3gMAANYGADDfAwEA4gUAIe0DAQDiBQAh8ANAAOQFACH7A0AA5AUAIdgEAQDiBQAh2QQBAOIFACHaBAEA9gUAIdsEAQD2BQAh3AQBAPYFACHdBEAA-AUAId4EQAD4BQAh3wQBAPYFACHgBAEA9gUAIQvcAwAA1wYAMN0DAADyAQAQ3gMAANcGADDfAwEA4gUAIe0DAQDiBQAh8ANAAOQFACH7A0AA5AUAIb0EQADkBQAh4QQBAOIFACHiBAEA9gUAIeMEAQD2BQAhD9wDAADYBgAw3QMAANwBABDeAwAA2AYAMO0DAQDiBQAh8ANAAOQFACH1AwAA2gbmBCL7A0AA5AUAIf4DIADjBQAh_wNAAPgFACGaBAEA4gUAIaYEAQDiBQAh0gQAANkGygQi5AQgAOMFACHmBCAA4wUAIecEAQD2BQAhBwoAAOYFACA2AADeBgAgNwAA3gYAIOIDAAAAygQC4wMAAADKBAjkAwAAAMoECOkDAADdBsoEIgcKAADmBQAgNgAA3AYAIDcAANwGACDiAwAAAOYEAuMDAAAA5gQI5AMAAADmBAjpAwAA2wbmBCIHCgAA5gUAIDYAANwGACA3AADcBgAg4gMAAADmBALjAwAAAOYECOQDAAAA5gQI6QMAANsG5gQiBOIDAAAA5gQC4wMAAADmBAjkAwAAAOYECOkDAADcBuYEIgcKAADmBQAgNgAA3gYAIDcAAN4GACDiAwAAAMoEAuMDAAAAygQI5AMAAADKBAjpAwAA3QbKBCIE4gMAAADKBALjAwAAAMoECOQDAAAAygQI6QMAAN4GygQiGAQAAOIGACAFAADjBgAgBgAA5AYAIAkAAKkGACANAADlBgAgHwAA5gYAICAAAOcGACAhAADoBgAgIwAA6QYAINwDAADfBgAw3QMAAMkBABDeAwAA3wYAMO0DAQDtBQAh8ANAAO8FACH1AwAA4QbmBCL7A0AA7wUAIf4DIADuBQAh_wNAAIgGACGaBAEA7QUAIaYEAQDtBQAh0gQAAOAGygQi5AQgAO4FACHmBCAA7gUAIecEAQCaBgAhBOIDAAAAygQC4wMAAADKBAjkAwAAAMoECOkDAADeBsoEIgTiAwAAAOYEAuMDAAAA5gQI5AMAAADmBAjpAwAA3AbmBCIDgAQAAAMAIIEEAAADACCCBAAAAwAgA4AEAAAHACCBBAAABwAgggQAAAcAIBQDAADKBgAgDAAAywYAIA8AAMwGACAZAADNBgAg3AMAAMkGADDdAwAACwAQ3gMAAMkGADDfAwEA7QUAIe0DAQCHBgAh8ANAAO8FACH7A0AA7wUAIf4DIADuBQAh_wNAAIgGACGlBAEA7QUAIaYEAQDtBQAhpwQBAJoGACGsBAEAmgYAIdAEAQCaBgAh-QQAAAsAIPoEAAALACAdAwAAygYAIAgAAJkHACALAACJBgAgDAAAywYAIA8AAMwGACAQAACbBwAgGQAAzQYAINwDAACaBwAw3QMAABEAEN4DAACaBwAw3wMBAO0FACHtAwEAhwYAIfADQADvBQAh-wNAAO8FACH-AyAA7gUAIf8DQACIBgAhpAQBAIcGACGlBAEA7QUAIaYEAQDtBQAhpwQBAJoGACGoBAEAmgYAIakEAQCaBgAhqgQCAMAGACGrBAIAwAYAIawEAQCaBgAhtQQgAO4FACG2BCAA7gUAIfkEAAARACD6BAAAEQAgEAMAAMoGACDcAwAA_QYAMN0DAABVABDeAwAA_QYAMN8DAQDtBQAh7QMBAO0FACHwA0AA7wUAIfsDQADvBQAh_gMgAO4FACH_A0AAiAYAIZoEAQDtBQAhpgQBAO0FACGsBAEAmgYAIfUEAQCaBgAh-QQAAFUAIPoEAABVACADgAQAAFcAIIEEAABXACCCBAAAVwAgA4AEAAAyACCBBAAAMgAgggQAADIAIAOABAAAXAAggQQAAFwAIIIEAABcACAK3AMAAOoGADDdAwAAwwEAEN4DAADqBgAw7QMBAOIFACH7A0AA5AUAIZMEAQDiBQAh6AQBAOIFACHpBAEA4gUAIeoEAQDiBQAh6wQCAPUFACELEgAA7AYAINwDAADrBgAw3QMAADAAEN4DAADrBgAw7QMBAO0FACH7A0AA7wUAIZMEAQDtBQAh6AQBAO0FACHpBAEA7QUAIeoEAQDtBQAh6wQCAMAGACEPEQAAgwcAIBMAAIkHACAUAADoBgAg3AMAAIcHADDdAwAALAAQ3gMAAIcHADDtAwEA7QUAIe4DAQDtBQAh-wNAAO8FACGRBAAAiAeZBCKVBAEA7QUAIZcEAAD_BpcEIpkEAQCaBgAh-QQAACwAIPoEAAAsACAN3AMAAO0GADDdAwAAqwEAEN4DAADtBgAw7QMBAPQFACH7A0AA5AUAIdIEAADuBu4EIuwEAQD0BQAh7gQBAOIFACHvBAEA9gUAIfAEAQD2BQAh8QQCALMGACHyBAIAswYAIfQEAADvBvQEIwcKAADmBQAgNgAA8wYAIDcAAPMGACDiAwAAAO4EAuMDAAAA7gQI5AMAAADuBAjpAwAA8gbuBCIHCgAA-wUAIDYAAPEGACA3AADxBgAg4gMAAAD0BAPjAwAAAPQECeQDAAAA9AQJ6QMAAPAG9AQjBwoAAPsFACA2AADxBgAgNwAA8QYAIOIDAAAA9AQD4wMAAAD0BAnkAwAAAPQECekDAADwBvQEIwTiAwAAAPQEA-MDAAAA9AQJ5AMAAAD0BAnpAwAA8Qb0BCMHCgAA5gUAIDYAAPMGACA3AADzBgAg4gMAAADuBALjAwAAAO4ECOQDAAAA7gQI6QMAAPIG7gQiBOIDAAAA7gQC4wMAAADuBAjkAwAAAO4ECOkDAADzBu4EIgjcAwAA9AYAMN0DAACVAQAQ3gMAAPQGADDfAwEA4gUAIe0DAQD0BQAh8ANAAOQFACH7A0AA5AUAIakEAQDiBQAhDdwDAAD1BgAw3QMAAH8AEN4DAAD1BgAw3wMBAOIFACHtAwEA4gUAIfADQADkBQAh-wNAAOQFACH-AyAA4wUAIf8DQAD4BQAhmgQBAOIFACGmBAEA4gUAIawEAQD2BQAh9QQBAPYFACEOIgAA-QYAINwDAAD2BgAw3QMAAGAAEN4DAAD2BgAw7QMBAIcGACH7A0AA7wUAIdIEAAD3Bu4EIuwEAQCHBgAh7gQBAO0FACHvBAEAmgYAIfAEAQCaBgAh8QQCAL8GACHyBAIAvwYAIfQEAAD4BvQEIwTiAwAAAO4EAuMDAAAA7gQI5AMAAADuBAjpAwAA8wbuBCIE4gMAAAD0BAPjAwAAAPQECeQDAAAA9AQJ6QMAAPEG9AQjDAMAAMoGACAVAAD7BgAg3AMAAPoGADDdAwAAXAAQ3gMAAPoGADDfAwEA7QUAIe0DAQCHBgAh8ANAAO8FACH7A0AA7wUAIakEAQDtBQAh-QQAAFwAIPoEAABcACAKAwAAygYAIBUAAPsGACDcAwAA-gYAMN0DAABcABDeAwAA-gYAMN8DAQDtBQAh7QMBAIcGACHwA0AA7wUAIfsDQADvBQAhqQQBAO0FACEDgAQAAGAAIIEEAABgACCCBAAAYAAgCgMAAMoGACASAQDtBQAh3AMAAPwGADDdAwAAVwAQ3gMAAPwGADDfAwEA7QUAIe0DAQDtBQAh-wNAAO8FACGRBAEA7QUAIZIEIADuBQAhDgMAAMoGACDcAwAA_QYAMN0DAABVABDeAwAA_QYAMN8DAQDtBQAh7QMBAO0FACHwA0AA7wUAIfsDQADvBQAh_gMgAO4FACH_A0AAiAYAIZoEAQDtBQAhpgQBAO0FACGsBAEAmgYAIfUEAQCaBgAhChYAAIAHACDcAwAA_gYAMN0DAAA7ABDeAwAA_gYAMN8DAQDtBQAh7QMBAO0FACHRBAEA7QUAIdIEAAD_BpcEItMEQACIBgAh1ARAAIgGACEE4gMAAACXBALjAwAAAJcECOQDAAAAlwQI6QMAAKUGlwQiDREAAIMHACAXAACEBwAg3AMAAIEHADDdAwAANwAQ3gMAAIEHADDtAwEA7QUAIe4DAQDtBQAh9QMAAIIH1gQi-wNAAO8FACHFBEAAiAYAIcYEQACIBgAh-QQAADcAIPoEAAA3ACALEQAAgwcAIBcAAIQHACDcAwAAgQcAMN0DAAA3ABDeAwAAgQcAMO0DAQDtBQAh7gMBAO0FACH1AwAAggfWBCL7A0AA7wUAIcUEQACIBgAhxgRAAIgGACEE4gMAAADWBALjAwAAANYECOQDAAAA1gQI6QMAANMG1gQiEAYAAI4HACANAACwBgAgDgAAjQcAIBUAAI8HACAYAACQBwAg3AMAAIsHADDdAwAAJwAQ3gMAAIsHADDtAwEA7QUAIfADQADvBQAh-AMBAIcGACH5AwEAhwYAIfoDAQCMBwAh-wNAAO8FACH5BAAAJwAg-gQAACcAIAOABAAAOwAggQQAADsAIIIEAAA7ACAD3wMBAAAAAZMEAQAAAAGUBAEAAAABCgMAAMoGACASAADsBgAg3AMAAIYHADDdAwAAMgAQ3gMAAIYHADDfAwEA7QUAIe0DAQDtBQAh-wNAAO8FACGTBAEA7QUAIZQEAQDtBQAhDREAAIMHACATAACJBwAgFAAA6AYAINwDAACHBwAw3QMAACwAEN4DAACHBwAw7QMBAO0FACHuAwEA7QUAIfsDQADvBQAhkQQAAIgHmQQilQQBAO0FACGXBAAA_waXBCKZBAEAmgYAIQTiAwAAAJkEAuMDAAAAmQQI5AMAAACZBAjpAwAAowaZBCINEgAA7AYAINwDAADrBgAw3QMAADAAEN4DAADrBgAw7QMBAO0FACH7A0AA7wUAIZMEAQDtBQAh6AQBAO0FACHpBAEA7QUAIeoEAQDtBQAh6wQCAMAGACH5BAAAMAAg-gQAADAAIAL4AwEAAAAB-QMBAAAAAQ4GAACOBwAgDQAAsAYAIA4AAI0HACAVAACPBwAgGAAAkAcAINwDAACLBwAw3QMAACcAEN4DAACLBwAw7QMBAO0FACHwA0AA7wUAIfgDAQCHBgAh-QMBAIcGACH6AwEAjAcAIfsDQADvBQAhCOIDAQAAAAHjAwEAAAAF5AMBAAAABeUDAQAAAAHmAwEAAAAB5wMBAAAAAegDAQAAAAHpAwEAkQcAIR4GAACOBwAgDQAA5QYAIBkAAM0GACAcAACfBwAgHQAAoAcAIB4AAKEHACDcAwAAnAcAMN0DAAANABDeAwAAnAcAMO0DAQCHBgAh8ANAAO8FACH1AwAAnQfDBCL4AwEAhwYAIfkDAQCMBwAh-wNAAO8FACHBBAEAhwYAIcMEAACYBoUEIsQEQADvBQAhxQRAAIgGACHGBEAAiAYAIccEQACIBgAhyAQBAJoGACHKBAAAngfKBCPLBEAAiAYAIcwEAQCaBgAhzQQAAJ4HygQjzgQBAJoGACHPBAEAhwYAIfkEAAANACD6BAAADQAgFAMAAMoGACAMAADLBgAgDwAAzAYAIBkAAM0GACDcAwAAyQYAMN0DAAALABDeAwAAyQYAMN8DAQDtBQAh7QMBAIcGACHwA0AA7wUAIfsDQADvBQAh_gMgAO4FACH_A0AAiAYAIaUEAQDtBQAhpgQBAO0FACGnBAEAmgYAIawEAQCaBgAh0AQBAJoGACH5BAAACwAg-gQAAAsAIAOABAAALAAggQQAACwAIIIEAAAsACADgAQAADcAIIEEAAA3ACCCBAAANwAgCOIDAQAAAAHjAwEAAAAF5AMBAAAABeUDAQAAAAHmAwEAAAAB5wMBAAAAAegDAQAAAAHpAwEAkQcAIREGAACOBwAgDQAAsAYAIA4AAI0HACDcAwAAkgcAMN0DAAAgABDeAwAAkgcAMO0DAQCHBgAh8ANAAO8FACHyAwIAwAYAIfMDAQCaBgAh9QMAAJMH9QMi9gMBAJoGACH3A0AAiAYAIfgDAQCHBgAh-QMBAIcGACH6AwEAjAcAIfsDQADvBQAhBOIDAAAA9QMC4wMAAAD1AwjkAwAAAPUDCOkDAACABvUDIgL5AwEAAAABoQQBAAAAARANAACwBgAgDgAAjQcAIBsAAJYHACDcAwAAlQcAMN0DAAAbABDeAwAAlQcAMO0DAQCHBgAh8ANAAO8FACH5AwEAhwYAIfoDAQCMBwAh-wNAAO8FACH-AyAA7gUAIf8DQACIBgAhoQQBAIcGACGiBCAA7gUAIaMEIADuBQAhDRoAAIkGACDcAwAAhgYAMN0DAACBBQAQ3gMAAIYGADDtAwEAhwYAIfADQADvBQAh-wNAAO8FACH8A0AA7wUAIf0DQADvBQAh_gMgAO4FACH_A0AAiAYAIfkEAACBBQAg-gQAAIEFACAaAwAAygYAIAgAAJkHACDcAwAAlwcAMN0DAAAVABDeAwAAlwcAMN8DAQDtBQAh7QMBAIcGACHwA0AA7wUAIfUDAACYB7IEIvsDQADvBQAhpAQBAIcGACGlBAEA7QUAIaYEAQDtBQAhpwQBAJoGACGoBAEAmgYAIakEAQCaBgAhqgQCAMAGACGrBAIAwAYAIawEAQCaBgAhrQQBAJoGACGuBAEAmgYAIa8EAQCaBgAhsAQCAL8GACGyBAEAmgYAIbMEAQCaBgAhtARAAIgGACEE4gMAAACyBALjAwAAALIECOQDAAAAsgQI6QMAALYGsgQiDwcAAKgGACAJAACpBgAg3AMAAKcGADDdAwAAjgQAEN4DAACnBgAw7QMBAIcGACHwA0AA7wUAIfsDQADvBQAh_gMgAO4FACH_A0AAiAYAIZoEAQDtBQAhmwQBAJoGACGcBAEAmgYAIfkEAACOBAAg-gQAAI4EACAbAwAAygYAIAgAAJkHACALAACJBgAgDAAAywYAIA8AAMwGACAQAACbBwAgGQAAzQYAINwDAACaBwAw3QMAABEAEN4DAACaBwAw3wMBAO0FACHtAwEAhwYAIfADQADvBQAh-wNAAO8FACH-AyAA7gUAIf8DQACIBgAhpAQBAIcGACGlBAEA7QUAIaYEAQDtBQAhpwQBAJoGACGoBAEAmgYAIakEAQCaBgAhqgQCAMAGACGrBAIAwAYAIawEAQCaBgAhtQQgAO4FACG2BCAA7gUAIQ4NAACwBgAg3AMAAK4GADDdAwAAJQAQ3gMAAK4GADDtAwEAhwYAIfADQADvBQAh9QMAAK8GngQi-QMBAIcGACH7A0AA7wUAIZ4EAQCaBgAhnwQBAJoGACGgBEAAiAYAIfkEAAAlACD6BAAAJQAgHAYAAI4HACANAADlBgAgGQAAzQYAIBwAAJ8HACAdAACgBwAgHgAAoQcAINwDAACcBwAw3QMAAA0AEN4DAACcBwAw7QMBAIcGACHwA0AA7wUAIfUDAACdB8MEIvgDAQCHBgAh-QMBAIwHACH7A0AA7wUAIcEEAQCHBgAhwwQAAJgGhQQixARAAO8FACHFBEAAiAYAIcYEQACIBgAhxwRAAIgGACHIBAEAmgYAIcoEAACeB8oEI8sEQACIBgAhzAQBAJoGACHNBAAAngfKBCPOBAEAmgYAIc8EAQCHBgAhBOIDAAAAwwQC4wMAAADDBAjkAwAAAMMECOkDAADHBsMEIgTiAwAAAMoEA-MDAAAAygQJ5AMAAADKBAnpAwAAxQbKBCMSDQAAsAYAIA4AAI0HACAbAACWBwAg3AMAAJUHADDdAwAAGwAQ3gMAAJUHADDtAwEAhwYAIfADQADvBQAh-QMBAIcGACH6AwEAjAcAIfsDQADvBQAh_gMgAO4FACH_A0AAiAYAIaEEAQCHBgAhogQgAO4FACGjBCAA7gUAIfkEAAAbACD6BAAAGwAgEg4AAJwGACDcAwAAlgYAMN0DAABJABDeAwAAlgYAMO0DAQCHBgAh8ANAAO8FACH1AwAAmAaFBCL6AwEAhwYAIfsDQADvBQAhgwQIAJcGACGFBAgAmQYAIYYECACZBgAhhwQBAJoGACGIBAEA7QUAIYkEAQCaBgAhigQAAJsGACD5BAAASQAg-gQAAEkAIBMGAACOBwAgDQAAsAYAIA4AAI0HACDcAwAAkgcAMN0DAAAgABDeAwAAkgcAMO0DAQCHBgAh8ANAAO8FACHyAwIAwAYAIfMDAQCaBgAh9QMAAJMH9QMi9gMBAJoGACH3A0AAiAYAIfgDAQCHBgAh-QMBAIcGACH6AwEAjAcAIfsDQADvBQAh-QQAACAAIPoEAAAgACARAwAAygYAINwDAACiBwAw3QMAAAcAEN4DAACiBwAw3wMBAO0FACHtAwEA7QUAIfADQADvBQAh-wNAAO8FACHYBAEA7QUAIdkEAQDtBQAh2gQBAJoGACHbBAEAmgYAIdwEAQCaBgAh3QRAAIgGACHeBEAAiAYAId8EAQCaBgAh4AQBAJoGACEMAwAAygYAINwDAACjBwAw3QMAAAMAEN4DAACjBwAw3wMBAO0FACHtAwEA7QUAIfADQADvBQAh-wNAAO8FACG9BEAA7wUAIeEEAQDtBQAh4gQBAJoGACHjBAEAmgYAIQAAAAH-BAEAAAABAf4EIAAAAAEB_gRAAAAAAQAAAAAAAAAAAAX-BAIAAAABhAUCAAAAAYUFAgAAAAGGBQIAAAABhwUCAAAAAQH-BAEAAAABAf4EAAAA9QMCAf4EQAAAAAEFMAAA7gwAIDEAAPcMACD7BAAA7wwAIPwEAAD2DAAggQUAAOgCACAFMAAA7AwAIDEAAPQMACD7BAAA7QwAIPwEAADzDAAggQUAABMAIAcwAADqDAAgMQAA8QwAIPsEAADrDAAg_AQAAPAMACD_BAAADQAggAUAAA0AIIEFAAAPACADMAAA7gwAIPsEAADvDAAggQUAAOgCACADMAAA7AwAIPsEAADtDAAggQUAABMAIAMwAADqDAAg-wQAAOsMACCBBQAADwAgAAAACzAAAMEHADAxAADGBwAw-wQAAMIHADD8BAAAwwcAMP0EAADEBwAg_gQAAMUHADD_BAAAxQcAMIAFAADFBwAwgQUAAMUHADCCBQAAxwcAMIMFAADIBwAwCw0AAMEIACAOAADCCAAg7QMBAAAAAfADQAAAAAH5AwEAAAAB-gMBAAAAAfsDQAAAAAH-AyAAAAAB_wNAAAAAAaIEIAAAAAGjBCAAAAABAgAAAB0AIDAAAMAIACADAAAAHQAgMAAAwAgAIDEAAMsHACABKQAA6QwAMBENAACwBgAgDgAAjQcAIBsAAJYHACDcAwAAlQcAMN0DAAAbABDeAwAAlQcAMO0DAQAAAAHwA0AA7wUAIfkDAQCHBgAh-gMBAIwHACH7A0AA7wUAIf4DIADuBQAh_wNAAIgGACGhBAEAhwYAIaIEIADuBQAhowQgAO4FACH4BAAAlAcAIAIAAAAdACApAADLBwAgAgAAAMkHACApAADKBwAgDdwDAADIBwAw3QMAAMkHABDeAwAAyAcAMO0DAQCHBgAh8ANAAO8FACH5AwEAhwYAIfoDAQCMBwAh-wNAAO8FACH-AyAA7gUAIf8DQACIBgAhoQQBAIcGACGiBCAA7gUAIaMEIADuBQAhDdwDAADIBwAw3QMAAMkHABDeAwAAyAcAMO0DAQCHBgAh8ANAAO8FACH5AwEAhwYAIfoDAQCMBwAh-wNAAO8FACH-AyAA7gUAIf8DQACIBgAhoQQBAIcGACGiBCAA7gUAIaMEIADuBQAhCe0DAQCnBwAh8ANAAKkHACH5AwEApwcAIfoDAQC0BwAh-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhogQgAKgHACGjBCAAqAcAIQsNAADMBwAgDgAAzQcAIO0DAQCnBwAh8ANAAKkHACH5AwEApwcAIfoDAQC0BwAh-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhogQgAKgHACGjBCAAqAcAIQUwAADGDAAgMQAA5wwAIPsEAADHDAAg_AQAAOYMACCBBQAAEwAgBzAAAM4HACAxAADRBwAg-wQAAM8HACD8BAAA0AcAIP8EAAANACCABQAADQAggQUAAA8AIBcGAAC7CAAgDQAAvwgAIBkAAL4IACAdAAC8CAAgHgAAvQgAIO0DAQAAAAHwA0AAAAAB9QMAAADDBAL4AwEAAAAB-QMBAAAAAfsDQAAAAAHBBAEAAAABwwQAAACFBALEBEAAAAABxQRAAAAAAcYEQAAAAAHHBEAAAAAByAQBAAAAAcoEAAAAygQDywRAAAAAAcwEAQAAAAHNBAAAAMoEA84EAQAAAAECAAAADwAgMAAAzgcAIAMAAAANACAwAADOBwAgMQAA0gcAIBkAAAANACAGAADWBwAgDQAA2gcAIBkAANkHACAdAADXBwAgHgAA2AcAICkAANIHACDtAwEApwcAIfADQACpBwAh9QMAANMHwwQi-AMBAKcHACH5AwEAtAcAIfsDQACpBwAhwQQBAKcHACHDBAAA1AeFBCLEBEAAqQcAIcUEQAC2BwAhxgRAALYHACHHBEAAtgcAIcgEAQC0BwAhygQAANUHygQjywRAALYHACHMBAEAtAcAIc0EAADVB8oEI84EAQC0BwAhFwYAANYHACANAADaBwAgGQAA2QcAIB0AANcHACAeAADYBwAg7QMBAKcHACHwA0AAqQcAIfUDAADTB8MEIvgDAQCnBwAh-QMBALQHACH7A0AAqQcAIcEEAQCnBwAhwwQAANQHhQQixARAAKkHACHFBEAAtgcAIcYEQAC2BwAhxwRAALYHACHIBAEAtAcAIcoEAADVB8oEI8sEQAC2BwAhzAQBALQHACHNBAAA1QfKBCPOBAEAtAcAIQH-BAAAAMMEAgH-BAAAAIUEAgH-BAAAAMoEAwUwAADKDAAgMQAA5AwAIPsEAADLDAAg_AQAAOMMACCBBQAA6AIAIAcwAAC0CAAgMQAAtwgAIPsEAAC1CAAg_AQAALYIACD_BAAASQAggAUAAEkAIIEFAADmBAAgBzAAAK8IACAxAACyCAAg-wQAALAIACD8BAAAsQgAIP8EAAAgACCABQAAIAAggQUAACIAIAswAADbBwAwMQAA4AcAMPsEAADcBwAw_AQAAN0HADD9BAAA3gcAIP4EAADfBwAw_wQAAN8HADCABQAA3wcAMIEFAADfBwAwggUAAOEHADCDBQAA4gcAMAcwAADIDAAgMQAA4QwAIPsEAADJDAAg_AQAAOAMACD_BAAAEQAggAUAABEAIIEFAAATACAJBgAAqwgAIA0AAKwIACAVAACtCAAgGAAArggAIO0DAQAAAAHwA0AAAAAB-AMBAAAAAfkDAQAAAAH7A0AAAAABAgAAACkAIDAAAKoIACADAAAAKQAgMAAAqggAIDEAAOUHACABKQAA3wwAMA8GAACOBwAgDQAAsAYAIA4AAI0HACAVAACPBwAgGAAAkAcAINwDAACLBwAw3QMAACcAEN4DAACLBwAw7QMBAAAAAfADQADvBQAh-AMBAIcGACH5AwEAhwYAIfoDAQCMBwAh-wNAAO8FACH3BAAAigcAIAIAAAApACApAADlBwAgAgAAAOMHACApAADkBwAgCdwDAADiBwAw3QMAAOMHABDeAwAA4gcAMO0DAQDtBQAh8ANAAO8FACH4AwEAhwYAIfkDAQCHBgAh-gMBAIwHACH7A0AA7wUAIQncAwAA4gcAMN0DAADjBwAQ3gMAAOIHADDtAwEA7QUAIfADQADvBQAh-AMBAIcGACH5AwEAhwYAIfoDAQCMBwAh-wNAAO8FACEF7QMBAKcHACHwA0AAqQcAIfgDAQCnBwAh-QMBAKcHACH7A0AAqQcAIQkGAADmBwAgDQAA5wcAIBUAAOgHACAYAADpBwAg7QMBAKcHACHwA0AAqQcAIfgDAQCnBwAh-QMBAKcHACH7A0AAqQcAIQUwAADODAAgMQAA3QwAIPsEAADPDAAg_AQAANwMACCBBQAA6AIAIAUwAADMDAAgMQAA2gwAIPsEAADNDAAg_AQAANkMACCBBQAAEwAgCzAAAIYIADAxAACLCAAw-wQAAIcIADD8BAAAiAgAMP0EAACJCAAg_gQAAIoIADD_BAAAiggAMIAFAACKCAAwgQUAAIoIADCCBQAAjAgAMIMFAACNCAAwCzAAAOoHADAxAADvBwAw-wQAAOsHADD8BAAA7AcAMP0EAADtBwAg_gQAAO4HADD_BAAA7gcAMIAFAADuBwAwgQUAAO4HADCCBQAA8AcAMIMFAADxBwAwBhcAAIUIACDtAwEAAAAB9QMAAADWBAL7A0AAAAABxQRAAAAAAcYEQAAAAAECAAAAOQAgMAAAhAgAIAMAAAA5ACAwAACECAAgMQAA9QcAIAEpAADYDAAwCxEAAIMHACAXAACEBwAg3AMAAIEHADDdAwAANwAQ3gMAAIEHADDtAwEAAAAB7gMBAO0FACH1AwAAggfWBCL7A0AA7wUAIcUEQACIBgAhxgRAAIgGACECAAAAOQAgKQAA9QcAIAIAAADyBwAgKQAA8wcAIAncAwAA8QcAMN0DAADyBwAQ3gMAAPEHADDtAwEA7QUAIe4DAQDtBQAh9QMAAIIH1gQi-wNAAO8FACHFBEAAiAYAIcYEQACIBgAhCdwDAADxBwAw3QMAAPIHABDeAwAA8QcAMO0DAQDtBQAh7gMBAO0FACH1AwAAggfWBCL7A0AA7wUAIcUEQACIBgAhxgRAAIgGACEF7QMBAKcHACH1AwAA9AfWBCL7A0AAqQcAIcUEQAC2BwAhxgRAALYHACEB_gQAAADWBAIGFwAA9gcAIO0DAQCnBwAh9QMAAPQH1gQi-wNAAKkHACHFBEAAtgcAIcYEQAC2BwAhCzAAAPcHADAxAAD8BwAw-wQAAPgHADD8BAAA-QcAMP0EAAD6BwAg_gQAAPsHADD_BAAA-wcAMIAFAAD7BwAwgQUAAPsHADCCBQAA_QcAMIMFAAD-BwAwBd8DAQAAAAHtAwEAAAAB0gQAAACXBALTBEAAAAAB1ARAAAAAAQIAAAA9ACAwAACDCAAgAwAAAD0AIDAAAIMIACAxAACCCAAgASkAANcMADAKFgAAgAcAINwDAAD-BgAw3QMAADsAEN4DAAD-BgAw3wMBAO0FACHtAwEAAAAB0QQBAO0FACHSBAAA_waXBCLTBEAAiAYAIdQEQACIBgAhAgAAAD0AICkAAIIIACACAAAA_wcAICkAAIAIACAJ3AMAAP4HADDdAwAA_wcAEN4DAAD-BwAw3wMBAO0FACHtAwEA7QUAIdEEAQDtBQAh0gQAAP8GlwQi0wRAAIgGACHUBEAAiAYAIQncAwAA_gcAMN0DAAD_BwAQ3gMAAP4HADDfAwEA7QUAIe0DAQDtBQAh0QQBAO0FACHSBAAA_waXBCLTBEAAiAYAIdQEQACIBgAhBd8DAQCnBwAh7QMBAKcHACHSBAAAgQiXBCLTBEAAtgcAIdQEQAC2BwAhAf4EAAAAlwQCBd8DAQCnBwAh7QMBAKcHACHSBAAAgQiXBCLTBEAAtgcAIdQEQAC2BwAhBd8DAQAAAAHtAwEAAAAB0gQAAACXBALTBEAAAAAB1ARAAAAAAQYXAACFCAAg7QMBAAAAAfUDAAAA1gQC-wNAAAAAAcUEQAAAAAHGBEAAAAABBDAAAPcHADD7BAAA-AcAMP0EAAD6BwAggQUAAPsHADAIEwAAqAgAIBQAAKkIACDtAwEAAAAB-wNAAAAAAZEEAAAAmQQClQQBAAAAAZcEAAAAlwQCmQQBAAAAAQIAAAAuACAwAACnCAAgAwAAAC4AIDAAAKcIACAxAACRCAAgASkAANYMADANEQAAgwcAIBMAAIkHACAUAADoBgAg3AMAAIcHADDdAwAALAAQ3gMAAIcHADDtAwEAAAAB7gMBAO0FACH7A0AA7wUAIZEEAACIB5kEIpUEAQDtBQAhlwQAAP8GlwQimQQBAJoGACECAAAALgAgKQAAkQgAIAIAAACOCAAgKQAAjwgAIArcAwAAjQgAMN0DAACOCAAQ3gMAAI0IADDtAwEA7QUAIe4DAQDtBQAh-wNAAO8FACGRBAAAiAeZBCKVBAEA7QUAIZcEAAD_BpcEIpkEAQCaBgAhCtwDAACNCAAw3QMAAI4IABDeAwAAjQgAMO0DAQDtBQAh7gMBAO0FACH7A0AA7wUAIZEEAACIB5kEIpUEAQDtBQAhlwQAAP8GlwQimQQBAJoGACEG7QMBAKcHACH7A0AAqQcAIZEEAACQCJkEIpUEAQCnBwAhlwQAAIEIlwQimQQBALQHACEB_gQAAACZBAIIEwAAkggAIBQAAJMIACDtAwEApwcAIfsDQACpBwAhkQQAAJAImQQilQQBAKcHACGXBAAAgQiXBCKZBAEAtAcAIQcwAACiCAAgMQAApQgAIPsEAACjCAAg_AQAAKQIACD_BAAAMAAggAUAADAAIIEFAACuAQAgCzAAAJQIADAxAACZCAAw-wQAAJUIADD8BAAAlggAMP0EAACXCAAg_gQAAJgIADD_BAAAmAgAMIAFAACYCAAwgQUAAJgIADCCBQAAmggAMIMFAACbCAAwBQMAAKEIACDfAwEAAAAB7QMBAAAAAfsDQAAAAAGUBAEAAAABAgAAADQAIDAAAKAIACADAAAANAAgMAAAoAgAIDEAAJ4IACABKQAA1QwAMAsDAADKBgAgEgAA7AYAINwDAACGBwAw3QMAADIAEN4DAACGBwAw3wMBAO0FACHtAwEAAAAB-wNAAO8FACGTBAEA7QUAIZQEAQDtBQAh9gQAAIUHACACAAAANAAgKQAAnggAIAIAAACcCAAgKQAAnQgAIAjcAwAAmwgAMN0DAACcCAAQ3gMAAJsIADDfAwEA7QUAIe0DAQDtBQAh-wNAAO8FACGTBAEA7QUAIZQEAQDtBQAhCNwDAACbCAAw3QMAAJwIABDeAwAAmwgAMN8DAQDtBQAh7QMBAO0FACH7A0AA7wUAIZMEAQDtBQAhlAQBAO0FACEE3wMBAKcHACHtAwEApwcAIfsDQACpBwAhlAQBAKcHACEFAwAAnwgAIN8DAQCnBwAh7QMBAKcHACH7A0AAqQcAIZQEAQCnBwAhBTAAANAMACAxAADTDAAg-wQAANEMACD8BAAA0gwAIIEFAADGAQAgBQMAAKEIACDfAwEAAAAB7QMBAAAAAfsDQAAAAAGUBAEAAAABAzAAANAMACD7BAAA0QwAIIEFAADGAQAgBu0DAQAAAAH7A0AAAAAB6AQBAAAAAekEAQAAAAHqBAEAAAAB6wQCAAAAAQIAAACuAQAgMAAAoggAIAMAAAAwACAwAACiCAAgMQAApggAIAgAAAAwACApAACmCAAg7QMBAKcHACH7A0AAqQcAIegEAQCnBwAh6QQBAKcHACHqBAEApwcAIesEAgCzBwAhBu0DAQCnBwAh-wNAAKkHACHoBAEApwcAIekEAQCnBwAh6gQBAKcHACHrBAIAswcAIQgTAACoCAAgFAAAqQgAIO0DAQAAAAH7A0AAAAABkQQAAACZBAKVBAEAAAABlwQAAACXBAKZBAEAAAABAzAAAKIIACD7BAAAowgAIIEFAACuAQAgBDAAAJQIADD7BAAAlQgAMP0EAACXCAAggQUAAJgIADAJBgAAqwgAIA0AAKwIACAVAACtCAAgGAAArggAIO0DAQAAAAHwA0AAAAAB-AMBAAAAAfkDAQAAAAH7A0AAAAABAzAAAM4MACD7BAAAzwwAIIEFAADoAgAgAzAAAMwMACD7BAAAzQwAIIEFAAATACAEMAAAhggAMPsEAACHCAAw_QQAAIkIACCBBQAAiggAMAQwAADqBwAw-wQAAOsHADD9BAAA7QcAIIEFAADuBwAwDAYAALoHACANAAC7BwAg7QMBAAAAAfADQAAAAAHyAwIAAAAB8wMBAAAAAfUDAAAA9QMC9gMBAAAAAfcDQAAAAAH4AwEAAAAB-QMBAAAAAfsDQAAAAAECAAAAIgAgMAAArwgAIAMAAAAgACAwAACvCAAgMQAAswgAIA4AAAAgACAGAAC3BwAgDQAAuAcAICkAALMIACDtAwEApwcAIfADQACpBwAh8gMCALMHACHzAwEAtAcAIfUDAAC1B_UDIvYDAQC0BwAh9wNAALYHACH4AwEApwcAIfkDAQCnBwAh-wNAAKkHACEMBgAAtwcAIA0AALgHACDtAwEApwcAIfADQACpBwAh8gMCALMHACHzAwEAtAcAIfUDAAC1B_UDIvYDAQC0BwAh9wNAALYHACH4AwEApwcAIfkDAQCnBwAh-wNAAKkHACEL7QMBAAAAAfADQAAAAAH1AwAAAIUEAvsDQAAAAAGDBAgAAAABhQQIAAAAAYYECAAAAAGHBAEAAAABiAQBAAAAAYkEAQAAAAGKBIAAAAABAgAAAOYEACAwAAC0CAAgAwAAAEkAIDAAALQIACAxAAC4CAAgDQAAAEkAICkAALgIACDtAwEApwcAIfADQACpBwAh9QMAANQHhQQi-wNAAKkHACGDBAgAuQgAIYUECAC6CAAhhgQIALoIACGHBAEAtAcAIYgEAQCnBwAhiQQBALQHACGKBIAAAAABC-0DAQCnBwAh8ANAAKkHACH1AwAA1AeFBCL7A0AAqQcAIYMECAC5CAAhhQQIALoIACGGBAgAuggAIYcEAQC0BwAhiAQBAKcHACGJBAEAtAcAIYoEgAAAAAEF_gQIAAAAAYQFCAAAAAGFBQgAAAABhgUIAAAAAYcFCAAAAAEF_gQIAAAAAYQFCAAAAAGFBQgAAAABhgUIAAAAAYcFCAAAAAEDMAAAygwAIPsEAADLDAAggQUAAOgCACADMAAAtAgAIPsEAAC1CAAggQUAAOYEACADMAAArwgAIPsEAACwCAAggQUAACIAIAQwAADbBwAw-wQAANwHADD9BAAA3gcAIIEFAADfBwAwAzAAAMgMACD7BAAAyQwAIIEFAAATACALDQAAwQgAIA4AAMIIACDtAwEAAAAB8ANAAAAAAfkDAQAAAAH6AwEAAAAB-wNAAAAAAf4DIAAAAAH_A0AAAAABogQgAAAAAaMEIAAAAAEDMAAAxgwAIPsEAADHDAAggQUAABMAIAMwAADOBwAg-wQAAM8HACCBBQAADwAgBDAAAMEHADD7BAAAwgcAMP0EAADEBwAggQUAAMUHADAAAAAAAAAFMAAAwQwAIDEAAMQMACD7BAAAwgwAIPwEAADDDAAggQUAAA8AIAMwAADBDAAg-wQAAMIMACCBBQAADwAgEAYAAKELACANAADICQAgGQAAjAoAIBwAAMoLACAdAADLCwAgHgAAzAsAIPkDAACtBwAgxQQAAK0HACDGBAAArQcAIMcEAACtBwAgyAQAAK0HACDKBAAArQcAIMsEAACtBwAgzAQAAK0HACDNBAAArQcAIM4EAACtBwAgAAAABTAAALwMACAxAAC_DAAg-wQAAL0MACD8BAAAvgwAIIEFAADGAQAgAzAAALwMACD7BAAAvQwAIIEFAADGAQAgAAAABTAAALcMACAxAAC6DAAg-wQAALgMACD8BAAAuQwAIIEFAAAuACADMAAAtwwAIPsEAAC4DAAggQUAAC4AIAAAAAUwAACyDAAgMQAAtQwAIPsEAACzDAAg_AQAALQMACCBBQAAKQAgAzAAALIMACD7BAAAswwAIIEFAAApACAAAAALMAAA8QgAMDEAAPYIADD7BAAA8ggAMPwEAADzCAAw_QQAAPQIACD-BAAA9QgAMP8EAAD1CAAwgAUAAPUIADCBBQAA9QgAMIIFAAD3CAAwgwUAAPgIADALMAAA4QgAMDEAAOYIADD7BAAA4ggAMPwEAADjCAAw_QQAAOQIACD-BAAA5QgAMP8EAADlCAAwgAUAAOUIADCBBQAA5QgAMIIFAADnCAAwgwUAAOgIADAVAwAA8AgAIN8DAQAAAAHtAwEAAAAB8ANAAAAAAfUDAAAAsgQC-wNAAAAAAaUEAQAAAAGmBAEAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQCAAAAAasEAgAAAAGsBAEAAAABrQQBAAAAAa4EAQAAAAGvBAEAAAABsAQCAAAAAbIEAQAAAAGzBAEAAAABtARAAAAAAQIAAAAXACAwAADvCAAgAwAAABcAIDAAAO8IACAxAADtCAAgASkAALEMADAaAwAAygYAIAgAAJkHACDcAwAAlwcAMN0DAAAVABDeAwAAlwcAMN8DAQDtBQAh7QMBAAAAAfADQADvBQAh9QMAAJgHsgQi-wNAAO8FACGkBAEAhwYAIaUEAQDtBQAhpgQBAO0FACGnBAEAmgYAIagEAQCaBgAhqQQBAJoGACGqBAIAwAYAIasEAgDABgAhrAQBAJoGACGtBAEAmgYAIa4EAQCaBgAhrwQBAJoGACGwBAIAvwYAIbIEAQCaBgAhswQBAJoGACG0BEAAiAYAIQIAAAAXACApAADtCAAgAgAAAOkIACApAADqCAAgGNwDAADoCAAw3QMAAOkIABDeAwAA6AgAMN8DAQDtBQAh7QMBAIcGACHwA0AA7wUAIfUDAACYB7IEIvsDQADvBQAhpAQBAIcGACGlBAEA7QUAIaYEAQDtBQAhpwQBAJoGACGoBAEAmgYAIakEAQCaBgAhqgQCAMAGACGrBAIAwAYAIawEAQCaBgAhrQQBAJoGACGuBAEAmgYAIa8EAQCaBgAhsAQCAL8GACGyBAEAmgYAIbMEAQCaBgAhtARAAIgGACEY3AMAAOgIADDdAwAA6QgAEN4DAADoCAAw3wMBAO0FACHtAwEAhwYAIfADQADvBQAh9QMAAJgHsgQi-wNAAO8FACGkBAEAhwYAIaUEAQDtBQAhpgQBAO0FACGnBAEAmgYAIagEAQCaBgAhqQQBAJoGACGqBAIAwAYAIasEAgDABgAhrAQBAJoGACGtBAEAmgYAIa4EAQCaBgAhrwQBAJoGACGwBAIAvwYAIbIEAQCaBgAhswQBAJoGACG0BEAAiAYAIRTfAwEApwcAIe0DAQCnBwAh8ANAAKkHACH1AwAA7AiyBCL7A0AAqQcAIaUEAQCnBwAhpgQBAKcHACGnBAEAtAcAIagEAQC0BwAhqQQBALQHACGqBAIAswcAIasEAgCzBwAhrAQBALQHACGtBAEAtAcAIa4EAQC0BwAhrwQBALQHACGwBAIA6wgAIbIEAQC0BwAhswQBALQHACG0BEAAtgcAIQX-BAIAAAABhAUCAAAAAYUFAgAAAAGGBQIAAAABhwUCAAAAAQH-BAAAALIEAhUDAADuCAAg3wMBAKcHACHtAwEApwcAIfADQACpBwAh9QMAAOwIsgQi-wNAAKkHACGlBAEApwcAIaYEAQCnBwAhpwQBALQHACGoBAEAtAcAIakEAQC0BwAhqgQCALMHACGrBAIAswcAIawEAQC0BwAhrQQBALQHACGuBAEAtAcAIa8EAQC0BwAhsAQCAOsIACGyBAEAtAcAIbMEAQC0BwAhtARAALYHACEFMAAArAwAIDEAAK8MACD7BAAArQwAIPwEAACuDAAggQUAAMYBACAVAwAA8AgAIN8DAQAAAAHtAwEAAAAB8ANAAAAAAfUDAAAAsgQC-wNAAAAAAaUEAQAAAAGmBAEAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQCAAAAAasEAgAAAAGsBAEAAAABrQQBAAAAAa4EAQAAAAGvBAEAAAABsAQCAAAAAbIEAQAAAAGzBAEAAAABtARAAAAAAQMwAACsDAAg-wQAAK0MACCBBQAAxgEAIBYDAAC5CQAgCwAAugkAIAwAALsJACAPAAC8CQAgEAAAvQkAIBkAAL4JACDfAwEAAAAB7QMBAAAAAfADQAAAAAH7A0AAAAAB_gMgAAAAAf8DQAAAAAGlBAEAAAABpgQBAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAgAAAAGrBAIAAAABrAQBAAAAAbUEIAAAAAG2BCAAAAABAgAAABMAIDAAALgJACADAAAAEwAgMAAAuAkAIDEAAPsIACABKQAAqwwAMBsDAADKBgAgCAAAmQcAIAsAAIkGACAMAADLBgAgDwAAzAYAIBAAAJsHACAZAADNBgAg3AMAAJoHADDdAwAAEQAQ3gMAAJoHADDfAwEAAAAB7QMBAAAAAfADQADvBQAh-wNAAO8FACH-AyAA7gUAIf8DQACIBgAhpAQBAIcGACGlBAEA7QUAIaYEAQAAAAGnBAEAmgYAIagEAQCaBgAhqQQBAJoGACGqBAIAwAYAIasEAgDABgAhrAQBAJoGACG1BCAA7gUAIbYEIADuBQAhAgAAABMAICkAAPsIACACAAAA-QgAICkAAPoIACAU3AMAAPgIADDdAwAA-QgAEN4DAAD4CAAw3wMBAO0FACHtAwEAhwYAIfADQADvBQAh-wNAAO8FACH-AyAA7gUAIf8DQACIBgAhpAQBAIcGACGlBAEA7QUAIaYEAQDtBQAhpwQBAJoGACGoBAEAmgYAIakEAQCaBgAhqgQCAMAGACGrBAIAwAYAIawEAQCaBgAhtQQgAO4FACG2BCAA7gUAIRTcAwAA-AgAMN0DAAD5CAAQ3gMAAPgIADDfAwEA7QUAIe0DAQCHBgAh8ANAAO8FACH7A0AA7wUAIf4DIADuBQAh_wNAAIgGACGkBAEAhwYAIaUEAQDtBQAhpgQBAO0FACGnBAEAmgYAIagEAQCaBgAhqQQBAJoGACGqBAIAwAYAIasEAgDABgAhrAQBAJoGACG1BCAA7gUAIbYEIADuBQAhEN8DAQCnBwAh7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIaUEAQCnBwAhpgQBAKcHACGnBAEAtAcAIagEAQC0BwAhqQQBALQHACGqBAIAswcAIasEAgCzBwAhrAQBALQHACG1BCAAqAcAIbYEIACoBwAhFgMAAPwIACALAAD9CAAgDAAA_ggAIA8AAP8IACAQAACACQAgGQAAgQkAIN8DAQCnBwAh7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIaUEAQCnBwAhpgQBAKcHACGnBAEAtAcAIagEAQC0BwAhqQQBALQHACGqBAIAswcAIasEAgCzBwAhrAQBALQHACG1BCAAqAcAIbYEIACoBwAhBTAAAJMMACAxAACpDAAg-wQAAJQMACD8BAAAqAwAIIEFAADGAQAgCzAAAK0JADAxAACxCQAw-wQAAK4JADD8BAAArwkAMP0EAACwCQAg_gQAAMUHADD_BAAAxQcAMIAFAADFBwAwgQUAAMUHADCCBQAAsgkAMIMFAADIBwAwCzAAAJ8JADAxAACkCQAw-wQAAKAJADD8BAAAoQkAMP0EAACiCQAg_gQAAKMJADD_BAAAowkAMIAFAACjCQAwgQUAAKMJADCCBQAApQkAMIMFAACmCQAwCzAAAJMJADAxAACYCQAw-wQAAJQJADD8BAAAlQkAMP0EAACWCQAg_gQAAJcJADD_BAAAlwkAMIAFAACXCQAwgQUAAJcJADCCBQAAmQkAMIMFAACaCQAwBzAAAI0JACAxAACQCQAg-wQAAI4JACD8BAAAjwkAIP8EAAAlACCABQAAJQAggQUAAPMDACALMAAAggkAMDEAAIYJADD7BAAAgwkAMPwEAACECQAw_QQAAIUJACD-BAAA3wcAMP8EAADfBwAwgAUAAN8HADCBBQAA3wcAMIIFAACHCQAwgwUAAOIHADAJBgAAqwgAIA4AAIwJACAVAACtCAAgGAAArggAIO0DAQAAAAHwA0AAAAAB-AMBAAAAAfoDAQAAAAH7A0AAAAABAgAAACkAIDAAAIsJACADAAAAKQAgMAAAiwkAIDEAAIkJACABKQAApwwAMAIAAAApACApAACJCQAgAgAAAOMHACApAACICQAgBe0DAQCnBwAh8ANAAKkHACH4AwEApwcAIfoDAQC0BwAh-wNAAKkHACEJBgAA5gcAIA4AAIoJACAVAADoBwAgGAAA6QcAIO0DAQCnBwAh8ANAAKkHACH4AwEApwcAIfoDAQC0BwAh-wNAAKkHACEHMAAAogwAIDEAAKUMACD7BAAAowwAIPwEAACkDAAg_wQAAA0AIIAFAAANACCBBQAADwAgCQYAAKsIACAOAACMCQAgFQAArQgAIBgAAK4IACDtAwEAAAAB8ANAAAAAAfgDAQAAAAH6AwEAAAAB-wNAAAAAAQMwAACiDAAg-wQAAKMMACCBBQAADwAgB-0DAQAAAAHwA0AAAAAB9QMAAACeBAL7A0AAAAABngQBAAAAAZ8EAQAAAAGgBEAAAAABAgAAAPMDACAwAACNCQAgAwAAACUAIDAAAI0JACAxAACRCQAgCQAAACUAICkAAJEJACDtAwEApwcAIfADQACpBwAh9QMAAJIJngQi-wNAAKkHACGeBAEAtAcAIZ8EAQC0BwAhoARAALYHACEH7QMBAKcHACHwA0AAqQcAIfUDAACSCZ4EIvsDQACpBwAhngQBALQHACGfBAEAtAcAIaAEQAC2BwAhAf4EAAAAngQCDAYAALoHACAOAAC8BwAg7QMBAAAAAfADQAAAAAHyAwIAAAAB8wMBAAAAAfUDAAAA9QMC9gMBAAAAAfcDQAAAAAH4AwEAAAAB-gMBAAAAAfsDQAAAAAECAAAAIgAgMAAAngkAIAMAAAAiACAwAACeCQAgMQAAnQkAIAEpAAChDAAwEQYAAI4HACANAACwBgAgDgAAjQcAINwDAACSBwAw3QMAACAAEN4DAACSBwAw7QMBAAAAAfADQADvBQAh8gMCAMAGACHzAwEAmgYAIfUDAACTB_UDIvYDAQCaBgAh9wNAAIgGACH4AwEAhwYAIfkDAQCHBgAh-gMBAAAAAfsDQADvBQAhAgAAACIAICkAAJ0JACACAAAAmwkAICkAAJwJACAO3AMAAJoJADDdAwAAmwkAEN4DAACaCQAw7QMBAIcGACHwA0AA7wUAIfIDAgDABgAh8wMBAJoGACH1AwAAkwf1AyL2AwEAmgYAIfcDQACIBgAh-AMBAIcGACH5AwEAhwYAIfoDAQCMBwAh-wNAAO8FACEO3AMAAJoJADDdAwAAmwkAEN4DAACaCQAw7QMBAIcGACHwA0AA7wUAIfIDAgDABgAh8wMBAJoGACH1AwAAkwf1AyL2AwEAmgYAIfcDQACIBgAh-AMBAIcGACH5AwEAhwYAIfoDAQCMBwAh-wNAAO8FACEK7QMBAKcHACHwA0AAqQcAIfIDAgCzBwAh8wMBALQHACH1AwAAtQf1AyL2AwEAtAcAIfcDQAC2BwAh-AMBAKcHACH6AwEAtAcAIfsDQACpBwAhDAYAALcHACAOAAC5BwAg7QMBAKcHACHwA0AAqQcAIfIDAgCzBwAh8wMBALQHACH1AwAAtQf1AyL2AwEAtAcAIfcDQAC2BwAh-AMBAKcHACH6AwEAtAcAIfsDQACpBwAhDAYAALoHACAOAAC8BwAg7QMBAAAAAfADQAAAAAHyAwIAAAAB8wMBAAAAAfUDAAAA9QMC9gMBAAAAAfcDQAAAAAH4AwEAAAAB-gMBAAAAAfsDQAAAAAEXBgAAuwgAIBkAAL4IACAcAACsCQAgHQAAvAgAIB4AAL0IACDtAwEAAAAB8ANAAAAAAfUDAAAAwwQC-AMBAAAAAfsDQAAAAAHBBAEAAAABwwQAAACFBALEBEAAAAABxQRAAAAAAcYEQAAAAAHHBEAAAAAByAQBAAAAAcoEAAAAygQDywRAAAAAAcwEAQAAAAHNBAAAAMoEA84EAQAAAAHPBAEAAAABAgAAAA8AIDAAAKsJACADAAAADwAgMAAAqwkAIDEAAKkJACABKQAAoAwAMBwGAACOBwAgDQAA5QYAIBkAAM0GACAcAACfBwAgHQAAoAcAIB4AAKEHACDcAwAAnAcAMN0DAAANABDeAwAAnAcAMO0DAQAAAAHwA0AA7wUAIfUDAACdB8MEIvgDAQCHBgAh-QMBAIwHACH7A0AA7wUAIcEEAQAAAAHDBAAAmAaFBCLEBEAA7wUAIcUEQACIBgAhxgRAAIgGACHHBEAAiAYAIcgEAQCaBgAhygQAAJ4HygQjywRAAIgGACHMBAEAmgYAIc0EAACeB8oEI84EAQCaBgAhzwQBAAAAAQIAAAAPACApAACpCQAgAgAAAKcJACApAACoCQAgFtwDAACmCQAw3QMAAKcJABDeAwAApgkAMO0DAQCHBgAh8ANAAO8FACH1AwAAnQfDBCL4AwEAhwYAIfkDAQCMBwAh-wNAAO8FACHBBAEAhwYAIcMEAACYBoUEIsQEQADvBQAhxQRAAIgGACHGBEAAiAYAIccEQACIBgAhyAQBAJoGACHKBAAAngfKBCPLBEAAiAYAIcwEAQCaBgAhzQQAAJ4HygQjzgQBAJoGACHPBAEAhwYAIRbcAwAApgkAMN0DAACnCQAQ3gMAAKYJADDtAwEAhwYAIfADQADvBQAh9QMAAJ0HwwQi-AMBAIcGACH5AwEAjAcAIfsDQADvBQAhwQQBAIcGACHDBAAAmAaFBCLEBEAA7wUAIcUEQACIBgAhxgRAAIgGACHHBEAAiAYAIcgEAQCaBgAhygQAAJ4HygQjywRAAIgGACHMBAEAmgYAIc0EAACeB8oEI84EAQCaBgAhzwQBAIcGACES7QMBAKcHACHwA0AAqQcAIfUDAADTB8MEIvgDAQCnBwAh-wNAAKkHACHBBAEApwcAIcMEAADUB4UEIsQEQACpBwAhxQRAALYHACHGBEAAtgcAIccEQAC2BwAhyAQBALQHACHKBAAA1QfKBCPLBEAAtgcAIcwEAQC0BwAhzQQAANUHygQjzgQBALQHACHPBAEApwcAIRcGAADWBwAgGQAA2QcAIBwAAKoJACAdAADXBwAgHgAA2AcAIO0DAQCnBwAh8ANAAKkHACH1AwAA0wfDBCL4AwEApwcAIfsDQACpBwAhwQQBAKcHACHDBAAA1AeFBCLEBEAAqQcAIcUEQAC2BwAhxgRAALYHACHHBEAAtgcAIcgEAQC0BwAhygQAANUHygQjywRAALYHACHMBAEAtAcAIc0EAADVB8oEI84EAQC0BwAhzwQBAKcHACEFMAAAmwwAIDEAAJ4MACD7BAAAnAwAIPwEAACdDAAggQUAAB0AIBcGAAC7CAAgGQAAvggAIBwAAKwJACAdAAC8CAAgHgAAvQgAIO0DAQAAAAHwA0AAAAAB9QMAAADDBAL4AwEAAAAB-wNAAAAAAcEEAQAAAAHDBAAAAIUEAsQEQAAAAAHFBEAAAAABxgRAAAAAAccEQAAAAAHIBAEAAAABygQAAADKBAPLBEAAAAABzAQBAAAAAc0EAAAAygQDzgQBAAAAAc8EAQAAAAEDMAAAmwwAIPsEAACcDAAggQUAAB0AIAsOAADCCAAgGwAAtwkAIO0DAQAAAAHwA0AAAAAB-gMBAAAAAfsDQAAAAAH-AyAAAAAB_wNAAAAAAaEEAQAAAAGiBCAAAAABowQgAAAAAQIAAAAdACAwAAC2CQAgAwAAAB0AIDAAALYJACAxAAC0CQAgASkAAJoMADACAAAAHQAgKQAAtAkAIAIAAADJBwAgKQAAswkAIAntAwEApwcAIfADQACpBwAh-gMBALQHACH7A0AAqQcAIf4DIACoBwAh_wNAALYHACGhBAEApwcAIaIEIACoBwAhowQgAKgHACELDgAAzQcAIBsAALUJACDtAwEApwcAIfADQACpBwAh-gMBALQHACH7A0AAqQcAIf4DIACoBwAh_wNAALYHACGhBAEApwcAIaIEIACoBwAhowQgAKgHACEFMAAAlQwAIDEAAJgMACD7BAAAlgwAIPwEAACXDAAggQUAAP4EACALDgAAwggAIBsAALcJACDtAwEAAAAB8ANAAAAAAfoDAQAAAAH7A0AAAAAB_gMgAAAAAf8DQAAAAAGhBAEAAAABogQgAAAAAaMEIAAAAAEDMAAAlQwAIPsEAACWDAAggQUAAP4EACAWAwAAuQkAIAsAALoJACAMAAC7CQAgDwAAvAkAIBAAAL0JACAZAAC-CQAg3wMBAAAAAe0DAQAAAAHwA0AAAAAB-wNAAAAAAf4DIAAAAAH_A0AAAAABpQQBAAAAAaYEAQAAAAGnBAEAAAABqAQBAAAAAakEAQAAAAGqBAIAAAABqwQCAAAAAawEAQAAAAG1BCAAAAABtgQgAAAAAQMwAACTDAAg-wQAAJQMACCBBQAAxgEAIAQwAACtCQAw-wQAAK4JADD9BAAAsAkAIIEFAADFBwAwBDAAAJ8JADD7BAAAoAkAMP0EAACiCQAggQUAAKMJADAEMAAAkwkAMPsEAACUCQAw_QQAAJYJACCBBQAAlwkAMAMwAACNCQAg-wQAAI4JACCBBQAA8wMAIAQwAACCCQAw-wQAAIMJADD9BAAAhQkAIIEFAADfBwAwBDAAAPEIADD7BAAA8ggAMP0EAAD0CAAggQUAAPUIADAEMAAA4QgAMPsEAADiCAAw_QQAAOQIACCBBQAA5QgAMAAAAAAABTAAAI4MACAxAACRDAAg-wQAAI8MACD8BAAAkAwAIIEFAAATACADMAAAjgwAIPsEAACPDAAggQUAABMAIAwDAACJCgAgCAAAyAsAIAsAAMQIACAMAACKCgAgDwAAiwoAIBAAAMkLACAZAACMCgAg_wMAAK0HACCnBAAArQcAIKgEAACtBwAgqQQAAK0HACCsBAAArQcAIAAAAAAAAAAABTAAAIkMACAxAACMDAAg-wQAAIoMACD8BAAAiwwAIIEFAACLBAAgAzAAAIkMACD7BAAAigwAIIEFAACLBAAgAAAAAAAFMAAAhAwAIDEAAIcMACD7BAAAhQwAIPwEAACGDAAggQUAAIsEACADMAAAhAwAIPsEAACFDAAggQUAAIsEACAAAAAAAAH-BAAAALkEAgAAAAAAAAUwAAD8CwAgMQAAggwAIPsEAAD9CwAg_AQAAIEMACCBBQAAxgEAIAswAAD8CQAwMQAAgAoAMPsEAAD9CQAw_AQAAP4JADD9BAAA_wkAIP4EAACjCQAw_wQAAKMJADCABQAAowkAMIEFAACjCQAwggUAAIEKADCDBQAApgkAMAswAADzCQAwMQAA9wkAMPsEAAD0CQAw_AQAAPUJADD9BAAA9gkAIP4EAACXCQAw_wQAAJcJADCABQAAlwkAMIEFAACXCQAwggUAAPgJADCDBQAAmgkAMAswAADqCQAwMQAA7gkAMPsEAADrCQAw_AQAAOwJADD9BAAA7QkAIP4EAADfBwAw_wQAAN8HADCABQAA3wcAMIEFAADfBwAwggUAAO8JADCDBQAA4gcAMAkNAACsCAAgDgAAjAkAIBUAAK0IACAYAACuCAAg7QMBAAAAAfADQAAAAAH5AwEAAAAB-gMBAAAAAfsDQAAAAAECAAAAKQAgMAAA8gkAIAMAAAApACAwAADyCQAgMQAA8QkAIAEpAACADAAwAgAAACkAICkAAPEJACACAAAA4wcAICkAAPAJACAF7QMBAKcHACHwA0AAqQcAIfkDAQCnBwAh-gMBALQHACH7A0AAqQcAIQkNAADnBwAgDgAAigkAIBUAAOgHACAYAADpBwAg7QMBAKcHACHwA0AAqQcAIfkDAQCnBwAh-gMBALQHACH7A0AAqQcAIQkNAACsCAAgDgAAjAkAIBUAAK0IACAYAACuCAAg7QMBAAAAAfADQAAAAAH5AwEAAAAB-gMBAAAAAfsDQAAAAAEMDQAAuwcAIA4AALwHACDtAwEAAAAB8ANAAAAAAfIDAgAAAAHzAwEAAAAB9QMAAAD1AwL2AwEAAAAB9wNAAAAAAfkDAQAAAAH6AwEAAAAB-wNAAAAAAQIAAAAiACAwAAD7CQAgAwAAACIAIDAAAPsJACAxAAD6CQAgASkAAP8LADACAAAAIgAgKQAA-gkAIAIAAACbCQAgKQAA-QkAIArtAwEApwcAIfADQACpBwAh8gMCALMHACHzAwEAtAcAIfUDAAC1B_UDIvYDAQC0BwAh9wNAALYHACH5AwEApwcAIfoDAQC0BwAh-wNAAKkHACEMDQAAuAcAIA4AALkHACDtAwEApwcAIfADQACpBwAh8gMCALMHACHzAwEAtAcAIfUDAAC1B_UDIvYDAQC0BwAh9wNAALYHACH5AwEApwcAIfoDAQC0BwAh-wNAAKkHACEMDQAAuwcAIA4AALwHACDtAwEAAAAB8ANAAAAAAfIDAgAAAAHzAwEAAAAB9QMAAAD1AwL2AwEAAAAB9wNAAAAAAfkDAQAAAAH6AwEAAAAB-wNAAAAAARcNAAC_CAAgGQAAvggAIBwAAKwJACAdAAC8CAAgHgAAvQgAIO0DAQAAAAHwA0AAAAAB9QMAAADDBAL5AwEAAAAB-wNAAAAAAcEEAQAAAAHDBAAAAIUEAsQEQAAAAAHFBEAAAAABxgRAAAAAAccEQAAAAAHIBAEAAAABygQAAADKBAPLBEAAAAABzAQBAAAAAc0EAAAAygQDzgQBAAAAAc8EAQAAAAECAAAADwAgMAAAhAoAIAMAAAAPACAwAACECgAgMQAAgwoAIAEpAAD-CwAwAgAAAA8AICkAAIMKACACAAAApwkAICkAAIIKACAS7QMBAKcHACHwA0AAqQcAIfUDAADTB8MEIvkDAQC0BwAh-wNAAKkHACHBBAEApwcAIcMEAADUB4UEIsQEQACpBwAhxQRAALYHACHGBEAAtgcAIccEQAC2BwAhyAQBALQHACHKBAAA1QfKBCPLBEAAtgcAIcwEAQC0BwAhzQQAANUHygQjzgQBALQHACHPBAEApwcAIRcNAADaBwAgGQAA2QcAIBwAAKoJACAdAADXBwAgHgAA2AcAIO0DAQCnBwAh8ANAAKkHACH1AwAA0wfDBCL5AwEAtAcAIfsDQACpBwAhwQQBAKcHACHDBAAA1AeFBCLEBEAAqQcAIcUEQAC2BwAhxgRAALYHACHHBEAAtgcAIcgEAQC0BwAhygQAANUHygQjywRAALYHACHMBAEAtAcAIc0EAADVB8oEI84EAQC0BwAhzwQBAKcHACEXDQAAvwgAIBkAAL4IACAcAACsCQAgHQAAvAgAIB4AAL0IACDtAwEAAAAB8ANAAAAAAfUDAAAAwwQC-QMBAAAAAfsDQAAAAAHBBAEAAAABwwQAAACFBALEBEAAAAABxQRAAAAAAcYEQAAAAAHHBEAAAAAByAQBAAAAAcoEAAAAygQDywRAAAAAAcwEAQAAAAHNBAAAAMoEA84EAQAAAAHPBAEAAAABAzAAAPwLACD7BAAA_QsAIIEFAADGAQAgBDAAAPwJADD7BAAA_QkAMP0EAAD_CQAggQUAAKMJADAEMAAA8wkAMPsEAAD0CQAw_QQAAPYJACCBBQAAlwkAMAQwAADqCQAw-wQAAOsJADD9BAAA7QkAIIEFAADfBwAwCwQAAJ8LACAFAACgCwAgBgAAoQsAIAkAAMIJACANAADICQAgHwAAogsAICAAAKMLACAhAACkCwAgIwAApQsAIP8DAACtBwAg5wQAAK0HACAAAAAAAAAAAAAFMAAA9wsAIDEAAPoLACD7BAAA-AsAIPwEAAD5CwAggQUAADkAIAMwAAD3CwAg-wQAAPgLACCBBQAAOQAgAAAABTAAAPILACAxAAD1CwAg-wQAAPMLACD8BAAA9AsAIIEFAAApACADMAAA8gsAIPsEAADzCwAggQUAACkAIAAAAAAAAAUwAADtCwAgMQAA8AsAIPsEAADuCwAg_AQAAO8LACCBBQAAxgEAIAMwAADtCwAg-wQAAO4LACCBBQAAxgEAIAAAAAUwAADoCwAgMQAA6wsAIPsEAADpCwAg_AQAAOoLACCBBQAAxgEAIAMwAADoCwAg-wQAAOkLACCBBQAAxgEAIAAAAAH-BAAAAMoEAgH-BAAAAOYEAgswAACKCwAwMQAAjwsAMPsEAACLCwAw_AQAAIwLADD9BAAAjQsAIP4EAACOCwAw_wQAAI4LADCABQAAjgsAMIEFAACOCwAwggUAAJALADCDBQAAkQsAMAswAAD-CgAwMQAAgwsAMPsEAAD_CgAw_AQAAIALADD9BAAAgQsAIP4EAACCCwAw_wQAAIILADCABQAAggsAMIEFAACCCwAwggUAAIQLADCDBQAAhQsAMAcwAAD5CgAgMQAA_AoAIPsEAAD6CgAg_AQAAPsKACD_BAAACwAggAUAAAsAIIEFAADoAgAgBzAAAPQKACAxAAD3CgAg-wQAAPUKACD8BAAA9goAIP8EAAARACCABQAAEQAggQUAABMAIAcwAADvCgAgMQAA8goAIPsEAADwCgAg_AQAAPEKACD_BAAAVQAggAUAAFUAIIEFAAABACALMAAA4woAMDEAAOgKADD7BAAA5AoAMPwEAADlCgAw_QQAAOYKACD-BAAA5woAMP8EAADnCgAwgAUAAOcKADCBBQAA5woAMIIFAADpCgAwgwUAAOoKADALMAAA2goAMDEAAN4KADD7BAAA2woAMPwEAADcCgAw_QQAAN0KACD-BAAAmAgAMP8EAACYCAAwgAUAAJgIADCBBQAAmAgAMIIFAADfCgAwgwUAAJsIADALMAAAvgoAMDEAAMMKADD7BAAAvwoAMPwEAADACgAw_QQAAMEKACD-BAAAwgoAMP8EAADCCgAwgAUAAMIKADCBBQAAwgoAMIIFAADECgAwgwUAAMUKADALMAAAtQoAMDEAALkKADD7BAAAtgoAMPwEAAC3CgAw_QQAALgKACD-BAAA5QgAMP8EAADlCAAwgAUAAOUIADCBBQAA5QgAMIIFAAC6CgAwgwUAAOgIADAVCAAA0gkAIO0DAQAAAAHwA0AAAAAB9QMAAACyBAL7A0AAAAABpAQBAAAAAaUEAQAAAAGmBAEAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQCAAAAAasEAgAAAAGsBAEAAAABrQQBAAAAAa4EAQAAAAGvBAEAAAABsAQCAAAAAbIEAQAAAAGzBAEAAAABtARAAAAAAQIAAAAXACAwAAC9CgAgAwAAABcAIDAAAL0KACAxAAC8CgAgASkAAOcLADACAAAAFwAgKQAAvAoAIAIAAADpCAAgKQAAuwoAIBTtAwEApwcAIfADQACpBwAh9QMAAOwIsgQi-wNAAKkHACGkBAEApwcAIaUEAQCnBwAhpgQBAKcHACGnBAEAtAcAIagEAQC0BwAhqQQBALQHACGqBAIAswcAIasEAgCzBwAhrAQBALQHACGtBAEAtAcAIa4EAQC0BwAhrwQBALQHACGwBAIA6wgAIbIEAQC0BwAhswQBALQHACG0BEAAtgcAIRUIAADRCQAg7QMBAKcHACHwA0AAqQcAIfUDAADsCLIEIvsDQACpBwAhpAQBAKcHACGlBAEApwcAIaYEAQCnBwAhpwQBALQHACGoBAEAtAcAIakEAQC0BwAhqgQCALMHACGrBAIAswcAIawEAQC0BwAhrQQBALQHACGuBAEAtAcAIa8EAQC0BwAhsAQCAOsIACGyBAEAtAcAIbMEAQC0BwAhtARAALYHACEVCAAA0gkAIO0DAQAAAAHwA0AAAAAB9QMAAACyBAL7A0AAAAABpAQBAAAAAaUEAQAAAAGmBAEAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQCAAAAAasEAgAAAAGsBAEAAAABrQQBAAAAAa4EAQAAAAGvBAEAAAABsAQCAAAAAbIEAQAAAAGzBAEAAAABtARAAAAAAQUVAADZCgAg7QMBAAAAAfADQAAAAAH7A0AAAAABqQQBAAAAAQIAAABeACAwAADYCgAgAwAAAF4AIDAAANgKACAxAADICgAgASkAAOYLADAKAwAAygYAIBUAAPsGACDcAwAA-gYAMN0DAABcABDeAwAA-gYAMN8DAQDtBQAh7QMBAAAAAfADQADvBQAh-wNAAO8FACGpBAEA7QUAIQIAAABeACApAADICgAgAgAAAMYKACApAADHCgAgCNwDAADFCgAw3QMAAMYKABDeAwAAxQoAMN8DAQDtBQAh7QMBAIcGACHwA0AA7wUAIfsDQADvBQAhqQQBAO0FACEI3AMAAMUKADDdAwAAxgoAEN4DAADFCgAw3wMBAO0FACHtAwEAhwYAIfADQADvBQAh-wNAAO8FACGpBAEA7QUAIQTtAwEApwcAIfADQACpBwAh-wNAAKkHACGpBAEApwcAIQUVAADJCgAg7QMBAKcHACHwA0AAqQcAIfsDQACpBwAhqQQBAKcHACELMAAAygoAMDEAAM8KADD7BAAAywoAMPwEAADMCgAw_QQAAM0KACD-BAAAzgoAMP8EAADOCgAwgAUAAM4KADCBBQAAzgoAMIIFAADQCgAwgwUAANEKADAJ7QMBAAAAAfsDQAAAAAHSBAAAAO4EAu4EAQAAAAHvBAEAAAAB8AQBAAAAAfEEAgAAAAHyBAIAAAAB9AQAAAD0BAMCAAAAYgAgMAAA1woAIAMAAABiACAwAADXCgAgMQAA1goAIAEpAADlCwAwDiIAAPkGACDcAwAA9gYAMN0DAABgABDeAwAA9gYAMO0DAQAAAAH7A0AA7wUAIdIEAAD3Bu4EIuwEAQCHBgAh7gQBAO0FACHvBAEAmgYAIfAEAQCaBgAh8QQCAL8GACHyBAIAvwYAIfQEAAD4BvQEIwIAAABiACApAADWCgAgAgAAANIKACApAADTCgAgDdwDAADRCgAw3QMAANIKABDeAwAA0QoAMO0DAQCHBgAh-wNAAO8FACHSBAAA9wbuBCLsBAEAhwYAIe4EAQDtBQAh7wQBAJoGACHwBAEAmgYAIfEEAgC_BgAh8gQCAL8GACH0BAAA-Ab0BCMN3AMAANEKADDdAwAA0goAEN4DAADRCgAw7QMBAIcGACH7A0AA7wUAIdIEAAD3Bu4EIuwEAQCHBgAh7gQBAO0FACHvBAEAmgYAIfAEAQCaBgAh8QQCAL8GACHyBAIAvwYAIfQEAAD4BvQEIwntAwEApwcAIfsDQACpBwAh0gQAANQK7gQi7gQBAKcHACHvBAEAtAcAIfAEAQC0BwAh8QQCAOsIACHyBAIA6wgAIfQEAADVCvQEIwH-BAAAAO4EAgH-BAAAAPQEAwntAwEApwcAIfsDQACpBwAh0gQAANQK7gQi7gQBAKcHACHvBAEAtAcAIfAEAQC0BwAh8QQCAOsIACHyBAIA6wgAIfQEAADVCvQEIwntAwEAAAAB-wNAAAAAAdIEAAAA7gQC7gQBAAAAAe8EAQAAAAHwBAEAAAAB8QQCAAAAAfIEAgAAAAH0BAAAAPQEAwUVAADZCgAg7QMBAAAAAfADQAAAAAH7A0AAAAABqQQBAAAAAQQwAADKCgAw-wQAAMsKADD9BAAAzQoAIIEFAADOCgAwBRIAANYIACDtAwEAAAAB-wNAAAAAAZMEAQAAAAGUBAEAAAABAgAAADQAIDAAAOIKACADAAAANAAgMAAA4goAIDEAAOEKACABKQAA5AsAMAIAAAA0ACApAADhCgAgAgAAAJwIACApAADgCgAgBO0DAQCnBwAh-wNAAKkHACGTBAEApwcAIZQEAQCnBwAhBRIAANUIACDtAwEApwcAIfsDQACpBwAhkwQBAKcHACGUBAEApwcAIQUSAADWCAAg7QMBAAAAAfsDQAAAAAGTBAEAAAABlAQBAAAAAQUSAQAAAAHtAwEAAAAB-wNAAAAAAZEEAQAAAAGSBCAAAAABAgAAAFkAIDAAAO4KACADAAAAWQAgMAAA7goAIDEAAO0KACABKQAA4wsAMAoDAADKBgAgEgEA7QUAIdwDAAD8BgAw3QMAAFcAEN4DAAD8BgAw3wMBAO0FACHtAwEAAAAB-wNAAO8FACGRBAEA7QUAIZIEIADuBQAhAgAAAFkAICkAAO0KACACAAAA6woAICkAAOwKACAJEgEA7QUAIdwDAADqCgAw3QMAAOsKABDeAwAA6goAMN8DAQDtBQAh7QMBAO0FACH7A0AA7wUAIZEEAQDtBQAhkgQgAO4FACEJEgEA7QUAIdwDAADqCgAw3QMAAOsKABDeAwAA6goAMN8DAQDtBQAh7QMBAO0FACH7A0AA7wUAIZEEAQDtBQAhkgQgAO4FACEFEgEApwcAIe0DAQCnBwAh-wNAAKkHACGRBAEApwcAIZIEIACoBwAhBRIBAKcHACHtAwEApwcAIfsDQACpBwAhkQQBAKcHACGSBCAAqAcAIQUSAQAAAAHtAwEAAAAB-wNAAAAAAZEEAQAAAAGSBCAAAAABCe0DAQAAAAHwA0AAAAAB-wNAAAAAAf4DIAAAAAH_A0AAAAABmgQBAAAAAaYEAQAAAAGsBAEAAAAB9QQBAAAAAQIAAAABACAwAADvCgAgAwAAAFUAIDAAAO8KACAxAADzCgAgCwAAAFUAICkAAPMKACDtAwEApwcAIfADQACpBwAh-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhmgQBAKcHACGmBAEApwcAIawEAQC0BwAh9QQBALQHACEJ7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIZoEAQCnBwAhpgQBAKcHACGsBAEAtAcAIfUEAQC0BwAhFggAANkJACALAAC6CQAgDAAAuwkAIA8AALwJACAQAAC9CQAgGQAAvgkAIO0DAQAAAAHwA0AAAAAB-wNAAAAAAf4DIAAAAAH_A0AAAAABpAQBAAAAAaUEAQAAAAGmBAEAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQCAAAAAasEAgAAAAGsBAEAAAABtQQgAAAAAbYEIAAAAAECAAAAEwAgMAAA9AoAIAMAAAARACAwAAD0CgAgMQAA-AoAIBgAAAARACAIAADYCQAgCwAA_QgAIAwAAP4IACAPAAD_CAAgEAAAgAkAIBkAAIEJACApAAD4CgAg7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIaQEAQCnBwAhpQQBAKcHACGmBAEApwcAIacEAQC0BwAhqAQBALQHACGpBAEAtAcAIaoEAgCzBwAhqwQCALMHACGsBAEAtAcAIbUEIACoBwAhtgQgAKgHACEWCAAA2AkAIAsAAP0IACAMAAD-CAAgDwAA_wgAIBAAAIAJACAZAACBCQAg7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIaQEAQCnBwAhpQQBAKcHACGmBAEApwcAIacEAQC0BwAhqAQBALQHACGpBAEAtAcAIaoEAgCzBwAhqwQCALMHACGsBAEAtAcAIbUEIACoBwAhtgQgAKgHACENDAAAhgoAIA8AAIcKACAZAACICgAg7QMBAAAAAfADQAAAAAH7A0AAAAAB_gMgAAAAAf8DQAAAAAGlBAEAAAABpgQBAAAAAacEAQAAAAGsBAEAAAAB0AQBAAAAAQIAAADoAgAgMAAA-QoAIAMAAAALACAwAAD5CgAgMQAA_QoAIA8AAAALACAMAADnCQAgDwAA6AkAIBkAAOkJACApAAD9CgAg7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIaUEAQCnBwAhpgQBAKcHACGnBAEAtAcAIawEAQC0BwAh0AQBALQHACENDAAA5wkAIA8AAOgJACAZAADpCQAg7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIaUEAQCnBwAhpgQBAKcHACGnBAEAtAcAIawEAQC0BwAh0AQBALQHACEM7QMBAAAAAfADQAAAAAH7A0AAAAAB2AQBAAAAAdkEAQAAAAHaBAEAAAAB2wQBAAAAAdwEAQAAAAHdBEAAAAAB3gRAAAAAAd8EAQAAAAHgBAEAAAABAgAAAAkAIDAAAIkLACADAAAACQAgMAAAiQsAIDEAAIgLACABKQAA4gsAMBEDAADKBgAg3AMAAKIHADDdAwAABwAQ3gMAAKIHADDfAwEA7QUAIe0DAQAAAAHwA0AA7wUAIfsDQADvBQAh2AQBAO0FACHZBAEA7QUAIdoEAQCaBgAh2wQBAJoGACHcBAEAmgYAId0EQACIBgAh3gRAAIgGACHfBAEAmgYAIeAEAQCaBgAhAgAAAAkAICkAAIgLACACAAAAhgsAICkAAIcLACAQ3AMAAIULADDdAwAAhgsAEN4DAACFCwAw3wMBAO0FACHtAwEA7QUAIfADQADvBQAh-wNAAO8FACHYBAEA7QUAIdkEAQDtBQAh2gQBAJoGACHbBAEAmgYAIdwEAQCaBgAh3QRAAIgGACHeBEAAiAYAId8EAQCaBgAh4AQBAJoGACEQ3AMAAIULADDdAwAAhgsAEN4DAACFCwAw3wMBAO0FACHtAwEA7QUAIfADQADvBQAh-wNAAO8FACHYBAEA7QUAIdkEAQDtBQAh2gQBAJoGACHbBAEAmgYAIdwEAQCaBgAh3QRAAIgGACHeBEAAiAYAId8EAQCaBgAh4AQBAJoGACEM7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh2AQBAKcHACHZBAEApwcAIdoEAQC0BwAh2wQBALQHACHcBAEAtAcAId0EQAC2BwAh3gRAALYHACHfBAEAtAcAIeAEAQC0BwAhDO0DAQCnBwAh8ANAAKkHACH7A0AAqQcAIdgEAQCnBwAh2QQBAKcHACHaBAEAtAcAIdsEAQC0BwAh3AQBALQHACHdBEAAtgcAId4EQAC2BwAh3wQBALQHACHgBAEAtAcAIQztAwEAAAAB8ANAAAAAAfsDQAAAAAHYBAEAAAAB2QQBAAAAAdoEAQAAAAHbBAEAAAAB3AQBAAAAAd0EQAAAAAHeBEAAAAAB3wQBAAAAAeAEAQAAAAEH7QMBAAAAAfADQAAAAAH7A0AAAAABvQRAAAAAAeEEAQAAAAHiBAEAAAAB4wQBAAAAAQIAAAAFACAwAACVCwAgAwAAAAUAIDAAAJULACAxAACUCwAgASkAAOELADAMAwAAygYAINwDAACjBwAw3QMAAAMAEN4DAACjBwAw3wMBAO0FACHtAwEAAAAB8ANAAO8FACH7A0AA7wUAIb0EQADvBQAh4QQBAAAAAeIEAQCaBgAh4wQBAJoGACECAAAABQAgKQAAlAsAIAIAAACSCwAgKQAAkwsAIAvcAwAAkQsAMN0DAACSCwAQ3gMAAJELADDfAwEA7QUAIe0DAQDtBQAh8ANAAO8FACH7A0AA7wUAIb0EQADvBQAh4QQBAO0FACHiBAEAmgYAIeMEAQCaBgAhC9wDAACRCwAw3QMAAJILABDeAwAAkQsAMN8DAQDtBQAh7QMBAO0FACHwA0AA7wUAIfsDQADvBQAhvQRAAO8FACHhBAEA7QUAIeIEAQCaBgAh4wQBAJoGACEH7QMBAKcHACHwA0AAqQcAIfsDQACpBwAhvQRAAKkHACHhBAEApwcAIeIEAQC0BwAh4wQBALQHACEH7QMBAKcHACHwA0AAqQcAIfsDQACpBwAhvQRAAKkHACHhBAEApwcAIeIEAQC0BwAh4wQBALQHACEH7QMBAAAAAfADQAAAAAH7A0AAAAABvQRAAAAAAeEEAQAAAAHiBAEAAAAB4wQBAAAAAQQwAACKCwAw-wQAAIsLADD9BAAAjQsAIIEFAACOCwAwBDAAAP4KADD7BAAA_woAMP0EAACBCwAggQUAAIILADADMAAA-QoAIPsEAAD6CgAggQUAAOgCACADMAAA9AoAIPsEAAD1CgAggQUAABMAIAMwAADvCgAg-wQAAPAKACCBBQAAAQAgBDAAAOMKADD7BAAA5AoAMP0EAADmCgAggQUAAOcKADAEMAAA2goAMPsEAADbCgAw_QQAAN0KACCBBQAAmAgAMAQwAAC-CgAw-wQAAL8KADD9BAAAwQoAIIEFAADCCgAwBDAAALUKADD7BAAAtgoAMP0EAAC4CgAggQUAAOUIADAAAAgDAACJCgAgDAAAigoAIA8AAIsKACAZAACMCgAg_wMAAK0HACCnBAAArQcAIKwEAACtBwAg0AQAAK0HACAEAwAAiQoAIP8DAACtBwAgrAQAAK0HACD1BAAArQcAIAAAAAAAAAAABTAAANwLACAxAADfCwAg-wQAAN0LACD8BAAA3gsAIIEFAAAuACADMAAA3AsAIPsEAADdCwAggQUAAC4AIAQRAADCCwAgEwAAxAsAIBQAAKQLACCZBAAArQcAIAAAAAAABTAAANcLACAxAADaCwAg-wQAANgLACD8BAAA2QsAIIEFAABeACADMAAA1wsAIPsEAADYCwAggQUAAF4AIAAAAAUwAADSCwAgMQAA1QsAIPsEAADTCwAg_AQAANQLACCBBQAAxgEAIAMwAADSCwAg-wQAANMLACCBBQAAxgEAIAAAAAUwAADNCwAgMQAA0AsAIPsEAADOCwAg_AQAAM8LACCBBQAAxgEAIAMwAADNCwAg-wQAAM4LACCBBQAAxgEAIAIDAACJCgAgFQAAwAsAIAAEEQAAwgsAIBcAAMMLACDFBAAArQcAIMYEAACtBwAgBgYAAKELACANAADICQAgDgAAzAgAIBUAAMULACAYAADGCwAg-gMAAK0HACAAARIAAK0LACAAAAIaAADECAAg_wMAAK0HACAFBwAAwQkAIAkAAMIJACD_AwAArQcAIJsEAACtBwAgnAQAAK0HACAEDQAAyAkAIJ4EAACtBwAgnwQAAK0HACCgBAAArQcAIAUNAADICQAgDgAAzAgAIBsAAMcLACD6AwAArQcAIP8DAACtBwAgBg4AAMwIACCFBAAArQcAIIYEAACtBwAghwQAAK0HACCJBAAArQcAIIoEAACtBwAgBwYAAKELACANAADICQAgDgAAzAgAIPMDAACtBwAg9gMAAK0HACD3AwAArQcAIPoDAACtBwAgFAQAAJYLACAFAACXCwAgBgAAmAsAIAkAAJ4LACANAACZCwAgIAAAmwsAICEAAJwLACAjAACdCwAg7QMBAAAAAfADQAAAAAH1AwAAAOYEAvsDQAAAAAH-AyAAAAAB_wNAAAAAAZoEAQAAAAGmBAEAAAAB0gQAAADKBALkBCAAAAAB5gQgAAAAAecEAQAAAAECAAAAxgEAIDAAAM0LACADAAAAyQEAIDAAAM0LACAxAADRCwAgFgAAAMkBACAEAACsCgAgBQAArQoAIAYAAK4KACAJAAC0CgAgDQAArwoAICAAALEKACAhAACyCgAgIwAAswoAICkAANELACDtAwEApwcAIfADQACpBwAh9QMAAKsK5gQi-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhmgQBAKcHACGmBAEApwcAIdIEAACqCsoEIuQEIACoBwAh5gQgAKgHACHnBAEAtAcAIRQEAACsCgAgBQAArQoAIAYAAK4KACAJAAC0CgAgDQAArwoAICAAALEKACAhAACyCgAgIwAAswoAIO0DAQCnBwAh8ANAAKkHACH1AwAAqwrmBCL7A0AAqQcAIf4DIACoBwAh_wNAALYHACGaBAEApwcAIaYEAQCnBwAh0gQAAKoKygQi5AQgAKgHACHmBCAAqAcAIecEAQC0BwAhFAQAAJYLACAFAACXCwAgBgAAmAsAIAkAAJ4LACANAACZCwAgHwAAmgsAICAAAJsLACAhAACcCwAg7QMBAAAAAfADQAAAAAH1AwAAAOYEAvsDQAAAAAH-AyAAAAAB_wNAAAAAAZoEAQAAAAGmBAEAAAAB0gQAAADKBALkBCAAAAAB5gQgAAAAAecEAQAAAAECAAAAxgEAIDAAANILACADAAAAyQEAIDAAANILACAxAADWCwAgFgAAAMkBACAEAACsCgAgBQAArQoAIAYAAK4KACAJAAC0CgAgDQAArwoAIB8AALAKACAgAACxCgAgIQAAsgoAICkAANYLACDtAwEApwcAIfADQACpBwAh9QMAAKsK5gQi-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhmgQBAKcHACGmBAEApwcAIdIEAACqCsoEIuQEIACoBwAh5gQgAKgHACHnBAEAtAcAIRQEAACsCgAgBQAArQoAIAYAAK4KACAJAAC0CgAgDQAArwoAIB8AALAKACAgAACxCgAgIQAAsgoAIO0DAQCnBwAh8ANAAKkHACH1AwAAqwrmBCL7A0AAqQcAIf4DIACoBwAh_wNAALYHACGaBAEApwcAIaYEAQCnBwAh0gQAAKoKygQi5AQgAKgHACHmBCAAqAcAIecEAQC0BwAhBgMAALkLACDfAwEAAAAB7QMBAAAAAfADQAAAAAH7A0AAAAABqQQBAAAAAQIAAABeACAwAADXCwAgAwAAAFwAIDAAANcLACAxAADbCwAgCAAAAFwAIAMAALgLACApAADbCwAg3wMBAKcHACHtAwEApwcAIfADQACpBwAh-wNAAKkHACGpBAEApwcAIQYDAAC4CwAg3wMBAKcHACHtAwEApwcAIfADQACpBwAh-wNAAKkHACGpBAEApwcAIQkRAADbCAAgFAAAqQgAIO0DAQAAAAHuAwEAAAAB-wNAAAAAAZEEAAAAmQQClQQBAAAAAZcEAAAAlwQCmQQBAAAAAQIAAAAuACAwAADcCwAgAwAAACwAIDAAANwLACAxAADgCwAgCwAAACwAIBEAANoIACAUAACTCAAgKQAA4AsAIO0DAQCnBwAh7gMBAKcHACH7A0AAqQcAIZEEAACQCJkEIpUEAQCnBwAhlwQAAIEIlwQimQQBALQHACEJEQAA2ggAIBQAAJMIACDtAwEApwcAIe4DAQCnBwAh-wNAAKkHACGRBAAAkAiZBCKVBAEApwcAIZcEAACBCJcEIpkEAQC0BwAhB-0DAQAAAAHwA0AAAAAB-wNAAAAAAb0EQAAAAAHhBAEAAAAB4gQBAAAAAeMEAQAAAAEM7QMBAAAAAfADQAAAAAH7A0AAAAAB2AQBAAAAAdkEAQAAAAHaBAEAAAAB2wQBAAAAAdwEAQAAAAHdBEAAAAAB3gRAAAAAAd8EAQAAAAHgBAEAAAABBRIBAAAAAe0DAQAAAAH7A0AAAAABkQQBAAAAAZIEIAAAAAEE7QMBAAAAAfsDQAAAAAGTBAEAAAABlAQBAAAAAQntAwEAAAAB-wNAAAAAAdIEAAAA7gQC7gQBAAAAAe8EAQAAAAHwBAEAAAAB8QQCAAAAAfIEAgAAAAH0BAAAAPQEAwTtAwEAAAAB8ANAAAAAAfsDQAAAAAGpBAEAAAABFO0DAQAAAAHwA0AAAAAB9QMAAACyBAL7A0AAAAABpAQBAAAAAaUEAQAAAAGmBAEAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQCAAAAAasEAgAAAAGsBAEAAAABrQQBAAAAAa4EAQAAAAGvBAEAAAABsAQCAAAAAbIEAQAAAAGzBAEAAAABtARAAAAAARQFAACXCwAgBgAAmAsAIAkAAJ4LACANAACZCwAgHwAAmgsAICAAAJsLACAhAACcCwAgIwAAnQsAIO0DAQAAAAHwA0AAAAAB9QMAAADmBAL7A0AAAAAB_gMgAAAAAf8DQAAAAAGaBAEAAAABpgQBAAAAAdIEAAAAygQC5AQgAAAAAeYEIAAAAAHnBAEAAAABAgAAAMYBACAwAADoCwAgAwAAAMkBACAwAADoCwAgMQAA7AsAIBYAAADJAQAgBQAArQoAIAYAAK4KACAJAAC0CgAgDQAArwoAIB8AALAKACAgAACxCgAgIQAAsgoAICMAALMKACApAADsCwAg7QMBAKcHACHwA0AAqQcAIfUDAACrCuYEIvsDQACpBwAh_gMgAKgHACH_A0AAtgcAIZoEAQCnBwAhpgQBAKcHACHSBAAAqgrKBCLkBCAAqAcAIeYEIACoBwAh5wQBALQHACEUBQAArQoAIAYAAK4KACAJAAC0CgAgDQAArwoAIB8AALAKACAgAACxCgAgIQAAsgoAICMAALMKACDtAwEApwcAIfADQACpBwAh9QMAAKsK5gQi-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhmgQBAKcHACGmBAEApwcAIdIEAACqCsoEIuQEIACoBwAh5gQgAKgHACHnBAEAtAcAIRQEAACWCwAgBgAAmAsAIAkAAJ4LACANAACZCwAgHwAAmgsAICAAAJsLACAhAACcCwAgIwAAnQsAIO0DAQAAAAHwA0AAAAAB9QMAAADmBAL7A0AAAAAB_gMgAAAAAf8DQAAAAAGaBAEAAAABpgQBAAAAAdIEAAAAygQC5AQgAAAAAeYEIAAAAAHnBAEAAAABAgAAAMYBACAwAADtCwAgAwAAAMkBACAwAADtCwAgMQAA8QsAIBYAAADJAQAgBAAArAoAIAYAAK4KACAJAAC0CgAgDQAArwoAIB8AALAKACAgAACxCgAgIQAAsgoAICMAALMKACApAADxCwAg7QMBAKcHACHwA0AAqQcAIfUDAACrCuYEIvsDQACpBwAh_gMgAKgHACH_A0AAtgcAIZoEAQCnBwAhpgQBAKcHACHSBAAAqgrKBCLkBCAAqAcAIeYEIACoBwAh5wQBALQHACEUBAAArAoAIAYAAK4KACAJAAC0CgAgDQAArwoAIB8AALAKACAgAACxCgAgIQAAsgoAICMAALMKACDtAwEApwcAIfADQACpBwAh9QMAAKsK5gQi-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhmgQBAKcHACGmBAEApwcAIdIEAACqCsoEIuQEIACoBwAh5gQgAKgHACHnBAEAtAcAIQoGAACrCAAgDQAArAgAIA4AAIwJACAVAACtCAAg7QMBAAAAAfADQAAAAAH4AwEAAAAB-QMBAAAAAfoDAQAAAAH7A0AAAAABAgAAACkAIDAAAPILACADAAAAJwAgMAAA8gsAIDEAAPYLACAMAAAAJwAgBgAA5gcAIA0AAOcHACAOAACKCQAgFQAA6AcAICkAAPYLACDtAwEApwcAIfADQACpBwAh-AMBAKcHACH5AwEApwcAIfoDAQC0BwAh-wNAAKkHACEKBgAA5gcAIA0AAOcHACAOAACKCQAgFQAA6AcAIO0DAQCnBwAh8ANAAKkHACH4AwEApwcAIfkDAQCnBwAh-gMBALQHACH7A0AAqQcAIQcRAACZCgAg7QMBAAAAAe4DAQAAAAH1AwAAANYEAvsDQAAAAAHFBEAAAAABxgRAAAAAAQIAAAA5ACAwAAD3CwAgAwAAADcAIDAAAPcLACAxAAD7CwAgCQAAADcAIBEAAJgKACApAAD7CwAg7QMBAKcHACHuAwEApwcAIfUDAAD0B9YEIvsDQACpBwAhxQRAALYHACHGBEAAtgcAIQcRAACYCgAg7QMBAKcHACHuAwEApwcAIfUDAAD0B9YEIvsDQACpBwAhxQRAALYHACHGBEAAtgcAIRQEAACWCwAgBQAAlwsAIAkAAJ4LACANAACZCwAgHwAAmgsAICAAAJsLACAhAACcCwAgIwAAnQsAIO0DAQAAAAHwA0AAAAAB9QMAAADmBAL7A0AAAAAB_gMgAAAAAf8DQAAAAAGaBAEAAAABpgQBAAAAAdIEAAAAygQC5AQgAAAAAeYEIAAAAAHnBAEAAAABAgAAAMYBACAwAAD8CwAgEu0DAQAAAAHwA0AAAAAB9QMAAADDBAL5AwEAAAAB-wNAAAAAAcEEAQAAAAHDBAAAAIUEAsQEQAAAAAHFBEAAAAABxgRAAAAAAccEQAAAAAHIBAEAAAABygQAAADKBAPLBEAAAAABzAQBAAAAAc0EAAAAygQDzgQBAAAAAc8EAQAAAAEK7QMBAAAAAfADQAAAAAHyAwIAAAAB8wMBAAAAAfUDAAAA9QMC9gMBAAAAAfcDQAAAAAH5AwEAAAAB-gMBAAAAAfsDQAAAAAEF7QMBAAAAAfADQAAAAAH5AwEAAAAB-gMBAAAAAfsDQAAAAAEDAAAAyQEAIDAAAPwLACAxAACDDAAgFgAAAMkBACAEAACsCgAgBQAArQoAIAkAALQKACANAACvCgAgHwAAsAoAICAAALEKACAhAACyCgAgIwAAswoAICkAAIMMACDtAwEApwcAIfADQACpBwAh9QMAAKsK5gQi-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhmgQBAKcHACGmBAEApwcAIdIEAACqCsoEIuQEIACoBwAh5gQgAKgHACHnBAEAtAcAIRQEAACsCgAgBQAArQoAIAkAALQKACANAACvCgAgHwAAsAoAICAAALEKACAhAACyCgAgIwAAswoAIO0DAQCnBwAh8ANAAKkHACH1AwAAqwrmBCL7A0AAqQcAIf4DIACoBwAh_wNAALYHACGaBAEApwcAIaYEAQCnBwAh0gQAAKoKygQi5AQgAKgHACHmBCAAqAcAIecEAQC0BwAhCQkAAMAJACDtAwEAAAAB8ANAAAAAAfsDQAAAAAH-AyAAAAAB_wNAAAAAAZoEAQAAAAGbBAEAAAABnAQBAAAAAQIAAACLBAAgMAAAhAwAIAMAAACOBAAgMAAAhAwAIDEAAIgMACALAAAAjgQAIAkAAOAIACApAACIDAAg7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIZoEAQCnBwAhmwQBALQHACGcBAEAtAcAIQkJAADgCAAg7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIZoEAQCnBwAhmwQBALQHACGcBAEAtAcAIQkHAAC_CQAg7QMBAAAAAfADQAAAAAH7A0AAAAAB_gMgAAAAAf8DQAAAAAGaBAEAAAABmwQBAAAAAZwEAQAAAAECAAAAiwQAIDAAAIkMACADAAAAjgQAIDAAAIkMACAxAACNDAAgCwAAAI4EACAHAADfCAAgKQAAjQwAIO0DAQCnBwAh8ANAAKkHACH7A0AAqQcAIf4DIACoBwAh_wNAALYHACGaBAEApwcAIZsEAQC0BwAhnAQBALQHACEJBwAA3wgAIO0DAQCnBwAh8ANAAKkHACH7A0AAqQcAIf4DIACoBwAh_wNAALYHACGaBAEApwcAIZsEAQC0BwAhnAQBALQHACEXAwAAuQkAIAgAANkJACALAAC6CQAgDAAAuwkAIA8AALwJACAZAAC-CQAg3wMBAAAAAe0DAQAAAAHwA0AAAAAB-wNAAAAAAf4DIAAAAAH_A0AAAAABpAQBAAAAAaUEAQAAAAGmBAEAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQCAAAAAasEAgAAAAGsBAEAAAABtQQgAAAAAbYEIAAAAAECAAAAEwAgMAAAjgwAIAMAAAARACAwAACODAAgMQAAkgwAIBkAAAARACADAAD8CAAgCAAA2AkAIAsAAP0IACAMAAD-CAAgDwAA_wgAIBkAAIEJACApAACSDAAg3wMBAKcHACHtAwEApwcAIfADQACpBwAh-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhpAQBAKcHACGlBAEApwcAIaYEAQCnBwAhpwQBALQHACGoBAEAtAcAIakEAQC0BwAhqgQCALMHACGrBAIAswcAIawEAQC0BwAhtQQgAKgHACG2BCAAqAcAIRcDAAD8CAAgCAAA2AkAIAsAAP0IACAMAAD-CAAgDwAA_wgAIBkAAIEJACDfAwEApwcAIe0DAQCnBwAh8ANAAKkHACH7A0AAqQcAIf4DIACoBwAh_wNAALYHACGkBAEApwcAIaUEAQCnBwAhpgQBAKcHACGnBAEAtAcAIagEAQC0BwAhqQQBALQHACGqBAIAswcAIasEAgCzBwAhrAQBALQHACG1BCAAqAcAIbYEIACoBwAhFAQAAJYLACAFAACXCwAgBgAAmAsAIAkAAJ4LACAfAACaCwAgIAAAmwsAICEAAJwLACAjAACdCwAg7QMBAAAAAfADQAAAAAH1AwAAAOYEAvsDQAAAAAH-AyAAAAAB_wNAAAAAAZoEAQAAAAGmBAEAAAAB0gQAAADKBALkBCAAAAAB5gQgAAAAAecEAQAAAAECAAAAxgEAIDAAAJMMACAH7QMBAAAAAfADQAAAAAH7A0AAAAAB_ANAAAAAAf0DQAAAAAH-AyAAAAAB_wNAAAAAAQIAAAD-BAAgMAAAlQwAIAMAAACBBQAgMAAAlQwAIDEAAJkMACAJAAAAgQUAICkAAJkMACDtAwEApwcAIfADQACpBwAh-wNAAKkHACH8A0AAqQcAIf0DQACpBwAh_gMgAKgHACH_A0AAtgcAIQftAwEApwcAIfADQACpBwAh-wNAAKkHACH8A0AAqQcAIf0DQACpBwAh_gMgAKgHACH_A0AAtgcAIQntAwEAAAAB8ANAAAAAAfoDAQAAAAH7A0AAAAAB_gMgAAAAAf8DQAAAAAGhBAEAAAABogQgAAAAAaMEIAAAAAEMDQAAwQgAIBsAALcJACDtAwEAAAAB8ANAAAAAAfkDAQAAAAH6AwEAAAAB-wNAAAAAAf4DIAAAAAH_A0AAAAABoQQBAAAAAaIEIAAAAAGjBCAAAAABAgAAAB0AIDAAAJsMACADAAAAGwAgMAAAmwwAIDEAAJ8MACAOAAAAGwAgDQAAzAcAIBsAALUJACApAACfDAAg7QMBAKcHACHwA0AAqQcAIfkDAQCnBwAh-gMBALQHACH7A0AAqQcAIf4DIACoBwAh_wNAALYHACGhBAEApwcAIaIEIACoBwAhowQgAKgHACEMDQAAzAcAIBsAALUJACDtAwEApwcAIfADQACpBwAh-QMBAKcHACH6AwEAtAcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIaEEAQCnBwAhogQgAKgHACGjBCAAqAcAIRLtAwEAAAAB8ANAAAAAAfUDAAAAwwQC-AMBAAAAAfsDQAAAAAHBBAEAAAABwwQAAACFBALEBEAAAAABxQRAAAAAAcYEQAAAAAHHBEAAAAAByAQBAAAAAcoEAAAAygQDywRAAAAAAcwEAQAAAAHNBAAAAMoEA84EAQAAAAHPBAEAAAABCu0DAQAAAAHwA0AAAAAB8gMCAAAAAfMDAQAAAAH1AwAAAPUDAvYDAQAAAAH3A0AAAAAB-AMBAAAAAfoDAQAAAAH7A0AAAAABGAYAALsIACANAAC_CAAgHAAArAkAIB0AALwIACAeAAC9CAAg7QMBAAAAAfADQAAAAAH1AwAAAMMEAvgDAQAAAAH5AwEAAAAB-wNAAAAAAcEEAQAAAAHDBAAAAIUEAsQEQAAAAAHFBEAAAAABxgRAAAAAAccEQAAAAAHIBAEAAAABygQAAADKBAPLBEAAAAABzAQBAAAAAc0EAAAAygQDzgQBAAAAAc8EAQAAAAECAAAADwAgMAAAogwAIAMAAAANACAwAACiDAAgMQAApgwAIBoAAAANACAGAADWBwAgDQAA2gcAIBwAAKoJACAdAADXBwAgHgAA2AcAICkAAKYMACDtAwEApwcAIfADQACpBwAh9QMAANMHwwQi-AMBAKcHACH5AwEAtAcAIfsDQACpBwAhwQQBAKcHACHDBAAA1AeFBCLEBEAAqQcAIcUEQAC2BwAhxgRAALYHACHHBEAAtgcAIcgEAQC0BwAhygQAANUHygQjywRAALYHACHMBAEAtAcAIc0EAADVB8oEI84EAQC0BwAhzwQBAKcHACEYBgAA1gcAIA0AANoHACAcAACqCQAgHQAA1wcAIB4AANgHACDtAwEApwcAIfADQACpBwAh9QMAANMHwwQi-AMBAKcHACH5AwEAtAcAIfsDQACpBwAhwQQBAKcHACHDBAAA1AeFBCLEBEAAqQcAIcUEQAC2BwAhxgRAALYHACHHBEAAtgcAIcgEAQC0BwAhygQAANUHygQjywRAALYHACHMBAEAtAcAIc0EAADVB8oEI84EAQC0BwAhzwQBAKcHACEF7QMBAAAAAfADQAAAAAH4AwEAAAAB-gMBAAAAAfsDQAAAAAEDAAAAyQEAIDAAAJMMACAxAACqDAAgFgAAAMkBACAEAACsCgAgBQAArQoAIAYAAK4KACAJAAC0CgAgHwAAsAoAICAAALEKACAhAACyCgAgIwAAswoAICkAAKoMACDtAwEApwcAIfADQACpBwAh9QMAAKsK5gQi-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhmgQBAKcHACGmBAEApwcAIdIEAACqCsoEIuQEIACoBwAh5gQgAKgHACHnBAEAtAcAIRQEAACsCgAgBQAArQoAIAYAAK4KACAJAAC0CgAgHwAAsAoAICAAALEKACAhAACyCgAgIwAAswoAIO0DAQCnBwAh8ANAAKkHACH1AwAAqwrmBCL7A0AAqQcAIf4DIACoBwAh_wNAALYHACGaBAEApwcAIaYEAQCnBwAh0gQAAKoKygQi5AQgAKgHACHmBCAAqAcAIecEAQC0BwAhEN8DAQAAAAHtAwEAAAAB8ANAAAAAAfsDQAAAAAH-AyAAAAAB_wNAAAAAAaUEAQAAAAGmBAEAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQCAAAAAasEAgAAAAGsBAEAAAABtQQgAAAAAbYEIAAAAAEUBAAAlgsAIAUAAJcLACAGAACYCwAgDQAAmQsAIB8AAJoLACAgAACbCwAgIQAAnAsAICMAAJ0LACDtAwEAAAAB8ANAAAAAAfUDAAAA5gQC-wNAAAAAAf4DIAAAAAH_A0AAAAABmgQBAAAAAaYEAQAAAAHSBAAAAMoEAuQEIAAAAAHmBCAAAAAB5wQBAAAAAQIAAADGAQAgMAAArAwAIAMAAADJAQAgMAAArAwAIDEAALAMACAWAAAAyQEAIAQAAKwKACAFAACtCgAgBgAArgoAIA0AAK8KACAfAACwCgAgIAAAsQoAICEAALIKACAjAACzCgAgKQAAsAwAIO0DAQCnBwAh8ANAAKkHACH1AwAAqwrmBCL7A0AAqQcAIf4DIACoBwAh_wNAALYHACGaBAEApwcAIaYEAQCnBwAh0gQAAKoKygQi5AQgAKgHACHmBCAAqAcAIecEAQC0BwAhFAQAAKwKACAFAACtCgAgBgAArgoAIA0AAK8KACAfAACwCgAgIAAAsQoAICEAALIKACAjAACzCgAg7QMBAKcHACHwA0AAqQcAIfUDAACrCuYEIvsDQACpBwAh_gMgAKgHACH_A0AAtgcAIZoEAQCnBwAhpgQBAKcHACHSBAAAqgrKBCLkBCAAqAcAIeYEIACoBwAh5wQBALQHACEU3wMBAAAAAe0DAQAAAAHwA0AAAAAB9QMAAACyBAL7A0AAAAABpQQBAAAAAaYEAQAAAAGnBAEAAAABqAQBAAAAAakEAQAAAAGqBAIAAAABqwQCAAAAAawEAQAAAAGtBAEAAAABrgQBAAAAAa8EAQAAAAGwBAIAAAABsgQBAAAAAbMEAQAAAAG0BEAAAAABCgYAAKsIACANAACsCAAgDgAAjAkAIBgAAK4IACDtAwEAAAAB8ANAAAAAAfgDAQAAAAH5AwEAAAAB-gMBAAAAAfsDQAAAAAECAAAAKQAgMAAAsgwAIAMAAAAnACAwAACyDAAgMQAAtgwAIAwAAAAnACAGAADmBwAgDQAA5wcAIA4AAIoJACAYAADpBwAgKQAAtgwAIO0DAQCnBwAh8ANAAKkHACH4AwEApwcAIfkDAQCnBwAh-gMBALQHACH7A0AAqQcAIQoGAADmBwAgDQAA5wcAIA4AAIoJACAYAADpBwAg7QMBAKcHACHwA0AAqQcAIfgDAQCnBwAh-QMBAKcHACH6AwEAtAcAIfsDQACpBwAhCREAANsIACATAACoCAAg7QMBAAAAAe4DAQAAAAH7A0AAAAABkQQAAACZBAKVBAEAAAABlwQAAACXBAKZBAEAAAABAgAAAC4AIDAAALcMACADAAAALAAgMAAAtwwAIDEAALsMACALAAAALAAgEQAA2ggAIBMAAJIIACApAAC7DAAg7QMBAKcHACHuAwEApwcAIfsDQACpBwAhkQQAAJAImQQilQQBAKcHACGXBAAAgQiXBCKZBAEAtAcAIQkRAADaCAAgEwAAkggAIO0DAQCnBwAh7gMBAKcHACH7A0AAqQcAIZEEAACQCJkEIpUEAQCnBwAhlwQAAIEIlwQimQQBALQHACEUBAAAlgsAIAUAAJcLACAGAACYCwAgCQAAngsAIA0AAJkLACAfAACaCwAgIQAAnAsAICMAAJ0LACDtAwEAAAAB8ANAAAAAAfUDAAAA5gQC-wNAAAAAAf4DIAAAAAH_A0AAAAABmgQBAAAAAaYEAQAAAAHSBAAAAMoEAuQEIAAAAAHmBCAAAAAB5wQBAAAAAQIAAADGAQAgMAAAvAwAIAMAAADJAQAgMAAAvAwAIDEAAMAMACAWAAAAyQEAIAQAAKwKACAFAACtCgAgBgAArgoAIAkAALQKACANAACvCgAgHwAAsAoAICEAALIKACAjAACzCgAgKQAAwAwAIO0DAQCnBwAh8ANAAKkHACH1AwAAqwrmBCL7A0AAqQcAIf4DIACoBwAh_wNAALYHACGaBAEApwcAIaYEAQCnBwAh0gQAAKoKygQi5AQgAKgHACHmBCAAqAcAIecEAQC0BwAhFAQAAKwKACAFAACtCgAgBgAArgoAIAkAALQKACANAACvCgAgHwAAsAoAICEAALIKACAjAACzCgAg7QMBAKcHACHwA0AAqQcAIfUDAACrCuYEIvsDQACpBwAh_gMgAKgHACH_A0AAtgcAIZoEAQCnBwAhpgQBAKcHACHSBAAAqgrKBCLkBCAAqAcAIeYEIACoBwAh5wQBALQHACEYBgAAuwgAIA0AAL8IACAZAAC-CAAgHAAArAkAIB4AAL0IACDtAwEAAAAB8ANAAAAAAfUDAAAAwwQC-AMBAAAAAfkDAQAAAAH7A0AAAAABwQQBAAAAAcMEAAAAhQQCxARAAAAAAcUEQAAAAAHGBEAAAAABxwRAAAAAAcgEAQAAAAHKBAAAAMoEA8sEQAAAAAHMBAEAAAABzQQAAADKBAPOBAEAAAABzwQBAAAAAQIAAAAPACAwAADBDAAgAwAAAA0AIDAAAMEMACAxAADFDAAgGgAAAA0AIAYAANYHACANAADaBwAgGQAA2QcAIBwAAKoJACAeAADYBwAgKQAAxQwAIO0DAQCnBwAh8ANAAKkHACH1AwAA0wfDBCL4AwEApwcAIfkDAQC0BwAh-wNAAKkHACHBBAEApwcAIcMEAADUB4UEIsQEQACpBwAhxQRAALYHACHGBEAAtgcAIccEQAC2BwAhyAQBALQHACHKBAAA1QfKBCPLBEAAtgcAIcwEAQC0BwAhzQQAANUHygQjzgQBALQHACHPBAEApwcAIRgGAADWBwAgDQAA2gcAIBkAANkHACAcAACqCQAgHgAA2AcAIO0DAQCnBwAh8ANAAKkHACH1AwAA0wfDBCL4AwEApwcAIfkDAQC0BwAh-wNAAKkHACHBBAEApwcAIcMEAADUB4UEIsQEQACpBwAhxQRAALYHACHGBEAAtgcAIccEQAC2BwAhyAQBALQHACHKBAAA1QfKBCPLBEAAtgcAIcwEAQC0BwAhzQQAANUHygQjzgQBALQHACHPBAEApwcAIRcDAAC5CQAgCAAA2QkAIAwAALsJACAPAAC8CQAgEAAAvQkAIBkAAL4JACDfAwEAAAAB7QMBAAAAAfADQAAAAAH7A0AAAAAB_gMgAAAAAf8DQAAAAAGkBAEAAAABpQQBAAAAAaYEAQAAAAGnBAEAAAABqAQBAAAAAakEAQAAAAGqBAIAAAABqwQCAAAAAawEAQAAAAG1BCAAAAABtgQgAAAAAQIAAAATACAwAADGDAAgFwMAALkJACAIAADZCQAgCwAAugkAIA8AALwJACAQAAC9CQAgGQAAvgkAIN8DAQAAAAHtAwEAAAAB8ANAAAAAAfsDQAAAAAH-AyAAAAAB_wNAAAAAAaQEAQAAAAGlBAEAAAABpgQBAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAgAAAAGrBAIAAAABrAQBAAAAAbUEIAAAAAG2BCAAAAABAgAAABMAIDAAAMgMACAOAwAAhQoAIA8AAIcKACAZAACICgAg3wMBAAAAAe0DAQAAAAHwA0AAAAAB-wNAAAAAAf4DIAAAAAH_A0AAAAABpQQBAAAAAaYEAQAAAAGnBAEAAAABrAQBAAAAAdAEAQAAAAECAAAA6AIAIDAAAMoMACAXAwAAuQkAIAgAANkJACALAAC6CQAgDAAAuwkAIA8AALwJACAQAAC9CQAg3wMBAAAAAe0DAQAAAAHwA0AAAAAB-wNAAAAAAf4DIAAAAAH_A0AAAAABpAQBAAAAAaUEAQAAAAGmBAEAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQCAAAAAasEAgAAAAGsBAEAAAABtQQgAAAAAbYEIAAAAAECAAAAEwAgMAAAzAwAIA4DAACFCgAgDAAAhgoAIA8AAIcKACDfAwEAAAAB7QMBAAAAAfADQAAAAAH7A0AAAAAB_gMgAAAAAf8DQAAAAAGlBAEAAAABpgQBAAAAAacEAQAAAAGsBAEAAAAB0AQBAAAAAQIAAADoAgAgMAAAzgwAIBQEAACWCwAgBQAAlwsAIAYAAJgLACAJAACeCwAgDQAAmQsAIB8AAJoLACAgAACbCwAgIwAAnQsAIO0DAQAAAAHwA0AAAAAB9QMAAADmBAL7A0AAAAAB_gMgAAAAAf8DQAAAAAGaBAEAAAABpgQBAAAAAdIEAAAAygQC5AQgAAAAAeYEIAAAAAHnBAEAAAABAgAAAMYBACAwAADQDAAgAwAAAMkBACAwAADQDAAgMQAA1AwAIBYAAADJAQAgBAAArAoAIAUAAK0KACAGAACuCgAgCQAAtAoAIA0AAK8KACAfAACwCgAgIAAAsQoAICMAALMKACApAADUDAAg7QMBAKcHACHwA0AAqQcAIfUDAACrCuYEIvsDQACpBwAh_gMgAKgHACH_A0AAtgcAIZoEAQCnBwAhpgQBAKcHACHSBAAAqgrKBCLkBCAAqAcAIeYEIACoBwAh5wQBALQHACEUBAAArAoAIAUAAK0KACAGAACuCgAgCQAAtAoAIA0AAK8KACAfAACwCgAgIAAAsQoAICMAALMKACDtAwEApwcAIfADQACpBwAh9QMAAKsK5gQi-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhmgQBAKcHACGmBAEApwcAIdIEAACqCsoEIuQEIACoBwAh5gQgAKgHACHnBAEAtAcAIQTfAwEAAAAB7QMBAAAAAfsDQAAAAAGUBAEAAAABBu0DAQAAAAH7A0AAAAABkQQAAACZBAKVBAEAAAABlwQAAACXBAKZBAEAAAABBd8DAQAAAAHtAwEAAAAB0gQAAACXBALTBEAAAAAB1ARAAAAAAQXtAwEAAAAB9QMAAADWBAL7A0AAAAABxQRAAAAAAcYEQAAAAAEDAAAAEQAgMAAAzAwAIDEAANsMACAZAAAAEQAgAwAA_AgAIAgAANgJACALAAD9CAAgDAAA_ggAIA8AAP8IACAQAACACQAgKQAA2wwAIN8DAQCnBwAh7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIaQEAQCnBwAhpQQBAKcHACGmBAEApwcAIacEAQC0BwAhqAQBALQHACGpBAEAtAcAIaoEAgCzBwAhqwQCALMHACGsBAEAtAcAIbUEIACoBwAhtgQgAKgHACEXAwAA_AgAIAgAANgJACALAAD9CAAgDAAA_ggAIA8AAP8IACAQAACACQAg3wMBAKcHACHtAwEApwcAIfADQACpBwAh-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhpAQBAKcHACGlBAEApwcAIaYEAQCnBwAhpwQBALQHACGoBAEAtAcAIakEAQC0BwAhqgQCALMHACGrBAIAswcAIawEAQC0BwAhtQQgAKgHACG2BCAAqAcAIQMAAAALACAwAADODAAgMQAA3gwAIBAAAAALACADAADmCQAgDAAA5wkAIA8AAOgJACApAADeDAAg3wMBAKcHACHtAwEApwcAIfADQACpBwAh-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhpQQBAKcHACGmBAEApwcAIacEAQC0BwAhrAQBALQHACHQBAEAtAcAIQ4DAADmCQAgDAAA5wkAIA8AAOgJACDfAwEApwcAIe0DAQCnBwAh8ANAAKkHACH7A0AAqQcAIf4DIACoBwAh_wNAALYHACGlBAEApwcAIaYEAQCnBwAhpwQBALQHACGsBAEAtAcAIdAEAQC0BwAhBe0DAQAAAAHwA0AAAAAB-AMBAAAAAfkDAQAAAAH7A0AAAAABAwAAABEAIDAAAMgMACAxAADiDAAgGQAAABEAIAMAAPwIACAIAADYCQAgCwAA_QgAIA8AAP8IACAQAACACQAgGQAAgQkAICkAAOIMACDfAwEApwcAIe0DAQCnBwAh8ANAAKkHACH7A0AAqQcAIf4DIACoBwAh_wNAALYHACGkBAEApwcAIaUEAQCnBwAhpgQBAKcHACGnBAEAtAcAIagEAQC0BwAhqQQBALQHACGqBAIAswcAIasEAgCzBwAhrAQBALQHACG1BCAAqAcAIbYEIACoBwAhFwMAAPwIACAIAADYCQAgCwAA_QgAIA8AAP8IACAQAACACQAgGQAAgQkAIN8DAQCnBwAh7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIaQEAQCnBwAhpQQBAKcHACGmBAEApwcAIacEAQC0BwAhqAQBALQHACGpBAEAtAcAIaoEAgCzBwAhqwQCALMHACGsBAEAtAcAIbUEIACoBwAhtgQgAKgHACEDAAAACwAgMAAAygwAIDEAAOUMACAQAAAACwAgAwAA5gkAIA8AAOgJACAZAADpCQAgKQAA5QwAIN8DAQCnBwAh7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIaUEAQCnBwAhpgQBAKcHACGnBAEAtAcAIawEAQC0BwAh0AQBALQHACEOAwAA5gkAIA8AAOgJACAZAADpCQAg3wMBAKcHACHtAwEApwcAIfADQACpBwAh-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhpQQBAKcHACGmBAEApwcAIacEAQC0BwAhrAQBALQHACHQBAEAtAcAIQMAAAARACAwAADGDAAgMQAA6AwAIBkAAAARACADAAD8CAAgCAAA2AkAIAwAAP4IACAPAAD_CAAgEAAAgAkAIBkAAIEJACApAADoDAAg3wMBAKcHACHtAwEApwcAIfADQACpBwAh-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhpAQBAKcHACGlBAEApwcAIaYEAQCnBwAhpwQBALQHACGoBAEAtAcAIakEAQC0BwAhqgQCALMHACGrBAIAswcAIawEAQC0BwAhtQQgAKgHACG2BCAAqAcAIRcDAAD8CAAgCAAA2AkAIAwAAP4IACAPAAD_CAAgEAAAgAkAIBkAAIEJACDfAwEApwcAIe0DAQCnBwAh8ANAAKkHACH7A0AAqQcAIf4DIACoBwAh_wNAALYHACGkBAEApwcAIaUEAQCnBwAhpgQBAKcHACGnBAEAtAcAIagEAQC0BwAhqQQBALQHACGqBAIAswcAIasEAgCzBwAhrAQBALQHACG1BCAAqAcAIbYEIACoBwAhCe0DAQAAAAHwA0AAAAAB-QMBAAAAAfoDAQAAAAH7A0AAAAAB_gMgAAAAAf8DQAAAAAGiBCAAAAABowQgAAAAARgGAAC7CAAgDQAAvwgAIBkAAL4IACAcAACsCQAgHQAAvAgAIO0DAQAAAAHwA0AAAAAB9QMAAADDBAL4AwEAAAAB-QMBAAAAAfsDQAAAAAHBBAEAAAABwwQAAACFBALEBEAAAAABxQRAAAAAAcYEQAAAAAHHBEAAAAAByAQBAAAAAcoEAAAAygQDywRAAAAAAcwEAQAAAAHNBAAAAMoEA84EAQAAAAHPBAEAAAABAgAAAA8AIDAAAOoMACAXAwAAuQkAIAgAANkJACALAAC6CQAgDAAAuwkAIBAAAL0JACAZAAC-CQAg3wMBAAAAAe0DAQAAAAHwA0AAAAAB-wNAAAAAAf4DIAAAAAH_A0AAAAABpAQBAAAAAaUEAQAAAAGmBAEAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQCAAAAAasEAgAAAAGsBAEAAAABtQQgAAAAAbYEIAAAAAECAAAAEwAgMAAA7AwAIA4DAACFCgAgDAAAhgoAIBkAAIgKACDfAwEAAAAB7QMBAAAAAfADQAAAAAH7A0AAAAAB_gMgAAAAAf8DQAAAAAGlBAEAAAABpgQBAAAAAacEAQAAAAGsBAEAAAAB0AQBAAAAAQIAAADoAgAgMAAA7gwAIAMAAAANACAwAADqDAAgMQAA8gwAIBoAAAANACAGAADWBwAgDQAA2gcAIBkAANkHACAcAACqCQAgHQAA1wcAICkAAPIMACDtAwEApwcAIfADQACpBwAh9QMAANMHwwQi-AMBAKcHACH5AwEAtAcAIfsDQACpBwAhwQQBAKcHACHDBAAA1AeFBCLEBEAAqQcAIcUEQAC2BwAhxgRAALYHACHHBEAAtgcAIcgEAQC0BwAhygQAANUHygQjywRAALYHACHMBAEAtAcAIc0EAADVB8oEI84EAQC0BwAhzwQBAKcHACEYBgAA1gcAIA0AANoHACAZAADZBwAgHAAAqgkAIB0AANcHACDtAwEApwcAIfADQACpBwAh9QMAANMHwwQi-AMBAKcHACH5AwEAtAcAIfsDQACpBwAhwQQBAKcHACHDBAAA1AeFBCLEBEAAqQcAIcUEQAC2BwAhxgRAALYHACHHBEAAtgcAIcgEAQC0BwAhygQAANUHygQjywRAALYHACHMBAEAtAcAIc0EAADVB8oEI84EAQC0BwAhzwQBAKcHACEDAAAAEQAgMAAA7AwAIDEAAPUMACAZAAAAEQAgAwAA_AgAIAgAANgJACALAAD9CAAgDAAA_ggAIBAAAIAJACAZAACBCQAgKQAA9QwAIN8DAQCnBwAh7QMBAKcHACHwA0AAqQcAIfsDQACpBwAh_gMgAKgHACH_A0AAtgcAIaQEAQCnBwAhpQQBAKcHACGmBAEApwcAIacEAQC0BwAhqAQBALQHACGpBAEAtAcAIaoEAgCzBwAhqwQCALMHACGsBAEAtAcAIbUEIACoBwAhtgQgAKgHACEXAwAA_AgAIAgAANgJACALAAD9CAAgDAAA_ggAIBAAAIAJACAZAACBCQAg3wMBAKcHACHtAwEApwcAIfADQACpBwAh-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhpAQBAKcHACGlBAEApwcAIaYEAQCnBwAhpwQBALQHACGoBAEAtAcAIakEAQC0BwAhqgQCALMHACGrBAIAswcAIawEAQC0BwAhtQQgAKgHACG2BCAAqAcAIQMAAAALACAwAADuDAAgMQAA-AwAIBAAAAALACADAADmCQAgDAAA5wkAIBkAAOkJACApAAD4DAAg3wMBAKcHACHtAwEApwcAIfADQACpBwAh-wNAAKkHACH-AyAAqAcAIf8DQAC2BwAhpQQBAKcHACGmBAEApwcAIacEAQC0BwAhrAQBALQHACHQBAEAtAcAIQ4DAADmCQAgDAAA5wkAIBkAAOkJACDfAwEApwcAIe0DAQCnBwAh8ANAAKkHACH7A0AAqQcAIf4DIACoBwAh_wNAALYHACGlBAEApwcAIaYEAQCnBwAhpwQBALQHACGsBAEAtAcAIdAEAQC0BwAhAQMAAgoEBgMFCgQGDAUJZQoKACENVAgfVgEgWh0hWxEjXx4BAwACAQMAAgUDAAIKABwMEAYPTwwZUA4HBgAFCgAbDU0IGUwOHAAHHUoaHksMAw0ACA5IBhsAGAgDAAIIAAkKABcLHgcMHwYPIwwQJg0ZKg4DBxQICRgKCgALAgMAAggACQIHGQAJGgADBgAFDQAIDiQGAQ0ACAYGAAUKABYNAAgOKwYVLw8YOhMECgASEQAOEzEQFDURARIADwIDAAISAA8BFDYAAwoAFREADhc-FAEWABMBFz8AAhVAABhBAAQLQgAMQwAPRAAZRQACCgAZGkYHARpHAAEOAAYBGU4AAwxRAA9SABlTAAEDAAIDAwACCgAgFWMfASIAHgEVZAAGBGYABWcACWsAIGgAIWkAI2oAAAEDAAIBAwACAwoAJjYAJzcAKAAAAAMKACY2ACc3ACgBAwACAQMAAgMKAC02AC43AC8AAAADCgAtNgAuNwAvASIAHgEiAB4FCgA0NgA3NwA4WAA1WQA2AAAAAAAFCgA0NgA3NwA4WAA1WQA2ARIADwESAA8FCgA9NgBANwBBWAA-WQA_AAAAAAAFCgA9NgBANwBBWAA-WQA_AAADCgBGNgBHNwBIAAAAAwoARjYARzcASAEDAAIBAwACAwoATTYATjcATwAAAAMKAE02AE43AE8BAwACAQMAAgMKAFQ2AFU3AFYAAAADCgBUNgBVNwBWAAAAAwoAXDYAXTcAXgAAAAMKAFw2AF03AF4BEQAOAREADgMKAGM2AGQ3AGUAAAADCgBjNgBkNwBlARYAEwEWABMDCgBqNgBrNwBsAAAAAwoAajYAazcAbAMGAAUNAAgO2gIGAwYABQ0ACA7gAgYDCgBxNgByNwBzAAAAAwoAcTYAcjcAcwEDAAIBAwACAwoAeDYAeTcAegAAAAMKAHg2AHk3AHoDBgAFDYoDCBwABwMGAAUNkAMIHAAHAwoAfzYAgAE3AIEBAAAAAwoAfzYAgAE3AIEBAAAABQoAhwE2AIoBNwCLAVgAiAFZAIkBAAAAAAAFCgCHATYAigE3AIsBWACIAVkAiQECAwACCAAJAgMAAggACQUKAJABNgCTATcAlAFYAJEBWQCSAQAAAAAABQoAkAE2AJMBNwCUAVgAkQFZAJIBAgMAAggACQIDAAIIAAkFCgCZATYAnAE3AJ0BWACaAVkAmwEAAAAAAAUKAJkBNgCcATcAnQFYAJoBWQCbAQINAAgbABgCDQAIGwAYAwoAogE2AKMBNwCkAQAAAAMKAKIBNgCjATcApAEBDQAIAQ0ACAMKAKkBNgCqATcAqwEAAAADCgCpATYAqgE3AKsBAAADCgCwATYAsQE3ALIBAAAAAwoAsAE2ALEBNwCyAQERAA4BEQAOAwoAtwE2ALgBNwC5AQAAAAMKALcBNgC4ATcAuQECAwACEgAPAgMAAhIADwMKAL4BNgC_ATcAwAEAAAADCgC-ATYAvwE3AMABAQMAAgEDAAIDCgDFATYAxgE3AMcBAAAAAwoAxQE2AMYBNwDHAQEOAAYBDgAGBQoAzAE2AM8BNwDQAVgAzQFZAM4BAAAAAAAFCgDMATYAzwE3ANABWADNAVkAzgEAAAMKANUBNgDWATcA1wEAAAADCgDVATYA1gE3ANcBAwYABQ0ACA6hBQYDBgAFDQAIDqcFBgUKANwBNgDfATcA4AFYAN0BWQDeAQAAAAAABQoA3AE2AN8BNwDgAVgA3QFZAN4BAAAAAwoA5gE2AOcBNwDoAQAAAAMKAOYBNgDnATcA6AEAAAADCgDuATYA7wE3APABAAAAAwoA7gE2AO8BNwDwASQCASVsASZuASdvAShwASpyASt0Iix1Iy13AS55Ii96JDJ7ATN8ATR9IjiAASU5gQEpOoIBHjuDAR48hAEePYUBHj6GAR4_iAEeQIoBIkGLASpCjQEeQ48BIkSQAStFkQEeRpIBHkeTASJIlgEsSZcBMEqYAR9LmQEfTJoBH02bAR9OnAEfT54BH1CgASJRoQExUqMBH1OlASJUpgEyVacBH1aoAR9XqQEiWqwBM1utATlcrwEQXbABEF6yARBfswEQYLQBEGG2ARBiuAEiY7kBOmS7ARBlvQEiZr4BO2e_ARBowAEQacEBImrEATxrxQFCbMcBAm3IAQJuywECb8wBAnDNAQJxzwECctEBInPSAUN01AECddYBInbXAUR32AECeNkBAnnaASJ63QFFe94BSXzfAQN94AEDfuEBA3_iAQOAAeMBA4EB5QEDggHnASKDAegBSoQB6gEDhQHsASKGAe0BS4cB7gEDiAHvAQOJAfABIooB8wFMiwH0AVCMAfUBBI0B9gEEjgH3AQSPAfgBBJAB-QEEkQH7AQSSAf0BIpMB_gFRlAGAAgSVAYICIpYBgwJSlwGEAgSYAYUCBJkBhgIimgGJAlObAYoCV5wBjAJYnQGNAlieAZACWJ8BkQJYoAGSAlihAZQCWKIBlgIiowGXAlmkAZkCWKUBmwIipgGcAlqnAZ0CWKgBngJYqQGfAiKqAaICW6sBowJfrAGkAhOtAaUCE64BpgITrwGnAhOwAagCE7EBqgITsgGsAiKzAa0CYLQBrwITtQGxAiK2AbICYbcBswITuAG0AhO5AbUCIroBuAJiuwG5Ama8AboCFL0BuwIUvgG8AhS_Ab0CFMABvgIUwQHAAhTCAcICIsMBwwJnxAHFAhTFAccCIsYByAJoxwHJAhTIAcoCFMkBywIiygHOAmnLAc8CbcwB0AIOzQHRAg7OAdICDs8B0wIO0AHUAg7RAdYCDtIB2AIi0wHZAm7UAdwCDtUB3gIi1gHfAm_XAeECDtgB4gIO2QHjAiLaAeYCcNsB5wJ03AHpAgXdAeoCBd4B7AIF3wHtAgXgAe4CBeEB8AIF4gHyAiLjAfMCdeQB9QIF5QH3AiLmAfgCducB-QIF6AH6AgXpAfsCIuoB_gJ36wH_AnvsAYADBu0BgQMG7gGCAwbvAYMDBvABhAMG8QGGAwbyAYgDIvMBiQN89AGMAwb1AY4DIvYBjwN99wGRAwb4AZIDBvkBkwMi-gGWA377AZcDggH8AZkDgwH9AZoDgwH-AZ0DgwH_AZ4DgwGAAp8DgwGBAqEDgwGCAqMDIoMCpAOEAYQCpgODAYUCqAMihgKpA4UBhwKqA4MBiAKrA4MBiQKsAyKKAq8DhgGLArADjAGMArEDCI0CsgMIjgKzAwiPArQDCJACtQMIkQK3AwiSArkDIpMCugONAZQCvAMIlQK-AyKWAr8DjgGXAsADCJgCwQMImQLCAyKaAsUDjwGbAsYDlQGcAscDCp0CyAMKngLJAwqfAsoDCqACywMKoQLNAwqiAs8DIqMC0AOWAaQC0gMKpQLUAyKmAtUDlwGnAtYDCqgC1wMKqQLYAyKqAtsDmAGrAtwDngGsAt0DB60C3gMHrgLfAwevAuADB7AC4QMHsQLjAweyAuUDIrMC5gOfAbQC6AMHtQLqAyK2AusDoAG3AuwDB7gC7QMHuQLuAyK6AvEDoQG7AvIDpQG8AvQDDb0C9QMNvgL3Aw2_AvgDDcAC-QMNwQL7Aw3CAv0DIsMC_gOmAcQCgAQNxQKCBCLGAoMEpwHHAoQEDcgChQQNyQKGBCLKAokEqAHLAooErAHMAowECc0CjQQJzgKQBAnPApEECdACkgQJ0QKUBAnSApYEItMClwStAdQCmQQJ1QKbBCLWApwErgHXAp0ECdgCngQJ2QKfBCLaAqIErwHbAqMEswHcAqQED90CpQQP3gKmBA_fAqcED-ACqAQP4QKqBA_iAqwEIuMCrQS0AeQCrwQP5QKxBCLmArIEtQHnArMED-gCtAQP6QK1BCLqArgEtgHrArkEugHsAroEEe0CuwQR7gK8BBHvAr0EEfACvgQR8QLABBHyAsIEIvMCwwS7AfQCxQQR9QLHBCL2AsgEvAH3AskEEfgCygQR-QLLBCL6As4EvQH7As8EwQH8AtAEHf0C0QQd_gLSBB3_AtMEHYAD1AQdgQPWBB2CA9gEIoMD2QTCAYQD2wQdhQPdBCKGA94EwwGHA98EHYgD4AQdiQPhBCKKA-QExAGLA-UEyAGMA-cEGo0D6AQajgPqBBqPA-sEGpAD7AQakQPuBBqSA_AEIpMD8QTJAZQD8wQalQP1BCKWA_YEygGXA_cEGpgD-AQamQP5BCKaA_wEywGbA_0E0QGcA_8EGJ0DgAUYngODBRifA4QFGKADhQUYoQOHBRiiA4kFIqMDigXSAaQDjAUYpQOOBSKmA48F0wGnA5AFGKgDkQUYqQOSBSKqA5UF1AGrA5YF2AGsA5cFDK0DmAUMrgOZBQyvA5oFDLADmwUMsQOdBQyyA58FIrMDoAXZAbQDowUMtQOlBSK2A6YF2gG3A6gFDLgDqQUMuQOqBSK6A60F2wG7A64F4QG8A7AF4gG9A7EF4gG-A7QF4gG_A7UF4gHAA7YF4gHBA7gF4gHCA7oFIsMDuwXjAcQDvQXiAcUDvwUixgPABeQBxwPBBeIByAPCBeIByQPDBSLKA8YF5QHLA8cF6QHMA8kF6gHNA8oF6gHOA80F6gHPA84F6gHQA88F6gHRA9EF6gHSA9MFItMD1AXrAdQD1gXqAdUD2AUi1gPZBewB1wPaBeoB2APbBeoB2QPcBSLaA98F7QHbA-AF8QE"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AIChatMessageScalarFieldEnum: () => AIChatMessageScalarFieldEnum,
  AIConversationScalarFieldEnum: () => AIConversationScalarFieldEnum,
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AdminScalarFieldEnum: () => AdminScalarFieldEnum,
  AnyNull: () => AnyNull2,
  AttachmentScalarFieldEnum: () => AttachmentScalarFieldEnum,
  CallParticipantScalarFieldEnum: () => CallParticipantScalarFieldEnum,
  CallScalarFieldEnum: () => CallScalarFieldEnum,
  ChatRoomScalarFieldEnum: () => ChatRoomScalarFieldEnum,
  ClientScalarFieldEnum: () => ClientScalarFieldEnum,
  ConsultationScalarFieldEnum: () => ConsultationScalarFieldEnum,
  CouponScalarFieldEnum: () => CouponScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  ExpertApplicationScalarFieldEnum: () => ExpertApplicationScalarFieldEnum,
  ExpertScalarFieldEnum: () => ExpertScalarFieldEnum,
  ExpertScheduleScalarFieldEnum: () => ExpertScheduleScalarFieldEnum,
  ExpertVerificationScalarFieldEnum: () => ExpertVerificationScalarFieldEnum,
  IndustryScalarFieldEnum: () => IndustryScalarFieldEnum,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  MessageReactionScalarFieldEnum: () => MessageReactionScalarFieldEnum,
  MessageScalarFieldEnum: () => MessageScalarFieldEnum,
  ModelName: () => ModelName,
  NotificationScalarFieldEnum: () => NotificationScalarFieldEnum,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ScheduleScalarFieldEnum: () => ScheduleScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TestimonialScalarFieldEnum: () => TestimonialScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  TypingStateScalarFieldEnum: () => TypingStateScalarFieldEnum,
  UserPresenceScalarFieldEnum: () => UserPresenceScalarFieldEnum,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.5.0",
  engine: "280c870be64f457428992c43c1f6d557fab6e29e"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  Admin: "Admin",
  AIConversation: "AIConversation",
  AIChatMessage: "AIChatMessage",
  Attachment: "Attachment",
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Call: "Call",
  CallParticipant: "CallParticipant",
  ChatRoom: "ChatRoom",
  Client: "Client",
  Consultation: "Consultation",
  Coupon: "Coupon",
  Expert: "Expert",
  ExpertApplication: "ExpertApplication",
  ExpertSchedule: "ExpertSchedule",
  ExpertVerification: "ExpertVerification",
  Industry: "Industry",
  Message: "Message",
  MessageReaction: "MessageReaction",
  Notification: "Notification",
  Payment: "Payment",
  Schedule: "Schedule",
  Testimonial: "Testimonial",
  TypingState: "TypingState",
  UserPresence: "UserPresence"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var AdminScalarFieldEnum = {
  id: "id",
  userId: "userId",
  name: "name",
  email: "email",
  profilePhoto: "profilePhoto",
  contactNumber: "contactNumber",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var AIConversationScalarFieldEnum = {
  id: "id",
  userId: "userId",
  title: "title",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var AIChatMessageScalarFieldEnum = {
  id: "id",
  conversationId: "conversationId",
  role: "role",
  content: "content",
  model: "model",
  provider: "provider",
  tokensUsed: "tokensUsed",
  latencyMs: "latencyMs",
  feedback: "feedback",
  createdAt: "createdAt"
};
var AttachmentScalarFieldEnum = {
  id: "id",
  messageId: "messageId",
  fileUrl: "fileUrl",
  fileName: "fileName",
  fileType: "fileType",
  fileSize: "fileSize",
  createdAt: "createdAt"
};
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  role: "role",
  status: "status",
  needPasswordChange: "needPasswordChange",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CallScalarFieldEnum = {
  id: "id",
  roomId: "roomId",
  status: "status",
  startedAt: "startedAt",
  endedAt: "endedAt",
  createdAt: "createdAt"
};
var CallParticipantScalarFieldEnum = {
  id: "id",
  callId: "callId",
  userId: "userId",
  role: "role",
  joinedAt: "joinedAt",
  leftAt: "leftAt"
};
var ChatRoomScalarFieldEnum = {
  id: "id",
  consultationId: "consultationId",
  clientId: "clientId",
  expertId: "expertId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ClientScalarFieldEnum = {
  id: "id",
  fullName: "fullName",
  email: "email",
  profilePhoto: "profilePhoto",
  phone: "phone",
  address: "address",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  userId: "userId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ConsultationScalarFieldEnum = {
  id: "id",
  videoCallId: "videoCallId",
  status: "status",
  paymentStatus: "paymentStatus",
  date: "date",
  startedAt: "startedAt",
  endedAt: "endedAt",
  cancelledAt: "cancelledAt",
  cancelReason: "cancelReason",
  cancelledBy: "cancelledBy",
  rescheduledAt: "rescheduledAt",
  rescheduleReason: "rescheduleReason",
  rescheduledBy: "rescheduledBy",
  sessionSummary: "sessionSummary",
  clientId: "clientId",
  expertScheduleId: "expertScheduleId",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  expertId: "expertId"
};
var CouponScalarFieldEnum = {
  id: "id",
  code: "code",
  description: "description",
  discountType: "discountType",
  discountValue: "discountValue",
  maxDiscount: "maxDiscount",
  minAmount: "minAmount",
  expiresAt: "expiresAt",
  maxUses: "maxUses",
  usedCount: "usedCount",
  isActive: "isActive",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ExpertScalarFieldEnum = {
  id: "id",
  fullName: "fullName",
  email: "email",
  profilePhoto: "profilePhoto",
  phone: "phone",
  bio: "bio",
  title: "title",
  experience: "experience",
  consultationFee: "consultationFee",
  isVerified: "isVerified",
  isSeeded: "isSeeded",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  userId: "userId",
  industryId: "industryId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ExpertApplicationScalarFieldEnum = {
  id: "id",
  userId: "userId",
  industryId: "industryId",
  fullName: "fullName",
  email: "email",
  phone: "phone",
  bio: "bio",
  title: "title",
  experience: "experience",
  consultationFee: "consultationFee",
  profilePhoto: "profilePhoto",
  resumeUrl: "resumeUrl",
  resumeFileName: "resumeFileName",
  resumeFileType: "resumeFileType",
  resumeFileSize: "resumeFileSize",
  status: "status",
  reviewNotes: "reviewNotes",
  reviewedBy: "reviewedBy",
  reviewedAt: "reviewedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ExpertScheduleScalarFieldEnum = {
  id: "id",
  expertId: "expertId",
  scheduleId: "scheduleId",
  consultationId: "consultationId",
  isBooked: "isBooked",
  isPublished: "isPublished",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ExpertVerificationScalarFieldEnum = {
  id: "id",
  expertId: "expertId",
  status: "status",
  notes: "notes",
  verifiedBy: "verifiedBy",
  verifiedAt: "verifiedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var IndustryScalarFieldEnum = {
  id: "id",
  name: "name",
  description: "description",
  icon: "icon",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt"
};
var MessageScalarFieldEnum = {
  id: "id",
  roomId: "roomId",
  senderId: "senderId",
  senderRole: "senderRole",
  type: "type",
  text: "text",
  createdAt: "createdAt"
};
var MessageReactionScalarFieldEnum = {
  id: "id",
  messageId: "messageId",
  userId: "userId",
  emoji: "emoji",
  createdAt: "createdAt"
};
var NotificationScalarFieldEnum = {
  id: "id",
  type: "type",
  message: "message",
  userId: "userId",
  createdAt: "createdAt",
  read: "read"
};
var PaymentScalarFieldEnum = {
  id: "id",
  consultationId: "consultationId",
  amount: "amount",
  status: "status",
  originalAmount: "originalAmount",
  discountAmount: "discountAmount",
  couponCode: "couponCode",
  transactionId: "transactionId",
  stripeEventId: "stripeEventId",
  paymentGatewayData: "paymentGatewayData",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ScheduleScalarFieldEnum = {
  id: "id",
  startDateTime: "startDateTime",
  endDateTime: "endDateTime",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var TestimonialScalarFieldEnum = {
  id: "id",
  rating: "rating",
  comment: "comment",
  status: "status",
  expertReply: "expertReply",
  expertRepliedAt: "expertRepliedAt",
  clientId: "clientId",
  expertId: "expertId",
  consultationId: "consultationId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var TypingStateScalarFieldEnum = {
  id: "id",
  roomId: "roomId",
  userId: "userId",
  isTyping: "isTyping",
  updatedAt: "updatedAt"
};
var UserPresenceScalarFieldEnum = {
  userId: "userId",
  isOnline: "isOnline",
  lastSeen: "lastSeen"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/enums.ts
var ConsultationStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
};
var PaymentStatus = {
  PAID: "PAID",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
  UNPAID: "UNPAID"
};
var MessageType = {
  TEXT: "TEXT",
  FILE: "FILE",
  SYSTEM: "SYSTEM"
};
var UserRole = {
  CLIENT: "CLIENT",
  EXPERT: "EXPERT",
  ADMIN: "ADMIN"
};
var CallStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  ENDED: "ENDED"
};
var VerificationStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
};
var ReviewStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  HIDDEN: "HIDDEN"
};
var Role = {
  ADMIN: "ADMIN",
  EXPERT: "EXPERT",
  CLIENT: "CLIENT"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
  DELETED: "DELETED",
  SUSPENDED: "SUSPENDED"
};
var AIChatMessageRole = {
  USER: "USER",
  ASSISTANT: "ASSISTANT",
  SYSTEM: "SYSTEM"
};
var ExpertApplicationStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
};
var CouponDiscountType = {
  PERCENT: "PERCENT",
  FIXED: "FIXED"
};

// src/generated/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = envVars.DATABASE_URL;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var formatConnectionError = (error) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown database connection error";
};
var connectPrismaWithRetry = async ({
  retries = 3,
  retryDelayMs = 1500
} = {}) => {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await prisma.$connect();
      return;
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === retries;
      const errorMessage = formatConnectionError(error);
      console.error(
        `Prisma connection attempt ${attempt}/${retries} failed: ${errorMessage}`
      );
      if (isLastAttempt) {
        break;
      }
      await sleep(retryDelayMs);
    }
  }
  throw lastError;
};

// src/utilis/email.ts
import nodemailer from "nodemailer";
import status2 from "http-status";
var transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASSWORD
  },
  port: parseInt(envVars.EMAIL_SENDER.SMTP_PORT)
});
var escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
var renderOtpTemplate = (data) => {
  const name = escapeHtml(data.name ?? "User");
  const otp = escapeHtml(data.otp ?? "");
  return `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background:#f6f8fb; padding:24px;">
    <div style="max-width:480px;margin:auto;background:#ffffff;border-radius:8px;padding:24px;">
      <h2 style="margin:0 0 16px;color:#111;">Hello ${name},</h2>
      <p style="color:#333;">Use the verification code below. It expires in 2 minutes.</p>
      <div style="font-size:28px;font-weight:bold;letter-spacing:6px;background:#f1f5f9;padding:16px;border-radius:6px;text-align:center;color:#0f172a;">${otp}</div>
      <p style="color:#666;font-size:13px;margin-top:16px;">If you didn't request this, you can ignore this email.</p>
    </div>
  </body>
</html>`;
};
var renderExpertApplicationDecisionTemplate = (data) => {
  const name = escapeHtml(data.name ?? "User");
  const statusText = String(data.status ?? "PENDING").toUpperCase();
  const isApproved = statusText === "APPROVED";
  const notes = data.notes ? escapeHtml(data.notes) : "";
  return `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background:#f6f8fb; padding:24px;">
    <div style="max-width:560px;margin:auto;background:#ffffff;border-radius:8px;padding:24px;">
      <h2 style="margin:0 0 16px;color:#111;">Hello ${name},</h2>
      <p style="color:#333;line-height:1.6;">
        Your expert application review is now complete.
      </p>
      <div style="margin:16px 0;padding:14px;border-radius:6px;background:${isApproved ? "#ecfdf3" : "#fef2f2"};color:${isApproved ? "#065f46" : "#991b1b"};font-weight:700;">
        Status: ${statusText}
      </div>
      ${notes ? `<p style="color:#374151;line-height:1.6;"><strong>Admin Notes:</strong> ${notes}</p>` : ""}
      <p style="color:#666;font-size:13px;margin-top:16px;">
        If you have questions, please contact support.
      </p>
    </div>
  </body>
</html>`;
};
var templateRegistry = {
  otp: renderOtpTemplate,
  expertApplicationDecision: renderExpertApplicationDecisionTemplate
};
var sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
  attachments
}) => {
  try {
    const renderer = templateRegistry[templateName];
    if (!renderer) {
      throw new AppError_default(
        status2.INTERNAL_SERVER_ERROR,
        `Unknown email template: ${templateName}`
      );
    }
    const html = renderer(templateData);
    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.fileName,
        content: attachment.context,
        contentType: attachment.contentType
      }))
    });
    console.log(`email sent ${to}: ${info.messageId} `);
  } catch (err) {
    console.log("email sending error", err.message);
    throw new AppError_default(status2.INTERNAL_SERVER_ERROR, "failed to send");
  }
};

// src/lib/auth.ts
var ignoredBetterAuthMessages = /* @__PURE__ */ new Set([
  "User not found",
  "Invalid password",
  "Credential account not found",
  "Password not found"
]);
var shouldIgnoreBetterAuthLog = (level, message) => {
  return level === "error" && ignoredBetterAuthMessages.has(message);
};
var auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  logger: {
    level: "warn",
    log(level, message, ...args) {
      if (shouldIgnoreBetterAuthLog(level, message)) {
        return;
      }
      if (level === "error") {
        console.error(message, ...args);
        return;
      }
      if (level === "warn") {
        console.warn(message, ...args);
        return;
      }
      console.log(message, ...args);
    }
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  socialProviders: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      // callbackUrl: envVars.GOOGLE_CALLBACK_URL,
      mapProfileToUser: () => {
        return {
          role: Role.CLIENT,
          status: UserStatus.ACTIVE,
          needPasswordChange: false,
          emailVerified: true,
          isDeleted: false,
          deletedAt: null
        };
      }
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.CLIENT
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null
      }
    }
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (!user) {
            console.error(`User with email ${email} not found. Cannot send verification OTP.`);
            return;
          }
          if (user && user.role === Role.ADMIN) {
            console.log(`User with email ${email} is a super admin. Skipping sending verification OTP.`);
            return;
          }
          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "Verify your email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp
              }
            }).catch((err) => {
              console.error("sendEmail (verify) failed:", err?.message ?? err);
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (user) {
            sendEmail({
              to: email,
              subject: "Password Reset OTP",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp
              }
            }).catch((err) => {
              console.error("sendEmail (forget-password) failed:", err?.message ?? err);
            });
          }
        }
      },
      expiresIn: 2 * 60,
      // 2 minutes in seconds
      otpLength: 6
    })
  ],
  session: {
    expiresIn: 60 * 60 * 60 * 24,
    // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24,
    // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24
      // 1 day in seconds
    }
  },
  redirectURLs: {
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:5000", envVars.FRONTEND_URL],
  advanced: {
    // Backend routes call Better Auth APIs server-to-server (no browser Origin header).
    // Keep CORS as the browser boundary and bypass Better Auth's Origin-based CSRF check.
    disableCSRFCheck: true,
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      }
    }
  }
});

// src/utilis/cookie.ts
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookie = (req, key) => {
  return req.cookies[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var CookieUtils = {
  setCookie,
  getCookie,
  clearCookie
};

// src/utilis/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, { expiresIn }) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
var decodeToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded;
};
var jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
};

// src/utilis/token.ts
var isProduction = envVars.NODE_ENV === "production";
var getCookieBaseOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/"
});
var getAccessToken = (payload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRY }
  );
  return accessToken;
};
var getRefreshToken = (payload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRY }
  );
  return refreshToken;
};
var setAccessTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "accessToken", token, {
    ...getCookieBaseOptions(),
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  });
};
var setRefreshTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "refreshToken", token, {
    ...getCookieBaseOptions(),
    //7d
    maxAge: 60 * 60 * 24 * 1e3 * 7
  });
};
var setBetterAuthSessionCookie = (res, token) => {
  const options = {
    ...getCookieBaseOptions(),
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  };
  CookieUtils.setCookie(res, "better-auth.session_token", token, options);
  CookieUtils.setCookie(res, "__Secure-better-auth.session_token", token, options);
};
var tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie
};

// src/middleware/cheackAuth.ts
var checkAuth = (...authRoles) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : void 0;
    const cookieToken = CookieUtils.getCookie(req, "accessToken");
    const accessToken = bearerToken || cookieToken;
    const betterAuthSessionToken = CookieUtils.getCookie(req, "better-auth.session_token") || CookieUtils.getCookie(req, "__Secure-better-auth.session_token");
    let userId = null;
    let betterAuthSession = null;
    if (accessToken) {
      const verified = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);
      if (verified.success && verified.data?.userId) {
        userId = String(verified.data.userId);
      }
    }
    if (!userId && (betterAuthSessionToken || authHeader)) {
      const fallbackCookieHeader = req.headers.cookie || [
        betterAuthSessionToken ? `better-auth.session_token=${betterAuthSessionToken}` : "",
        betterAuthSessionToken ? `__Secure-better-auth.session_token=${betterAuthSessionToken}` : ""
      ].filter(Boolean).join("; ");
      betterAuthSession = await auth.api.getSession({
        headers: {
          ...fallbackCookieHeader ? { cookie: fallbackCookieHeader } : {},
          ...authHeader ? { authorization: authHeader } : {}
        }
      }).catch(() => null);
      if (betterAuthSession?.user?.id) {
        userId = betterAuthSession.user.id;
      }
    }
    if (!userId) {
      throw new AppError_default(
        status3.UNAUTHORIZED,
        `Unauthorized! No access token. Route: ${req.method} ${req.originalUrl}. Send cookie or Bearer token.`
      );
    }
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new AppError_default(status3.UNAUTHORIZED, "Unauthorized! User not found.");
    }
    const userRole = user.role;
    if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED || user.isDeleted) {
      throw new AppError_default(status3.UNAUTHORIZED, "Unauthorized! User inactive.");
    }
    if (authRoles.length > 0 && !authRoles.includes(userRole)) {
      throw new AppError_default(
        status3.FORBIDDEN,
        `Forbidden! No permission. Current role: ${userRole}. Allowed roles: ${authRoles.join(", ")}. Route: ${req.method} ${req.originalUrl}`
      );
    }
    if (!cookieToken && betterAuthSession?.user?.id === user.id) {
      const refreshedAccessToken = tokenUtils.getAccessToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        isDeleted: user.isDeleted,
        emailVerified: user.emailVerified
      });
      tokenUtils.setAccessTokenCookie(res, refreshedAccessToken);
    }
    req.user = {
      userId: user.id,
      role: userRole,
      email: user.email
    };
    if (betterAuthSession?.session && betterAuthSession.user?.id === user.id) {
      const now = /* @__PURE__ */ new Date();
      const expiresAt = new Date(betterAuthSession.session.expiresAt);
      const createdAt = new Date(betterAuthSession.session.createdAt);
      const sessionLifetime = expiresAt.getTime() - createdAt.getTime();
      const timeRemaining = expiresAt.getTime() - now.getTime();
      if (sessionLifetime > 0) {
        const percentRemaining = timeRemaining / sessionLifetime * 100;
        if (percentRemaining < 20) {
          res.setHeader("X-Session-Refresh", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          res.setHeader("X-Time-Remaining", timeRemaining.toString());
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

// src/middleware/validateRequest.ts
var replaceObjectContents = (target, source) => {
  Object.keys(target).forEach((key) => {
    delete target[key];
  });
  if (source && typeof source === "object") {
    Object.assign(target, source);
  }
};
var validateRequest = (zodSchema) => {
  return (req, res, next) => {
    try {
      if (typeof req.body?.data === "string") {
        req.body = JSON.parse(req.body.data);
      }
      const normalizedBody = req.body ?? {};
      const requestData = {
        body: normalizedBody,
        query: req.query,
        params: req.params
      };
      const wrappedResult = zodSchema.safeParse(requestData);
      if (wrappedResult.success) {
        const parsedData = wrappedResult.data;
        if (parsedData.body !== void 0) {
          req.body = parsedData.body;
        }
        if (parsedData.query !== void 0) {
          replaceObjectContents(
            req.query,
            parsedData.query
          );
        }
        if (parsedData.params !== void 0) {
          replaceObjectContents(
            req.params,
            parsedData.params
          );
        }
        return next();
      }
      const bodyOnlyResult = zodSchema.safeParse(normalizedBody);
      if (!bodyOnlyResult.success) {
        return next(bodyOnlyResult.error);
      }
      req.body = bodyOnlyResult.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// src/modules/expertVerification/expertVerification.controler.ts
import status6 from "http-status";

// src/modules/expertVerification/expertVerification.service.ts
import status4 from "http-status";
var normalizePagination = (query2) => {
  const page = Math.max(1, Number(query2.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query2.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
var normalizeSort = (query2) => {
  const allowedSortBy = /* @__PURE__ */ new Set(["createdAt", "updatedAt", "reviewedAt", "fullName"]);
  const sortByRaw = typeof query2.sortBy === "string" ? query2.sortBy : "createdAt";
  const sortBy = allowedSortBy.has(sortByRaw) ? sortByRaw : "createdAt";
  const sortOrder = query2.sortOrder === "asc" ? "asc" : "desc";
  return {
    [sortBy]: sortOrder
  };
};
var normalizeFilters = (query2) => {
  const statusValue = typeof query2.status === "string" ? query2.status.toUpperCase() : void 0;
  const status38 = statusValue && Object.values(ExpertApplicationStatus).includes(statusValue) ? statusValue : void 0;
  return {
    status: status38,
    industryId: typeof query2.industryId === "string" ? query2.industryId : void 0,
    reviewedBy: typeof query2.reviewedBy === "string" ? query2.reviewedBy : void 0,
    searchTerm: typeof query2.searchTerm === "string" ? query2.searchTerm.trim() : void 0
  };
};
var buildWhere = (filters) => {
  const where = {};
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
      { industry: { name: { contains: filters.searchTerm, mode: "insensitive" } } }
    ];
  }
  return where;
};
var submitApplication = async (userId, payload) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
    throw new AppError_default(status4.UNAUTHORIZED, "Active user account is required");
  }
  const existingExpert = await prisma.expert.findFirst({
    where: { userId, isDeleted: false }
  });
  if (existingExpert) {
    throw new AppError_default(status4.BAD_REQUEST, "You are already registered as an expert");
  }
  const existingPending = await prisma.expertApplication.findFirst({
    where: {
      userId,
      status: ExpertApplicationStatus.PENDING
    },
    orderBy: { createdAt: "desc" }
  });
  if (existingPending) {
    throw new AppError_default(status4.BAD_REQUEST, "You already have a pending expert application");
  }
  const parsedExperience = Number(payload.experience ?? 0);
  const parsedConsultationFee = Number(payload.consultationFee);
  const fullName = String(payload.fullName ?? user.name ?? "").trim();
  const email = String(payload.email ?? user.email ?? "").trim();
  const rawIndustry = String(
    payload.industryId ?? payload.industryName ?? payload.industry ?? ""
  ).trim();
  if (!fullName) {
    throw new AppError_default(status4.BAD_REQUEST, "Full name is required");
  }
  if (!email) {
    throw new AppError_default(status4.BAD_REQUEST, "Email is required");
  }
  if (!rawIndustry) {
    throw new AppError_default(status4.BAD_REQUEST, "Industry is required");
  }
  if (!Number.isInteger(parsedExperience) || parsedExperience < 0) {
    throw new AppError_default(status4.BAD_REQUEST, "Experience must be a non-negative integer");
  }
  if (!Number.isInteger(parsedConsultationFee) || parsedConsultationFee <= 0) {
    throw new AppError_default(status4.BAD_REQUEST, "Consultation fee must be a positive integer");
  }
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = UUID_REGEX.test(rawIndustry);
  const industry = isUuid ? await prisma.industry.findFirst({
    where: { id: rawIndustry, isDeleted: false },
    select: { id: true }
  }) : await prisma.industry.findFirst({
    where: {
      isDeleted: false,
      name: { equals: rawIndustry, mode: "insensitive" }
    },
    select: { id: true }
  });
  if (!industry) {
    throw new AppError_default(status4.NOT_FOUND, "Industry not found");
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
        resumeFileSize: payload.resume?.resumeFileSize ?? null
      },
      include: {
        industry: true
      }
    });
    const admins = await tx.user.findMany({
      where: {
        role: Role.ADMIN,
        isDeleted: false,
        status: UserStatus.ACTIVE
      },
      select: { id: true }
    });
    if (admins.length > 0) {
      await tx.notification.createMany({
        data: admins.map((admin) => ({
          type: "EXPERT_APPLICATION",
          message: `${application.fullName} submitted an expert application`,
          userId: admin.id
        }))
      });
    }
    return application;
  });
  return createdApplication;
};
var getMyApplications = async (userId) => {
  return prisma.expertApplication.findMany({
    where: { userId },
    include: {
      industry: true
    },
    orderBy: { createdAt: "desc" }
  });
};
var getAllApplications = async (query2) => {
  const { page, limit, skip } = normalizePagination(query2);
  const orderBy = normalizeSort(query2);
  const filters = normalizeFilters(query2);
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
            image: true
          }
        },
        industry: true
      },
      orderBy,
      skip,
      take: limit
    }),
    prisma.expertApplication.count({ where })
  ]);
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getNewApplicants = async (query2) => {
  return getAllApplications({
    ...query2,
    status: ExpertApplicationStatus.PENDING
  });
};
var getAdminResumeAccess = async (applicationId) => {
  const application = await prisma.expertApplication.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      resumeUrl: true,
      resumeFileName: true,
      resumeFileType: true
    }
  });
  if (!application) {
    throw new AppError_default(status4.NOT_FOUND, "Expert application not found");
  }
  if (!application.resumeUrl || !application.resumeFileName || !application.resumeFileType) {
    throw new AppError_default(status4.BAD_REQUEST, "No resume uploaded for this application");
  }
  return {
    id: application.id,
    resumeUrl: application.resumeUrl,
    resumeFileName: application.resumeFileName,
    resumeFileType: application.resumeFileType
  };
};
var getApplicationById = async (id) => {
  const application = await prisma.expertApplication.findUnique({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          image: true
        }
      },
      industry: true
    },
    where: { id }
  });
  if (!application) {
    throw new AppError_default(status4.NOT_FOUND, "Expert application not found");
  }
  return application;
};
var reviewApplication = async (applicationId, adminId, payload) => {
  const application = await prisma.expertApplication.findUnique({
    where: { id: applicationId },
    include: { user: true }
  });
  if (!application) {
    throw new AppError_default(status4.NOT_FOUND, "Expert application not found");
  }
  if (application.status !== ExpertApplicationStatus.PENDING) {
    throw new AppError_default(status4.BAD_REQUEST, "This application has already been reviewed");
  }
  const now = /* @__PURE__ */ new Date();
  const reviewed = await prisma.$transaction(async (tx) => {
    let expertId = null;
    if (payload.status === ExpertApplicationStatus.APPROVED) {
      const existingExpert = await tx.expert.findFirst({
        where: {
          userId: application.userId,
          isDeleted: false
        }
      });
      const expert = existingExpert || await tx.expert.create({
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
          isVerified: true
        }
      });
      expertId = expert.id;
      await tx.expertVerification.upsert({
        where: { expertId: expert.id },
        create: {
          expertId: expert.id,
          status: VerificationStatus.APPROVED,
          notes: payload.notes,
          verifiedBy: adminId,
          verifiedAt: now
        },
        update: {
          status: VerificationStatus.APPROVED,
          notes: payload.notes,
          verifiedBy: adminId,
          verifiedAt: now
        }
      });
      await tx.expert.update({
        where: { id: expert.id },
        data: { isVerified: true }
      });
      await tx.user.update({
        where: { id: application.userId },
        data: { role: Role.EXPERT }
      });
      const clientProfile = await tx.client.findUnique({
        where: { userId: application.userId }
      });
      if (clientProfile && !clientProfile.isDeleted) {
        await tx.client.update({
          where: { id: clientProfile.id },
          data: {
            isDeleted: true,
            deletedAt: now
          }
        });
      }
    }
    const updatedApplication = await tx.expertApplication.update({
      where: { id: applicationId },
      data: {
        status: payload.status,
        reviewNotes: payload.notes,
        reviewedBy: adminId,
        reviewedAt: now
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        industry: true
      }
    });
    const message = payload.status === ExpertApplicationStatus.APPROVED ? "Your expert application has been approved. You can now continue as an expert." : `Your expert application has been rejected${payload.notes ? `: ${payload.notes}` : "."}`;
    await tx.notification.create({
      data: {
        type: "EXPERT_APPLICATION_REVIEWED",
        message,
        userId: application.userId
      }
    });
    return {
      ...updatedApplication,
      expertId
    };
  });
  try {
    await sendEmail({
      to: application.email,
      subject: payload.status === ExpertApplicationStatus.APPROVED ? "Your ConsultEdge expert application was approved" : "Your ConsultEdge expert application was reviewed",
      templateName: "expertApplicationDecision",
      templateData: {
        name: application.fullName,
        status: payload.status,
        notes: payload.notes
      }
    });
  } catch (error) {
    console.error("Failed to send expert application review email", error);
  }
  return reviewed;
};
var verifyExpert = async (expertId, adminId, payload) => {
  const expert = await prisma.expert.findUnique({
    where: { id: expertId, isDeleted: false }
  });
  if (!expert) {
    throw new AppError_default(status4.NOT_FOUND, "Expert not found");
  }
  const verificationMessage = payload.status === VerificationStatus.APPROVED ? "Your expert profile has been approved by the admin." : payload.status === VerificationStatus.REJECTED ? `Your expert verification request has been rejected${payload.notes ? `: ${payload.notes}` : "."}` : "Your expert verification status is now pending review.";
  const verification = await prisma.$transaction(async (tx) => {
    const record = await tx.expertVerification.upsert({
      where: { expertId },
      create: {
        expertId,
        status: payload.status,
        notes: payload.notes,
        verifiedBy: adminId,
        verifiedAt: /* @__PURE__ */ new Date()
      },
      update: {
        status: payload.status,
        notes: payload.notes,
        verifiedBy: adminId,
        verifiedAt: /* @__PURE__ */ new Date()
      }
    });
    await tx.expert.update({
      where: { id: expertId },
      data: {
        isVerified: payload.status === VerificationStatus.APPROVED
      }
    });
    await tx.notification.create({
      data: {
        type: "EXPERT_VERIFICATION_UPDATE",
        message: verificationMessage,
        userId: expert.userId
      }
    });
    return record;
  });
  return verification;
};
var expertVerificationService = {
  submitApplication,
  getMyApplications,
  getAdminResumeAccess,
  getAllApplications,
  getNewApplicants,
  getApplicationById,
  reviewApplication,
  verifyExpert
};

// src/shared/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

// src/shared/sendResponsr.ts
var sendResponse = (res, responseData) => {
  const { httpStatusCode, success, message, data, meta } = responseData;
  res.status(httpStatusCode).json({
    success,
    message,
    data,
    ...meta ? { meta } : {}
  });
};

// src/modules/expert/expertApplication.upload.ts
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// src/config/cloudinary.config.ts
import { v2 as cloudinary } from "cloudinary";
import status5 from "http-status";
cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});
var cloudinaryUpload = cloudinary;

// src/modules/expert/expertApplication.upload.ts
var allowedResumeMimeTypes = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);
var allowedImageMimeTypes = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif"
]);
var storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (_req, file) => {
    const originalName = file.originalname;
    const extension = originalName.split(".").pop()?.toLowerCase();
    const fileNameWithoutExtension = originalName.split(".").slice(0, -1).join(".").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9/-]/g, "");
    const uniqueName = `${Math.random().toString(36).substring(2)}-${Date.now()}-${fileNameWithoutExtension}`;
    let folder = "documents";
    if (file.fieldname === "profilePhoto") {
      folder = "expert-profile-photos";
    } else if (file.fieldname === "resume") {
      folder = extension === "pdf" ? "resumes" : "documents";
    }
    return {
      folder: `consultedge/${folder}`,
      public_id: uniqueName,
      resource_type: "auto"
    };
  }
});
var fileFilter = (_req, file, cb) => {
  if (file.fieldname === "profilePhoto") {
    if (!allowedImageMimeTypes.has(file.mimetype)) {
      cb(new Error("Invalid profile photo type. Allowed: JPG, PNG, WEBP, GIF"));
      return;
    }
    cb(null, true);
    return;
  }
  if (file.fieldname === "resume") {
    if (!allowedResumeMimeTypes.has(file.mimetype)) {
      cb(new Error("Invalid resume type. Allowed: PDF, DOC, DOCX"));
      return;
    }
    cb(null, true);
    return;
  }
  cb(new Error(`Unexpected file field: ${file.fieldname}`));
};
var expertApplicationUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});
var mapUploadedResume = (file) => {
  const cloudinaryFile = file;
  const resumeUrl = cloudinaryFile.path ?? cloudinaryFile.secure_url;
  if (!resumeUrl) {
    throw new Error("Failed to resolve uploaded resume URL from Cloudinary");
  }
  return {
    resumeUrl,
    resumeFileName: file.originalname,
    resumeFileType: file.mimetype,
    resumeFileSize: file.size
  };
};
var mapUploadedProfilePhoto = (file) => {
  const cloudinaryFile = file;
  return cloudinaryFile.path ?? cloudinaryFile.secure_url ?? null;
};

// src/modules/expertVerification/expertVerification.controler.ts
var verifyExpert2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.userId;
  const payload = req.body;
  const result = await expertVerificationService.verifyExpert(
    id,
    adminId,
    payload
  );
  sendResponse(res, {
    httpStatusCode: status6.OK,
    success: true,
    message: "Expert verification updated successfully",
    data: result
  });
});
var submitApplication2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const files = req.files;
  const resumeFile = files?.resume?.[0];
  const profilePhotoFile = files?.profilePhoto?.[0];
  const resume = resumeFile ? mapUploadedResume(resumeFile) : req.body?.resume;
  const profilePhoto = profilePhotoFile ? mapUploadedProfilePhoto(profilePhotoFile) : req.body?.profilePhoto;
  const payload = {
    ...req.body,
    ...resume ? { resume } : {},
    ...profilePhoto ? { profilePhoto } : {}
  };
  const result = await expertVerificationService.submitApplication(userId, payload);
  sendResponse(res, {
    httpStatusCode: status6.CREATED,
    success: true,
    message: "Expert application submitted successfully",
    data: result
  });
});
var getMyApplications2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await expertVerificationService.getMyApplications(userId);
  sendResponse(res, {
    httpStatusCode: status6.OK,
    success: true,
    message: "My expert applications fetched successfully",
    data: result
  });
});
var getAllApplications2 = catchAsync(async (_req, res) => {
  const result = await expertVerificationService.getAllApplications(_req.query);
  sendResponse(res, {
    httpStatusCode: status6.OK,
    success: true,
    message: "Expert applications fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getNewApplicants2 = catchAsync(async (_req, res) => {
  const result = await expertVerificationService.getNewApplicants(_req.query);
  sendResponse(res, {
    httpStatusCode: status6.OK,
    success: true,
    message: "Pending expert applications fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getApplicationById2 = catchAsync(async (req, res) => {
  const result = await expertVerificationService.getApplicationById(String(req.params.id));
  sendResponse(res, {
    httpStatusCode: status6.OK,
    success: true,
    message: "Expert application fetched successfully",
    data: result
  });
});
var reviewApplication2 = catchAsync(async (req, res) => {
  const adminId = req.user.userId;
  const result = await expertVerificationService.reviewApplication(
    String(req.params.id),
    adminId,
    req.body
  );
  sendResponse(res, {
    httpStatusCode: status6.OK,
    success: true,
    message: "Expert application reviewed successfully",
    data: result
  });
});
var openApplicationResume = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { download } = req.query;
  const resume = await expertVerificationService.getAdminResumeAccess(String(id));
  const response = await fetch(resume.resumeUrl);
  if (!response.ok) {
    return sendResponse(res, {
      httpStatusCode: status6.BAD_GATEWAY,
      success: false,
      message: "Failed to load resume from storage",
      data: null
    });
  }
  const fileBuffer = Buffer.from(await response.arrayBuffer());
  const isDownload = download === "true";
  const disposition = `${isDownload ? "attachment" : "inline"}; filename="${encodeURIComponent(
    resume.resumeFileName
  )}"`;
  res.setHeader("Content-Type", resume.resumeFileType || "application/octet-stream");
  res.setHeader("Content-Disposition", disposition);
  res.setHeader("Content-Length", fileBuffer.length.toString());
  return res.status(status6.OK).send(fileBuffer);
});
var expertVerificationController = {
  submitApplication: submitApplication2,
  getMyApplications: getMyApplications2,
  getAllApplications: getAllApplications2,
  getNewApplicants: getNewApplicants2,
  getApplicationById: getApplicationById2,
  reviewApplication: reviewApplication2,
  openApplicationResume,
  verifyExpert: verifyExpert2
};

// src/modules/expertVerification/expertVerification.router.ts
var router = Router();
var applicationUploadMiddleware = expertApplicationUpload.fields([
  { name: "resume", maxCount: 1 },
  { name: "profilePhoto", maxCount: 1 }
]);
router.post(
  "/applications",
  checkAuth(Role.CLIENT),
  applicationUploadMiddleware,
  validateRequest(submitApplicationValidationSchema),
  expertVerificationController.submitApplication
);
router.post(
  "/apply",
  checkAuth(Role.CLIENT),
  applicationUploadMiddleware,
  validateRequest(submitApplicationValidationSchema),
  expertVerificationController.submitApplication
);
router.get(
  "/new-applicants",
  checkAuth(Role.ADMIN),
  validateRequest(adminNewApplicantsListValidationSchema),
  expertVerificationController.getNewApplicants
);
router.get(
  "/applications/me",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  expertVerificationController.getMyApplications
);
router.get(
  "/applications",
  checkAuth(Role.ADMIN),
  validateRequest(adminApplicationsListValidationSchema),
  expertVerificationController.getAllApplications
);
router.get(
  "/applications/:id",
  checkAuth(Role.ADMIN),
  validateRequest(applicationIdParamValidationSchema),
  expertVerificationController.getApplicationById
);
router.patch(
  "/applications/:id/review",
  checkAuth(Role.ADMIN),
  validateRequest(reviewApplicationValidationSchema),
  expertVerificationController.reviewApplication
);
router.get(
  "/applications/:id/resume",
  checkAuth(Role.ADMIN),
  validateRequest(applicationResumeAccessValidationSchema),
  expertVerificationController.openApplicationResume
);
router.patch(
  "/verify/:id",
  checkAuth(Role.ADMIN),
  validateRequest(verifyExpertValidationSchema),
  expertVerificationController.verifyExpert
);
var expertVerificationRouter = router;

// src/modules/auth/auth.router.ts
import { Router as Router2 } from "express";

// src/modules/auth/auth.service.ts
import status7 from "http-status";

// src/utilis/seed.ts
var DEMO_CLIENT_EMAIL = process.env.DEMO_CLIENT_EMAIL || "client@consultedge.demo";
var DEMO_CLIENT_PASSWORD = process.env.DEMO_CLIENT_PASSWORD || "Demo@12345";
var DEMO_CLIENT_NAME = process.env.DEMO_CLIENT_NAME || "Demo Client";
var DEMO_EXPERT_EMAIL = process.env.DEMO_EXPERT_EMAIL || "expert@consultedge.demo";
var DEMO_EXPERT_PASSWORD = process.env.DEMO_EXPERT_PASSWORD || "Demo@12345";
var DEMO_EXPERT_NAME = process.env.DEMO_EXPERT_NAME || "Demo Expert";
var DEMO_ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL || "admin@consultedge.demo";
var DEMO_ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || "Demo@12345";
var DEMO_ADMIN_NAME = process.env.DEMO_ADMIN_NAME || "Demo Admin";
var getDemoClientCredentials = () => ({
  email: DEMO_CLIENT_EMAIL,
  password: DEMO_CLIENT_PASSWORD,
  name: DEMO_CLIENT_NAME
});
var getDemoExpertCredentials = () => ({
  email: DEMO_EXPERT_EMAIL,
  password: DEMO_EXPERT_PASSWORD,
  name: DEMO_EXPERT_NAME
});
var getDemoAdminCredentials = () => ({
  email: DEMO_ADMIN_EMAIL,
  password: DEMO_ADMIN_PASSWORD,
  name: DEMO_ADMIN_NAME
});
var seedDemoClient = async () => {
  const credentials = getDemoClientCredentials();
  const existingUser = await prisma.user.findUnique({
    where: {
      email: credentials.email
    },
    select: {
      id: true
    }
  });
  let userId = existingUser?.id;
  if (!userId) {
    const created = await auth.api.signUpEmail({
      body: {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
        role: Role.CLIENT,
        rememberMe: false
      }
    });
    userId = created.user.id;
  }
  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      name: credentials.name,
      role: Role.CLIENT,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      needPasswordChange: false,
      isDeleted: false,
      deletedAt: null
    }
  });
  await prisma.client.upsert({
    where: {
      userId
    },
    create: {
      userId,
      fullName: credentials.name,
      email: credentials.email,
      isDeleted: false
    },
    update: {
      fullName: credentials.name,
      email: credentials.email,
      isDeleted: false,
      deletedAt: null
    }
  });
  return credentials;
};
var seedAdmin = async () => {
  try {
    const isAdminExists = await prisma.user.findFirst({
      where: {
        role: Role.ADMIN
      }
    });
    if (isAdminExists) {
      console.log("Admin seed skipped: admin already exists");
      return;
    }
    const adminUser = await auth.api.signUpEmail({
      body: {
        email: envVars.ADMIN_EMAIL,
        password: envVars.ADMIN_PASSWORD,
        name: "Admin Saheb",
        role: Role.ADMIN,
        rememberMe: false
      }
    });
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: adminUser.user.id
        },
        data: {
          emailVerified: true
        }
      });
      await tx.admin.create({
        data: {
          userId: adminUser.user.id,
          name: " Admin Saheb",
          email: envVars.ADMIN_EMAIL
        }
      });
    });
    const admin = await prisma.admin.findFirst({
      where: {
        email: envVars.ADMIN_EMAIL
      },
      include: {
        user: true
      }
    });
    console.log(" admin created", admin);
  } catch (error) {
    console.error("Error sending  admin", error);
    await prisma.user.delete({
      where: {
        email: envVars.ADMIN_EMAIL
      }
    });
  }
};
var seedDemoExpert = async () => {
  const credentials = getDemoExpertCredentials();
  let industry = await prisma.industry.findFirst({
    where: { isDeleted: false },
    select: { id: true }
  });
  if (!industry) {
    industry = await prisma.industry.create({
      data: {
        name: "General Consulting",
        description: "General consulting and advisory services."
      },
      select: { id: true }
    });
  }
  const existingUser = await prisma.user.findUnique({
    where: { email: credentials.email },
    select: { id: true }
  });
  let userId = existingUser?.id;
  if (!userId) {
    const created = await auth.api.signUpEmail({
      body: {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
        role: Role.EXPERT,
        rememberMe: false
      }
    });
    userId = created.user.id;
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: credentials.name,
      role: Role.EXPERT,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      needPasswordChange: false,
      isDeleted: false,
      deletedAt: null
    }
  });
  await prisma.expert.upsert({
    where: { userId },
    create: {
      userId,
      fullName: credentials.name,
      email: credentials.email,
      title: "Senior Strategy Consultant",
      bio: "Demo expert profile used for product walkthroughs.",
      experience: 8,
      consultationFee: 120,
      isVerified: true,
      industryId: industry.id,
      isDeleted: false
    },
    update: {
      fullName: credentials.name,
      email: credentials.email,
      isVerified: true,
      isDeleted: false,
      deletedAt: null
    }
  });
  return credentials;
};
var seedDemoAdmin = async () => {
  const credentials = getDemoAdminCredentials();
  const existingUser = await prisma.user.findUnique({
    where: { email: credentials.email },
    select: { id: true }
  });
  let userId = existingUser?.id;
  if (!userId) {
    const created = await auth.api.signUpEmail({
      body: {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
        role: Role.ADMIN,
        rememberMe: false
      }
    });
    userId = created.user.id;
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: credentials.name,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      needPasswordChange: false,
      isDeleted: false,
      deletedAt: null
    }
  });
  await prisma.admin.upsert({
    where: { userId },
    create: {
      userId,
      name: credentials.name,
      email: credentials.email
    },
    update: {
      name: credentials.name,
      email: credentials.email
    }
  });
  return credentials;
};

// src/modules/auth/auth.service.ts
var isBetterAuthLikeError = (error) => {
  if (!error || typeof error !== "object") {
    return false;
  }
  const candidate = error;
  return typeof candidate.statusCode === "number" || typeof candidate.status === "string" || typeof candidate.body?.message === "string";
};
var mapBetterAuthError = (error, fallbackMessage) => {
  if (!isBetterAuthLikeError(error)) {
    return null;
  }
  const message = error.body?.message || error.message || fallbackMessage;
  const statusCode = typeof error.statusCode === "number" ? error.statusCode : error.status === "UNAUTHORIZED" ? status7.UNAUTHORIZED : status7.BAD_REQUEST;
  return new AppError_default(statusCode, message);
};
var registerClient = async (payload) => {
  const { fullName, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: { name: fullName, email, password }
  });
  if (!data.user) {
    throw new AppError_default(status7.BAD_REQUEST, "Failed to register user");
  }
  await prisma.user.update({
    where: { id: data.user.id },
    data: { role: Role.CLIENT }
  });
  const client = await prisma.$transaction(async (tx) => {
    try {
      const profile = await tx.client.create({
        data: {
          userId: data.user.id,
          fullName,
          email
        }
      });
      return profile;
    } catch (err) {
      await prisma.user.delete({ where: { id: data.user.id } });
      throw err;
    }
  });
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: Role.CLIENT,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: Role.CLIENT,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  console.log(data, accessToken, refreshToken, client);
  return {
    ...data,
    accessToken,
    refreshToken,
    client
  };
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: { email, password }
  }).catch((error) => {
    const mappedError = mapBetterAuthError(
      error,
      "Invalid email or password"
    );
    if (mappedError) {
      throw mappedError;
    }
    throw error;
  });
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status7.FORBIDDEN, "User is Blocked");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status7.FORBIDDEN, "User is deleted");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  return {
    ...data,
    accessToken,
    refreshToken
    // user: data.user,
    // token: data.token,        // <-- BetterAuth session token
    // redirect: data.redirect,
    // url: data.url,
    // accessToken,
    // refreshToken
  };
};
var loginDemoClient = async () => {
  await seedDemoClient();
  const credentials = getDemoClientCredentials();
  const data = await auth.api.signInEmail({
    body: {
      email: credentials.email,
      password: credentials.password
    }
  }).catch((error) => {
    const mappedError = mapBetterAuthError(
      error,
      "Client demo login failed"
    );
    if (mappedError) {
      throw mappedError;
    }
    throw error;
  });
  if (data.user.role !== Role.CLIENT) {
    throw new AppError_default(status7.FORBIDDEN, "Demo account role is invalid");
  }
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status7.FORBIDDEN, "User is Blocked");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status7.FORBIDDEN, "User is deleted");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  return {
    ...data,
    accessToken,
    refreshToken
  };
};
var loginDemoExpert = async () => {
  await seedDemoExpert();
  const credentials = getDemoExpertCredentials();
  const data = await auth.api.signInEmail({
    body: {
      email: credentials.email,
      password: credentials.password
    }
  }).catch((error) => {
    const mappedError = mapBetterAuthError(error, "Expert demo login failed");
    if (mappedError) throw mappedError;
    throw error;
  });
  if (data.user.role !== Role.EXPERT) {
    throw new AppError_default(status7.FORBIDDEN, "Demo account role is invalid");
  }
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status7.FORBIDDEN, "User is Blocked");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status7.FORBIDDEN, "User is deleted");
  }
  const tokenPayload = {
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  };
  return {
    ...data,
    accessToken: tokenUtils.getAccessToken(tokenPayload),
    refreshToken: tokenUtils.getRefreshToken(tokenPayload)
  };
};
var loginDemoAdmin = async () => {
  await seedDemoAdmin();
  const credentials = getDemoAdminCredentials();
  const data = await auth.api.signInEmail({
    body: {
      email: credentials.email,
      password: credentials.password
    }
  }).catch((error) => {
    const mappedError = mapBetterAuthError(error, "Admin demo login failed");
    if (mappedError) throw mappedError;
    throw error;
  });
  if (data.user.role !== Role.ADMIN) {
    throw new AppError_default(status7.FORBIDDEN, "Demo account role is invalid");
  }
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status7.FORBIDDEN, "User is Blocked");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status7.FORBIDDEN, "User is deleted");
  }
  const tokenPayload = {
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  };
  return {
    ...data,
    accessToken: tokenUtils.getAccessToken(tokenPayload),
    refreshToken: tokenUtils.getRefreshToken(tokenPayload)
  };
};
var getMe = async (user) => {
  const isUserExists = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      client: true,
      expert: {
        include: {
          industry: true,
          consultations: true,
          testimonials: true,
          schedules: true
        }
      },
      admin: true
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status7.NOT_FOUND, "User not found");
  }
  return isUserExists;
};
var getNewToken = async (refreshToken, sessionToken) => {
  const verifyRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET);
  if (!verifyRefreshToken.success) {
    throw new AppError_default(status7.UNAUTHORIZED, "invalid refresh token");
  }
  ;
  const data = verifyRefreshToken.data;
  if (!data?.userId) {
    throw new AppError_default(status7.UNAUTHORIZED, "invalid refresh token payload");
  }
  const user = await prisma.user.findUnique({
    where: {
      id: data.userId
    }
  });
  if (!user || user.isDeleted || user.status === UserStatus.DELETED || user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status7.UNAUTHORIZED, "User is not authorized");
  }
  let nextSessionToken = null;
  if (sessionToken) {
    try {
      const betterAuthSession = await auth.api.getSession({
        headers: {
          Cookie: `better-auth.session_token=${sessionToken}`
        }
      });
      if (betterAuthSession?.session && betterAuthSession.user?.id === user.id) {
        await prisma.session.update({
          where: {
            token: betterAuthSession.session.token
          },
          data: {
            expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1e3),
            updatedAt: /* @__PURE__ */ new Date()
          }
        }).catch(() => null);
        nextSessionToken = sessionToken;
      }
    } catch {
      nextSessionToken = null;
    }
  }
  const newAccessToken = tokenUtils.getAccessToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified
  });
  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: nextSessionToken
  };
};
var changePassword = async (payload, authContext) => {
  const { sessionToken, authorizationHeader, cookieHeader, userId } = authContext;
  const buildHeaders = (token) => {
    const headerInit = {};
    if (authorizationHeader) {
      headerInit.Authorization = authorizationHeader;
    } else if (token) {
      headerInit.Authorization = `Bearer ${token}`;
    }
    if (cookieHeader) {
      headerInit.Cookie = cookieHeader;
    } else if (token) {
      headerInit.Cookie = `better-auth.session_token=${token}; __Secure-better-auth.session_token=${token}`;
    }
    return new Headers(headerInit);
  };
  if (!sessionToken && !authorizationHeader && !cookieHeader && !userId) {
    throw new AppError_default(status7.UNAUTHORIZED, "Session expired. Please login again.");
  }
  let authHeaders = buildHeaders(sessionToken);
  let session = await auth.api.getSession({
    headers: authHeaders
  }).catch(() => null);
  if (!session?.user && userId) {
    const activeSession = await prisma.session.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: /* @__PURE__ */ new Date()
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
    if (activeSession?.token) {
      authHeaders = buildHeaders(activeSession.token);
      session = await auth.api.getSession({
        headers: authHeaders
      }).catch(() => null);
    }
  }
  if (!session?.user) {
    throw new AppError_default(status7.UNAUTHORIZED, "Invalid session token. Please login again.");
  }
  const { currentPassword, newPassword } = payload;
  if (currentPassword && currentPassword === newPassword) {
    throw new AppError_default(
      status7.BAD_REQUEST,
      "New password must be different from current password"
    );
  }
  const credentialAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "credential"
    }
  });
  let result;
  if (credentialAccount?.password) {
    if (!currentPassword) {
      throw new AppError_default(status7.BAD_REQUEST, "Current password is required");
    }
    result = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true
      },
      headers: authHeaders
    });
  } else {
    result = await auth.api.setPassword({
      body: {
        newPassword
      },
      headers: authHeaders
    });
  }
  const operationStatus = "status" in result ? result.status : true;
  if (!operationStatus) {
    const errorMessage = typeof result?.message === "string" ? result.message : "Password change failed. Please verify your current password and try again.";
    throw new AppError_default(status7.BAD_REQUEST, errorMessage);
  }
  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { needPasswordChange: false }
    });
  }
  const updatedUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });
  if (!updatedUser) {
    throw new AppError_default(status7.NOT_FOUND, "User not found");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    role: updatedUser.role,
    status: updatedUser.status,
    isDeleted: updatedUser.isDeleted,
    emailVerified: updatedUser.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    role: updatedUser.role,
    status: updatedUser.status,
    isDeleted: updatedUser.isDeleted,
    emailVerified: updatedUser.emailVerified
  });
  const betterAuthToken = "token" in result ? result.token : null;
  return {
    status: operationStatus,
    token: betterAuthToken,
    user: updatedUser,
    accessToken,
    refreshToken
  };
};
var logOutUser = async (sessionToken) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  return result;
};
var verifyEmail = async (email, otp) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp
    }
  });
  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email
      },
      data: {
        emailVerified: true
      }
    });
  }
};
var forgetPassword = async (email) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status7.NOT_FOUND, "user not found");
  }
  if (!isUserExists.emailVerified) {
    throw new AppError_default(status7.BAD_REQUEST, "email not verified");
  }
  if (isUserExists.isDeleted || isUserExists.status === UserStatus.DELETED) {
    throw new AppError_default(status7.NOT_FOUND, "user not found");
  }
  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email
    }
  });
};
var resetPassword = async (email, otp, newPassword) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status7.NOT_FOUND, "user not found");
  }
  if (!isUserExists.emailVerified) {
    throw new AppError_default(status7.BAD_REQUEST, "email not verified");
  }
  if (isUserExists.isDeleted || isUserExists.status === UserStatus.DELETED) {
    throw new AppError_default(status7.NOT_FOUND, "user not found");
  }
  const previousCredentialAccount = await prisma.account.findFirst({
    where: {
      userId: isUserExists.id,
      providerId: "credential"
    },
    select: {
      password: true,
      updatedAt: true
    }
  });
  const result = await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword
    }
  });
  if (!result?.success) {
    throw new AppError_default(status7.BAD_REQUEST, "Password reset failed");
  }
  const updatedCredentialAccount = await prisma.account.findFirst({
    where: {
      userId: isUserExists.id,
      providerId: "credential"
    },
    select: {
      password: true,
      updatedAt: true
    }
  });
  if (!updatedCredentialAccount?.password) {
    throw new AppError_default(status7.BAD_REQUEST, "New password was not saved");
  }
  if (previousCredentialAccount && previousCredentialAccount.password === updatedCredentialAccount.password && previousCredentialAccount.updatedAt.getTime() === updatedCredentialAccount.updatedAt.getTime()) {
    throw new AppError_default(status7.BAD_REQUEST, "New password was not saved");
  }
  if (isUserExists.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: isUserExists.id
      },
      data: {
        needPasswordChange: false
      }
    });
  }
  await prisma.session.deleteMany({
    where: {
      userId: isUserExists.id
    }
  });
};
var googleLoginSuccess = async (session) => {
  const isPatientExists = await prisma.client.findUnique({
    where: {
      userId: session.user.id
    }
  });
  if (!isPatientExists) {
    await prisma.client.create({
      data: {
        userId: session.user.id,
        fullName: session.user.name,
        email: session.user.email
      }
    });
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name
  });
  return {
    accessToken,
    refreshToken
  };
};
var checkEmailExists = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });
  return !!user;
};
var updateProfile = async (user, payload) => {
  const baseUpdate = {
    name: payload.name,
    email: payload.email,
    image: payload.image
  };
  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: baseUpdate
  });
  if (updatedUser.role === "EXPERT") {
    await prisma.expert.update({
      where: { userId: user.userId },
      data: {
        title: payload.title,
        experience: payload.experience,
        industryId: payload.industryId
      }
    });
  }
  if (updatedUser.role === "CLIENT") {
    await prisma.client.update({
      where: { userId: user.userId },
      data: {
        fullName: payload.fullName
      }
    });
  }
  return updatedUser;
};
var authService = {
  registerClient,
  loginUser,
  loginDemoClient,
  loginDemoExpert,
  loginDemoAdmin,
  getMe,
  getNewToken,
  changePassword,
  logOutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLoginSuccess,
  checkEmailExists,
  updateProfile
};

// src/modules/auth/auth.controler.ts
import status8 from "http-status";
var getBetterAuthSessionToken = (req) => req.cookies["better-auth.session_token"] ?? req.cookies["__Secure-better-auth.session_token"];
var registeredUser = catchAsync(
  async (req, res) => {
    const payload = req.body;
    console.log(payload);
    const result = await authService.registerClient(payload);
    sendResponse(res, {
      httpStatusCode: status8.CREATED,
      success: true,
      message: "user registered successfully",
      data: result
    });
  }
);
var loginUser2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authService.loginUser(payload);
  const {
    accessToken,
    refreshToken,
    token,
    // BetterAuth session token
    user,
    // MUST be included
    ...rest
    // role, emailVerified, needPasswordChange, redirect, etc.
  } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "login successfully",
    data: {
      accessToken,
      refreshToken,
      token,
      user,
      // REQUIRED
      ...rest
      // role, emailVerified, needPasswordChange, redirect
    }
  });
});
var clientDemoLogin = catchAsync(async (_req, res) => {
  const result = await authService.loginDemoClient();
  const {
    accessToken,
    refreshToken,
    token,
    user,
    ...rest
  } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "demo login successfully",
    data: {
      accessToken,
      refreshToken,
      token,
      user,
      ...rest
    }
  });
});
var expertDemoLogin = catchAsync(async (_req, res) => {
  const result = await authService.loginDemoExpert();
  const { accessToken, refreshToken, token, user, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "expert demo login successfully",
    data: { accessToken, refreshToken, token, user, ...rest }
  });
});
var adminDemoLogin = catchAsync(async (_req, res) => {
  const result = await authService.loginDemoAdmin();
  const { accessToken, refreshToken, token, user, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "admin demo login successfully",
    data: { accessToken, refreshToken, token, user, ...rest }
  });
});
var getMe2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const result = await authService.getMe(user);
    sendResponse(res, {
      httpStatusCode: status8.OK,
      success: true,
      message: "user profile fetched successfully",
      data: result
    });
  }
);
var getNewToken2 = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const betterAuthSessionToken = getBetterAuthSessionToken(req);
  if (!refreshToken) {
    throw new AppError_default(status8.UNAUTHORIZED, "refresh token is missing");
  }
  const results = await authService.getNewToken(refreshToken, betterAuthSessionToken);
  const { accessToken, refreshToken: newRefreshToken, sessionToken } = results;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
  if (sessionToken) {
    tokenUtils.setBetterAuthSessionCookie(res, sessionToken);
  }
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "new tokens successfully",
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      sessionToken
    }
  });
});
var changePassword2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const betterAuthSessionToken = getBetterAuthSessionToken(req);
  const result = await authService.changePassword(
    payload,
    {
      sessionToken: betterAuthSessionToken,
      authorizationHeader: req.headers.authorization,
      cookieHeader: req.headers.cookie,
      userId: req.user?.userId
    }
  );
  const { accessToken, refreshToken } = result;
  const betterAuthToken = result.token;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  if (betterAuthToken) {
    tokenUtils.setBetterAuthSessionCookie(res, betterAuthToken);
  }
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "Password changed successfully",
    data: result
  });
});
var logOutUser2 = catchAsync(async (req, res) => {
  const betterAuthSessionToken = getBetterAuthSessionToken(req);
  const result = await authService.logOutUser(betterAuthSessionToken);
  const cookieNames = [
    "accessToken",
    "refreshToken",
    "better-auth.session_token",
    "__Secure-better-auth.session_token"
  ];
  const clearOptionVariants = [
    { httpOnly: true, secure: true, sameSite: "none", path: "/" },
    { httpOnly: true, secure: false, sameSite: "lax", path: "/" },
    { httpOnly: true, secure: true, sameSite: "lax", path: "/" },
    { path: "/" },
    {}
  ];
  for (const name of cookieNames) {
    for (const opts of clearOptionVariants) {
      CookieUtils.clearCookie(res, name, opts);
    }
  }
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "successfully Logout",
    data: result
  });
});
var verifyEmail2 = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  await authService.verifyEmail(email, otp);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "email verified successfully"
  });
});
var forgetPassword2 = catchAsync(async (req, res) => {
  const { email } = req.body;
  await authService.forgetPassword(email);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "password reset OTP sent to email successfully"
  });
});
var resetPassword2 = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await authService.resetPassword(email, otp, newPassword);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "password reset successfully"
  });
});
var googleLogin = catchAsync((req, res) => {
  const redirectPath = req.query.redirect || "/dashboard";
  const encodedRedirectPath = encodeURIComponent(redirectPath);
  const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Login</title>
</head>
<body>
    <div><p>Redirecting to Google...</p></div>
    <script>
    (async () => {
        try {
            // Use a relative URL so the request always targets this same backend
            // origin, regardless of how BETTER_AUTH_URL is configured. Avoids
            // mixed-content / cross-origin failures behind a proxy.
            const response = await fetch("/api/auth/sign-in/social", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ provider: "google", callbackURL: ${JSON.stringify(callbackURL)} })
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                document.body.innerHTML = '<div><p>Error redirecting to Google. Please try again later.</p></div>';
            }
        } catch (error) {
            document.body.innerHTML = '<div><p>Error redirecting to Google: ' + (error && error.message ? error.message : 'Unknown error') + '</p></div>';
        }
    })();
    </script>
</body>
</html>`;
  res.set("Content-Type", "text/html").send(html);
});
var googleLoginSuccess2 = catchAsync(async (req, res) => {
  const redirectPath = req.query.redirect || "/dashboard";
  const sessionToken = getBetterAuthSessionToken(req);
  if (!sessionToken) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
  }
  const session = await auth.api.getSession({
    headers: {
      "Cookie": `better-auth.session_token=${sessionToken}`
    }
  });
  if (!session) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
  }
  if (session && !session.user) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
  }
  const result = await authService.googleLoginSuccess(session);
  const { accessToken, refreshToken } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, sessionToken);
  const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";
  const callbackParams = new URLSearchParams({
    accessToken,
    refreshToken,
    sessionToken,
    redirect: finalRedirectPath
  }).toString();
  res.redirect(`${envVars.FRONTEND_URL}/auth/oauth-callback?${callbackParams}`);
});
var handlerOAuthError = catchAsync(async (req, res) => {
  const error = req.query.error || "oauth failed";
  res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});
var checkEmailAvailability = catchAsync(async (req, res) => {
  const email = req.query.email;
  const exists = await authService.checkEmailExists(email);
  if (exists) {
    return sendResponse(res, {
      httpStatusCode: 400,
      success: false,
      message: "Email already exists"
    });
  }
  return sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Email available"
  });
});
var updateProfile2 = catchAsync(async (req, res) => {
  const user = req.user;
  const payload = req.body;
  const result = await authService.updateProfile(user, payload);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "Profile updated successfully",
    data: result
  });
});
var authControler = {
  registeredUser,
  loginUser: loginUser2,
  clientDemoLogin,
  expertDemoLogin,
  adminDemoLogin,
  getMe: getMe2,
  getNewToken: getNewToken2,
  changePassword: changePassword2,
  logOutUser: logOutUser2,
  verifyEmail: verifyEmail2,
  forgetPassword: forgetPassword2,
  resetPassword: resetPassword2,
  googleLogin,
  googleLoginSuccess: googleLoginSuccess2,
  handlerOAuthError,
  checkEmailAvailability,
  updateProfile: updateProfile2
};

// src/modules/auth/auth.validation.ts
import { z as z2 } from "zod";
var registerZodSchema = z2.object({
  fullName: z2.string().min(3, "Full name is required"),
  email: z2.string().email("Invalid email"),
  password: z2.string().min(6, "Password must be at least 6 characters")
});
var loginZodSchema = z2.object({
  email: z2.email("Invalid email address"),
  password: z2.string().min(1, "Password is required").min(8, "Password must be at least 8 characters long").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)")
});
var clientDemoLoginZodSchema = z2.object({
  mode: z2.literal("client").optional()
});
var forgotPasswordZodSchema = z2.object({
  email: z2.string().email("Invalid email")
});
var changePasswordZodSchema = z2.object({
  currentPassword: z2.string().trim().optional().transform((value) => value || void 0),
  newPassword: z2.string().min(8, "Password must be at least 8 characters long").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)")
});
var updateProfileSchema = z2.object({
  name: z2.string().min(2).optional(),
  email: z2.string().email().optional(),
  image: z2.string().url().nullable().optional(),
  // Expert fields
  title: z2.string().optional(),
  experience: z2.number().optional(),
  industryId: z2.string().optional(),
  // Client fields
  fullName: z2.string().optional()
});

// src/modules/auth/auth.router.ts
var router2 = Router2();
router2.post("/register", validateRequest(registerZodSchema), authControler.registeredUser);
router2.post("/login", validateRequest(loginZodSchema), authControler.loginUser);
router2.post("/demo-login", validateRequest(clientDemoLoginZodSchema), authControler.clientDemoLogin);
router2.post("/demo-login/expert", authControler.expertDemoLogin);
router2.post("/demo-login/admin", authControler.adminDemoLogin);
router2.get("/me", checkAuth(), authControler.getMe);
router2.post("/refresh-token", authControler.getNewToken);
router2.post(
  "/change-password",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  validateRequest(changePasswordZodSchema),
  authControler.changePassword
);
router2.post("/logOut", checkAuth(Role.ADMIN, Role.CLIENT, Role.EXPERT), authControler.logOutUser);
var authRoutes = router2;
router2.post("/verify-email", authControler.verifyEmail);
router2.post("/forget-password", validateRequest(forgotPasswordZodSchema), authControler.forgetPassword);
router2.post("/reset-password", authControler.resetPassword);
router2.get("/login/google", authControler.googleLogin);
router2.get("/google/success", authControler.googleLoginSuccess);
router2.get("/oauth/error", authControler.handlerOAuthError);
router2.get("/check-email", authControler.checkEmailAvailability);
router2.put(
  "/update-profile",
  checkAuth(),
  validateRequest(updateProfileSchema),
  authControler.updateProfile
);

// src/modules/expert/expert.route.ts
import { Router as Router3 } from "express";

// src/modules/expert/expert.controler.ts
import status10 from "http-status";

// src/modules/expert/expert.service.ts
import status9 from "http-status";

// src/utilis/queryBuilder.ts
var QueryBuilder = class {
  constructor(model, queryParams, config2) {
    this.model = model;
    this.queryParams = queryParams;
    this.config = config2;
    this.page = 1;
    this.limit = 10;
    this.skip = 0;
    this.sortBy = "createdAt";
    this.sortOrder = "desc";
    this.selectFields = {};
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10
    };
    this.countQuery = {
      where: {}
    };
  }
  // SEARCH
  search() {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;
    if (searchTerm && searchableFields && searchableFields.length > 0) {
      const searchConditions = searchableFields.map(
        (field) => {
          if (field.includes(".")) {
            const parts = field.split(".");
            if (parts.length === 2) {
              const [relation, nestedField] = parts;
              const stringFilter2 = {
                contains: searchTerm,
                mode: "insensitive"
              };
              return {
                [relation]: {
                  [nestedField]: stringFilter2
                }
              };
            } else if (parts.length === 3) {
              const [relation, nestedRelation, nestedField] = parts;
              const stringFilter2 = {
                contains: searchTerm,
                mode: "insensitive"
              };
              return {
                [relation]: {
                  some: {
                    [nestedRelation]: {
                      [nestedField]: stringFilter2
                    }
                  }
                }
              };
            }
          }
          const stringFilter = {
            contains: searchTerm,
            mode: "insensitive"
          };
          return {
            [field]: stringFilter
          };
        }
      );
      const whereConditions = this.query.where;
      whereConditions.OR = searchConditions;
      const countWhereConditions = this.countQuery.where;
      countWhereConditions.OR = searchConditions;
    }
    return this;
  }
  // FILTER
  filter() {
    const { filterableFields } = this.config;
    const excludedField = ["searchTerm", "page", "limit", "sortBy", "sortOrder", "fields", "include"];
    const filterParams = {};
    Object.keys(this.queryParams).forEach((key) => {
      if (!excludedField.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });
    const queryWhere = this.query.where;
    const countQueryWhere = this.countQuery.where;
    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];
      if (value === void 0 || value === "") {
        return;
      }
      const isAllowedField = !filterableFields || filterableFields.length === 0 || filterableFields.includes(key);
      if (key.includes(".")) {
        const parts = key.split(".");
        if (filterableFields && !filterableFields.includes(key)) {
          return;
        }
        if (parts.length === 2) {
          const [relation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {};
            countQueryWhere[relation] = {};
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          queryRelation[nestedField] = this.parseFilterValue(value);
          countRelation[nestedField] = this.parseFilterValue(value);
          return;
        } else if (parts.length === 3) {
          const [relation, nestedRelation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {
              some: {}
            };
            countQueryWhere[relation] = {
              some: {}
            };
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          if (!queryRelation.some) {
            queryRelation.some = {};
          }
          if (!countRelation.some) {
            countRelation.some = {};
          }
          const querySome = queryRelation.some;
          const countSome = countRelation.some;
          if (!querySome[nestedRelation]) {
            querySome[nestedRelation] = {};
          }
          if (!countSome[nestedRelation]) {
            countSome[nestedRelation] = {};
          }
          const queryNestedRelation = querySome[nestedRelation];
          const countNestedRelation = countSome[nestedRelation];
          queryNestedRelation[nestedField] = this.parseFilterValue(value);
          countNestedRelation[nestedField] = this.parseFilterValue(value);
          return;
        }
      }
      if (!isAllowedField) {
        return;
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        queryWhere[key] = this.parseRangeFilter(value);
        countQueryWhere[key] = this.parseRangeFilter(value);
        return;
      }
      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });
    return this;
  }
  //paginate
  paginate() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;
    this.page = page;
    this.limit = limit;
    this.skip = (page - 1) * limit;
    this.query.skip = this.skip;
    this.query.take = this.limit;
    return this;
  }
  //sort 
  sort() {
    const sortBy = this.queryParams.sortBy || "createdAt";
    const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc";
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    if (sortBy.includes(".")) {
      const parts = sortBy.split(".");
      if (parts.length === 2) {
        const [realation, nestedField] = parts;
        this.query.orderBy = {
          [realation]: {
            [nestedField]: sortOrder
          }
        };
      } else if (parts.length === 3) {
        const [realation, nestedRealition, nestedField] = parts;
        this.query.orderBy = {
          [realation]: {
            [nestedField]: {
              [nestedRealition]: sortOrder
            }
          }
        };
      } else {
        this.query.orderBy = {
          [sortBy]: sortOrder
        };
      }
    }
    return this;
  }
  //  //fields
  //  fields():this{
  //   const fieldsParams = this.queryParams.fields
  // if(fieldsParams && typeof fieldsParams === 'string'){
  //     const fieldsArray = fieldsParams?.split(',').map(field => field.trim())
  //   this.selectFields = {}
  //   fieldsArray?.forEach(field => {
  //     if(this.selectFields){
  //       this.selectFields[field] = true
  //     }
  //   })
  //   this.query.select = this.selectFields as Record<string, boolean | Record<string, unknown>>
  //   delete this.query.include
  // }
  //   return this
  //  }
  //include
  include(relation) {
    if (Object.keys(this.selectFields).length > 0) return this;
    this.query.include = { ...this.query.include, ...relation };
    return this;
  }
  //dynamicInclude
  dynamicInclude(includeConfig, defaultInclude) {
    if (this.selectFields) {
      return this;
    }
    const result = {};
    defaultInclude?.forEach((field) => {
      if (includeConfig[field]) {
        result[field] = includeConfig[field];
      }
    });
    const includeParam = this.queryParams.includes;
    if (includeParam && typeof includeParam === "string") {
      const requestRelations = includeParam.split(",").map((relation) => relation.trim());
      requestRelations.forEach((relation) => {
        if (includeConfig[relation]) {
          result[relation] = includeConfig[relation];
        }
      });
    }
    this.query.include = { ...this.query.include, ...result };
    return this;
  }
  fields() {
    const fieldsParams = this.queryParams.fields;
    if (fieldsParams && typeof fieldsParams === "string") {
      const fieldsArray = fieldsParams.split(",").map((field) => field.trim());
      this.selectFields = {};
      fieldsArray.forEach((field) => {
        this.selectFields[field] = true;
      });
      this.query.select = this.selectFields;
    }
    return this;
  }
  //where
  where(condition) {
    this.query.where = this.deepMerge(this.query.where, condition);
    this.countQuery.where = this.deepMerge(this.countQuery.where, condition);
    return this;
  }
  //excute
  async excute() {
    const [total, data] = await Promise.all([
      this.model.count(this.countQuery),
      this.model.findMany(this.query)
    ]);
    const totalPages = Math.ceil(total / this.limit);
    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages
      }
    };
  }
  //count
  async count() {
    return await this.model.count(this.countQuery);
  }
  //debugging purpose method
  getQuery() {
    return this.query;
  }
  //deep merge
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
          result[key] = this.deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    return result;
  }
  parseFilterValue(value) {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    if (typeof value === "string" && !isNaN(Number(value)) && value != "") {
      return Number(value);
    }
    if (Array.isArray(value)) {
      return { in: value.map((item) => this.parseFilterValue(item)) };
    }
    return value;
  }
  parseRangeFilter(value) {
    const rangeQuery = {};
    Object.keys(value).forEach((operator) => {
      const operatorValue = value[operator];
      const parsedValue = typeof operatorValue === "string" && !isNaN(Number(operatorValue)) ? Number(operatorValue) : operatorValue;
      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "equals":
        case "not":
        case "contains":
        case "startsWith":
        case "endsWith":
          rangeQuery[operator] = parsedValue;
          break;
        case "in":
        case "notIn":
          if (Array.isArray(operatorValue)) {
            rangeQuery[operator] = operatorValue;
          } else {
            rangeQuery[operator] = [parsedValue];
          }
          break;
        default:
          break;
      }
    });
    return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
  }
};

// src/modules/expert/expert.constant.ts
var expertSearchableFields = [
  "fullName",
  "email",
  "title",
  "bio",
  "phone",
  "industry.name"
];
var expertFilterableFields = [
  "isVerified",
  "industryId",
  "experience",
  "price",
  "isDeleted"
];
var expertIncludeConfig = {
  user: true,
  industry: true,
  schedules: {
    include: { schedule: true }
  },
  consultations: {
    include: {
      client: true,
      expertSchedule: true
    }
  },
  testimonials: true,
  verification: true
};

// src/modules/expert/expert.service.ts
var getAllExperts = async (query2) => {
  const qb = new QueryBuilder(prisma.expert, query2, {
    searchableFields: expertSearchableFields,
    filterableFields: expertFilterableFields
  });
  const result = await qb.search().filter().where({
    isDeleted: false,
    // Only surface experts whose linked user and industry are still active.
    // This prevents "ghost" expert cards on the landing page that 404 on detail.
    user: { is: { isDeleted: false } },
    industry: { is: { isDeleted: false } }
  }).include({
    user: true,
    industry: true
  }).dynamicInclude(expertIncludeConfig).paginate().sort().fields().excute();
  return result;
};
var getExpertById = async (id) => {
  const expert = await prisma.expert.findFirst({
    where: {
      id,
      isDeleted: false,
      user: { is: { isDeleted: false } },
      industry: { is: { isDeleted: false } }
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
            endDateTime: { gt: /* @__PURE__ */ new Date() }
          }
        },
        include: { schedule: true },
        // Order by the actual slot start time so that the nearest upcoming
        // slot appears first, regardless of when it was created.
        orderBy: { schedule: { startDateTime: "asc" } }
      },
      consultations: {
        include: {
          client: true,
          expertSchedule: true
        }
      },
      testimonials: true,
      verification: true
    }
  });
  if (!expert) {
    throw new AppError_default(status9.NOT_FOUND, "Expert not found");
  }
  return expert;
};
var updateExpert = async (id, payload) => {
  const existingExpert = await prisma.expert.findUnique({
    where: { id, isDeleted: false }
  });
  if (!existingExpert) {
    throw new AppError_default(status9.NOT_FOUND, "Expert not found");
  }
  const { expert: expertData } = payload;
  await prisma.expert.update({
    where: { id },
    data: {
      ...expertData
    }
  });
  return await getExpertById(id);
};
var deleteExpert = async (id) => {
  const expert = await prisma.expert.findUnique({
    where: { id },
    include: { user: true }
  });
  if (!expert) {
    throw new AppError_default(status9.NOT_FOUND, "Expert not found");
  }
  await prisma.$transaction(async (tx) => {
    await tx.expert.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: /* @__PURE__ */ new Date()
      }
    });
    await tx.user.update({
      where: { id: expert.userId },
      data: {
        isDeleted: true,
        deletedAt: /* @__PURE__ */ new Date(),
        status: UserStatus.DELETED
      }
    });
    await tx.session.deleteMany({
      where: { userId: expert.userId }
    });
  });
  return { message: "Expert deleted successfully" };
};
var applyExpert = async (userId, payload) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
    throw new AppError_default(status9.UNAUTHORIZED, "Active user account is required");
  }
  if (user.role !== Role.CLIENT) {
    throw new AppError_default(
      status9.FORBIDDEN,
      "Only clients can submit expert applications."
    );
  }
  const existingExpert = await prisma.expert.findFirst({
    where: { userId, isDeleted: false }
  });
  if (existingExpert) {
    throw new AppError_default(status9.BAD_REQUEST, "You are already an expert");
  }
  const pendingApplication = await prisma.expertApplication.findFirst({
    where: {
      userId,
      status: ExpertApplicationStatus.PENDING
    },
    orderBy: { createdAt: "desc" }
  });
  if (pendingApplication) {
    throw new AppError_default(status9.BAD_REQUEST, "You already have a pending application");
  }
  const parsedExperience = Number(payload.experience ?? 0);
  const parsedConsultationFee = Number(payload.consultationFee);
  const fullName = String(payload.fullName ?? user.name ?? "").trim();
  const email = String(payload.email ?? user.email ?? "").trim();
  const rawIndustry = String(
    payload.industryId ?? payload.industryName ?? payload.industry ?? ""
  ).trim();
  if (!fullName) {
    throw new AppError_default(status9.BAD_REQUEST, "Full name is required");
  }
  if (!email) {
    throw new AppError_default(status9.BAD_REQUEST, "Email is required");
  }
  if (!rawIndustry) {
    throw new AppError_default(status9.BAD_REQUEST, "Industry is required");
  }
  if (!Number.isInteger(parsedExperience) || parsedExperience < 0) {
    throw new AppError_default(status9.BAD_REQUEST, "Experience must be a non-negative integer");
  }
  if (!Number.isInteger(parsedConsultationFee) || parsedConsultationFee <= 0) {
    throw new AppError_default(status9.BAD_REQUEST, "Consultation fee must be a positive integer");
  }
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = UUID_REGEX.test(rawIndustry);
  const industry = isUuid ? await prisma.industry.findFirst({
    where: { id: rawIndustry, isDeleted: false },
    select: { id: true }
  }) : await prisma.industry.findFirst({
    where: {
      isDeleted: false,
      name: { equals: rawIndustry, mode: "insensitive" }
    },
    select: { id: true }
  });
  if (!industry) {
    throw new AppError_default(status9.NOT_FOUND, "Industry not found");
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
        resumeFileSize: payload.resume?.resumeFileSize ?? null
      },
      include: {
        industry: true
      }
    });
    const admins = await tx.user.findMany({
      where: {
        role: Role.ADMIN,
        isDeleted: false,
        status: UserStatus.ACTIVE
      },
      select: { id: true }
    });
    if (admins.length > 0) {
      await tx.notification.createMany({
        data: admins.map((admin) => ({
          type: "EXPERT_APPLICATION",
          message: `${createdApplication.fullName} submitted an expert application`,
          userId: admin.id
        }))
      });
    }
    return createdApplication;
  });
  return application;
};
var expertService = {
  getAllExperts,
  updateExpert,
  getExpertById,
  deleteExpert,
  applyExpert
};

// src/modules/expert/expert.controler.ts
var getAllExperts2 = catchAsync(async (req, res) => {
  const query2 = req.query;
  const result = await expertService.getAllExperts(query2);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Experts fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getExpertById2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const expert = await expertService.getExpertById(id);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Expert retrieved successfully",
    data: expert
  });
});
var updateExpert2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const updatedExpert = await expertService.updateExpert(id, payload);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Expert updated successfully",
    data: updatedExpert
  });
});
var deleteExpert2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deletedExpert = await expertService.deleteExpert(id);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Expert deleted successfully",
    data: deletedExpert
  });
});
var applyExpert2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const files = req.files;
  const resumeFile = files?.resume?.[0];
  const profilePhotoFile = files?.profilePhoto?.[0];
  const resume = resumeFile ? mapUploadedResume(resumeFile) : void 0;
  const profilePhoto = profilePhotoFile ? mapUploadedProfilePhoto(profilePhotoFile) : req.body?.profilePhoto;
  const result = await expertService.applyExpert(userId, {
    ...req.body,
    profilePhoto,
    resume
  });
  sendResponse(res, {
    success: true,
    httpStatusCode: 201,
    message: "Expert application submitted for admin review",
    data: result
  });
});
var expertController = {
  getAllExperts: getAllExperts2,
  getExpertById: getExpertById2,
  updateExpert: updateExpert2,
  deleteExpert: deleteExpert2,
  applyExpert: applyExpert2
};

// src/modules/expert/expert.validationSchema.ts
import z3 from "zod";
var updateExpertValidationSchema = z3.object({
  body: z3.object({
    fullName: z3.string().optional(),
    email: z3.string().email("Invalid email format").optional(),
    profilePhoto: z3.string().url("Invalid URL format").optional(),
    phone: z3.string().optional(),
    bio: z3.string().optional(),
    title: z3.string().optional(),
    experience: z3.number().int().nonnegative().optional(),
    price: z3.number().int().positive("Price must be positive").optional(),
    industryId: z3.string().uuid("Industry ID must be a valid UUID").optional()
  })
});
var applyExpertValidation = z3.object({
  fullName: z3.string().min(2),
  email: z3.string().email("Invalid email"),
  phone: z3.string().optional(),
  bio: z3.string().optional(),
  title: z3.string().optional(),
  experience: z3.number().int().min(0).optional(),
  consultationFee: z3.number().int().min(1),
  industryId: z3.string().uuid()
});

// src/modules/expert/expert.route.ts
var router3 = Router3();
router3.get("/", expertController.getAllExperts);
router3.get("/:id", expertController.getExpertById);
router3.post(
  "/apply",
  expertApplicationUpload.fields([
    { name: "resume", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 }
  ]),
  checkAuth(Role.CLIENT),
  expertController.applyExpert
);
router3.put(
  "/:id",
  validateRequest(updateExpertValidationSchema),
  checkAuth(Role.ADMIN, Role.EXPERT),
  expertController.updateExpert
);
router3.delete("/:id", checkAuth(Role.ADMIN, Role.EXPERT), expertController.deleteExpert);
var expertRouter = router3;

// src/modules/admin/admin.router.ts
import { Router as Router4 } from "express";

// src/modules/admin/admin.controler.ts
import status12 from "http-status";

// src/modules/admin/admin.service.ts
import status11 from "http-status";

// src/modules/admin/admin.constant.ts
var adminSearchableFields = [
  "name",
  "email",
  "contactNumber",
  "user.role",
  "user.status"
];
var adminFilterableFields = [
  "isDeleted",
  "email",
  "contactNumber",
  "user.role",
  "user.status"
];
var adminIncludeConfig = {
  user: true
};

// src/modules/admin/admin.service.ts
var findActiveAdminById = async (id) => {
  const admin = await prisma.admin.findFirst({
    where: { id, isDeleted: false },
    include: { user: true }
  });
  if (!admin) {
    throw new AppError_default(status11.NOT_FOUND, "Admin not found");
  }
  return admin;
};
var buildAdminUpdatePayload = (payload) => {
  const data = {};
  if (payload.contactNumber !== void 0) {
    data.contactNumber = payload.contactNumber.trim();
  }
  if (payload.profilePhoto !== void 0) {
    data.profilePhoto = payload.profilePhoto.trim();
  }
  return data;
};
var getAllAdmin = async (query2) => {
  const queryBuilder = new QueryBuilder(prisma.admin, query2, {
    searchableFields: adminSearchableFields,
    filterableFields: adminFilterableFields
  });
  const result = await queryBuilder.search().filter().where({
    isDeleted: false
  }).include({
    user: true
  }).dynamicInclude(adminIncludeConfig).paginate().sort().fields().excute();
  return result;
};
var getAdminById = async (id) => {
  return findActiveAdminById(id);
};
var updateAdmin = async (id, payload) => {
  const admin = await findActiveAdminById(id);
  const updatePayload = buildAdminUpdatePayload(payload);
  if (Object.keys(updatePayload).length === 0) {
    throw new AppError_default(status11.BAD_REQUEST, "No valid admin fields provided for update");
  }
  const updatedAdmin = await prisma.admin.update({
    where: { id },
    data: updatePayload,
    include: {
      user: true
    }
  });
  return updatedAdmin;
};
var markDeleteAdmin = async (id, user) => {
  const admin = await findActiveAdminById(id);
  if (admin.userId === user.userId) {
    throw new AppError_default(status11.BAD_REQUEST, "You cannot delete yourself");
  }
  const result = await prisma.$transaction(async (tx) => {
    await tx.admin.update({
      where: { id },
      data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
    });
    await tx.user.update({
      where: { id: admin.userId },
      data: { isDeleted: true, status: "DELETED" }
    });
    return true;
  });
  return result;
};
var adminService = {
  getAllAdmin,
  updateAdmin,
  getAdminById,
  markDeleteAdmin
};

// src/modules/admin/admin.controler.ts
var getAllAdmin2 = catchAsync(async (req, res) => {
  const admins = await adminService.getAllAdmin(req.query);
  sendResponse(res, {
    httpStatusCode: status12.OK,
    success: true,
    message: "Admins retrieved successfully",
    data: admins
  });
});
var getAdminById2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const admin = await adminService.getAdminById(id);
  sendResponse(res, {
    httpStatusCode: status12.OK,
    success: true,
    message: "admin retrieved successfully",
    data: admin
  });
});
var updateAdmin2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const updatedAdmin = await adminService.updateAdmin(id, data);
  sendResponse(res, {
    httpStatusCode: status12.OK,
    success: true,
    message: "Admin updated successfully",
    data: updatedAdmin
  });
});
var deleteAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const adminDoctor = await adminService.markDeleteAdmin(id, user);
  sendResponse(res, {
    httpStatusCode: status12.OK,
    success: true,
    message: "admin deleted successfully",
    data: adminDoctor
  });
});
var adminController = {
  getAllAdmin: getAllAdmin2,
  updateAdmin: updateAdmin2,
  getAdminById: getAdminById2,
  deleteAdmin
};

// src/modules/admin/admin.validation.ts
import z4 from "zod";
var adminIdParamsSchema = z4.object({
  id: z4.string().uuid("Invalid admin id")
});
var updateAdminValidationSchema = z4.object({
  params: adminIdParamsSchema,
  body: z4.object({
    contactNumber: z4.string().trim().min(1, "Contact number cannot be empty").optional(),
    profilePhoto: z4.string().trim().min(1, "Profile photo cannot be empty").optional()
  }).refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update"
  })
});
var adminIdValidationSchema = z4.object({
  params: adminIdParamsSchema
});

// src/modules/admin/admin.router.ts
var router4 = Router4();
router4.get("/", checkAuth(Role.ADMIN), adminController.getAllAdmin);
router4.get("/:id", checkAuth(Role.ADMIN), validateRequest(adminIdValidationSchema), adminController.getAdminById);
router4.put("/:id", checkAuth(Role.ADMIN), validateRequest(updateAdminValidationSchema), adminController.updateAdmin);
router4.delete("/:id", checkAuth(Role.ADMIN), validateRequest(adminIdValidationSchema), adminController.deleteAdmin);
var adminRouter = router4;

// src/modules/expertSchdules/expertSchdules.router.ts
import { Router as Router5 } from "express";

// src/modules/expertSchdules/expertSchdule.validation.ts
import z5 from "zod";
var assignExpertScheduleValidation = z5.object({
  body: z5.object({
    scheduleIds: z5.array(z5.string().uuid("Invalid schedule ID"))
  })
});
var updateExpertScheduleValidation = z5.object({
  body: z5.object({
    scheduleIds: z5.array(
      z5.object({
        id: z5.string().uuid("Invalid schedule ID"),
        shouldDelete: z5.boolean()
      })
    )
  })
});
var publishExpertScheduleValidation = z5.object({
  body: z5.object({
    scheduleIds: z5.array(z5.string().uuid("Invalid schedule ID")).min(1),
    isPublished: z5.boolean()
  })
});

// src/modules/expertSchdules/expertSchdules.controler.ts
import status13 from "http-status";

// src/modules/expertSchdules/expertSchdules.service.ts
import httpStatus from "http-status";

// src/modules/expertSchdules/expertSchdule.constant.ts
var expertScheduleFilterableFields = [
  "expertId",
  "scheduleId",
  "isBooked",
  "isPublished",
  "isDeleted"
];
var expertScheduleSearchableFields = ["expertId", "scheduleId"];
var expertScheduleIncludeConfig = {
  schedule: true,
  expert: {
    include: {
      user: true,
      industry: true
    }
  },
  consultation: true
};

// src/modules/expertSchdules/expertSchdules.service.ts
var getActiveExpertByUserId = async (userId) => {
  const expert = await prisma.expert.findUnique({
    where: { userId }
  });
  if (expert && !expert.isDeleted) {
    return expert;
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  if (user?.role === Role.EXPERT) {
    throw new AppError_default(
      httpStatus.BAD_REQUEST,
      "Your account role is EXPERT, but your expert profile is missing or inactive. Please complete expert profile setup first."
    );
  }
  throw new AppError_default(
    httpStatus.FORBIDDEN,
    "Only expert accounts can manage availability schedules"
  );
};
var assignExpertSchedules = async (userId, payload) => {
  const expert = await getActiveExpertByUserId(userId);
  const created = [];
  for (const scheduleId of payload.scheduleIds) {
    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, isDeleted: false }
    });
    if (!schedule)
      throw new AppError_default(
        httpStatus.NOT_FOUND,
        `Schedule not found: ${scheduleId}`
      );
    const exists = await prisma.expertSchedule.findUnique({
      where: {
        expertId_scheduleId: {
          expertId: expert.id,
          scheduleId
        }
      }
    });
    if (exists?.isDeleted) {
      const restored = await prisma.expertSchedule.update({
        where: {
          expertId_scheduleId: {
            expertId: expert.id,
            scheduleId
          }
        },
        data: {
          isDeleted: false,
          deletedAt: null,
          isPublished: true
        }
      });
      created.push(restored);
      continue;
    }
    if (!exists) {
      const mapping = await prisma.expertSchedule.create({
        data: {
          expertId: expert.id,
          scheduleId,
          isPublished: true
        }
      });
      created.push(mapping);
    }
  }
  return created;
};
var getMyExpertSchedules = async (userId, query2) => {
  const expert = await getActiveExpertByUserId(userId);
  const qb = new QueryBuilder(
    prisma.expertSchedule,
    { expertId: expert.id, isDeleted: false, ...query2 },
    {
      filterableFields: expertScheduleFilterableFields,
      searchableFields: expertScheduleSearchableFields
    }
  );
  return await qb.search().filter().paginate().dynamicInclude(expertScheduleIncludeConfig).sort().fields().excute();
};
var updateMyExpertSchedules = async (userId, payload) => {
  const expert = await getActiveExpertByUserId(userId);
  const deleteIds = payload.scheduleIds.filter((s) => s.shouldDelete).map((s) => s.id);
  const createIds = payload.scheduleIds.filter((s) => !s.shouldDelete).map((s) => s.id);
  await prisma.$transaction(async (tx) => {
    if (deleteIds.length) {
      await tx.expertSchedule.updateMany({
        where: {
          expertId: expert.id,
          scheduleId: { in: deleteIds },
          isBooked: false,
          isDeleted: false
        },
        data: {
          isDeleted: true,
          deletedAt: /* @__PURE__ */ new Date()
        }
      });
    }
    if (createIds.length) {
      for (const scheduleId of createIds) {
        await tx.expertSchedule.upsert({
          where: {
            expertId_scheduleId: {
              expertId: expert.id,
              scheduleId
            }
          },
          update: {
            isDeleted: false,
            deletedAt: null
          },
          create: {
            expertId: expert.id,
            scheduleId,
            isPublished: true
          }
        });
      }
    }
  });
  return { success: true };
};
var publishMyExpertSchedules = async (userId, payload) => {
  const expert = await getActiveExpertByUserId(userId);
  const schedules = await prisma.expertSchedule.findMany({
    where: {
      expertId: expert.id,
      scheduleId: { in: payload.scheduleIds },
      isDeleted: false
    },
    select: { id: true, scheduleId: true }
  });
  if (schedules.length !== payload.scheduleIds.length) {
    throw new AppError_default(
      httpStatus.NOT_FOUND,
      "One or more schedule mappings were not found for this expert"
    );
  }
  const result = await prisma.expertSchedule.updateMany({
    where: {
      expertId: expert.id,
      scheduleId: { in: payload.scheduleIds },
      isDeleted: false
    },
    data: {
      isPublished: payload.isPublished
    }
  });
  return {
    success: true,
    updatedCount: result.count,
    isPublished: payload.isPublished
  };
};
var getPublishedExpertSchedules = async (expertId) => {
  const expert = await prisma.expert.findFirst({
    where: {
      id: expertId,
      isDeleted: false
    },
    select: { id: true }
  });
  if (!expert) {
    throw new AppError_default(httpStatus.NOT_FOUND, "Expert not found");
  }
  const now = /* @__PURE__ */ new Date();
  const schedules = await prisma.expertSchedule.findMany({
    where: {
      expertId,
      isDeleted: false,
      isBooked: false,
      isPublished: true,
      schedule: {
        isDeleted: false,
        startDateTime: { gt: now }
      }
    },
    include: {
      schedule: true,
      expert: {
        include: {
          user: true,
          industry: true
        }
      }
    },
    orderBy: {
      schedule: {
        startDateTime: "asc"
      }
    }
  });
  return schedules;
};
var deleteMyExpertSchedule = async (userId, scheduleId) => {
  const expert = await getActiveExpertByUserId(userId);
  const existing = await prisma.expertSchedule.findUnique({
    where: {
      expertId_scheduleId: {
        expertId: expert.id,
        scheduleId
      }
    }
  });
  if (!existing || existing.isDeleted)
    throw new AppError_default(httpStatus.NOT_FOUND, "Expert schedule not found");
  if (existing.isBooked)
    throw new AppError_default(
      httpStatus.BAD_REQUEST,
      "Cannot delete a booked schedule"
    );
  await prisma.expertSchedule.update({
    where: {
      expertId_scheduleId: {
        expertId: expert.id,
        scheduleId
      }
    },
    data: {
      isDeleted: true,
      isPublished: false,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  return { success: true };
};
var expertScheduleService = {
  assignExpertSchedules,
  getMyExpertSchedules,
  updateMyExpertSchedules,
  deleteMyExpertSchedule,
  publishMyExpertSchedules,
  getPublishedExpertSchedules
};

// src/modules/expertSchdules/expertSchdules.controler.ts
var assignExpertSchedules2 = catchAsync(async (req, res) => {
  const result = await expertScheduleService.assignExpertSchedules(
    req.user.userId,
    req.body
  );
  sendResponse(res, {
    httpStatusCode: status13.CREATED,
    success: true,
    message: "Schedules assigned successfully",
    data: result
  });
});
var getMyExpertSchedules2 = catchAsync(async (req, res) => {
  const result = await expertScheduleService.getMyExpertSchedules(
    req.user.userId,
    req.query
  );
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Expert schedules fetched successfully",
    data: result
  });
});
var updateMyExpertSchedules2 = catchAsync(async (req, res) => {
  const result = await expertScheduleService.updateMyExpertSchedules(
    req.user.userId,
    req.body
  );
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Expert schedules updated successfully",
    data: result
  });
});
var deleteMyExpertSchedule2 = catchAsync(async (req, res) => {
  const result = await expertScheduleService.deleteMyExpertSchedule(
    req.user.userId,
    req.params.scheduleId
  );
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Expert schedule deleted successfully",
    data: result
  });
});
var publishMyExpertSchedules2 = catchAsync(async (req, res) => {
  const result = await expertScheduleService.publishMyExpertSchedules(
    req.user.userId,
    req.body
  );
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Expert schedules publish status updated successfully",
    data: result
  });
});
var getPublishedExpertSchedules2 = catchAsync(async (req, res) => {
  const expertId = req.params.expertId || req.query.expertId;
  if (!expertId) {
    return sendResponse(res, {
      httpStatusCode: status13.BAD_REQUEST,
      success: false,
      message: "expertId is required"
    });
  }
  const result = await expertScheduleService.getPublishedExpertSchedules(
    expertId
  );
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Published expert schedules fetched successfully",
    data: result
  });
});
var expertScheduleController = {
  assignExpertSchedules: assignExpertSchedules2,
  getMyExpertSchedules: getMyExpertSchedules2,
  updateMyExpertSchedules: updateMyExpertSchedules2,
  deleteMyExpertSchedule: deleteMyExpertSchedule2,
  publishMyExpertSchedules: publishMyExpertSchedules2,
  getPublishedExpertSchedules: getPublishedExpertSchedules2
};

// src/modules/expertSchdules/expertSchdules.router.ts
var router5 = Router5();
router5.post(
  "/assign",
  validateRequest(assignExpertScheduleValidation),
  checkAuth(Role.EXPERT),
  expertScheduleController.assignExpertSchedules
);
router5.get(
  "/my",
  checkAuth(Role.EXPERT),
  expertScheduleController.getMyExpertSchedules
);
router5.get(
  "/published",
  expertScheduleController.getPublishedExpertSchedules
);
router5.get(
  "/published/:expertId",
  expertScheduleController.getPublishedExpertSchedules
);
router5.put(
  "/my",
  validateRequest(updateExpertScheduleValidation),
  checkAuth(Role.EXPERT),
  expertScheduleController.updateMyExpertSchedules
);
router5.patch(
  "/my/publish",
  validateRequest(publishExpertScheduleValidation),
  checkAuth(Role.EXPERT),
  expertScheduleController.publishMyExpertSchedules
);
router5.delete(
  "/my/:scheduleId",
  checkAuth(Role.EXPERT),
  expertScheduleController.deleteMyExpertSchedule
);
var expertScheduleRouter = router5;

// src/modules/schedules/schedules.router.ts
import { Router as Router6 } from "express";

// src/modules/schedules/schedules.controler.ts
import status15 from "http-status";

// src/modules/schedules/schedules.service.ts
import status14 from "http-status";

// src/modules/schedules/schdules.constant.ts
var scheduleFilterableFields = [
  "id",
  "startDateTime",
  "endDateTime",
  "isDeleted"
];
var scheduleSearchableFields = [
  "id",
  "startDateTime",
  "endDateTime"
];
var scheduleIncludeConfig = {
  expertSchedules: {
    include: {
      expert: {
        include: {
          user: true,
          industry: true
        }
      },
      consultation: true
    }
  }
};

// src/modules/schedules/schedules.service.ts
var getActiveExpertByUserId2 = async (userId) => {
  const expert = await prisma.expert.findUnique({
    where: { userId }
  });
  if (expert && !expert.isDeleted) {
    return expert;
  }
  throw new AppError_default(
    status14.FORBIDDEN,
    "Only expert accounts can manage their own schedule catalog"
  );
};
var createSchedules = async (payload, user) => {
  const { startDate, endDate, startTime, endTime } = payload;
  const interval = 30;
  const schedules = [];
  const parseLocalDate = (dateStr) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const currentDate = parseLocalDate(startDate);
  const lastDate = parseLocalDate(endDate);
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  while (currentDate <= lastDate) {
    let cursor = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      sh,
      sm,
      0,
      0
    );
    const endDateTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      eh,
      em,
      0,
      0
    );
    while (cursor < endDateTime) {
      const next = new Date(cursor.getTime() + interval * 60 * 1e3);
      const s = cursor;
      const e = next;
      const existing = await prisma.schedule.findFirst({
        where: {
          startDateTime: s,
          endDateTime: e
        }
      });
      const schedule = existing ?? await prisma.schedule.create({
        data: {
          startDateTime: s,
          endDateTime: e
        }
      });
      schedules.push(schedule);
      cursor = next;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  if (user?.role === Role.EXPERT && user.userId && schedules.length) {
    const expert = await getActiveExpertByUserId2(user.userId);
    await prisma.$transaction(
      schedules.map(
        (schedule) => prisma.expertSchedule.upsert({
          where: {
            expertId_scheduleId: {
              expertId: expert.id,
              scheduleId: schedule.id
            }
          },
          update: {
            isDeleted: false,
            deletedAt: null
          },
          create: {
            expertId: expert.id,
            scheduleId: schedule.id,
            isPublished: true
          }
        })
      )
    );
  }
  return schedules;
};
var getAllSchedules = async (query2, user) => {
  let baseQuery = {
    isDeleted: false
  };
  if (user?.role === Role.EXPERT && user.userId) {
    const expert = await getActiveExpertByUserId2(user.userId);
    baseQuery = {
      ...baseQuery,
      expertSchedules: {
        some: {
          expertId: expert.id,
          isDeleted: false
        }
      }
    };
  }
  if (user?.role === Role.CLIENT) {
    baseQuery = {
      ...baseQuery,
      startDateTime: {
        gt: /* @__PURE__ */ new Date()
      },
      expertSchedules: {
        some: {
          isDeleted: false,
          isBooked: false,
          isPublished: true,
          expert: {
            isDeleted: false
          }
        }
      }
    };
  }
  const qb = new QueryBuilder(
    prisma.schedule,
    query2,
    {
      searchableFields: scheduleSearchableFields,
      filterableFields: scheduleFilterableFields
    }
  );
  const result = await qb.search().filter().where(baseQuery).paginate().dynamicInclude(scheduleIncludeConfig).sort().fields().excute();
  return result;
};
var getScheduleById = async (id) => {
  if (!id || typeof id !== "string") {
    throw new AppError_default(status14.BAD_REQUEST, "Invalid schedule ID");
  }
  const schedule = await prisma.schedule.findUnique({
    where: { id },
    include: {
      expertSchedules: {
        include: {
          expert: {
            include: {
              user: true,
              industry: true
            }
          },
          consultation: true
        }
      }
    }
  });
  if (!schedule) {
    throw new AppError_default(status14.NOT_FOUND, "Schedule not found");
  }
  return schedule;
};
var getPublishedSchedulesByExpertId = async (expertId) => {
  const expert = await prisma.expert.findFirst({
    where: {
      id: expertId,
      isDeleted: false
    },
    select: { id: true }
  });
  if (!expert) {
    throw new AppError_default(status14.NOT_FOUND, "Expert not found");
  }
  const now = /* @__PURE__ */ new Date();
  const schedules = await prisma.expertSchedule.findMany({
    where: {
      expertId,
      isDeleted: false,
      isBooked: false,
      isPublished: true,
      schedule: {
        isDeleted: false,
        startDateTime: { gt: now }
      }
    },
    include: {
      schedule: true,
      expert: {
        include: {
          user: true,
          industry: true
        }
      }
    },
    orderBy: {
      schedule: {
        startDateTime: "asc"
      }
    }
  });
  return schedules;
};
var updateSchedule = async (id, payload) => {
  const { startDate, endDate, startTime, endTime } = payload;
  const baseStart = new Date(startDate);
  const baseEnd = new Date(endDate);
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startDateTime = new Date(
    baseStart.getFullYear(),
    baseStart.getMonth(),
    baseStart.getDate(),
    sh,
    sm,
    0,
    0
  );
  const endDateTime = new Date(
    baseEnd.getFullYear(),
    baseEnd.getMonth(),
    baseEnd.getDate(),
    eh,
    em,
    0,
    0
  );
  return await prisma.schedule.update({
    where: { id },
    data: {
      startDateTime,
      endDateTime
    }
  });
};
var deleteSchedule = async (id) => {
  if (!id || typeof id !== "string") {
    throw new AppError_default(status14.BAD_REQUEST, "Invalid schedule ID");
  }
  const schedule = await prisma.schedule.findUnique({
    where: { id },
    include: {
      expertSchedules: true
    }
  });
  if (!schedule) {
    throw new AppError_default(status14.NOT_FOUND, "Schedule not found");
  }
  const isBooked = schedule.expertSchedules.some((es) => es.isBooked);
  if (isBooked) {
    throw new AppError_default(
      status14.BAD_REQUEST,
      "Cannot delete schedule \u2014 it is already booked"
    );
  }
  const deleted = await prisma.schedule.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  return {
    message: "Schedule deleted successfully",
    data: deleted
  };
};
var schedulesService = {
  createSchedules,
  getAllSchedules,
  getScheduleById,
  getPublishedSchedulesByExpertId,
  updateSchedule,
  deleteSchedule
};

// src/modules/schedules/schedules.controler.ts
var createSchedule = catchAsync(async (req, res) => {
  const payload = req.body;
  const schedule = await schedulesService.createSchedules(payload, req.user);
  sendResponse(res, {
    success: true,
    httpStatusCode: status15.CREATED,
    message: "Schedule created successfully",
    data: schedule
  });
});
var getAllSchedules2 = catchAsync(async (req, res) => {
  const query2 = req.query;
  const result = await schedulesService.getAllSchedules(query2, req.user);
  sendResponse(res, {
    success: true,
    httpStatusCode: status15.OK,
    message: "Schedules retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getScheduleById2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const schedule = await schedulesService.getScheduleById(id);
  sendResponse(res, {
    success: true,
    httpStatusCode: status15.OK,
    message: "Schedule retrieved successfully",
    data: schedule
  });
});
var getPublishedSchedulesByExpertId2 = catchAsync(async (req, res) => {
  const expertId = req.params.expertId || req.query.expertId;
  if (!expertId) {
    return sendResponse(res, {
      success: false,
      httpStatusCode: status15.BAD_REQUEST,
      message: "expertId is required"
    });
  }
  const result = await schedulesService.getPublishedSchedulesByExpertId(expertId);
  sendResponse(res, {
    success: true,
    httpStatusCode: status15.OK,
    message: "Published schedules retrieved successfully",
    data: result
  });
});
var updateSchedule2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const updatedSchedule = await schedulesService.updateSchedule(id, payload);
  sendResponse(res, {
    success: true,
    httpStatusCode: status15.OK,
    message: "Schedule updated successfully",
    data: updatedSchedule
  });
});
var deleteSchedule2 = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    await schedulesService.deleteSchedule(id);
    sendResponse(res, {
      success: true,
      httpStatusCode: status15.OK,
      message: "Schedule deleted successfully"
    });
  }
);
var ScheduleController = {
  createSchedule,
  getAllSchedules: getAllSchedules2,
  getScheduleById: getScheduleById2,
  getPublishedSchedulesByExpertId: getPublishedSchedulesByExpertId2,
  updateSchedule: updateSchedule2,
  deleteSchedule: deleteSchedule2
};

// src/modules/schedules/schedule.validation.ts
import z6 from "zod";
var createScheduleZodSchema = z6.object({
  body: z6.object({
    startDate: z6.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format"
    }),
    endDate: z6.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format"
    }),
    startTime: z6.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
      message: "Invalid time format"
    }),
    endTime: z6.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
      message: "Invalid time format"
    })
  })
});
var updateScheduleZodSchema = z6.object({
  body: z6.object({
    startDate: z6.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format"
    }).optional(),
    endDate: z6.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format"
    }).optional(),
    startTime: z6.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
      message: "Invalid time format"
    }).optional(),
    endTime: z6.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
      message: "Invalid time format"
    }).optional()
  })
});
var ScheduleValidation = {
  createScheduleZodSchema,
  updateScheduleZodSchema
};

// src/modules/schedules/schedules.router.ts
var router6 = Router6();
router6.post("/", checkAuth(Role.ADMIN, Role.EXPERT), validateRequest(ScheduleValidation.createScheduleZodSchema), ScheduleController.createSchedule);
router6.get("/", checkAuth(Role.ADMIN, Role.EXPERT, Role.CLIENT), ScheduleController.getAllSchedules);
router6.get("/published", ScheduleController.getPublishedSchedulesByExpertId);
router6.get("/published/:expertId", ScheduleController.getPublishedSchedulesByExpertId);
router6.get("/:id", checkAuth(Role.ADMIN, Role.EXPERT), ScheduleController.getScheduleById);
router6.patch("/:id", checkAuth(Role.ADMIN), validateRequest(ScheduleValidation.updateScheduleZodSchema), ScheduleController.updateSchedule);
router6.delete("/:id", checkAuth(Role.ADMIN), ScheduleController.deleteSchedule);
var scheduleRoutes = router6;

// src/modules/user/user.router.ts
import { Router as Router7 } from "express";

// src/modules/user/user.service.ts
import status16 from "http-status";
var createAdmin = async (payload) => {
  const existsUser = await prisma.user.findUnique({
    where: {
      email: payload.admin.email
    }
  });
  if (existsUser) {
    throw new AppError_default(status16.BAD_REQUEST, "user with same email already exists");
  }
  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.admin.email,
      password: payload.password,
      name: payload.admin.name,
      role: Role.ADMIN,
      needPasswordChange: true
    }
  });
  console.log("User Data from auth:", userData);
  try {
    const result = await prisma.$transaction(async (tx) => {
      const adminData = await tx.admin.create({
        data: {
          userId: userData.user.id,
          ...payload.admin
        }
      });
      console.log("Payload admin:", payload.admin);
      console.log("Admin Data from DB:", adminData.id);
      const admin = await tx.admin.findUnique({
        where: {
          id: adminData.id
        },
        select: {
          id: true,
          name: true,
          email: true,
          contactNumber: true,
          profilePhoto: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              status: true,
              emailVerified: true
            }
          }
        }
      });
      console.log("admin:", admin);
      return admin;
    });
    console.log("result:", result);
    return result;
  } catch (error) {
    console.log("transaction error", error);
    await prisma.user.delete({
      where: {
        id: userData.user.id
      }
    });
    throw new AppError_default(status16.INTERNAL_SERVER_ERROR, "Failed to create admin profile");
  }
};
var getAllClients = async (query2) => {
  const queryBuilder = new QueryBuilder(prisma.client, query2, {
    searchableFields: ["fullName", "email", "phone", "address", "user.name", "user.email"],
    filterableFields: ["fullName", "email", "phone", "address", "isDeleted", "userId"]
  });
  const result = await queryBuilder.search().filter().where({
    isDeleted: false
  }).include({
    user: {
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        emailVerified: true
      }
    }
  }).paginate().sort().fields().excute();
  return result;
};
var userService = {
  createAdmin,
  getAllClients
};

// src/modules/user/user.controler.ts
import status17 from "http-status";
var createAdmin2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await userService.createAdmin(payload);
  sendResponse(res, {
    success: true,
    httpStatusCode: status17.CREATED,
    message: "Admin created successfully",
    data: result
  });
});
var getAllClients2 = catchAsync(async (req, res) => {
  const result = await userService.getAllClients(req.query);
  sendResponse(res, {
    success: true,
    httpStatusCode: status17.OK,
    message: "Clients retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var userController = {
  createAdmin: createAdmin2,
  getAllClients: getAllClients2
};

// src/modules/user/user.validation.ts
import z7 from "zod";
var createAdminZodSchema = z7.object({
  password: z7.string("Password is required").min(8, "Password must be at least 8 characters long").max(50, "Password must be less than 100 characters long"),
  admin: z7.object({
    name: z7.string("Name is required").min(5, "Name must be at least 5 characters long").max(20, "Name must be less than 20 characters long"),
    email: z7.email("Invalid email address"),
    contactNumber: z7.string("Contact number is required").min(11, "Contact number must be at least 10 characters long").max(15, "Contact number must be less than 15 characters long").optional(),
    address: z7.string("Address is required").min(10, "Address must be at least 10 characters long").max(100, "Address must be less than 100 characters long").optional(),
    profilePhoto: z7.url({ message: "Profile photo must be a valid URL" }).optional()
  })
});

// src/modules/user/user.router.ts
var router7 = Router7();
router7.get("/clients", checkAuth(Role.ADMIN), userController.getAllClients);
router7.post("/create-admin", validateRequest(createAdminZodSchema), checkAuth(Role.ADMIN), userController.createAdmin);
var userRouter = router7;

// src/modules/consultation/consultation.router.ts
import { Router as Router8 } from "express";

// src/modules/consultation/consultation.validation.ts
import z8 from "zod";
var consultationIdParamsSchema = z8.object({
  consultationId: z8.string().uuid("Invalid consultation id")
});
var bookConsultationValidation = z8.object({
  body: z8.object({
    expertId: z8.string().uuid("Invalid expert id"),
    expertScheduleId: z8.string().uuid("Invalid expert schedule id"),
    couponCode: z8.string().trim().min(1).max(40).optional()
  })
});
var initiateConsultationPaymentValidation = z8.object({
  params: consultationIdParamsSchema
});
var consultationSessionAccessValidation = z8.object({
  params: consultationIdParamsSchema
});
var startConsultationSessionValidation = z8.object({
  params: consultationIdParamsSchema
});
var completeConsultationValidation = z8.object({
  params: consultationIdParamsSchema,
  body: z8.object({
    sessionSummary: z8.string().trim().max(2e3).optional()
  }).default({})
});
var cancelConsultationValidation = z8.object({
  params: consultationIdParamsSchema,
  body: z8.object({
    reason: z8.string().trim().min(3, "Cancellation reason is required").max(500)
  })
});
var rescheduleConsultationValidation = z8.object({
  params: consultationIdParamsSchema,
  body: z8.object({
    newExpertScheduleId: z8.string().uuid("Invalid expert schedule id"),
    reason: z8.string().trim().max(500).optional()
  })
});
var updateConsultationStatusValidation = z8.object({
  params: consultationIdParamsSchema,
  body: z8.object({
    status: z8.nativeEnum(ConsultationStatus),
    reason: z8.string().trim().min(3).max(500).optional(),
    sessionSummary: z8.string().trim().max(2e3).optional()
  })
});

// src/modules/consultation/consultation.controler.ts
import status20 from "http-status";

// src/modules/consultation/consultation.service.ts
import status19 from "http-status";
import { v7 as uuidv7 } from "uuid";

// src/config/stripe.config.ts
import Stripe from "stripe";
var stripe = new Stripe(envVars.STRIPE.STRIPE_SECRET_KEY);

// src/modules/consultation/consultation.constant.ts
var bookingSearchableFields = [
  "client.user.name",
  "client.user.email",
  "expert.user.name",
  "expert.user.email",
  "videoCallId",
  "payment.transactionId"
];
var bookingFilterableFields = [
  "status",
  "paymentStatus",
  "clientId",
  "expertId",
  "date",
  "createdAt"
];
var bookingIncludeConfig = {
  client: {
    include: {
      user: true
    }
  },
  expert: {
    include: {
      user: true
    }
  },
  payment: true,
  expertSchedule: {
    include: {
      schedule: true
    }
  },
  testimonial: true
};

// src/modules/coupon/coupon.service.ts
import status18 from "http-status";
var normalizeCode = (code) => String(code ?? "").trim().toUpperCase();
var round2 = (n) => Math.round(n * 100) / 100;
var computeDiscount = (coupon, amount) => {
  if (!coupon.isActive || coupon.isDeleted) {
    throw new AppError_default(status18.BAD_REQUEST, "Coupon is not active");
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    throw new AppError_default(status18.BAD_REQUEST, "Coupon has expired");
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    throw new AppError_default(status18.BAD_REQUEST, "Coupon usage limit reached");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError_default(status18.BAD_REQUEST, "Amount must be a positive number");
  }
  if (coupon.minAmount != null && amount < coupon.minAmount) {
    throw new AppError_default(
      status18.BAD_REQUEST,
      `Coupon requires a minimum amount of ${coupon.minAmount}`
    );
  }
  let discount = 0;
  if (coupon.discountType === CouponDiscountType.PERCENT) {
    discount = amount * coupon.discountValue / 100;
  } else {
    discount = coupon.discountValue;
  }
  if (coupon.maxDiscount != null) {
    discount = Math.min(discount, coupon.maxDiscount);
  }
  discount = Math.max(0, Math.min(discount, amount));
  const finalAmount = Math.max(0, amount - discount);
  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    originalAmount: round2(amount),
    discountAmount: round2(discount),
    finalAmount: round2(finalAmount)
  };
};
var findActiveCouponByCode = async (rawCode) => {
  const code = normalizeCode(rawCode);
  if (!code) {
    throw new AppError_default(status18.BAD_REQUEST, "Coupon code is required");
  }
  const coupon = await prisma.coupon.findFirst({
    where: { code, isDeleted: false }
  });
  if (!coupon) {
    throw new AppError_default(status18.NOT_FOUND, "Coupon not found");
  }
  return coupon;
};
var validateCoupon = async (rawCode, amount) => {
  const coupon = await findActiveCouponByCode(rawCode);
  return computeDiscount(coupon, amount);
};
var incrementUsage = async (rawCode) => {
  const code = normalizeCode(rawCode);
  if (!code) return;
  await prisma.coupon.updateMany({
    where: { code, isDeleted: false },
    data: { usedCount: { increment: 1 } }
  });
};
var decrementUsage = async (rawCode) => {
  const code = normalizeCode(rawCode);
  if (!code) return;
  await prisma.coupon.updateMany({
    where: { code, isDeleted: false, usedCount: { gt: 0 } },
    data: { usedCount: { decrement: 1 } }
  });
};
var createCoupon = async (payload) => {
  const code = normalizeCode(payload.code);
  if (!code) throw new AppError_default(status18.BAD_REQUEST, "Code is required");
  if (payload.discountType === CouponDiscountType.PERCENT && (payload.discountValue <= 0 || payload.discountValue > 100)) {
    throw new AppError_default(
      status18.BAD_REQUEST,
      "Percent discount must be between 1 and 100"
    );
  }
  if (payload.discountType === CouponDiscountType.FIXED && payload.discountValue <= 0) {
    throw new AppError_default(status18.BAD_REQUEST, "Fixed discount must be positive");
  }
  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing && !existing.isDeleted) {
    throw new AppError_default(status18.CONFLICT, "Coupon code already exists");
  }
  const data = {
    code,
    description: payload.description ?? null,
    discountType: payload.discountType,
    discountValue: payload.discountValue,
    maxDiscount: payload.maxDiscount ?? null,
    minAmount: payload.minAmount ?? null,
    expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
    maxUses: payload.maxUses ?? null,
    isActive: payload.isActive ?? true,
    isDeleted: false,
    deletedAt: null,
    usedCount: 0
  };
  if (existing) {
    return prisma.coupon.update({ where: { code }, data });
  }
  return prisma.coupon.create({ data });
};
var listCoupons = async (query2) => {
  const page = Math.max(1, Number(query2.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query2.limit) || 20));
  const skip = (page - 1) * limit;
  const where = { isDeleted: false };
  if (query2.isActive === "true") where.isActive = true;
  if (query2.isActive === "false") where.isActive = false;
  if (query2.search) {
    where.code = { contains: String(query2.search).toUpperCase() };
  }
  const [data, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.coupon.count({ where })
  ]);
  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
};
var getCouponById = async (id) => {
  const coupon = await prisma.coupon.findFirst({
    where: { id, isDeleted: false }
  });
  if (!coupon) throw new AppError_default(status18.NOT_FOUND, "Coupon not found");
  return coupon;
};
var updateCoupon = async (id, payload) => {
  const existing = await getCouponById(id);
  if (payload.code) {
    const newCode = normalizeCode(payload.code);
    if (newCode !== existing.code) {
      const dup = await prisma.coupon.findUnique({ where: { code: newCode } });
      if (dup && dup.id !== existing.id && !dup.isDeleted) {
        throw new AppError_default(status18.CONFLICT, "Coupon code already exists");
      }
    }
  }
  const data = {};
  if (payload.code !== void 0) data.code = normalizeCode(payload.code);
  if (payload.description !== void 0) data.description = payload.description;
  if (payload.discountType !== void 0) data.discountType = payload.discountType;
  if (payload.discountValue !== void 0) data.discountValue = payload.discountValue;
  if (payload.maxDiscount !== void 0) data.maxDiscount = payload.maxDiscount;
  if (payload.minAmount !== void 0) data.minAmount = payload.minAmount;
  if (payload.expiresAt !== void 0)
    data.expiresAt = payload.expiresAt ? new Date(payload.expiresAt) : null;
  if (payload.maxUses !== void 0) data.maxUses = payload.maxUses;
  if (payload.isActive !== void 0) data.isActive = payload.isActive;
  return prisma.coupon.update({ where: { id }, data });
};
var deleteCoupon = async (id) => {
  await getCouponById(id);
  return prisma.coupon.update({
    where: { id },
    data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date(), isActive: false }
  });
};
var couponService = {
  computeDiscount,
  findActiveCouponByCode,
  validateCoupon,
  incrementUsage,
  decrementUsage,
  createCoupon,
  listCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon
};

// src/modules/consultation/consultation.service.ts
var SESSION_JOIN_LEAD_MINUTES = 15;
var SESSION_JOIN_GRACE_MINUTES = 30;
var consultationInclude = {
  client: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  },
  expert: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  },
  payment: true,
  expertSchedule: {
    include: {
      schedule: true
    }
  },
  testimonial: true
};
var sendConsultationNotifications = async ({
  type,
  clientUserId,
  expertUserId,
  clientMessage,
  expertMessage
}) => {
  const notifications = [
    clientUserId && clientMessage ? {
      type,
      message: clientMessage,
      userId: clientUserId
    } : null,
    expertUserId && expertMessage ? {
      type,
      message: expertMessage,
      userId: expertUserId
    } : null
  ].filter(
    (item) => Boolean(item)
  );
  if (notifications.length) {
    await prisma.notification.createMany({
      data: notifications
    });
  }
};
var getSessionMeta = (consultation) => {
  const scheduledStart = consultation.expertSchedule?.schedule?.startDateTime ?? consultation.date;
  const scheduledEnd = consultation.expertSchedule?.schedule?.endDateTime ?? new Date(scheduledStart.getTime() + 60 * 60 * 1e3);
  const joinAvailableFrom = new Date(
    scheduledStart.getTime() - SESSION_JOIN_LEAD_MINUTES * 60 * 1e3
  );
  const joinAvailableUntil = new Date(
    scheduledEnd.getTime() + SESSION_JOIN_GRACE_MINUTES * 60 * 1e3
  );
  const now = /* @__PURE__ */ new Date();
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
    joinMessage
  };
};
var enrichConsultation = (consultation) => ({
  ...consultation,
  sessionMeta: getSessionMeta(consultation)
});
var getConsultationWithAccess = async (consultationId, user) => {
  if (user.role === Role.ADMIN) {
    return prisma.consultation.findUniqueOrThrow({
      where: { id: consultationId },
      include: consultationInclude
    });
  }
  if (user.role === Role.CLIENT) {
    const client = await prisma.client.findUnique({
      where: { userId: user.userId },
      select: { id: true }
    });
    if (!client) {
      throw new AppError_default(status19.NOT_FOUND, "Client profile not found");
    }
    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        clientId: client.id
      },
      include: consultationInclude
    });
    if (!consultation) {
      throw new AppError_default(status19.NOT_FOUND, "Consultation not found");
    }
    return consultation;
  }
  if (user.role === Role.EXPERT) {
    const expert = await prisma.expert.findUnique({
      where: { userId: user.userId },
      select: { id: true }
    });
    if (!expert) {
      throw new AppError_default(status19.NOT_FOUND, "Expert profile not found");
    }
    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        expertId: expert.id
      },
      include: consultationInclude
    });
    if (!consultation) {
      throw new AppError_default(status19.NOT_FOUND, "Consultation not found");
    }
    return consultation;
  }
  throw new AppError_default(status19.FORBIDDEN, "Only clients, experts, or admins can access consultations");
};
var validateBookableExpertSchedule = async (expertId, expertScheduleId) => {
  const expertSchedule = await prisma.expertSchedule.findFirst({
    where: {
      id: expertScheduleId,
      expertId,
      isDeleted: false
    },
    include: {
      schedule: true
    }
  });
  if (!expertSchedule) {
    throw new AppError_default(
      status19.NOT_FOUND,
      "The selected availability slot was not found for this expert"
    );
  }
  if (!expertSchedule.isPublished) {
    throw new AppError_default(status19.BAD_REQUEST, "This schedule is not published for booking yet");
  }
  if (expertSchedule.isBooked) {
    throw new AppError_default(
      status19.BAD_REQUEST,
      "This schedule is already booked for another consultation"
    );
  }
  return expertSchedule;
};
var syncUnpaidConsultationsWithStripe = async (where) => {
  const unpaidConsultations = await prisma.consultation.findMany({
    where: {
      ...where,
      paymentStatus: PaymentStatus.UNPAID,
      status: {
        in: [ConsultationStatus.PENDING, ConsultationStatus.CONFIRMED]
      },
      payment: {
        is: {
          status: PaymentStatus.UNPAID
        }
      }
    },
    select: {
      id: true,
      status: true,
      client: {
        select: {
          userId: true
        }
      },
      expert: {
        select: {
          userId: true
        }
      },
      payment: {
        select: {
          id: true,
          transactionId: true
        }
      }
    }
  });
  if (!unpaidConsultations.length) {
    return;
  }
  const consultationMap = new Map(
    unpaidConsultations.filter((item) => Boolean(item.payment?.id && item.payment?.transactionId)).map((item) => [
      item.id,
      {
        paymentId: item.payment.id,
        transactionId: item.payment.transactionId
      }
    ])
  );
  if (!consultationMap.size) {
    return;
  }
  const paidMatches = /* @__PURE__ */ new Map();
  let startingAfter;
  for (let page = 0; page < 5; page += 1) {
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      ...startingAfter ? { starting_after: startingAfter } : {}
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
        gatewayData: session
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
          paymentGatewayData: match.gatewayData
        }
      });
      await tx.consultation.update({
        where: { id: consultationId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: ConsultationStatus.CONFIRMED
        }
      });
    }
  });
};
var bookConsultation = async (payload, user) => {
  const client = await prisma.client.findUniqueOrThrow({
    where: { userId: user.userId }
  });
  const expert = await prisma.expert.findUniqueOrThrow({
    where: {
      id: payload.expertId,
      isDeleted: false
    }
  });
  const expertSchedule = await validateBookableExpertSchedule(
    expert.id,
    payload.expertScheduleId
  );
  const originalFee = expert.consultationFee;
  let finalAmount = originalFee;
  let discountAmount = 0;
  let couponCode = null;
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
        paymentStatus: PaymentStatus.UNPAID
      },
      include: {
        expert: true
      }
    });
    await tx.expertSchedule.update({
      where: { id: expertSchedule.id },
      data: {
        isBooked: true,
        consultationId: consultation.id
      }
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
        status: PaymentStatus.UNPAID
      }
    });
    const isPaid = payment.status === PaymentStatus.PAID;
    await tx.notification.createMany({
      data: [
        {
          type: "CONSULTATION_BOOKED",
          message: isPaid ? `Your consultation with ${expert.fullName} has been booked and paid successfully.` : `Your consultation with ${expert.fullName} has been booked successfully. Please complete the payment to confirm it.`,
          userId: client.userId
        },
        {
          type: "CONSULTATION_BOOKED",
          message: isPaid ? `${client.fullName} booked and paid for a consultation with you for ${expertSchedule.schedule.startDateTime.toLocaleString()}.` : `${client.fullName} booked a consultation with you for ${expertSchedule.schedule.startDateTime.toLocaleString()}. Payment confirmation is pending.`,
          userId: expert.userId
        }
      ]
    });
    const successParams = new URLSearchParams({
      consultationId: consultation.id,
      paymentId: payment.id,
      transactionId,
      status: "success",
      amount: String(finalAmount)
    });
    const cancelParams = new URLSearchParams({
      consultationId: consultation.id,
      paymentId: payment.id,
      transactionId,
      status: "cancelled",
      amount: String(finalAmount)
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
              name: `Consultation with ${expert.fullName}`
            },
            unit_amount: stripeUnitAmount
          },
          quantity: 1
        }
      ],
      metadata: {
        consultationId: consultation.id,
        paymentId: payment.id,
        transactionId,
        amount: String(finalAmount),
        originalAmount: String(originalFee),
        discountAmount: String(discountAmount),
        couponCode: couponCode ?? ""
      },
      success_url: `${envVars.FRONTEND_URL}/dashboard/payment/consultation-success?${successParams.toString()}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${envVars.FRONTEND_URL}/dashboard/consultations?${cancelParams.toString()}`
    });
    return {
      consultation,
      payment,
      paymentUrl: session.url
    };
  });
  if (couponCode) {
    couponService.incrementUsage(couponCode).catch((error) => {
      console.error("Failed to increment coupon usage", error);
    });
  }
  return {
    consultation: result.consultation,
    payment: result.payment,
    paymentUrl: result.paymentUrl
  };
};
var bookConsultationWithPayLater = async (payload, user) => {
  const client = await prisma.client.findUniqueOrThrow({
    where: { userId: user.userId }
  });
  const expert = await prisma.expert.findUniqueOrThrow({
    where: {
      id: payload.expertId,
      isDeleted: false
    }
  });
  const expertSchedule = await validateBookableExpertSchedule(
    expert.id,
    payload.expertScheduleId
  );
  const originalFee = expert.consultationFee;
  let finalAmount = originalFee;
  let discountAmount = 0;
  let couponCode = null;
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
        paymentStatus: PaymentStatus.UNPAID
      },
      include: {
        expert: true
      }
    });
    await tx.expertSchedule.update({
      where: { id: expertSchedule.id },
      data: {
        isBooked: true,
        consultationId: consultation.id
      }
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
        status: PaymentStatus.UNPAID
      }
    });
    const isPaid = payment.status === PaymentStatus.PAID;
    await tx.notification.createMany({
      data: [
        {
          type: "CONSULTATION_BOOKED",
          message: isPaid ? `Your consultation with ${expert.fullName} has been booked and paid successfully.` : `Your consultation with ${expert.fullName} has been booked successfully. Please complete payment before the session starts.`,
          userId: client.userId
        },
        {
          type: "CONSULTATION_BOOKED",
          message: isPaid ? `${client.fullName} booked and paid for a consultation with you for ${expertSchedule.schedule.startDateTime.toLocaleString()}.` : `${client.fullName} booked a consultation with you for ${expertSchedule.schedule.startDateTime.toLocaleString()}.`,
          userId: expert.userId
        }
      ]
    });
    return {
      consultation,
      payment
    };
  });
  if (couponCode) {
    couponService.incrementUsage(couponCode).catch((error) => {
      console.error("Failed to increment coupon usage", error);
    });
  }
  return result;
};
var getMyBookings = async (user) => {
  if (user.role === Role.CLIENT) {
    const client = await prisma.client.findUniqueOrThrow({
      where: { userId: user.userId }
    });
    try {
      await syncUnpaidConsultationsWithStripe({ clientId: client.id });
    } catch (error) {
      console.error("Failed to sync unpaid consultations for client:", error);
    }
    const consultations = await prisma.consultation.findMany({
      where: { clientId: client.id },
      include: consultationInclude,
      orderBy: { createdAt: "desc" }
    });
    return consultations.map((consultation) => enrichConsultation(consultation));
  }
  if (user.role === Role.EXPERT) {
    const expert = await prisma.expert.findUniqueOrThrow({
      where: { userId: user.userId }
    });
    try {
      await syncUnpaidConsultationsWithStripe({ expertId: expert.id });
    } catch (error) {
      console.error("Failed to sync unpaid consultations for expert:", error);
    }
    const consultations = await prisma.consultation.findMany({
      where: { expertId: expert.id },
      include: consultationInclude,
      orderBy: { createdAt: "desc" }
    });
    return consultations.map((consultation) => enrichConsultation(consultation));
  }
  throw new AppError_default(status19.FORBIDDEN, "Only clients and experts can view their bookings");
};
var initiateConsultationPayment = async (consultationId, user) => {
  const client = await prisma.client.findUniqueOrThrow({
    where: { userId: user.userId }
  });
  const consultation = await prisma.consultation.findFirst({
    where: {
      id: consultationId,
      clientId: client.id
    },
    include: {
      expert: true,
      payment: true
    }
  });
  if (!consultation) {
    throw new AppError_default(status19.NOT_FOUND, "Consultation not found");
  }
  if (!consultation.payment) {
    throw new AppError_default(status19.BAD_REQUEST, "Payment not found for this consultation");
  }
  if (consultation.payment.status === PaymentStatus.PAID) {
    throw new AppError_default(
      status19.BAD_REQUEST,
      "Payment already completed for this consultation"
    );
  }
  if (consultation.status === ConsultationStatus.CANCELLED || consultation.status === ConsultationStatus.COMPLETED || consultation.status === ConsultationStatus.ONGOING) {
    throw new AppError_default(
      status19.BAD_REQUEST,
      "Payment cannot be initiated for a cancelled, completed, or ongoing consultation."
    );
  }
  const successParams = new URLSearchParams({
    consultationId: consultation.id,
    paymentId: consultation.payment.id,
    transactionId: consultation.payment.transactionId,
    status: "success",
    amount: String(consultation.payment.amount)
  });
  const cancelParams = new URLSearchParams({
    consultationId: consultation.id,
    paymentId: consultation.payment.id,
    transactionId: consultation.payment.transactionId,
    status: "cancelled",
    amount: String(consultation.payment.amount)
  });
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Consultation with ${consultation.expert?.fullName}`
          },
          unit_amount: consultation.payment.amount * 100
        },
        quantity: 1
      }
    ],
    metadata: {
      consultationId: consultation.id,
      paymentId: consultation.payment.id,
      transactionId: consultation.payment.transactionId,
      amount: String(consultation.payment.amount)
    },
    success_url: `${envVars.FRONTEND_URL}/dashboard/payment/consultation-success?${successParams.toString()}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.FRONTEND_URL}/dashboard/consultations?${cancelParams.toString()}`
  });
  return {
    paymentUrl: session.url
  };
};
var getSessionAccess = async (consultationId, user) => {
  const consultation = await getConsultationWithAccess(consultationId, user);
  const sessionMeta = getSessionMeta(consultation);
  return {
    consultation: enrichConsultation(consultation),
    videoCallId: consultation.videoCallId,
    ...sessionMeta
  };
};
var startSession = async (consultationId, user) => {
  const consultation = await getConsultationWithAccess(consultationId, user);
  if (consultation.status === ConsultationStatus.CANCELLED) {
    throw new AppError_default(status19.BAD_REQUEST, "This consultation has been cancelled.");
  }
  if (consultation.status === ConsultationStatus.COMPLETED) {
    throw new AppError_default(status19.BAD_REQUEST, "This consultation is already completed.");
  }
  const sessionMeta = getSessionMeta(consultation);
  if (!sessionMeta.canJoinNow && consultation.status !== ConsultationStatus.ONGOING) {
    throw new AppError_default(status19.BAD_REQUEST, sessionMeta.joinMessage);
  }
  if (consultation.status === ConsultationStatus.ONGOING) {
    return enrichConsultation(consultation);
  }
  const updatedConsultation = await prisma.consultation.update({
    where: { id: consultation.id },
    data: {
      status: ConsultationStatus.ONGOING,
      startedAt: consultation.startedAt ?? /* @__PURE__ */ new Date()
    },
    include: consultationInclude
  });
  await sendConsultationNotifications({
    type: "CONSULTATION_STARTED",
    clientUserId: updatedConsultation.client.userId,
    expertUserId: updatedConsultation.expert?.userId,
    clientMessage: `Your session with ${updatedConsultation.expert?.fullName ?? "your expert"} is now live.`,
    expertMessage: `Your session with ${updatedConsultation.client.fullName} is now live.`
  });
  return enrichConsultation(updatedConsultation);
};
var completeSession = async (consultationId, user, payload) => {
  const consultation = await getConsultationWithAccess(consultationId, user);
  if (consultation.status === ConsultationStatus.CANCELLED) {
    throw new AppError_default(status19.BAD_REQUEST, "Cancelled consultations cannot be completed.");
  }
  if (consultation.status === ConsultationStatus.COMPLETED) {
    return enrichConsultation(consultation);
  }
  if (consultation.status !== ConsultationStatus.ONGOING && consultation.paymentStatus !== PaymentStatus.PAID) {
    throw new AppError_default(
      status19.BAD_REQUEST,
      "Only paid or ongoing consultations can be completed."
    );
  }
  const updatedConsultation = await prisma.consultation.update({
    where: { id: consultation.id },
    data: {
      status: ConsultationStatus.COMPLETED,
      endedAt: /* @__PURE__ */ new Date(),
      sessionSummary: payload.sessionSummary?.trim() || consultation.sessionSummary
    },
    include: consultationInclude
  });
  await sendConsultationNotifications({
    type: "CONSULTATION_COMPLETED",
    clientUserId: updatedConsultation.client.userId,
    expertUserId: updatedConsultation.expert?.userId,
    clientMessage: `Your consultation with ${updatedConsultation.expert?.fullName ?? "your expert"} has been completed. You can now leave a review.`,
    expertMessage: `Your consultation with ${updatedConsultation.client.fullName} has been marked as completed.`
  });
  return enrichConsultation(updatedConsultation);
};
var cancelConsultation = async (consultationId, user, payload) => {
  const consultation = await getConsultationWithAccess(consultationId, user);
  if (consultation.status === ConsultationStatus.CANCELLED) {
    return enrichConsultation(consultation);
  }
  if (consultation.status === ConsultationStatus.COMPLETED) {
    throw new AppError_default(status19.BAD_REQUEST, "Completed consultations cannot be cancelled.");
  }
  if (consultation.status === ConsultationStatus.ONGOING && user.role !== Role.ADMIN) {
    throw new AppError_default(
      status19.BAD_REQUEST,
      "An ongoing session cannot be cancelled. Please complete it instead."
    );
  }
  const reason = payload.reason.trim();
  const updatedConsultation = await prisma.$transaction(async (tx) => {
    await tx.expertSchedule.update({
      where: { id: consultation.expertScheduleId },
      data: {
        isBooked: false,
        consultationId: null
      }
    });
    return tx.consultation.update({
      where: { id: consultation.id },
      data: {
        status: ConsultationStatus.CANCELLED,
        cancelledAt: /* @__PURE__ */ new Date(),
        cancelReason: reason,
        cancelledBy: user.role
      },
      include: consultationInclude
    });
  });
  await sendConsultationNotifications({
    type: "CONSULTATION_CANCELLED",
    clientUserId: updatedConsultation.client.userId,
    expertUserId: updatedConsultation.expert?.userId,
    clientMessage: `Your consultation with ${updatedConsultation.expert?.fullName ?? "your expert"} has been cancelled. Reason: ${reason}`,
    expertMessage: `Your consultation with ${updatedConsultation.client.fullName} has been cancelled. Reason: ${reason}`
  });
  if (updatedConsultation.paymentStatus === PaymentStatus.PAID) {
    const admins = await prisma.user.findMany({
      where: {
        role: Role.ADMIN,
        isDeleted: false
      },
      select: { id: true }
    });
    if (admins.length) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          type: "CONSULTATION_REFUND_REVIEW",
          message: `A paid consultation cancellation may need refund review. Consultation ID: ${updatedConsultation.id}`,
          userId: admin.id
        }))
      });
    }
  }
  return enrichConsultation(updatedConsultation);
};
var rescheduleConsultation = async (consultationId, user, payload) => {
  const consultation = await getConsultationWithAccess(consultationId, user);
  if (consultation.status === ConsultationStatus.CANCELLED) {
    throw new AppError_default(status19.BAD_REQUEST, "Cancelled consultations cannot be rescheduled.");
  }
  if (consultation.status === ConsultationStatus.COMPLETED) {
    throw new AppError_default(status19.BAD_REQUEST, "Completed consultations cannot be rescheduled.");
  }
  if (consultation.status === ConsultationStatus.ONGOING) {
    throw new AppError_default(status19.BAD_REQUEST, "An ongoing consultation cannot be rescheduled.");
  }
  if (consultation.expertScheduleId === payload.newExpertScheduleId) {
    throw new AppError_default(
      status19.BAD_REQUEST,
      "Please choose a different schedule for rescheduling."
    );
  }
  const newExpertSchedule = await prisma.expertSchedule.findFirst({
    where: {
      id: payload.newExpertScheduleId,
      expertId: consultation.expertId ?? void 0,
      isDeleted: false
    },
    include: {
      schedule: true
    }
  });
  if (!newExpertSchedule) {
    throw new AppError_default(status19.NOT_FOUND, "The new schedule slot was not found.");
  }
  if (!newExpertSchedule.isPublished) {
    throw new AppError_default(status19.BAD_REQUEST, "The selected schedule is not published.");
  }
  if (newExpertSchedule.isBooked) {
    throw new AppError_default(status19.BAD_REQUEST, "The selected schedule is already booked.");
  }
  if (newExpertSchedule.schedule.startDateTime <= /* @__PURE__ */ new Date()) {
    throw new AppError_default(
      status19.BAD_REQUEST,
      "Please choose a future schedule slot for rescheduling."
    );
  }
  const updatedConsultation = await prisma.$transaction(async (tx) => {
    await tx.expertSchedule.update({
      where: { id: consultation.expertScheduleId },
      data: {
        isBooked: false,
        consultationId: null
      }
    });
    await tx.expertSchedule.update({
      where: { id: newExpertSchedule.id },
      data: {
        isBooked: true,
        consultationId: consultation.id
      }
    });
    return tx.consultation.update({
      where: { id: consultation.id },
      data: {
        expertScheduleId: newExpertSchedule.id,
        date: newExpertSchedule.schedule.startDateTime,
        status: consultation.paymentStatus === PaymentStatus.PAID ? ConsultationStatus.CONFIRMED : ConsultationStatus.PENDING,
        rescheduledAt: /* @__PURE__ */ new Date(),
        rescheduleReason: payload.reason?.trim() || null,
        rescheduledBy: user.role,
        startedAt: null,
        endedAt: null
      },
      include: consultationInclude
    });
  });
  const reasonSuffix = payload.reason?.trim() ? ` Reason: ${payload.reason.trim()}` : "";
  await sendConsultationNotifications({
    type: "CONSULTATION_RESCHEDULED",
    clientUserId: updatedConsultation.client.userId,
    expertUserId: updatedConsultation.expert?.userId,
    clientMessage: `Your consultation with ${updatedConsultation.expert?.fullName ?? "your expert"} has been rescheduled to ${updatedConsultation.date.toLocaleString()}.${reasonSuffix}`,
    expertMessage: `Your consultation with ${updatedConsultation.client.fullName} has been rescheduled to ${updatedConsultation.date.toLocaleString()}.${reasonSuffix}`
  });
  return enrichConsultation(updatedConsultation);
};
var updateConsultationStatus = async (consultationId, user, payload) => {
  const nextStatus = payload.status;
  if (nextStatus === ConsultationStatus.ONGOING) {
    return startSession(consultationId, user);
  }
  if (nextStatus === ConsultationStatus.COMPLETED) {
    return completeSession(consultationId, user, {
      sessionSummary: payload.sessionSummary
    });
  }
  if (nextStatus === ConsultationStatus.CANCELLED) {
    return cancelConsultation(consultationId, user, {
      reason: payload.reason?.trim() || "Cancelled via consultation status update."
    });
  }
  const consultation = await getConsultationWithAccess(consultationId, user);
  if (consultation.status === ConsultationStatus.CANCELLED) {
    throw new AppError_default(
      status19.BAD_REQUEST,
      "Cancelled consultations cannot be updated to another status."
    );
  }
  if (consultation.status === ConsultationStatus.COMPLETED) {
    throw new AppError_default(
      status19.BAD_REQUEST,
      "Completed consultations cannot be updated to another status."
    );
  }
  if (consultation.status === nextStatus) {
    return enrichConsultation(consultation);
  }
  if (nextStatus === ConsultationStatus.CONFIRMED) {
    if (consultation.paymentStatus !== PaymentStatus.PAID) {
      throw new AppError_default(
        status19.BAD_REQUEST,
        "Only paid consultations can be confirmed."
      );
    }
    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        status: ConsultationStatus.CONFIRMED
      },
      include: consultationInclude
    });
    await sendConsultationNotifications({
      type: "CONSULTATION_CONFIRMED",
      clientUserId: updatedConsultation.client.userId,
      expertUserId: updatedConsultation.expert?.userId,
      clientMessage: `Your consultation with ${updatedConsultation.expert?.fullName ?? "your expert"} is now confirmed.`,
      expertMessage: `Your consultation with ${updatedConsultation.client.fullName} is now confirmed.`
    });
    return enrichConsultation(updatedConsultation);
  }
  if (nextStatus === ConsultationStatus.PENDING) {
    if (user.role !== Role.ADMIN) {
      throw new AppError_default(
        status19.FORBIDDEN,
        "Only admins can set consultation status to pending."
      );
    }
    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        status: ConsultationStatus.PENDING,
        startedAt: null,
        endedAt: null
      },
      include: consultationInclude
    });
    return enrichConsultation(updatedConsultation);
  }
  throw new AppError_default(status19.BAD_REQUEST, "Unsupported consultation status transition.");
};
var cancelUnpaidConsultations = async () => {
  const now = /* @__PURE__ */ new Date();
  const cutoffTime = new Date(now.getTime() + 30 * 60 * 1e3);
  const unpaidConsultations = await prisma.consultation.findMany({
    where: {
      date: { lte: cutoffTime },
      paymentStatus: PaymentStatus.UNPAID,
      status: ConsultationStatus.PENDING
    },
    select: {
      id: true,
      expertScheduleId: true,
      client: {
        select: {
          userId: true
        }
      },
      expert: {
        select: {
          userId: true,
          fullName: true
        }
      }
    }
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
        cancelledAt: /* @__PURE__ */ new Date(),
        cancelReason: "Automatically cancelled because payment was not completed in time."
      }
    });
    await tx.payment.deleteMany({
      where: { consultationId: { in: consultationIds } }
    });
    await tx.expertSchedule.updateMany({
      where: { id: { in: scheduleIds } },
      data: {
        isBooked: false,
        consultationId: null
      }
    });
  });
  await prisma.notification.createMany({
    data: unpaidConsultations.flatMap((consultation) => {
      const notifications = [];
      if (consultation.client.userId) {
        notifications.push({
          type: "CONSULTATION_CANCELLED",
          message: `Your consultation${consultation.expert?.fullName ? ` with ${consultation.expert.fullName}` : ""} was cancelled because payment was not completed in time.`,
          userId: consultation.client.userId
        });
      }
      if (consultation.expert?.userId) {
        notifications.push({
          type: "CONSULTATION_CANCELLED",
          message: "A scheduled consultation was automatically cancelled because the client did not complete payment in time.",
          userId: consultation.expert.userId
        });
      }
      return notifications;
    })
  });
  return { count: consultationIds.length };
};
var getAllConsultationsAdmin = async (query2) => {
  const queryBuilder = new QueryBuilder(prisma.consultation, query2, {
    searchableFields: bookingSearchableFields,
    filterableFields: bookingFilterableFields
  });
  const result = await queryBuilder.search().filter().include(bookingIncludeConfig).paginate().sort().fields().excute();
  return result;
};
var consultationService = {
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
  getAllConsultationsAdmin
};

// src/modules/consultation/consultation.controler.ts
var bookConsultation2 = catchAsync(async (req, res) => {
  const result = await consultationService.bookConsultation(req.body, req.user);
  sendResponse(res, {
    httpStatusCode: status20.CREATED,
    success: true,
    message: "Consultation booked successfully",
    data: result
  });
});
var bookConsultationWithPayLater2 = catchAsync(async (req, res) => {
  const result = await consultationService.bookConsultationWithPayLater(
    req.body,
    req.user
  );
  sendResponse(res, {
    httpStatusCode: status20.CREATED,
    success: true,
    message: "Consultation booked with pay later successfully",
    data: result
  });
});
var getMyBookings2 = catchAsync(async (req, res) => {
  const result = await consultationService.getMyBookings(req.user);
  sendResponse(res, {
    httpStatusCode: status20.OK,
    success: true,
    message: "My bookings retrieved successfully",
    data: result
  });
});
var initiateConsultationPayment2 = catchAsync(async (req, res) => {
  const { consultationId } = req.params;
  const result = await consultationService.initiateConsultationPayment(
    consultationId,
    req.user
  );
  sendResponse(res, {
    httpStatusCode: status20.OK,
    success: true,
    message: "Payment session created successfully",
    data: result
  });
});
var getSessionAccess2 = catchAsync(async (req, res) => {
  const { consultationId } = req.params;
  const result = await consultationService.getSessionAccess(
    consultationId,
    req.user
  );
  sendResponse(res, {
    httpStatusCode: status20.OK,
    success: true,
    message: "Session access details retrieved successfully",
    data: result
  });
});
var startSession2 = catchAsync(async (req, res) => {
  const { consultationId } = req.params;
  const result = await consultationService.startSession(
    consultationId,
    req.user
  );
  sendResponse(res, {
    httpStatusCode: status20.OK,
    success: true,
    message: "Session started successfully",
    data: result
  });
});
var completeSession2 = catchAsync(async (req, res) => {
  const { consultationId } = req.params;
  const result = await consultationService.completeSession(
    consultationId,
    req.user,
    req.body
  );
  sendResponse(res, {
    httpStatusCode: status20.OK,
    success: true,
    message: "Session completed successfully",
    data: result
  });
});
var cancelConsultation2 = catchAsync(async (req, res) => {
  const { consultationId } = req.params;
  const result = await consultationService.cancelConsultation(
    consultationId,
    req.user,
    req.body
  );
  sendResponse(res, {
    httpStatusCode: status20.OK,
    success: true,
    message: "Consultation cancelled successfully",
    data: result
  });
});
var rescheduleConsultation2 = catchAsync(async (req, res) => {
  const { consultationId } = req.params;
  const result = await consultationService.rescheduleConsultation(
    consultationId,
    req.user,
    req.body
  );
  sendResponse(res, {
    httpStatusCode: status20.OK,
    success: true,
    message: "Consultation rescheduled successfully",
    data: result
  });
});
var updateConsultationStatus2 = catchAsync(async (req, res) => {
  const { consultationId } = req.params;
  const result = await consultationService.updateConsultationStatus(
    consultationId,
    req.user,
    req.body
  );
  sendResponse(res, {
    httpStatusCode: status20.OK,
    success: true,
    message: "Consultation status updated successfully",
    data: result
  });
});
var cancelUnpaidConsultations2 = catchAsync(async (_req, res) => {
  await consultationService.cancelUnpaidConsultations();
  sendResponse(res, {
    httpStatusCode: status20.OK,
    success: true,
    message: "Unpaid consultations canceled successfully",
    data: null
  });
});
var getAllConsultationsAdmin2 = catchAsync(async (req, res) => {
  const result = await consultationService.getAllConsultationsAdmin(req.query);
  sendResponse(res, {
    httpStatusCode: status20.OK,
    success: true,
    message: "All consultations retrieved successfully",
    data: result
  });
});
var consultationController = {
  bookConsultation: bookConsultation2,
  bookConsultationWithPayLater: bookConsultationWithPayLater2,
  getMyBookings: getMyBookings2,
  initiateConsultationPayment: initiateConsultationPayment2,
  getSessionAccess: getSessionAccess2,
  startSession: startSession2,
  completeSession: completeSession2,
  cancelConsultation: cancelConsultation2,
  rescheduleConsultation: rescheduleConsultation2,
  updateConsultationStatus: updateConsultationStatus2,
  cancelUnpaidConsultations: cancelUnpaidConsultations2,
  getAllConsultationsAdmin: getAllConsultationsAdmin2
};

// src/modules/consultation/consultation.router.ts
var router8 = Router8();
router8.get(
  "/admin/bookings",
  checkAuth(Role.ADMIN),
  consultationController.getAllConsultationsAdmin
);
router8.post(
  "/book",
  checkAuth(Role.CLIENT),
  validateRequest(bookConsultationValidation),
  consultationController.bookConsultation
);
router8.post(
  "/book/pay-later",
  checkAuth(Role.CLIENT),
  validateRequest(bookConsultationValidation),
  consultationController.bookConsultationWithPayLater
);
router8.get(
  "/my-bookings",
  checkAuth(Role.CLIENT, Role.EXPERT),
  consultationController.getMyBookings
);
router8.get("/me", checkAuth(Role.CLIENT, Role.EXPERT), consultationController.getMyBookings);
router8.get(
  "/client/me",
  checkAuth(Role.CLIENT),
  consultationController.getMyBookings
);
router8.get(
  "/expert/me",
  checkAuth(Role.EXPERT),
  consultationController.getMyBookings
);
router8.get("/", checkAuth(Role.CLIENT, Role.EXPERT), consultationController.getMyBookings);
router8.post(
  "/:consultationId/initiate-payment",
  checkAuth(Role.CLIENT),
  validateRequest(initiateConsultationPaymentValidation),
  consultationController.initiateConsultationPayment
);
router8.get(
  "/:consultationId/session-access",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  validateRequest(consultationSessionAccessValidation),
  consultationController.getSessionAccess
);
router8.patch(
  "/:consultationId/start",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  validateRequest(startConsultationSessionValidation),
  consultationController.startSession
);
router8.patch(
  "/:consultationId/complete",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  validateRequest(completeConsultationValidation),
  consultationController.completeSession
);
router8.patch(
  "/:consultationId/cancel",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  validateRequest(cancelConsultationValidation),
  consultationController.cancelConsultation
);
router8.patch(
  "/reschedule/:consultationId",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  validateRequest(rescheduleConsultationValidation),
  consultationController.rescheduleConsultation
);
router8.patch(
  "/:consultationId/status",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  validateRequest(updateConsultationStatusValidation),
  consultationController.updateConsultationStatus
);
router8.post(
  "/cancel-unpaid",
  checkAuth(Role.ADMIN),
  consultationController.cancelUnpaidConsultations
);
var consultationRouter = router8;

// src/modules/industry/industry.router.ts
import { Router as Router9 } from "express";

// src/modules/industry/industry.validation.ts
import z9 from "zod";
var industryBodySchema = z9.object({
  name: z9.string().trim().min(2, "Industry name is too short"),
  description: z9.string().trim().optional(),
  icon: z9.string().trim().url("Invalid icon URL").optional()
});
var industryIdParamsSchema = z9.object({
  id: z9.string().uuid("Invalid industry id")
});
var createIndustryValidation = z9.object({
  body: industryBodySchema
});
var updateIndustryValidation = z9.object({
  params: industryIdParamsSchema,
  body: industryBodySchema.partial()
});
var industryIdValidation = z9.object({
  params: industryIdParamsSchema
});

// src/modules/industry/industry.controler.ts
import status22 from "http-status";

// src/modules/industry/industry.service.ts
import status21 from "http-status";
var findActiveIndustryById = async (id) => {
  const industry = await prisma.industry.findFirst({
    where: { id, isDeleted: false }
  });
  if (!industry) {
    throw new AppError_default(status21.NOT_FOUND, "Industry not found");
  }
  return industry;
};
var ensureIndustryNameAvailable = async (name, excludeIndustryId) => {
  const existingIndustry = await prisma.industry.findUnique({
    where: { name }
  });
  if (existingIndustry && existingIndustry.id !== excludeIndustryId) {
    throw new AppError_default(status21.CONFLICT, "Industry already exists");
  }
};
var buildIndustryPayload = (payload) => {
  const data = {};
  if (payload.name !== void 0) {
    data.name = payload.name.trim();
  }
  if (payload.description !== void 0) {
    data.description = payload.description.trim();
  }
  if (payload.icon !== void 0) {
    data.icon = payload.icon.trim();
  }
  return data;
};
var createIndustry = async (payload) => {
  const data = buildIndustryPayload(payload);
  await ensureIndustryNameAvailable(data.name);
  const industry = await prisma.industry.create({
    data: {
      name: data.name,
      description: data.description,
      icon: data.icon
    }
  });
  return industry;
};
var getAllIndustries = async (query2) => {
  const qb = new QueryBuilder(prisma.industry, query2, {
    searchableFields: ["name", "description"],
    filterableFields: ["name"]
  });
  const result = await qb.search().filter().where({ isDeleted: false }).paginate().sort().fields().excute();
  return result;
};
var getIndustryById = async (id) => {
  const industry = await prisma.industry.findFirst({
    where: { id, isDeleted: false },
    include: { experts: true }
  });
  if (!industry) {
    throw new AppError_default(status21.NOT_FOUND, "Industry not found");
  }
  return industry;
};
var updateIndustry = async (id, data) => {
  const existingIndustry = await findActiveIndustryById(id);
  const updateData = buildIndustryPayload(data);
  if (Object.keys(updateData).length === 0) {
    throw new AppError_default(status21.BAD_REQUEST, "No valid industry fields provided for update");
  }
  if (updateData.name !== void 0 && updateData.name !== existingIndustry.name) {
    await ensureIndustryNameAvailable(updateData.name, id);
  }
  const updated = await prisma.industry.update({
    where: { id },
    data: updateData
  });
  return updated;
};
var deleteIndustry = async (id) => {
  await findActiveIndustryById(id);
  const deleted = await prisma.industry.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  return deleted;
};
var industryService = {
  createIndustry,
  getAllIndustries,
  getIndustryById,
  updateIndustry,
  deleteIndustry
};

// src/modules/industry/industry.controler.ts
var createIndustry2 = catchAsync(async (req, res) => {
  const { name, description, icon: iconUrl } = req.body;
  const icon = req.file?.path ?? iconUrl;
  const result = await industryService.createIndustry({
    name,
    description,
    icon
  });
  sendResponse(res, {
    httpStatusCode: status22.CREATED,
    success: true,
    message: "Industry created successfully",
    data: result
  });
});
var getAllIndustries2 = catchAsync(async (req, res) => {
  const result = await industryService.getAllIndustries(req.query);
  sendResponse(res, {
    httpStatusCode: status22.OK,
    success: true,
    message: "Industries fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getIndustryById2 = catchAsync(async (req, res) => {
  const result = await industryService.getIndustryById(req.params.id);
  sendResponse(res, {
    httpStatusCode: status22.OK,
    success: true,
    message: "Industry retrieved successfully",
    data: result
  });
});
var updateIndustry2 = catchAsync(async (req, res) => {
  const { name, description, icon: iconUrl } = req.body;
  const icon = req.file?.path ?? iconUrl;
  const payload = {
    ...name !== void 0 ? { name } : {},
    ...description !== void 0 ? { description } : {},
    ...icon !== void 0 ? { icon } : {}
  };
  const result = await industryService.updateIndustry(
    req.params.id,
    payload
  );
  sendResponse(res, {
    httpStatusCode: status22.OK,
    success: true,
    message: "Industry updated successfully",
    data: result
  });
});
var deleteIndustry2 = catchAsync(async (req, res) => {
  const result = await industryService.deleteIndustry(req.params.id);
  sendResponse(res, {
    httpStatusCode: status22.OK,
    success: true,
    message: "Industry deleted successfully",
    data: result
  });
});
var industryController = {
  createIndustry: createIndustry2,
  getAllIndustries: getAllIndustries2,
  getIndustryById: getIndustryById2,
  updateIndustry: updateIndustry2,
  deleteIndustry: deleteIndustry2
};

// src/config/multer.config.ts
import { CloudinaryStorage as CloudinaryStorage2 } from "multer-storage-cloudinary";
import multer2 from "multer";
var storage2 = new CloudinaryStorage2({
  cloudinary: cloudinaryUpload,
  params: async (req, file) => {
    const originalName = file.originalname;
    const extention = originalName.split(".").pop()?.toLocaleLowerCase();
    const fileNameWithoutExtension = originalName.split(".").slice(0, -1).join(".").toLocaleLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9/-]/g, "");
    const uniqueName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileNameWithoutExtension;
    const folder = extention === "pdf" ? "pdfs" : "images";
    return {
      folder: `ph-health-care/${folder}`,
      public_id: uniqueName,
      resource_type: "auto"
    };
  }
});
var multerUpload = multer2({ storage: storage2 });

// src/modules/industry/industry.router.ts
var router9 = Router9();
router9.post(
  "/",
  checkAuth(Role.ADMIN),
  multerUpload.single("file"),
  validateRequest(createIndustryValidation),
  industryController.createIndustry
);
router9.get("/", industryController.getAllIndustries);
router9.get("/:id", validateRequest(industryIdValidation), industryController.getIndustryById);
router9.delete(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(industryIdValidation),
  industryController.deleteIndustry
);
router9.put(
  "/:id",
  checkAuth(Role.ADMIN),
  multerUpload.single("file"),
  validateRequest(updateIndustryValidation),
  industryController.updateIndustry
);
var industryRouter = router9;

// src/modules/testimonial/testimonial.router.ts
import express from "express";

// src/modules/testimonial/testimonial.validation.ts
import { z as z10 } from "zod";
var createTestimonialSchema = z10.object({
  rating: z10.number().min(1).max(5),
  comment: z10.string().optional(),
  consultationId: z10.string().uuid()
});
var updateTestimonialSchema = z10.object({
  body: z10.object({
    rating: z10.number().min(1).max(5).optional(),
    comment: z10.string().optional()
  })
});
var replyToTestimonialSchema = z10.object({
  body: z10.object({
    expertReply: z10.string().trim().min(1, "Reply is required")
  })
});
var updateReviewStatusSchema = z10.object({
  body: z10.object({
    status: z10.enum(["APPROVED", "HIDDEN"])
  })
});

// src/modules/testimonial/testimonial.controler.ts
import status24 from "http-status";

// src/modules/testimonial/testimonial.service.ts
import status23 from "http-status";

// src/modules/testimonial/testimonial.constant.ts
var testimonialSearchableFields = ["comment", "expertReply"];
var testimonialFilterableFields = [
  "rating",
  "expertId",
  "clientId",
  "status"
];
var testimonialIncludeConfig = {
  client: {
    include: {
      user: true
    }
  },
  expert: true,
  consultation: true
};

// src/modules/testimonial/testimonial.service.ts
var attachClientIdentity = async (rows) => {
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
        in: clientIds
      }
    },
    select: {
      id: true,
      fullName: true,
      profilePhoto: true,
      user: {
        select: {
          name: true,
          image: true
        }
      }
    }
  });
  const clientById = new Map(clients.map((client) => [client.id, client]));
  return rows.map((row) => {
    const existingClient = row.client;
    const hydratedClient = existingClient ?? clientById.get(row.clientId) ?? null;
    const reviewerName = hydratedClient?.fullName?.trim() || hydratedClient?.user?.name?.trim() || null;
    const reviewerImage = hydratedClient?.profilePhoto || hydratedClient?.user?.image || null;
    return {
      ...row,
      client: hydratedClient,
      reviewerName,
      reviewerImage
    };
  });
};
var createTestimonial = async (userId, payload) => {
  const { rating, comment, consultationId } = payload;
  console.log("AUTH USER ID:", userId);
  console.log("PAYLOAD:", payload);
  const client = await prisma.client.findUnique({
    where: { userId }
  });
  if (!client) {
    throw new AppError_default(status23.NOT_FOUND, "Client not found");
  }
  console.log("CLIENT ID:", client.id);
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId }
  });
  console.log("CONSULTATION CLIENT ID:", consultation?.clientId);
  if (!consultation) {
    throw new AppError_default(status23.NOT_FOUND, "Consultation not found");
  }
  if (consultation.clientId !== client.id) {
    throw new AppError_default(status23.FORBIDDEN, "Not your consultation");
  }
  if (!consultation.expertId) {
    throw new AppError_default(
      status23.BAD_REQUEST,
      "Consultation has no expert assigned"
    );
  }
  const expertId = consultation.expertId;
  const testimonial = await prisma.$transaction(async (tx) => {
    const createdTestimonial = await tx.testimonial.create({
      data: {
        rating,
        comment,
        clientId: client.id,
        // ✅ FIXED
        expertId,
        consultationId,
        status: ReviewStatus.PENDING
      }
    });
    const expert = await tx.expert.findUnique({
      where: { id: expertId },
      select: { userId: true }
    });
    if (expert) {
      await tx.notification.create({
        data: {
          type: "NEW_TESTIMONIAL",
          message: "You received a new review from a client.",
          userId: expert.userId
        }
      });
    }
    return createdTestimonial;
  });
  return testimonial;
};
var getAllTestimonials = async (query2, includeAll = false) => {
  const effectiveQuery = { ...query2 };
  if (!includeAll) {
    effectiveQuery.status = ReviewStatus.APPROVED;
  }
  const qb = new QueryBuilder(prisma.testimonial, effectiveQuery, {
    searchableFields: testimonialSearchableFields,
    filterableFields: testimonialFilterableFields
  });
  const result = await qb.search().filter().paginate().dynamicInclude(testimonialIncludeConfig).sort().fields().excute();
  const dataWithClientIdentity = await attachClientIdentity(
    result.data ?? []
  );
  return {
    ...result,
    data: dataWithClientIdentity
  };
};
var getAllTestimonialsForAdmin = async (query2, includeAll = true) => {
  return getAllTestimonials(query2, includeAll);
};
var getTestimonialsByExpert = async (expertId) => {
  const expert = await prisma.expert.findUnique({
    where: { id: expertId }
  });
  if (!expert) {
    throw new AppError_default(status23.NOT_FOUND, "Expert not found");
  }
  const result = await prisma.testimonial.findMany({
    where: {
      expertId
    },
    include: testimonialIncludeConfig
  });
  return attachClientIdentity(
    result
  );
};
var replyToTestimonial = async (id, expertUserId, payload) => {
  const expert = await prisma.expert.findUnique({
    where: { userId: expertUserId },
    select: { id: true, fullName: true }
  });
  if (!expert) {
    throw new AppError_default(status23.NOT_FOUND, "Expert profile not found");
  }
  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
    include: {
      client: {
        select: { userId: true }
      }
    }
  });
  if (!testimonial) {
    throw new AppError_default(status23.NOT_FOUND, "Testimonial not found");
  }
  if (testimonial.expertId !== expert.id) {
    throw new AppError_default(status23.FORBIDDEN, "You can only reply to your own reviews");
  }
  const result = await prisma.$transaction(async (tx) => {
    const updatedTestimonial = await tx.testimonial.update({
      where: { id },
      data: {
        expertReply: payload.expertReply,
        expertRepliedAt: /* @__PURE__ */ new Date()
      }
    });
    await tx.notification.create({
      data: {
        type: "REVIEW_REPLY",
        message: `${expert.fullName} replied to your review.`,
        userId: testimonial.client.userId
      }
    });
    return updatedTestimonial;
  });
  return result;
};
var updateTestimonial = async (id, userId, payload) => {
  const client = await prisma.client.findUnique({
    where: { userId }
  });
  if (!client) {
    throw new AppError_default(status23.NOT_FOUND, "Client not found");
  }
  const testimonial = await prisma.testimonial.findUnique({
    where: { id }
  });
  if (!testimonial) {
    throw new AppError_default(status23.NOT_FOUND, "Testimonial not found");
  }
  if (testimonial.clientId !== client.id) {
    throw new AppError_default(status23.FORBIDDEN, "Not your testimonial");
  }
  return prisma.testimonial.update({
    where: { id },
    data: {
      ...payload,
      status: ReviewStatus.PENDING
    }
  });
};
var updateReviewStatus = async (id, payload) => {
  const testimonial = await prisma.testimonial.findUnique({
    where: { id }
  });
  if (!testimonial) {
    throw new AppError_default(status23.NOT_FOUND, "Testimonial not found");
  }
  return prisma.testimonial.update({
    where: { id },
    data: {
      status: payload.status
    },
    include: testimonialIncludeConfig
  });
};
var testimonialService = {
  createTestimonial,
  getAllTestimonials,
  getAllTestimonialsForAdmin,
  getTestimonialsByExpert,
  updateTestimonial,
  updateReviewStatus,
  replyToTestimonial
};

// src/modules/testimonial/testimonial.controler.ts
var createTestimonial2 = catchAsync(async (req, res) => {
  console.log("USER:", req.user);
  console.log("PAYLOAD:", req.body);
  const user = req.user;
  const payload = req.body;
  const testimonial = await testimonialService.createTestimonial(
    user.userId,
    payload
  );
  console.log("USER:", req.user);
  console.log("PAYLOAD:", req.body);
  console.log("PAYLOAD:", payload);
  console.log("USER:", user.userId);
  console.log("CONSULTATION:", payload.consultationId);
  sendResponse(res, {
    success: true,
    httpStatusCode: status24.CREATED,
    message: "Testimonial created successfully",
    data: testimonial
  });
});
var getAllTestimonials2 = catchAsync(async (req, res) => {
  const query2 = req.query;
  const result = await testimonialService.getAllTestimonials(
    query2
  );
  sendResponse(res, {
    success: true,
    httpStatusCode: status24.OK,
    message: "Testimonials retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getAllTestimonialsForAdmin2 = catchAsync(
  async (req, res) => {
    const query2 = req.query;
    const result = await testimonialService.getAllTestimonialsForAdmin(
      query2,
      true
    );
    sendResponse(res, {
      success: true,
      httpStatusCode: status24.OK,
      message: "All testimonials retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  }
);
var getTestimonialsByExpert2 = catchAsync(
  async (req, res) => {
    const { expertId } = req.params;
    const normalizedExpertId = Array.isArray(expertId) ? expertId[0] : expertId;
    const testimonials = await testimonialService.getTestimonialsByExpert(
      normalizedExpertId
    );
    sendResponse(res, {
      success: true,
      httpStatusCode: status24.OK,
      message: "Expert testimonials retrieved successfully",
      data: testimonials
    });
  }
);
var updateTestimonial2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const clientId = req.user.userId;
  const payload = req.body;
  const updated = await testimonialService.updateTestimonial(
    id,
    clientId,
    payload
  );
  sendResponse(res, {
    success: true,
    httpStatusCode: status24.OK,
    message: "Testimonial updated successfully",
    data: updated
  });
});
var replyToTestimonial2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const expertUserId = req.user.userId;
  const result = await testimonialService.replyToTestimonial(
    id,
    expertUserId,
    req.body
  );
  sendResponse(res, {
    success: true,
    httpStatusCode: status24.OK,
    message: "Reply added successfully",
    data: result
  });
});
var updateReviewStatus2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await testimonialService.updateReviewStatus(id, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status24.OK,
    message: "Review status updated successfully",
    data: result
  });
});
var TestimonialController = {
  createTestimonial: createTestimonial2,
  getAllTestimonials: getAllTestimonials2,
  getAllTestimonialsForAdmin: getAllTestimonialsForAdmin2,
  getTestimonialsByExpert: getTestimonialsByExpert2,
  updateTestimonial: updateTestimonial2,
  replyToTestimonial: replyToTestimonial2,
  updateReviewStatus: updateReviewStatus2
};

// src/modules/testimonial/testimonial.router.ts
var router10 = express.Router();
router10.post(
  "/",
  checkAuth(Role.CLIENT),
  validateRequest(createTestimonialSchema),
  TestimonialController.createTestimonial
);
router10.get("/", TestimonialController.getAllTestimonials);
router10.get("/admin", checkAuth(Role.ADMIN), TestimonialController.getAllTestimonialsForAdmin);
router10.get("/expert/:expertId", TestimonialController.getTestimonialsByExpert);
router10.patch(
  "/:id/reply",
  checkAuth(Role.EXPERT),
  validateRequest(replyToTestimonialSchema),
  TestimonialController.replyToTestimonial
);
router10.patch(
  "/:id/status",
  checkAuth(Role.ADMIN),
  validateRequest(updateReviewStatusSchema),
  TestimonialController.updateReviewStatus
);
router10.put(
  "/:id",
  checkAuth(Role.CLIENT),
  validateRequest(updateTestimonialSchema),
  TestimonialController.updateTestimonial
);
var testimonialRoutes = router10;

// src/modules/stats/stats.router.ts
import express2 from "express";

// src/modules/stats/stats.controler.ts
import status26 from "http-status";

// src/modules/stats/stats.service.ts
import status25 from "http-status";
var getDashboardStatsData = async (user) => {
  switch (user.role) {
    case "ADMIN" /* ADMIN */:
      return getAdminStats();
    case "EXPERT" /* EXPERT */:
      return getExpertStats(user);
    case "CLIENT" /* CLIENT */:
      return getClientStats(user);
    default:
      throw new AppError_default(status25.BAD_REQUEST, "Invalid user role for dashboard");
  }
};
var getAdminStats = async () => {
  const expertCount = await prisma.expert.count();
  const clientCount = await prisma.client.count();
  const consultationCount = await prisma.consultation.count();
  const industryCount = await prisma.industry.count();
  const paymentCount = await prisma.payment.count();
  const userCount = await prisma.user.count();
  const totalRevenueAgg = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: "PAID" /* PAID */ }
  });
  const consultationStatusDistribution = await prisma.consultation.groupBy({
    by: ["status"],
    _count: { id: true }
  });
  const formattedStatus = consultationStatusDistribution.map(({ status: status38, _count }) => ({
    status: status38,
    count: _count.id
  }));
  const revenueByMonth = await getRevenueByMonth();
  return {
    expertCount,
    clientCount,
    consultationCount,
    industryCount,
    paymentCount,
    userCount,
    totalRevenue: totalRevenueAgg._sum.amount || 0,
    consultationStatusDistribution: formattedStatus,
    revenueByMonth
  };
};
var getExpertStats = async (user, filters = {}) => {
  const expert = await prisma.expert.findUniqueOrThrow({
    where: { userId: user.userId }
  });
  const consultationCount = await prisma.consultation.count({
    where: { expertId: expert.id, ...filters.consultation }
  });
  const consultationStatusDistribution = await prisma.consultation.groupBy({
    by: ["status"],
    where: { expertId: expert.id, ...filters.consultation },
    _count: { id: true }
  });
  const formattedStatus = consultationStatusDistribution.map(({ status: status38, _count }) => ({
    status: status38,
    count: _count.id
  }));
  const bookingsRaw = await prisma.consultation.findMany({
    where: { expertId: expert.id, ...filters.consultation },
    select: { createdAt: true, id: true },
    orderBy: { createdAt: "asc" }
  });
  const bookingsByMonth = bookingsRaw.reduce((acc, curr) => {
    const month = curr.createdAt.toISOString().slice(0, 7);
    const found = acc.find((b) => b.month === month);
    if (found) found.count++;
    else acc.push({ month, count: 1 });
    return acc;
  }, []);
  const earningsRaw = await prisma.payment.findMany({
    where: {
      status: "PAID" /* PAID */,
      consultation: { expertId: expert.id },
      ...filters.payment
    },
    select: { createdAt: true, amount: true },
    orderBy: { createdAt: "asc" }
  });
  const earningsByMonth = earningsRaw.reduce((acc, curr) => {
    const month = curr.createdAt.toISOString().slice(0, 7);
    const found = acc.find((e) => e.month === month);
    if (found) found.amount += curr.amount;
    else acc.push({ month, amount: curr.amount });
    return acc;
  }, []);
  const uniqueClients = await prisma.consultation.groupBy({
    by: ["clientId"],
    where: { expertId: expert.id, ...filters.consultation },
    _count: { id: true }
  });
  const repeatClients = uniqueClients.filter((c) => c._count.id > 1).length;
  const reviewCount = await prisma.testimonial.count({
    where: { expertId: expert.id, ...filters.review }
  });
  const avgRatingAgg = await prisma.testimonial.aggregate({
    _avg: { rating: true },
    where: { expertId: expert.id, ...filters.review }
  });
  let profileViews = 0;
  let profileSaves = 0;
  return {
    consultationCount,
    consultationStatusDistribution: formattedStatus,
    bookingsByMonth,
    earningsByMonth,
    clientCount: uniqueClients.length,
    repeatClients,
    reviewCount,
    avgRating: avgRatingAgg._avg.rating || 0,
    profileViews,
    profileSaves
  };
};
var getClientStats = async (user, filters = {}, pagination = {}) => {
  const client = await prisma.client.findUnique({
    where: { userId: user.userId },
    select: { id: true }
  });
  if (!client) {
    return {
      consultationCount: 0,
      consultationStatusDistribution: [],
      bookingsByMonth: [],
      savedExpertsCount: 0,
      engagementTrends: [],
      spendingByMonth: [],
      categoryDistribution: [],
      aiUsage: [],
      monthlyActivity: []
    };
  }
  const bookingsRaw = await prisma.consultation.findMany({
    where: { clientId: client.id, ...filters.consultation },
    select: { createdAt: true, id: true },
    orderBy: { createdAt: "asc" }
  });
  const bookingsByMonth = bookingsRaw.reduce((acc, curr) => {
    const month = curr.createdAt.toISOString().slice(0, 7);
    const found = acc.find((b) => b.month === month);
    if (found) found.count++;
    else acc.push({ month, count: 1 });
    return acc;
  }, []);
  const consultationCount = await prisma.consultation.count({
    where: { clientId: client.id, ...filters.consultation }
  });
  const consultationStatusDistribution = await prisma.consultation.groupBy({
    by: ["status"],
    where: { clientId: client.id, ...filters.consultation },
    _count: { id: true }
  });
  const formattedStatus = consultationStatusDistribution.map(({ status: status38, _count }) => ({
    status: status38,
    count: _count.id
  }));
  let savedExpertsCount = 0;
  const engagementRaw = await prisma.consultation.findMany({
    where: { clientId: client.id, ...filters.consultation },
    select: { createdAt: true, id: true },
    orderBy: { createdAt: "asc" }
  });
  const engagementTrends = engagementRaw.reduce((acc, curr) => {
    const month = curr.createdAt.toISOString().slice(0, 7);
    const found = acc.find((e) => e.month === month);
    if (found) found.count++;
    else acc.push({ month, count: 1 });
    return acc;
  }, []);
  const spendingRaw = await prisma.payment.findMany({
    where: {
      status: "PAID" /* PAID */,
      clientId: client.id,
      ...filters.payment
    },
    select: { createdAt: true, amount: true },
    orderBy: { createdAt: "asc" }
  });
  const spendingByMonth = spendingRaw.reduce((acc, curr) => {
    const month = curr.createdAt.toISOString().slice(0, 7);
    const found = acc.find((s) => s.month === month);
    if (found) found.amount += curr.amount;
    else acc.push({ month, amount: curr.amount });
    return acc;
  }, []);
  const categoryDistribution = await prisma.consultation.groupBy({
    by: ["industryId"],
    where: { clientId: client.id, ...filters.consultation },
    _count: { id: true }
  });
  let consultationHistory = [];
  if (pagination && pagination.pageSize) {
    consultationHistory = await prisma.consultation.findMany({
      where: { clientId: client.id, ...filters.consultation },
      orderBy: { createdAt: "desc" },
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize
    });
  }
  return {
    consultationCount,
    consultationStatusDistribution: formattedStatus,
    bookingsByMonth,
    savedExpertsCount,
    engagementTrends,
    spendingByMonth,
    categoryDistribution,
    aiUsage: [],
    monthlyActivity: {
      bookingsByMonth,
      spendingByMonth,
      aiUsage: []
    },
    consultationHistory
  };
};
var getRevenueByMonth = async () => {
  const revenueByMonth = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") AS month,
           CAST(SUM("amount") AS INTEGER) AS amount
    FROM "payments"
    WHERE "status" = 'PAID'
    GROUP BY month
    ORDER BY month ASC;
  `;
  return revenueByMonth;
};
var StatsService = {
  getDashboardStatsData
};

// src/modules/stats/stats.controler.ts
var getDashboardStatsData2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await StatsService.getDashboardStatsData(user);
  sendResponse(res, {
    httpStatusCode: status26.OK,
    success: true,
    message: "Dashboard stats retrieved successfully!",
    data: result
  });
});
var StatsController = {
  getDashboardStatsData: getDashboardStatsData2
};

// src/modules/stats/stats.router.ts
var router11 = express2.Router();
router11.get(
  "/",
  checkAuth(Role.ADMIN, Role.EXPERT, Role.CLIENT),
  // Only allow authenticated users with these roles
  StatsController.getDashboardStatsData
);
var StatsRoutes = router11;

// src/modules/payment/payment.router.ts
import { Router as Router10 } from "express";

// src/modules/payment/payment.controler.ts
import status28 from "http-status";

// src/modules/payment/payment.service.ts
import status27 from "http-status";
var findPaidCheckoutSessionByMetadata = async (payload) => {
  let startingAfter;
  for (let page = 0; page < 5; page += 1) {
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      ...startingAfter ? { starting_after: startingAfter } : {}
    });
    const match = sessions.data.find((session) => {
      return session.payment_status === "paid" && session.status === "complete" && session.metadata?.consultationId === payload.consultationId && session.metadata?.paymentId === payload.paymentId && session.metadata?.transactionId === payload.transactionId;
    });
    if (match) {
      return match;
    }
    if (!sessions.has_more || sessions.data.length === 0) {
      break;
    }
    startingAfter = sessions.data[sessions.data.length - 1]?.id;
  }
  return null;
};
var confirmConsultationPaymentSuccess = async (payload, user) => {
  if (!payload.consultationId || !payload.paymentId || !payload.transactionId) {
    throw new AppError_default(status27.BAD_REQUEST, "consultationId, paymentId and transactionId are required");
  }
  const consultation = await prisma.consultation.findUnique({
    where: { id: payload.consultationId },
    include: {
      payment: true,
      client: {
        select: {
          userId: true,
          fullName: true
        }
      },
      expert: {
        select: {
          userId: true,
          fullName: true
        }
      }
    }
  });
  if (!consultation || !consultation.payment) {
    throw new AppError_default(status27.NOT_FOUND, "Consultation payment not found");
  }
  if (user.role !== Role.ADMIN && consultation.client.userId !== user.userId) {
    throw new AppError_default(status27.FORBIDDEN, "You are not allowed to sync this payment");
  }
  if (consultation.payment.id !== payload.paymentId || consultation.payment.transactionId !== payload.transactionId) {
    throw new AppError_default(status27.BAD_REQUEST, "Provided payment identifiers do not match consultation records");
  }
  if (consultation.payment.status === PaymentStatus.PAID && consultation.paymentStatus === PaymentStatus.PAID) {
    return {
      consultationId: consultation.id,
      paymentId: consultation.payment.id,
      synced: true,
      alreadyPaid: true
    };
  }
  let paidSession = null;
  if (payload.sessionId) {
    const session = await stripe.checkout.sessions.retrieve(payload.sessionId);
    const metadataMatches = session.metadata?.consultationId === payload.consultationId && session.metadata?.paymentId === payload.paymentId && session.metadata?.transactionId === payload.transactionId;
    if (session.payment_status === "paid" && metadataMatches) {
      paidSession = session;
    }
  }
  if (!paidSession) {
    paidSession = await findPaidCheckoutSessionByMetadata(payload);
  }
  if (!paidSession) {
    throw new AppError_default(
      status27.BAD_REQUEST,
      "Stripe has not confirmed this payment yet. Please retry shortly."
    );
  }
  const updated = await prisma.$transaction(async (tx) => {
    const updatedConsultation = await tx.consultation.update({
      where: { id: consultation.id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: consultation.status !== ConsultationStatus.CANCELLED && consultation.status !== ConsultationStatus.COMPLETED && consultation.status !== ConsultationStatus.ONGOING ? ConsultationStatus.CONFIRMED : consultation.status
      }
    });
    const updatedPayment = await tx.payment.update({
      where: { id: consultation.payment.id },
      data: {
        status: PaymentStatus.PAID,
        paymentGatewayData: paidSession
      }
    });
    await tx.notification.createMany({
      data: [
        {
          type: "CONSULTATION_CONFIRMED",
          message: `Your payment for the consultation with ${consultation.expert?.fullName ?? "your expert"} was successful. The session is now confirmed.`,
          userId: consultation.client.userId
        },
        {
          type: "CONSULTATION_CONFIRMED",
          message: `${consultation.client.fullName} completed payment. Your consultation is now confirmed.`,
          userId: consultation.expert?.userId ?? ""
        }
      ].filter((item) => Boolean(item.userId))
    });
    return { updatedConsultation, updatedPayment };
  });
  return {
    consultationId: updated.updatedConsultation.id,
    paymentId: updated.updatedPayment.id,
    synced: true,
    alreadyPaid: false
  };
};
var handleStripeWebhookEvent = async (event) => {
  const existingPayment = await prisma.payment.findFirst({
    where: { stripeEventId: event.id }
  });
  if (existingPayment) {
    console.log(`Event ${event.id} already processed. Skipping.`);
    return { message: `Event ${event.id} already processed. Skipping.` };
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const consultationId = session.metadata?.consultationId;
      const paymentId = session.metadata?.paymentId;
      if (!consultationId || !paymentId) {
        console.error("Missing metadata in Stripe session");
        return { message: "Missing metadata" };
      }
      const consultation = await prisma.consultation.findUnique({
        where: { id: consultationId },
        include: {
          payment: true,
          client: {
            select: {
              userId: true,
              fullName: true
            }
          },
          expert: {
            select: {
              userId: true,
              fullName: true
            }
          }
        }
      });
      if (!consultation) {
        console.error(`Consultation ${consultationId} not found`);
        return { message: "Consultation not found" };
      }
      if (consultation.payment?.status === PaymentStatus.PAID && consultation.paymentStatus === PaymentStatus.PAID) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            paymentGatewayData: session,
            stripeEventId: event.id
          }
        });
        return {
          message: `Consultation ${consultationId} is already paid. Stripe event recorded.`
        };
      }
      const result = await prisma.$transaction(async (tx) => {
        const isPaid = session.payment_status === "paid";
        const updatedConsultation = await tx.consultation.update({
          where: { id: consultationId },
          data: {
            paymentStatus: isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID,
            status: isPaid && consultation.status !== ConsultationStatus.CANCELLED && consultation.status !== ConsultationStatus.COMPLETED && consultation.status !== ConsultationStatus.ONGOING ? ConsultationStatus.CONFIRMED : consultation.status
          }
        });
        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID,
            paymentGatewayData: session,
            stripeEventId: event.id
          }
        });
        if (isPaid) {
          await tx.notification.createMany({
            data: [
              {
                type: "CONSULTATION_CONFIRMED",
                message: `Your payment for the consultation with ${consultation.expert?.fullName ?? "your expert"} was successful. The session is now confirmed.`,
                userId: consultation.client.userId
              },
              {
                type: "CONSULTATION_CONFIRMED",
                message: `${consultation.client.fullName} completed payment. Your consultation is now confirmed.`,
                userId: consultation.expert?.userId ?? ""
              }
            ].filter((item) => Boolean(item.userId))
          });
        }
        return { updatedConsultation, updatedPayment };
      });
      console.log(
        `Payment ${session.payment_status} for consultation ${consultationId}`
      );
      return result;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      console.log(`Checkout session ${session.id} expired.`);
      break;
    }
    case "payment_intent.payment_failed": {
      const session = event.data.object;
      console.log(`Payment intent ${session.id} failed.`);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  return { message: `Webhook event ${event.id} processed successfully` };
};
var PaymentService = {
  handleStripeWebhookEvent,
  confirmConsultationPaymentSuccess
};

// src/modules/payment/payment.controler.ts
var handleStripeWebhookEvent2 = catchAsync(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    console.error("Missing Stripe signature or webhook secret");
    return res.status(status28.BAD_REQUEST).json({ message: "Missing Stripe signature or webhook secret" });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    console.error("Error verifying Stripe webhook:", error);
    return res.status(status28.BAD_REQUEST).json({ message: "Invalid Stripe webhook signature" });
  }
  try {
    const result = await PaymentService.handleStripeWebhookEvent(event);
    return sendResponse(res, {
      httpStatusCode: status28.OK,
      success: true,
      message: "Stripe webhook processed successfully",
      data: result
    });
  } catch (error) {
    console.error("Error handling Stripe webhook event:", error);
    return sendResponse(res, {
      httpStatusCode: status28.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Error handling Stripe webhook event"
    });
  }
});
var confirmConsultationPaymentSuccess2 = catchAsync(
  async (req, res) => {
    const source = req.method === "GET" ? req.query : req.body;
    const consultationId = String(source?.consultationId ?? "").trim();
    const paymentId = String(source?.paymentId ?? "").trim();
    const transactionId = String(source?.transactionId ?? "").trim();
    const sessionId = String(source?.sessionId ?? source?.session_id ?? "").trim();
    const result = await PaymentService.confirmConsultationPaymentSuccess(
      {
        consultationId,
        paymentId,
        transactionId,
        sessionId: sessionId || void 0
      },
      req.user
    );
    return sendResponse(res, {
      httpStatusCode: status28.OK,
      success: true,
      message: "Consultation payment synced successfully",
      data: result
    });
  }
);
var PaymentController = {
  handleStripeWebhookEvent: handleStripeWebhookEvent2,
  confirmConsultationPaymentSuccess: confirmConsultationPaymentSuccess2
};

// src/modules/payment/payment.router.ts
var router12 = Router10();
router12.post(
  "/consultation/confirm-success",
  checkAuth(Role.CLIENT, Role.ADMIN),
  PaymentController.confirmConsultationPaymentSuccess
);
router12.post(
  "/consultation/confirm",
  checkAuth(Role.CLIENT, Role.ADMIN),
  PaymentController.confirmConsultationPaymentSuccess
);
router12.get(
  "/consultation/confirm-success",
  checkAuth(Role.CLIENT, Role.ADMIN),
  PaymentController.confirmConsultationPaymentSuccess
);
router12.get(
  "/consultation/confirm",
  checkAuth(Role.CLIENT, Role.ADMIN),
  PaymentController.confirmConsultationPaymentSuccess
);
var PaymentRoutes = router12;

// src/modules/notification/notification.route.ts
import { Router as Router11 } from "express";

// src/modules/notification/notification.controler.ts
import status30 from "http-status";

// src/modules/notification/notification.service.ts
import status29 from "http-status";
var getNotificationById = async (id) => {
  const notification = await prisma.notification.findUnique({
    where: { id }
  });
  if (!notification) {
    throw new AppError_default(status29.NOT_FOUND, "Notification not found");
  }
  return notification;
};
var normalizeNotificationPayload = (payload) => ({
  type: payload.type.trim(),
  message: payload.message.trim(),
  userId: payload.userId,
  role: payload.role
});
var createNotification = async (payload) => {
  const { type, message, userId, role } = normalizeNotificationPayload(payload);
  if (!type || !message) {
    throw new AppError_default(status29.BAD_REQUEST, "Type and message are required");
  }
  if (userId && role || !userId && !role) {
    throw new AppError_default(status29.BAD_REQUEST, "Provide exactly one target: userId or role");
  }
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new AppError_default(status29.NOT_FOUND, "Target user not found");
    }
    return prisma.notification.create({
      data: {
        type,
        message,
        userId
      }
    });
  }
  if (role) {
    if (!Object.values(Role).includes(role)) {
      throw new AppError_default(status29.BAD_REQUEST, "Invalid role provided");
    }
    const users = await prisma.user.findMany({
      where: {
        role,
        isDeleted: false,
        status: UserStatus.ACTIVE
      },
      select: { id: true }
    });
    if (!users.length) {
      return { count: 0 };
    }
    const result = await prisma.notification.createMany({
      data: users.map((user) => ({
        type,
        message,
        userId: user.id
      }))
    });
    return result;
  }
  throw new AppError_default(status29.BAD_REQUEST, "Either userId or role is required");
};
var getAllNotifications = async () => {
  return prisma.notification.findMany({
    orderBy: { createdAt: "desc" }
  });
};
var getMyNotifications = async (user) => {
  return prisma.notification.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" }
  });
};
var getUnreadCount = async (user) => {
  const unreadCount = await prisma.notification.count({
    where: {
      userId: user.userId,
      read: false
    }
  });
  return { unreadCount };
};
var markAsRead = async (id, user) => {
  const notification = await getNotificationById(id);
  if (user.role !== Role.ADMIN && notification.userId !== user.userId) {
    throw new AppError_default(status29.FORBIDDEN, "Forbidden access to this notification");
  }
  return prisma.notification.update({
    where: { id },
    data: { read: true }
  });
};
var markAllAsRead = async (user) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId: user.userId,
      read: false
    },
    data: { read: true }
  });
  return result;
};
var deleteNotification = async (id, user) => {
  const notification = await getNotificationById(id);
  if (user.role !== Role.ADMIN && notification.userId !== user.userId) {
    throw new AppError_default(status29.FORBIDDEN, "Forbidden access to this notification");
  }
  await prisma.notification.delete({
    where: { id }
  });
  return null;
};
var notificationService = {
  createNotification,
  getAllNotifications,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

// src/modules/notification/notification.controler.ts
var createNotification2 = catchAsync(async (req, res) => {
  const result = await notificationService.createNotification(req.body);
  sendResponse(res, {
    httpStatusCode: status30.CREATED,
    success: true,
    message: "Notification created successfully",
    data: result
  });
});
var getAllNotifications2 = catchAsync(async (_req, res) => {
  const result = await notificationService.getAllNotifications();
  sendResponse(res, {
    httpStatusCode: status30.OK,
    success: true,
    message: "Notifications retrieved successfully",
    data: result
  });
});
var getMyNotifications2 = catchAsync(async (req, res) => {
  const result = await notificationService.getMyNotifications(req.user);
  sendResponse(res, {
    httpStatusCode: status30.OK,
    success: true,
    message: "My notifications retrieved successfully",
    data: result
  });
});
var getUnreadCount2 = catchAsync(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user);
  sendResponse(res, {
    httpStatusCode: status30.OK,
    success: true,
    message: "Unread notification count retrieved successfully",
    data: result
  });
});
var markAsRead2 = catchAsync(async (req, res) => {
  const result = await notificationService.markAsRead(String(req.params.id), req.user);
  sendResponse(res, {
    httpStatusCode: status30.OK,
    success: true,
    message: "Notification marked as read",
    data: result
  });
});
var markAllAsRead2 = catchAsync(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user);
  sendResponse(res, {
    httpStatusCode: status30.OK,
    success: true,
    message: "All notifications marked as read",
    data: result
  });
});
var deleteNotification2 = catchAsync(async (req, res) => {
  await notificationService.deleteNotification(String(req.params.id), req.user);
  sendResponse(res, {
    httpStatusCode: status30.OK,
    success: true,
    message: "Notification deleted successfully",
    data: null
  });
});
var notificationController = {
  createNotification: createNotification2,
  getAllNotifications: getAllNotifications2,
  getMyNotifications: getMyNotifications2,
  getUnreadCount: getUnreadCount2,
  markAsRead: markAsRead2,
  markAllAsRead: markAllAsRead2,
  deleteNotification: deleteNotification2
};

// src/modules/notification/notification.validation.ts
import z11 from "zod";
var notificationIdParamsSchema = z11.object({
  id: z11.string().uuid("Invalid notification id")
});
var createNotificationValidation = z11.object({
  body: z11.object({
    type: z11.string().trim().min(1, "Type is required"),
    message: z11.string().trim().min(1, "Message is required"),
    userId: z11.string().uuid("Invalid user id").optional(),
    role: z11.nativeEnum(Role).optional()
  }).superRefine((value, ctx) => {
    if (value.userId && value.role || !value.userId && !value.role) {
      ctx.addIssue({
        code: z11.ZodIssueCode.custom,
        message: "Provide exactly one target: userId or role"
      });
    }
  })
});
var notificationIdValidation = z11.object({
  params: notificationIdParamsSchema
});

// src/modules/notification/notification.route.ts
var router13 = Router11();
router13.get(
  "/my",
  checkAuth(Role.ADMIN, Role.EXPERT, Role.CLIENT),
  notificationController.getMyNotifications
);
router13.get(
  "/unread-count",
  checkAuth(Role.ADMIN, Role.EXPERT, Role.CLIENT),
  notificationController.getUnreadCount
);
router13.patch(
  "/read-all",
  checkAuth(Role.ADMIN, Role.EXPERT, Role.CLIENT),
  notificationController.markAllAsRead
);
router13.patch(
  "/:id/read",
  checkAuth(Role.ADMIN, Role.EXPERT, Role.CLIENT),
  validateRequest(notificationIdValidation),
  notificationController.markAsRead
);
router13.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.EXPERT, Role.CLIENT),
  validateRequest(notificationIdValidation),
  notificationController.deleteNotification
);
router13.post("/", checkAuth(Role.ADMIN), validateRequest(createNotificationValidation), notificationController.createNotification);
router13.get("/", checkAuth(Role.ADMIN), notificationController.getAllNotifications);
var notificationRouter = router13;

// src/modules/client/client.router.ts
import { Router as Router12 } from "express";

// src/modules/client/client.controler.ts
import status32 from "http-status";

// src/modules/client/client.service.ts
import status31 from "http-status";
var getAllClients3 = async (query2) => {
  const queryBuilder = new QueryBuilder(prisma.client, query2, {
    searchableFields: ["fullName", "email", "phone", "address", "user.name", "user.email"],
    filterableFields: ["fullName", "email", "phone", "address", "isDeleted", "userId"]
  });
  const result = await queryBuilder.search().filter().where({ isDeleted: false }).include({ user: true }).paginate().sort().fields().excute();
  return result;
};
var getClientById = async (id) => {
  const client = await prisma.client.findUnique({
    where: { id, isDeleted: false },
    include: {
      user: true,
      consultations: true,
      testimonials: true
    }
  });
  if (!client) {
    throw new AppError_default(status31.NOT_FOUND, "Client not found");
  }
  return client;
};
var getMyProfile = async (userId) => {
  const client = await prisma.client.findUnique({
    where: { userId, isDeleted: false },
    include: {
      user: true,
      consultations: true,
      testimonials: true
    }
  });
  if (!client) {
    throw new AppError_default(status31.NOT_FOUND, "Client profile not found");
  }
  return client;
};
var updateClient = async (id, payload, user) => {
  const existingClient = await prisma.client.findUnique({
    where: { id, isDeleted: false },
    include: { user: true }
  });
  if (!existingClient) {
    throw new AppError_default(status31.NOT_FOUND, "Client not found");
  }
  if (user.role !== Role.ADMIN && existingClient.userId !== user.userId) {
    throw new AppError_default(status31.FORBIDDEN, "Forbidden access to update this client");
  }
  const result = await prisma.$transaction(async (tx) => {
    if (payload.email && payload.email !== existingClient.email) {
      const duplicateUser = await tx.user.findFirst({
        where: {
          email: payload.email,
          NOT: { id: existingClient.userId }
        }
      });
      if (duplicateUser) {
        throw new AppError_default(status31.BAD_REQUEST, "User with same email already exists");
      }
    }
    await tx.user.update({
      where: { id: existingClient.userId },
      data: {
        ...payload.email ? { email: payload.email } : {},
        ...payload.fullName ? { name: payload.fullName } : {}
      }
    });
    return tx.client.update({
      where: { id },
      data: {
        ...payload.fullName !== void 0 ? { fullName: payload.fullName } : {},
        ...payload.email !== void 0 ? { email: payload.email } : {},
        ...payload.profilePhoto !== void 0 ? { profilePhoto: payload.profilePhoto } : {},
        ...payload.phone !== void 0 ? { phone: payload.phone } : {},
        ...payload.address !== void 0 ? { address: payload.address } : {}
      },
      include: { user: true }
    });
  });
  return result;
};
var deleteClient = async (id) => {
  const client = await prisma.client.findUnique({
    where: { id },
    include: { user: true }
  });
  if (!client) {
    throw new AppError_default(status31.NOT_FOUND, "Client not found");
  }
  await prisma.$transaction(async (tx) => {
    await tx.client.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: /* @__PURE__ */ new Date()
      }
    });
    await tx.user.update({
      where: { id: client.userId },
      data: {
        isDeleted: true,
        deletedAt: /* @__PURE__ */ new Date(),
        status: UserStatus.DELETED
      }
    });
    await tx.session.deleteMany({
      where: { userId: client.userId }
    });
  });
  return { message: "Client deleted successfully" };
};
var clientService = {
  getAllClients: getAllClients3,
  getClientById,
  getMyProfile,
  updateClient,
  deleteClient
};

// src/modules/client/client.controler.ts
var getAllClients4 = catchAsync(async (req, res) => {
  const result = await clientService.getAllClients(req.query);
  sendResponse(res, {
    httpStatusCode: status32.OK,
    success: true,
    message: "Clients fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getClientById2 = catchAsync(async (req, res) => {
  const result = await clientService.getClientById(String(req.params.id));
  sendResponse(res, {
    httpStatusCode: status32.OK,
    success: true,
    message: "Client retrieved successfully",
    data: result
  });
});
var getMyProfile2 = catchAsync(async (req, res) => {
  const result = await clientService.getMyProfile(req.user.userId);
  sendResponse(res, {
    httpStatusCode: status32.OK,
    success: true,
    message: "Client profile retrieved successfully",
    data: result
  });
});
var updateClient2 = catchAsync(async (req, res) => {
  const result = await clientService.updateClient(
    String(req.params.id),
    req.body,
    req.user
  );
  sendResponse(res, {
    httpStatusCode: status32.OK,
    success: true,
    message: "Client updated successfully",
    data: result
  });
});
var deleteClient2 = catchAsync(async (req, res) => {
  const result = await clientService.deleteClient(String(req.params.id));
  sendResponse(res, {
    httpStatusCode: status32.OK,
    success: true,
    message: "Client deleted successfully",
    data: result
  });
});
var clientController = {
  getAllClients: getAllClients4,
  getClientById: getClientById2,
  getMyProfile: getMyProfile2,
  updateClient: updateClient2,
  deleteClient: deleteClient2
};

// src/modules/client/client.router.ts
var router14 = Router12();
router14.get("/", checkAuth(Role.ADMIN), clientController.getAllClients);
router14.get("/me", checkAuth(Role.CLIENT, Role.ADMIN), clientController.getMyProfile);
router14.get("/:id", checkAuth(Role.ADMIN), clientController.getClientById);
router14.put("/:id", checkAuth(Role.ADMIN, Role.CLIENT), clientController.updateClient);
router14.delete("/:id", checkAuth(Role.ADMIN), clientController.deleteClient);
var clientRouter = router14;

// src/modules/chat/chat.routes.ts
import { Router as Router13 } from "express";

// src/modules/chat/chat.controller.ts
import httpStatus3 from "http-status";

// src/modules/chat/chat.service.ts
import httpStatus2 from "http-status";
var reactionUserSelect = {
  id: true,
  name: true,
  email: true,
  image: true
};
var messageReactionInclude = {
  user: {
    select: reactionUserSelect
  }
};
var roomInclude = {
  client: {
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true
        }
      }
    }
  },
  expert: {
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true
        }
      }
    }
  },
  consultation: true,
  messages: {
    take: 1,
    orderBy: { createdAt: "desc" },
    include: {
      attachment: true,
      reactions: {
        include: messageReactionInclude
      }
    }
  }
};
var messageInclude = {
  attachment: true,
  reactions: {
    include: messageReactionInclude
  }
};
var mapRoleToUserRole = (role) => {
  if (role === Role.CLIENT) return UserRole.CLIENT;
  if (role === Role.EXPERT) return UserRole.EXPERT;
  return UserRole.ADMIN;
};
var getCurrentClientByUserId = async (userId) => {
  const client = await prisma.client.findUnique({
    where: { userId },
    select: { id: true, userId: true, isDeleted: true }
  });
  if (!client || client.isDeleted) {
    throw new AppError_default(httpStatus2.NOT_FOUND, "Client profile not found");
  }
  return client;
};
var getCurrentExpertByUserId = async (userId) => {
  const expert = await prisma.expert.findUnique({
    where: { userId },
    select: { id: true, userId: true, isDeleted: true }
  });
  if (!expert || expert.isDeleted) {
    throw new AppError_default(httpStatus2.NOT_FOUND, "Expert profile not found");
  }
  return expert;
};
var upsertRoomForParticipants = async (clientId, expertId, consultationId) => {
  return prisma.chatRoom.upsert({
    where: {
      clientId_expertId: {
        clientId,
        expertId
      }
    },
    update: consultationId ? { consultationId } : {},
    create: {
      clientId,
      expertId,
      ...consultationId ? { consultationId } : {}
    },
    include: roomInclude
  });
};
var resolveRoomFromConsultation = async (roomIdentifier, userId, role) => {
  const consultation = await prisma.consultation.findFirst({
    where: {
      id: roomIdentifier,
      ...role === Role.CLIENT ? { client: { userId } } : {},
      ...role === Role.EXPERT ? { expert: { userId } } : {}
    },
    select: {
      id: true,
      clientId: true,
      expertId: true
    }
  });
  if (!consultation?.expertId) {
    return null;
  }
  return upsertRoomForParticipants(
    consultation.clientId,
    consultation.expertId,
    consultation.id
  );
};
var resolveRoomByIdentifier = async (roomIdentifier, userId, role) => {
  const consultationRoom = await resolveRoomFromConsultation(
    roomIdentifier,
    userId,
    role
  );
  if (consultationRoom) {
    return consultationRoom;
  }
  if (role === Role.ADMIN) {
    return null;
  }
  if (role === Role.CLIENT) {
    const client2 = await getCurrentClientByUserId(userId);
    const expert2 = await prisma.expert.findFirst({
      where: {
        isDeleted: false,
        OR: [{ id: roomIdentifier }, { userId: roomIdentifier }]
      },
      select: { id: true }
    });
    if (!expert2) {
      return null;
    }
    return upsertRoomForParticipants(client2.id, expert2.id);
  }
  const expert = await getCurrentExpertByUserId(userId);
  const client = await prisma.client.findFirst({
    where: {
      isDeleted: false,
      OR: [{ id: roomIdentifier }, { userId: roomIdentifier }]
    },
    select: { id: true }
  });
  if (!client) {
    return null;
  }
  return upsertRoomForParticipants(client.id, expert.id);
};
var getLatestRoomForUser = async (userId, role) => {
  if (role === Role.ADMIN) {
    return null;
  }
  if (role === Role.CLIENT) {
    const client = await getCurrentClientByUserId(userId);
    return prisma.chatRoom.findFirst({
      where: { clientId: client.id },
      include: roomInclude,
      orderBy: { updatedAt: "desc" }
    });
  }
  const expert = await getCurrentExpertByUserId(userId);
  return prisma.chatRoom.findFirst({
    where: { expertId: expert.id },
    include: roomInclude,
    orderBy: { updatedAt: "desc" }
  });
};
var getRoomWithParticipants = async (roomId, userId, role) => {
  let room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: roomInclude
  });
  if (!room) {
    room = await prisma.chatRoom.findFirst({
      where: { consultationId: roomId },
      include: roomInclude,
      orderBy: { updatedAt: "desc" }
    });
  }
  if (!room && userId && role) {
    room = await resolveRoomByIdentifier(roomId, userId, role);
  }
  if (!room && userId && role) {
    room = await getLatestRoomForUser(userId, role);
  }
  if (!room) {
    throw new AppError_default(httpStatus2.NOT_FOUND, "Chat room not found");
  }
  return room;
};
var getPresenceLookup = async (userIds) => {
  const presences = await prisma.userPresence.findMany({
    where: {
      userId: { in: userIds }
    }
  });
  return new Map(presences.map((presence) => [presence.userId, presence]));
};
var buildParticipants = async (room) => {
  const presenceLookup = await getPresenceLookup([room.client.userId, room.expert.userId]);
  return [
    {
      id: room.client.id,
      userId: room.client.userId,
      role: UserRole.CLIENT,
      fullName: room.client.fullName,
      name: room.client.user?.name ?? room.client.fullName,
      email: room.client.email ?? room.client.user?.email,
      profilePhoto: room.client.profilePhoto ?? room.client.user?.image ?? null,
      avatarUrl: room.client.profilePhoto ?? room.client.user?.image ?? null,
      isOnline: presenceLookup.get(room.client.userId)?.isOnline ?? false,
      lastSeen: presenceLookup.get(room.client.userId)?.lastSeen ?? null
    },
    {
      id: room.expert.id,
      userId: room.expert.userId,
      role: UserRole.EXPERT,
      fullName: room.expert.fullName,
      name: room.expert.user?.name ?? room.expert.fullName,
      title: room.expert.title,
      email: room.expert.email ?? room.expert.user?.email,
      profilePhoto: room.expert.profilePhoto ?? room.expert.user?.image ?? null,
      avatarUrl: room.expert.profilePhoto ?? room.expert.user?.image ?? null,
      isOnline: presenceLookup.get(room.expert.userId)?.isOnline ?? false,
      lastSeen: presenceLookup.get(room.expert.userId)?.lastSeen ?? null
    }
  ];
};
var formatAttachment = (attachment) => {
  if (!attachment) {
    return null;
  }
  return {
    ...attachment,
    url: attachment.fileUrl,
    mimeType: attachment.fileType,
    size: attachment.fileSize
  };
};
var formatReactions = (reactions, currentUserId) => {
  const grouped = /* @__PURE__ */ new Map();
  for (const reaction of reactions) {
    const existing = grouped.get(reaction.emoji);
    if (existing) {
      existing.count += 1;
      existing.reactedByCurrentUser ||= reaction.userId === currentUserId;
      existing.users.push({
        userId: reaction.userId,
        name: reaction.user.name,
        email: reaction.user.email,
        image: reaction.user.image
      });
      continue;
    }
    grouped.set(reaction.emoji, {
      emoji: reaction.emoji,
      count: 1,
      reactedByCurrentUser: reaction.userId === currentUserId,
      users: [
        {
          userId: reaction.userId,
          name: reaction.user.name,
          email: reaction.user.email,
          image: reaction.user.image
        }
      ]
    });
  }
  return Array.from(grouped.values());
};
var formatMessage = (message, participants = [], currentUserId) => ({
  ...message,
  sender: participants.find(
    (participant) => participant.userId === message.senderId || participant.id === message.senderId
  ) ?? null,
  attachment: formatAttachment(message.attachment),
  reactions: formatReactions(message.reactions, currentUserId)
});
var formatRoom = async (room, currentUserId) => {
  const participants = await buildParticipants(room);
  const latestMessage = room.messages[0] ? formatMessage(room.messages[0], participants, currentUserId) : null;
  return {
    ...room,
    participants,
    lastMessage: latestMessage,
    unreadCount: 0
  };
};
var ensureRoomAccess = async (roomId, userId, role) => {
  const room = await getRoomWithParticipants(roomId, userId, role);
  if (role === Role.ADMIN) return room;
  const allowedUserId = role === Role.CLIENT ? room.client.userId : room.expert.userId;
  if (allowedUserId !== userId) {
    throw new AppError_default(httpStatus2.FORBIDDEN, "Forbidden access to this chat room");
  }
  return room;
};
var getRecipientUserIdForRoom = (room, senderRole) => senderRole === Role.CLIENT ? room.expert.userId : room.client.userId;
var getRoomRealtimeTargets = async (roomId, senderRole, userId) => {
  const room = await getRoomWithParticipants(roomId, userId, senderRole);
  return {
    roomId: room.id,
    clientUserId: room.client.userId,
    expertUserId: room.expert.userId,
    recipientUserId: senderRole ? getRecipientUserIdForRoom(room, senderRole) : null
  };
};
var getMessageForRoom = async (roomId, messageId) => {
  const message = await prisma.message.findFirst({
    where: { id: messageId, roomId },
    include: messageInclude
  });
  if (!message) {
    throw new AppError_default(httpStatus2.NOT_FOUND, "Message not found");
  }
  return message;
};
var notifyRecipient = async (roomId, senderId, senderRole, previewText, options) => {
  const room = await getRoomWithParticipants(roomId);
  const recipientUserId = getRecipientUserIdForRoom(room, senderRole);
  if (!recipientUserId || recipientUserId === senderId) {
    return;
  }
  const recipientPresence = await prisma.userPresence.findUnique({
    where: { userId: recipientUserId }
  });
  if (!options?.always && recipientPresence?.isOnline) {
    return;
  }
  await prisma.notification.create({
    data: {
      type: options?.type ?? "CHAT_MESSAGE",
      message: previewText,
      userId: recipientUserId
    }
  });
};
var getUserRooms = async (userId, role, expertId) => {
  if (role === Role.ADMIN) {
    const rooms2 = await prisma.chatRoom.findMany({
      where: expertId ? { expertId } : void 0,
      include: roomInclude,
      orderBy: { updatedAt: "desc" }
    });
    return Promise.all(rooms2.map((room) => formatRoom(room, userId)));
  }
  if (role === Role.CLIENT) {
    const client = await getCurrentClientByUserId(userId);
    const rooms2 = await prisma.chatRoom.findMany({
      where: { clientId: client.id, ...expertId ? { expertId } : {} },
      include: roomInclude,
      orderBy: { updatedAt: "desc" }
    });
    return Promise.all(rooms2.map((room) => formatRoom(room, userId)));
  }
  const expert = await getCurrentExpertByUserId(userId);
  const rooms = await prisma.chatRoom.findMany({
    where: { expertId: expert.id },
    include: roomInclude,
    orderBy: { updatedAt: "desc" }
  });
  return Promise.all(rooms.map((room) => formatRoom(room, userId)));
};
var createOrGetRoom = async (userId, role, participantIdentifier) => {
  if (!participantIdentifier) {
    throw new AppError_default(httpStatus2.BAD_REQUEST, "Participant identifier is required");
  }
  if (role === Role.ADMIN) {
    throw new AppError_default(httpStatus2.FORBIDDEN, "Admins cannot create chat rooms directly");
  }
  const room = await resolveRoomByIdentifier(participantIdentifier, userId, role);
  if (!room) {
    throw new AppError_default(
      httpStatus2.NOT_FOUND,
      role === Role.CLIENT ? "Expert not found" : "Client not found"
    );
  }
  return formatRoom(room, userId);
};
var getRoomMessages = async (roomId, userId, role) => {
  const room = await ensureRoomAccess(roomId, userId, role);
  const participants = await buildParticipants(room);
  const messages = await prisma.message.findMany({
    where: { roomId: room.id },
    include: messageInclude,
    orderBy: { createdAt: "asc" }
  });
  return {
    roomId: room.id,
    resolvedFromStaleId: room.id !== roomId,
    messages: messages.map((message) => formatMessage(message, participants, userId))
  };
};
var updateRoomTimestamp = async (roomId) => {
  return prisma.chatRoom.update({
    where: { id: roomId },
    data: { updatedAt: /* @__PURE__ */ new Date() }
  });
};
var createTextMessage = async (roomId, senderId, senderRole, text) => {
  if (!text?.trim()) {
    throw new AppError_default(httpStatus2.BAD_REQUEST, "Message text is required");
  }
  const room = await ensureRoomAccess(roomId, senderId, senderRole);
  const message = await prisma.message.create({
    data: {
      roomId: room.id,
      senderId,
      senderRole: mapRoleToUserRole(senderRole),
      type: MessageType.TEXT,
      text: text.trim()
    },
    include: messageInclude
  });
  await updateRoomTimestamp(room.id);
  await notifyRecipient(room.id, senderId, senderRole, "You have a new chat message.");
  const participants = await buildParticipants(room);
  return {
    roomId: room.id,
    resolvedFromStaleId: room.id !== roomId,
    message: formatMessage(message, participants, senderId)
  };
};
var createFileMessage = async (roomId, senderId, senderRole, attachmentData) => {
  const room = await ensureRoomAccess(roomId, senderId, senderRole);
  const message = await prisma.message.create({
    data: {
      roomId: room.id,
      senderId,
      senderRole: mapRoleToUserRole(senderRole),
      type: MessageType.FILE,
      text: attachmentData.fileName,
      attachment: {
        create: {
          fileUrl: attachmentData.fileUrl,
          fileName: attachmentData.fileName,
          fileType: attachmentData.fileType,
          fileSize: attachmentData.fileSize
        }
      }
    },
    include: messageInclude
  });
  await updateRoomTimestamp(room.id);
  await notifyRecipient(room.id, senderId, senderRole, "You received a file in chat.");
  const participants = await buildParticipants(room);
  return {
    roomId: room.id,
    resolvedFromStaleId: room.id !== roomId,
    message: formatMessage(message, participants, senderId)
  };
};
var toggleMessageReaction = async (roomId, messageId, userId, role, emoji) => {
  const normalizedEmoji = emoji.trim();
  if (!normalizedEmoji) {
    throw new AppError_default(httpStatus2.BAD_REQUEST, "Emoji is required");
  }
  if (normalizedEmoji.length > 32) {
    throw new AppError_default(httpStatus2.BAD_REQUEST, "Emoji is too long");
  }
  const room = await ensureRoomAccess(roomId, userId, role);
  const message = await getMessageForRoom(room.id, messageId);
  const existingReaction = await prisma.messageReaction.findUnique({
    where: {
      messageId_userId_emoji: {
        messageId: message.id,
        userId,
        emoji: normalizedEmoji
      }
    }
  });
  if (existingReaction) {
    await prisma.messageReaction.delete({
      where: { id: existingReaction.id }
    });
  } else {
    await prisma.messageReaction.create({
      data: {
        messageId: message.id,
        userId,
        emoji: normalizedEmoji
      }
    });
  }
  const updatedMessage = await getMessageForRoom(room.id, message.id);
  const participants = await buildParticipants(room);
  return {
    roomId: room.id,
    resolvedFromStaleId: room.id !== roomId,
    messageId: message.id,
    emoji: normalizedEmoji,
    action: existingReaction ? "removed" : "added",
    reactions: formatReactions(updatedMessage.reactions, userId),
    message: formatMessage(updatedMessage, participants, userId)
  };
};
var createCall = async (roomId, userId, role) => {
  const room = await ensureRoomAccess(roomId, userId, role);
  const call = await prisma.call.create({
    data: {
      roomId: room.id,
      status: CallStatus.ACTIVE,
      startedAt: /* @__PURE__ */ new Date(),
      participants: {
        create: {
          userId,
          role: mapRoleToUserRole(role),
          joinedAt: /* @__PURE__ */ new Date()
        }
      }
    },
    include: { participants: true }
  });
  await updateRoomTimestamp(room.id);
  await notifyRecipient(room.id, userId, role, "You have an incoming chat call.", {
    type: "CHAT_CALL",
    always: true
  });
  return call;
};
var endCall = async (callId) => {
  const existing = await prisma.call.findUnique({ where: { id: callId } });
  if (!existing) {
    throw new AppError_default(httpStatus2.NOT_FOUND, "Call not found");
  }
  if (existing.status === CallStatus.ENDED) {
    return existing;
  }
  await prisma.callParticipant.updateMany({
    where: { callId, leftAt: null },
    data: { leftAt: /* @__PURE__ */ new Date() }
  });
  return prisma.call.update({
    where: { id: callId },
    data: {
      status: CallStatus.ENDED,
      endedAt: /* @__PURE__ */ new Date()
    },
    include: { participants: true }
  });
};
var updateCallStatus = async (callId, statusValue) => {
  if (statusValue === CallStatus.ENDED) {
    return endCall(callId);
  }
  return prisma.call.update({
    where: { id: callId },
    data: {
      status: statusValue,
      startedAt: statusValue === CallStatus.ACTIVE ? /* @__PURE__ */ new Date() : void 0
    },
    include: { participants: true }
  });
};
var deleteMessage = async (roomId, messageId, userId, role) => {
  await ensureRoomAccess(roomId, userId, role);
  const deleted = await prisma.message.delete({
    where: { id: messageId }
  });
  return deleted;
};
var chatService = {
  getUserRooms,
  createOrGetRoom,
  getRoomMessages,
  createTextMessage,
  createFileMessage,
  toggleMessageReaction,
  updateRoomTimestamp,
  createCall,
  endCall,
  updateCallStatus,
  getRoomRealtimeTargets,
  deleteMessage
};

// src/modules/chat/chat.upload.ts
import multer3 from "multer";
import { CloudinaryStorage as CloudinaryStorage3 } from "multer-storage-cloudinary";
var allowedMimeTypes = /* @__PURE__ */ new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);
var storage3 = new CloudinaryStorage3({
  cloudinary: cloudinaryUpload,
  params: async (_req, file) => {
    const originalName = file.originalname;
    const extension = originalName.split(".").pop()?.toLowerCase();
    const fileNameWithoutExtension = originalName.split(".").slice(0, -1).join(".").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9/-]/g, "");
    const uniqueName = `${Math.random().toString(36).substring(2)}-${Date.now()}-${fileNameWithoutExtension}`;
    const folder = extension === "pdf" ? "pdfs" : "chat";
    return {
      folder: `consultedge/${folder}`,
      public_id: uniqueName,
      resource_type: "auto"
    };
  }
});
var fileFilter2 = (_req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new Error("Invalid file type. Allowed: PDF, PNG, JPG, DOCX"));
    return;
  }
  cb(null, true);
};
var chatUpload = multer3({
  storage: storage3,
  fileFilter: fileFilter2,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});
var mapUploadedFileToAttachmentData = (file) => {
  const cloudinaryFile = file;
  const fileUrl = cloudinaryFile.path ?? cloudinaryFile.secure_url;
  if (!fileUrl) {
    throw new Error("Failed to resolve uploaded file URL from Cloudinary");
  }
  return {
    fileUrl,
    fileName: file.originalname,
    fileType: file.mimetype,
    fileSize: file.size
  };
};

// src/lib/ably.ts
import Ably from "ably";
var ablyClient = null;
var getAblyClient = () => {
  if (!envVars.ABLY_API_KEY) {
    return null;
  }
  if (!ablyClient) {
    ablyClient = new Ably.Rest({ key: envVars.ABLY_API_KEY });
  }
  return ablyClient;
};
var roomChannel = (roomId) => `private-room-${roomId}`;
var userChannel = (userId) => `private-user-${userId}`;
var publishToRoom = async (roomId, eventName, payload) => {
  const client = getAblyClient();
  if (!client) return;
  try {
    await client.channels.get(roomChannel(roomId)).publish(eventName, payload);
  } catch (error) {
    console.error("Ably publishToRoom failed:", error);
  }
};
var publishToUser = async (userId, eventName, payload) => {
  const client = getAblyClient();
  if (!client) return;
  try {
    await client.channels.get(userChannel(userId)).publish(eventName, payload);
  } catch (error) {
    console.error("Ably publishToUser failed:", error);
  }
};
var createAblyTokenRequest = async (clientId, capability) => {
  const client = getAblyClient();
  if (!client) {
    throw new Error("Ably is not configured. Set ABLY_API_KEY.");
  }
  return client.auth.createTokenRequest({
    clientId,
    ttl: 60 * 60 * 1e3
  });
};

// src/modules/chat/chat.controller.ts
var emitChatEvent = async (roomId, eventName, payload, senderRole, senderUserId) => {
  const targets = await chatService.getRoomRealtimeTargets(
    roomId,
    senderRole,
    senderUserId
  );
  await publishToRoom(targets.roomId, eventName, payload);
  if (senderRole && targets.recipientUserId) {
    await publishToUser(targets.recipientUserId, eventName, payload);
    return;
  }
  await publishToUser(targets.clientUserId, eventName, payload);
  await publishToUser(targets.expertUserId, eventName, payload);
};
var getSingleString = (value) => {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : "";
  }
  return typeof value === "string" ? value : "";
};
var getRooms = catchAsync(async (req, res) => {
  const expertId = getSingleString(req.query.expertId) || void 0;
  const rooms = await chatService.getUserRooms(
    req.user.userId,
    req.user.role,
    expertId
  );
  sendResponse(res, {
    httpStatusCode: httpStatus3.OK,
    success: true,
    message: "Chat rooms fetched successfully",
    data: rooms
  });
});
var createOrGetRoom2 = catchAsync(async (req, res) => {
  const participantIdentifier = getSingleString(
    req.body?.expertId ?? req.body?.participantId ?? req.body?.userId
  );
  const room = await chatService.createOrGetRoom(
    req.user.userId,
    req.user.role,
    participantIdentifier
  );
  sendResponse(res, {
    httpStatusCode: httpStatus3.OK,
    success: true,
    message: "Chat room fetched successfully",
    data: room
  });
});
var getRoomMessages2 = catchAsync(async (req, res) => {
  const roomId = getSingleString(req.params.roomId);
  if (!roomId) {
    throw new AppError_default(httpStatus3.BAD_REQUEST, "roomId is required");
  }
  const result = await chatService.getRoomMessages(
    roomId,
    req.user.userId,
    req.user.role
  );
  sendResponse(res, {
    httpStatusCode: httpStatus3.OK,
    success: true,
    message: "Room messages fetched successfully",
    data: result
  });
});
var postTextMessage = catchAsync(async (req, res) => {
  const roomId = getSingleString(req.params.roomId);
  const text = String(req.body?.text ?? "");
  if (!roomId) {
    throw new AppError_default(httpStatus3.BAD_REQUEST, "roomId is required");
  }
  const result = await chatService.createTextMessage(
    roomId,
    req.user.userId,
    req.user.role,
    text
  );
  await emitChatEvent(
    result.roomId,
    "receive_message",
    result.message,
    req.user.role,
    req.user.userId
  );
  sendResponse(res, {
    httpStatusCode: httpStatus3.CREATED,
    success: true,
    message: "Message sent successfully",
    data: result
  });
});
var postAttachmentMessage = catchAsync(async (req, res) => {
  const roomId = getSingleString(req.params.roomId);
  if (!roomId) {
    throw new AppError_default(httpStatus3.BAD_REQUEST, "roomId is required");
  }
  if (!req.file) {
    return sendResponse(res, {
      httpStatusCode: httpStatus3.BAD_REQUEST,
      success: false,
      message: "Attachment file is required",
      data: null
    });
  }
  const attachment = mapUploadedFileToAttachmentData(req.file);
  const result = await chatService.createFileMessage(
    roomId,
    req.user.userId,
    req.user.role,
    attachment
  );
  await emitChatEvent(
    result.roomId,
    "receive_message",
    result.message,
    req.user.role,
    req.user.userId
  );
  sendResponse(res, {
    httpStatusCode: httpStatus3.CREATED,
    success: true,
    message: "Attachment message sent successfully",
    data: result
  });
});
var toggleMessageReaction2 = catchAsync(async (req, res) => {
  const roomId = getSingleString(req.params.roomId);
  const messageId = getSingleString(req.params.messageId);
  const emoji = getSingleString(req.body?.emoji);
  if (!roomId || !messageId) {
    throw new AppError_default(httpStatus3.BAD_REQUEST, "roomId and messageId are required");
  }
  const result = await chatService.toggleMessageReaction(
    roomId,
    messageId,
    req.user.userId,
    req.user.role,
    emoji
  );
  await emitChatEvent(
    result.roomId,
    "message_reaction_updated",
    result,
    req.user.role,
    req.user.userId
  );
  sendResponse(res, {
    httpStatusCode: httpStatus3.OK,
    success: true,
    message: `Message reaction ${result.action} successfully`,
    data: result
  });
});
var createCall2 = catchAsync(async (req, res) => {
  const roomId = getSingleString(req.params.roomId);
  if (!roomId) {
    throw new AppError_default(httpStatus3.BAD_REQUEST, "roomId is required");
  }
  const call = await chatService.createCall(roomId, req.user.userId, req.user.role);
  await emitChatEvent(
    roomId,
    "call_started",
    call,
    req.user.role,
    req.user.userId
  );
  sendResponse(res, {
    httpStatusCode: httpStatus3.CREATED,
    success: true,
    message: "Call started successfully",
    data: call
  });
});
var updateCallStatus2 = catchAsync(async (req, res) => {
  const callId = getSingleString(req.params.callId);
  const statusValue = req.body?.status;
  if (!callId) {
    throw new AppError_default(httpStatus3.BAD_REQUEST, "callId is required");
  }
  if (!Object.values(CallStatus).includes(statusValue)) {
    return sendResponse(res, {
      httpStatusCode: httpStatus3.BAD_REQUEST,
      success: false,
      message: "Invalid call status",
      data: null
    });
  }
  const call = await chatService.updateCallStatus(callId, statusValue);
  await emitChatEvent(
    call.roomId,
    statusValue === CallStatus.ENDED ? "call_ended" : "call_updated",
    call
  );
  sendResponse(res, {
    httpStatusCode: httpStatus3.OK,
    success: true,
    message: "Call status updated successfully",
    data: call
  });
});
var deleteMessage2 = catchAsync(async (req, res) => {
  const roomId = getSingleString(req.params.roomId);
  const messageId = getSingleString(req.params.messageId);
  if (!roomId || !messageId) {
    throw new AppError_default(httpStatus3.BAD_REQUEST, "roomId and messageId are required");
  }
  await chatService.deleteMessage(roomId, messageId, req.user.userId, req.user.role);
  sendResponse(res, {
    httpStatusCode: httpStatus3.OK,
    success: true,
    message: "Message deleted successfully",
    data: { messageId }
  });
});
var chatController = {
  getRooms,
  createOrGetRoom: createOrGetRoom2,
  getRoomMessages: getRoomMessages2,
  postTextMessage,
  postAttachmentMessage,
  toggleMessageReaction: toggleMessageReaction2,
  createCall: createCall2,
  updateCallStatus: updateCallStatus2,
  deleteMessage: deleteMessage2
};

// src/modules/chat/chat.validation.ts
import z12 from "zod";
var toggleMessageReactionValidation = z12.object({
  params: z12.object({
    roomId: z12.string().min(1, "roomId is required"),
    messageId: z12.string().min(1, "messageId is required")
  }),
  body: z12.object({
    emoji: z12.string().trim().min(1, "Emoji is required").max(32, "Emoji is too long")
  })
});

// src/modules/chat/chat.routes.ts
var router15 = Router13();
router15.get("/rooms", checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN), chatController.getRooms);
router15.post("/rooms", checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN), chatController.createOrGetRoom);
router15.get(
  "/rooms/:roomId/messages",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  chatController.getRoomMessages
);
router15.post(
  "/rooms/:roomId/messages",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  chatController.postTextMessage
);
router15.post(
  "/rooms/:roomId/attachments",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  chatUpload.single("file"),
  chatController.postAttachmentMessage
);
router15.post(
  "/rooms/:roomId/messages/:messageId/reactions",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  validateRequest(toggleMessageReactionValidation),
  chatController.toggleMessageReaction
);
router15.post(
  "/rooms/:roomId/calls",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  chatController.createCall
);
router15.patch(
  "/calls/:callId/status",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  chatController.updateCallStatus
);
router15.delete(
  "/rooms/:roomId/messages/:messageId",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  chatController.deleteMessage
);
var chatRoutes = router15;

// src/modules/ai/ai.router.ts
import { Router as Router14 } from "express";

// src/modules/ai/ai.controller.ts
import httpStatus4 from "http-status";

// src/modules/ai/ai.service.ts
import status33 from "http-status";
var SYSTEM_PROMPT = `You are ConsultEdge AI Support for a consultation booking platform.
Your job is to help website visitors with expert discovery, consultation booking, schedules, payments, and account guidance.
Rules:
- Be concise, clear, and friendly.
- Prefer practical next steps.
- If the issue involves refunds, billing disputes, legal issues, or account security, recommend admin/human support.
- Do not invent pricing, policies, or expert availability.
- Keep responses short enough for a homepage support widget.`;
var bookingKeywords = ["book", "booking", "appointment", "consultation", "schedule", "slot"];
var paymentKeywords = ["pay", "payment", "checkout", "card", "refund", "invoice", "billing"];
var expertKeywords = ["expert", "mentor", "consultant", "specialist", "advisor"];
var technicalKeywords = ["bug", "error", "issue", "login", "otp", "password", "not working"];
var escalationKeywords = [
  "human",
  "admin",
  "agent",
  "refund",
  "charged twice",
  "billing issue",
  "legal",
  "complaint",
  "security",
  "hack",
  "urgent"
];
var includesAny = (text, keywords) => keywords.some((keyword) => text.includes(keyword));
var buildSuggestedActions = (message, context) => {
  const normalized = message.toLowerCase();
  if (context === "payment" || includesAny(normalized, paymentKeywords)) {
    return [
      "Check your payment or booking status in the dashboard",
      "Retry with a valid payment method if checkout failed",
      "Contact admin support for refund or billing review"
    ];
  }
  if (context === "expert" || includesAny(normalized, expertKeywords)) {
    return [
      "Browse verified experts by industry or skill",
      "Open an expert profile to review experience and availability",
      "Start a chat or book a consultation slot"
    ];
  }
  if (context === "technical" || includesAny(normalized, technicalKeywords)) {
    return [
      "Refresh the page and sign in again",
      "Make sure your browser allows cookies for authentication",
      "If the issue continues, contact admin support"
    ];
  }
  return [
    "Browse experts from the homepage",
    "Select a suitable slot and book a consultation",
    "Use dashboard chat for direct communication after booking"
  ];
};
var buildFallbackReply = (message, context) => {
  const normalized = message.toLowerCase();
  if (context === "payment" || includesAny(normalized, paymentKeywords)) {
    return "I can help with payment guidance. Please confirm whether your issue is checkout failure, booking not appearing, or a refund request. For billing disputes or refunds, admin support should review it directly.";
  }
  if (context === "expert" || includesAny(normalized, expertKeywords)) {
    return "You can explore verified experts, compare their profiles, and choose a matching consultation slot. If you want, ask me what kind of expert you need and I\u2019ll guide you.";
  }
  if (context === "technical" || includesAny(normalized, technicalKeywords)) {
    return "It looks like a technical or account issue. Try signing in again, refreshing the page, and checking your connection. If it still fails, please contact admin support for manual help.";
  }
  if (context === "booking" || includesAny(normalized, bookingKeywords)) {
    return "To book a consultation, choose an expert, review the available schedule, and confirm the booking from the platform. If a slot is missing, it may not be published or available yet.";
  }
  return "Hi \u2014 I can help with finding experts, booking consultations, schedules, payments, and general platform guidance. Tell me what you need, and I\u2019ll guide you step by step.";
};
var shouldEscalateToHuman = (message) => {
  const normalized = message.toLowerCase();
  return includesAny(normalized, escalationKeywords);
};
var buildMessages = (payload) => {
  const history = (payload.history ?? []).map((item) => ({
    role: item.role,
    content: item.content
  }));
  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    {
      role: "user",
      content: payload.context ? `Context: ${payload.context}
User message: ${payload.message}` : payload.message
    }
  ];
};
var generateOpenAIReply = async (payload) => {
  if (!envVars.OPENAI_API_KEY) {
    return null;
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${envVars.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: envVars.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 300,
      messages: buildMessages(payload)
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
};
var askSupport = async (payload) => {
  const message = payload.message?.trim();
  if (!message) {
    throw new AppError_default(status33.BAD_REQUEST, "Message is required");
  }
  const suggestedActions = buildSuggestedActions(message, payload.context);
  const escalatedToHuman = shouldEscalateToHuman(message);
  try {
    const aiReply = await generateOpenAIReply({ ...payload, message });
    const reply = aiReply || buildFallbackReply(message, payload.context);
    return {
      reply,
      suggestedActions,
      escalatedToHuman,
      provider: aiReply ? "openai" : "fallback",
      model: aiReply ? envVars.OPENAI_MODEL || "gpt-4o-mini" : "rule-based-support",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error) {
    console.error("AI support error:", error);
    return {
      reply: buildFallbackReply(message, payload.context),
      suggestedActions,
      escalatedToHuman,
      provider: "fallback",
      model: "rule-based-support",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};
var aiService = {
  askSupport
};

// src/modules/ai/ai.controller.ts
var askSupport2 = catchAsync(async (req, res) => {
  const result = await aiService.askSupport(req.body);
  sendResponse(res, {
    httpStatusCode: httpStatus4.OK,
    success: true,
    message: "AI support response generated successfully",
    data: result
  });
});
var aiController = {
  askSupport: askSupport2
};

// src/modules/ai/utils/aiProvider.ts
import status34 from "http-status";
var resolveProvider = () => {
  const explicit = envVars.AI_PROVIDER;
  if (explicit === "openai" && envVars.OPENAI_API_KEY) return "openai";
  if (explicit === "gemini" && envVars.GEMINI_API_KEY) return "gemini";
  if (envVars.OPENAI_API_KEY) return "openai";
  if (envVars.GEMINI_API_KEY) return "gemini";
  throw new AppError_default(
    status34.SERVICE_UNAVAILABLE,
    "No AI provider configured. Set AI_PROVIDER and the corresponding API key."
  );
};
var callOpenAI = async (opts) => {
  if (!envVars.OPENAI_API_KEY) {
    throw new AppError_default(status34.SERVICE_UNAVAILABLE, "OPENAI_API_KEY missing");
  }
  const model = envVars.OPENAI_MODEL || "gpt-4o-mini";
  const startedAt2 = Date.now();
  const body = {
    model,
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 600,
    messages: opts.messages.map((m) => ({ role: m.role, content: m.content }))
  };
  if (opts.jsonMode) {
    body.response_format = { type: "json_object" };
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${envVars.OPENAI_API_KEY}`
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new AppError_default(
      status34.BAD_GATEWAY,
      `OpenAI request failed: ${response.status} ${errText.slice(0, 300)}`
    );
  }
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  return {
    text,
    model,
    provider: "openai",
    tokensUsed: data.usage?.total_tokens ?? 0,
    latencyMs: Date.now() - startedAt2,
    raw: data
  };
};
var callGemini = async (opts) => {
  if (!envVars.GEMINI_API_KEY) {
    throw new AppError_default(status34.SERVICE_UNAVAILABLE, "GEMINI_API_KEY missing");
  }
  const model = envVars.GEMINI_MODEL || "gemini-2.0-flash";
  const startedAt2 = Date.now();
  const systemMessages = opts.messages.filter((m) => m.role === "system");
  const turnMessages = opts.messages.filter((m) => m.role !== "system");
  const body = {
    contents: turnMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    })),
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      maxOutputTokens: opts.maxTokens ?? 600,
      ...opts.jsonMode ? { responseMimeType: "application/json" } : {}
    }
  };
  if (systemMessages.length > 0) {
    body.systemInstruction = {
      role: "system",
      parts: [{ text: systemMessages.map((m) => m.content).join("\n\n") }]
    };
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(envVars.GEMINI_API_KEY)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new AppError_default(
      status34.BAD_GATEWAY,
      `Gemini request failed: ${response.status} ${errText.slice(0, 300)}`
    );
  }
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";
  return {
    text,
    model,
    provider: "gemini",
    tokensUsed: data.usageMetadata?.totalTokenCount ?? 0,
    latencyMs: Date.now() - startedAt2,
    raw: data
  };
};
var aiProvider = {
  /** Generate a chat completion using the configured provider, with one fallback. */
  async generate(opts) {
    const primary = resolveProvider();
    const hasOpenAI = !!envVars.OPENAI_API_KEY;
    const hasGemini = !!envVars.GEMINI_API_KEY;
    const fallback = primary === "gemini" && hasOpenAI ? "openai" : primary === "openai" && hasGemini ? "gemini" : null;
    try {
      return primary === "openai" ? await callOpenAI(opts) : await callGemini(opts);
    } catch (err) {
      if (!fallback) throw err;
      console.warn(
        `[ai] primary provider "${primary}" failed; retrying with "${fallback}"`,
        err instanceof Error ? err.message : err
      );
      return fallback === "openai" ? callOpenAI(opts) : callGemini(opts);
    }
  },
  /**
   * Generate and parse JSON output. Falls back to wrapping plain text if the
   * provider returns a non-JSON response.
   */
  async generateJSON(opts) {
    const result = await this.generate({ ...opts, jsonMode: true });
    let parsed = null;
    try {
      const cleaned = result.text.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = null;
    }
    return { data: parsed, meta: result };
  },
  getActiveProvider: resolveProvider,
  /** Non-throwing introspection of which providers have keys configured. */
  getConfiguredProviders() {
    const list = [];
    if (envVars.OPENAI_API_KEY) list.push("openai");
    if (envVars.GEMINI_API_KEY) list.push("gemini");
    return list;
  },
  /** Lightweight reachability probe used by GET /ai/health. */
  async ping() {
    const configured = this.getConfiguredProviders();
    if (configured.length === 0) {
      return { provider: "none", status: "unconfigured", latencyMs: 0 };
    }
    const startedAt2 = Date.now();
    try {
      const result = await this.generate({
        messages: [
          { role: "system", content: "You are a health probe. Reply with the single word: ok." },
          { role: "user", content: "ping" }
        ],
        temperature: 0,
        maxTokens: 5
      });
      return {
        provider: result.provider,
        status: "ok",
        latencyMs: Date.now() - startedAt2,
        model: result.model
      };
    } catch (err) {
      return {
        provider: configured[0],
        status: "down",
        latencyMs: Date.now() - startedAt2,
        error: err instanceof Error ? err.message : "unknown error"
      };
    }
  }
};

// src/modules/ai/prompts/summaryPrompt.ts
var summaryPrompt = (input) => `
You are a professional consulting analyst at ConsultEdge.
Summarize the following text for a ${input.audience || "business"} audience.
Return JSON with this exact shape:
{
  "summary": string,        // 3-5 sentence executive summary
  "keyPoints": string[],    // 3-7 bullet points
  "actionItems": string[]   // 2-5 concrete next steps
}
Text:
"""${input.text}"""
`.trim();

// src/modules/ai/prompts/chatPrompt.ts
var CHAT_SYSTEM_PROMPT = `You are ConsultEdge AI Assistant.
You help users discover experts, plan consultations, and understand the platform.
Rules:
- Be concise, friendly, and practical.
- Never invent expert names, prices, or availability.
- For refunds, billing disputes, or account security, recommend admin/human support.
- Keep replies suitable for a chat widget (1-4 short paragraphs).`;
var buildChatMessages = (input) => {
  const history = (input.history ?? []).map((h) => ({ role: h.role, content: h.content }));
  return [
    { role: "system", content: CHAT_SYSTEM_PROMPT },
    ...history,
    {
      role: "user",
      content: input.context ? `Context: ${input.context}
User message: ${input.message}` : input.message
    }
  ];
};

// src/modules/ai/prompts/documentAnalysisPrompt.ts
var documentAnalysisPrompt = (input) => `
You are a senior consulting analyst.
Analyze the following document${input.objective ? ` with this objective: ${input.objective}` : ""}.

Document:
"""${input.text}"""

Return JSON with this exact shape:
{
  "summary": string,
  "topics": string[],
  "entities": { "people": string[], "organizations": string[], "locations": string[] },
  "risks": string[],
  "opportunities": string[],
  "recommendedExperts": string[]   // industry/expertise tags only, not names
}
Rules:
- Be factual; do not invent entities not present in the document.
- Each list has 0-7 items.
`.trim();

// src/modules/ai/utils/sanitize.ts
var CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
var INJECTION_PATTERNS = [
  /ignore (all|previous|above) (instructions|prompts)/gi,
  /you are now/gi,
  /system prompt:/gi
];
var sanitizeText = (input, maxLength = 8e3) => {
  if (typeof input !== "string") return "";
  let text = input.replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim();
  for (const pattern of INJECTION_PATTERNS) {
    text = text.replace(pattern, "[filtered]");
  }
  if (text.length > maxLength) text = text.slice(0, maxLength);
  return text;
};
var sanitizeObject = (obj) => {
  const out = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === "string") {
      out[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      out[key] = value.map(
        (v) => typeof v === "string" ? sanitizeText(v) : v && typeof v === "object" ? sanitizeObject(v) : v
      );
    } else if (value && typeof value === "object") {
      out[key] = sanitizeObject(value);
    } else {
      out[key] = value;
    }
  }
  return out;
};

// src/modules/ai/services/aiAdvanced.service.ts
var normalizeList = (items) => {
  if (!Array.isArray(items)) return [];
  return Array.from(
    new Set(
      items.map((item) => sanitizeText(item, 140).trim()).filter((item) => item.length > 0)
    )
  );
};
var normalizeTerm = (value) => value.trim().toLowerCase();
var getWeekStartUtc = () => {
  const now = /* @__PURE__ */ new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
};
var roundScore = (value) => Math.round(Math.max(0, Math.min(100, value)) * 100) / 100;
var buildEmptyStateFallback = (mode, context) => {
  const personalizedReason = context.exploredIndustries[0] ? `Why: Because you explored ${context.exploredIndustries[0]}` : context.viewedExperts[0] ? `Why: Because you viewed ${context.viewedExperts[0]}` : context.searchHistory[0] ? `Why: Because you searched "${context.searchHistory[0]}"` : context.clickedCategories[0] ? `Why: Because you clicked on ${context.clickedCategories[0]}` : "Why: Because you interacted with similar experts";
  return [
    {
      name: "ConsultEdge Growth Advisor",
      title: "Startup Growth Consultant",
      specialization: "Go-to-market and growth strategy",
      description: "Helps early-stage teams shape positioning, channel strategy, and execution plans.",
      experienceYears: 10,
      fee: 120,
      whyReason: mode === "cold-start" ? "Why: Popular among new users" : personalizedReason,
      rankingScore: 86
    },
    {
      name: "ConsultEdge Finance Mentor",
      title: "Finance and Fundraising Specialist",
      specialization: "Fundraising readiness and financial planning",
      description: "Supports founders with investor narratives, runway planning, and capital strategy.",
      experienceYears: 12,
      fee: 140,
      whyReason: mode === "cold-start" ? "Why: Verified specialist" : personalizedReason,
      rankingScore: 82
    },
    {
      name: "ConsultEdge Product Strategist",
      title: "Product and Customer Strategy Expert",
      specialization: "Product-market fit and retention",
      description: "Works with teams to improve customer journeys, retention, and product prioritization.",
      experienceYears: 9,
      fee: 110,
      whyReason: mode === "cold-start" ? "Why: Trending this week" : personalizedReason,
      rankingScore: 79
    }
  ];
};
var buildColdStartReason = (expert) => {
  if (expert.weeklyBookings >= 2) return "Why: Frequently booked by founders";
  if (expert.averageRating >= 4.5) return "Why: High success rate";
  if (expert.isVerified) return "Why: Verified specialist";
  if (expert.totalBookings >= 5) return "Why: Trending this week";
  return "Why: Popular among new users";
};
var buildPersonalizedReason = (expert, context) => {
  const normalizedIndustry = normalizeTerm(expert.industry);
  const explored = context.exploredIndustries.find(
    (industry) => normalizeTerm(industry) === normalizedIndustry
  );
  if (explored) return `Why: Because you explored ${explored}`;
  const viewed = context.viewedExperts.find((item) => {
    const token = normalizeTerm(item);
    return token === normalizeTerm(expert.id) || token === normalizeTerm(expert.name);
  });
  if (viewed) return `Why: Because you viewed ${viewed}`;
  const haystack = `${expert.title} ${expert.description} ${expert.industry}`.toLowerCase();
  const searchedKeyword = context.searchHistory.find(
    (keyword) => haystack.includes(normalizeTerm(keyword))
  );
  if (searchedKeyword) return `Why: Because you searched "${searchedKeyword}"`;
  const clickedCategory = context.clickedCategories.find(
    (category) => haystack.includes(normalizeTerm(category))
  );
  if (clickedCategory) return `Why: Because you clicked on ${clickedCategory}`;
  if (context.viewedIndustrySet.has(normalizedIndustry)) {
    return "Why: Because you interacted with similar experts";
  }
  return "Why: Because you interacted with similar experts";
};
var fetchExpertCandidates = async () => {
  const weekStart = getWeekStartUtc();
  const [experts, ratings, weeklyBookings, totalBookings] = await Promise.all([
    prisma.expert.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        fullName: true,
        title: true,
        bio: true,
        experience: true,
        consultationFee: true,
        isVerified: true,
        industry: { select: { name: true } }
      },
      orderBy: [{ isVerified: "desc" }, { updatedAt: "desc" }],
      take: 120
    }),
    prisma.testimonial.groupBy({
      by: ["expertId"],
      where: { status: ReviewStatus.APPROVED },
      _avg: { rating: true },
      _count: { _all: true }
    }),
    prisma.consultation.groupBy({
      by: ["expertId"],
      where: {
        expertId: { not: null },
        createdAt: { gte: weekStart }
      },
      _count: { _all: true }
    }),
    prisma.consultation.groupBy({
      by: ["expertId"],
      where: { expertId: { not: null } },
      _count: { _all: true }
    })
  ]);
  const ratingMap = new Map(
    ratings.map((item) => [
      item.expertId,
      {
        avg: item._avg.rating ?? 0,
        count: item._count._all
      }
    ])
  );
  const weeklyBookingMap = new Map(
    weeklyBookings.filter((item) => !!item.expertId).map((item) => [item.expertId, item._count._all])
  );
  const totalBookingMap = new Map(
    totalBookings.filter((item) => !!item.expertId).map((item) => [item.expertId, item._count._all])
  );
  return experts.map((expert) => {
    const ratingStats = ratingMap.get(expert.id);
    return {
      id: expert.id,
      name: expert.fullName,
      title: expert.title?.trim() || "Business Consultant",
      industry: expert.industry.name,
      description: expert.bio?.trim() || `${expert.fullName} advises teams on ${expert.industry.name.toLowerCase()} priorities.`,
      experienceYears: Math.max(0, expert.experience ?? 0),
      fee: Math.max(0, expert.consultationFee ?? 0),
      isVerified: expert.isVerified,
      averageRating: ratingStats?.avg ?? 0,
      reviewCount: ratingStats?.count ?? 0,
      weeklyBookings: weeklyBookingMap.get(expert.id) ?? 0,
      totalBookings: totalBookingMap.get(expert.id) ?? 0
    };
  });
};
var recommendations = async (input) => {
  try {
    const viewedExperts = normalizeList(input.viewedExperts);
    const exploredIndustries = normalizeList(input.exploredIndustries);
    const searchHistory = normalizeList(input.searchHistory);
    const clickedCategories = normalizeList(input.clickedCategories);
    const activityCount = viewedExperts.length + exploredIndustries.length + searchHistory.length + clickedCategories.length;
    const mode = activityCount === 0 ? "cold-start" : "personalized";
    const candidates = await fetchExpertCandidates();
    if (candidates.length === 0) {
      return {
        data: {
          mode,
          activityCount,
          experts: buildEmptyStateFallback(mode, {
            exploredIndustries,
            viewedExperts,
            searchHistory,
            clickedCategories
          })
        },
        meta: {
          model: "heuristic",
          provider: "fallback",
          tokensUsed: 0,
          latencyMs: 0
        }
      };
    }
    const viewedTokenSet = new Set(viewedExperts.map(normalizeTerm));
    const exploredIndustrySet = new Set(exploredIndustries.map(normalizeTerm));
    const searchTokens = new Set(
      searchHistory.flatMap((query2) => query2.split(/\s+/)).map(normalizeTerm).filter((token) => token.length > 1)
    );
    const clickedCategorySet = new Set(clickedCategories.map(normalizeTerm));
    const viewedMatches = candidates.filter((candidate) => {
      const byId = viewedTokenSet.has(normalizeTerm(candidate.id));
      const byName = viewedTokenSet.has(normalizeTerm(candidate.name));
      return byId || byName;
    });
    const viewedIndustrySet = new Set(viewedMatches.map((item) => normalizeTerm(item.industry)));
    const scored = candidates.map((candidate) => {
      let score = 35;
      if (candidate.isVerified) score += 10;
      if (candidate.averageRating >= 4.7) score += 8;
      else if (candidate.averageRating >= 4.3) score += 5;
      if (candidate.weeklyBookings >= 4) score += 12;
      else if (candidate.weeklyBookings >= 2) score += 8;
      else if (candidate.weeklyBookings >= 1) score += 4;
      score += Math.min(10, candidate.totalBookings * 0.6);
      if (mode === "personalized") {
        const candidateIndustry = normalizeTerm(candidate.industry);
        const haystack = `${candidate.name} ${candidate.title} ${candidate.description} ${candidate.industry}`.toLowerCase();
        const sameIndustry = exploredIndustrySet.has(candidateIndustry);
        if (sameIndustry) score += 24;
        const viewedThisExpert = viewedTokenSet.has(normalizeTerm(candidate.id)) || viewedTokenSet.has(normalizeTerm(candidate.name));
        if (viewedThisExpert) score += 18;
        else if (viewedIndustrySet.has(candidateIndustry)) score += 14;
        const matchedSearch = Array.from(searchTokens).some(
          (token) => token.length > 1 && haystack.includes(token)
        );
        if (matchedSearch) score += 14;
        const matchedCategory = Array.from(clickedCategorySet).some(
          (category) => category.length > 1 && haystack.includes(category)
        );
        if (matchedCategory) score += 12;
      }
      const whyReason = mode === "cold-start" ? buildColdStartReason(candidate) : buildPersonalizedReason(candidate, {
        exploredIndustries,
        viewedExperts,
        searchHistory,
        clickedCategories,
        viewedIndustrySet
      });
      return {
        name: candidate.name,
        title: candidate.title,
        specialization: candidate.industry,
        description: candidate.description,
        experienceYears: candidate.experienceYears,
        fee: candidate.fee,
        whyReason,
        rankingScore: roundScore(score)
      };
    }).sort((a, b) => b.rankingScore - a.rankingScore).slice(0, 8);
    return {
      data: {
        mode,
        activityCount,
        experts: scored.length > 0 ? scored : buildEmptyStateFallback(mode, {
          exploredIndustries,
          viewedExperts,
          searchHistory,
          clickedCategories
        })
      },
      meta: {
        model: "heuristic",
        provider: "fallback",
        tokensUsed: 0,
        latencyMs: 0
      }
    };
  } catch {
    const viewedExperts = normalizeList(input.viewedExperts);
    const exploredIndustries = normalizeList(input.exploredIndustries);
    const searchHistory = normalizeList(input.searchHistory);
    const clickedCategories = normalizeList(input.clickedCategories);
    const activityCount = viewedExperts.length + exploredIndustries.length + searchHistory.length + clickedCategories.length;
    const mode = activityCount === 0 ? "cold-start" : "personalized";
    return {
      data: {
        mode,
        activityCount,
        experts: buildEmptyStateFallback(mode, {
          exploredIndustries,
          viewedExperts,
          searchHistory,
          clickedCategories
        })
      },
      meta: { model: "heuristic", provider: "fallback", tokensUsed: 0, latencyMs: 0 }
    };
  }
};
var ensureIndustryArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => sanitizeText(item, 80)).map((item) => item.trim()).filter((item) => item.length > 0).slice(0, 8);
};
var ensureTaglineLength = (value) => {
  const cleaned = sanitizeText(value, 120);
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 5 && words.length <= 7) return words.join(" ");
  return words.slice(0, 7).join(" ") || "Optimize every customer moment better";
};
var buildIndustryFallback = (industryName) => ({
  industryName,
  industryDescription: `${industryName} focuses on designing, measuring, and continuously improving the end-to-end customer journey across channels. It blends service operations, experience strategy, and performance analytics to raise satisfaction, loyalty, and growth.`,
  idealExpertTypes: [
    "Customer experience strategists",
    "Service design and operations consultants",
    "Contact center transformation leaders",
    "Customer success and retention specialists"
  ],
  commonUseCases: [
    "Improve customer satisfaction and retention",
    "Redesign support workflows and SLAs",
    "Scale omnichannel service operations",
    "Reduce churn through journey optimization"
  ],
  shortTagline: "Elevate service quality at scale"
});
var industryCreation = async (input) => {
  const industryName = sanitizeText(input.industryName, 100).trim() || "General Industry";
  try {
    const { data, meta } = await aiProvider.generateJSON({
      messages: [
        {
          role: "system",
          content: "You are the ConsultEdge admin industry content generator. Return strict JSON only."
        },
        {
          role: "user",
          content: [
            "Generate a premium SaaS-grade industry profile.",
            "Output JSON shape:",
            '{ "industryName": string, "industryDescription": string, "idealExpertTypes": string[], "commonUseCases": string[], "shortTagline": string }',
            "Rules:",
            "- industryDescription must be 2-3 concise lines.",
            "- idealExpertTypes and commonUseCases must never be empty.",
            "- shortTagline must be 5-7 words.",
            `Industry name: ${industryName}`
          ].join("\n")
        }
      ],
      temperature: 0.4,
      maxTokens: 550
    });
    if (!data) {
      return {
        data: buildIndustryFallback(industryName),
        meta: {
          model: meta.model,
          provider: meta.provider,
          tokensUsed: meta.tokensUsed,
          latencyMs: meta.latencyMs
        }
      };
    }
    const safe = {
      industryName: sanitizeText(data.industryName, 100).trim() || industryName,
      industryDescription: sanitizeText(data.industryDescription, 500).trim() || buildIndustryFallback(industryName).industryDescription,
      idealExpertTypes: ensureIndustryArray(data.idealExpertTypes),
      commonUseCases: ensureIndustryArray(data.commonUseCases),
      shortTagline: ensureTaglineLength(data.shortTagline || "")
    };
    if (safe.idealExpertTypes.length === 0 || safe.commonUseCases.length === 0) {
      const fallback = buildIndustryFallback(industryName);
      safe.idealExpertTypes = fallback.idealExpertTypes;
      safe.commonUseCases = fallback.commonUseCases;
    }
    return {
      data: safe,
      meta: {
        model: meta.model,
        provider: meta.provider,
        tokensUsed: meta.tokensUsed,
        latencyMs: meta.latencyMs
      }
    };
  } catch {
    return {
      data: buildIndustryFallback(industryName),
      meta: {
        model: "heuristic",
        provider: "fallback",
        tokensUsed: 0,
        latencyMs: 0
      }
    };
  }
};
var tokenize = (text) => sanitizeText(text, 500).toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 1);
var uniqueStrings = (items, max = 100) => Array.from(new Set(items.map((item) => sanitizeText(item, 160).trim()).filter(Boolean))).slice(0, max);
var clamp01 = (value) => Math.max(0, Math.min(1, value));
var countTokenMatches = (tokens, haystack) => tokens.reduce((sum, token) => haystack.includes(token) ? sum + 1 : sum, 0);
var mapPopularityBoost = (popularity) => Math.min(0.2, popularity * 0.02);
var buildRecentSearches = (query2, history) => {
  const cleanedQuery = sanitizeText(query2, 200).trim();
  const deduped = [cleanedQuery, ...history.filter((item) => item.toLowerCase() !== cleanedQuery.toLowerCase())];
  return uniqueStrings(deduped, 5);
};
var snippet = (text, max = 160) => {
  const clean = sanitizeText(text, 1e3).trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 3)}...`;
};
var normalizeActivity = (activity) => ({
  viewedExperts: uniqueStrings(activity?.viewedExperts ?? [], 100),
  exploredIndustries: uniqueStrings(activity?.exploredIndustries ?? [], 100),
  searchHistory: uniqueStrings(activity?.searchHistory ?? [], 100),
  clickedCategories: uniqueStrings(activity?.clickedCategories ?? [], 100)
});
var aggregateFrequency = (items) => {
  const map = /* @__PURE__ */ new Map();
  for (const item of items) {
    const key = item.toLowerCase();
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
};
var fetchUniversalSearchData = async (input) => {
  const [bookingCounts, dbExperts, dbIndustries, dbTestimonials] = await Promise.all([
    prisma.consultation.groupBy({
      by: ["expertId"],
      where: { expertId: { not: null } },
      _count: { _all: true }
    }),
    prisma.expert.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        fullName: true,
        title: true,
        bio: true,
        industry: { select: { name: true } }
      },
      take: 300
    }),
    prisma.industry.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true, description: true },
      take: 300
    }),
    prisma.testimonial.findMany({
      where: { status: ReviewStatus.APPROVED, comment: { not: null } },
      select: {
        id: true,
        comment: true,
        expert: { select: { fullName: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 500
    })
  ]);
  const bookingMap = new Map(
    bookingCounts.filter((item) => !!item.expertId).map((item) => [item.expertId, item._count._all])
  );
  const sourceExperts = [
    ...dbExperts.map((expert) => ({
      id: expert.id,
      name: expert.fullName,
      title: expert.title?.trim() || "Consulting Expert",
      specialization: expert.industry.name,
      industry: expert.industry.name,
      tags: uniqueStrings([expert.title ?? "", expert.industry.name]),
      description: expert.bio?.trim() || `${expert.fullName} advises teams in ${expert.industry.name.toLowerCase()}.`,
      popularity: bookingMap.get(expert.id) ?? 0
    })),
    ...(input.db?.experts ?? []).map((expert) => ({
      id: sanitizeText(expert.id, 80).trim(),
      name: sanitizeText(expert.name, 200).trim(),
      title: sanitizeText(expert.title ?? "Consulting Expert", 120).trim() || "Consulting Expert",
      specialization: sanitizeText(expert.specialization ?? expert.industry ?? "General Consulting", 120).trim() || "General Consulting",
      industry: sanitizeText(expert.industry ?? "General", 120).trim() || "General",
      tags: uniqueStrings([...expert.tags ?? [], ...expert.expertise ?? []], 12),
      description: sanitizeText(expert.description ?? expert.bio ?? "", 600).trim(),
      popularity: 0
    })) ?? []
  ].filter((expert) => expert.id && expert.name);
  const sourceIndustries = [
    ...dbIndustries.map((industry) => ({
      id: industry.id,
      industryName: industry.name,
      description: industry.description?.trim() || `${industry.name} consulting and strategic advisory.`,
      keywords: uniqueStrings([industry.name, ...industry.description ? tokenize(industry.description).slice(0, 8) : []])
    })),
    ...(input.db?.industries ?? []).map((industry) => ({
      id: sanitizeText(industry.id ?? industry.name ?? industry.industryName ?? "", 80).trim(),
      industryName: sanitizeText(industry.industryName ?? industry.name ?? "", 120).trim() || "General",
      description: sanitizeText(industry.description ?? "", 600).trim(),
      keywords: uniqueStrings(industry.keywords ?? [], 20)
    })) ?? []
  ].filter((industry) => industry.id && industry.industryName);
  const sourceTestimonials = [
    ...dbTestimonials.map((testimonial) => ({
      id: testimonial.id,
      expertName: testimonial.expert.fullName,
      content: testimonial.comment?.trim() ?? "",
      popularity: 1
    })),
    ...(input.db?.testimonials ?? []).map((testimonial) => ({
      id: sanitizeText(testimonial.id ?? "", 80).trim(),
      expertName: sanitizeText(testimonial.expertName ?? "", 200).trim(),
      content: sanitizeText(testimonial.content ?? testimonial.comment ?? "", 1200).trim(),
      popularity: 0
    })) ?? []
  ].filter((testimonial) => testimonial.id && testimonial.expertName && testimonial.content);
  return {
    experts: sourceExperts,
    industries: sourceIndustries,
    testimonials: sourceTestimonials,
    bookingMap
  };
};
var generateAISuggestions = (input) => {
  const intent = sanitizeText(input.query, 120).trim();
  const pool = uniqueStrings(
    [
      `${intent} strategy for founders`,
      input.topIndustries[0] ? `${intent} in ${input.topIndustries[0]}` : "",
      input.topExpertSkills[0] ? `${intent} with ${input.topExpertSkills[0]} experts` : "",
      input.trendingTitles[0] ? `${input.trendingTitles[0]} playbook` : "",
      input.topIndustries[1] ? `${intent} roadmap for ${input.topIndustries[1]}` : "",
      input.topExpertSkills[1] ? `How to execute ${intent} with ${input.topExpertSkills[1]}` : ""
    ],
    5
  );
  return pool.slice(0, 5);
};
var search = async (input) => {
  try {
    const query2 = sanitizeText(input.query, 500).trim();
    const queryTokens = tokenize(query2);
    const activity = normalizeActivity(input.userActivity);
    const viewedFreq = aggregateFrequency(activity.viewedExperts);
    const exploredIndustryFreq = aggregateFrequency(activity.exploredIndustries);
    const clickedCategoryFreq = aggregateFrequency(activity.clickedCategories);
    const sources = await fetchUniversalSearchData(input);
    const experts = sources.experts.map((expert) => {
      const haystack = [
        expert.name,
        expert.title,
        expert.specialization,
        expert.industry,
        expert.tags.join(" "),
        expert.description
      ].join(" ").toLowerCase();
      const textScore = queryTokens.length === 0 ? 0 : countTokenMatches(queryTokens, haystack) / queryTokens.length;
      const viewedBoost = (viewedFreq.get(expert.name.toLowerCase()) ?? 0) > 0 || (viewedFreq.get(expert.id.toLowerCase()) ?? 0) > 0 ? 0.12 : 0;
      const industryBoost = (exploredIndustryFreq.get(expert.industry.toLowerCase()) ?? 0) > 0 ? 0.1 : 0;
      const categoryBoost = (clickedCategoryFreq.get(expert.specialization.toLowerCase()) ?? 0) > 0 ? 0.08 : 0;
      const popularityBoost = mapPopularityBoost(expert.popularity);
      const finalScore = clamp01(textScore * 0.65 + viewedBoost + industryBoost + categoryBoost + popularityBoost);
      return {
        type: "expert",
        id: expert.id,
        name: expert.name,
        title: expert.title,
        specialization: expert.specialization,
        industry: expert.industry,
        matchScore: Math.round(finalScore * 1e3) / 1e3
      };
    }).filter((item) => item.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore).slice(0, 12);
    const industries = sources.industries.map((industry) => {
      const haystack = `${industry.industryName} ${industry.description} ${industry.keywords.join(" ")}`.toLowerCase();
      const textScore = queryTokens.length === 0 ? 0 : countTokenMatches(queryTokens, haystack) / queryTokens.length;
      const activityBoost = (exploredIndustryFreq.get(industry.industryName.toLowerCase()) ?? 0) > 0 ? 0.15 : 0;
      const finalScore = clamp01(textScore * 0.8 + activityBoost);
      return {
        type: "industry",
        id: industry.id,
        industryName: industry.industryName,
        description: snippet(industry.description, 180),
        matchScore: Math.round(finalScore * 1e3) / 1e3
      };
    }).filter((item) => item.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
    const testimonials = sources.testimonials.map((testimonial) => {
      const haystack = `${testimonial.expertName} ${testimonial.content}`.toLowerCase();
      const textScore = queryTokens.length === 0 ? 0 : countTokenMatches(queryTokens, haystack) / queryTokens.length;
      const finalScore = clamp01(textScore * 0.9 + mapPopularityBoost(testimonial.popularity));
      return {
        type: "testimonial",
        id: testimonial.id,
        expertName: testimonial.expertName,
        contentSnippet: snippet(testimonial.content),
        matchScore: Math.round(finalScore * 1e3) / 1e3
      };
    }).filter((item) => item.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
    const mostBookedExperts = sources.experts.map((expert) => ({
      title: expert.name,
      category: "most-booked-experts",
      reason: `Booked ${expert.popularity} consultations`,
      score: expert.popularity
    })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
    const mostSearched = Array.from(aggregateFrequency(activity.searchHistory).entries()).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([title, count]) => ({
      title,
      category: "most-searched-queries",
      reason: `Searched ${count} time${count > 1 ? "s" : ""}`,
      score: count
    }));
    const mostViewed = Array.from(viewedFreq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([title, count]) => ({
      title,
      category: "most-viewed-experts",
      reason: `Viewed ${count} time${count > 1 ? "s" : ""}`,
      score: count
    }));
    const mostExploredIndustries = Array.from(exploredIndustryFreq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([title, count]) => ({
      title,
      category: "most-explored-industries",
      reason: `Explored ${count} time${count > 1 ? "s" : ""}`,
      score: count
    }));
    const incomingTrending = (input.db?.trending ?? []).map((item) => ({
      title: sanitizeText(item.title ?? "", 120).trim(),
      category: sanitizeText(item.category ?? "trending", 80).trim() || "trending",
      reason: sanitizeText(item.reason ?? "Popular this week", 200).trim() || "Popular this week",
      score: 1
    })).filter((item) => item.title);
    const trending = [
      ...incomingTrending,
      ...mostSearched,
      ...mostViewed,
      ...mostExploredIndustries,
      ...mostBookedExperts
    ].sort((a, b) => b.score - a.score).slice(0, 8).map((item) => ({
      type: "trending",
      title: item.title,
      category: item.category,
      reason: item.reason
    }));
    const topExpertScore = experts[0]?.matchScore ?? 0;
    const topIndustryScore = industries[0]?.matchScore ?? 0;
    const weakResults = experts.length + industries.length + testimonials.length < 4 || Math.max(topExpertScore, topIndustryScore) < 0.45;
    const aiSuggestions = weakResults ? generateAISuggestions({
      query: query2,
      topIndustries: industries.map((item) => item.industryName),
      topExpertSkills: experts.map((item) => item.specialization),
      trendingTitles: trending.map((item) => item.title)
    }) : [];
    const recentSearches = buildRecentSearches(query2, activity.searchHistory);
    return {
      data: {
        experts,
        industries,
        testimonials,
        trending,
        aiSuggestions,
        recentSearches
      },
      meta: {
        model: "heuristic",
        provider: "fallback",
        tokensUsed: 0,
        latencyMs: 0
      }
    };
  } catch {
    const activity = normalizeActivity(input.userActivity);
    const query2 = sanitizeText(input.query, 500).trim();
    const fallbackExperts = (input.db?.experts ?? []).map((expert) => ({
      type: "expert",
      id: sanitizeText(expert.id, 80).trim(),
      name: sanitizeText(expert.name, 200).trim(),
      title: sanitizeText(expert.title ?? "Consulting Expert", 120).trim() || "Consulting Expert",
      specialization: sanitizeText(expert.specialization ?? expert.industry ?? "General Consulting", 120).trim() || "General Consulting",
      industry: sanitizeText(expert.industry ?? "General", 120).trim() || "General",
      matchScore: 0.3
    })).filter((item) => item.id && item.name).slice(0, 5);
    const fallbackIndustries = (input.db?.industries ?? []).map((industry) => ({
      type: "industry",
      id: sanitizeText(industry.id ?? industry.name ?? industry.industryName ?? "", 80).trim(),
      industryName: sanitizeText(industry.industryName ?? industry.name ?? "", 120).trim() || "General",
      description: snippet(industry.description ?? "", 180),
      matchScore: 0.3
    })).filter((item) => item.id && item.industryName).slice(0, 5);
    const fallbackTestimonials = (input.db?.testimonials ?? []).map((testimonial) => ({
      type: "testimonial",
      id: sanitizeText(testimonial.id ?? "", 80).trim(),
      expertName: sanitizeText(testimonial.expertName ?? "", 200).trim(),
      contentSnippet: snippet(testimonial.content ?? testimonial.comment ?? ""),
      matchScore: 0.25
    })).filter((item) => item.id && item.expertName && item.contentSnippet).slice(0, 5);
    const fallbackTrending = (input.db?.trending ?? []).map((item) => ({
      type: "trending",
      title: sanitizeText(item.title ?? "", 120).trim(),
      category: sanitizeText(item.category ?? "trending", 80).trim() || "trending",
      reason: sanitizeText(item.reason ?? "Popular this week", 200).trim() || "Popular this week"
    })).filter((item) => item.title).slice(0, 5);
    return {
      data: {
        experts: fallbackExperts,
        industries: fallbackIndustries,
        testimonials: fallbackTestimonials,
        trending: fallbackTrending,
        aiSuggestions: generateAISuggestions({
          query: query2,
          topIndustries: fallbackIndustries.map((item) => item.industryName),
          topExpertSkills: fallbackExperts.map((item) => item.specialization),
          trendingTitles: fallbackTrending.map((item) => item.title)
        }),
        recentSearches: buildRecentSearches(query2, activity.searchHistory)
      },
      meta: { model: "heuristic", provider: "fallback", tokensUsed: 0, latencyMs: 0 }
    };
  }
};
var summary = async (input) => {
  const { data, meta } = await aiProvider.generateJSON({
    messages: [
      { role: "system", content: "You are a consulting analyst. Always return strict JSON." },
      { role: "user", content: summaryPrompt(input) }
    ],
    temperature: 0.3,
    maxTokens: 700
  });
  const safe = {
    summary: data?.summary ?? input.text.slice(0, 280),
    keyPoints: data?.keyPoints ?? [],
    actionItems: data?.actionItems ?? []
  };
  return {
    data: safe,
    meta: {
      model: meta.model,
      provider: meta.provider,
      tokensUsed: meta.tokensUsed,
      latencyMs: meta.latencyMs
    }
  };
};
var chat = async (input) => {
  const messages = buildChatMessages(input);
  const result = await aiProvider.generate({
    messages,
    temperature: 0.5,
    maxTokens: 500
  });
  return {
    data: { reply: result.text || "I'm here to help. Could you share a bit more detail?" },
    meta: {
      model: result.model,
      provider: result.provider,
      tokensUsed: result.tokensUsed,
      latencyMs: result.latencyMs
    }
  };
};
var documentAnalysis = async (input) => {
  const cleanText = sanitizeText(input.text, 16e3);
  const { data, meta } = await aiProvider.generateJSON({
    messages: [
      { role: "system", content: "You are a consulting document analyst. Always return strict JSON." },
      {
        role: "user",
        content: documentAnalysisPrompt({ text: cleanText, objective: input.objective })
      }
    ],
    temperature: 0.2,
    maxTokens: 1200
  });
  const safe = {
    summary: data?.summary ?? "",
    topics: data?.topics ?? [],
    entities: {
      people: data?.entities?.people ?? [],
      organizations: data?.entities?.organizations ?? [],
      locations: data?.entities?.locations ?? []
    },
    risks: data?.risks ?? [],
    opportunities: data?.opportunities ?? [],
    recommendedExperts: data?.recommendedExperts ?? []
  };
  return {
    data: safe,
    meta: {
      model: meta.model,
      provider: meta.provider,
      tokensUsed: meta.tokensUsed,
      latencyMs: meta.latencyMs
    }
  };
};
var aiAdvancedService = {
  recommendations,
  industryCreation,
  search,
  summary,
  chat,
  documentAnalysis
};

// src/modules/ai/utils/response.ts
var sendAIResponse = (res, data, meta, statusCode = 200) => {
  res.locals.aiMeta = meta;
  return res.status(statusCode).json({ success: true, data, meta });
};

// src/modules/ai/controllers/aiAdvanced.controller.ts
var recommendations2 = catchAsync(async (req, res) => {
  const payload = sanitizeObject(req.body);
  const { data, meta } = await aiAdvancedService.recommendations(payload);
  sendAIResponse(res, data, meta);
});
var industryCreation2 = catchAsync(async (req, res) => {
  const payload = sanitizeObject(req.body);
  payload.industryName = sanitizeText(payload.industryName, 100);
  const { data, meta } = await aiAdvancedService.industryCreation(payload);
  sendAIResponse(res, data, meta);
});
var search2 = catchAsync(async (req, res) => {
  const payload = sanitizeObject(req.body);
  payload.query = sanitizeText(payload.query, 500);
  const { data, meta } = await aiAdvancedService.search(payload);
  sendAIResponse(res, data, meta);
});
var summary2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const { data, meta } = await aiAdvancedService.summary({
    text: sanitizeText(payload.text, 16e3),
    audience: payload.audience ? sanitizeText(payload.audience, 100) : void 0
  });
  sendAIResponse(res, data, meta);
});
var chat2 = catchAsync(async (req, res) => {
  const payload = sanitizeObject(req.body);
  payload.message = sanitizeText(payload.message, 4e3);
  const { data, meta } = await aiAdvancedService.chat(payload);
  sendAIResponse(res, data, meta);
});
var documentAnalysis2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const { data, meta } = await aiAdvancedService.documentAnalysis({
    text: sanitizeText(payload.text, 32e3),
    objective: payload.objective ? sanitizeText(payload.objective, 500) : void 0
  });
  sendAIResponse(res, data, meta);
});
var aiAdvancedController = {
  recommendations: recommendations2,
  industryCreation: industryCreation2,
  search: search2,
  summary: summary2,
  chat: chat2,
  documentAnalysis: documentAnalysis2
};

// src/modules/ai/controllers/aiChat.controller.ts
import httpStatus6 from "http-status";

// src/modules/ai/services/aiChat.service.ts
import httpStatus5 from "http-status";
var MAX_HISTORY_MESSAGES = 20;
var aiMessageSelect = {
  id: true,
  role: true,
  content: true,
  model: true,
  provider: true,
  tokensUsed: true,
  latencyMs: true,
  feedback: true,
  createdAt: true
};
var formatRole = (role) => {
  if (role === AIChatMessageRole.USER) return "user";
  if (role === AIChatMessageRole.ASSISTANT) return "assistant";
  return "system";
};
var formatMessage2 = (message) => ({
  id: message.id,
  role: formatRole(message.role),
  content: message.content,
  feedback: message.feedback,
  model: message.model ?? null,
  provider: message.provider ?? null,
  tokensUsed: message.tokensUsed ?? 0,
  latencyMs: message.latencyMs ?? 0,
  createdAt: message.createdAt
});
var buildConversationTitle = (message) => {
  const compact = sanitizeText(message, 160).replace(/\s+/g, " ").trim();
  if (compact.length <= 60) return compact;
  return `${compact.slice(0, 57).trimEnd()}...`;
};
var ensureConversationOwner = async (conversationId, userId) => {
  const conversation = await prisma.aIConversation.findUnique({
    where: { id: conversationId },
    select: { id: true, userId: true, title: true, createdAt: true, updatedAt: true }
  });
  if (!conversation || conversation.userId !== userId) {
    throw new AppError_default(httpStatus5.NOT_FOUND, "AI conversation not found");
  }
  return conversation;
};
var getOrCreateConversation = async (userId, conversationId, message) => {
  if (conversationId) {
    return ensureConversationOwner(conversationId, userId);
  }
  return prisma.aIConversation.create({
    data: {
      userId,
      title: buildConversationTitle(message) || "New chat"
    },
    select: { id: true, userId: true, title: true, createdAt: true, updatedAt: true }
  });
};
var sendMessage = async (userId, input) => {
  const cleanMessage = sanitizeText(input.message, 4e3).trim();
  const cleanContext = input.context ? sanitizeText(input.context, 500).trim() : void 0;
  if (!cleanMessage) {
    throw new AppError_default(httpStatus5.BAD_REQUEST, "Message is required");
  }
  const conversation = await getOrCreateConversation(userId, input.conversationId, cleanMessage);
  const historyRows = await prisma.aIChatMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "desc" },
    take: MAX_HISTORY_MESSAGES,
    select: aiMessageSelect
  });
  const history = historyRows.reverse().filter((item) => item.role !== AIChatMessageRole.SYSTEM).map((item) => ({ role: formatRole(item.role), content: item.content })).filter(
    (item) => item.role === "user" || item.role === "assistant"
  );
  const providerResult = await aiProvider.generate({
    messages: buildChatMessages({
      message: cleanMessage,
      context: cleanContext || void 0,
      history
    }),
    temperature: 0.5,
    maxTokens: 500
  });
  const safeReply = providerResult.text?.trim() || "I'm here to help. Could you share a bit more detail?";
  const { userMessage, assistantMessage, updatedConversation } = await prisma.$transaction(
    async (tx) => {
      const createdUserMessage = await tx.aIChatMessage.create({
        data: {
          conversationId: conversation.id,
          role: AIChatMessageRole.USER,
          content: cleanMessage
        },
        select: aiMessageSelect
      });
      const createdAssistantMessage = await tx.aIChatMessage.create({
        data: {
          conversationId: conversation.id,
          role: AIChatMessageRole.ASSISTANT,
          content: safeReply,
          model: providerResult.model,
          provider: providerResult.provider,
          tokensUsed: providerResult.tokensUsed,
          latencyMs: providerResult.latencyMs
        },
        select: aiMessageSelect
      });
      const refreshedConversation = await tx.aIConversation.update({
        where: { id: conversation.id },
        data: {
          title: conversation.title === "New chat" || !input.conversationId ? buildConversationTitle(cleanMessage) || conversation.title : void 0
        },
        select: { id: true, title: true, createdAt: true, updatedAt: true }
      });
      return {
        userMessage: createdUserMessage,
        assistantMessage: createdAssistantMessage,
        updatedConversation: refreshedConversation
      };
    }
  );
  return {
    data: {
      conversation: updatedConversation,
      userMessage: formatMessage2(userMessage),
      assistantMessage: formatMessage2(assistantMessage)
    },
    meta: {
      model: providerResult.model,
      provider: providerResult.provider,
      tokensUsed: providerResult.tokensUsed,
      latencyMs: providerResult.latencyMs
    }
  };
};
var listConversations = async (userId) => {
  const conversations = await prisma.aIConversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          content: true,
          role: true,
          createdAt: true
        }
      }
    }
  });
  return conversations.map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
    preview: conversation.messages[0]?.content ?? "",
    lastMessageRole: conversation.messages[0] ? formatRole(conversation.messages[0].role) : null,
    lastMessageAt: conversation.messages[0]?.createdAt ?? conversation.updatedAt,
    messageCount: conversation._count.messages,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  }));
};
var getConversation = async (userId, conversationId) => {
  const conversation = await ensureConversationOwner(conversationId, userId);
  const messages = await prisma.aIChatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: aiMessageSelect
  });
  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    messages: messages.map(formatMessage2)
  };
};
var updateMessageFeedback = async (userId, conversationId, messageId, feedback) => {
  await ensureConversationOwner(conversationId, userId);
  const message = await prisma.aIChatMessage.findFirst({
    where: {
      id: messageId,
      conversationId
    },
    select: aiMessageSelect
  });
  if (!message) {
    throw new AppError_default(httpStatus5.NOT_FOUND, "AI message not found");
  }
  if (message.role !== AIChatMessageRole.ASSISTANT) {
    throw new AppError_default(httpStatus5.BAD_REQUEST, "Only assistant messages can be rated");
  }
  const updated = await prisma.aIChatMessage.update({
    where: { id: messageId },
    data: { feedback },
    select: aiMessageSelect
  });
  return formatMessage2(updated);
};
var aiChatService = {
  sendMessage,
  listConversations,
  getConversation,
  updateMessageFeedback
};

// src/modules/ai/controllers/aiChat.controller.ts
var sendMessage2 = catchAsync(async (req, res) => {
  const payload = sanitizeObject(req.body);
  const { data, meta } = await aiChatService.sendMessage(req.user.userId, {
    message: sanitizeText(payload.message, 4e3),
    context: payload.context ? sanitizeText(payload.context, 500) : void 0,
    conversationId: payload.conversationId
  });
  sendAIResponse(res, data, meta, httpStatus6.CREATED);
});
var listConversations2 = catchAsync(async (req, res) => {
  const data = await aiChatService.listConversations(req.user.userId);
  sendResponse(res, {
    httpStatusCode: httpStatus6.OK,
    success: true,
    message: "AI conversations fetched successfully",
    data
  });
});
var getConversation2 = catchAsync(async (req, res) => {
  const data = await aiChatService.getConversation(
    req.user.userId,
    String(req.params.conversationId)
  );
  sendResponse(res, {
    httpStatusCode: httpStatus6.OK,
    success: true,
    message: "AI conversation fetched successfully",
    data
  });
});
var updateMessageFeedback2 = catchAsync(async (req, res) => {
  const payload = sanitizeObject(req.body);
  const data = await aiChatService.updateMessageFeedback(
    req.user.userId,
    String(req.params.conversationId),
    String(req.params.messageId),
    payload.feedback ?? null
  );
  sendResponse(res, {
    httpStatusCode: httpStatus6.OK,
    success: true,
    message: "AI message feedback updated successfully",
    data
  });
});
var aiChatController = {
  sendMessage: sendMessage2,
  listConversations: listConversations2,
  getConversation: getConversation2,
  updateMessageFeedback: updateMessageFeedback2
};

// src/modules/ai/utils/metrics.ts
var stats = /* @__PURE__ */ new Map();
var startedAt = Date.now();
var getOrCreate = (endpoint) => {
  let s = stats.get(endpoint);
  if (!s) {
    s = {
      count: 0,
      errorCount: 0,
      totalLatencyMs: 0,
      totalTokens: 0,
      lastError: null,
      lastCallAt: null
    };
    stats.set(endpoint, s);
  }
  return s;
};
var aiMetrics = {
  recordSuccess(endpoint, latencyMs, tokensUsed = 0) {
    const s = getOrCreate(endpoint);
    s.count += 1;
    s.totalLatencyMs += latencyMs;
    s.totalTokens += tokensUsed;
    s.lastCallAt = (/* @__PURE__ */ new Date()).toISOString();
  },
  recordError(endpoint, latencyMs, message) {
    const s = getOrCreate(endpoint);
    s.count += 1;
    s.errorCount += 1;
    s.totalLatencyMs += latencyMs;
    s.lastError = { message, at: (/* @__PURE__ */ new Date()).toISOString() };
    s.lastCallAt = (/* @__PURE__ */ new Date()).toISOString();
  },
  snapshot() {
    const endpoints = {};
    for (const [key, s] of stats) {
      endpoints[key] = {
        count: s.count,
        errorCount: s.errorCount,
        avgLatencyMs: s.count > 0 ? Math.round(s.totalLatencyMs / s.count) : 0,
        totalTokens: s.totalTokens,
        lastError: s.lastError,
        lastCallAt: s.lastCallAt
      };
    }
    return {
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1e3),
      endpoints
    };
  }
};

// src/modules/ai/controllers/aiOps.controller.ts
var health = catchAsync(async (_req, res) => {
  const probe = await aiProvider.ping();
  const httpStatus8 = probe.status === "ok" ? 200 : probe.status === "unconfigured" ? 503 : 503;
  res.status(httpStatus8).json({
    success: probe.status === "ok",
    data: probe
  });
});
var metrics = catchAsync(async (_req, res) => {
  res.status(200).json({
    success: true,
    data: aiMetrics.snapshot()
  });
});
var aiOpsController = { health, metrics };

// src/modules/ai/schemas/ragOutput.schema.ts
import { z as z13 } from "zod";
var ragSourceSchema = z13.object({
  source_id: z13.string().min(1),
  evidence: z13.string().min(1)
});
var ragResponseSchema = z13.object({
  answer: z13.string().min(1),
  reasoning: z13.string().min(1),
  sources: z13.array(ragSourceSchema),
  suggestions: z13.array(z13.string().min(1)).max(5)
});

// src/modules/ai/utils/ragRanker.ts
var tokenize2 = (value) => value.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 1);
var normalize = (value) => value.trim().toLowerCase();
var parseDateScore = (createdAtValue) => {
  if (typeof createdAtValue !== "string") return 0;
  const parsed = new Date(createdAtValue);
  if (Number.isNaN(parsed.valueOf())) return 0;
  const ageDays = Math.max(0, (Date.now() - parsed.valueOf()) / (1e3 * 60 * 60 * 24));
  if (ageDays <= 7) return 0.08;
  if (ageDays <= 30) return 0.05;
  if (ageDays <= 90) return 0.03;
  return 0;
};
var qualityScore = (metadata) => {
  if (!metadata) return 0;
  const rating = Number(metadata.rating ?? 0);
  const totalReviews = Number(metadata.totalReviews ?? 0);
  let score = 0;
  if (Number.isFinite(rating) && rating >= 4.5) score += 0.06;
  else if (Number.isFinite(rating) && rating >= 4) score += 0.03;
  if (Number.isFinite(totalReviews) && totalReviews >= 100) score += 0.05;
  else if (Number.isFinite(totalReviews) && totalReviews >= 20) score += 0.03;
  score += parseDateScore(metadata.createdAt);
  return Math.min(0.15, score);
};
var rankRagContext = (query2, context, topK = 6) => {
  const normalizedQuery = normalize(query2);
  const queryTokens = tokenize2(query2);
  const tokenSet = new Set(queryTokens);
  const ranked = context.filter((item) => item.source_id?.trim() && item.content?.trim()).map((item) => {
    const text = normalize(item.content);
    const textTokens = tokenize2(text);
    const textTokenSet = new Set(textTokens);
    const exactPhraseMatch = normalizedQuery.length > 2 && text.includes(normalizedQuery) ? 1 : 0;
    let overlapCount = 0;
    for (const token of tokenSet) {
      if (textTokenSet.has(token)) overlapCount += 1;
    }
    const overlapScore = tokenSet.size > 0 ? overlapCount / tokenSet.size : 0;
    const lengthPenalty = text.length > 4e3 ? 0.05 : 0;
    const score = exactPhraseMatch * 0.6 + overlapScore * 0.4 + qualityScore(item.metadata) - lengthPenalty;
    return {
      ...item,
      score: Math.max(0, Math.min(1, Number(score.toFixed(4))))
    };
  }).sort((a, b) => b.score - a.score).slice(0, Math.max(1, topK));
  return ranked;
};

// src/modules/ai/services/aiRag.service.ts
var NO_MATCH = "No matching data found in the system.";
var buildPrompt = (query2, context) => {
  return [
    "You are the RAG engine for ConsultEdge.",
    "Answer ONLY using the data provided below.",
    "Never hallucinate or invent experts, industries, reviews, or policies.",
    `If answer not present, answer must be exactly: "${NO_MATCH}".`,
    "Rules:",
    "1) Use only retrieved context.",
    "2) Do not guess missing information.",
    "3) If multiple experts match, rank by relevance.",
    "4) If user intent is unclear, ask a clarifying question in suggestions.",
    "5) Keep answer clear and professional.",
    "6) Include why this answer in reasoning.",
    "7) Include citations using source_id values from context.",
    "Output JSON with shape:",
    '{"answer":"...","reasoning":"...","sources":[{"source_id":"...","evidence":"..."}],"suggestions":["..."]}',
    "Context:",
    JSON.stringify(context),
    "Query:",
    query2
  ].join("\n");
};
var aiRagService = {
  async query(input) {
    const ranked = rankRagContext(input.query, input.context, input.topK ?? 6);
    if (ranked.length === 0 || ranked[0].score < 0.08) {
      return {
        data: {
          answer: NO_MATCH,
          reasoning: "No relevant evidence matched the query in retrieved context.",
          sources: [],
          suggestions: [
            "Try refining the query with specific industry, expert name, or title.",
            "Increase retrieval depth and rerun the query."
          ]
        },
        meta: {
          model: "heuristic",
          provider: "fallback",
          tokensUsed: 0,
          latencyMs: 0
        }
      };
    }
    const { data, meta } = await aiProvider.generateJSON({
      messages: [
        {
          role: "system",
          content: "You are a strict retrieval-grounded JSON API. Never output non-JSON."
        },
        {
          role: "user",
          content: buildPrompt(input.query, ranked)
        }
      ],
      temperature: 0.1,
      maxTokens: 900
    });
    const parsed = ragResponseSchema.safeParse(data);
    if (!parsed.success) {
      return {
        data: {
          answer: NO_MATCH,
          reasoning: "Model response was invalid against RAG schema.",
          sources: [],
          suggestions: [
            "Retry query with narrower intent.",
            "Check retrieved context quality and source_id fields."
          ]
        },
        meta: {
          model: meta.model,
          provider: meta.provider,
          tokensUsed: meta.tokensUsed,
          latencyMs: meta.latencyMs
        }
      };
    }
    return {
      data: parsed.data,
      meta: {
        model: meta.model,
        provider: meta.provider,
        tokensUsed: meta.tokensUsed,
        latencyMs: meta.latencyMs
      }
    };
  }
};

// src/modules/ai/controllers/aiRag.controller.ts
var query = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await aiRagService.query(payload);
  sendAIResponse(res, result.data, result.meta);
});
var aiRagController = {
  query
};

// src/modules/ai/ai.validation.ts
import { z as z14 } from "zod";
var historyItemSchema = z14.object({
  role: z14.enum(["user", "assistant"]),
  content: z14.string().trim().min(1).max(4e3)
});
var askSupport3 = z14.object({
  body: z14.object({
    message: z14.string().trim().min(1, "Message is required").max(4e3),
    context: z14.enum(["general", "homepage", "booking", "expert", "payment", "technical"]).optional(),
    history: z14.array(historyItemSchema).max(12).optional()
  })
});
var expertItem = z14.object({
  id: z14.string().min(1),
  name: z14.string().min(1).max(200),
  industry: z14.string().max(120).optional(),
  expertise: z14.array(z14.string().max(80)).max(20).optional(),
  bio: z14.string().max(2e3).optional(),
  rating: z14.number().min(0).max(5).optional()
});
var recommendations3 = z14.object({
  body: z14.object({
    viewedExperts: z14.array(z14.string().max(200)).max(100).optional(),
    exploredIndustries: z14.array(z14.string().max(120)).max(100).optional(),
    searchHistory: z14.array(z14.string().max(200)).max(100).optional(),
    clickedCategories: z14.array(z14.string().max(120)).max(100).optional()
  })
});
var industryCreation3 = z14.object({
  body: z14.object({
    industryName: z14.string().trim().min(2).max(100)
  })
});
var search3 = z14.object({
  body: z14.object({
    query: z14.string().trim().min(1).max(500),
    userActivity: z14.object({
      viewedExperts: z14.array(z14.string().max(200)).max(100).optional(),
      exploredIndustries: z14.array(z14.string().max(120)).max(100).optional(),
      searchHistory: z14.array(z14.string().max(200)).max(100).optional(),
      clickedCategories: z14.array(z14.string().max(120)).max(100).optional()
    }).optional(),
    db: z14.object({
      experts: z14.array(expertItem).max(300).optional(),
      industries: z14.array(z14.record(z14.string(), z14.unknown())).max(300).optional(),
      testimonials: z14.array(z14.record(z14.string(), z14.unknown())).max(500).optional(),
      trending: z14.array(z14.record(z14.string(), z14.unknown())).max(200).optional()
    }).optional()
  })
});
var summary3 = z14.object({
  body: z14.object({
    text: z14.string().trim().min(20).max(2e4),
    audience: z14.string().max(100).optional()
  })
});
var chat3 = z14.object({
  body: z14.object({
    message: z14.string().trim().min(1).max(4e3),
    context: z14.string().max(500).optional(),
    history: z14.array(historyItemSchema).max(20).optional()
  })
});
var persistedChatMessage = z14.object({
  body: z14.object({
    message: z14.string().trim().min(1).max(4e3),
    context: z14.string().max(500).optional(),
    conversationId: z14.string().uuid().optional()
  })
});
var conversationParams = z14.object({
  params: z14.object({
    conversationId: z14.string().uuid()
  })
});
var messageFeedback = z14.object({
  params: z14.object({
    conversationId: z14.string().uuid(),
    messageId: z14.string().uuid()
  }),
  body: z14.object({
    feedback: z14.enum(["LIKE", "DISLIKE"]).nullable()
  })
});
var ragQuery = z14.object({
  body: z14.object({
    query: z14.string().trim().min(1).max(1e3),
    topK: z14.coerce.number().int().min(1).max(20).optional(),
    context: z14.array(
      z14.object({
        source_id: z14.string().trim().min(1).max(200),
        content: z14.string().trim().min(1).max(12e3),
        metadata: z14.record(z14.string(), z14.unknown()).optional()
      })
    ).min(1).max(100)
  })
});
var documentAnalysis3 = z14.object({
  body: z14.object({
    text: z14.string().trim().min(50).max(4e4),
    objective: z14.string().max(500).optional()
  })
});
var aiValidation = {
  askSupport: askSupport3,
  recommendations: recommendations3,
  industryCreation: industryCreation3,
  search: search3,
  summary: summary3,
  chat: chat3,
  persistedChatMessage,
  conversationParams,
  messageFeedback,
  ragQuery,
  documentAnalysis: documentAnalysis3
};

// src/modules/ai/utils/aiLogger.ts
var aiLogger = (req, res, next) => {
  const startedAt2 = Date.now();
  const endpoint = req.path || req.originalUrl;
  res.on("finish", () => {
    const durationMs = Date.now() - startedAt2;
    const meta = res.locals.aiMeta ?? null;
    const ok = res.statusCode < 400;
    if (ok) {
      aiMetrics.recordSuccess(endpoint, durationMs, meta?.tokensUsed ?? 0);
    } else {
      aiMetrics.recordError(endpoint, durationMs, `HTTP ${res.statusCode}`);
    }
    console.log(
      JSON.stringify({
        scope: "ai",
        endpoint,
        method: req.method,
        status: res.statusCode,
        durationMs,
        provider: meta?.provider ?? null,
        model: meta?.model ?? null,
        tokensUsed: meta?.tokensUsed ?? 0,
        modelLatencyMs: meta?.latencyMs ?? null,
        at: (/* @__PURE__ */ new Date()).toISOString()
      })
    );
  });
  next();
};

// src/modules/ai/utils/rateLimiter.ts
var buckets = /* @__PURE__ */ new Map();
var getClientKey = (req) => {
  const userId = req.user?.id;
  if (userId) return `u:${userId}`;
  const xff = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(xff) ? xff[0] : xff?.split(",")[0]?.trim()) || req.ip || "unknown";
  return `ip:${ip}`;
};
var rateLimit = (options) => {
  const { windowMs, max, keyPrefix = "ai" } = options;
  return (req, res, next) => {
    const key = `${keyPrefix}:${getClientKey(req)}`;
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(max - 1));
      return next();
    }
    if (bucket.count >= max) {
      const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1e3));
      res.setHeader("Retry-After", String(retryAfterSec));
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", "0");
      return res.status(429).json({
        success: false,
        message: "Rate limit exceeded",
        retryAfter: retryAfterSec
      });
    }
    bucket.count += 1;
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(max - bucket.count));
    next();
  };
};
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
  }
}, 6e4).unref?.();

// src/modules/ai/utils/aiErrorHandler.ts
import status35 from "http-status";
var aiErrorHandler = (err, _req, res, next) => {
  if (err instanceof AppError_default && err.statusCode === status35.SERVICE_UNAVAILABLE) {
    return res.status(503).json({
      success: false,
      message: "AI provider unavailable",
      detail: err.message
    });
  }
  if (err instanceof AppError_default && err.statusCode === status35.BAD_GATEWAY) {
    return res.status(503).json({
      success: false,
      message: "AI provider unavailable",
      detail: err.message
    });
  }
  return next(err);
};

// src/modules/ai/ai.router.ts
var router16 = Router14();
router16.use(aiLogger);
var recommendationsLimiter = rateLimit({ windowMs: 6e4, max: 10, keyPrefix: "ai-rec" });
var industryCreationLimiter = rateLimit({ windowMs: 6e4, max: 10, keyPrefix: "ai-industry" });
var searchLimiter = rateLimit({ windowMs: 6e4, max: 15, keyPrefix: "ai-search" });
var summaryLimiter = rateLimit({ windowMs: 6e4, max: 5, keyPrefix: "ai-summary" });
var chatLimiter = rateLimit({ windowMs: 6e4, max: 20, keyPrefix: "ai-chat" });
var docLimiter = rateLimit({ windowMs: 6e4, max: 3, keyPrefix: "ai-doc" });
var supportLimiter = rateLimit({ windowMs: 6e4, max: 30, keyPrefix: "ai-support" });
router16.get("/health", aiOpsController.health);
router16.get("/metrics", aiOpsController.metrics);
router16.post(
  "/support",
  supportLimiter,
  validateRequest(aiValidation.askSupport),
  aiController.askSupport
);
router16.post(
  "/recommendations",
  recommendationsLimiter,
  validateRequest(aiValidation.recommendations),
  aiAdvancedController.recommendations
);
router16.post(
  "/industry-creation",
  industryCreationLimiter,
  validateRequest(aiValidation.industryCreation),
  aiAdvancedController.industryCreation
);
router16.post(
  "/search",
  searchLimiter,
  validateRequest(aiValidation.search),
  aiAdvancedController.search
);
router16.post(
  "/summary",
  summaryLimiter,
  validateRequest(aiValidation.summary),
  aiAdvancedController.summary
);
router16.post(
  "/chat",
  chatLimiter,
  validateRequest(aiValidation.chat),
  aiAdvancedController.chat
);
router16.post(
  "/chat/messages",
  chatLimiter,
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  validateRequest(aiValidation.persistedChatMessage),
  aiChatController.sendMessage
);
router16.get(
  "/chat/conversations",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  aiChatController.listConversations
);
router16.get(
  "/chat/conversations/:conversationId",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  validateRequest(aiValidation.conversationParams),
  aiChatController.getConversation
);
router16.patch(
  "/chat/conversations/:conversationId/messages/:messageId/feedback",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  validateRequest(aiValidation.messageFeedback),
  aiChatController.updateMessageFeedback
);
router16.post(
  "/document-analysis",
  docLimiter,
  validateRequest(aiValidation.documentAnalysis),
  aiAdvancedController.documentAnalysis
);
router16.post(
  "/rag/query",
  searchLimiter,
  validateRequest(aiValidation.ragQuery),
  aiRagController.query
);
router16.use(aiErrorHandler);
var aiRoutes = router16;

// src/modules/conversations/conservations.router.ts
import { Router as Router15 } from "express";

// src/modules/conversations/conversations.controler.ts
import httpStatus7 from "http-status";

// src/modules/conversations/conversations.service.ts
var getAllConversationsForAdmin = async (expertId) => {
  return chatService.getUserRooms("", Role.ADMIN, expertId);
};
var conversationsService = {
  getAllConversationsForAdmin
};

// src/modules/conversations/conversations.controler.ts
var getSingleString2 = (value) => {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : "";
  }
  return typeof value === "string" ? value : "";
};
var getAllConversationsForAdmin2 = catchAsync(
  async (req, res) => {
    const expertId = getSingleString2(req.query.expertId) || void 0;
    const conversations = await conversationsService.getAllConversationsForAdmin(
      expertId
    );
    sendResponse(res, {
      httpStatusCode: httpStatus7.OK,
      success: true,
      message: "Conversations fetched successfully",
      data: conversations
    });
  }
);
var conversationsController = {
  getAllConversationsForAdmin: getAllConversationsForAdmin2
};

// src/modules/conversations/conservations.router.ts
var router17 = Router15();
router17.get(
  "/admin",
  checkAuth(Role.ADMIN),
  conversationsController.getAllConversationsForAdmin
);
var conversationsRoutes = router17;

// src/modules/realtime/realtime.routes.ts
import { Router as Router16 } from "express";
import status36 from "http-status";
var router18 = Router16();
router18.get(
  "/token",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  catchAsync(async (req, res) => {
    if (!envVars.ABLY_API_KEY) {
      throw new AppError_default(
        status36.SERVICE_UNAVAILABLE,
        "Realtime service is not configured. Set ABLY_API_KEY on the server."
      );
    }
    const userId = req.user.userId;
    const capability = {
      "private-room-*": ["subscribe", "publish", "presence", "history"],
      [userChannel(userId)]: ["subscribe"]
    };
    const tokenRequest = await createAblyTokenRequest(userId, capability);
    sendResponse(res, {
      httpStatusCode: status36.OK,
      success: true,
      message: "Ably token issued",
      data: tokenRequest
    });
  })
);
var realtimeRoutes = router18;

// src/modules/coupon/coupon.router.ts
import { Router as Router17 } from "express";

// src/modules/coupon/coupon.controller.ts
import status37 from "http-status";
var validateCoupon2 = catchAsync(async (req, res) => {
  const { code, amount } = req.body;
  const preview = await couponService.validateCoupon(code, Number(amount));
  sendResponse(res, {
    httpStatusCode: status37.OK,
    success: true,
    message: "Coupon is valid",
    data: preview
  });
});
var createCoupon2 = catchAsync(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body);
  sendResponse(res, {
    httpStatusCode: status37.CREATED,
    success: true,
    message: "Coupon created",
    data: coupon
  });
});
var listCoupons2 = catchAsync(async (req, res) => {
  const result = await couponService.listCoupons(req.query);
  sendResponse(res, {
    httpStatusCode: status37.OK,
    success: true,
    message: "Coupons fetched",
    data: result.data,
    meta: result.meta
  });
});
var getCouponById2 = catchAsync(async (req, res) => {
  const coupon = await couponService.getCouponById(req.params.id);
  sendResponse(res, {
    httpStatusCode: status37.OK,
    success: true,
    message: "Coupon fetched",
    data: coupon
  });
});
var updateCoupon2 = catchAsync(async (req, res) => {
  const coupon = await couponService.updateCoupon(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    httpStatusCode: status37.OK,
    success: true,
    message: "Coupon updated",
    data: coupon
  });
});
var deleteCoupon2 = catchAsync(async (req, res) => {
  const coupon = await couponService.deleteCoupon(req.params.id);
  sendResponse(res, {
    httpStatusCode: status37.OK,
    success: true,
    message: "Coupon deleted",
    data: coupon
  });
});
var couponController = {
  validateCoupon: validateCoupon2,
  createCoupon: createCoupon2,
  listCoupons: listCoupons2,
  getCouponById: getCouponById2,
  updateCoupon: updateCoupon2,
  deleteCoupon: deleteCoupon2
};

// src/modules/coupon/coupon.validation.ts
import z15 from "zod";
var validateCouponValidation = z15.object({
  body: z15.object({
    code: z15.string().trim().min(1, "Coupon code is required"),
    amount: z15.coerce.number().positive("Amount must be positive")
  })
});
var createCouponValidation = z15.object({
  body: z15.object({
    code: z15.string().trim().min(2).max(40),
    description: z15.string().trim().max(200).optional(),
    discountType: z15.nativeEnum(CouponDiscountType),
    discountValue: z15.coerce.number().positive(),
    maxDiscount: z15.coerce.number().positive().optional(),
    minAmount: z15.coerce.number().nonnegative().optional(),
    expiresAt: z15.string().datetime().optional(),
    maxUses: z15.coerce.number().int().positive().optional(),
    isActive: z15.boolean().optional()
  })
});
var updateCouponValidation = z15.object({
  params: z15.object({ id: z15.string().uuid() }),
  body: z15.object({
    code: z15.string().trim().min(2).max(40).optional(),
    description: z15.string().trim().max(200).nullable().optional(),
    discountType: z15.nativeEnum(CouponDiscountType).optional(),
    discountValue: z15.coerce.number().positive().optional(),
    maxDiscount: z15.coerce.number().positive().nullable().optional(),
    minAmount: z15.coerce.number().nonnegative().nullable().optional(),
    expiresAt: z15.string().datetime().nullable().optional(),
    maxUses: z15.coerce.number().int().positive().nullable().optional(),
    isActive: z15.boolean().optional()
  })
});
var couponIdParamValidation = z15.object({
  params: z15.object({ id: z15.string().uuid() })
});

// src/modules/coupon/coupon.router.ts
var router19 = Router17();
router19.post(
  "/validate",
  validateRequest(validateCouponValidation),
  couponController.validateCoupon
);
router19.post(
  "/",
  checkAuth(Role.ADMIN),
  validateRequest(createCouponValidation),
  couponController.createCoupon
);
router19.get("/", checkAuth(Role.ADMIN), couponController.listCoupons);
router19.get(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(couponIdParamValidation),
  couponController.getCouponById
);
router19.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(updateCouponValidation),
  couponController.updateCoupon
);
router19.delete(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(couponIdParamValidation),
  couponController.deleteCoupon
);
var couponRouter = router19;

// src/index.ts
var router20 = Router18();
router20.use("/auth", authRoutes);
router20.use("/users", userRouter);
router20.use("/experts", expertRouter);
router20.use("/clients", clientRouter);
router20.use("/schedules", scheduleRoutes);
router20.use("/expert-schedules", expertScheduleRouter);
router20.use("/consultations", consultationRouter);
router20.use("/admin", adminRouter);
router20.use("/stats", StatsRoutes);
router20.use("/payments", PaymentRoutes);
router20.use("/notifications", notificationRouter);
router20.use("/chat", chatRoutes);
router20.use("/conversations", conversationsRoutes);
router20.use("/ai", aiRoutes);
router20.use("/realtime", realtimeRoutes);
router20.use("/industries", industryRouter);
router20.use("/expert-verification", expertVerificationRouter);
router20.use("/testimonials", testimonialRoutes);
router20.use("/coupons", couponRouter);
var indexRoutes = router20;

export {
  AppError_default,
  envVars,
  prismaNamespace_exports,
  prisma,
  connectPrismaWithRetry,
  auth,
  seedDemoClient,
  seedAdmin,
  authRoutes,
  PaymentController,
  indexRoutes
};
