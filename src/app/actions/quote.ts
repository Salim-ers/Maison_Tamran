"use server";

import { z } from "zod";
import { randomInt } from "node:crypto";
import { db, schema } from "@/db";
import type { QuoteLine } from "@/db/schema";
import { clientIp, getCurrentUser, isRateLimited, recordAttempt } from "@/lib/auth";
import { getBoxes, getCatalog } from "@/lib/catalog";
import { sendEmail, simpleEmail } from "@/lib/email";
import { quotePdfUrl, quoteToken, verifyLogoSignature } from "@/lib/quote-token";
import { BUDGETS, PRO_SEGMENT_VALUES, segmentLabel } from "@/lib/segments";

export type QuoteFieldErrors = Partial<Record<string, string>>;
export type QuoteState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors: QuoteFieldErrors; values: Record<string, string>; attempt: number }
  | { status: "ok"; reference: string; email: string; pdfPath: string };

const optText = (max: number, msg?: string) => z.string().trim().max(max, msg ?? `${max} caractères au maximum.`).optional().transform((v) => (v ? v : undefined));

const input = z.object({
  segment: z.enum(PRO_SEGMENT_VALUES, { message: "Choisissez le type de projet." }),
  company: z.string().trim().min(1, "Indiquez le nom de la société ou de l'événement.").max(160, "160 caractères au maximum."),
  contactName: z.string().trim().min(2, "Indiquez vos nom et prénom.").max(120, "120 caractères au maximum."),
  email: z.email({ message: "Adresse email invalide." }).max(200),
  phone: optText(40).refine((v) => !v || /^[+0-9 ().-]{6,40}$/.test(v), "Numéro de téléphone invalide."),
  vatNumber: optText(30).transform((v) => v?.replace(/[\s.-]/g, "").toUpperCase()).refine((v) => !v || /^[A-Z]{2}[A-Z0-9]{2,13}$/.test(v), "Numéro de TVA invalide (ex. FR12345678901)."),
  logo: z.boolean(),
  card: z.boolean(),
  ribbon: z.boolean(),
  personalizationNotes: optText(1000, "1 000 caractères au maximum."),
  logoUrl: optText(500),
  logoSig: optText(64),
  desiredDate: optText(10).refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Date invalide."),
  deliveryCity: optText(120),
  budget: z.enum(BUDGETS).optional(),
  message: optText(3000, "3 000 caractères au maximum."),
  consent: z.literal("on", { message: "Votre accord est nécessaire pour que nous puissions traiter la demande." }),
  website: z.string().max(0).optional(), // champ piège anti-robots
});

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newReference() {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `DV-${new Date().getFullYear()}-${s}`;
}

const str = (form: FormData, k: string) => {
  const v = form.get(k);
  return typeof v === "string" ? v : "";
};

export async function submitQuote(_: QuoteState, form: FormData): Promise<QuoteState> {
  const values: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string" && !k.startsWith("$ACTION")) values[k] = v.slice(0, 3000);
  const fail = (message: string, fieldErrors: QuoteFieldErrors = {}): QuoteState => ({ status: "error", message, fieldErrors, values, attempt: Date.now() });

  const parsed = input.safeParse({
    segment: str(form, "segment"),
    company: str(form, "company"),
    contactName: str(form, "contactName"),
    email: str(form, "email").trim().toLowerCase(),
    phone: str(form, "phone"),
    vatNumber: str(form, "vatNumber"),
    logo: form.get("logo") === "on",
    card: form.get("card") === "on",
    ribbon: form.get("ribbon") === "on",
    personalizationNotes: str(form, "personalizationNotes"),
    logoUrl: str(form, "logoUrl"),
    logoSig: str(form, "logoSig"),
    desiredDate: str(form, "desiredDate"),
    deliveryCity: str(form, "deliveryCity"),
    budget: str(form, "budget") || undefined,
    message: str(form, "message"),
    consent: form.get("consent") ?? undefined,
    website: str(form, "website"),
  });
  if (!parsed.success) {
    const fieldErrors: QuoteFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      fieldErrors[k] ??= issue.message;
    }
    if (fieldErrors.website) return fail("La demande n'a pas pu être envoyée. Vérifiez le formulaire.");
    return fail("Certains champs sont à corriger : ils sont signalés ci-dessous.", fieldErrors);
  }
  const d = parsed.data;

  // Date souhaitée : pas dans le passé
  if (d.desiredDate) {
    const today = new Date().toISOString().slice(0, 10);
    if (d.desiredDate < today) return fail("Certains champs sont à corriger : ils sont signalés ci-dessous.", { desiredDate: "Choisissez une date à venir." });
  }

  // Lignes : seules les références du catalogue sont acceptées, libellés recalculés côté serveur
  const [{ products }, boxes] = await Promise.all([getCatalog(), getBoxes()]);
  const labels = new Map<string, string>([
    ...products.map((p) => [p.slug, p.name] as [string, string]),
    ...boxes.map((b) => [b.slug, b.pieces ? `${b.name} (${b.pieces} pièces)` : `${b.name} (sur mesure)`] as [string, string]),
  ]);
  const lines: QuoteLine[] = [];
  for (const [k, v] of form.entries()) {
    if (!k.startsWith("qty:") || typeof v !== "string") continue;
    const ref = k.slice(4);
    const qty = Number(v);
    const label = labels.get(ref);
    if (!label || !Number.isInteger(qty) || qty <= 0) continue;
    if (qty > 100000) return fail("Certains champs sont à corriger : ils sont signalés ci-dessous.", { lines: "Quantité trop élevée : précisez-la plutôt dans votre message." });
    lines.push({ ref, label, quantity: qty });
  }
  if (!lines.length && (d.message?.length ?? 0) < 10) {
    return fail("Certains champs sont à corriger : ils sont signalés ci-dessous.", { lines: "Indiquez au moins une création ou un coffret, ou décrivez votre projet dans le message." });
  }

  // Logo : uniquement une URL émise par notre point de téléversement
  let logoUrl: string | null = null;
  if (d.logoUrl) {
    if (!d.logoSig || !verifyLogoSignature(d.logoUrl, d.logoSig)) return fail("Le logo joint n'a pas pu être vérifié. Joignez-le de nouveau ou envoyez la demande sans logo.", { logoFile: "Fichier à joindre de nouveau." });
    logoUrl = d.logoUrl;
  }

  // Limitation anti-abus (par adresse IP)
  const ip = await clientIp();
  const rlKey = `quote:${ip}`;
  if (await isRateLimited([rlKey])) return fail("Trop de demandes envoyées en peu de temps. Réessayez dans quelques minutes ou écrivez-nous par email.");
  await recordAttempt([rlKey], false);

  const user = await getCurrentUser().catch(() => null);
  let quote: typeof schema.quoteRequests.$inferSelect | undefined;
  for (let attempt = 0; attempt < 4 && !quote; attempt++) {
    try {
      [quote] = await db
        .insert(schema.quoteRequests)
        .values({
          reference: newReference(),
          segment: d.segment,
          company: d.company,
          contactName: d.contactName,
          email: d.email,
          phone: d.phone ?? null,
          vatNumber: d.vatNumber ?? null,
          lines,
          personalization: { logo: d.logo, card: d.card, ribbon: d.ribbon, ...(d.personalizationNotes ? { notes: d.personalizationNotes } : {}) },
          logoUrl,
          desiredDate: d.desiredDate ?? null,
          deliveryCity: d.deliveryCity ?? null,
          budget: d.budget ?? null,
          message: d.message ?? null,
          userId: user?.id ?? null,
        })
        .returning();
    } catch (e) {
      // collision de référence : on retente avec une nouvelle référence
      if (!(e instanceof Error) || !/unique|duplicate/i.test(e.message + String((e as { cause?: unknown }).cause ?? ""))) throw e;
    }
  }
  if (!quote) return fail("La demande n'a pas pu être enregistrée. Réessayez dans un instant.");

  const pdfUrl = quotePdfUrl(quote.reference, quote.id);
  const summary = lines.length ? lines.map((l) => `${l.quantity} × ${l.label}`).join(" ; ") : "Sélection à établir avec vous.";

  await sendEmail({
    to: d.email,
    subject: `Votre demande de devis ${quote.reference}`,
    template: "quote_received",
    html: simpleEmail(
      "Nous avons bien reçu votre demande",
      [
        `Bonjour ${d.contactName},`,
        `Votre demande de devis pour ${d.company} est enregistrée sous la référence ${quote.reference}.`,
        `Sélection : ${summary}`,
        "Nous étudions votre projet et revenons vers vous par email avec une proposition chiffrée. Pour toute précision, répondez simplement à cet email en rappelant la référence.",
        "Le récapitulatif de votre demande est disponible au format PDF :",
      ],
      { label: "Télécharger le récapitulatif (PDF)", url: pdfUrl }
    ),
  });

  const notify = process.env.ADMIN_NOTIFY_EMAIL;
  if (notify) {
    const pz = [d.logo && "logo", d.card && "carte imprimée", d.ribbon && "ruban"].filter(Boolean).join(", ") || "aucune";
    await sendEmail({
      to: notify,
      subject: `Nouvelle demande de devis ${quote.reference} : ${d.company}`,
      template: "quote_admin",
      replyTo: d.email,
      html: simpleEmail(
        `Demande de devis ${quote.reference}`,
        [
          `Projet : ${segmentLabel(d.segment)}`,
          `Société : ${d.company}`,
          `Contact : ${d.contactName}, ${d.email}${d.phone ? `, ${d.phone}` : ""}`,
          ...(d.vatNumber ? [`TVA : ${d.vatNumber}`] : []),
          `Sélection : ${summary}`,
          `Personnalisation : ${pz}${logoUrl ? " (logo joint)" : ""}${d.personalizationNotes ? `. ${d.personalizationNotes}` : ""}`,
          `Livraison souhaitée : ${d.desiredDate ?? "non précisée"}${d.deliveryCity ? `, ${d.deliveryCity}` : ""}`,
          `Budget indicatif : ${d.budget ?? "non précisé"}`,
          ...(d.message ? [`Message : ${d.message}`] : []),
          "La demande est à traiter dans le back-office, rubrique Devis.",
        ],
        { label: "Récapitulatif PDF", url: pdfUrl }
      ),
    });
  }

  return {
    status: "ok",
    reference: quote.reference,
    email: d.email,
    pdfPath: `/api/devis/${encodeURIComponent(quote.reference)}/pdf?t=${encodeURIComponent(quoteToken(quote.id))}`,
  };
}
