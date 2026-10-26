import { CHOCOLATE_LABELS, type ChocolateKind } from "@/data/recipes";
import type { CatalogProduct } from "./catalog";
import type { CardProduct } from "@/components/product/product-card";
import type { FlavorSwatch } from "@/components/configurator/box-preview";

export function toCard(p: CatalogProduct): CardProduct {
  const prices = p.variants.map((v) => v.priceCents);
  // ajout rapide : le format le moins cher disponible, seulement si la création est achetable
  const quick = p.purchasable ? [...p.variants].filter((v) => v.stock > 0).sort((a, b) => a.priceCents - b.priceCents)[0] : undefined;
  return {
    quick: quick ? { id: quick.id, label: quick.name, priceCents: quick.priceCents } : null,
    slug: p.slug,
    number: p.number,
    name: p.name,
    pairing: p.pairing,
    collectionName: p.collectionName,
    chocolateLabel: CHOCOLATE_LABELS[p.chocolate as ChocolateKind] ?? p.chocolate,
    fromCents: prices.length ? Math.min(...prices) : null,
    main: p.images.find((i) => i.role === "main") ?? null,
    cut: p.images.find((i) => i.role === "cut") ?? null,
    accent: p.palette.accent,
    status: p.status,
    limited: p.limited,
  };
}

export function toSwatch(p: CatalogProduct): FlavorSwatch {
  const thumb = p.images.find((i) => i.role === "cut") ?? p.images.find((i) => i.role === "main");
  return { slug: p.slug, name: p.name, coat: p.palette.coat, coatLight: p.palette.coatLight, accent: p.palette.accent, thumb: thumb ? { url: thumb.url, blur: thumb.blur } : null };
}

export const STATUS_PUBLIC: Record<string, string> = {
  prototype: "Recette en développement",
  available: "Disponible",
  draft: "Brouillon",
  archived: "Archivée",
};

import { ALLERGEN_LABELS, FLAVOR_LABELS } from "@/data/recipes";
import type { BrowsableProduct } from "@/components/product/catalog-browser";
import type { CollectionRow } from "./catalog";

export function toBrowsable(p: CatalogProduct): BrowsableProduct {
  return {
    ...toCard(p),
    collectionSlug: p.collectionSlug,
    chocolate: p.chocolate,
    flavorFamilies: p.flavorFamilies,
    allergens: p.allergens,
    searchText: [p.name, p.pairing, p.tagline, p.ingredients, p.collectionName, ...p.flavorFamilies.map((f) => FLAVOR_LABELS[f] ?? f)].join(" "),
  };
}

export function catalogLabels(collections: CollectionRow[]) {
  return {
    flavors: FLAVOR_LABELS,
    chocolates: CHOCOLATE_LABELS as Record<string, string>,
    allergens: Object.fromEntries(Object.entries(ALLERGEN_LABELS).map(([k, v]) => [k, v.toLowerCase()])),
    collections: Object.fromEntries(collections.map((c) => [c.slug, c.name.replace("Collection ", "")])),
  };
}
