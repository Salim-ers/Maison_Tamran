import type { ImageRef } from "@/db/schema";
import manifest from "@/data/photo-manifest.json";

// Photos validées : pack photographique Maison Tamrān (npm run pack-photos) et pipeline IA (npm run images:approve).
// Ce sont des visuels conceptuels : ils restent marqués `concept` et signalés comme tels à l'écran.
type Photo = { url: string; w: number; h: number; blur: string; badge?: string; alt?: string };
const PHOTOS = manifest as Record<string, Photo>;

const CONCEPT_URL = /^\/images\/concepts\/([\w-]+)\.webp$/;

/** Remplace un visuel concept illustré par sa photo validée, s'il en existe une. */
export function withPhoto<T extends ImageRef | null | undefined>(image: T): T {
  const id = image?.url.match(CONCEPT_URL)?.[1];
  const photo = id ? PHOTOS[id] : undefined;
  if (!image || !photo) return image;
  return { ...image, url: photo.url, w: photo.w, h: photo.h, blur: photo.blur, alt: photo.alt ?? image.alt, concept: true, badge: photo.badge ?? "Image conceptuelle · IA" };
}
