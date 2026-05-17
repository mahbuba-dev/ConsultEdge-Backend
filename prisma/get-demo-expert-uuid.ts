import { PrismaClient } from '../src/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const expert = await prisma.expert.findUnique({
    where: { email: 'mahi@gmail.com' },
    select: { id: true, email: true, fullName: true },
  });
  if (!expert) {
    console.log('No expert found with email mahi@gmail.com');
  } else {
    console.log(`Demo Expert: ${expert.email} | ${expert.fullName} | UUID: ${expert.id}`);
  }
  process.exit(0);
}

main();
