import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";

export type PriceTierRow = typeof schema.priceTiers.$inferSelect;
export type ShippingRateRow = typeof schema.shippingRates.$inferSelect;

/** Paliers de tarifs dégressifs actifs (espace professionnel). */
export async function getActivePriceTiers(): Promise<PriceTierRow[]> {
  "use cache";
  cacheTag("catalog");
  cacheLife("hours");
  return db.select().from(schema.priceTiers).where(eq(schema.priceTiers.active, true)).orderBy(asc(schema.priceTiers.minQuantity));
}

/** Tarifs de livraison actifs (page Livraison et retours). */
export async function getActiveShippingRates(): Promise<ShippingRateRow[]> {
  "use cache";
  cacheTag("catalog");
  cacheLife("hours");
  return db.select().from(schema.shippingRates).where(eq(schema.shippingRates.active, true)).orderBy(asc(schema.shippingRates.sortOrder));
}
