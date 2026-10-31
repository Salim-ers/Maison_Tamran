import type { ImageRef } from "@/db/schema";
import data from "@/data/ambiance-manifest.json";
import { photo } from "./photos";

// Photographies d'ambiance (paysages, ingrédients, matières). Chaque emplacement est servi par sa version 4K
// générée (npm run images:openai, groupe « ambiance », emplacement amb-<clé>) dès qu'elle est publiée ; à défaut,
// par la photographie libre de droits produite par `npm run stock` (brand/source/stock/stock.json).
// Elles ne représentent jamais les produits de la maison. Licences et justificatifs : ASSET_LICENSES.md.
type Entry = { url: string; w: number; h: number; blur: string; alt: string; credit: string; page: string; focus?: string };
const A = data as Record<string, Entry>;

/** `focus` : point focal (valeur CSS object-position) quand le sujet n'est pas centré dans la photo. */
export type AmbianceImage = ImageRef & { credit: string; page: string; focus?: string };

export function ambiance(key: string): AmbianceImage | null {
  const g = photo(`amb-${key}`);
  if (g) return { url: g.url, alt: g.alt, role: "extra", w: g.w, h: g.h, blur: g.blur, credit: g.badge, page: "", concept: true, badge: g.badge };
  const e = A[key];
  if (!e) return null;
  return { url: e.url, alt: e.alt, role: "extra", w: e.w, h: e.h, blur: e.blur, credit: e.credit, page: e.page, focus: e.focus };
}
