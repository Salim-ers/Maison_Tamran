import "server-only";
import { cookies } from "next/headers";
import { db, schema } from "@/db";
import { sha256 } from "./auth";

export const CONSENT_COOKIE = "tb_consent";
export const VISITOR_COOKIE = "tb_vid";

/** Mesure d'audience interne : enregistrée uniquement si le visiteur a accepté la mesure d'audience. */
export async function hasAnalyticsConsent() {
  const jar = await cookies();
  const raw = jar.get(CONSENT_COOKIE)?.value;
  if (!raw) return false;
  try {
    return Boolean((JSON.parse(decodeURIComponent(raw)) as { analytics?: boolean }).analytics);
  } catch {
    return false;
  }
}

export async function trackServer(name: "page_view" | "add_to_cart" | "begin_checkout" | "purchase", path?: string) {
  try {
    if (!(await hasAnalyticsConsent())) return;
    const jar = await cookies();
    const vid = jar.get(VISITOR_COOKIE)?.value;
    await db.insert(schema.analyticsEvents).values({ name, path: path?.slice(0, 200) ?? null, sessionHash: vid ? sha256(vid).slice(0, 24) : null });
  } catch {
    // la mesure d'audience ne doit jamais casser un parcours d'achat
  }
}
