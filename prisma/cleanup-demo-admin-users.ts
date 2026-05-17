import "dotenv/config";
import { prisma } from '../src/lib/prisma';

async function main() {
  // Only keep this admin user
  const keepAdminEmail = 'admin@gmail.com';

  // Find all admin users except the one to keep
  const adminsToDelete = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
      email: { not: keepAdminEmail },
    },
    select: { id: true, email: true },
  });

  for (const admin of adminsToDelete) {
    console.log(`Deleting admin: ${admin.email} (${admin.id})`);
    await prisma.account.deleteMany({ where: { userId: admin.id } });
    await prisma.admin.deleteMany({ where: { userId: admin.id } });
    await prisma.user.delete({ where: { id: admin.id } });
  }

  // Delete all accounts for admin@gmail.com except providerId 'credentials'
  const keepAdmin = await prisma.user.findUnique({ where: { email: keepAdminEmail } });
  if (keepAdmin) {
    await prisma.account.deleteMany({
      where: {
        userId: keepAdmin.id,
        providerId: { not: 'credentials' },
      },
    });
  }

  console.log('Cleanup complete. Only the correct demo admin remains.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
