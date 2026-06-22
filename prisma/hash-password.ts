import bcrypt from "bcryptjs";

// Usage: npx tsx prisma/hash-password.ts <password>
// Prints a bcrypt hash to paste into ADMIN_PASSWORD_HASH in .env.
const password = process.argv[2];

if (!password) {
  console.error("Usage: npx tsx prisma/hash-password.ts <password>");
  process.exit(1);
}

console.log(bcrypt.hashSync(password, 10));
