import { PrismaClient } from '../src/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const demoExperts = await prisma.expert.findMany({
    where: {
      email: {
        in: [
          'demo.expert1@consuledge.com',
          'demo.expert2@consuledge.com',
          'demo.expert3@consuledge.com',
        ],
      },
    },
    select: { id: true, email: true, fullName: true },
  });
  console.log('Demo Expert UUIDs:');
  for (const expert of demoExperts) {
    console.log(`${expert.email} | ${expert.fullName} | UUID: ${expert.id}`);
  }
  process.exit(0);
}

main();
