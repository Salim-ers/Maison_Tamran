"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const COOKIE = "tb_consent";
const VID = "tb_vid";
const MAX_AGE = 60 * 60 * 24 * 180; // 6 mois

export interface Consent {
  analytics: boolean;
  date: string;
  v: 1;
}

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )tb_consent=([^;]*)/);
  if (!m) return null;
  try {
    return JSON.parse(decodeURIComponent(m[1])) as Consent;
  } catch {
    return null;
  }
}

function writeConsent(analytics: boolean) {
  const c: Consent = { analytics, date: new Date().toISOString(), v: 1 };
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(c))}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`;
  if (analytics) {
    if (!document.cookie.includes(`${VID}=`)) {
      const id = crypto.getRandomValues(new Uint8Array(12)).reduce((s, b) => s + b.toString(16).padStart(2, "0"), "");
      document.cookie = `${VID}=${id}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`;
    }
  } else {
    document.cookie = `${VID}=; Path=/; Max-Age=0`;
  }
  window.dispatchEvent(new CustomEvent("tb:consent", { detail: c }));
}

/** Mesure d'audience interne : une page vue par navigation, uniquement après consentement. */
export function PageViewTracker() {
  const path = usePathname();
  useEffect(() => {
    if (!readConsent()?.analytics) return;
    void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "page_view", path }), keepalive: true }).catch(() => {});
  }, [path]);
  return null;
}

export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const c = readConsent();
    if (!c) setOpen(true);
    else setAnalytics(c.analytics);
    const reopen = () => {
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener("tb:open-consent", reopen);
    return () => window.removeEventListener("tb:open-consent", reopen);
  }, []);

  const save = (a: boolean) => {
    writeConsent(a);
    setAnalytics(a);
    setOpen(false);
    setDetails(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          role="dialog"
          aria-modal="false"
          aria-labelledby="consent-title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.5, ease: [0.22, 0.8, 0.12, 1] }}
          className="fixed bottom-4 left-4 right-4 z-[90] max-w-[34rem] bg-cream p-6 text-ink shadow-[0_20px_60px_rgba(37,28,26,.22)] sm:left-6 sm:bottom-6"
        >
          <h2 id="consent-title" className="t-title">Vos préférences de cookies</h2>
          <p className="mt-3 t-small text-ink-soft">
            Nous utilisons des cookies indispensables au panier, à la connexion et au paiement. Avec votre accord, nous mesurons aussi l&apos;audience du site de façon interne et anonymisée, sans publicité ni partage avec des tiers.{" "}
            <Link href="/cookies" className="link-draw text-ink">En savoir plus</Link>
          </p>
          {details && (
            <fieldset className="mt-5 space-y-3 border-t hairline pt-4 t-small">
              <legend className="sr-only">Catégories de cookies</legend>
              <label className="flex items-start gap-3">
                <input type="checkbox" checked disabled className="mt-1 accent-[var(--color-chocolate)]" />
                <span><strong className="font-semibold">Indispensables</strong> : panier, session, sécurité du paiement, mémorisation de ce choix. Toujours actifs.</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1 accent-[var(--color-chocolate)]" />
                <span><strong className="font-semibold">Mesure d&apos;audience</strong> : pages vues et étapes d&apos;achat, pour améliorer le site. Conservée 13 mois au plus.</span>
              </label>
            </fieldset>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            {details ? (
              <button className="btn btn-primary" onClick={() => save(analytics)}>Enregistrer mes choix</button>
            ) : (
              <>
                <button className="btn btn-primary" onClick={() => save(true)}>Tout accepter</button>
                <button className="btn btn-outline" onClick={() => save(false)}>Tout refuser</button>
                <button className="btn px-2 link-draw [background-size:0_1px] hover:[background-size:100%_1px]" onClick={() => setDetails(true)}>Personnaliser</button>
              </>
            )}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
