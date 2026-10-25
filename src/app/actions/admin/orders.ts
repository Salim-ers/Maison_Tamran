"use server";

import { z } from "zod";
import { refresh } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { adminSetStatus, allowedTransitions } from "@/lib/orders";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import type { ActionState } from "@/components/admin/types";
import { done, fail, formObject, run, zCheckbox, zId, zOptText, zodFail } from "./helpers";

const STATUSES = ["pending_payment", "paid", "payment_failed", "cancelled", "preparing", "shipped", "delivered", "refunded"] as const;

const input = z.object({
  id: zId,
  status: z.enum(STATUSES, { message: "Statut invalide." }),
  trackingNumber: zOptText(80),
  trackingUrl: zOptText(500).pipe(
    z
      .string()
      .nullable()
      .refine((u) => u == null || /^https:\/\/[^\s]+$/i.test(u), "L'URL de suivi doit commencer par https://.")
  ),
  note: zOptText(1000),
  notify: zCheckbox,
});

export async function updateOrderStatus(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = input.safeParse(formObject(form));
  if (!parsed.success) return zodFail(parsed.error);
  const v = parsed.data;
  const res = await run(async () => {
    const [o] = await db.select({ status: schema.orders.status, isDemo: schema.orders.isDemo }).from(schema.orders).where(eq(schema.orders.id, v.id)).limit(1);
    if (!o) return fail("Commande introuvable.");
    if (v.status !== o.status && !allowedTransitions(o.status).includes(v.status)) return fail("Ce changement de statut n'est pas autorisé depuis le statut actuel.", { status: "Transition non autorisée." });
    if (o.isDemo && (v.status === "shipped" || v.status === "preparing")) {
      return fail("Commande de démonstration : elle n'a pas été payée et ne doit pas être préparée ni expédiée. Annulez-la si nécessaire.");
    }
    if (v.status === o.status && !v.trackingNumber && !v.trackingUrl && !v.note) return fail("Rien à enregistrer : choisissez un nouveau statut ou renseignez un suivi ou une note.");
    await adminSetStatus(v.id, v.status, { trackingNumber: v.trackingNumber, trackingUrl: v.trackingUrl, note: v.note, notify: v.notify });
    const changed = v.status !== o.status;
    return done(changed ? `Statut mis à jour${v.notify ? " ; le client a été notifié par email" : ""}.` : "Informations de suivi enregistrées.");
  });
  if (res.ok) refresh();
  return res;
}
