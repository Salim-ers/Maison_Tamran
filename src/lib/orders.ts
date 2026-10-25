import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { db, schema } from "@/db";
import type { AddressSnapshot } from "@/db/schema";
import { computeCart, clearCart } from "./cart";
import { storeMode, siteUrl, sessionSecret } from "./env";
import { sha256 } from "./auth";
import { orderConfirmationEmail, orderStatusEmail, sendEmail, STATUS_LABELS } from "./email";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newOrderNumber() {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `TB-${new Date().getFullYear()}-${s}`;
}

/** Jeton d'accès invité à une commande : dérivé de l'identifiant par HMAC, jamais stocké en clair. */
export function orderToken(orderId: string) {
  return createHmac("sha256", sessionSecret()).update(`order:${orderId}`).digest("base64url").slice(0, 32);
}

export function trackUrl(number: string, token: string) {
  return `${siteUrl()}/suivi-commande/${encodeURIComponent(number)}?t=${encodeURIComponent(token)}`;
}

export class CheckoutError extends Error {}

export async function createOrderFromCart(args: {
  cartId: string;
  userId: string | null;
  email: string;
  address: AddressSnapshot;
  billing: AddressSnapshot | null;
  shippingRateId: string;
  note: string | null;
}) {
  const cart = await computeCart(args.cartId, { country: args.address.country, shippingRateId: args.shippingRateId });
  if (!cart.lines.length) throw new CheckoutError("Votre panier est vide.");
  if (cart.blocking) throw new CheckoutError("Certains articles de votre panier ne sont plus disponibles. Vérifiez votre panier.");
  if (!cart.selectedShippingId || cart.shippingCents == null) throw new CheckoutError("Aucun mode de livraison n'est disponible pour cette adresse.");
  if (cart.promo && !cart.promo.ok) throw new CheckoutError(`Code promotionnel : ${cart.promo.message}`);
  const shipping = cart.shipping.find((s) => s.id === cart.selectedShippingId)!;

  const items = await db.select().from(schema.cartItems).where(eq(schema.cartItems.cartId, args.cartId));
  const itemById = new Map(items.map((i) => [i.id, i]));

  const order = await db.transaction(async (tx) => {
    const [o] = await tx
      .insert(schema.orders)
      .values({
        number: newOrderNumber(),
        userId: args.userId,
        email: args.email.toLowerCase(),
        status: "pending_payment",
        isDemo: storeMode() === "demo",
        subtotalCents: cart.subtotalCents,
        discountCents: cart.discountCents,
        shippingCents: cart.shippingCents ?? 0,
        totalCents: cart.totalCents,
        promoCode: cart.promo?.ok ? cart.promo.code : null,
        shippingMethod: shipping.name,
        shippingAddress: args.address,
        billingAddress: args.billing,
        customerNote: args.note,
        accessToken: "pending",
        cartId: args.cartId,
      })
      .returning();
    await tx.insert(schema.orderItems).values(
      cart.lines.map((l) => {
        const raw = itemById.get(l.id)!;
        return {
          orderId: o.id,
          type: l.type,
          name: l.name,
          description: l.description,
          variantId: raw.variantId,
          boxId: raw.boxId,
          composition: raw.composition,
          giftWrap: raw.giftWrap,
          giftMessage: raw.giftMessage,
          unitPriceCents: l.unitCents,
          quantity: l.quantity,
          totalCents: l.totalCents,
        };
      })
    );
    await tx.update(schema.orders).set({ accessToken: sha256(orderToken(o.id)) }).where(eq(schema.orders.id, o.id));
    await tx.insert(schema.orderEvents).values({ orderId: o.id, status: "pending_payment", note: o.isDemo ? "Commande de démonstration créée" : "Commande créée, paiement en attente" });
    return o;
  });
  return { order, token: orderToken(order.id), cart };
}

/** Confirme le paiement (idempotent). Décrémente le stock une seule fois et envoie la confirmation. */
export async function markOrderPaid(orderId: string, info: { paymentIntentId?: string | null; source: string }) {
  const result = await db.transaction(async (tx) => {
    const [o] = await tx.select().from(schema.orders).where(eq(schema.orders.id, orderId)).for("update").limit(1);
    if (!o) return null;
    if (o.status === "paid" || o.paidAt) return { order: o, changed: false };
    const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, o.id));
    const warnings: string[] = [];
    if (!o.stockCommitted) {
      for (const it of items) {
        if (it.type === "box" && it.boxId) {
          await tx.update(schema.boxes).set({ stock: sql`${schema.boxes.stock} - ${it.quantity}` }).where(eq(schema.boxes.id, it.boxId));
          for (const [slug, q] of Object.entries(it.composition ?? {})) {
            if (q > 0) {
              const [p] = await tx
                .update(schema.products)
                .set({ stockPieces: sql`${schema.products.stockPieces} - ${q * it.quantity}` })
                .where(eq(schema.products.slug, slug))
                .returning({ stock: schema.products.stockPieces, name: schema.products.name });
              if (p && p.stock < 0) warnings.push(`Stock négatif pour ${p.name} (${p.stock})`);
            }
          }
        } else if (it.type === "variant" && it.variantId) {
          const [v] = await tx
            .update(schema.variants)
            .set({ stock: sql`${schema.variants.stock} - ${it.quantity}` })
            .where(eq(schema.variants.id, it.variantId))
            .returning({ stock: schema.variants.stock, sku: schema.variants.sku });
          if (v && v.stock < 0) warnings.push(`Stock négatif pour ${v.sku} (${v.stock})`);
        }
      }
    }
    if (o.promoCode) await tx.update(schema.promoCodes).set({ uses: sql`${schema.promoCodes.uses} + 1` }).where(eq(schema.promoCodes.code, o.promoCode));
    const [updated] = await tx
      .update(schema.orders)
      .set({ status: "paid", paidAt: new Date(), stockCommitted: true, stripePaymentIntentId: info.paymentIntentId ?? o.stripePaymentIntentId, updatedAt: new Date() })
      .where(eq(schema.orders.id, o.id))
      .returning();
    await tx.insert(schema.orderEvents).values({ orderId: o.id, status: "paid", note: `Paiement confirmé (${info.source})${warnings.length ? ` — ${warnings.join(" ; ")}` : ""}` });
    return { order: updated, changed: true, items };
  });
  if (!result || !result.changed) return result?.order ?? null;
  const o = result.order;
  if (o.cartId) await clearCart(o.cartId).catch(() => {});
  revalidateTag("catalog", "max");
  const token = orderToken(o.id);
  await sendEmail({
    to: o.email,
    subject: `Votre commande ${o.number} est confirmée`,
    template: "order_confirmation",
    html: orderConfirmationEmail({
      number: o.number,
      email: o.email,
      firstName: o.shippingAddress.firstName,
      items: (result.items ?? []).map((i) => ({ name: i.name, description: i.description, quantity: i.quantity, totalCents: i.totalCents })),
      subtotalCents: o.subtotalCents,
      discountCents: o.discountCents,
      shippingCents: o.shippingCents,
      totalCents: o.totalCents,
      shippingMethod: o.shippingMethod,
      trackUrl: trackUrl(o.number, token),
    }),
  });
  if (process.env.ADMIN_NOTIFY_EMAIL) {
    await sendEmail({ to: process.env.ADMIN_NOTIFY_EMAIL, subject: `Nouvelle commande ${o.number}`, template: "admin_new_order", html: orderStatusEmail(o.number, "paid", `${siteUrl()}/admin/commandes/${o.id}`) });
  }
  return o;
}

export async function markOrderFailed(orderId: string, status: "payment_failed" | "cancelled", note: string) {
  const [o] = await db
    .update(schema.orders)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(schema.orders.id, orderId), eq(schema.orders.status, "pending_payment")))
    .returning();
  if (o) await db.insert(schema.orderEvents).values({ orderId, status, note });
  return o ?? null;
}

const NEXT_ALLOWED: Record<string, string[]> = {
  pending_payment: ["cancelled"],
  paid: ["preparing", "shipped", "refunded", "cancelled"],
  preparing: ["shipped", "refunded", "cancelled"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  payment_failed: [],
  cancelled: [],
  refunded: [],
};
export function allowedTransitions(status: string) {
  return NEXT_ALLOWED[status] ?? [];
}

/** Changement de statut par l'administrateur, avec notification email du client. */
export async function adminSetStatus(orderId: string, status: string, opts: { trackingNumber?: string | null; trackingUrl?: string | null; note?: string | null; notify: boolean }) {
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
  if (!o) throw new Error("Commande introuvable.");
  if (status !== o.status && !allowedTransitions(o.status).includes(status)) {
    throw new Error(`Passage de « ${STATUS_LABELS[o.status]} » à « ${STATUS_LABELS[status] ?? status} » impossible.`);
  }
  const token = orderToken(o.id);
  await db
    .update(schema.orders)
    .set({
      status: status as typeof o.status,
      trackingNumber: opts.trackingNumber ?? o.trackingNumber,
      trackingUrl: opts.trackingUrl ?? o.trackingUrl,
      updatedAt: new Date(),
    })
    .where(eq(schema.orders.id, orderId));
  await db.insert(schema.orderEvents).values({ orderId, status, note: opts.note ?? null });
  if (opts.notify && status !== o.status) {
    await sendEmail({
      to: o.email,
      subject: `Commande ${o.number} : ${STATUS_LABELS[status] ?? status}`,
      template: "order_status",
      html: orderStatusEmail(o.number, status, trackUrl(o.number, token), { number: opts.trackingNumber ?? o.trackingNumber, url: opts.trackingUrl ?? o.trackingUrl }),
    });
  }
}

export async function findOrderByAccess(number: string, token: string) {
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.number, number)).limit(1);
  if (!o || !token) return null;
  const a = Buffer.from(orderToken(o.id)), b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b) ? o : null;
}

export async function orderDetail(orderId: string) {
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
  if (!o) return null;
  const [items, events] = await Promise.all([
    db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId)),
    db.select().from(schema.orderEvents).where(eq(schema.orderEvents.orderId, orderId)).orderBy(schema.orderEvents.createdAt),
  ]);
  return { order: o, items, events };
}
