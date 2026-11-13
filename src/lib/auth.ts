/**
 * Admin authentication (server-only).
 *
 * Password source, in priority order:
 *   1. Salted scrypt hash saved in storage (Vercel Blob in prod, .local-storage in dev)
 *      when you change the password inside the Admin Portal.
 *   2. ADMIN_PASSWORD environment variable (if set).
 *   3. Initial bootstrap password ("admin123") until changed in the Admin Portal.
 *
 * Sessions are HMAC-signed, httpOnly cookies. The signing key includes the
 * current password hash, so changing the password invalidates every other
 * active session immediately.
 */
import crypto from "crypto";
import { cookies } from "next/headers";
import { readJson, writeJson } from "@/lib/storage";

const COOKIE_NAME = "admin_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7; // 7 days
const INITIAL_PASSWORD = "admin123";
export const MIN_PASSWORD_LENGTH = 6;

interface AuthDoc {
  salt: string;
  hash: string;
  updatedAt: string;
}

interface Credential {
  salt: string;
  hash: string;
  source: "stored" | "env" | "initial";
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export async function getCredential(): Promise<Credential> {
  const stored = await readJson<AuthDoc>("auth");
  if (stored?.hash && stored.salt) {
    return { salt: stored.salt, hash: stored.hash, source: "stored" };
  }

  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword) {
    const salt = "env-initial-password";
    return { salt, hash: hashPassword(envPassword, salt), source: "env" };
  }

  const salt = "initial-bootstrap-password";
  return {
    salt,
    hash: hashPassword(INITIAL_PASSWORD, salt),
    source: "initial",
  };
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

export async function checkPassword(password: string): Promise<boolean> {
  const cred = await getCredential();
  return safeEqual(hashPassword(password, cred.salt), cred.hash);
}

export async function setPassword(newPassword: string): Promise<void> {
  const salt = crypto.randomBytes(16).toString("hex");
  const doc: AuthDoc = {
    salt,
    hash: hashPassword(newPassword, salt),
    updatedAt: new Date().toISOString(),
  };
  await writeJson("auth", doc);
}

function sign(payload: string, cred: Credential): string {
  const key = `${process.env.AUTH_SECRET ?? ""}:${cred.hash}`;
  return crypto.createHmac("sha256", key).update(payload).digest("hex");
}

export async function createSession(): Promise<void> {
  const cred = await getCredential();
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `admin.${exp}`;
  cookies().set(COOKIE_NAME, `${payload}.${sign(payload, cred)}`, {
    httpOnly: true,
    secure: process.env.VERCEL === "1",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export function clearSession(): void {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function isAuthenticated(): Promise<boolean> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "admin") return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp < Date.now() / 1000) return false;

  const cred = await getCredential();
  return safeEqual(parts[2], sign(`admin.${parts[1]}`, cred));
}

/* ---- Best-effort brute-force protection (per server instance) ---- */
const attempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export function isLockedOut(ip: string): boolean {
  const entry = attempts.get(ip);
  return Boolean(entry && entry.lockedUntil > Date.now());
}

export function recordFailedLogin(ip: string): void {
  const entry = attempts.get(ip) ?? { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCK_MS;
    entry.count = 0;
  }
  attempts.set(ip, entry);
}

export function clearFailedLogins(ip: string): void {
  attempts.delete(ip);
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
