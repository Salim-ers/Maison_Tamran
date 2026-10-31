import type { Metadata } from "next";
import { Suspense } from "react";
import { TransitionLink } from "@/components/motion/transition-link";

import Link from "@/components/motion/transition-link";
import { notFound } from "next/navigation";
import { getCatalog, getProduct } from "@/lib/catalog";
import { siteUrl } from "@/lib/env";
import { euros } from "@/lib/money";
import { toCard, STATUS_PUBLIC } from "@/lib/present";
import { ALLERGEN_LABELS, CHOCOLATE_LABELS, FLAVOR_LABELS, RECIPES, type ChocolateKind, type Ingredient } from "@/data/recipes";
import Image from "next/image";
import { ambiance } from "@/lib/ambiance";
import { FadeIn } from "@/components/motion/reveal";
import { Breadcrumbs, Provisional } from "@/components/layout/page-intro";
import { ProductGallery, type StagePhoto } from "@/components/product/product-gallery";
import { ACCORDS, CREATION_STAGE, INGREDIENT_LABEL, INGREDIENT_PHOTO } from "@/lib/creation-visuals";
import { BuyBox } from "@/components/product/buy-box";
import { ProductCard } from "@/components/product/product-card";
import { JsonLd } from "@/components/seo/json-ld";

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.length ? products.map((p) => ({ slug: p.slug })) : [{ slug: "eclipse-noire" }];
}

export async function generateMetadata({ params }: PageProps<"/creations/[slug]">): Promise<Metadata> {
  "use cache";
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Création introuvable" };
  const img = p.images.find((i) => i.role === "main");
  return {
    title: p.seoTitle ?? `${p.name}, ${p.pairing.replace(/\.$/, "").toLowerCase()}`,
    description: p.seoDescription ?? `${p.tagline} ${p.story}`.slice(0, 160),
    alternates: { canonical: `/creations/${p.slug}` },
    openGraph: { title: p.name, description: p.tagline, images: img ? [{ url: img.url, width: img.w, height: img.h, alt: img.alt }] : undefined },
  };
}

function Detail({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="group border-b hairline" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 font-display text-xl [&::-webkit-details-marker]:hidden">
        {title}
        <span className="relative block size-3" aria-hidden>
          <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
          <span className="absolute inset-y-0 left-1/2 w-px bg-current transition-transform duration-500 group-open:rotate-90 group-open:scale-0" />
        </span>
      </summary>
      <div className="pb-6 t-small text-ink-soft">{children}</div>
    </details>
  );
}

const pending = <span className="italic">À confirmer</span>;


function ProductSkeleton() {
  return (
    <div className="container-luxe grid gap-12 pb-[var(--section)] pt-[calc(var(--header-h)+4rem)] lg:grid-cols-[1.05fr_1fr]" aria-busy>
      <div className="aspect-[4/5] animate-pulse bg-taupe/25" />
      <div className="space-y-4 pt-6"><div className="h-14 w-2/3 bg-taupe/25" /><div className="h-6 w-1/2 bg-taupe/20" /></div>
    </div>
  );
}

export default function ProductPage({ params }: PageProps<"/creations/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductView params={params} />
    </Suspense>
  );
}

async function ProductView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { products } = await getCatalog();
  const p = products.find((x) => x.slug === slug);
  if (!p) notFound();
  const related = products.filter((x) => x.slug !== p.slug && x.collectionSlug === p.collectionSlug).slice(0, 3);
  // créations voisines dans l'ordre de la maison (boucle de la dixième à la première)
  const ordered = [...products].sort((a, b) => a.number - b.number);
  const at = ordered.findIndex((x) => x.slug === p.slug);
  const neighbour = (k: number) => {
    const n = ordered[(at + k + ordered.length) % ordered.length];
    return n && n.slug !== p.slug ? { slug: n.slug, name: n.name, pairing: n.pairing, main: n.images.find((i) => i.role === "main") ?? null } : null;
  };
  const prev = neighbour(-1);
  const next = neighbour(1);
  const accords = ACCORDS[p.slug] ?? [];
  // ingrédients de la recette illustrés par les photographies d'ambiance disponibles
  const recipe = RECIPES.find((r) => r.slug === p.slug);
  const ingredientTiles = (recipe?.ingredients ?? []).flatMap((ing: Ingredient) => {
    const key = INGREDIENT_PHOTO[ing];
    const image = key ? ambiance(key) : null;
    return key && image ? [{ key, label: INGREDIENT_LABEL[ing] ?? ing, image }] : [];
  });
  // scène de la galerie : l'ingrédient vedette d'abord, puis les autres ingrédients photographiés
  const lead = ambiance(CREATION_STAGE[p.slug] ?? "medjool-macro");
  const stages: StagePhoto[] = [
    ...(lead && !ingredientTiles.some((t) => t.key === CREATION_STAGE[p.slug]) ? [{ key: "scene", label: "La matière", url: lead.url, alt: lead.alt, credit: lead.credit, blur: lead.blur }] : []),
    ...[...ingredientTiles].sort((a, b) => (a.key === CREATION_STAGE[p.slug] ? -1 : b.key === CREATION_STAGE[p.slug] ? 1 : 0)).map((t) => ({ key: t.key, label: t.label, url: t.image.url, alt: t.image.alt, credit: t.image.credit, blur: t.image.blur })),
  ];
  const prices = p.variants.map((v) => v.priceCents);
  const inStock = p.variants.some((v) => v.stock > 0);
  const base = siteUrl();

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: `${p.tagline} ${p.story}`,
    image: p.images.map((i) => `${base}${i.url}`),
    brand: { "@type": "Brand", name: "MAISON TAMRĀN" },
    sku: p.slug,
    category: "Dattes fourrées enrobées de chocolat",
  };
  // Une offre n'est déclarée aux moteurs que pour une recette réellement en vente.
  if (p.status === "available" && prices.length) {
    jsonLd.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: (Math.min(...prices) / 100).toFixed(2),
      highPrice: (Math.max(...prices) / 100).toFixed(2),
      offerCount: p.variants.length,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${base}/creations/${p.slug}`,
    };
  }

  return (
    <article className="relative overflow-hidden" style={{ ["--accent" as string]: p.palette.accent }}>
      <JsonLd data={jsonLd} />
      {/* halo discret à la couleur de la recette */}
      <div aria-hidden className="pointer-events-none absolute -left-[20%] top-0 -z-10 size-[80vw] rounded-full opacity-[0.12] blur-3xl" style={{ background: "var(--accent)" }} />
      <div className="container-luxe pt-[calc(var(--header-h)+2rem)]">
        <Breadcrumbs items={[{ href: "/creations", label: "Créations" }, { href: `/collections/${p.collectionSlug}`, label: p.collectionName }, { href: `/creations/${p.slug}`, label: p.name }]} />
      </div>


      <div className="container-luxe mt-8 grid gap-12 pb-[var(--section)] lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <ProductGallery images={p.images} name={p.name} stages={stages} slug={p.slug} />

        <div className="lg:pt-6">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2 t-small text-ink-soft">
            <span>{p.collectionName} N° {p.number}</span>
            {p.status !== "available" && <span className="border border-bronze/60 px-2 py-0.5 text-[0.75rem] text-ink">{STATUS_PUBLIC[p.status]}</span>}
            {p.limited && <span className="border hairline px-2 py-0.5 text-[0.75rem]">Édition limitée</span>}
          </p>
          <h1 className="mt-4 t-display-l">{p.name}</h1>
          <p className="mt-4 font-display text-2xl italic text-ink-soft">{p.tagline}</p>
          <p className="mt-6 t-lead">{p.pairing}</p>
          {prices.length > 0 && <p className="mt-6 text-xl tabular-nums">dès {euros(Math.min(...prices))}</p>}

          <div className="mt-8">
            <BuyBox
              slug={p.slug}
              name={p.name}
              purchasable={p.purchasable}
              variants={p.variants.map((v) => ({ id: v.id, name: v.name, pieces: v.pieces, priceCents: v.priceCents, stock: v.stock }))}
              statusNote={p.status === "prototype" ? "Recette prototype : composition, poids et prix sont provisoires et seront confirmés avant la mise en vente." : null}
            />
            <p className="mt-4 t-small text-ink-soft">
              Expédition en France et dans six pays européens : tarifs et conditions dans <Link href="/livraison-retours" className="link-draw text-ink">Livraison et retours</Link>.
            </p>
          </div>

          <div className="mt-10 max-w-[56ch]">
            <p className="text-ink-soft">{p.story}</p>
          </div>

          {p.tasting && (
            <ol className="mt-10 grid gap-6 sm:grid-cols-3" aria-label="Déroulé de la dégustation">
              {(
                [
                  ["Attaque", p.tasting.attaque],
                  ["Cœur", p.tasting.coeur],
                  ["Finale", p.tasting.finale],
                ] as const
              ).map(([t, d], i) => (
                <li key={t} className="border-t pt-4" style={{ borderColor: "var(--accent)" }}>
                  <span className="t-numeral text-bronze">{i + 1}</span>
                  <p className="mt-1 font-display text-xl">{t}</p>
                  <p className="mt-1 t-small text-ink-soft">{d}</p>
                </li>
              ))}
            </ol>
          )}

          {accords.length > 0 && (
            <div className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-y hairline py-5">
              <p className="t-eyebrow text-bronze">Accords suggérés</p>
              <ul className="flex flex-wrap gap-x-5 gap-y-1 t-small text-ink-soft">
                {accords.map((a) => (
                  <li key={a} className="flex items-center gap-2">
                    <span aria-hidden className="size-1.5 rotate-45" style={{ background: "var(--accent)" }} />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12 border-t hairline">
            <Detail title="Composition" open>
              <p>{p.ingredients}</p>
              <p className="mt-3">
                {CHOCOLATE_LABELS[p.chocolate as ChocolateKind] ?? p.chocolate}. Familles : {p.flavorFamilies.map((f) => FLAVOR_LABELS[f] ?? f).join(", ").toLowerCase()}.
              </p>
            </Detail>
            <Detail title="Allergènes">
              {p.allergens.length ? (
                <p>
                  Contient : <strong className="font-semibold text-ink">{p.allergens.map((a) => ALLERGEN_LABELS[a] ?? a).join(", ").toLowerCase()}</strong>.
                </p>
              ) : (
                <p>Aucun des quatorze allergènes réglementaires n&apos;a été identifié dans la recette provisoire.</p>
              )}
              <p className="mt-3">Fabrication dans un environnement susceptible de contenir d&apos;autres allergènes : informations de traces à confirmer.</p>
            </Detail>
            <Detail title="Poids, conservation, traçabilité">
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                <dt className="text-ink">Poids net</dt>
                <dd>{p.netWeightG ? `${p.netWeightG} g` : pending}</dd>
                <dt className="text-ink">Conservation</dt>
                <dd>{p.storage ?? pending}</dd>
                <dt className="text-ink">À consommer de préférence avant</dt>
                <dd>{p.bestBefore ?? <span className="italic">Indiquée sur l&apos;emballage</span>}</dd>
                <dt className="text-ink">Origine des dattes</dt>
                <dd>{p.origin ?? pending}</dd>
              </dl>
            </Detail>
            <Detail title="Valeurs nutritionnelles">
              {p.nutrition && Object.keys(p.nutrition).length ? (
                <table className="w-full">
                  <tbody>
                    {Object.entries(p.nutrition).map(([k, v]) => (
                      <tr key={k} className="border-b hairline"><th className="py-2 pr-4 text-left font-normal text-ink">{k}</th><td className="py-2">{v}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Communiquées après analyse de la recette définitive.</p>
              )}
            </Detail>
          </div>
          {!p.regulatoryValidated && (
            <Provisional className="mt-8">
              Informations réglementaires provisoires : elles seront validées avec la fiche technique de la recette définitive. En cas d&apos;allergie, <Link href="/contact" className="underline underline-offset-2">écrivez-nous</Link> avant toute commande.
            </Provisional>
          )}
        </div>
      </div>

      {/* créations voisines : on passe de l'une à l'autre comme on tourne une page */}
      <nav aria-label="Créations voisines" className="grid border-t hairline sm:grid-cols-2">
        {([[prev, "Création précédente", "nav-back"], [next, "Création suivante", "nav-forward"]] as const).map(([n, label, type], k) =>
          n ? (
            <TransitionLink
              key={n.slug}
              href={`/creations/${n.slug}`}
              direction={type}
              className={`group relative flex min-h-[15rem] items-end overflow-hidden bg-chocolate p-[var(--gutter)] text-ivory ${k === 1 ? "sm:justify-end sm:text-right" : ""}`}
            >
              {n.main && <Image src={n.main.url} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" quality={70} className="object-cover opacity-55 transition-[opacity,transform] duration-[1.2s] ease-[var(--ease-luxe)] group-hover:scale-105 group-hover:opacity-75" />}
              <span aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(20,12,9,.85),transparent_65%)]" />
              <span className="relative">
                <span className="block t-micro tracking-[0.16em] text-gold">{k === 0 ? "← " : ""}{label.toUpperCase()}{k === 1 ? " →" : ""}</span>
                <span className="mt-2 block font-display text-[clamp(1.8rem,3vw,2.8rem)] leading-tight">{n.name}</span>
                <span className="block t-small text-ivory/70">{n.pairing}</span>
              </span>
            </TransitionLink>
          ) : null,
        )}
      </nav>

      {ingredientTiles.length > 0 && (
        <section className="on-dark py-[var(--section)]" aria-labelledby="ingredients-title">
          <div className="container-luxe grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="t-eyebrow text-gold">Les matières</p>
              <h2 id="ingredients-title" className="mt-4 t-display-m">Au cœur de {p.name}</h2>
              <p className="mt-6 max-w-[38ch] text-taupe">{p.pairing}</p>
              <p className="mt-8 t-micro text-taupe">Visuels conceptuels générés par IA : ils illustrent les ingrédients, pas la création.</p>
            </div>
            <ul className={`grid gap-6 lg:col-span-8 ${ingredientTiles.length > 1 ? "sm:grid-cols-2" : ""} ${ingredientTiles.length > 2 ? "lg:grid-cols-3" : ""}`}>
              {ingredientTiles.map((t, k) => (
                <li key={t.key}>
                  <FadeIn delay={k * 0.1}>
                    <div className={`relative overflow-hidden ${ingredientTiles.length === 1 ? "aspect-[16/9]" : "aspect-[4/5]"}`}>
                      <Image src={t.image.url} alt={t.image.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" quality={85} className="object-cover" />
                      <span className="absolute bottom-2 right-3 text-[0.62rem] text-ivory/70">{t.image.credit}</span>
                    </div>
                    <p className="mt-4 font-display text-2xl">{t.label}</p>
                  </FadeIn>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="border-t hairline bg-cream py-[var(--section)]" aria-labelledby="related-title">
          <div className="container-luxe">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="related-title" className="t-display-m">À découvrir aussi</h2>
              <Link href={`/collections/${p.collectionSlug}`} className="link-draw t-small">Toute la collection</Link>
            </div>
            <ul className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}><ProductCard p={toCard(r)} /></li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
