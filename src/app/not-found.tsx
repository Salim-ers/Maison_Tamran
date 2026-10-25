import type { Metadata } from "next";
import Link from "next/link";
import { Logotype, Monogram } from "@/components/brand";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="on-dark grain relative isolate flex min-h-dvh flex-col overflow-hidden">
      <Monogram className="pointer-events-none absolute -right-[12vw] top-1/2 -z-10 h-[150vh] w-auto -translate-y-1/2 text-chocolate-2 max-md:-right-[40vw] max-md:opacity-70" title={null} />
      <header className="container-luxe flex h-[var(--header-h)] items-center">
        <Link href="/" aria-label="TAMBRÉ, accueil" className="flex items-center gap-3">
          <Monogram className="h-8 w-auto text-ivory" title={null} />
          <Logotype className="h-[1.05rem] w-auto" title={null} />
        </Link>
      </header>
      <div className="container-luxe flex flex-1 flex-col justify-center py-16">
        <p className="t-numeral text-[clamp(4rem,10vw,8rem)] leading-none text-bronze-light" aria-hidden>404</p>
        <h1 className="mt-6 t-display-l max-w-[14ch]">Cette page reste introuvable</h1>
        <p className="mt-8 max-w-[44ch] t-lead text-taupe">
          L&apos;adresse a peut-être changé, ou la page n&apos;existe plus. Les créations, elles, vous attendent toujours.
        </p>
        <nav aria-label="Liens utiles" className="mt-12 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-light">Retour à l&apos;accueil</Link>
          <Link href="/creations" className="btn btn-outline-light">Voir les créations</Link>
          <Link href="/contact" className="btn btn-outline-light">Nous écrire</Link>
        </nav>
      </div>
      <footer className="container-luxe py-8 font-display text-lg italic text-taupe">La datte, réinventée en haute gourmandise.</footer>
    </main>
  );
}
