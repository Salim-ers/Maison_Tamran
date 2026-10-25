import "server-only";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/components/admin/types";

/** Résultat positif d'une action d'administration. */
export const done = (message: string): ActionState => ({ ok: true, message, at: Date.now() });

/** Résultat négatif : message général et, éventuellement, erreurs par champ. */
export const fail = (error: string, fieldErrors?: Record<string, string>): ActionState => ({ ok: false, error, fieldErrors, at: Date.now() });

/** Convertit une erreur Zod en erreurs par champ (clé = premier segment du chemin). */
export function zodFail(error: z.ZodError, general = "Certains champs sont à corriger."): ActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  const first = error.issues[0];
  const generalMsg = error.issues.length === 1 && first && !first.path.length ? first.message : general;
  return fail(generalMsg, fieldErrors);
}

function pgCode(e: unknown): string | undefined {
  let cur: unknown = e;
  for (let i = 0; i < 4 && cur && typeof cur === "object"; i++) {
    const c = cur as { code?: unknown; cause?: unknown };
    if (typeof c.code === "string" && /^\d{5}$|^[0-9A-Z]{5}$/.test(c.code)) return c.code;
    cur = c.cause;
  }
  return undefined;
}

/**
 * Exécute le corps d'une action et traduit les erreurs techniques en messages lisibles.
 * Les redirections et autres signaux Next.js sont relancés tels quels.
 */
export async function run(fn: () => Promise<ActionState>, opts: { unique?: string } = {}): Promise<ActionState> {
  try {
    return await fn();
  } catch (e) {
    unstable_rethrow(e);
    const code = pgCode(e);
    if (code === "23505") return fail(opts.unique ?? "Cette valeur est déjà utilisée par un autre élément. Choisissez-en une autre.");
    if (code === "23503") return fail("Cet élément est encore utilisé ailleurs : il ne peut pas être supprimé.");
    if (e instanceof UserError) return fail(e.message);
    console.error("[admin] action en échec", e);
    return fail("L'enregistrement a échoué à cause d'une erreur technique. Réessayez ; si le problème persiste, consultez les journaux du serveur.");
  }
}

/** Erreur destinée à être affichée telle quelle à l'administrateur. */
export class UserError extends Error {}

// ---------------------------------------------------------------------------
// Lecture du FormData
// ---------------------------------------------------------------------------
/** Valeurs simples du formulaire (la dernière valeur l'emporte, les fichiers sont ignorés). */
export function formObject(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") out[k] = v;
  return out;
}

export function formList(form: FormData, name: string): string[] {
  return form.getAll(name).filter((v): v is string => typeof v === "string");
}

/** Liste « a, b ; c » → ["a", "b", "c"] (sans doublons ni vides). */
export function splitList(raw: string | undefined | null, sep = /[,;\n]/): string[] {
  if (!raw) return [];
  return [...new Set(raw.split(sep).map((s) => s.trim()).filter(Boolean))];
}

// ---------------------------------------------------------------------------
// Schémas Zod réutilisables
// ---------------------------------------------------------------------------
const trimmed = z.string().transform((s) => s.trim());

export const zText = (max = 200, label = "Ce champ") =>
  trimmed.pipe(z.string().min(1, `${label} est obligatoire.`).max(max, `${label} ne doit pas dépasser ${max} caractères.`));

/** Texte facultatif : chaîne vide → null. */
export const zOptText = (max = 2000) =>
  z
    .string()
    .optional()
    .transform((s) => (s ?? "").trim())
    .pipe(z.string().max(max, `${max} caractères au maximum.`))
    .transform((s) => (s ? s : null));

/** Texte facultatif conservé en chaîne vide (colonnes NOT NULL DEFAULT ''). */
export const zLongText = (max = 10000) =>
  z
    .string()
    .optional()
    .transform((s) => (s ?? "").trim())
    .pipe(z.string().max(max, `${max} caractères au maximum.`));

export const zSlug = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .pipe(z.string().min(2, "Le slug est obligatoire (2 caractères au moins).").max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Le slug ne peut contenir que des lettres minuscules sans accent, des chiffres et des tirets (ex. eclipse-noire)."));

export const zCheckbox = z
  .string()
  .optional()
  .transform((v) => v === "on" || v === "true" || v === "1");

function parseEurosStrict(raw: string) {
  const v = raw.replace(/[\s €]/g, "").replace(",", ".");
  if (!/^-?\d+(\.\d{1,2})?$/.test(v)) return null;
  return Math.round(parseFloat(v) * 100);
}

/** Montant en euros obligatoire → centimes (≥ 0). */
export const zEuros = (label = "Le montant") =>
  z
    .string()
    .optional()
    .transform((s, ctx) => {
      const raw = (s ?? "").trim();
      if (!raw) {
        ctx.addIssue({ code: "custom", message: `${label} est obligatoire.` });
        return z.NEVER;
      }
      const c = parseEurosStrict(raw);
      if (c == null || c < 0) {
        ctx.addIssue({ code: "custom", message: `${label} doit être un montant positif en euros, par exemple 12,50.` });
        return z.NEVER;
      }
      if (c > 10_000_000) {
        ctx.addIssue({ code: "custom", message: `${label} semble trop élevé.` });
        return z.NEVER;
      }
      return c;
    });

/** Montant en euros facultatif → centimes ou null. */
export const zOptEuros = (label = "Le montant") =>
  z
    .string()
    .optional()
    .transform((s, ctx) => {
      const raw = (s ?? "").trim();
      if (!raw) return null;
      const c = parseEurosStrict(raw);
      if (c == null || c < 0) {
        ctx.addIssue({ code: "custom", message: `${label} doit être un montant positif en euros, par exemple 12,50.` });
        return z.NEVER;
      }
      return c;
    });

/** Entier obligatoire. */
export const zInt = (label = "La valeur", min = 0, max = 1_000_000) =>
  z
    .string()
    .optional()
    .transform((s, ctx) => {
      const raw = (s ?? "").trim();
      if (!/^-?\d+$/.test(raw)) {
        ctx.addIssue({ code: "custom", message: `${label} doit être un nombre entier.` });
        return z.NEVER;
      }
      const n = Number(raw);
      if (n < min || n > max) {
        ctx.addIssue({ code: "custom", message: `${label} doit être compris entre ${min} et ${max}.` });
        return z.NEVER;
      }
      return n;
    });

/** Entier facultatif → nombre ou null. */
export const zOptInt = (label = "La valeur", min = 0, max = 1_000_000) =>
  z
    .string()
    .optional()
    .transform((s, ctx) => {
      const raw = (s ?? "").trim();
      if (!raw) return null;
      if (!/^-?\d+$/.test(raw)) {
        ctx.addIssue({ code: "custom", message: `${label} doit être un nombre entier.` });
        return z.NEVER;
      }
      const n = Number(raw);
      if (n < min || n > max) {
        ctx.addIssue({ code: "custom", message: `${label} doit être compris entre ${min} et ${max}.` });
        return z.NEVER;
      }
      return n;
    });

/** Convertit une date AAAA-MM-JJ (heure de Paris) en instant UTC. */
export function parisDate(ymd: string, endOfDay = false) {
  const [y, m, d] = ymd.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(guess));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return new Date(guess - (asUtc - guess));
}

/** Date facultative (champ <input type="date">) → Date ou null. */
export const zOptDate = (endOfDay = false) =>
  z
    .string()
    .optional()
    .transform((s, ctx) => {
      const raw = (s ?? "").trim();
      if (!raw) return null;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || Number.isNaN(Date.parse(raw))) {
        ctx.addIssue({ code: "custom", message: "Date invalide (format attendu : JJ/MM/AAAA)." });
        return z.NEVER;
      }
      return parisDate(raw, endOfDay);
    });

export const zId = z.uuid({ message: "Identifiant invalide." });

/** Le second clic des boutons à confirmation envoie confirmed=1. */
export function assertConfirmed(form: FormData) {
  if (form.get("confirmed") !== "1") {
    throw new UserError("Confirmez l'opération avant de continuer.");
  }
}

/** URL d'image acceptée : chemin local du site ou stockage Vercel Blob (seuls domaines autorisés par next/image). */
export const zImageUrl = z
  .string()
  .transform((s) => s.trim())
  .pipe(
    z
      .string()
      .min(1, "L'adresse de l'image est obligatoire.")
      .max(500)
      .refine(
        (u) => (/^\/[^/\\]/.test(u) && !u.includes("..")) || /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(u),
        "Adresse refusée : utilisez un chemin du site (/images/…, /uploads/…) ou une URL Vercel Blob (https://….public.blob.vercel-storage.com/…)."
      )
  );
