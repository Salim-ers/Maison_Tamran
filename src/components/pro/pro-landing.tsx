import Link from "@/components/motion/transition-link";
import { PageIntro } from "@/components/layout/page-intro";
import { Media } from "@/components/ui/media";
import { visual } from "@/lib/visual";
import { PageHero } from "@/components/layout/page-hero";
import { photo } from "@/lib/photos";

export interface ProLandingProps {
  title: string;
  lead: string;
  crumbLabel: string;
  href: string;
  segment: string;
  ctaLabel: string;
  /** Une ligne par usage : « Titre : description ». */
  usages: string;
  heroImage: string;
  /** version verticale de l'ouverture, pour les écrans portrait */
  heroMobile?: string;
  sideImage: string;
  formats: { name: string; text: string }[];
  personalization: { name: string; text: string }[];
  organisation: { name: string; text: string }[];
}

function parseUsages(raw: string) {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(":");
      return i > 0 ? { name: l.slice(0, i).trim(), text: l.slice(i + 1).trim() } : { name: l, text: "" };
    });
}

/** Gabarit éditorial des pages professionnelles dédiées (cadeaux d'entreprise, mariages). */
export function ProLanding(p: ProLandingProps) {
  const usages = parseUsages(p.usages);
  const devis = `/professionnels/devis?segment=${p.segment}`;
  const crumbs = [{ href: "/professionnels", label: "Professionnels" }, { href: p.href, label: p.crumbLabel }];
  // visuel généré de la maison : ouverture plein cadre ; sinon, l'en-tête éditorial et la photo d'ambiance
  const cover = photo(p.heroImage);
  return (
    <>
      {cover ? (
        <PageHero title={p.title} intro={<p>{p.lead}</p>} crumbs={crumbs} image={cover} mobile={p.heroMobile ? photo(p.heroMobile) : null}>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={devis} className="btn btn-gold">{p.ctaLabel}</Link>
            <a href="#formats" className="btn btn-outline-light">Formats et personnalisation</a>
          </div>
        </PageHero>
      ) : (
        <>
          <PageIntro title={p.title} crumbs={crumbs} intro={<p>{p.lead}</p>}>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={devis} className="btn btn-primary">{p.ctaLabel}</Link>
              <a href="#formats" className="btn btn-outline">Formats et personnalisation</a>
            </div>
          </PageIntro>
          <div className="container-luxe">
            <div className="relative aspect-[16/9] overflow-hidden max-sm:aspect-[4/3]">
              <Media image={visual(p.heroImage)} fill preload sizes="100vw" className="object-cover" wrapperClassName="absolute inset-0" />
            </div>
          </div>
        </>
      )}

      {/* Usages */}
      <section className="section-pad" aria-labelledby="usages-title">
        <div className="container-luxe grid gap-12 lg:grid-cols-12">
          <h2 id="usages-title" className="t-display-m lg:col-span-4">Les occasions</h2>
          <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:col-span-8">
            {usages.map((u) => (
              <div key={u.name} className="border-t hairline pt-6">
                <dt className="t-title">{u.name}</dt>
                {u.text && <dd className="mt-3 text-ink-soft">{u.text}</dd>}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Formats & personnalisation */}
      <section id="formats" className="bg-cream section-pad scroll-mt-20" aria-labelledby="formats-title">
        <div className="container-luxe grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Media image={visual(p.sideImage)} fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" wrapperClassName="absolute inset-0" />
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <h2 id="formats-title" className="t-display-m">Les formats</h2>
            <dl className="mt-8">
              {p.formats.map((f) => (
                <div key={f.name} className="grid gap-2 border-t hairline py-5 sm:grid-cols-[12rem_1fr] sm:gap-8">
                  <dt className="font-display text-xl">{f.name}</dt>
                  <dd className="t-small text-ink-soft">{f.text}</dd>
                </div>
              ))}
            </dl>
            <h2 className="mt-16 t-display-m">La personnalisation</h2>
            <ul className="mt-8 space-y-6">
              {p.personalization.map((f) => (
                <li key={f.name}>
                  <p className="font-semibold">{f.name}</p>
                  <p className="mt-1 t-small text-ink-soft">{f.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Organisation */}
      <section className="section-pad" aria-labelledby="orga-title">
        <div className="container-luxe">
          <h2 id="orga-title" className="t-display-m max-w-[18ch]">L&apos;organisation</h2>
          <ol className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {p.organisation.map((s, i) => (
              <li key={s.name} className="border-t border-chocolate pt-6">
                <span className="t-numeral text-2xl text-bronze">{i + 1}</span>
                <h3 className="mt-2 t-title">{s.name}</h3>
                <p className="mt-3 t-small text-ink-soft">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="on-dark section-pad" aria-labelledby="devis-cta">
        <div className="container-luxe grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2 id="devis-cta" className="t-display-l lg:col-span-7">Décrivez-nous votre projet</h2>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-taupe">Le formulaire est prérempli pour ce type de projet. Une proposition chiffrée vous est adressée par email après étude.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={devis} className="btn btn-light">{p.ctaLabel}</Link>
              <Link href="/professionnels" className="btn btn-outline-light">L&apos;offre professionnelle</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
