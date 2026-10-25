import { describe, expect, it } from "vitest";
import {
  boxUnitPrice, evaluatePromo, priceLines, shippingOptions, totals, validateComposition, type PricingBox, type PricingProduct, type PromoInput, type ShippingRateInput,
} from "../src/lib/pricing";

const products = new Map<string, PricingProduct>([
  ["a", { slug: "a", name: "Éclipse Noire", purchasable: true, stockPieces: 10, boxSupplementCents: 0 }],
  ["b", { slug: "b", name: "Or de Marrakech", purchasable: true, stockPieces: 4, boxSupplementCents: 50 }],
  ["x", { slug: "x", name: "Archivée", purchasable: false, stockPieces: 100, boxSupplementCents: 0 }],
]);

const box6: PricingBox = { id: "box6", name: "Coffret Découverte", pieces: 6, priceCents: 1490, configurable: true, quoteOnly: false, purchasable: true, stock: 5, fixedComposition: null };
const quoteBox: PricingBox = { ...box6, id: "q", name: "Coffret Entreprise", pieces: null, priceCents: null, quoteOnly: true };

describe("validateComposition", () => {
  it("accepte une composition complète", () => {
    expect(validateComposition(box6, { a: 4, b: 2 }, products)).toEqual([]);
  });
  it("signale les places restantes", () => {
    expect(validateComposition(box6, { a: 4 }, products)).toEqual(["Il reste 2 places à remplir."]);
  });
  it("refuse un dépassement", () => {
    expect(validateComposition(box6, { a: 7 }, products)[0]).toMatch(/dépasse 6 pièces/);
  });
  it("refuse une saveur inconnue ou indisponible", () => {
    expect(validateComposition(box6, { a: 5, zz: 1 }, products)).toContain("Une saveur de la composition n'existe plus.");
    expect(validateComposition(box6, { a: 5, x: 1 }, products)).toContain("Archivée n'est pas disponible actuellement.");
  });
  it("refuse les quantités non entières ou négatives", () => {
    expect(validateComposition(box6, { a: 6.5 }, products)).toContain("Quantité invalide.");
    expect(validateComposition(box6, { a: -1, b: 7 }, products)).toContain("Quantité invalide.");
  });
  it("refuse les coffrets sur devis", () => {
    expect(validateComposition(quoteBox, {}, products)).toEqual(["Ce coffret est proposé sur devis uniquement."]);
  });
  it("impose la composition d'une édition limitée", () => {
    const fixed = { ...box6, fixedComposition: { a: 3, b: 3 } };
    expect(validateComposition(fixed, { a: 3, b: 3 }, products)).toEqual([]);
    expect(validateComposition(fixed, { a: 6 }, products)).toContain("La composition de ce coffret est imposée.");
  });
});

describe("boxUnitPrice", () => {
  it("ajoute suppléments et emballage cadeau", () => {
    expect(boxUnitPrice(box6, { a: 4, b: 2 }, products, false, 350)).toBe(1490 + 100);
    expect(boxUnitPrice(box6, { a: 4, b: 2 }, products, true, 350)).toBe(1490 + 100 + 350);
  });
});

describe("priceLines", () => {
  it("calcule le total d'une ligne et contrôle le stock agrégé sur tout le panier", () => {
    const lines = priceLines(
      [
        { key: "1", type: "box", box: box6, composition: { a: 3, b: 3 }, giftWrap: false, quantity: 1 },
        { key: "2", type: "box", box: box6, composition: { a: 4, b: 2 }, giftWrap: false, quantity: 1 },
      ],
      products,
      350
    );
    expect(lines[0].totalCents).toBe(1490 + 150);
    // 5 pièces « b » demandées pour 4 en stock
    expect(lines[0].errors.join()).toMatch(/Stock insuffisant pour Or de Marrakech/);
    expect(lines[1].errors.join()).toMatch(/Stock insuffisant pour Or de Marrakech/);
  });
  it("limite le stock de boîtes et la quantité", () => {
    const [l] = priceLines([{ key: "1", type: "box", box: { ...box6, stock: 1 }, composition: { a: 6 }, giftWrap: false, quantity: 2 }], products, 0);
    expect(l.errors.join()).toMatch(/Stock insuffisant pour Coffret Découverte/);
    const [m] = priceLines([{ key: "1", type: "box", box: box6, composition: { a: 6 }, giftWrap: false, quantity: 21 }], products, 0);
    expect(m.errors.join()).toMatch(/Quantité comprise entre 1 et 20/);
  });
  it("tarife les étuis et vérifie leur stock", () => {
    const v = { id: "v", name: "Étui de 3", productSlug: "a", productName: "Éclipse Noire", pieces: 3, priceCents: 790, stock: 2, purchasable: true };
    const [ok] = priceLines([{ key: "1", type: "variant", variant: v, quantity: 2 }], products, 0);
    expect(ok.totalCents).toBe(1580);
    expect(ok.errors).toEqual([]);
    const [ko] = priceLines([{ key: "1", type: "variant", variant: v, quantity: 3 }], products, 0);
    expect(ko.errors[0]).toMatch(/Stock insuffisant/);
  });
});

describe("evaluatePromo", () => {
  const base: PromoInput = { code: "X", kind: "percent", value: 10, minSubtotalCents: 2500, startsAt: null, endsAt: null, maxUses: null, uses: 0, active: true };
  const now = new Date("2026-10-25T12:00:00Z");
  it("applique un pourcentage arrondi à l'inférieur", () => {
    expect(evaluatePromo(base, 2980, now)).toEqual({ ok: true, discountCents: 298, freeShipping: false });
    expect(evaluatePromo(base, 2999, now)).toEqual({ ok: true, discountCents: 299, freeShipping: false });
  });
  it("respecte le minimum, les dates, l'activation et le nombre d'utilisations", () => {
    expect(evaluatePromo(base, 2000, now).ok).toBe(false);
    expect(evaluatePromo({ ...base, active: false }, 5000, now).ok).toBe(false);
    expect(evaluatePromo({ ...base, endsAt: new Date("2026-01-01") }, 5000, now).ok).toBe(false);
    expect(evaluatePromo({ ...base, startsAt: new Date("2027-01-01") }, 5000, now).ok).toBe(false);
    expect(evaluatePromo({ ...base, maxUses: 3, uses: 3 }, 5000, now).ok).toBe(false);
    expect(evaluatePromo(null, 5000, now).ok).toBe(false);
  });
  it("plafonne une remise fixe au sous-total", () => {
    expect(evaluatePromo({ ...base, kind: "fixed", value: 5000, minSubtotalCents: 0 }, 3000, now)).toEqual({ ok: true, discountCents: 3000, freeShipping: false });
  });
  it("offre la livraison", () => {
    expect(evaluatePromo({ ...base, kind: "free_shipping", value: 0 }, 3000, now)).toEqual({ ok: true, discountCents: 0, freeShipping: true });
  });
});

describe("shippingOptions et totals", () => {
  const rates: ShippingRateInput[] = [
    { id: "r1", name: "Relais", countries: ["FR"], priceCents: 490, freeAboveCents: 4500, minSubtotalCents: 0, active: true, provisional: true },
    { id: "r2", name: "Europe", countries: ["BE"], priceCents: 1490, freeAboveCents: null, minSubtotalCents: 0, active: true, provisional: true },
    { id: "r3", name: "Inactif", countries: ["FR"], priceCents: 100, freeAboveCents: null, minSubtotalCents: 0, active: false, provisional: true },
  ];
  it("filtre par pays et activation, applique la gratuité", () => {
    expect(shippingOptions(rates, "FR", 3000, false).map((r) => [r.id, r.priceCents])).toEqual([["r1", 490]]);
    expect(shippingOptions(rates, "FR", 4500, false)[0].priceCents).toBe(0);
    expect(shippingOptions(rates, "BE", 9000, false)[0].priceCents).toBe(1490);
    expect(shippingOptions(rates, "BE", 9000, true)[0].priceCents).toBe(0);
    expect(shippingOptions(rates, "US", 9000, false)).toEqual([]);
  });
  it("calcule le total", () => {
    expect(totals(2980, 298, 490)).toEqual({ subtotalCents: 2980, discountCents: 298, shippingCents: 490, totalCents: 3172 });
    expect(totals(1000, 5000, null).totalCents).toBe(0);
  });
});
