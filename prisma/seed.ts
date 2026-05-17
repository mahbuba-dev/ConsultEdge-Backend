
import { readFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcrypt";

import { prisma } from "../src/lib/prisma";
import {
  type Prisma,
  ReviewStatus,
  Role,
  UserStatus,
} from "../src/generated/client";

type SeedPayload = {
  industries: Prisma.IndustryCreateManyInput[];
  expertUsers: Prisma.UserCreateManyInput[];
  clientUsers: Prisma.UserCreateManyInput[];
  clients: Prisma.ClientCreateManyInput[];
  experts: Prisma.ExpertCreateManyInput[];
  testimonials: Prisma.TestimonialCreateManyInput[];
  summary?: Record<string, number>;
};

const DEFAULT_SEED_FILE = "prisma/seed-data.json";
const DEFAULT_BATCH_SIZE = 200;

const chunkArray = <T>(items: T[], size: number): T[][] => {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const assertArray = <T>(value: unknown, label: string): T[] => {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid seed payload: ${label} must be an array`);
  }
  return value as T[];
};

const assertUnique = <T>(
  rows: T[],
  keySelector: (row: T) => string,
  label: string
) => {
  const seen = new Set<string>();
  for (const row of rows) {
    const key = keySelector(row);
    if (seen.has(key)) {
      throw new Error(`Invalid seed payload: duplicate ${label} value '${key}'`);
    }
    seen.add(key);
  }
};

const validateEnums = (payload: SeedPayload) => {
  const validRoles = new Set(Object.values(Role));
  const validUserStatus = new Set(Object.values(UserStatus));
  const validReviewStatus = new Set(Object.values(ReviewStatus));

  for (const user of [...payload.expertUsers, ...payload.clientUsers]) {
    if (!validRoles.has(user.role as Role)) {
      throw new Error(`Invalid user role for user ${user.id}: ${user.role}`);
    }

    if (!validUserStatus.has(user.status as UserStatus)) {
      throw new Error(`Invalid user status for user ${user.id}: ${user.status}`);
    }
  }

  for (const testimonial of payload.testimonials) {
    if (!validReviewStatus.has(testimonial.status as ReviewStatus)) {
      throw new Error(
        `Invalid testimonial status for testimonial ${testimonial.id}: ${testimonial.status}`
      );
    }
  }
};

const validateRelations = (payload: SeedPayload) => {
  const industryIds = new Set(payload.industries.map((row) => row.id));
  const userIds = new Set(
    [...payload.expertUsers, ...payload.clientUsers].map((row) => row.id)
  );
  const clientIds = new Set(payload.clients.map((row) => row.id));
  const expertIds = new Set(payload.experts.map((row) => row.id));

  for (const client of payload.clients) {
    if (!userIds.has(client.userId)) {
      throw new Error(
        `Invalid relation: client ${client.id} references missing userId ${client.userId}`
      );
    }
  }

  for (const expert of payload.experts) {
    if (!userIds.has(expert.userId)) {
      throw new Error(
        `Invalid relation: expert ${expert.id} references missing userId ${expert.userId}`
      );
    }

    if (!industryIds.has(expert.industryId)) {
      throw new Error(
        `Invalid relation: expert ${expert.id} references missing industryId ${expert.industryId}`
      );
    }
  }

  for (const testimonial of payload.testimonials) {
    if (!clientIds.has(testimonial.clientId)) {
      throw new Error(
        `Invalid relation: testimonial ${testimonial.id} references missing clientId ${testimonial.clientId}`
      );
    }

    if (!expertIds.has(testimonial.expertId)) {
      throw new Error(
        `Invalid relation: testimonial ${testimonial.id} references missing expertId ${testimonial.expertId}`
      );
    }
  }
};

const validateUniqueness = (payload: SeedPayload) => {
  assertUnique(payload.industries, (row) => row.id ?? "", "industry id");
  assertUnique(payload.industries, (row) => row.name.toLowerCase(), "industry name");

  const allUsers = [...payload.expertUsers, ...payload.clientUsers];
  assertUnique(allUsers, (row) => row.id, "user id");
  assertUnique(allUsers, (row) => row.email.toLowerCase(), "user email");

  assertUnique(payload.clients, (row) => row.id ?? "", "client id");
  assertUnique(payload.clients, (row) => row.userId ?? "", "client userId");
  assertUnique(payload.clients, (row) => row.email?.toLowerCase() ?? "", "client email");

  assertUnique(payload.experts, (row) => row.id ?? "", "expert id");
  assertUnique(payload.experts, (row) => row.userId ?? "", "expert userId");
  assertUnique(payload.experts, (row) => row.email?.toLowerCase() ?? "", "expert email");

  assertUnique(payload.testimonials, (row) => row.id ?? "", "testimonial id");
};

const parseSeedPayload = async (filePath: string): Promise<SeedPayload> => {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;
    if (fileError.code === "ENOENT") {
      throw new Error(
        `Seed file not found: ${filePath}. Provide a valid JSON path, e.g. 'npm run seed:file -- prisma/my-seed.json'.`
      );
    }
    throw error;
  }

  const parsed = JSON.parse(raw) as Partial<SeedPayload>;

  const payload: SeedPayload = {
    industries: assertArray<Prisma.IndustryCreateManyInput>(
      parsed.industries,
      "industries"
    ),
    expertUsers: assertArray<Prisma.UserCreateManyInput>(
      parsed.expertUsers,
      "expertUsers"
    ),
    clientUsers: assertArray<Prisma.UserCreateManyInput>(
      parsed.clientUsers,
      "clientUsers"
    ),
    clients: assertArray<Prisma.ClientCreateManyInput>(parsed.clients, "clients"),
    experts: assertArray<Prisma.ExpertCreateManyInput>(parsed.experts, "experts"),
    testimonials: assertArray<Prisma.TestimonialCreateManyInput>(
      parsed.testimonials,
      "testimonials"
    ),
    summary: parsed.summary,
  };

  validateUniqueness(payload);
  validateEnums(payload);
  validateRelations(payload);

  return payload;
};

const batchCreateMany = async <T extends Record<string, unknown>>(
  createMany: (args: { data: T[]; skipDuplicates: boolean }) => Promise<unknown>,
  rows: T[],
  batchSize: number
) => {
  for (const chunk of chunkArray(rows, batchSize)) {
    await createMany({ data: chunk, skipDuplicates: true });
  }
};

const seed = async (seedFileArg?: string) => {
  const seedFile = seedFileArg || DEFAULT_SEED_FILE;
  const resolvedSeedFile = path.resolve(process.cwd(), seedFile);
  const batchSize = Math.max(
    1,
    Number.parseInt(process.env.SEED_BATCH_SIZE || "", 10) || DEFAULT_BATCH_SIZE
  );

  const payload = await parseSeedPayload(resolvedSeedFile);

  await prisma.$connect();

  try {
    await prisma.$transaction(async (tx) => {
      await batchCreateMany(
        (args) => tx.industry.createMany(args),
        payload.industries,
        batchSize
      );

      const allUsers = [...payload.expertUsers, ...payload.clientUsers];
      await batchCreateMany((args) => tx.user.createMany(args), allUsers, batchSize);

      await batchCreateMany((args) => tx.client.createMany(args), payload.clients, batchSize);
      await batchCreateMany((args) => tx.expert.createMany(args), payload.experts, batchSize);
      await batchCreateMany(
        (args) => tx.testimonial.createMany(args),
        payload.testimonials,
        batchSize
      );

      // --- Account seeding for demo users ---
      // Define demo users and their passwords (match your demo script)
      const demoAccounts = [
        {
          id: "6f9d1cf7-6bda-4c3a-8e76-87d0036939c5",
          accountId: "cc4208e1-456d-43af-a5bd-47a48a5c9325",
          providerId: "credential",
          userId: "cc4208e1-456d-43af-a5bd-47a48a5c9325",
          password: await bcrypt.hash(process.env.DEMO_ADMIN_PASSWORD || "Admin&12345", 10),
        },
        {
          id: "vmt8nldX0uhOPDGfBcgX3QxBkS9iQ5Ix",
          accountId: "zWRqaTeWFFPvrZyaGLpQtRgdZwnJGnj9",
          providerId: "credential",
          userId: "zWRqaTeWFFPvrZyaGLpQtRgdZwnJGnj9",
          password: await bcrypt.hash(process.env.DEMO_CLIENT_PASSWORD || "Anisha&12345", 10),
        },
        {
          id: "hoa0bG4Sd0AnKsICmgBv7fXZPHCwAS3u",
          accountId: "osTobXJXugavw2V0Umqap0EnruwFw1oy",
          providerId: "credential",
          userId: "osTobXJXugavw2V0Umqap0EnruwFw1oy",
          password: await bcrypt.hash(process.env.DEMO_EXPERT_PASSWORD || "Expert&12345", 10),
        },
        {
          id: "c0owvNqA4cyyqyWiAUFwkltqoKLtuYbr",
          accountId: "a6BuotBirpAG0EL1mhVcZEtHMGhMcpED",
          providerId: "credential",
          userId: "a6BuotBirpAG0EL1mhVcZEtHMGhMcpED",
          password: await bcrypt.hash(process.env.DEMO_MAHI_PASSWORD || "Mahi&12345", 10),
        },
      ];

      // Only create accounts for users that exist in the payload
      const userIds = new Set(allUsers.map(u => u.id));
      const filteredAccounts = demoAccounts.filter(acc => userIds.has(acc.userId));
      for (const account of filteredAccounts) {
        await tx.account.create({ data: account });
      }
      // --- End Account seeding ---
    });

    console.log("Seed completed successfully", {
      file: resolvedSeedFile,
      batchSize,
      counts: {
        industries: payload.industries.length,
        expertUsers: payload.expertUsers.length,
        clientUsers: payload.clientUsers.length,
        clients: payload.clients.length,
        experts: payload.experts.length,
        testimonials: payload.testimonials.length,
        accounts: 4,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
};

seed(process.argv[2]).catch(async (error) => {
  console.error("Seed failed", error);
  await prisma.$disconnect().catch(() => null);
  process.exit(1);
});
