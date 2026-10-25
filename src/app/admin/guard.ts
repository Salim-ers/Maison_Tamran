import "server-only";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";

/**
 * À appeler en tête de chaque page d'administration : rend la page dynamique
 * et revérifie la session (défense en profondeur, en plus du layout).
 */
export async function adminPage() {
  await connection();
  return requireAdmin();
}

/** Lecture sûre d'un paramètre de recherche (première valeur, chaîne). */
export function sp(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;
