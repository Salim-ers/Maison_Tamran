"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db, schema } from "@/db";
import {
  clientIp, createSession, dummyHash, destroySession, getCurrentUser, hashPassword, isRateLimited, newToken, passwordProblems, recordAttempt, sha256, verifyPassword,
} from "@/lib/auth";
import { attachCartToUser } from "@/lib/cart";
import { sendEmail, simpleEmail } from "@/lib/email";
import { siteUrl } from "@/lib/env";
import { COUNTRY_CODES } from "@/lib/countries";

export type FormState = { ok?: boolean; error?: string | null; message?: string; fields?: Record<string, string> };

/** Chemin de retour sûr (interne uniquement). */
function safeNext(raw: unknown) {
  const s = typeof raw === "string" ? raw : "";
  return s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/\\") ? s : "/compte";
}

const loginInput = z.object({ email: z.email("Adresse email invalide."), password: z.string().min(1, "Mot de passe requis.").max(200) });

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const parsed = loginInput.safeParse({ email, password: form.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields: { email } };
  const ip = await clientIp();
  const keys = [`login:${email}`, `ip:${ip}`];
  if (await isRateLimited(keys)) return { error: "Trop de tentatives. Patientez quinze minutes avant de réessayer.", fields: { email } };
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  // comparaison même si l'utilisateur n'existe pas (temps de réponse homogène)
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? (await dummyHash()));
  if (!user || !ok) {
    await recordAttempt(keys, false);
    return { error: "Email ou mot de passe incorrect.", fields: { email } };
  }
  await recordAttempt(keys, true);
  await createSession(user.id);
  await attachCartToUser(user.id);
  redirect(user.role === "admin" && safeNext(form.get("suite")) === "/compte" ? "/admin" : safeNext(form.get("suite")));
}

const registerInput = z.object({
  firstName: z.string().trim().min(1, "Prénom requis.").max(80),
  lastName: z.string().trim().min(1, "Nom requis.").max(80),
  email: z.email("Adresse email invalide.").max(200),
  password: z.string().max(200),
});

export async function register(_: FormState, form: FormData): Promise<FormState> {
  const fields = { firstName: String(form.get("firstName") ?? ""), lastName: String(form.get("lastName") ?? ""), email: String(form.get("email") ?? "").trim().toLowerCase(), cgu: String(form.get("cgu") ?? "") };
  const parsed = registerInput.safeParse({ ...fields, password: form.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields };
  const problem = passwordProblems(parsed.data.password);
  if (problem) return { error: problem, fields };
  if (form.get("cgu") !== "on") return { error: "Acceptez la politique de confidentialité pour créer votre compte.", fields };
  const [exists] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, parsed.data.email)).limit(1);
  if (exists) return { error: "Un compte existe déjà avec cet email. Connectez-vous ou réinitialisez votre mot de passe.", fields };
  const [user] = await db
    .insert(schema.users)
    .values({
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      marketingConsent: false,
    })
    .returning();
  await createSession(user.id);
  await attachCartToUser(user.id);
  await sendEmail({
    to: user.email,
    subject: "Bienvenue chez TAMBRÉ",
    template: "welcome",
    html: simpleEmail(`Bienvenue, ${user.firstName}`, ["Votre compte est créé. Vous y retrouverez vos commandes, leur suivi et vos adresses de livraison."], { label: "Mon compte", url: `${siteUrl()}/compte` }),
  });
  redirect(safeNext(form.get("suite")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function requestPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!z.email().safeParse(email).success) return { error: "Adresse email invalide.", fields: { email } };
  if (await isRateLimited([`reset:${email}`])) return { ok: true, message: "Si un compte existe pour cette adresse, un email vient d'être envoyé." };
  await recordAttempt([`reset:${email}`], false);
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (user) {
    const token = newToken();
    await db.insert(schema.passwordResets).values({ id: sha256(token), userId: user.id, expiresAt: new Date(Date.now() + 3600_000) });
    await sendEmail({
      to: email,
      subject: "Réinitialiser votre mot de passe",
      template: "password_reset",
      html: simpleEmail("Nouveau mot de passe", ["Vous avez demandé à réinitialiser votre mot de passe. Ce lien est valable une heure.", "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : votre mot de passe reste inchangé."], { label: "Choisir un nouveau mot de passe", url: `${siteUrl()}/compte/reinitialiser?t=${token}` }),
    });
  }
  // Réponse identique que le compte existe ou non (pas d'énumération des comptes)
  return { ok: true, message: "Si un compte existe pour cette adresse, un email vient d'être envoyé. Pensez à vérifier vos courriers indésirables." };
}

export async function resetPassword(_: FormState, form: FormData): Promise<FormState> {
  const token = String(form.get("t") ?? "");
  const pw = String(form.get("password") ?? "");
  if (pw !== String(form.get("confirm") ?? "")) return { error: "Les deux mots de passe ne correspondent pas." };
  const problem = passwordProblems(pw);
  if (problem) return { error: problem };
  const [row] = await db
    .select()
    .from(schema.passwordResets)
    .where(and(eq(schema.passwordResets.id, sha256(token)), gt(schema.passwordResets.expiresAt, new Date()), isNull(schema.passwordResets.usedAt)))
    .limit(1);
  if (!row) return { error: "Ce lien a expiré ou a déjà été utilisé. Faites une nouvelle demande." };
  await db.update(schema.users).set({ passwordHash: await hashPassword(pw) }).where(eq(schema.users.id, row.userId));
  await db.update(schema.passwordResets).set({ usedAt: new Date() }).where(eq(schema.passwordResets.id, row.id));
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, row.userId)); // déconnecte les autres appareils
  await createSession(row.userId);
  redirect("/compte?motdepasse=modifie");
}

const profileInput = z.object({
  firstName: z.string().trim().min(1, "Prénom requis.").max(80),
  lastName: z.string().trim().min(1, "Nom requis.").max(80),
  phone: z.string().trim().max(30).optional(),
});

export async function updateProfile(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/compte/connexion");
  const parsed = profileInput.safeParse({ firstName: form.get("firstName"), lastName: form.get("lastName"), phone: form.get("phone") ?? undefined });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.update(schema.users).set({ ...parsed.data, phone: parsed.data.phone || null, marketingConsent: form.get("marketing") === "on" }).where(eq(schema.users.id, user.id));
  return { ok: true, message: "Vos informations sont enregistrées." };
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/compte/connexion");
  const [row] = await db.select().from(schema.users).where(eq(schema.users.id, user.id)).limit(1);
  if (!(await verifyPassword(String(form.get("current") ?? ""), row.passwordHash))) return { error: "Mot de passe actuel incorrect." };
  const pw = String(form.get("password") ?? "");
  const problem = passwordProblems(pw);
  if (problem) return { error: problem };
  await db.update(schema.users).set({ passwordHash: await hashPassword(pw) }).where(eq(schema.users.id, user.id));
  return { ok: true, message: "Mot de passe modifié." };
}

const addressInput = z.object({
  label: z.string().trim().max(60).optional(),
  firstName: z.string().trim().min(1, "Prénom requis.").max(80),
  lastName: z.string().trim().min(1, "Nom requis.").max(80),
  company: z.string().trim().max(120).optional(),
  line1: z.string().trim().min(3, "Adresse requise.").max(160),
  line2: z.string().trim().max(160).optional(),
  postalCode: z.string().trim().min(3, "Code postal requis.").max(12),
  city: z.string().trim().min(1, "Ville requise.").max(100),
  country: z.string().refine((c) => COUNTRY_CODES.includes(c), "Pays non desservi."),
  phone: z.string().trim().max(30).optional(),
});

export async function saveAddress(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/compte/connexion");
  const data = Object.fromEntries(["label", "firstName", "lastName", "company", "line1", "line2", "postalCode", "city", "country", "phone"].map((k) => [k, String(form.get(k) ?? "")]));
  const parsed = addressInput.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields: data };
  const v = parsed.data;
  const values = { label: v.label || null, firstName: v.firstName, lastName: v.lastName, company: v.company || null, line1: v.line1, line2: v.line2 || null, postalCode: v.postalCode, city: v.city, country: v.country, phone: v.phone || null, isDefault: form.get("isDefault") === "on" };
  if (values.isDefault) await db.update(schema.addresses).set({ isDefault: false }).where(eq(schema.addresses.userId, user.id));
  const id = String(form.get("id") ?? "");
  if (id) {
    await db.update(schema.addresses).set(values).where(and(eq(schema.addresses.id, id), eq(schema.addresses.userId, user.id)));
  } else {
    await db.insert(schema.addresses).values({ ...values, userId: user.id });
  }
  redirect("/compte/adresses?enregistree=1");
}

export async function deleteAddress(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/compte/connexion");
  if (!z.uuid().safeParse(id).success) return;
  await db.delete(schema.addresses).where(and(eq(schema.addresses.id, id), eq(schema.addresses.userId, user.id)));
  redirect("/compte/adresses");
}

/** Suivi invité : numéro de commande + email → lien d'accès sécurisé. */
export async function lookupOrder(_: FormState, form: FormData): Promise<FormState> {
  const number = String(form.get("number") ?? "").trim().toUpperCase();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!number || !email) return { error: "Indiquez le numéro de commande et l'email utilisé.", fields: { number, email } };
  const ip = await clientIp();
  if (await isRateLimited([`track:${ip}`])) return { error: "Trop de tentatives. Patientez quinze minutes.", fields: { number, email } };
  const [o] = await db.select().from(schema.orders).where(and(eq(schema.orders.number, number), eq(schema.orders.email, email))).limit(1);
  if (!o) {
    await recordAttempt([`track:${ip}`], false);
    return { error: "Aucune commande ne correspond à ce numéro et à cet email.", fields: { number, email } };
  }
  const { orderToken } = await import("@/lib/orders");
  redirect(`/suivi-commande/${encodeURIComponent(o.number)}?t=${orderToken(o.id)}`);
}
