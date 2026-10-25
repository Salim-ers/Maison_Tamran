import Link from "next/link";
import { PageIntro, Prose, Provisional } from "@/components/layout/page-intro";

export const isPlaceholder = (v: string | undefined | null) => !v || /^\s*\[.*\]\s*$/.test(v);

/** Valeur issue des réglages légaux : les valeurs non renseignées (entre crochets) restent visibles et signalées. */
export function LegalValue({ value, fallback }: { value?: string | null; fallback: string }) {
  if (isPlaceholder(value)) {
    return <mark className="bg-bronze/15 px-1 text-ink">{value?.trim() || `[${fallback} à compléter]`}</mark>;
  }
  return <>{value}</>;
}

const LEGAL_LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgv", label: "Conditions générales de vente" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cookies", label: "Cookies" },
];

/** Gabarit des pages légales : en-tête, bandeau « à faire valider », sommaire, contenu. */
export function LegalPage({ title, href, intro, toc, children }: { title: string; href: string; intro: React.ReactNode; toc: { id: string; label: string }[]; children: React.ReactNode }) {
  return (
    <>
      <PageIntro title={title} crumbs={[{ href, label: title }]} intro={intro}>
        <Provisional className="mt-10 max-w-[64ch]">
          <strong className="font-semibold text-ink">À faire valider par un professionnel du droit.</strong> Ce document est une base de travail : les informations entre crochets sont à compléter dans le back-office (Réglages), et l&apos;ensemble doit être relu avant l&apos;ouverture de la boutique à la vente.
        </Provisional>
      </PageIntro>
      <div className="container-luxe grid gap-14 pb-[var(--section)] lg:grid-cols-12">
        <nav aria-label="Sommaire" className="min-w-0 lg:col-span-3">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+var(--banner-h)+2rem)]">
            <p className="t-small font-semibold">Sommaire</p>
            <ol className="mt-4 space-y-2 t-small text-ink-soft">
              {toc.map((t) => (
                <li key={t.id}><a href={`#${t.id}`} className="hover:text-ink">{t.label}</a></li>
              ))}
            </ol>
            <p className="mt-10 t-small font-semibold">Voir aussi</p>
            <ul className="mt-4 space-y-2 t-small text-ink-soft">
              {LEGAL_LINKS.filter((l) => l.href !== href).map((l) => (
                <li key={l.href}><Link href={l.href} className="hover:text-ink">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </nav>
        <Prose className="min-w-0 lg:col-span-8 lg:col-start-5 [&_h2]:scroll-mt-28 [&_h2:first-child]:mt-0">{children}</Prose>
      </div>
    </>
  );
}
