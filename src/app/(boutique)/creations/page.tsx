import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { ambiance } from "@/lib/ambiance";
import Link from "next/link";
import { getBoxes, getCatalog } from "@/lib/catalog";
import { boxPhotos, catalogLabels, toBrowsable, toSwatch } from "@/lib/present";
import { photo } from "@/lib/photos";
import { BoxPreview } from "@/components/configurator/box-preview";
import { concept, ConceptBadge } from "@/components/ui/media";
import { CatalogBrowser } from "@/components/product/catalog-browser";
import { CreationsHero } from "@/components/catalog/creations-hero";
import { FadeIn, RevealImage, RevealLines } from "@/components/motion/reveal";
import { FormatDiagram } from "@/components/home/gift-showcase";
import { euros } from "@/lib/money";

export const metadata: Metadata = {
  title: "Nos créations : dattes Medjool fourrées et enrobées de chocolat",
  description:
    "Les dattes gastronomiques MAISON TAMRĀN : six créations Signature et quatre éditions éphémères, des dattes Medjool fourrées et enrobées de chocolat. Filtrez par saveur, chocolat ou allergène.",
  alternates: { canonical: "/creations" },
};

export default async function CreationsPage() {
  const [{ products, collections }, boxes] = await Promise.all([getCatalog(), getBoxes()]);
  const byCollection = (slug: string) => products.filter((p) => p.collectionSlug === slug);
  const main = (p: (typeof products)[number]) => p.images.find((i) => i.role === "main") ?? p.images[0] ?? null;
  const cut = (p: (typeof products)[number]) => (p.images.find((i) => i.role === "cut") ?? p.images[0])?.url;
  // le coffret 12 pièces photographié, garni des créations de la maison
  const swatches = products.map(toSwatch);
  const box12 = boxPhotos()[12];
  const signatureBox = boxes.find((b) => b.kind === "signature");
  const editorial = concept("produit-cafe-imperial");

  return (
    <>
      <CreationsHero
        title="Nos créations"
        subtitle="Une collection de gourmandises singulières, pensées comme autant de rencontres entre textures et saveurs."
        crumbs={[{ href: "/creations", label: "Créations" }]}
        items={products.map((p) => ({ slug: p.slug, name: p.name, pairing: p.pairing, image: main(p) }))}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#catalogue" className="btn btn-gold">Explorer et filtrer</a>
          <Link href="/composer-mon-coffret" className="btn btn-outline-light">Composer un coffret</Link>
        </div>
      </CreationsHero>

      {/* Les univers de collection */}
      <section className="section-pad bg-ivory" aria-labelledby="univers-title">
        <div className="container-luxe">
          <p className="t-eyebrow text-bronze">Deux univers</p>
          <h2 id="univers-title" className="mt-4 t-display-m max-w-[20ch]">Une collection permanente, des éditions de saison</h2>
          <div className="mt-14 grid gap-8 lg:grid-cols-12">
            {collections.map((c, idx) => {
              const list = byCollection(c.slug);
              const cover = list[0] ? main(list[0]) : null;
              const dark = c.slug === "ephemere";
              // grande image : une photographie d'ingrédient haute définition ; la création y est posée en tirage, à sa taille nette
              const gen = photo(dark ? "coffret-edition" : "rituel-cafe");
              const stage = gen ? { url: gen.url, alt: gen.alt, credit: gen.badge } : ambiance(dark ? "rose" : "pistache");
              return (
                <FadeIn key={c.slug} delay={idx * 0.12} className={idx === 0 ? "lg:col-span-7" : "lg:col-span-5 lg:mt-24"}>
                  <article className={`group relative overflow-hidden ${dark ? "on-dark" : "bg-creme"}`}>
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {stage && <Image src={stage.url} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" quality={75} className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-luxe)] group-hover:scale-[1.04]" />}
                      <span aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,transparent_40%,rgba(20,12,9,.35))]" />
                      {cover && (
                        <figure className="native-cap absolute bottom-[8%] right-[7%] max-w-[34%] -rotate-3 bg-cream p-[5px] shadow-[0_30px_50px_-20px_rgba(10,6,4,.85)] transition-transform duration-700 group-hover:-translate-y-1 group-hover:-rotate-1" style={{ ["--nat" as string]: cover.w ?? 412 }}>
                          <span className="relative block aspect-[412/495] overflow-hidden">
                            <Image src={cover.url} alt={cover.alt} fill sizes="220px" quality={85} className="object-cover" />
                          </span>
                        </figure>
                      )}
                      {cover?.concept && <ConceptBadge tone="dark" label={cover.badge} className="right-3 top-3" />}
                      {stage?.credit && <span className="absolute left-3 top-3 t-micro text-ivory/75 [text-shadow:0_1px_2px_rgba(0,0,0,.6)]">{stage.credit}</span>}
                      {/* les autres créations de la collection en vignettes */}
                      <ul className="absolute bottom-3 left-3 flex -space-x-3" aria-hidden>
                        {list.slice(1, 6).map((p) => (
                          <li key={p.slug} className="relative size-11 overflow-hidden rounded-full border-2 border-ivory/80 transition-transform duration-500 group-hover:translate-y-[-2px]">
                            {cut(p) && <Image src={cut(p)!} alt="" fill sizes="44px" quality={75} className="scale-125 object-cover" />}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-7 lg:p-9">
                      <p className={`t-micro uppercase tracking-[0.18em] ${dark ? "text-gold" : "text-bronze"}`}>{list.length} création{list.length > 1 ? "s" : ""}</p>
                      <h3 className="mt-2 t-display-m">
                        <Link href={`/collections/${c.slug}`} className="after:absolute after:inset-0">{c.name}</Link>
                      </h3>
                      <p className={`mt-3 max-w-[48ch] ${dark ? "text-taupe" : "text-ink-soft"}`}>{c.intro}</p>
                      <span className={`mt-6 inline-flex items-center gap-2 t-small ${dark ? "text-gold" : "text-bronze"}`}>
                        Découvrir la collection <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </article>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Catalogue filtrable */}
      <section id="catalogue" className="scroll-mt-24 bg-ivory pb-[var(--section)]" aria-labelledby="catalogue-title">
        <div className="container-luxe">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-t hairline pt-[clamp(3rem,6vw,5rem)]">
            <div>
              <p className="t-eyebrow text-bronze">Le catalogue</p>
              <h2 id="catalogue-title" className="mt-4 t-display-m">Toutes les créations</h2>
            </div>
            <p className="max-w-[46ch] t-small text-ink-soft">
              Dix accords, une seule matière : la datte Medjool, fourrée puis enrobée de chocolat. Les recettes sont en cours de développement et peuvent encore évoluer. Survolez une création pour lire son accord.
            </p>
          </div>
          <Suspense fallback={<div className="h-96" aria-busy />}>
            <CatalogBrowser products={products.map(toBrowsable)} labels={catalogLabels(collections)} />
          </Suspense>
        </div>
      </section>

      {/* Respiration éditoriale */}
      <section className="on-dark relative overflow-hidden section-pad" aria-labelledby="rencontre-title">
        <div className="container-luxe grid items-center gap-12 lg:grid-cols-12">
          <RevealImage className="aspect-[4/5] lg:col-span-5" from="left" parallax={6}>
            <Image src={editorial.url} alt={editorial.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" quality={85} className="object-cover" />
            {editorial.concept && <ConceptBadge tone="dark" label={editorial.badge} className="right-3 top-3" />}
          </RevealImage>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="t-eyebrow text-gold">Une bouchée, trois temps</p>
            <RevealLines id="rencontre-title" lines={["Le chocolat craque,", "le fruit fond,", "le cœur se révèle."]} className="mt-5 font-display text-[clamp(2.2rem,4.4vw,4.4rem)] leading-[1.02]" />
            <FadeIn delay={0.2}>
              <p className="mt-8 max-w-[44ch] text-taupe">
                Chaque création se déguste en une seule bouchée, pour que l&apos;enrobage, la chair de la Medjool et la garniture arrivent ensemble. Ici, Café Impérial : praliné noisette, espresso et cardamome verte.
              </p>
              <Link href="/creations/cafe-imperial" className="btn btn-outline-light mt-8">Découvrir Café Impérial</Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Coffrets */}
      <section className="section-pad bg-creme" aria-labelledby="coffrets-title">
        <div className="container-luxe grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="t-eyebrow text-bronze">À offrir</p>
            <h2 id="coffrets-title" className="mt-4 t-display-m max-w-[16ch]">Réunir ses créations dans un coffret</h2>
            <p className="mt-6 max-w-[46ch] text-ink-soft">
              Six, douze ou vingt-quatre pièces, composées selon vos préférences, avec un message pour la personne qui l&apos;ouvrira.
              {signatureBox?.priceCents != null && ` Coffret Signature 12 pièces : ${euros(signatureBox.priceCents)}.`}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/composer-mon-coffret" className="btn btn-primary">Composer mon coffret</Link>
              <Link href="/coffrets" className="btn btn-outline">Voir les coffrets</Link>
            </div>
          </div>
          <FadeIn>
            {box12 ? (
              <BoxPreview pieces={12} slots={Array.from({ length: 12 }, (_, i) => swatches[i % swatches.length].slug)} flavors={new Map(swatches.map((s) => [s.slug, s]))} photo={box12} className="mx-auto w-full max-w-xl" />
            ) : (
              <FormatDiagram pieces={12} thumbs={products.map(cut).filter((u): u is string => Boolean(u))} className="mx-auto w-full max-w-lg" />
            )}
            <p className="mt-6 text-center t-micro text-ink-soft">Le coffret 12 pièces, composé au choix · visuel conceptuel</p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
