import "server-only";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { siteUrl } from "./env";
import { markOrderFailed, markOrderPaid, orderToken } from "./orders";

let client: Stripe | null = null;
export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY n'est pas configurée.");
  client ??= new Stripe(key);
  return client;
}

type Order = typeof schema.orders.$inferSelect;
type OrderItem = typeof schema.orderItems.$inferSelect;

/** Crée la session Stripe Checkout à partir d'une commande déjà calculée côté serveur. */
export async function createCheckoutSession(order: Order, items: OrderItem[]) {
  const s = stripe();
  const token = orderToken(order.id);
  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
  if (order.discountCents > 0) {
    const coupon = await s.coupons.create({
      amount_off: order.discountCents,
      currency: "eur",
      duration: "once",
      max_redemptions: 1,
      name: order.promoCode ? `Code ${order.promoCode}` : "Remise",
      metadata: { orderId: order.id },
    });
    discounts = [{ coupon: coupon.id }];
  }
  const session = await s.checkout.sessions.create({
    mode: "payment",
    locale: "fr",
    customer_email: order.email,
    client_reference_id: order.id,
    metadata: { orderId: order.id, orderNumber: order.number },
    payment_intent_data: { metadata: { orderId: order.id, orderNumber: order.number } },
    line_items: items.map((i) => ({
      quantity: i.quantity,
      price_data: {
        currency: "eur",
        unit_amount: i.unitPriceCents,
        product_data: { name: i.name, description: i.description?.slice(0, 500) || undefined },
      },
    })),
    discounts,
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: order.shippingMethod ?? "Livraison",
          fixed_amount: { amount: order.shippingCents, currency: "eur" },
        },
      },
    ],
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1 h
    success_url: `${siteUrl()}/paiement/confirmation?commande=${encodeURIComponent(order.number)}&t=${token}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/paiement/echec?commande=${encodeURIComponent(order.number)}&t=${token}&raison=annule`,
  });
  await db.update(schema.orders).set({ stripeSessionId: session.id }).where(eq(schema.orders.id, order.id));
  return session;
}

/**
 * Vérifie l'état d'une session directement auprès de Stripe (utilisé par la page de confirmation
 * si le webhook n'est pas encore arrivé). Ne marque payé que si Stripe le confirme.
 */
export async function syncOrderFromSession(order: Order) {
  if (!order.stripeSessionId || order.status !== "pending_payment") return order.status;
  const session = await stripe().checkout.sessions.retrieve(order.stripeSessionId);
  if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
    await markOrderPaid(order.id, { paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id, source: "vérification de session" });
    return "paid";
  }
  if (session.status === "expired") {
    await markOrderFailed(order.id, "cancelled", "Session de paiement expirée");
    return "cancelled";
  }
  return order.status;
}

export async function handleStripeEvent(event: Stripe.Event) {
  // Idempotence : chaque événement n'est traité qu'une fois
  const inserted = await db.insert(schema.webhookEvents).values({ id: event.id, type: event.type }).onConflictDoNothing().returning();
  if (!inserted.length) return "duplicate";
  try {
    return await processEvent(event);
  } catch (e) {
    // échec : on libère l'événement pour que la relance de Stripe soit traitée
    await db.delete(schema.webhookEvents).where(eq(schema.webhookEvents.id, event.id));
    throw e;
  }
}

async function processEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId ?? session.client_reference_id;
      if (!orderId) return "ignored";
      if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
        await markOrderPaid(orderId, { paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id, source: `webhook ${event.type}` });
        return "paid";
      }
      return "awaiting_async_payment";
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId ?? session.client_reference_id;
      if (orderId) await markOrderFailed(orderId, "payment_failed", "Paiement différé refusé");
      return "failed";
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId ?? session.client_reference_id;
      if (orderId) await markOrderFailed(orderId, "cancelled", "Session de paiement expirée");
      return "expired";
    }
    default:
      return "ignored";
  }
}
