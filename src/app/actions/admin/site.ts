"use server";

import { z } from "zod";
import { refresh, updateTag } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { CONTENT_ENTRIES } from "@/content";
import type { ActionState } from "@/components/admin/types";
import {
  assertConfirmed, done, fail, formObject, run, splitList, zCheckbox, zEuros, zId, zInt, zOptDate, zOptEuros, zOptInt, zOptText, zText, zodFail,
} from "./helpers";

// ---------------------------------------------------------------------------
// Codes promotionnels
// ---------------------------------------------------------------------------
const promoInput = z
  .object({
    code: z
      .string()
      .transform((s) => s.trim().toUpperCase())
      .pipe(z.string().min(3, "Le code doit contenir au moins 3 caractères.").max(32).regex(/^[A-Z0-9_-]+$/, "Le code ne peut contenir que des lettres sans accent, des chiffres, des tirets et des soulignés.")),
    kind: z.enum(["percent", "fixed", "free_shipping"], { message: "Type invalide." }),
    percentValue: z.string().optional(),
    fixedValue: z.string().optional(),
    minSubtotalCents: zEuros("Le minimum d'achat"),
    startsAt: zOptDate(false),
    endsAt: zOptDate(true),
    maxUses: zOptInt("Le nombre maximal d'utilisations", 1, 1000000),
    active: zCheckbox,
    note: zOptText(500),
  })
  .transform((v, ctx) => {
    let value = 0;
    if (v.kind === "percent") {
      const n = Number((v.percentValue ?? "").trim());
      if (!Number.isInteger(n) || n < 1 || n > 100) {
        ctx.addIssue({ code: "custom", path: ["percentValue"], message: "Pourcentage entier entre 1 et 100." });
        return z.NEVER;
      }
      value = n;
    } else if (v.kind === "fixed") {
      const c = zOptEuros("Le montant").safeParse(v.fixedValue);
      if (!c.success || !c.data) {
        ctx.addIssue({ code: "custom", path: ["fixedValue"], message: "Montant de remise en euros, supérieur à 0 (ex. 5,00)." });
        return z.NEVER;
      }
      value = c.data;
    }
    if (v.startsAt && v.endsAt && v.endsAt < v.startsAt) {
      ctx.addIssue({ code: "custom", path: ["endsAt"], message: "La date de fin doit suivre la date de début." });
      return z.NEVER;
    }
    const { percentValue: _p, fixedValue: _f, ...rest } = v;
    void _p;
    void _f;
    return { ...rest, value };
  });

export async function savePromo(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const obj = formObject(form);
  const pid = obj.id ? zId.safeParse(obj.id) : null;
  if (pid && !pid.success) return fail("Identifiant invalide.");
  if (form.get("intent") === "delete") {
    const res = await run(async () => {
      if (!pid?.success) return fail("Code introuvable.");
      assertConfirmed(form);
      await db.delete(schema.promoCodes).where(eq(schema.promoCodes.id, pid.data));
      return done("Code supprimé.");
    });
    if (res.ok) refresh();
    return res;
  }
  const parsed = promoInput.safeParse(obj);
  if (!parsed.success) return zodFail(parsed.error);
  const v = parsed.data;
  const res = await run(
    async () => {
      const [dup] = await db
        .select({ id: schema.promoCodes.id })
        .from(schema.promoCodes)
        .where(pid?.success ? and(eq(schema.promoCodes.code, v.code), ne(schema.promoCodes.id, pid.data)) : eq(schema.promoCodes.code, v.code))
        .limit(1);
      if (dup) return fail("Ce code existe déjà.", { code: "Code déjà utilisé." });
      if (pid?.success) {
        const r = await db.update(schema.promoCodes).set(v).where(eq(schema.promoCodes.id, pid.data)).returning({ id: schema.promoCodes.id });
        if (!r.length) return fail("Ce code n'existe plus.");
        return done(`Code ${v.code} enregistré.`);
      }
      await db.insert(schema.promoCodes).values(v);
      return done(`Code ${v.code} créé.`);
    },
    { unique: "Ce code existe déjà." }
  );
  if (res.ok) refresh();
  return res;
}

// ---------------------------------------------------------------------------
// Livraison
// ---------------------------------------------------------------------------
const shippingInput = z.object({
  name: zText(80, "Le nom"),
  description: zOptText(300),
  countries: z
    .string()
    .optional()
    .transform((s, ctx) => {
      const list = splitList((s ?? "").toUpperCase(), /[\s,;]+/);
      if (!list.length) {
        ctx.addIssue({ code: "custom", message: "Indiquez au moins un code pays (ex. FR)." });
        return z.NEVER;
      }
      const bad = list.filter((c) => !/^[A-Z]{2}$/.test(c));
      if (bad.length) {
        ctx.addIssue({ code: "custom", message: `Codes pays invalides : ${bad.join(", ")}. Utilisez les codes ISO à deux lettres (FR, BE…).` });
        return z.NEVER;
      }
      return list;
    }),
  priceCents: zEuros("Le prix"),
  freeAboveCents: zOptEuros("Le seuil de gratuité"),
  minSubtotalCents: zEuros("Le minimum de commande"),
  active: zCheckbox,
  provisional: zCheckbox,
  sortOrder: zInt("L'ordre", -1000, 10000),
});

export async function saveShippingRate(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const obj = formObject(form);
  const sid = obj.id ? zId.safeParse(obj.id) : null;
  if (sid && !sid.success) return fail("Identifiant invalide.");
  if (form.get("intent") === "delete") {
    const res = await run(async () => {
      if (!sid?.success) return fail("Tarif introuvable.");
      assertConfirmed(form);
      await db.delete(schema.shippingRates).where(eq(schema.shippingRates.id, sid.data));
      return done("Tarif de livraison supprimé.");
    });
    if (res.ok) refresh();
    return res;
  }
  const parsed = shippingInput.safeParse(obj);
  if (!parsed.success) return zodFail(parsed.error);
  const res = await run(async () => {
    if (sid?.success) {
      const r = await db.update(schema.shippingRates).set(parsed.data).where(eq(schema.shippingRates.id, sid.data)).returning({ id: schema.shippingRates.id });
      if (!r.length) return fail("Ce tarif n'existe plus.");
      return done("Tarif de livraison enregistré.");
    }
    await db.insert(schema.shippingRates).values(parsed.data);
    return done("Tarif de livraison créé.");
  });
  if (res.ok) refresh();
  return res;
}

// ---------------------------------------------------------------------------
// Contenu éditorial
// ---------------------------------------------------------------------------
export async function saveContent(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const key = String(form.get("key") ?? "");
  const entry = CONTENT_ENTRIES.find((e) => e.key === key);
  if (!entry) return fail("Bloc de contenu inconnu.");
  const res = await run(async () => {
    if (form.get("intent") === "reset") {
      assertConfirmed(form);
      await db.delete(schema.contentBlocks).where(eq(schema.contentBlocks.key, key));
      return done("Texte par défaut rétabli.");
    }
    const value: Record<string, string> = {};
    const fieldErrors: Record<string, string> = {};
    for (const f of entry.fields) {
      const raw = String(form.get(f.name) ?? "").replace(/\r\n/g, "\n").trim();
      const max = f.type === "textarea" ? 20000 : 300;
      if (raw.length > max) fieldErrors[f.name] = `${max} caractères au maximum.`;
      if (!raw && (entry.defaults as Record<string, string>)[f.name]) fieldErrors[f.name] = "Ce texte ne peut pas être vide. Utilisez « Rétablir le texte par défaut » pour revenir à l'original.";
      value[f.name] = raw;
    }
    if (Object.keys(fieldErrors).length) return fail("Certains champs sont à corriger.", fieldErrors);
    await db
      .insert(schema.contentBlocks)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: schema.contentBlocks.key, set: { value, updatedAt: new Date() } });
    return done("Contenu enregistré et publié.");
  });
  if (res.ok) updateTag("content");
  return res;
}

// ---------------------------------------------------------------------------
// Témoignages
// ---------------------------------------------------------------------------
const moderateInput = z.object({ id: zId, intent: z.enum(["approved", "rejected", "pending", "delete"]) });

export async function moderateTestimonial(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = moderateInput.safeParse(formObject(form));
  if (!parsed.success) return zodFail(parsed.error);
  const { id, intent } = parsed.data;
  const res = await run(async () => {
    if (intent === "delete") {
      assertConfirmed(form);
      await db.delete(schema.testimonials).where(eq(schema.testimonials.id, id));
      return done("Témoignage supprimé.");
    }
    const r = await db
      .update(schema.testimonials)
      .set({ status: intent, moderatedAt: intent === "pending" ? null : new Date() })
      .where(eq(schema.testimonials.id, id))
      .returning({ id: schema.testimonials.id });
    if (!r.length) return fail("Témoignage introuvable.");
    return done(intent === "approved" ? "Témoignage approuvé : il est publié." : intent === "rejected" ? "Témoignage refusé." : "Témoignage remis en attente.");
  });
  if (res.ok) updateTag("testimonials");
  return res;
}

const testimonialInput = z.object({
  authorName: zText(80, "Le nom de l'auteur"),
  authorCity: zOptText(80),
  productSlug: zOptText(80),
  body: zText(2000, "Le témoignage"),
  rating: zOptInt("La note", 1, 5),
  orderNumber: zOptText(40),
  source: zText(300, "La source"),
  approve: zCheckbox,
});

export async function createTestimonial(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = testimonialInput.safeParse(formObject(form));
  if (!parsed.success) return zodFail(parsed.error);
  const v = parsed.data;
  const res = await run(async () => {
    let orderId: string | null = null;
    let userId: string | null = null;
    if (v.orderNumber) {
      const [o] = await db.select({ id: schema.orders.id, userId: schema.orders.userId, isDemo: schema.orders.isDemo }).from(schema.orders).where(eq(schema.orders.number, v.orderNumber.toUpperCase())).limit(1);
      if (!o) return fail("Aucune commande ne porte ce numéro. Laissez le champ vide si l'achat n'est pas vérifiable.", { orderNumber: "Commande introuvable." });
      if (o.isDemo) return fail("Une commande de démonstration ne peut pas servir de preuve d'achat.", { orderNumber: "Commande de démonstration." });
      orderId = o.id;
      userId = o.userId;
    }
    if (v.productSlug) {
      const [p] = await db.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.slug, v.productSlug)).limit(1);
      if (!p) return fail("Recette inconnue.", { productSlug: "Recette inconnue." });
    }
    const me = await requireAdmin();
    await db.transaction(async (tx) => {
      await tx
        .insert(schema.testimonials)
        .values({
          authorName: v.authorName,
          authorCity: v.authorCity,
          productSlug: v.productSlug,
          body: v.body,
          rating: v.rating,
          orderId,
          userId,
          status: v.approve ? "approved" : "pending",
          moderatedAt: v.approve ? new Date() : null,
          source: v.source,
          createdBy: me.email,
        });
    });
    return done(v.approve ? "Témoignage ajouté et publié." : "Témoignage ajouté, en attente de modération.");
  });
  if (res.ok) updateTag("testimonials");
  return res;
}

// ---------------------------------------------------------------------------
// Messages de contact
// ---------------------------------------------------------------------------
export async function setMessageHandled(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = z.object({ id: zId, handled: z.enum(["1", "0"]) }).safeParse(formObject(form));
  if (!parsed.success) return zodFail(parsed.error);
  const res = await run(async () => {
    const r = await db.update(schema.contactMessages).set({ handled: parsed.data.handled === "1" }).where(eq(schema.contactMessages.id, parsed.data.id)).returning({ id: schema.contactMessages.id });
    if (!r.length) return fail("Message introuvable.");
    return done(parsed.data.handled === "1" ? "Message marqué comme traité." : "Message marqué comme à traiter.");
  });
  if (res.ok) refresh();
  return res;
}

// ---------------------------------------------------------------------------
// Réglages
// ---------------------------------------------------------------------------
const LEGAL_KEYS = ["companyName", "legalForm", "address", "siret", "rcs", "vat", "director", "host", "dbHost", "mediator"] as const;
const SOCIAL_KEYS = ["instagram", "pinterest", "linkedin"] as const;
const socialUrl = zOptText(300).pipe(z.string().nullable().refine((u) => u == null || /^https:\/\/[^\s]+$/i.test(u), "Adresse complète attendue, commençant par https://."));

const settingsInput = z.object({
  giftWrapCents: zEuros("Le prix de l'emballage cadeau"),
  giftWrapLabel: zText(200, "Le libellé de l'emballage cadeau"),
  contactEmail: z.string().trim().pipe(z.email({ message: "Adresse email de contact invalide." }).max(200)),
  ...Object.fromEntries(LEGAL_KEYS.map((k) => [`legal_${k}`, zOptText(500)])),
  ...Object.fromEntries(SOCIAL_KEYS.map((k) => [`social_${k}`, socialUrl])),
});

export async function saveSettings(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = settingsInput.safeParse(formObject(form));
  if (!parsed.success) return zodFail(parsed.error);
  const v = parsed.data as Record<string, unknown> & { giftWrapCents: number; giftWrapLabel: string; contactEmail: string };
  const legal = Object.fromEntries(LEGAL_KEYS.map((k) => [k, (v[`legal_${k}`] as string | null) ?? ""]));
  const social = Object.fromEntries(SOCIAL_KEYS.map((k) => [k, (v[`social_${k}`] as string | null) ?? ""]));
  const res = await run(async () => {
    const entries: [string, unknown][] = [
      ["giftWrapCents", v.giftWrapCents],
      ["giftWrapLabel", v.giftWrapLabel],
      ["contactEmail", v.contactEmail],
      ["legal", legal],
      ["social", social],
    ];
    await db.transaction(async (tx) => {
      for (const [key, value] of entries) {
        await tx.insert(schema.settings).values({ key, value }).onConflictDoUpdate({ target: schema.settings.key, set: { value } });
      }
    });
    return done("Réglages enregistrés.");
  });
  if (res.ok) updateTag("settings");
  return res;
}
