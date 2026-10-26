import type { ImageRef } from "@/db/schema";
import { concept } from "@/components/ui/media";
import { ambiance } from "./ambiance";

/**
 * Visuel désigné par un identifiant : « a:<clé> » pour une photographie d'ambiance (npm run stock),
 * sinon un emplacement de visuel produit (photo du pack si validée, visuel concept à défaut).
 */
export function visual(id: string): ImageRef | null {
  return id.startsWith("a:") ? ambiance(id.slice(2)) : concept(id);
}
