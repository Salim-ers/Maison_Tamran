import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { sessionSecret, siteUrl } from "./env";

/** Jeton d'accès public au récapitulatif PDF d'un devis : HMAC de l'identifiant, jamais stocké. */
export function quoteToken(quoteId: string) {
  return createHmac("sha256", sessionSecret()).update(`quote:${quoteId}`).digest("base64url").slice(0, 32);
}

export function verifyQuoteToken(quoteId: string, token: string | null | undefined) {
  if (!token) return false;
  const a = Buffer.from(quoteToken(quoteId));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function quotePdfUrl(reference: string, quoteId: string) {
  return `${siteUrl()}/api/devis/${encodeURIComponent(reference)}/pdf?t=${encodeURIComponent(quoteToken(quoteId))}`;
}

/** Signature d'une URL de logo téléversé, pour qu'une demande de devis ne référence que nos propres fichiers. */
export function logoSignature(url: string) {
  return createHmac("sha256", sessionSecret()).update(`logo:${url}`).digest("base64url").slice(0, 32);
}

export function verifyLogoSignature(url: string, sig: string) {
  const a = Buffer.from(logoSignature(url));
  const b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}
