// prisma/hash-seed-passwords.ts
// Usage: npx tsx prisma/hash-seed-passwords.ts prisma/seed-data.json

import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';

async function main() {
  const file = process.argv[2] || 'prisma/seed-data.json';
  const abs = path.resolve(process.cwd(), file);
  const raw = await fs.readFile(abs, 'utf8');
  const data = JSON.parse(raw);

  let changed = false;

  // Patch all password fields in expertUsers, clientUsers, and accounts
  const hashUserPasswords = async (users: any[]) => {
    for (const user of users) {
      if (user.password && !user.password.startsWith('$2b$')) {
        user.password = await bcrypt.hash(user.password, 10);
        changed = true;
      }
    }
  };

  if (Array.isArray(data.expertUsers)) await hashUserPasswords(data.expertUsers);
  if (Array.isArray(data.clientUsers)) await hashUserPasswords(data.clientUsers);
  if (Array.isArray(data.accounts)) await hashUserPasswords(data.accounts);

  if (changed) {
    await fs.writeFile(abs, JSON.stringify(data, null, 2));
    console.log('Passwords hashed and file updated:', abs);
  } else {
    console.log('No plaintext passwords found. No changes made.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
