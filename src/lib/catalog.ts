import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { storeMode } from "./env";
import { withPhoto } from "./photos";
import { readSettings } from "./settings";

export type ProductRow = typeof schema.products.$inferSelect;
export type BoxRow = typeof schema.boxes.$inferSelect;
export type VariantRow = typeof schema.variants.$inferSelect;
export type CollectionRow = typeof schema.collections.$inferSelect;

export interface CatalogProduct extends ProductRow {
  collectionSlug: string;
  collectionName: string;
  purchasable: boolean;
  variants: VariantRow[];
}

/** Un prototype n'est achetable qu'en mode démonstration. En mode réel, seul le statut « available » l'est. */
export function isPurchasableStatus(status: ProductRow["status"]) {
  if (status === "available") return true;
  return status === "prototype" && storeMode() === "demo";
}

export async function getCatalog(): Promise<{ products: CatalogProduct[]; collections: CollectionRow[] }> {
  "use cache";
  cacheTag("catalog");
  cacheLife("hours");
  const [collections, products, variants] = await Promise.all([
    db.select().from(schema.collections).orderBy(asc(schema.collections.sortOrder)),
    db.select().from(schema.products).orderBy(asc(schema.products.sortOrder), asc(schema.products.number)),
    db.select().from(schema.variants).where(eq(schema.variants.active, true)).orderBy(asc(schema.variants.sortOrder)),
  ]);
  const byId = new Map(collections.map((c) => [c.id, c]));
  return {
    collections,
    products: products
      .filter((p) => p.status !== "archived" && p.status !== "draft")
      .map((p) => ({
        ...p,
        images: p.images.map(withPhoto),
        collectionSlug: byId.get(p.collectionId ?? "")?.slug ?? "",
        collectionName: byId.get(p.collectionId ?? "")?.name ?? "",
        purchasable: isPurchasableStatus(p.status),
        variants: variants.filter((v) => v.productId === p.id),
      })),
  };
}

export async function getProduct(slug: string) {
  const { products } = await getCatalog();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getBoxes(): Promise<(BoxRow & { purchasable: boolean })[]> {
  "use cache";
  cacheTag("catalog");
  cacheLife("hours");
  const rows = await db.select().from(schema.boxes).orderBy(asc(schema.boxes.sortOrder));
  return rows
    .filter((b) => b.status !== "archived" && b.status !== "draft")
    .map((b) => ({ ...b, images: b.images.map(withPhoto), purchasable: !b.quoteOnly && b.priceCents != null && isPurchasableStatus(b.status) }));
}

export async function getSettings() {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");
  return readSettings();
}

export async function getContent<T extends Record<string, string>>(key: string, fallback: T): Promise<T> {
  "use cache";
  cacheTag("content");
  cacheLife("hours");
  const [row] = await db.select().from(schema.contentBlocks).where(eq(schema.contentBlocks.key, key)).limit(1);
  return { ...fallback, ...(row?.value ?? {}) } as T;
}

export async function getApprovedTestimonials() {
  "use cache";
  cacheTag("testimonials");
  cacheLife("hours");
  return db.select().from(schema.testimonials).where(eq(schema.testimonials.status, "approved")).orderBy(asc(schema.testimonials.createdAt));
}

export function imageOf(p: { images: schema_ImageRef[] }, role: schema_ImageRef["role"]) {
  return p.images.find((i) => i.role === role) ?? p.images[0] ?? null;
}
type schema_ImageRef = import("@/db/schema").ImageRef;
