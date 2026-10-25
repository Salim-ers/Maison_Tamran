// Moteur de prix — fonctions pures, sans accès base, testées dans tests/pricing.test.ts.
// Le serveur est la seule source de vérité : le client n'envoie que des identifiants et des quantités.

export interface PricingProduct {
  slug: string;
  name: string;
  purchasable: boolean;
  stockPieces: number;
  boxSupplementCents: number;
}

export interface PricingBox {
  id: string;
  name: string;
  pieces: number | null;
  priceCents: number | null;
  configurable: boolean;
  quoteOnly: boolean;
  purchasable: boolean;
  stock: number;
  fixedComposition: Record<string, number> | null;
}

export interface PricingVariant {
  id: string;
  name: string;
  productSlug: string;
  productName: string;
  pieces: number;
  priceCents: number;
  stock: number;
  purchasable: boolean;
}

export type LineInput =
  | { key: string; type: "box"; box: PricingBox; composition: Record<string, number>; giftWrap: boolean; giftMessage?: string | null; quantity: number }
  | { key: string; type: "variant"; variant: PricingVariant; quantity: number };

export interface PricedLine {
  key: string;
  type: "box" | "variant";
  name: string;
  description: string;
  unitCents: number;
  quantity: number;
  totalCents: number;
  errors: string[];
}

export interface PromoInput {
  code: string;
  kind: "percent" | "fixed" | "free_shipping";
  value: number;
  minSubtotalCents: number;
  startsAt: Date | null;
  endsAt: Date | null;
  maxUses: number | null;
  uses: number;
  active: boolean;
}

export interface ShippingRateInput {
  id: string;
  name: string;
  description?: string | null;
  countries: string[];
  priceCents: number;
  freeAboveCents: number | null;
  minSubtotalCents: number;
  active: boolean;
  provisional: boolean;
}

export const MAX_LINE_QUANTITY = 20;
export const GIFT_MESSAGE_MAX = 240;

/** Vérifie une composition de coffret. Retourne la liste des erreurs (vide si valide). */
export function validateComposition(box: PricingBox, composition: Record<string, number>, products: Map<string, PricingProduct>): string[] {
  const errors: string[] = [];
  if (box.quoteOnly || box.priceCents == null) return ["Ce coffret est proposé sur devis uniquement."];
  if (!box.purchasable) errors.push(`${box.name} n'est pas disponible à la vente.`);
  if (box.fixedComposition) {
    const same =
      Object.keys(box.fixedComposition).length === Object.keys(composition).length &&
      Object.entries(box.fixedComposition).every(([k, v]) => composition[k] === v);
    if (!same) errors.push("La composition de ce coffret est imposée.");
  }
  let total = 0;
  for (const [slug, qty] of Object.entries(composition)) {
    if (!Number.isInteger(qty) || qty < 0) {
      errors.push("Quantité invalide.");
      continue;
    }
    if (qty === 0) continue;
    const p = products.get(slug);
    if (!p) {
      errors.push("Une saveur de la composition n'existe plus.");
      continue;
    }
    if (!p.purchasable) errors.push(`${p.name} n'est pas disponible actuellement.`);
    total += qty;
  }
  if (box.pieces != null && total !== box.pieces) {
    errors.push(total < box.pieces ? `Il reste ${box.pieces - total} place${box.pieces - total > 1 ? "s" : ""} à remplir.` : `La composition dépasse ${box.pieces} pièces.`);
  }
  return errors;
}

export function boxUnitPrice(box: PricingBox, composition: Record<string, number>, products: Map<string, PricingProduct>, giftWrap: boolean, giftWrapCents: number) {
  let cents = box.priceCents ?? 0;
  for (const [slug, qty] of Object.entries(composition)) {
    const p = products.get(slug);
    if (p && qty > 0) cents += p.boxSupplementCents * qty;
  }
  if (giftWrap) cents += giftWrapCents;
  return cents;
}

export function describeComposition(composition: Record<string, number>, products: Map<string, PricingProduct>) {
  return Object.entries(composition)
    .filter(([, q]) => q > 0)
    .map(([slug, q]) => `${q} × ${products.get(slug)?.name ?? slug}`)
    .join(", ");
}

/** Prix des lignes + contrôle de stock agrégé sur tout le panier. */
export function priceLines(lines: LineInput[], products: Map<string, PricingProduct>, giftWrapCents: number): PricedLine[] {
  // Besoins agrégés (pièces par saveur, boîtes, étuis)
  const piecesNeeded = new Map<string, number>();
  const boxesNeeded = new Map<string, number>();
  const variantsNeeded = new Map<string, number>();
  for (const l of lines) {
    if (l.type === "box") {
      boxesNeeded.set(l.box.id, (boxesNeeded.get(l.box.id) ?? 0) + l.quantity);
      for (const [slug, q] of Object.entries(l.composition)) piecesNeeded.set(slug, (piecesNeeded.get(slug) ?? 0) + q * l.quantity);
    } else {
      variantsNeeded.set(l.variant.id, (variantsNeeded.get(l.variant.id) ?? 0) + l.quantity);
    }
  }

  return lines.map((l) => {
    const errors: string[] = [];
    if (!Number.isInteger(l.quantity) || l.quantity < 1 || l.quantity > MAX_LINE_QUANTITY) errors.push(`Quantité comprise entre 1 et ${MAX_LINE_QUANTITY}.`);
    if (l.type === "box") {
      errors.push(...validateComposition(l.box, l.composition, products));
      if ((boxesNeeded.get(l.box.id) ?? 0) > l.box.stock) errors.push(`Stock insuffisant pour ${l.box.name} (${Math.max(0, l.box.stock)} disponible${l.box.stock > 1 ? "s" : ""}).`);
      for (const [slug, q] of Object.entries(l.composition)) {
        const p = products.get(slug);
        if (p && q > 0 && (piecesNeeded.get(slug) ?? 0) > p.stockPieces) errors.push(`Stock insuffisant pour ${p.name} : ${Math.max(0, p.stockPieces)} pièce${p.stockPieces > 1 ? "s" : ""} disponible${p.stockPieces > 1 ? "s" : ""}.`);
      }
      if (l.giftMessage && l.giftMessage.length > GIFT_MESSAGE_MAX) errors.push(`Message limité à ${GIFT_MESSAGE_MAX} caractères.`);
      const unit = boxUnitPrice(l.box, l.composition, products, l.giftWrap, giftWrapCents);
      return {
        key: l.key,
        type: "box" as const,
        name: l.box.name,
        description: describeComposition(l.composition, products) + (l.giftWrap ? " · emballage cadeau" : ""),
        unitCents: unit,
        quantity: l.quantity,
        totalCents: unit * l.quantity,
        errors: [...new Set(errors)],
      };
    }
    const v = l.variant;
    if (!v.purchasable) errors.push(`${v.productName} n'est pas disponible actuellement.`);
    if ((variantsNeeded.get(v.id) ?? 0) > v.stock) errors.push(`Stock insuffisant : ${Math.max(0, v.stock)} disponible${v.stock > 1 ? "s" : ""}.`);
    return {
      key: l.key,
      type: "variant" as const,
      name: `${v.productName}`,
      description: v.name,
      unitCents: v.priceCents,
      quantity: l.quantity,
      totalCents: v.priceCents * l.quantity,
      errors,
    };
  });
}

export function evaluatePromo(promo: PromoInput | null, subtotalCents: number, now = new Date()): { ok: true; discountCents: number; freeShipping: boolean } | { ok: false; reason: string } {
  if (!promo) return { ok: false, reason: "Ce code n'existe pas." };
  if (!promo.active) return { ok: false, reason: "Ce code n'est plus actif." };
  if (promo.startsAt && now < promo.startsAt) return { ok: false, reason: "Ce code n'est pas encore valable." };
  if (promo.endsAt && now > promo.endsAt) return { ok: false, reason: "Ce code a expiré." };
  if (promo.maxUses != null && promo.uses >= promo.maxUses) return { ok: false, reason: "Ce code a atteint son nombre maximal d'utilisations." };
  if (subtotalCents < promo.minSubtotalCents) {
    return { ok: false, reason: `Ce code s'applique à partir de ${(promo.minSubtotalCents / 100).toFixed(2).replace(".", ",")} € d'achat.` };
  }
  if (promo.kind === "percent") {
    const pct = Math.max(0, Math.min(100, promo.value));
    return { ok: true, discountCents: Math.floor((subtotalCents * pct) / 100), freeShipping: false };
  }
  if (promo.kind === "fixed") return { ok: true, discountCents: Math.min(promo.value, subtotalCents), freeShipping: false };
  return { ok: true, discountCents: 0, freeShipping: true };
}

export function shippingOptions(rates: ShippingRateInput[], country: string, merchandiseCents: number, freeShipping: boolean) {
  return rates
    .filter((r) => r.active && r.countries.includes(country) && merchandiseCents >= r.minSubtotalCents)
    .map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? null,
      provisional: r.provisional,
      priceCents: freeShipping || (r.freeAboveCents != null && merchandiseCents >= r.freeAboveCents) ? 0 : r.priceCents,
      basePriceCents: r.priceCents,
      freeAboveCents: r.freeAboveCents,
    }));
}

export interface Totals {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number | null; // null tant que la livraison n'est pas choisie
  totalCents: number;
}

export function totals(subtotalCents: number, discountCents: number, shippingCents: number | null): Totals {
  const d = Math.min(discountCents, subtotalCents);
  return { subtotalCents, discountCents: d, shippingCents, totalCents: subtotalCents - d + (shippingCents ?? 0) };
}
