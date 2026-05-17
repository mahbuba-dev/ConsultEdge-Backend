import { PrismaClient } from '../src/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  // Find all demo experts
  const demoExpertEmails = [
    'demo.expert1@consuledge.com',
    'demo.expert2@consuledge.com',
    'demo.expert3@consuledge.com',
  ];
  const demoExperts = await prisma.expert.findMany({
    where: { email: { in: demoExpertEmails } },
    select: { id: true, email: true, fullName: true },
  });
  for (const expert of demoExperts) {
    const consultCount = await prisma.consultation.count({ where: { expertId: expert.id } });
    console.log(`Expert: ${expert.email} (${expert.fullName}) - Consultations: ${consultCount}`);
  }
  process.exit(0);
}

main();
