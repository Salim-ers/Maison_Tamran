import "server-only";
import { db, schema } from "@/db";

export interface SiteSettings {
  giftWrapCents: number;
  giftWrapLabel: string;
  contactEmail: string;
  legal: Record<string, string>;
  social: Record<string, string>;
}

/** Lecture directe (non mise en cache) des réglages du back-office. */
export async function readSettings(): Promise<SiteSettings> {
  const rows = await db.select().from(schema.settings);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, unknown>;
  return {
    giftWrapCents: Number(map.giftWrapCents ?? 350),
    giftWrapLabel: String(map.giftWrapLabel ?? "Papier de soie, ruban bronze et carte manuscrite"),
    contactEmail: String(map.contactEmail ?? "bonjour@tambre.example"),
    legal: (map.legal ?? {}) as Record<string, string>,
    social: (map.social ?? {}) as Record<string, string>,
  };
}

export const getSettingsFresh = readSettings;
