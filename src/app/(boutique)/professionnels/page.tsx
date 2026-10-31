import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/catalog";
import { getActivePriceTiers } from "@/lib/public-data";
import { Breadcrumbs } from "@/components/layout/page-intro";
import { concept, Media } from "@/components/ui/media";
import { ambiance } from "@/lib/ambiance";
import { PageHero } from "@/components/layout/page-hero";
import { photo } from "@/lib/photos";
import { proOffre, proOuverture, proRevendeurs } from "@/content/registry/professionnels";

export const metadata: Metadata = {
  title: "Professionnels",
  description: "Coffrets MAISON TAMRĀN personnalisés pour les entreprises, mariages et événements, hôtels, coffee shops et épiceries fines. Demandez un devis.",
  alternates: { canonical: "/professionnels" },
};

const AUDIENCES = [
  { title: "Entreprises", text: "Cadeaux clients et collaborateurs, fin d'année, séminaires.", href: "/professionnels/cadeaux-entreprise" },
  { title: "Mariages et réceptions", text: "Cadeaux d'invités, table des desserts, souvenirs.", href: "/professionnels/mariages-evenements" },
  { title: "Organisateurs d'événements", text: "Lancements, cocktails, soirées privées.", href: "/professionnels/mariages-evenements" },
  { title: "Traiteurs", text: "Une mignardise à intégrer à vos propositions.", href: "/professionnels/devis?segment=traiteur" },
  { title: "Hôtels", text: "Attention d'accueil en chambre, service du café.", href: "/professionnels/devis?segment=hotel" },
  { title: "Coffee shops et salons de thé", text: "Une pièce d'exception à servir avec la boisson.", href: "#revendeurs" },
  { title: "Boutiques cadeaux", text: "Des coffrets prêts à offrir pour votre clientèle.", href: "#revendeurs" },
  { title: "Épiceries fines", text: "Une création française singulière en rayon.", href: "#revendeurs" },
];

export default async function ProfessionnelsPage() {
  const [o, offre, rev, tiers] = await Promise.all([
    getContent(proOuverture.key, proOuverture.defaults),
    getContent(proOffre.key, proOffre.defaults),
    getContent(proRevendeurs.key, proRevendeurs.defaults),
    getActivePriceTiers(),
  ]);
  const offers = [
    [offre.coffretsTitle, offre.coffretsBody],
    [offre.cartesTitle, offre.cartesBody],
    [offre.rubansTitle, offre.rubansBody],
    [offre.formatsTitle, offre.formatsBody],
  ];
  const cover = photo("coffret-entreprise");
  const coverMobile = photo("coffrets-ruban-v");
  const steps = [
    ["Votre demande", "Vous décrivez le projet dans le formulaire de devis : occasion, quantités, personnalisation, date et lieu de livraison."],
    ["L'échange", "Nous revenons vers vous pour préciser ce qui doit l'être : sélection des créations, formats, contraintes de livraison."],
    ["La proposition", "Vous recevez une proposition chiffrée, hors taxes, avec sa durée de validité."],
    ["La validation", "Vous validez la proposition et les éléments de personnalisation (fichier du logo, texte de la carte)."],
    ["La fabrication", "Les créations sont réalisées et mises en coffret selon le calendrier convenu ensemble."],
    ["La livraison", "Livraison groupée à une adresse, ou envois individuels à vos destinataires, selon la proposition."],
  ];

  return (
    <>
      {/* Ouverture plein cadre : les coffrets préparés pour un client (empilés sur mobile) */}
      {cover ? (
        <PageHero
          title={o.title}
          intro={<p>{o.lead}</p>}
          crumbs={[{ href: "/professionnels", label: "Professionnels" }]}
          image={cover}
          mobile={coverMobile}
        >
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/professionnels/devis" className="btn btn-gold">{o.cta}</Link>
            <a href="#collaboration" className="btn btn-outline-light">Comment nous travaillons</a>
          </div>
        </PageHero>
      ) : (
      <section className="on-dark grain relative isolate overflow-hidden" aria-labelledby="pro-title">
        <div className="container-luxe grid gap-12 pb-[clamp(4rem,9vw,8rem)] pt-[calc(var(--header-h)+var(--banner-h)+clamp(2.5rem,6vw,5rem))] lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <Breadcrumbs items={[{ href: "/professionnels", label: "Professionnels" }]} tone="dark" />
            <h1 id="pro-title" className="mt-8 t-display-l max-w-[14ch]">{o.title}</h1>
            <p className="mt-8 max-w-[46ch] t-lead text-taupe">{o.lead}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/professionnels/devis" className="btn btn-light">{o.cta}</Link>
              <a href="#collaboration" className="btn btn-outline-light">Comment nous travaillons</a>
            </div>
          </div>
          <div className="relative lg:col-span-6 lg:col-start-7 lg:mt-12">
            <div className="relative aspect-[3/2] overflow-hidden">
              <Media image={concept("coffret-1")} fill preload sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" wrapperClassName="absolute inset-0" badge="dark" />
            </div>
            <div className="absolute -bottom-10 -left-8 hidden aspect-[4/5] w-[32%] overflow-hidden border-8 border-chocolate lg:block">
              <Media image={ambiance("cafe-oriental")} fill sizes="16vw" className="object-cover" wrapperClassName="absolute inset-0" badge={false} />
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Pour qui */}
      <section className="section-pad" aria-labelledby="cibles-title">
        <div className="container-luxe grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="cibles-title" className="t-display-m max-w-[12ch]">Pour qui nous créons</h2>
            <p className="mt-6 max-w-[36ch] text-ink-soft">Chaque projet est étudié individuellement. Voici les maisons et les occasions pour lesquelles nos créations ont été pensées.</p>
          </div>
          <ul className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
            {AUDIENCES.map((a) => (
              <li key={a.title} className="border-t hairline">
                <Link href={a.href} className="group block py-6">
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="t-title transition-colors group-hover:text-bronze">{a.title}</span>
                  </span>
                  <span className="mt-2 block t-small text-ink-soft">{a.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* L'offre */}
      <section className="bg-cream section-pad" aria-labelledby="offre-title">
        <div className="container-luxe">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <h2 id="offre-title" className="t-display-l lg:col-span-7">{offre.title}</h2>
            <p className="max-w-[40ch] text-ink-soft lg:col-span-4 lg:col-start-9">Toutes les personnalisations sont précisées et chiffrées dans la proposition : rien n&apos;est engagé avant votre validation.</p>
          </div>
          <div className="mt-16 grid gap-12 lg:grid-cols-12">
            <div className="relative lg:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden lg:sticky lg:top-[calc(var(--header-h)+var(--banner-h)+2rem)]">
                <Media image={concept("pro-2")} fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" wrapperClassName="absolute inset-0" />
              </div>
            </div>
            <dl className="grid content-start gap-x-10 gap-y-12 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
              {offers.map(([t, b], i) => (
                <div key={t} className={i % 2 === 1 ? "sm:mt-16" : ""}>
                  <dt className="t-title">{t}</dt>
                  <dd className="mt-4 text-ink-soft">{b}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Déroulé */}
      <section id="collaboration" className="section-pad scroll-mt-20" aria-labelledby="collab-title">
        <div className="container-luxe">
          <h2 id="collab-title" className="t-display-l max-w-[16ch]">Le déroulé d&apos;une collaboration</h2>
          <ol className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map(([t, b], i) => (
              <li key={t} className="border-t border-chocolate pt-6">
                <span className="t-numeral text-3xl text-bronze">{i + 1}</span>
                <h3 className="mt-3 t-title">{t}</h3>
                <p className="mt-3 t-small text-ink-soft">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tarifs dégressifs */}
      <section className="pb-[var(--section)]" aria-labelledby="tarifs-title">
        <div className="container-luxe grid gap-10 border-t hairline pt-[clamp(3rem,7vw,6rem)] lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="tarifs-title" className="t-display-m">Tarifs dégressifs</h2>
            <p className="mt-6 max-w-[40ch] text-ink-soft">Les prix sont établis selon les quantités, les créations choisies et la personnalisation.</p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            {tiers.length ? (
              <table className="w-full text-left">
                <caption className="sr-only">Remises selon la quantité commandée</caption>
                <thead>
                  <tr className="t-small text-ink-soft">
                    <th scope="col" className="pb-3 font-normal">Quantité</th>
                    <th scope="col" className="pb-3 text-right font-normal">Remise</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((t) => (
                    <tr key={t.id} className="border-t hairline">
                      <td className="py-5">{t.label || `À partir de ${t.minQuantity} coffrets`}</td>
                      <td className="py-5 text-right font-display text-2xl">−{t.discountPercent}&nbsp;%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="border-l-2 border-bronze pl-6 font-display text-[clamp(1.4rem,2vw,1.9rem)] leading-snug">Tarifs dégressifs communiqués avec la proposition.</p>
            )}
          </div>
        </div>
      </section>

      {/* Revendeurs */}
      <section id="revendeurs" className="on-dark scroll-mt-16 section-pad" aria-labelledby="revendeurs-title">
        <div className="container-luxe grid items-center gap-12 lg:grid-cols-12">
          <div className="relative aspect-[3/2] overflow-hidden lg:col-span-6">
            <Media image={ambiance("art-de-recevoir")} fill sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" wrapperClassName="absolute inset-0" badge="dark" />
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="inline-block border border-line-light px-3 py-1 t-small text-taupe">Fonctionnalité à venir</p>
            <h2 id="revendeurs-title" className="mt-6 t-display-m">{rev.title}</h2>
            <p className="mt-6 text-taupe">{rev.body}</p>
            <Link href="/professionnels/devis?segment=epicerie-fine" className="btn btn-light mt-10">Présenter mon établissement</Link>
          </div>
        </div>
      </section>

      {/* Appel final */}
      <section className="section-pad" aria-labelledby="cta-title">
        <div className="container-luxe grid gap-10 lg:grid-cols-12 lg:items-end">
          <h2 id="cta-title" className="t-display-l lg:col-span-7">Parlons de votre projet</h2>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-ink-soft">Quelques minutes suffisent pour décrire votre besoin. Nous revenons vers vous par email avec une proposition.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/professionnels/devis" className="btn btn-primary">Demander un devis</Link>
              <Link href="/contact" className="btn btn-outline">Nous écrire</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
