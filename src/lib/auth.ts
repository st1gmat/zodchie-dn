import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (secret) return new TextEncoder().encode(secret);

  // Dev convenience: fall back to a fixed key so login works with no env setup.
  // Production still requires a real secret and fails loudly without one.
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode("dev-insecure-session-secret");
  }

  throw new Error("SESSION_SECRET is not set");
}

/** Default dev password when no hash is configured (non-production only). */
export const DEV_ADMIN_PASSWORD = "admin";

/** Single-admin login: compare against the bcrypt hash in ADMIN_PASSWORD_HASH. */
export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return bcrypt.compare(password, hash);

  // Dev convenience: with no hash configured, skip bcrypt entirely and accept a
  // plaintext password (ADMIN_PASSWORD, or "admin" by default) so you don't have
  // to generate a hash locally. Never active in production — a hash is required
  // there, so a missing hash still fails closed.
  if (process.env.NODE_ENV !== "production") {
    return password === (process.env.ADMIN_PASSWORD ?? DEV_ADMIN_PASSWORD);
  }

  return false;
}

/** Issue a signed session cookie. Call only from a Server Action / Route Handler. */
export async function createSession(): Promise<void> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    // Secure in production, unless explicitly relaxed for an HTTP-only test
    // deploy (set SESSION_COOKIE_INSECURE=true there — testing only).
    secure:
      process.env.NODE_ENV === "production" &&
      process.env.SESSION_COOKIE_INSECURE !== "true",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** True when the request carries a valid admin session cookie. */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

/** Redirect to the login page unless a valid admin session is present. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/admin/login");
}
