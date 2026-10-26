import type { Metadata } from "next";
import Link from "next/link";
import { getCatalog, getContent } from "@/lib/catalog";
import { Breadcrumbs } from "@/components/layout/page-intro";
import Image from "next/image";
import { concept, ConceptBadge } from "@/components/ui/media";
import { ambiance, type AmbianceImage } from "@/lib/ambiance";
import { RevealImage } from "@/components/motion/reveal";
import { BrandLogo } from "@/components/brand";
import { maisonHistoire, maisonManifeste, maisonOuverture, maisonValeurs } from "@/content/registry/maison";

export const metadata: Metadata = {
  title: "Notre Maison",
  description: "MAISON TAMRĀN, dattes gastronomiques françaises : la Medjool travaillée comme une matière de haute pâtisserie, des accords précis et des coffrets pensés pour offrir.",
  alternates: { canonical: "/maison" },
};

function Photo({ image, sizes, preload }: { image: AmbianceImage; sizes: string; preload?: boolean }) {
  return (
    <>
      <Image src={image.url} alt={image.alt} fill sizes={sizes} quality={75} preload={preload} placeholder={image.blur ? "blur" : "empty"} blurDataURL={image.blur} className="object-cover" style={{ objectPosition: image.focus }} />
      <span className="absolute bottom-2 right-3 t-micro text-ivory/75 [text-shadow:0_1px_2px_rgba(0,0,0,.6)]">{image.credit}</span>
    </>
  );
}

export default async function MaisonPage() {
  const [o, m, v, h] = await Promise.all([
    getContent(maisonOuverture.key, maisonOuverture.defaults),
    getContent(maisonManifeste.key, maisonManifeste.defaults),
    getContent(maisonValeurs.key, maisonValeurs.defaults),
    getContent(maisonHistoire.key, maisonHistoire.defaults),
  ]);
  const chapters = [
    { title: m.matiereTitle, body: m.matiereBody },
    { title: m.accordTitle, body: m.accordBody },
    { title: m.objetTitle, body: m.objetBody },
  ];
  const { products } = await getCatalog();
  // trois cœurs différents : l'accord se lit dans la coupe
  const hearts = ["or-de-marrakech", "rouge-desir", "minuit-a-kyoto"].map((slug) => products.find((x) => x.slug === slug)).flatMap((x) => {
    // vue complète (≈ 412 px de large) : la coupe seule est trop petite pour ce format
    const img = x?.images.find((i) => i.role === "main");
    return x && img ? [{ name: x.name, img }] : [];
  });
  const coffret = concept("coffret-1");
  const riad = ambiance("riad-lumiere");
  const dattes = ambiance("dattes-naturelles");
  const palmeraie = ambiance("palmeraie");
  const recevoir = ambiance("art-de-recevoir");
  const values = [
    [v.v1Title, v.v1Body],
    [v.v2Title, v.v2Body],
    [v.v3Title, v.v3Body],
    [v.v4Title, v.v4Body],
  ].filter(([t]) => t);

  return (
    <>
      {/* Ouverture sombre, sous l'en-tête transparent */}
      <section className="on-dark grain relative isolate overflow-hidden pb-[clamp(4rem,10vw,9rem)] pt-[calc(var(--header-h)+var(--banner-h)+clamp(2.5rem,6vw,5rem))]" aria-labelledby="maison-title">
        <div className="container-luxe grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 lg:pt-6">
            <Breadcrumbs items={[{ href: "/maison", label: "Notre Maison" }]} tone="dark" />
            <h1 id="maison-title" className="mt-8 t-display-xl">{o.title}</h1>
            <p className="mt-10 max-w-[48ch] t-lead text-taupe">{o.lead}</p>
          </div>
          <div className="relative lg:col-span-4 lg:col-start-9">
            {riad && (
              <div className="anim-unveil relative aspect-[4/5] overflow-hidden">
                <Photo image={riad} sizes="(min-width: 1024px) 30vw, 100vw" preload />
              </div>
            )}
          </div>
          <blockquote className="border-l border-bronze-light/60 pl-6 lg:col-span-6 lg:col-start-2 lg:-mt-10">
            <p className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] italic leading-snug">{o.quote}</p>
          </blockquote>
        </div>
      </section>

      {/* Manifeste */}
      <section className="section-pad" aria-labelledby="manifeste-title">
        <div className="container-luxe">
          <h2 id="manifeste-title" className="t-display-l max-w-[14ch]">{m.title}</h2>

          <div className="mt-[clamp(3.5rem,8vw,7rem)] space-y-[clamp(5rem,11vw,10rem)]">
            {/* La matière : image à gauche, texte décalé */}
            <article className="grid items-end gap-10 lg:grid-cols-12">
              <RevealImage className="aspect-square lg:col-span-5" from="bottom" parallax={5}>
                {dattes && <Photo image={dattes} sizes="(min-width: 1024px) 40vw, 100vw" />}
              </RevealImage>
              <div className="lg:col-span-5 lg:col-start-7 lg:pb-10">
                <h3 className="t-display-m">{chapters[0].title}</h3>
                <p className="mt-6 max-w-[46ch] t-lead text-ink-soft">{chapters[0].body}</p>
              </div>
            </article>

            {/* L'accord : texte large à gauche, image panoramique qui déborde à droite */}
            <article className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4 lg:pt-16">
                <h3 className="t-display-m">{chapters[1].title}</h3>
                <p className="mt-6 max-w-[42ch] text-ink-soft">{chapters[1].body}</p>
                <dl className="mt-10 grid grid-cols-3 gap-4 border-t hairline pt-6 t-small">
                  {[["Le fruit", "Medjool"], ["Le cœur", "garniture"], ["La coque", "chocolat"]].map(([k, val]) => (
                    <div key={k}>
                      <dt className="text-ink-soft">{k}</dt>
                      <dd className="mt-1 font-display text-lg italic">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="relative lg:col-span-8 lg:col-start-5 lg:-mr-[var(--gutter)]">
                <div className="relative grid aspect-[20/11] grid-cols-3 gap-2 overflow-hidden">
                  {hearts.map((h, k) => (
                    <RevealImage key={h.name} className="h-full" from="bottom" parallax={4 + k * 2}>
                      <Image src={h.img.url} alt={h.img.alt} fill sizes="(min-width: 1024px) 21vw, 33vw" quality={75} className="object-cover" />
                      <span className="absolute bottom-2 left-3 t-micro text-ivory [text-shadow:0_1px_2px_rgba(0,0,0,.6)]">{h.name}</span>
                    </RevealImage>
                  ))}
                  {hearts[0]?.img.concept && <ConceptBadge tone="dark" label={hearts[0].img.badge} className="right-3 top-3" />}
                </div>
              </div>
            </article>

            {/* L'objet : deux images en léger chevauchement, texte à droite */}
            <article className="grid items-center gap-12 lg:grid-cols-12">
              <div className="relative lg:col-span-6 lg:col-start-1">
                <div className="relative ml-[12%] aspect-[3/2] overflow-hidden">
                  <Image src={coffret.url} alt={coffret.alt} fill sizes="(min-width: 1024px) 45vw, 90vw" quality={85} className="object-cover" />
                  {coffret.concept && <ConceptBadge tone="dark" label={coffret.badge} className="right-3 top-3" />}
                </div>
                {recevoir && (
                  <div className="relative -mt-[22%] aspect-[4/5] w-[42%] overflow-hidden border-8 border-ivory">
                    <Photo image={recevoir} sizes="(min-width: 1024px) 20vw, 40vw" />
                  </div>
                )}
              </div>
              <div className="lg:col-span-5 lg:col-start-8">
                <h3 className="t-display-m">{chapters[2].title}</h3>
                <p className="mt-6 max-w-[44ch] t-lead text-ink-soft">{chapters[2].body}</p>
                <Link href="/coffrets" className="mt-8 inline-block link-draw">Voir les coffrets</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Respiration : la palmeraie (photographie d'ambiance, sans lien avec un lieu de la maison) */}
      {palmeraie && (
        <section aria-label="Palmeraie" className="relative">
          <RevealImage className="h-[62svh] min-h-[22rem] w-full" from="bottom" parallax={9}>
            <Photo image={palmeraie} sizes="100vw" />
          </RevealImage>
          <p className="container-luxe mt-4 t-micro text-ink-soft">Tout commence par un fruit : la datte Medjool, cultivée dans les palmeraies.</p>
        </section>
      )}

      {/* Engagements */}
      <section className="bg-cream section-pad" aria-labelledby="valeurs-title">
        <div className="container-luxe grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="valeurs-title" className="t-display-m max-w-[12ch] lg:sticky lg:top-[calc(var(--header-h)+var(--banner-h)+2rem)]">{v.title}</h2>
          </div>
          <dl className="lg:col-span-7 lg:col-start-6">
            {values.map(([t, b]) => (
              <div key={t} className="grid gap-3 border-t hairline py-9 first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-10">
                <dt className="t-title">{t}</dt>
                <dd className="text-ink-soft">{b}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Histoire à écrire */}
      <section className="on-dark relative overflow-hidden section-pad" aria-labelledby="histoire-title">
        <BrandLogo variant="mark" tone="light" height={733} alt="" className="pointer-events-none absolute -right-16 top-1/2 h-[115%] -translate-y-1/2 opacity-[0.08] max-lg:hidden" />
        <div className="container-luxe relative grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 id="histoire-title" className="t-display-l">{h.title}</h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-7 lg:pt-4">
            <p className="t-lead text-taupe">{h.body}</p>
            <p className="mt-10 font-display text-2xl italic text-bronze-light">{h.signature}</p>
            <div className="mt-12 flex flex-wrap gap-3">
              <Link href="/savoir-faire" className="btn btn-light">Le savoir-faire</Link>
              <Link href="/creations" className="btn btn-outline-light">Découvrir les créations</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
