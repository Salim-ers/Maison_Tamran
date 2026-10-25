"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { computeCart, ensureCart, readCartId, touchCart, loadPricingContext, type CartView } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { isPurchasableStatus } from "@/lib/catalog";
import { validateComposition, GIFT_MESSAGE_MAX, MAX_LINE_QUANTITY } from "@/lib/pricing";
import { trackServer } from "@/lib/analytics";

export type CartResult = { ok: true; cart: CartView; message?: string } | { ok: false; cart: CartView; error: string };

async function view(): Promise<CartView> {
  return computeCart(await readCartId());
}

export async function getCartView(): Promise<CartView> {
  return view();
}

const variantInput = z.object({ variantId: z.uuid(), quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY) });

export async function addVariantToCart(input: { variantId: string; quantity: number }): Promise<CartResult> {
  const parsed = variantInput.safeParse(input);
  if (!parsed.success) return { ok: false, cart: await view(), error: "Sélection invalide." };
  const [v] = await db
    .select({ id: schema.variants.id, active: schema.variants.active, stock: schema.variants.stock, status: schema.products.status })
    .from(schema.variants)
    .innerJoin(schema.products, eq(schema.variants.productId, schema.products.id))
    .where(eq(schema.variants.id, parsed.data.variantId))
    .limit(1);
  if (!v || !v.active || !isPurchasableStatus(v.status)) return { ok: false, cart: await view(), error: "Cette création n'est pas disponible à la vente." };
  if (v.stock < 1) return { ok: false, cart: await view(), error: "Cette création est épuisée pour le moment." };
  const user = await getCurrentUser();
  const cartId = await ensureCart(user?.id);
  const [existing] = await db
    .select()
    .from(schema.cartItems)
    .where(and(eq(schema.cartItems.cartId, cartId), eq(schema.cartItems.variantId, v.id)))
    .limit(1);
  if (existing) {
    await db.update(schema.cartItems).set({ quantity: Math.min(MAX_LINE_QUANTITY, existing.quantity + parsed.data.quantity) }).where(eq(schema.cartItems.id, existing.id));
  } else {
    await db.insert(schema.cartItems).values({ cartId, type: "variant", variantId: v.id, quantity: parsed.data.quantity });
  }
  await touchCart(cartId);
  await trackServer("add_to_cart");
  return { ok: true, cart: await computeCart(cartId), message: "Ajouté au panier" };
}

const boxInput = z.object({
  boxId: z.uuid(),
  composition: z.record(z.string().max(80), z.number().int().min(0).max(48)),
  giftWrap: z.boolean(),
  giftMessage: z.string().max(GIFT_MESSAGE_MAX).optional().nullable(),
  quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
});

export async function addBoxToCart(input: z.infer<typeof boxInput>): Promise<CartResult> {
  const parsed = boxInput.safeParse(input);
  if (!parsed.success) return { ok: false, cart: await view(), error: "Composition invalide." };
  const data = parsed.data;
  const ctx = await loadPricingContext();
  const b = ctx.boxes.find((x) => x.id === data.boxId);
  if (!b) return { ok: false, cart: await view(), error: "Ce coffret n'existe pas." };
  const composition = Object.fromEntries(Object.entries(data.composition).filter(([, q]) => q > 0));
  const errors = validateComposition(
    { id: b.id, name: b.name, pieces: b.pieces, priceCents: b.priceCents, configurable: b.configurable, quoteOnly: b.quoteOnly, purchasable: !b.quoteOnly && isPurchasableStatus(b.status), stock: b.stock, fixedComposition: b.fixedComposition ?? null },
    composition,
    ctx.productMap
  );
  if (errors.length) return { ok: false, cart: await view(), error: errors[0] };
  if (b.stock < data.quantity) return { ok: false, cart: await view(), error: "Ce format de coffret est épuisé pour le moment." };
  const user = await getCurrentUser();
  const cartId = await ensureCart(user?.id);
  await db.insert(schema.cartItems).values({
    cartId,
    type: "box",
    boxId: b.id,
    composition,
    giftWrap: data.giftWrap,
    giftMessage: data.giftMessage?.trim() || null,
    quantity: data.quantity,
  });
  await touchCart(cartId);
  await trackServer("add_to_cart");
  const cart = await computeCart(cartId);
  const line = cart.lines[cart.lines.length - 1];
  if (line?.errors.length) return { ok: false, cart, error: line.errors[0] };
  return { ok: true, cart, message: "Coffret ajouté au panier" };
}

export async function updateCartItem(itemId: string, quantity: number): Promise<CartResult> {
  const cartId = await readCartId();
  if (!cartId || !z.uuid().safeParse(itemId).success) return { ok: false, cart: await view(), error: "Panier introuvable." };
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_LINE_QUANTITY) return { ok: false, cart: await view(), error: `Quantité comprise entre 1 et ${MAX_LINE_QUANTITY}.` };
  if (quantity === 0) await db.delete(schema.cartItems).where(and(eq(schema.cartItems.id, itemId), eq(schema.cartItems.cartId, cartId)));
  else await db.update(schema.cartItems).set({ quantity }).where(and(eq(schema.cartItems.id, itemId), eq(schema.cartItems.cartId, cartId)));
  await touchCart(cartId);
  return { ok: true, cart: await computeCart(cartId) };
}

export async function removeCartItem(itemId: string): Promise<CartResult> {
  return updateCartItem(itemId, 0);
}

export async function applyPromoCode(code: string): Promise<CartResult> {
  const clean = code.trim().toUpperCase().replace(/\s+/g, "");
  if (!clean || clean.length > 40) return { ok: false, cart: await view(), error: "Saisissez un code." };
  const cartId = await readCartId();
  if (!cartId) return { ok: false, cart: await view(), error: "Ajoutez d'abord une création à votre panier." };
  const [p] = await db.select({ code: schema.promoCodes.code }).from(schema.promoCodes).where(eq(schema.promoCodes.code, clean)).limit(1);
  if (!p) return { ok: false, cart: await view(), error: "Ce code n'existe pas." };
  await db.update(schema.carts).set({ promoCode: clean, updatedAt: new Date() }).where(eq(schema.carts.id, cartId));
  const cart = await computeCart(cartId);
  if (cart.promo && !cart.promo.ok) {
    await db.update(schema.carts).set({ promoCode: null }).where(eq(schema.carts.id, cartId));
    return { ok: false, cart: await computeCart(cartId), error: cart.promo.message };
  }
  return { ok: true, cart, message: cart.promo?.message };
}

export async function removePromoCode(): Promise<CartResult> {
  const cartId = await readCartId();
  if (cartId) await db.update(schema.carts).set({ promoCode: null }).where(eq(schema.carts.id, cartId));
  return { ok: true, cart: await view() };
}

export async function quoteShipping(country: string, shippingRateId: string | null): Promise<CartView> {
  const c = /^[A-Z]{2}$/.test(country) ? country : "FR";
  return computeCart(await readCartId(), { country: c, shippingRateId });
}
