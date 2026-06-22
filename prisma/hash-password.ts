import bcrypt from "bcryptjs";

// Usage: npx tsx prisma/hash-password.ts <password>
// Prints a bcrypt hash to paste into ADMIN_PASSWORD_HASH in .env.
const password = process.argv[2];

if (!password) {
  console.error("Usage: npx tsx prisma/hash-password.ts <password>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);

// Next's env loader (@next/env) expands `$...` in .env values, which mangles a
// bcrypt hash. Escape every `$` as `\$` so the value is read literally.
console.log("\nPaste this line into .env:\n");
console.log(`ADMIN_PASSWORD_HASH="${hash.replace(/\$/g, "\\$")}"`);
console.log("");
