import "dotenv/config";
import { PrismaClient } from '../src/generated/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const bcrypt = await import('bcrypt');

async function main() {
  const users = [
    { email: process.env.DEMO_ADMIN_EMAIL || 'admin@gmail.com', password: process.env.DEMO_ADMIN_PASSWORD || 'Admin&12345' },
    { email: process.env.DEMO_CLIENT_EMAIL || 'anisha@gmail.com', password: process.env.DEMO_CLIENT_PASSWORD || 'Anisha&12345' },
    { email: process.env.DEMO_EXPERT_EMAIL || 'mahi@gmail.com', password: process.env.DEMO_EXPERT_PASSWORD || 'Mahi&12345' },
  ];

  for (const { email, password } of users) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.account.deleteMany({ where: { accountId: user.id } });
      const hashed = await bcrypt.hash(password, 10);
      await prisma.account.create({
        data: {
          id: user.id + '-account',
          accountId: user.id,
          providerId: 'credential',
          userId: user.id,
          password: hashed,
        },
      });
      console.log(`Reset account for user: ${email}`);
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
