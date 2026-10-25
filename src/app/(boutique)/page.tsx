import Link from "next/link";
import { getBoxes, getCatalog, getContent } from "@/lib/catalog";
import { toCard, toSwatch } from "@/lib/present";
import { concept, Media } from "@/components/ui/media";
import { Hero } from "@/components/home/hero";
import { SignatureRail } from "@/components/home/signature-rail";
import { SensoryLayers } from "@/components/home/sensory-layers";
import { CoffretsShowcase } from "@/components/home/coffrets-showcase";
import { ComposeTeaser } from "@/components/home/compose-teaser";
import { EphemeralPanels } from "@/components/home/ephemeral-panels";
import { Newsletter } from "@/components/home/newsletter";
import { FadeIn, RevealImage, RevealLines } from "@/components/motion/reveal";
import { NEWSLETTER_CONSENT_TEXT } from "@/lib/texts";
import manifest from "@/data/concepts-manifest.json";
import { homeHero, homeMaison } from "@/content/registry/home";

function splitLines(t: string) {
  const w = t.split(" ");
  const h = Math.ceil(w.length / 2);
  return w.length < 3 ? [t] : [w.slice(0, h).join(" "), w.slice(h).join(" ")];
}

export default async function HomePage() {
  const [{ products, collections }, boxes, hero, maison] = await Promise.all([
    getCatalog(),
    getBoxes(),
    getContent(homeHero.key, homeHero.defaults),
    getContent(homeMaison.key, homeMaison.defaults),
  ]);
  const signature = products.filter((p) => p.collectionSlug === "signature");
  const ephemeral = products.filter((p) => p.collectionSlug === "ephemere");
  const m = manifest as Record<string, { blur: string }>;
  const sale = boxes.filter((b) => !b.quoteOnly && b.kind !== "edition-limitee");

  return (
    <>
      <Hero image={concept("hero")} {...hero} />

      {/* 2. L'art de la dégustation */}
      <section id="degustation" className="section-pad" aria-labelledby="art-title">
        <div className="container-luxe grid gap-14 lg:grid-cols-12">
          <RevealImage className="aspect-[4/5] lg:col-span-6 lg:row-span-2" from="bottom">
            <Media image={concept("macro-1")} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" wrapperClassName="absolute inset-0" badgeClassName="bottom-3 left-3" />
          </RevealImage>
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-16">
            <RevealLines lines={["L'art de", "la dégustation"]} className="t-display-l" />
            <FadeIn delay={0.2}>
              <p className="mt-8 max-w-[42ch] t-lead text-ink-soft">
                Une datte TAMBRÉ se goûte en trois temps. On la prend entre deux doigts, on la regarde, puis on la croque franchement : c&apos;est en une seule bouchée que l&apos;accord se révèle.
              </p>
            </FadeIn>
          </div>
          <ol className="grid gap-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7 lg:mt-6 lg:gap-8">
            {[
              ["Le fruit", "La Medjool apporte sa chair épaisse et ses notes de miel, de caramel et de fruits secs. Elle remplace le sucre et donne la tenue."],
              ["Le cœur", "Au centre, la garniture porte l'idée de la recette : un agrume, une fleur, une torréfaction, un trait de sel."],
              ["L'émotion", "Le chocolat craque, le fruit fond, la finale s'étire. Ce qui reste, c'est l'envie d'en reprendre une."],
            ].map(([t, d], i) => (
              <FadeIn key={t} delay={0.1 + i * 0.12} className={i === 1 ? "sm:mt-14" : i === 2 ? "sm:mt-28" : ""}>
                <li className="list-none">
                  <span className="t-numeral text-2xl text-bronze">{i + 1}</span>
                  <h3 className="mt-2 t-title">{t}</h3>
                  <p className="mt-3 t-small text-ink-soft">{d}</p>
                </li>
              </FadeIn>
            ))}
          </ol>
        </div>
      </section>

      {/* 3. Créations Signature */}
      <SignatureRail products={signature.map(toCard)} intro={collections.find((c) => c.slug === "signature")?.intro ?? ""} />

      {/* 4. Une expérience sensorielle */}
      <SensoryLayers blurs={{ datte: m["couche-datte"]?.blur, garniture: m["couche-garniture"]?.blur, chocolat: m["couche-chocolat"]?.blur, finition: m["couche-finition"]?.blur }} />

      {/* 5. Les coffrets */}
      <CoffretsShowcase closed={concept("coffret-ferme")} open={concept("coffret-1")} boxes={sale.map((b) => ({ slug: b.slug, name: b.name, pieces: b.pieces, priceCents: b.priceCents }))} />

      {/* 6. Composez votre sélection */}
      <ComposeTeaser flavors={products.filter((p) => p.purchasable).map(toSwatch)} />

      {/* 7. La Maison TAMBRÉ */}
      <section className="section-pad overflow-hidden" aria-labelledby="maison-title">
        <div className="container-luxe grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <RevealLines lines={splitLines(maison.title)} className="t-display-l" />
            <FadeIn delay={0.15}>
              <p className="mt-8 max-w-[46ch] t-lead text-ink-soft">{maison.body}</p>
              <p className="mt-8 font-display text-2xl italic">{maison.signature}</p>
              <Link href="/maison" className="btn btn-outline mt-10">Découvrir la Maison</Link>
            </FadeIn>
          </div>
          <div className="relative lg:col-span-7">
            <RevealImage className="aspect-[3/2]" from="right" parallax={6}>
              <Media image={concept("lifestyle-3")} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" wrapperClassName="absolute inset-0" />
            </RevealImage>
            <RevealImage className="absolute -bottom-16 -left-10 hidden aspect-square w-[34%] border-8 border-ivory lg:block" from="bottom" parallax={4}>
              <Media image={concept("lifestyle-1")} fill sizes="20vw" className="object-cover" wrapperClassName="absolute inset-0" badge={false} />
            </RevealImage>
          </div>
        </div>
      </section>

      {/* 8. Éditions éphémères */}
      <EphemeralPanels
        intro={collections.find((c) => c.slug === "ephemere")?.intro ?? ""}
        items={ephemeral.map((p, i) => ({ slug: p.slug, name: p.name, pairing: p.pairing, tagline: p.tagline, image: p.images.find((x) => x.role === "scene") ?? p.images[0] ?? null, accent: p.palette.accent, edition: i + 1 }))}
      />

      {/* 9. Professionnels et événements */}
      <section className="section-pad" aria-labelledby="pro-title">
        <div className="container-luxe">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
            <RevealLines lines={["Professionnels", "et événements"]} className="t-display-l" />
            <p className="max-w-[46ch] text-ink-soft lg:justify-self-end">
              Coffrets aux couleurs d&apos;une entreprise, mignardises pour un mariage, une pièce TAMBRÉ servie avec le café : décrivez votre projet, nous revenons vers vous avec une proposition chiffrée.
            </p>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              { img: "pro-1", title: "Cadeaux d'entreprise", text: "Fin d'année, séminaires, remerciements clients : coffrets personnalisés à votre logo, cartes imprimées, livraison groupée ou individuelle.", href: "/professionnels/cadeaux-entreprise" },
              { img: "pro-2", title: "Mariages et événements", text: "Mini-coffrets pour chaque invité, plateaux pour le café, couleurs accordées à votre réception.", href: "/professionnels/mariages-evenements" },
              { img: "lifestyle-1", title: "Coffee shops, hôtels, épiceries fines", text: "Une pièce d'exception à servir ou à vendre, avec une offre de réassort à l'étude pour nos partenaires.", href: "/professionnels#revendeurs" },
            ].map((c, i) => (
              <FadeIn key={c.title} delay={i * 0.1}>
                <article className="group relative">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Media image={concept(c.img)} fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.04]" wrapperClassName="absolute inset-0" />
                  </div>
                  <h3 className="mt-6 t-title">
                    <Link href={c.href} className="after:absolute after:inset-0">{c.title}</Link>
                  </h3>
                  <p className="mt-3 t-small text-ink-soft">{c.text}</p>
                </article>
              </FadeIn>
            ))}
          </div>
          <div className="mt-14 flex flex-wrap gap-3">
            <Link href="/professionnels/devis" className="btn btn-primary">Demander un devis</Link>
            <Link href="/professionnels" className="btn btn-outline">L&apos;offre professionnelle</Link>
          </div>
        </div>
      </section>

      {/* 10. Newsletter */}
      <Newsletter consentText={NEWSLETTER_CONSENT_TEXT} />
    </>
  );
}
