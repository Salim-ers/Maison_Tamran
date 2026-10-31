"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function BoutiqueError({ error, retry, reset }: { error: unknown; retry?: () => void; reset?: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const digest = typeof error === "object" && error && "digest" in error ? String((error as { digest?: string }).digest ?? "") : "";
  return (
    <section className="container-luxe pb-[var(--section)] pt-[calc(var(--header-h)+clamp(2.5rem,6vw,5rem))]" aria-labelledby="error-title">
      <h1 id="error-title" className="t-display-l max-w-[16ch]">Cette page n&apos;a pas pu s&apos;afficher</h1>
      <p className="mt-6 max-w-[50ch] t-lead text-ink-soft">
        Un incident technique a interrompu le chargement. Réessayez dans un instant ; si le problème persiste, écrivez-nous en précisant la page concernée.
      </p>
      {digest && <p className="mt-4 t-small text-ink-soft">Référence de l&apos;incident : {digest}</p>}
      <div className="mt-10 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" onClick={() => (retry ?? reset)?.()}>Réessayer</button>
        <Link href="/" className="btn btn-outline">Retour à l&apos;accueil</Link>
        <Link href="/contact" className="btn btn-outline">Nous écrire</Link>
      </div>
    </section>
  );
}
