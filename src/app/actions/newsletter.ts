"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { newToken, sha256 } from "@/lib/auth";
import { sendEmail, simpleEmail } from "@/lib/email";
import { siteUrl } from "@/lib/env";
import { NEWSLETTER_CONSENT_TEXT } from "@/lib/texts";

const CONSENT_TEXT = NEWSLETTER_CONSENT_TEXT;

export type NewsletterState = { status: "idle" | "ok" | "error"; message: string; email?: string };

const input = z.object({
  email: z.email({ message: "Adresse email invalide." }).max(200),
  consent: z.literal("on", { message: "Cochez la case de consentement pour vous inscrire." }),
  source: z.string().max(40).optional(),
  website: z.string().max(0).optional(), // champ piège anti-robots
});

export async function subscribeNewsletter(_: NewsletterState, form: FormData): Promise<NewsletterState> {
  const parsed = input.safeParse({
    email: String(form.get("email") ?? "").trim().toLowerCase(),
    consent: form.get("consent") ?? undefined,
    source: String(form.get("source") ?? "site"),
    website: String(form.get("website") ?? ""),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Vérifiez le formulaire." };
  const { email, source } = parsed.data;

  const [existing] = await db.select().from(schema.newsletterSubscribers).where(eq(schema.newsletterSubscribers.email, email)).limit(1);
  if (existing?.confirmedAt && !existing.unsubscribedAt) {
    return { status: "ok", message: "Cette adresse est déjà inscrite. Merci de votre fidélité.", email };
  }
  const token = newToken(24);
  if (existing) {
    await db
      .update(schema.newsletterSubscribers)
      .set({ confirmToken: sha256(token), consentAt: new Date(), consentText: CONSENT_TEXT, unsubscribedAt: null, source })
      .where(eq(schema.newsletterSubscribers.id, existing.id));
  } else {
    await db.insert(schema.newsletterSubscribers).values({ email, consentText: CONSENT_TEXT, confirmToken: sha256(token), source });
  }
  const url = `${siteUrl()}/newsletter/confirmation?email=${encodeURIComponent(email)}&t=${token}`;
  await sendEmail({
    to: email,
    subject: "Confirmez votre inscription à la lettre de MAISON TAMRĀN",
    template: "newsletter_confirm",
    html: simpleEmail("Une dernière étape", ["Pour recevoir la lettre de MAISON TAMRĀN, confirmez votre adresse en cliquant sur le bouton ci-dessous.", "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email."], { label: "Confirmer mon inscription", url }),
  });
  return { status: "ok", message: `Merci. Un email de confirmation vient d'être envoyé à ${email} : cliquez sur le lien pour finaliser l'inscription.`, email };
}
