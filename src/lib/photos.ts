import type { ImageRef } from "@/db/schema";
import manifest from "@/data/photo-manifest.json";

// Photos validées du pipeline d'images (npm run images:approve). Ce sont des images conceptuelles
// générées par IA : elles restent marquées `concept` et signalées comme telles à l'écran.
type Photo = { url: string; w: number; h: number; blur: string };
const PHOTOS = manifest as Record<string, Photo>;

const CONCEPT_URL = /^\/images\/concepts\/([\w-]+)\.webp$/;

/** Remplace un visuel concept illustré par sa photo validée, s'il en existe une. */
export function withPhoto<T extends ImageRef | null | undefined>(image: T): T {
  const id = image?.url.match(CONCEPT_URL)?.[1];
  const photo = id ? PHOTOS[id] : undefined;
  if (!image || !photo) return image;
  return { ...image, url: photo.url, w: photo.w, h: photo.h, blur: photo.blur, concept: true, ai: true };
}
