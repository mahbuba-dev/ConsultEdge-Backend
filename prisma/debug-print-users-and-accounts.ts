
import "dotenv/config";
import { prisma } from '../src/lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true }
  });
  const accounts = await prisma.account.findMany({
    select: { id: true, accountId: true, providerId: true, userId: true, password: true }
  });

  console.log("USERS:");
  users.forEach(u => console.log(u));
  console.log("\nACCOUNTS:");
  accounts.forEach(a => console.log(a));
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
