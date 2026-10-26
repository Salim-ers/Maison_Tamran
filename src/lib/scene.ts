import data from "@/data/scene-manifest.json";

// Éléments détourés pour les grandes scènes (coffret, ingrédients, plans de palmeraie), produits par
// `npm run scene-assets`. Chaque fichier garde au plus la définition de sa source : la taille d'affichage
// maximale est fixée par le composant qui l'utilise (voir IMAGE_AUDIT.md).
export type SceneAsset = { url: string; w: number; h: number; source: string; credit?: string };
const A = data as Record<string, SceneAsset>;

export function scene(key: string): SceneAsset | null {
  return A[key] ?? null;
}

/** Tous les éléments dont la clé commence par `prefix` (ex. « ing-pistache »), dans l'ordre du manifeste. */
export function sceneGroup(prefix: string): (SceneAsset & { key: string })[] {
  return Object.entries(A)
    .filter(([k]) => k.startsWith(prefix))
    .map(([key, a]) => ({ key, ...a }));
}
