"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { readCartId } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { storeMode } from "@/lib/env";
import { CheckoutError, createOrderFromCart, findOrderByAccess, markOrderFailed, markOrderPaid } from "@/lib/orders";
import { createCheckoutSession } from "@/lib/stripe";
import { trackServer } from "@/lib/analytics";
import { COUNTRY_CODES } from "@/lib/countries";

export type CheckoutState = { error: string | null; fields?: Record<string, string> };


const address = z.object({
  firstName: z.string().trim().min(1, "Prénom requis.").max(80),
  lastName: z.string().trim().min(1, "Nom requis.").max(80),
  company: z.string().trim().max(120).optional().transform((v) => v || null),
  line1: z.string().trim().min(3, "Adresse requise.").max(160),
  line2: z.string().trim().max(160).optional().transform((v) => v || null),
  postalCode: z.string().trim().min(3, "Code postal requis.").max(12),
  city: z.string().trim().min(1, "Ville requise.").max(100),
  country: z.string().refine((c) => COUNTRY_CODES.includes(c), "Nous ne livrons pas encore ce pays."),
  phone: z.string().trim().max(30).optional().transform((v) => v || null),
});

const input = z.object({
  email: z.email("Adresse email invalide.").max(200),
  shippingRateId: z.uuid("Choisissez un mode de livraison."),
  note: z.string().trim().max(500).optional().transform((v) => v || null),
  cgv: z.literal("on", { message: "Vous devez accepter les conditions générales de vente." }),
  saveAddress: z.string().optional(),
});

export async function startCheckout(_: CheckoutState, form: FormData): Promise<CheckoutState> {
  const raw = Object.fromEntries([...form.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""]));
  const a = address.safeParse({
    firstName: raw.firstName, lastName: raw.lastName, company: raw.company, line1: raw.line1, line2: raw.line2,
    postalCode: raw.postalCode, city: raw.city, country: raw.country, phone: raw.phone,
  });
  const i = input.safeParse({ email: raw.email?.trim().toLowerCase(), shippingRateId: raw.shippingRateId, note: raw.note, cgv: raw.cgv || undefined, saveAddress: raw.saveAddress });
  if (!a.success || !i.success) {
    const issue = (!a.success ? a.error.issues[0] : undefined) ?? (!i.success ? i.error.issues[0] : undefined);
    return { error: issue?.message ?? "Vérifiez le formulaire.", fields: raw };
  }
  const cartId = await readCartId();
  if (!cartId) return { error: "Votre panier est vide.", fields: raw };
  const user = await getCurrentUser();

  let destination: string;
  try {
    const { order, token } = await createOrderFromCart({
      cartId,
      userId: user?.id ?? null,
      email: user?.email ?? i.data.email,
      address: a.data,
      billing: null,
      shippingRateId: i.data.shippingRateId,
      note: i.data.note,
    });
    if (user && i.data.saveAddress === "on") {
      await db.insert(schema.addresses).values({ userId: user.id, ...a.data, isDefault: false });
    }
    await trackServer("begin_checkout", "/paiement");
    if (storeMode() === "demo") {
      destination = `/paiement/demo/${encodeURIComponent(order.number)}?t=${token}`;
    } else {
      const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));
      const session = await createCheckoutSession(order, items);
      if (!session.url) throw new CheckoutError("Le service de paiement n'a pas répondu. Réessayez dans un instant.");
      destination = session.url;
    }
  } catch (e) {
    if (e instanceof CheckoutError) return { error: e.message, fields: raw };
    console.error("checkout", e);
    return { error: "Le paiement n'a pas pu être initialisé. Votre panier est conservé : réessayez dans un instant.", fields: raw };
  }
  redirect(destination);
}

/** Simulation de paiement — uniquement pour les commandes de démonstration. */
export async function simulateDemoPayment(number: string, token: string, outcome: "accepted" | "refused" | "abandoned") {
  const order = await findOrderByAccess(number, token);
  if (!order) throw new Error("Commande introuvable.");
  if (!order.isDemo || storeMode() !== "demo") throw new Error("Simulation réservée aux commandes de démonstration.");
  const q = `commande=${encodeURIComponent(order.number)}&t=${encodeURIComponent(token)}`;
  if (order.status !== "pending_payment") redirect(order.status === "paid" ? `/paiement/confirmation?${q}` : `/paiement/echec?${q}`);
  if (outcome === "accepted") {
    await markOrderPaid(order.id, { source: "simulation de démonstration" });
    await trackServer("purchase", "/paiement/confirmation");
    redirect(`/paiement/confirmation?${q}`);
  }
  if (outcome === "refused") {
    await markOrderFailed(order.id, "payment_failed", "Paiement refusé (simulation de démonstration)");
    redirect(`/paiement/echec?${q}&raison=refuse`);
  }
  await markOrderFailed(order.id, "cancelled", "Paiement abandonné (simulation de démonstration)");
  redirect(`/paiement/echec?${q}&raison=annule`);
}
