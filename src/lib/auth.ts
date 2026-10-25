import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, lt } from "drizzle-orm";
import { db, schema } from "@/db";

export const SESSION_COOKIE = "tb_session";
const SESSION_DAYS = 30;

export const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
export const newToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}
export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export function passwordProblems(pw: string): string | null {
  if (pw.length < 10) return "Le mot de passe doit contenir au moins 10 caractères.";
  if (!/[a-zA-Z]/.test(pw) || !/[0-9\W_]/.test(pw)) return "Le mot de passe doit mêler lettres et chiffres ou symboles.";
  return null;
}

export async function createSession(userId: string) {
  const token = newToken();
  const h = await headers();
  await db.insert(schema.sessions).values({
    id: sha256(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_DAYS * 864e5),
    userAgent: h.get("user-agent")?.slice(0, 200) ?? null,
  });
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, userId));
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(schema.sessions).where(eq(schema.sessions.id, sha256(token)));
  jar.delete(SESSION_COOKIE);
}

export type SessionUser = Pick<typeof schema.users.$inferSelect, "id" | "email" | "firstName" | "lastName" | "role" | "company" | "phone" | "marketingConsent">;

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  await connection(); // lecture de l'horloge : rendu à la requête uniquement
  const rows = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
      role: schema.users.role,
      company: schema.users.company,
      phone: schema.users.phone,
      marketingConsent: schema.users.marketingConsent,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(and(eq(schema.sessions.id, sha256(token)), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export async function requireUser(next = "/compte") {
  const u = await getCurrentUser();
  if (!u) redirect(`/compte/connexion?suite=${encodeURIComponent(next)}`);
  return u;
}

export async function requireAdmin() {
  const u = await getCurrentUser();
  if (!u) redirect(`/compte/connexion?suite=${encodeURIComponent("/admin")}`);
  if (u.role !== "admin") redirect("/compte?acces=refuse");
  return u;
}

// --- Limitation des tentatives de connexion (par email et par IP) ---
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "local";
}

export async function isRateLimited(keys: string[]) {
  for (const k of keys) {
    const key = sha256(k);
    const [row] = await db.select().from(schema.loginAttempts).where(eq(schema.loginAttempts.key, key)).limit(1);
    if (row && Date.now() - row.windowStart.getTime() < WINDOW_MS && row.count >= MAX_ATTEMPTS) return true;
  }
  return false;
}

export async function recordAttempt(keys: string[], success: boolean) {
  for (const k of keys) {
    const key = sha256(k);
    if (success) {
      await db.delete(schema.loginAttempts).where(eq(schema.loginAttempts.key, key));
      continue;
    }
    const [row] = await db.select().from(schema.loginAttempts).where(eq(schema.loginAttempts.key, key)).limit(1);
    if (!row || Date.now() - row.windowStart.getTime() >= WINDOW_MS) {
      await db
        .insert(schema.loginAttempts)
        .values({ key, count: 1, windowStart: new Date() })
        .onConflictDoUpdate({ target: schema.loginAttempts.key, set: { count: 1, windowStart: new Date() } });
    } else {
      await db.update(schema.loginAttempts).set({ count: row.count + 1 }).where(eq(schema.loginAttempts.key, key));
    }
  }
}

export async function purgeExpiredSessions() {
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
}

let dummy: Promise<string> | null = null;
/** Hash factice pour comparer en temps constant quand le compte n'existe pas. */
export function dummyHash() {
  dummy ??= bcrypt.hash("tambre-dummy-password", 12);
  return dummy;
}
