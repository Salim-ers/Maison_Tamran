import type { ImageRef } from "@/db/schema";
import data from "@/data/ambiance-manifest.json";

// Photographies d'ambiance libres de droits (paysages, ingrédients, matières), produites par `npm run stock`
// à partir de brand/source/stock/stock.json. Elles ne représentent jamais les produits de la maison.
// Licences et justificatifs : ASSET_LICENSES.md.
type Entry = { url: string; w: number; h: number; blur: string; alt: string; credit: string; page: string; focus?: string };
const A = data as Record<string, Entry>;

/** `focus` : point focal (valeur CSS object-position) quand le sujet n'est pas centré dans la photo. */
export type AmbianceImage = ImageRef & { credit: string; page: string; focus?: string };

export function ambiance(key: string): AmbianceImage | null {
  const e = A[key];
  if (!e) return null;
  return { url: e.url, alt: e.alt, role: "extra", w: e.w, h: e.h, blur: e.blur, credit: e.credit, page: e.page, focus: e.focus };
}
