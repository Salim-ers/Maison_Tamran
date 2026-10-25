// Client Cloudflare Workers AI pour la génération des visuels conceptuels (scripts uniquement :
// jamais importé par le code Next.js, les identifiants ne quittent pas la machine ou le serveur).
// Docs : https://developers.cloudflare.com/workers-ai/models/flux-2-klein-4b/
//        https://developers.cloudflare.com/workers-ai/platform/pricing/
import fs from "node:fs";
import path from "node:path";

export type ModelKey = "klein" | "schnell";

export const MODELS: Record<ModelKey, { id: string; label: string }> = {
  klein: { id: "@cf/black-forest-labs/flux-2-klein-4b", label: "FLUX.2 [klein] 4B" },
  schnell: { id: "@cf/black-forest-labs/flux-1-schnell", label: "FLUX.1 [schnell]" },
};

/** Allocation gratuite quotidienne Workers AI (remise à zéro à 00:00 UTC). */
export const FREE_DAILY_NEURONS = 10_000;
const SCHNELL_STEPS = 8;

/**
 * Estimation prudente du coût en neurones (tarifs publiés, tuiles 512×512 arrondies au supérieur).
 * klein : 26,05 neurones par tuile produite. schnell : 4,80 par tuile + 9,60 par étape (sortie 1024×1024).
 */
export function estimateNeurons(model: ModelKey, width: number, height: number) {
  if (model === "schnell") return 4 * 4.8 + SCHNELL_STEPS * 9.6;
  return Math.ceil(width / 512) * Math.ceil(height / 512) * 26.05;
}

export class QuotaError extends Error {}

export function credentials() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (!accountId || !token) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID et CLOUDFLARE_API_TOKEN sont requis dans .env.local (voir .env.example, section Cloudflare Workers AI)."
    );
  }
  return { accountId, token };
}

// --- Suivi du quota -------------------------------------------------------------------------

const today = () => new Date().toISOString().slice(0, 10); // jour UTC, comme le quota Cloudflare

export class UsageLedger {
  private data: Record<string, { neurons: number; calls: number }>;

  constructor(private file: string) {
    this.data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
  }

  /** Neurones consommés aujourd'hui par ce pipeline (estimation locale). */
  get used() {
    return this.data[today()]?.neurons ?? 0;
  }

  record(neurons: number) {
    const d = (this.data[today()] ??= { neurons: 0, calls: 0 });
    d.neurons = Math.round((d.neurons + neurons) * 100) / 100;
    d.calls += 1;
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
  }
}

/**
 * Neurones réellement facturés aujourd'hui sur tout le compte (API GraphQL Analytics).
 * Retourne null si le jeton n'a pas le droit « Account Analytics : Read » ou si l'API ne répond pas.
 */
export async function remoteNeuronsToday(): Promise<number | null> {
  const { accountId, token } = credentials();
  const query = `query ($account: String!, $date: Date!) {
    viewer { accounts(filter: { accountTag: $account }) {
      aiInferenceAdaptiveGroups(limit: 1, filter: { date_geq: $date, date_leq: $date }) { sum { totalNeurons } }
    } }
  }`;
  try {
    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { account: accountId, date: today() } }),
    });
    const json = (await res.json()) as {
      data?: { viewer?: { accounts?: { aiInferenceAdaptiveGroups?: { sum?: { totalNeurons?: number } }[] }[] } };
      errors?: unknown[];
    };
    if (json.errors?.length || !json.data?.viewer?.accounts?.length) return null;
    const groups = json.data.viewer.accounts[0].aiInferenceAdaptiveGroups ?? [];
    return groups.reduce((s, g) => s + (g.sum?.totalNeurons ?? 0), 0);
  } catch {
    return null;
  }
}

/** Budget quotidien : jamais au-delà de l'allocation gratuite (marge de sécurité par défaut : 9 000). */
export function dailyBudget() {
  const configured = Number(process.env.CLOUDFLARE_AI_DAILY_NEURONS ?? 9_000);
  return Math.min(Number.isFinite(configured) && configured > 0 ? configured : 9_000, FREE_DAILY_NEURONS);
}

// --- Génération -----------------------------------------------------------------------------

export interface GenerateInput {
  model: ModelKey;
  prompt: string;
  width: number;
  height: number;
  seed: number;
}

export interface GenerateOutput {
  bytes: Buffer;
  ext: "jpg" | "png" | "webp";
}

function sniff(bytes: Buffer): GenerateOutput["ext"] {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpg";
  if (bytes.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  throw new Error("Réponse Cloudflare : format d'image non reconnu.");
}

/** Erreurs Cloudflare signalant l'épuisement de l'allocation (à ne jamais contourner). */
function isQuotaError(status: number, body: string) {
  return status === 429 || /3036|daily free allocation|neurons|exceeded|quota|upgrade/i.test(body);
}

export async function generateImage(input: GenerateInput): Promise<GenerateOutput> {
  const { accountId, token } = credentials();
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODELS[input.model].id}`;
  let init: RequestInit;
  if (input.model === "klein") {
    // FLUX.2 n'accepte que du multipart/form-data (4 étapes fixes, modèle distillé).
    const form = new FormData();
    form.append("prompt", input.prompt);
    form.append("width", String(input.width));
    form.append("height", String(input.height));
    form.append("seed", String(input.seed));
    init = { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form };
  } else {
    init = {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input.prompt.slice(0, 2048), steps: SCHNELL_STEPS, seed: input.seed }),
    };
  }

  const res = await fetch(url, init);
  const text = await res.text();
  if (!res.ok) {
    if (isQuotaError(res.status, text)) throw new QuotaError(`Allocation Workers AI atteinte (HTTP ${res.status}) : ${text.slice(0, 300)}`);
    throw new Error(`Cloudflare Workers AI HTTP ${res.status} : ${text.slice(0, 500)}`);
  }
  const json = JSON.parse(text) as { success?: boolean; result?: { image?: string }; errors?: unknown[] };
  const b64 = json.result?.image;
  if (!b64) throw new Error(`Réponse sans image : ${text.slice(0, 300)}`);
  const bytes = Buffer.from(b64, "base64");
  return { bytes, ext: sniff(bytes) };
}
