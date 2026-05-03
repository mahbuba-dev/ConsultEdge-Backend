
import { Router } from "express";



import { expertVerificationRouter } from "./modules/expertVerification/expertVerification.router";
import { authRoutes } from "./modules/auth/auth.router";
import { expertRouter } from "./modules/expert/expert.route";
import { adminRouter } from "./modules/admin/admin.router";
import { expertScheduleRouter } from "./modules/expertSchdules/expertSchdules.router";
import { scheduleRoutes } from "./modules/schedules/schedules.router";
import { userRouter } from "./modules/user/user.router";
import { consultationRouter } from "./modules/consultation/consultation.router";
import { industryRouter } from "./modules/industry/industry.router";
import { testimonialRoutes } from "./modules/testimonial/testimonial.router";
import { StatsRoutes } from "./modules/stats/stats.router";
import { PaymentRoutes } from "./modules/payment/payment.router";
import { notificationRouter } from "./modules/notification/notification.route";
import { clientRouter } from "./modules/client/client.router";
import { chatRoutes } from "./modules/chat/chat.routes";
import { aiRoutes } from "./modules/ai/ai.router";
import { conversationsRoutes } from "./modules/conversations/conservations.router";
import { realtimeRoutes } from "./modules/realtime/realtime.routes";
import { couponRouter } from "./modules/coupon/coupon.router";


const router = Router();

// Auth
router.use("/auth", authRoutes);

// Users
router.use("/users", userRouter);

// Core business modules
router.use("/experts", expertRouter);
router.use("/clients", clientRouter);

// Scheduling
router.use("/schedules", scheduleRoutes);
router.use("/expert-schedules", expertScheduleRouter);

// Consultation + Payment
router.use("/consultations", consultationRouter);

// Admin roles
router.use("/admin", adminRouter);
router.use("/stats", StatsRoutes)
router.use("/payments", PaymentRoutes)
router.use("/notifications", notificationRouter)
router.use("/chat", chatRoutes)
router.use("/conversations", conversationsRoutes)
router.use("/ai", aiRoutes)
router.use("/realtime", realtimeRoutes)
// Industry / Category
router.use("/industries", industryRouter);
router.use("/expert-verification", expertVerificationRouter)
router.use("/testimonials", testimonialRoutes)
router.use("/coupons", couponRouter)
export const indexRoutes = router;