// Fichiers du pipeline d'images : candidats en attente (hors dépôt), manifeste des photos validées
// (lu par le site) et registre de provenance (non chargé par le site).
import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

export const ROOT = path.resolve(import.meta.dirname, "../..");
/** Candidats générés, en attente de validation manuelle (ignoré par git, jamais publié). */
export const STAGING = path.join(ROOT, ".images-staging");
export const LEDGER = path.join(STAGING, "usage.json");
export const MANIFEST = path.join(ROOT, "src/data/photo-manifest.json");
export const PROVENANCE = path.join(ROOT, "src/data/photo-provenance.json");

export interface Candidate {
  shot: string;
  file: string; // nom du fichier dans .images-staging/<shot>/
  model: string;
  modelId: string;
  seed: number;
  width: number;
  height: number;
  prompt: string;
  neuronsEstimate: number;
  generatedAt: string;
}

/** Entrée du manifeste lu par le site (uniquement des photos validées). */
export interface ManifestEntry {
  url: string;
  w: number;
  h: number;
  blur: string;
}

export interface ProvenanceEntry {
  status: "approved" | "revoked";
  nature: string;
  source: string;
  model: string;
  modelId: string;
  seed: number;
  prompt: string;
  generatedAt: string;
  approvedAt?: string;
  revokedAt?: string;
  file?: string;
  width: number;
  height: number;
  candidate: string;
}

export const NATURE = "Image conceptuelle générée par IA — ne représente pas un produit réellement fabriqué.";

export function readJson<T>(file: string, fallback: T): T {
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as T) : fallback;
}

export function writeJson(file: string, data: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const sorted = Object.fromEntries(Object.entries(data as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(file, `${JSON.stringify(sorted, null, 2)}\n`);
}

/** Candidats d'un emplacement, du plus récent au plus ancien. */
export function candidates(shot: string): Candidate[] {
  const dir = path.join(STAGING, shot);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJson<Candidate>(path.join(dir, f), null as unknown as Candidate))
    .filter((c) => c && fs.existsSync(path.join(dir, c.file)))
    .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}
