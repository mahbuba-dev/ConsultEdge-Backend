import { prisma } from "../src/lib/prisma";

const TARGET_EXPERTS = 30;
const TARGET_SLOTS_PER_EXPERT = 6;
const SLOT_DURATION_MINUTES = 45;
const SLOT_HOURS_UTC = [9, 11, 14, 16, 19] as const;

const buildSlotStart = (expertIndex: number, slotIndex: number) => {
  const now = new Date();
  const dayOffset = 1 + ((expertIndex * 3 + slotIndex) % 16);
  const hour = SLOT_HOURS_UTC[(expertIndex + slotIndex) % SLOT_HOURS_UTC.length];

  const start = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + dayOffset,
    hour,
    0,
    0,
    0
  ));

  return start;
};

const run = async () => {
  const seededExperts = await prisma.expert.findMany({
    where: {
      email: {
        endsWith: "@consultedge.test",
      },
      isDeleted: false,
    },
    select: {
      id: true,
      fullName: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: TARGET_EXPERTS,
  });

  if (seededExperts.length === 0) {
    console.log("No seeded experts found for slot refresh.");
    return;
  }

  let createdSlots = 0;
  let releasedSlots = 0;
  let purgedSlots = 0;

  const now = new Date();

  for (let expertIndex = 0; expertIndex < seededExperts.length; expertIndex += 1) {
    const expert = seededExperts[expertIndex];

    // ---------------------------------------------------------------
    // Reset stale state on this seeded expert's slots so testers can
    // book them repeatedly.
    //   1. Remove past slots that have no real consultation attached.
    //   2. Release future slots that were marked as booked but never
    //      tied to a consultation (or whose consultation is gone).
    // ---------------------------------------------------------------
    const expertSlots = await prisma.expertSchedule.findMany({
      where: {
        expertId: expert.id,
        isDeleted: false,
      },
      select: {
        id: true,
        isBooked: true,
        consultationId: true,
        scheduleId: true,
        schedule: { select: { endDateTime: true } },
        consultation: { select: { id: true } },
      },
    });

    for (const slot of expertSlots) {
      const isPast = slot.schedule.endDateTime <= now;
      const hasConsultation = !!slot.consultation;

      if (isPast && !hasConsultation) {
        await prisma.$transaction(async (tx) => {
          await tx.expertSchedule.delete({ where: { id: slot.id } });
          await tx.schedule.delete({ where: { id: slot.scheduleId } });
        });
        purgedSlots += 1;
        continue;
      }

      if (!isPast && slot.isBooked && !hasConsultation) {
        await prisma.expertSchedule.update({
          where: { id: slot.id },
          data: {
            isBooked: false,
            consultationId: null,
            isPublished: true,
          },
        });
        releasedSlots += 1;
      }
    }

    const existingFutureSlots = await prisma.expertSchedule.count({
      where: {
        expertId: expert.id,
        isDeleted: false,
        schedule: {
          isDeleted: false,
          startDateTime: {
            gt: new Date(),
          },
        },
      },
    });

    const slotsToCreate = Math.max(0, TARGET_SLOTS_PER_EXPERT - existingFutureSlots);
    if (slotsToCreate === 0) {
      continue;
    }

    for (let slotIndex = 0; slotIndex < slotsToCreate; slotIndex += 1) {
      const startDateTime = buildSlotStart(expertIndex, slotIndex);
      const endDateTime = new Date(startDateTime.getTime() + SLOT_DURATION_MINUTES * 60_000);

      const alreadyExists = await prisma.expertSchedule.findFirst({
        where: {
          expertId: expert.id,
          isDeleted: false,
          schedule: {
            isDeleted: false,
            startDateTime,
            endDateTime,
          },
        },
        select: {
          id: true,
        },
      });

      if (alreadyExists) {
        continue;
      }

      await prisma.$transaction(async (tx) => {
        const schedule = await tx.schedule.create({
          data: {
            startDateTime,
            endDateTime,
            isDeleted: false,
            deletedAt: null,
          },
          select: { id: true },
        });

        await tx.expertSchedule.create({
          data: {
            expertId: expert.id,
            scheduleId: schedule.id,
            isBooked: false,
            isPublished: true,
            isDeleted: false,
            deletedAt: null,
          },
        });
      });

      createdSlots += 1;
    }
  }

  console.log(`Created ${createdSlots} published slots across first ${seededExperts.length} seeded experts.`);
  console.log(`Released ${releasedSlots} dangling-booked slots and purged ${purgedSlots} expired seeded slots.`);
};

run()
  .catch((error) => {
    console.error("Failed to refresh seeded expert slots", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
