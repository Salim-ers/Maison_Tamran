// Client minimal de l'API Images d'OpenAI (génération et édition à partir de références).
// La clé est lue dans OPENAI_API_KEY (.env.local, non versionné) et n'est jamais écrite dans un log.
import fs from "node:fs";
import path from "node:path";

export type Quality = "low" | "medium" | "high" | "xhigh" | "max";

/** Tarifs officiels (USD par million de jetons), page modèle OpenAI consultée le 2026-10-31. */
export const PRICES: Record<string, { text: number; image: number; output: number }> = {
  "gpt-image-2.5-sunburst": { text: 5, image: 8, output: 30 },
  "gpt-image-2.5-flare": { text: 5, image: 8, output: 30 },
  "gpt-image-2": { text: 5, image: 8, output: 30 },
};

/**
 * Jetons de sortie par mégapixel, avant toute mesure. Dérivé du barème publié de gpt-image-2
 * (1024×1024 en qualité high : 0,211 $ ≈ 7 000 jetons) et volontairement majoré pour xhigh / max.
 * Dès qu'une génération a été facturée, l'estimation utilise la moyenne réellement mesurée (registre).
 */
const DEFAULT_TOKENS_PER_MP: Record<Quality, number> = { low: 250, medium: 1800, high: 7000, xhigh: 14000, max: 21000 };
/** Jetons d'entrée estimés par image de référence (haute fidélité) et pour le texte du prompt. */
const DEFAULT_REF_TOKENS = 3000;

export interface Usage {
  input_tokens?: number;
  output_tokens?: number;
  input_tokens_details?: { text_tokens?: number; image_tokens?: number };
}

export function costOf(model: string, usage: Usage): number {
  const p = PRICES[model] ?? PRICES["gpt-image-2.5-sunburst"];
  const text = usage.input_tokens_details?.text_tokens ?? 0;
  const image = usage.input_tokens_details?.image_tokens ?? Math.max(0, (usage.input_tokens ?? 0) - text);
  return (text * p.text + image * p.image + (usage.output_tokens ?? 0) * p.output) / 1e6;
}

export function megapixels(size: string): number {
  const [w, h] = size.split("x").map(Number);
  return (w * h) / 1e6;
}

/** Estimation prudente d'une génération ; `measured` = jetons de sortie par Mpx déjà observés pour cette qualité. */
export function estimateCost(model: string, size: string, quality: Quality, refs: number, measured?: number): number {
  const p = PRICES[model] ?? PRICES["gpt-image-2.5-sunburst"];
  const out = (measured ?? DEFAULT_TOKENS_PER_MP[quality]) * megapixels(size);
  return (out * p.output + refs * DEFAULT_REF_TOKENS * p.image + 600 * p.text) / 1e6;
}

/** Contraintes publiées : côtés multiples de 16, ≤ 3840 px, ratio entre 1:3 et 3:1, 655 360 à 8 294 400 pixels. */
export function checkSize(size: string) {
  const [w, h] = size.split("x").map(Number);
  const px = w * h;
  const ok = w % 16 === 0 && h % 16 === 0 && w <= 3840 && h <= 3840 && w / h <= 3 && h / w <= 3 && px >= 655_360 && px <= 8_294_400;
  if (!ok) throw new Error(`Taille refusée par l'API : ${size}`);
  return { w, h, experimental: px > 2560 * 1440 };
}

export class OpenAIError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
  }
}

export interface ImageRequest {
  model: string;
  prompt: string;
  size: string;
  quality: Quality;
  background?: "transparent" | "opaque" | "auto";
  /** Fichiers de référence (PNG, JPEG ou WebP) : passés à /v1/images/edits. */
  refs?: { name: string; bytes: Buffer }[];
}

export interface ImageResult {
  bytes: Buffer;
  usage: Usage;
  ms: number;
}

function apiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY absente : ajoutez-la dans .env.local (fichier non versionné).");
  return key;
}

const MIME: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

export async function generate(req: ImageRequest): Promise<ImageResult> {
  const started = Date.now();
  const common = {
    model: req.model,
    prompt: req.prompt,
    size: req.size,
    quality: req.quality,
    n: "1",
    output_format: "png",
    moderation: "auto",
    ...(req.background ? { background: req.background } : {}),
  };
  let res: Response;
  if (req.refs?.length) {
    const form = new FormData();
    for (const [k, v] of Object.entries(common)) form.append(k, v);
    for (const ref of req.refs) {
      const type = MIME[path.extname(ref.name).toLowerCase()] ?? "image/png";
      form.append("image[]", new Blob([new Uint8Array(ref.bytes)], { type }), ref.name);
    }
    res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey()}` },
      body: form,
      signal: AbortSignal.timeout(6 * 60_000),
    });
  } else {
    res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...common, n: 1 }),
      signal: AbortSignal.timeout(6 * 60_000),
    });
  }
  const body = (await res.json().catch(() => ({}))) as {
    data?: { b64_json?: string }[];
    usage?: Usage;
    error?: { message?: string; code?: string; type?: string };
  };
  if (!res.ok || !body.data?.[0]?.b64_json) {
    // Le message d'erreur d'OpenAI ne contient jamais la clé ; on le tronque par précaution.
    const msg = (body.error?.message ?? `HTTP ${res.status}`).slice(0, 300);
    throw new OpenAIError(msg, res.status, body.error?.code ?? body.error?.type);
  }
  return { bytes: Buffer.from(body.data[0].b64_json, "base64"), usage: body.usage ?? {}, ms: Date.now() - started };
}

export function readRef(file: string): { name: string; bytes: Buffer } {
  return { name: path.basename(file), bytes: fs.readFileSync(file) };
}
