

import { PrismaClient } from '../src/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! })
});

(async () => {
  const consults = await prisma.consultation.count();
  const testimonials = await prisma.testimonial.count();
  const paid = await prisma.payment.count({ where: { status: 'PAID' } });
  console.log({ consults, testimonials, paid });
  process.exit(0);
})();
