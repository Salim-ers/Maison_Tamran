"use server";

import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/db";
import { clientIp, isRateLimited, recordAttempt } from "@/lib/auth";

export type UnsubscribeState = { status: "idle" | "ok" | "error"; message: string };

const input = z.object({
  email: z.email({ message: "Adresse email invalide." }).max(200),
  website: z.string().max(0).optional(),
});

export async function unsubscribeNewsletter(_: UnsubscribeState, form: FormData): Promise<UnsubscribeState> {
  const parsed = input.safeParse({ email: String(form.get("email") ?? "").trim().toLowerCase(), website: String(form.get("website") ?? "") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Vérifiez l'adresse saisie." };
  const key = `unsub:${await clientIp()}`;
  if (await isRateLimited([key])) return { status: "error", message: "Trop de demandes en peu de temps. Réessayez dans quelques minutes." };
  await recordAttempt([key], false);
  await db
    .update(schema.newsletterSubscribers)
    .set({ unsubscribedAt: new Date(), confirmToken: null })
    .where(and(eq(schema.newsletterSubscribers.email, parsed.data.email), isNull(schema.newsletterSubscribers.unsubscribedAt)));
  // Même réponse que l'adresse soit inscrite ou non : on ne révèle pas la liste des abonnés.
  return { status: "ok", message: `C'est fait : l'adresse ${parsed.data.email} ne recevra plus la lettre de TAMBRÉ. Si elle n'était pas inscrite, aucune action n'était nécessaire.` };
}
