import "server-only";

/**
 * Mode de la boutique.
 * - "demo" : aucun paiement réel. Les commandes sont marquées isDemo et ne sont jamais expédiées.
 *            Activé automatiquement si STRIPE_SECRET_KEY est absente.
 * - "live" : Stripe Checkout réel (clé test ou production selon la clé fournie).
 */
export function storeMode(): "demo" | "live" {
  if (!process.env.STRIPE_SECRET_KEY) return "demo";
  return process.env.STORE_MODE === "demo" ? "demo" : "live";
}

export function stripeKeyKind(): "test" | "live" | null {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k) return null;
  return k.startsWith("sk_live_") || k.startsWith("rk_live_") ? "live" : "test";
}

export function siteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
  return raw.replace(/\/$/, "");
}

export function emailProvider(): "resend" | "log" {
  return process.env.RESEND_API_KEY ? "resend" : "log";
}

export function sessionSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET (32 caractères minimum) est requis en production.");
    return "dev-only-secret-change-me-dev-only-secret-change-me";
  }
  return s;
}
