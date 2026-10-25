"use server";

import { z } from "zod";
import { db, schema } from "@/db";
import { clientIp, isRateLimited, recordAttempt } from "@/lib/auth";
import { getSettings } from "@/lib/catalog";
import { sendEmail, simpleEmail } from "@/lib/email";
import { CONTACT_SUBJECT_VALUES, subjectLabel } from "@/lib/segments";

export type ContactState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors: Partial<Record<string, string>>; values: Record<string, string>; attempt: number }
  | { status: "ok"; name: string; email: string };

const input = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom.").max(120, "120 caractères au maximum."),
  email: z.email({ message: "Adresse email invalide." }).max(200),
  subject: z.enum(CONTACT_SUBJECT_VALUES, { message: "Choisissez le sujet de votre message." }),
  orderNumber: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => (v ? v.toUpperCase() : undefined))
    .refine((v) => !v || /^[A-Z0-9-]{4,40}$/.test(v), "Numéro de commande invalide (ex. TB-2026-ABC123)."),
  message: z.string().trim().min(10, "Votre message est trop court (10 caractères au minimum).").max(5000, "5 000 caractères au maximum."),
  consent: z.literal("on", { message: "Votre accord est nécessaire pour que nous puissions vous répondre." }),
  website: z.string().max(0).optional(), // champ piège anti-robots
});

const str = (form: FormData, k: string) => {
  const v = form.get(k);
  return typeof v === "string" ? v : "";
};

export async function sendContactMessage(_: ContactState, form: FormData): Promise<ContactState> {
  const values = { name: str(form, "name"), email: str(form, "email"), subject: str(form, "subject"), orderNumber: str(form, "orderNumber"), message: str(form, "message").slice(0, 5000), consent: str(form, "consent") };
  const parsed = input.safeParse({ ...values, email: values.email.trim().toLowerCase(), consent: form.get("consent") ?? undefined, website: str(form, "website") });
  if (!parsed.success) {
    const fieldErrors: Partial<Record<string, string>> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
    if (fieldErrors.website) return { status: "error", message: "Le message n'a pas pu être envoyé. Vérifiez le formulaire.", fieldErrors: {}, values, attempt: Date.now() };
    return { status: "error", message: "Certains champs sont à corriger : ils sont signalés ci-dessous.", fieldErrors, values, attempt: Date.now() };
  }
  const d = parsed.data;

  const key = `contact:${await clientIp()}`;
  if (await isRateLimited([key])) {
    return { status: "error", message: "Trop de messages envoyés en peu de temps. Réessayez dans quelques minutes.", fieldErrors: {}, values, attempt: Date.now() };
  }
  await recordAttempt([key], false);

  await db.insert(schema.contactMessages).values({ name: d.name, email: d.email, subject: d.subject, orderNumber: d.orderNumber ?? null, message: d.message });

  const settings = await getSettings();
  await sendEmail({
    to: settings.contactEmail,
    subject: `Message du site : ${subjectLabel(d.subject)}${d.orderNumber ? ` (${d.orderNumber})` : ""}`,
    template: "contact_message",
    replyTo: d.email,
    html: simpleEmail("Nouveau message reçu depuis le site", [
      `De : ${d.name} <${d.email}>`,
      `Sujet : ${subjectLabel(d.subject)}`,
      ...(d.orderNumber ? [`Commande : ${d.orderNumber}`] : []),
      d.message,
      "Répondez directement à cet email pour écrire à l'expéditeur.",
    ]),
  });

  return { status: "ok", name: d.name, email: d.email };
}
