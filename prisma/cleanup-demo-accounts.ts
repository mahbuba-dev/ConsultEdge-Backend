import "dotenv/config";
import { PrismaClient } from '../src/generated/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const emails = [
    process.env.DEMO_ADMIN_EMAIL || 'admin@gmail.com',
    process.env.DEMO_CLIENT_EMAIL || 'client@consultedge.demo',
    process.env.DEMO_EXPERT_EMAIL || 'expert@consultedge.demo',
  ];

  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.account.deleteMany({ where: { accountId: user.id } });
      console.log(`Deleted all accounts for user: ${email}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
