import type { ImageRef } from "@/db/schema";
import manifest from "@/data/photo-manifest.json";

// Photos validées : pack photographique Maison Tamrān (npm run pack-photos) et pipeline IA (npm run images:approve).
// Ce sont des visuels conceptuels : ils restent marqués `concept` et signalés comme tels à l'écran.
type Photo = { url: string; w: number; h: number; blur: string; badge?: string; alt?: string };
const PHOTOS = manifest as Record<string, Photo>;

const CONCEPT_URL = /^\/images\/concepts\/([\w-]+)\.webp$/;

export type PhotoRef = Photo & { id: string; alt: string; badge: string };

/** Photo validée d'un emplacement (ex. "coffret-ouvert", "piece-rouge-desir"), ou null si elle n'est pas publiée. */
export function photo(id: string): PhotoRef | null {
  const p = resolve(id);
  return p ? { ...p, id, alt: p.alt ?? "", badge: p.badge ?? "Visuel conceptuel" } : null;
}

/**
 * Emplacements historiques servis par un visuel généré (npm run images:openai) : formats de coffret, packaging,
 * professionnels, macros. « scene-<création> » (la datte entière) est servie par la pièce détourée.
 */
const ALIAS: Record<string, string> = {
  "coffret-2": "coffret-prestige",
  "coffret-3": "coffret-decouverte",
  "coffret-4": "coffret-edition",
  "packaging-1": "coffret-vide-6",
  "packaging-2": "coffret-vide-24",
  "packaging-3": "coffret-ferme",
  "pro-1": "coffret-entreprise",
  "pro-2": "pro-hotel",
  "lifestyle-1": "rituel-cafe",
  "lifestyle-2": "cadeau-mariage",
  "lifestyle-3": "atelier-ingredients",
  "macro-1": "coupe-eclipse-noire",
  "macro-2": "coupe-velours-persan",
  "macro-3": "coupe-minuit-a-kyoto",
  "macro-4": "coupe-or-de-marrakech",
  "macro-5": "coupe-cafe-imperial",
  "macro-6": "coupe-rouge-desir",
  "couche-datte": "meta-coeur",
  "couche-garniture": "coupe-or-de-marrakech",
  "couche-chocolat": "meta-enrobage",
  "couche-finition": "produit-or-de-marrakech",
};
const resolve = (id: string) => PHOTOS[id] ?? PHOTOS[ALIAS[id] ?? id.replace(/^scene-/, "piece-")];

/** Remplace un visuel concept illustré par sa photo validée, s'il en existe une. */
export function withPhoto<T extends ImageRef | null | undefined>(image: T): T {
  const id = image?.url.match(CONCEPT_URL)?.[1];
  const photo = id ? resolve(id) : undefined;
  if (!image || !photo) return image;
  return { ...image, url: photo.url, w: photo.w, h: photo.h, blur: photo.blur, alt: photo.alt ?? image.alt, concept: true, badge: photo.badge ?? "Image conceptuelle · IA" };
}
