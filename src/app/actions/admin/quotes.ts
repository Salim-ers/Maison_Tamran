"use server";

import { z } from "zod";
import { refresh } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import type { ActionState } from "@/components/admin/types";
import { assertConfirmed, done, fail, formList, formObject, run, zCheckbox, zEuros, zId, zInt, zOptText, zodFail } from "./helpers";

const QUOTE_STATUSES = ["new", "in_review", "quoted", "accepted", "declined", "archived"] as const;
export type ProposalLine = { label: string; quantity: number; unitCents: number };
const TIER_PREFIX = "Remise dégressive";

const metaInput = z.object({
  id: zId,
  status: z.enum(QUOTE_STATUSES, { message: "Statut invalide." }),
  internalNotes: zOptText(5000),
});

export async function saveQuoteMeta(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = metaInput.safeParse(formObject(form));
  if (!parsed.success) return zodFail(parsed.error);
  const { id, ...v } = parsed.data;
  const res = await run(async () => {
    const r = await db.update(schema.quoteRequests).set({ ...v, updatedAt: new Date() }).where(eq(schema.quoteRequests.id, id)).returning({ id: schema.quoteRequests.id });
    if (!r.length) return fail("Demande introuvable.");
    return done("Statut et notes enregistrés.");
  });
  if (res.ok) refresh();
  return res;
}

const proposalInput = z.object({
  id: zId,
  shippingCents: zEuros("Les frais de livraison"),
  validUntil: z
    .string()
    .optional()
    .transform((s) => (s ?? "").trim())
    .refine((s) => !s || (/^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s))), "Date de validité invalide.")
    .transform((s) => s || undefined),
  notes: zOptText(3000),
  tierId: z.string().optional().transform((s) => s || null).pipe(z.uuid({ message: "Tarif invalide." }).nullable()),
  markQuoted: zCheckbox,
});

function parseEurosLine(raw: string) {
  const v = raw.replace(/[\s €]/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return null;
  return Math.round(parseFloat(v) * 100);
}

export async function saveProposal(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = proposalInput.safeParse(formObject(form));
  if (!parsed.success) return zodFail(parsed.error);
  const v = parsed.data;

  if (form.get("intent") === "clear") {
    const res = await run(async () => {
      assertConfirmed(form);
      await db.update(schema.quoteRequests).set({ proposal: null, updatedAt: new Date() }).where(eq(schema.quoteRequests.id, v.id));
      return done("Proposition supprimée.");
    });
    if (res.ok) refresh();
    return res;
  }

  const labels = formList(form, "lineLabel");
  const qtys = formList(form, "lineQty");
  const units = formList(form, "lineUnit");
  const lines: ProposalLine[] = [];
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i].trim().slice(0, 200);
    const qRaw = (qtys[i] ?? "").trim();
    const uRaw = (units[i] ?? "").trim();
    if (!label && !qRaw && !uRaw) continue;
    if (label.startsWith(TIER_PREFIX)) continue; // recalculée ci-dessous
    if (!label) return fail(`Ligne ${i + 1} : indiquez un libellé.`, { lines: "Libellé manquant." });
    const quantity = Number(qRaw);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) return fail(`Ligne ${i + 1} : la quantité doit être un entier positif.`, { lines: "Quantité invalide." });
    const unitCents = parseEurosLine(uRaw);
    if (unitCents == null) return fail(`Ligne ${i + 1} : prix unitaire HT invalide (ex. 25,90).`, { lines: "Prix invalide." });
    lines.push({ label, quantity, unitCents });
  }
  if (!lines.length) return fail("Ajoutez au moins une ligne à la proposition.", { lines: "Aucune ligne." });
  if (lines.length > 50) return fail("50 lignes au maximum.");

  const res = await run(async () => {
    if (v.tierId) {
      const [tier] = await db.select().from(schema.priceTiers).where(and(eq(schema.priceTiers.id, v.tierId), eq(schema.priceTiers.active, true))).limit(1);
      if (!tier) return fail("Ce tarif dégressif n'existe pas ou n'est pas actif. Activez-le dans « Tarifs dégressifs » après validation.");
      const subtotal = lines.reduce((a, l) => a + l.quantity * l.unitCents, 0);
      const discount = Math.round((subtotal * tier.discountPercent) / 100);
      if (discount > 0) lines.push({ label: `${TIER_PREFIX} : ${tier.label ?? `dès ${tier.minQuantity} unités`} (−${tier.discountPercent} %)`, quantity: 1, unitCents: -discount });
    }
    const r = await db
      .update(schema.quoteRequests)
      .set({
        proposal: { lines, shippingCents: v.shippingCents, validUntil: v.validUntil, notes: v.notes ?? undefined },
        ...(v.markQuoted ? { status: "quoted" as const } : {}),
        updatedAt: new Date(),
      })
      .where(eq(schema.quoteRequests.id, v.id))
      .returning({ id: schema.quoteRequests.id });
    if (!r.length) return fail("Demande introuvable.");
    return done(`Proposition enregistrée${v.markQuoted ? ", statut passé à « Proposition envoyée »" : ""}. Exportez le PDF pour l'envoyer au client.`);
  });
  if (res.ok) refresh();
  return res;
}

// ---------------------------------------------------------------------------
// Tarifs dégressifs
// ---------------------------------------------------------------------------
const tierInput = z.object({
  minQuantity: zInt("La quantité minimale", 1, 1000000),
  discountPercent: zInt("La remise", 1, 90),
  label: zOptText(120),
  active: zCheckbox,
});

export async function saveTier(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const obj = formObject(form);
  const tid = obj.id ? zId.safeParse(obj.id) : null;
  if (tid && !tid.success) return fail("Identifiant invalide.");
  if (form.get("intent") === "delete") {
    const res = await run(async () => {
      if (!tid?.success) return fail("Tarif introuvable.");
      assertConfirmed(form);
      await db.delete(schema.priceTiers).where(eq(schema.priceTiers.id, tid.data));
      return done("Tarif supprimé.");
    });
    if (res.ok) refresh();
    return res;
  }
  const parsed = tierInput.safeParse(obj);
  if (!parsed.success) return zodFail(parsed.error);
  const res = await run(async () => {
    if (tid?.success) {
      const r = await db.update(schema.priceTiers).set(parsed.data).where(eq(schema.priceTiers.id, tid.data)).returning({ id: schema.priceTiers.id });
      if (!r.length) return fail("Ce tarif n'existe plus.");
      return done("Tarif enregistré.");
    }
    await db.insert(schema.priceTiers).values(parsed.data);
    return done("Tarif ajouté.");
  });
  if (res.ok) refresh();
  return res;
}
