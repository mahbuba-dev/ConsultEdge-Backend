// Accepts either UUID or email for expertId
const getStatsByExpertId = async (expertId: string, filters: any = {}) => {
  // UUID v4 regex
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  let realExpertId = expertId;
  if (!uuidRegex.test(expertId)) {
    // Not a UUID, treat as email
    const expertByEmail = await prisma.expert.findUnique({ where: { email: expertId } });
    if (!expertByEmail) {
      throw new AppError(status.BAD_REQUEST, "Invalid expertId: must be a valid UUID or a valid expert email");
    }
    realExpertId = expertByEmail.id;
  }
  // Now call the same logic as getExpertStats, but with resolved expertId
  const expert = await prisma.expert.findUniqueOrThrow({ where: { id: realExpertId } });
  // Consultation analytics (by status, time, industry)
  const consultationCount = await prisma.consultation.count({
    where: { expertId: expert.id, ...filters.consultation },
  });
  const consultationStatusDistribution = await prisma.consultation.groupBy({
    by: ["status"],
    where: { expertId: expert.id, ...filters.consultation },
    _count: { id: true },
  });
  const formattedStatus = consultationStatusDistribution.map(({ status, _count }) => ({
    status,
    count: _count.id,
  }));
  // Booking trends (by month)
  const bookingsRaw = await prisma.consultation.findMany({
    where: { expertId: expert.id, ...filters.consultation },
    select: { createdAt: true, id: true },
    orderBy: { createdAt: 'asc' },
  });
  const bookingsByMonth = bookingsRaw.reduce<{ month: string; count: number }[]>((acc, curr) => {
    const month = curr.createdAt.toISOString().slice(0, 7);
    const found = acc.find(b => b.month === month);
    if (found) found.count++;
    else acc.push({ month, count: 1 });
    return acc;
  }, []);
  // Earnings analytics (by month)
  const earningsRaw = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.PAID,
      consultation: { expertId: expert.id },
      ...filters.payment,
    },
    select: { createdAt: true, amount: true },
    orderBy: { createdAt: 'asc' },
  });
  const earningsByMonth = earningsRaw.reduce<{ month: string; amount: number }[]>((acc, curr) => {
    const month = curr.createdAt.toISOString().slice(0, 7);
    const found = acc.find(e => e.month === month);
    if (found) found.amount += curr.amount;
    else acc.push({ month, amount: curr.amount });
    return acc;
  }, []);
  // Client engagement (repeat clients, activity)
  const uniqueClients = await prisma.consultation.groupBy({
    by: ["clientId"],
    where: { expertId: expert.id, ...filters.consultation },
    _count: { id: true },
  });
  const repeatClients = uniqueClients.filter(c => c._count.id > 1).length;
  // Review/rating analytics
  const reviewCount = await prisma.testimonial.count({
    where: { expertId: expert.id, ...filters.review },
  });
  const avgRatingAgg = await prisma.testimonial.aggregate({
    _avg: { rating: true },
    where: { expertId: expert.id, ...filters.review },
  });
  // Profile performance (views, saves) - stubbed
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
    profileSaves,
  };
};
import { prisma } from "../../lib/prisma";

import { Role, PaymentStatus } from "../../types/role.enum";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const getDashboardStatsData = async (user: IRequestUser) => {
  switch (user.role) {
    case Role.ADMIN:
      return getAdminStats();
    case Role.EXPERT:
      return getExpertStats(user);
    case Role.CLIENT:
      return getClientStats(user);
    default:
      throw new AppError(status.BAD_REQUEST, "Invalid user role for dashboard");
  }
};



const getAdminStats = async () => {
  const expertCount = await prisma.expert.count();
  const clientCount = await prisma.client.count();
  const consultationCount = await prisma.consultation.count();
  const industryCount = await prisma.industry.count();
  const paymentCount = await prisma.payment.count();
  const userCount = await prisma.user.count();

  const totalRevenueAgg = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: PaymentStatus.PAID },
  });

  const consultationStatusDistribution = await prisma.consultation.groupBy({
    by: ["status"] as any,
    _count: { id: true },
  });

  const formattedStatus = consultationStatusDistribution.map(({ status, _count }) => ({
    status,
    count: _count.id,
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
    revenueByMonth,
  };
};





//expert stats


// Expanded Expert Analytics
const getExpertStats = async (user: IRequestUser, filters: any = {}) => {
  const expert = await prisma.expert.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  // Consultation analytics (by status, time, industry)
  const consultationCount = await prisma.consultation.count({
    where: { expertId: expert.id, ...filters.consultation },
  });

  const consultationStatusDistribution = await prisma.consultation.groupBy({
    by: ["status"],
    where: { expertId: expert.id, ...filters.consultation },
    _count: { id: true },
  });
  const formattedStatus = consultationStatusDistribution.map(({ status, _count }) => ({
    status,
    count: _count.id,
  }));

  // Booking trends (by month)
  // Group by month in JS after fetching by createdAt
  const bookingsRaw = await prisma.consultation.findMany({
    where: { expertId: expert.id, ...filters.consultation },
    select: { createdAt: true, id: true },
    orderBy: { createdAt: 'asc' },
  });
  // Group by month in JS
  const bookingsByMonth = bookingsRaw.reduce<{ month: string; count: number }[]>((acc, curr) => {
    const month = curr.createdAt.toISOString().slice(0, 7);
    const found = acc.find(b => b.month === month);
    if (found) found.count++;
    else acc.push({ month, count: 1 });
    return acc;
  }, []);

  // Earnings analytics (by month)
  const earningsRaw = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.PAID,
      consultation: { expertId: expert.id },
      ...filters.payment,
    },
    select: { createdAt: true, amount: true },
    orderBy: { createdAt: 'asc' },
  });
  const earningsByMonth = earningsRaw.reduce<{ month: string; amount: number }[]>((acc, curr) => {
    const month = curr.createdAt.toISOString().slice(0, 7);
    const found = acc.find(e => e.month === month);
    if (found) found.amount += curr.amount;
    else acc.push({ month, amount: curr.amount });
    return acc;
  }, []);

  // Client engagement (repeat clients, activity)
  const uniqueClients = await prisma.consultation.groupBy({
    by: ["clientId"] as any,
    where: { expertId: expert.id, ...filters.consultation },
    _count: { id: true },
  });
  const repeatClients = uniqueClients.filter(c => c._count.id > 1).length;

  // Review/rating analytics
  const reviewCount = await prisma.testimonial.count({
    where: { expertId: expert.id, ...filters.review },
  });
  const avgRatingAgg = await prisma.testimonial.aggregate({
    _avg: { rating: true },
    where: { expertId: expert.id, ...filters.review },
  });

  // Expert profile performance (views, saves, bookings)
  // Assumes profileViews and saves are tracked in a separate table (implement if not present)
  let profileViews = 0;
  let profileSaves = 0;
  // Remove profileViews and profileSaves if models do not exist in schema

  // Monthly activity statistics (consultations, earnings, reviews)
  // Already covered above in bookingsByMonth, earningsByMonth

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
    profileSaves,
  };
};





//client stats


// Expanded Client Analytics
const getClientStats = async (user: IRequestUser, filters: any = {}, pagination: any = {}) => {
  const client = await prisma.client.findUnique({
    where: { userId: user.userId },
    select: { id: true },
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
      monthlyActivity: [],
    };
  }

  // Booking activity trends (by month)
  const bookingsRaw = await prisma.consultation.findMany({
    where: { clientId: client.id, ...filters.consultation },
    select: { createdAt: true, id: true },
    orderBy: { createdAt: 'asc' },
  });
  const bookingsByMonth = bookingsRaw.reduce<{ month: string; count: number }[]>((acc, curr) => {
    const month = curr.createdAt.toISOString().slice(0, 7);
    const found = acc.find(b => b.month === month);
    if (found) found.count++;
    else acc.push({ month, count: 1 });
    return acc;
  }, []);

  // Consultation history analytics (status, time, expert, industry)
  const consultationCount = await prisma.consultation.count({
    where: { clientId: client.id, ...filters.consultation },
  });
  const consultationStatusDistribution = await prisma.consultation.groupBy({
    by: ["status"],
    where: { clientId: client.id, ...filters.consultation },
    _count: { id: true },
  });
  const formattedStatus = consultationStatusDistribution.map(({ status, _count }) => ({
    status,
    count: _count.id,
  }));

  // Saved experts analytics
  let savedExpertsCount = 0;
  // Remove savedExpertsCount if model does not exist in schema

  // Engagement/activity trends (consultations, saves, AI usage by month)
  const engagementRaw = await prisma.consultation.findMany({
    where: { clientId: client.id, ...filters.consultation },
    select: { createdAt: true, id: true },
    orderBy: { createdAt: 'asc' },
  });
  const engagementTrends = engagementRaw.reduce<{ month: string; count: number }[]>((acc, curr) => {
    const month = curr.createdAt.toISOString().slice(0, 7);
    const found = acc.find(e => e.month === month);
    if (found) found.count++;
    else acc.push({ month, count: 1 });
    return acc;
  }, []);

  // Spending/activity insights (by month)
  const spendingRaw = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.PAID,
      consultation: {
        clientId: client.id,
        ...filters.consultation,
      },
      ...filters.payment,
    },
    select: { createdAt: true, amount: true },
    orderBy: { createdAt: 'asc' },
  });
  const spendingByMonth = spendingRaw.reduce<{ month: string; amount: number }[]>((acc, curr) => {
    const month = curr.createdAt.toISOString().slice(0, 7);
    const found = acc.find(s => s.month === month);
    if (found) found.amount += curr.amount;
    else acc.push({ month, amount: curr.amount });
    return acc;
  }, []);



  // AI usage analytics (chat, RAG, search, summary, doc analysis)
  // Assumes aiUsageLog table exists; implement if not present
  // Remove aiUsage if model does not exist in schema

  // Monthly activity statistics (consultations, spending, AI usage)
  // Already covered above in bookingsByMonth, spendingByMonth, aiUsage

  // Pagination for consultation history (if needed)
  let consultationHistory: any[] = [];
  if (pagination && pagination.pageSize) {
    consultationHistory = await prisma.consultation.findMany({
      where: { clientId: client.id, ...filters.consultation },
      orderBy: { createdAt: 'desc' },
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    });
  }

  return {
    consultationCount,
    consultationStatusDistribution: formattedStatus,
    bookingsByMonth,
    savedExpertsCount,
    engagementTrends,
    spendingByMonth,
    // categoryDistribution, // Removed: industryId is not a scalar field
    aiUsage: [],
    monthlyActivity: {
      bookingsByMonth,
      spendingByMonth,
      aiUsage: [],
    },
    consultationHistory,
  };
};




//revenue by month for admin dashboard

const getRevenueByMonth = async () => {
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




export const StatsService = {
  getDashboardStatsData,
  getStatsByExpertId,
};
