/**
 * Soft-deletes Expert rows whose linked User or Industry is missing or
 * already soft-deleted. Such "ghost" experts otherwise show up on the
 * landing page but 404 on the detail page because the detail endpoint
 * requires a live user + industry.
 *
 * Run: ts-node prisma/cleanup-broken-experts.ts
 */
import { prisma } from "../src/lib/prisma";

const run = async () => {
  const experts = await prisma.expert.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      fullName: true,
      email: true,
      userId: true,
      industryId: true,
      user: { select: { id: true, isDeleted: true } },
      industry: { select: { id: true, isDeleted: true } },
    },
  });

  const broken = experts.filter(
    (e) => !e.user || e.user.isDeleted || !e.industry || e.industry.isDeleted
  );

  if (broken.length === 0) {
    console.log("No broken experts found.");
    return;
  }

  console.log(`Found ${broken.length} broken expert(s):`);
  for (const e of broken) {
    console.log(
      `  - ${e.id} | ${e.fullName} <${e.email}> | user=${e.user ? (e.user.isDeleted ? "deleted" : "ok") : "missing"} | industry=${e.industry ? (e.industry.isDeleted ? "deleted" : "ok") : "missing"}`
    );
  }

  const result = await prisma.expert.updateMany({
    where: { id: { in: broken.map((e) => e.id) } },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  console.log(`Soft-deleted ${result.count} broken expert(s).`);
};

run()
  .catch((error) => {
    console.error("Failed to cleanup broken experts", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
