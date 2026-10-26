import "server-only";
import { cookies } from "next/headers";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/db";
import { isPurchasableStatus } from "./catalog";
import { withPhoto } from "./photos";
import { getSettingsFresh } from "./settings";
import {
  evaluatePromo, priceLines, shippingOptions, totals, type LineInput, type PricingBox, type PricingProduct, type PricingVariant,
} from "./pricing";

export const CART_COOKIE = "tb_cart";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function readCartId(): Promise<string | null> {
  const jar = await cookies();
  const id = jar.get(CART_COOKIE)?.value;
  return id && UUID.test(id) ? id : null;
}

export async function ensureCart(userId?: string | null): Promise<string> {
  const existing = await readCartId();
  if (existing) {
    const [row] = await db.select({ id: schema.carts.id }).from(schema.carts).where(eq(schema.carts.id, existing)).limit(1);
    if (row) return row.id;
  }
  const [created] = await db.insert(schema.carts).values({ userId: userId ?? null }).returning({ id: schema.carts.id });
  const jar = await cookies();
  jar.set(CART_COOKIE, created.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 86400 });
  return created.id;
}

/** À la connexion : rattache le panier invité au compte, ou reprend le panier du compte s'il n'y en a pas. */
export async function attachCartToUser(userId: string) {
  const current = await readCartId();
  if (current) {
    await db.update(schema.carts).set({ userId }).where(and(eq(schema.carts.id, current), isNull(schema.carts.userId)));
    return;
  }
  const [last] = await db.select({ id: schema.carts.id }).from(schema.carts).where(eq(schema.carts.userId, userId)).orderBy(schema.carts.updatedAt).limit(1);
  if (last) {
    const jar = await cookies();
    jar.set(CART_COOKIE, last.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 86400 });
  }
}

export interface CartLineView {
  id: string;
  type: "box" | "variant";
  name: string;
  description: string;
  quantity: number;
  unitCents: number;
  totalCents: number;
  errors: string[];
  image: string | null;
  href: string;
  composition: { slug: string; name: string; qty: number; color: string }[] | null;
  giftWrap: boolean;
  giftMessage: string | null;
  pieces: number | null;
}

export interface CartView {
  id: string | null;
  lines: CartLineView[];
  itemCount: number;
  subtotalCents: number;
  promo: { code: string; ok: boolean; message: string; discountCents: number; freeShipping: boolean } | null;
  discountCents: number;
  shipping: { id: string; name: string; description: string | null; priceCents: number; provisional: boolean }[];
  selectedShippingId: string | null;
  shippingCents: number | null;
  totalCents: number;
  blocking: boolean; // au moins une erreur empêche la commande
}

export const EMPTY_CART: CartView = {
  id: null, lines: [], itemCount: 0, subtotalCents: 0, promo: null, discountCents: 0, shipping: [], selectedShippingId: null, shippingCents: null, totalCents: 0, blocking: false,
};

/** Charge les données de référence fraîches (non mises en cache) nécessaires au calcul. */
export async function loadPricingContext() {
  const [products, boxes, variants, settings] = await Promise.all([
    db.select().from(schema.products),
    db.select().from(schema.boxes),
    db.select().from(schema.variants),
    getSettingsFresh(),
  ]);
  const productMap = new Map<string, PricingProduct>(
    products.map((p) => [p.slug, { slug: p.slug, name: p.name, purchasable: isPurchasableStatus(p.status), stockPieces: p.stockPieces, boxSupplementCents: p.boxSupplementCents }])
  );
  return { products, boxes, variants, settings, productMap };
}

export async function computeCart(cartId: string | null, opts: { country?: string; shippingRateId?: string | null } = {}): Promise<CartView> {
  if (!cartId) return EMPTY_CART;
  const [cart] = await db.select().from(schema.carts).where(eq(schema.carts.id, cartId)).limit(1);
  if (!cart) return EMPTY_CART;
  const items = await db.select().from(schema.cartItems).where(eq(schema.cartItems.cartId, cartId)).orderBy(schema.cartItems.createdAt);
  const ctx = await loadPricingContext();
  const boxById = new Map(ctx.boxes.map((b) => [b.id, b]));
  const variantById = new Map(ctx.variants.map((v) => [v.id, v]));
  const productById = new Map(ctx.products.map((p) => [p.id, p]));
  const productBySlug = new Map(ctx.products.map((p) => [p.slug, p]));

  const inputs: LineInput[] = [];
  const meta: Record<string, Omit<CartLineView, "name" | "description" | "unitCents" | "totalCents" | "errors" | "quantity">> = {};
  for (const it of items) {
    if (it.type === "box" && it.boxId) {
      const b = boxById.get(it.boxId);
      if (!b) continue;
      const box: PricingBox = {
        id: b.id, name: b.name, pieces: b.pieces, priceCents: b.priceCents, configurable: b.configurable, quoteOnly: b.quoteOnly,
        purchasable: !b.quoteOnly && isPurchasableStatus(b.status), stock: b.stock, fixedComposition: b.fixedComposition ?? null,
      };
      const composition = it.composition ?? {};
      inputs.push({ key: it.id, type: "box", box, composition, giftWrap: it.giftWrap, giftMessage: it.giftMessage, quantity: it.quantity });
      // vignette : la photo du coffret si elle existe, sinon celle de la première création qu'il contient
      const firstSlug = Object.entries(composition).find(([, q]) => q > 0)?.[0] ?? Object.keys(b.fixedComposition ?? {})[0];
      const firstProduct = firstSlug ? productBySlug.get(firstSlug) : undefined;
      const boxImage = withPhoto(b.images.find((i) => i.role === "main"));
      const image = boxImage && !boxImage.url.startsWith("/images/concepts/") ? boxImage.url : withPhoto(firstProduct?.images.find((i) => i.role === "main"))?.url ?? boxImage?.url ?? null;
      meta[it.id] = {
        id: it.id, type: "box", image, href: b.configurable ? `/composer-mon-coffret?format=${b.pieces}` : `/coffrets#${b.slug}`,
        composition: Object.entries(composition).filter(([, q]) => q > 0).map(([slug, qty]) => ({ slug, qty, name: productBySlug.get(slug)?.name ?? slug, color: productBySlug.get(slug)?.palette.accent ?? "#A87455" })),
        giftWrap: it.giftWrap, giftMessage: it.giftMessage, pieces: b.pieces,
      };
    } else if (it.type === "variant" && it.variantId) {
      const v = variantById.get(it.variantId);
      if (!v) continue;
      const p = productById.get(v.productId);
      if (!p) continue;
      const variant: PricingVariant = { id: v.id, name: v.name, productSlug: p.slug, productName: p.name, pieces: v.pieces, priceCents: v.priceCents, stock: v.stock, purchasable: v.active && isPurchasableStatus(p.status) };
      inputs.push({ key: it.id, type: "variant", variant, quantity: it.quantity });
      meta[it.id] = { id: it.id, type: "variant", image: withPhoto(p.images.find((i) => i.role === "main"))?.url ?? null, href: `/creations/${p.slug}`, composition: null, giftWrap: false, giftMessage: null, pieces: v.pieces };
    }
  }
  const priced = priceLines(inputs, ctx.productMap, ctx.settings.giftWrapCents);
  const lines: CartLineView[] = priced.map((l) => ({ ...meta[l.key], name: l.name, description: l.description, unitCents: l.unitCents, totalCents: l.totalCents, quantity: l.quantity, errors: l.errors }));
  const subtotal = lines.reduce((s, l) => s + l.totalCents, 0);

  let promo: CartView["promo"] = null;
  let discount = 0;
  let freeShipping = false;
  if (cart.promoCode) {
    const [p] = await db.select().from(schema.promoCodes).where(eq(schema.promoCodes.code, cart.promoCode)).limit(1);
    const res = evaluatePromo(p ?? null, subtotal);
    if (res.ok) {
      discount = res.discountCents;
      freeShipping = res.freeShipping;
      promo = { code: cart.promoCode, ok: true, message: res.freeShipping ? "Livraison offerte" : "Remise appliquée", discountCents: discount, freeShipping };
    } else {
      promo = { code: cart.promoCode, ok: false, message: res.reason, discountCents: 0, freeShipping: false };
    }
  }

  const rates = await db.select().from(schema.shippingRates).orderBy(schema.shippingRates.sortOrder);
  const country = opts.country ?? "FR";
  const ship = shippingOptions(rates, country, subtotal - discount, freeShipping);
  const selected = opts.shippingRateId ? ship.find((s) => s.id === opts.shippingRateId) ?? null : null;
  const t = totals(subtotal, discount, selected ? selected.priceCents : null);

  return {
    id: cartId,
    lines,
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
    subtotalCents: subtotal,
    promo,
    discountCents: t.discountCents,
    shipping: ship.map((s) => ({ id: s.id, name: s.name, description: s.description, priceCents: s.priceCents, provisional: s.provisional })),
    selectedShippingId: selected?.id ?? null,
    shippingCents: t.shippingCents,
    totalCents: t.totalCents,
    blocking: lines.some((l) => l.errors.length > 0),
  };
}

export async function touchCart(cartId: string) {
  await db.update(schema.carts).set({ updatedAt: new Date() }).where(eq(schema.carts.id, cartId));
}

export async function clearCart(cartId: string) {
  await db.delete(schema.cartItems).where(eq(schema.cartItems.cartId, cartId));
  await db.update(schema.carts).set({ promoCode: null, updatedAt: new Date() }).where(eq(schema.carts.id, cartId));
}

