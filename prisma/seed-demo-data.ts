import "dotenv/config";
console.log("DATABASE_URL:", process.env.DATABASE_URL);
import { PrismaClient } from '../src/generated/client.js';
import { Role, UserStatus } from '../src/generated/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
import { faker } from '@faker-js/faker';




// Weighted random helper
function weightedRandom(weights: number[]) {
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < weights.length; i++) {
    if (r < weights[i]) return i;
    r -= weights[i];
  }
  return weights.length - 1;
}

// Growth curve helpers
function logisticGrowth(x: number, L = 1, k = 1, x0 = 0) {
  // L: curve max, k: steepness, x0: midpoint
  return L / (1 + Math.exp(-k * (x - x0)));
}
function expGrowth(x: number, base = 1.1, start = 1) {
  return start * Math.pow(base, x);
}
function plateau(x: number, max = 1, start = 0.5, plateauAt = 3) {
  return x < plateauAt ? start + (max - start) * (x / plateauAt) : max;
}
function decline(x: number, start = 1, rate = 0.8) {
  return start * Math.pow(rate, x);
}

// Helper for seasonal/weekly variation
function seasonalVariation(base: number, week: number, month: number) {
  // Simulate higher activity in some weeks/months
  const season = 1 + 0.2 * Math.sin((2 * Math.PI * (month + week / 4)) / 6);
  const spike = Math.random() < 0.15 ? faker.number.float({ min: 1.5, max: 2.5 }) : 1;
  const dip = Math.random() < 0.1 ? faker.number.float({ min: 0.3, max: 0.7 }) : 1;
  return base * season * spike * dip;
}

import bcrypt from 'bcrypt';

async function main() {
  // Clean up any existing demo users/accounts and related records by email (force delete)
  const demoEmails = [
    'admin@gmail.com',
    'anisha@gmail.com',
    'expert@consultedge.demo',
    'mahi@gmail.com'
  ];
  // Find all demo users by email
  const existingDemoUsers = await prisma.user.findMany({ where: { email: { in: demoEmails } } });
  const demoUserIds = existingDemoUsers.map(u => u.id);
  // Fetch all experts whose userId is in demoUserIds
  const demoExperts = await prisma.expert.findMany({ where: { userId: { in: demoUserIds } } });
  const demoExpertIds = demoExperts.map(e => e.id);
  // Delete related expert_verifications for these experts
  try { await prisma.expertVerification.deleteMany({ where: { expertId: { in: demoExpertIds } } }); } catch (e) { console.warn('expert_verifications cleanup failed', e); }
  // Delete related expert records
  try { await prisma.expert.deleteMany({ where: { id: { in: demoExpertIds } } }); } catch {}
  // Delete related client records (all demoUserIds)
  try { await prisma.client.deleteMany({ where: { userId: { in: demoUserIds } } }); } catch {}
  // Delete related accounts (all demoUserIds)
  await prisma.account.deleteMany({ where: { userId: { in: demoUserIds } } });
  // Delete users (all demoUserIds)
  await prisma.user.deleteMany({ where: { id: { in: demoUserIds } } });

  // Demo users
  const demoUsers = [
    {
      id: 'cc4208e1-456d-43af-a5bd-47a48a5c9325',
      email: 'admin@gmail.com',
      name: 'Ahmed Khan',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
    {
      id: 'zWRqaTeWFFPvrZyaGLpQtRgdZwnJGnj9',
      email: 'anisha@gmail.com',
      name: 'Anisha',
      role: Role.CLIENT,
      status: UserStatus.ACTIVE,
    },
    {
      id: 'osTobXJXugavw2V0Umqap0EnruwFw1oy',
      email: 'expert@consultedge.demo',
      name: 'Demo Expert',
      role: Role.EXPERT,
      status: UserStatus.ACTIVE,
    },
    {
      id: 'a6BuotBirpAG0EL1mhVcZEtHMGhMcpED',
      email: 'mahi@gmail.com',
      name: 'Mahi',
      role: Role.EXPERT,
      status: UserStatus.ACTIVE,
    },
  ];

  for (const user of demoUsers) {
    await prisma.user.create({ data: user });
  }

  // Demo accounts (BetterAuth expects bcrypt hash, providerId: 'credential')
  const demoAccounts = [
    {
      id: '6f9d1cf7-6bda-4c3a-8e76-87d0036939c5',
      accountId: 'cc4208e1-456d-43af-a5bd-47a48a5c9325',
      providerId: 'credential',
      userId: 'cc4208e1-456d-43af-a5bd-47a48a5c9325',
      password: await bcrypt.hash(process.env.DEMO_ADMIN_PASSWORD || 'Admin&12345', 10),
    },
    {
      id: 'vmt8nldX0uhOPDGfBcgX3QxBkS9iQ5Ix',
      accountId: 'zWRqaTeWFFPvrZyaGLpQtRgdZwnJGnj9',
      providerId: 'credential',
      userId: 'zWRqaTeWFFPvrZyaGLpQtRgdZwnJGnj9',
      password: await bcrypt.hash(process.env.DEMO_CLIENT_PASSWORD || 'Anisha&12345', 10),
    },
    {
      id: 'hoa0bG4Sd0AnKsICmgBv7fXZPHCwAS3u',
      accountId: 'osTobXJXugavw2V0Umqap0EnruwFw1oy',
      providerId: 'credential',
      userId: 'osTobXJXugavw2V0Umqap0EnruwFw1oy',
      password: await bcrypt.hash(process.env.DEMO_EXPERT_PASSWORD || 'Expert&12345', 10),
    },
    {
      id: 'c0owvNqA4cyyqyWiAUFwkltqoKLtuYbr',
      accountId: 'a6BuotBirpAG0EL1mhVcZEtHMGhMcpED',
      providerId: 'credential',
      userId: 'a6BuotBirpAG0EL1mhVcZEtHMGhMcpED',
      password: await bcrypt.hash(process.env.DEMO_MAHI_PASSWORD || 'Mahi&12345', 10),
    },
  ];

  for (const account of demoAccounts) {
    await prisma.account.create({ data: account });
  }

  console.log('Demo data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
