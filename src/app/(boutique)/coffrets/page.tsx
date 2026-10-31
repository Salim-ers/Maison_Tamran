import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/motion/transition-link";
import { clsx } from "clsx";
import { getBoxes, getCatalog, getSettings } from "@/lib/catalog";
import { euros } from "@/lib/money";
import { ambiance } from "@/lib/ambiance";
import { Breadcrumbs } from "@/components/layout/page-intro";
import { concept, ConceptBadge } from "@/components/ui/media";
import { FormatDiagram } from "@/components/configurator/format-diagram";
import { FadeIn, RevealImage } from "@/components/motion/reveal";
import { AddFixedBox } from "@/components/product/add-fixed-box";

export const metadata: Metadata = {
  title: "Coffrets de dattes gastronomiques à offrir",
  description:
    "Coffrets MAISON TAMRĀN de 6, 12 et 24 dattes Medjool fourrées et enrobées de chocolat, à composer soi-même ; édition limitée et coffrets personnalisés pour les entreprises.",
  alternates: { canonical: "/coffrets" },
};

const STEPS = [
  ["Le format", "Six, douze ou vingt-quatre pièces."],
  ["Les créations", "Placez vos saveurs une à une, dans l'ordre de votre choix."],
  ["Le mot", "Un message glissé sous le couvercle, pour la personne qui l'ouvrira."],
  ["L'écrin", "Emballage cadeau en option, ruban et papier de soie."],
];

export default async function CoffretsPage() {
  const [boxes, { products }, settings] = await Promise.all([getBoxes(), getCatalog(), getSettings()]);
  const nameOf = (slug: string) => products.find((p) => p.slug === slug)?.name ?? slug;
  // vue complète (≈ 412 px) : les alvéoles des grands schémas dépassent la définition des recadrages du cœur
  const thumb = (p: (typeof products)[number]) => (p.images.find((x) => x.role === "main") ?? p.images[0])?.url;
  const thumbs = products.filter((p) => p.collectionSlug === "signature").map(thumb).filter((u): u is string => Boolean(u));
  const ephemeralThumbs = products.filter((p) => p.collectionSlug === "ephemere").map(thumb).filter((u): u is string => Boolean(u));
  const coffret = concept("coffret-1");
  const ambianceImg = ambiance("art-de-recevoir");
  // photographie du coffret (visuel généré, résolu par le manifeste photo), sinon le schéma du format
  const boxPhoto = (b: (typeof boxes)[number]) => {
    const main = b.images.find((x) => x.role === "main");
    return main && !main.url.startsWith("/images/concepts/") ? main : null;
  };

  return (
    <>
      {/* En-tête : le coffret Signature se dévoile */}
      <header className="on-dark relative overflow-hidden grain pt-[calc(var(--header-h)+clamp(2rem,5vw,4rem))]">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(ellipse_at_70%_0%,rgba(169,116,68,.25),transparent_65%)]" />
        <div className="container-luxe relative grid gap-10 pb-[clamp(3rem,6vw,5rem)] lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <div className="anim-fade-up">
              <Breadcrumbs items={[{ href: "/coffrets", label: "Coffrets" }]} tone="dark" />
            </div>
            <h1 className="mt-8 font-display text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-[-0.03em]">
              <span className="-mt-[0.16em] block overflow-hidden pb-[0.05em] pt-[0.16em]">
                <span className="anim-rise block [animation-delay:.15s]">Les coffrets</span>
              </span>
            </h1>
            <p className="anim-fade-up mt-6 max-w-[42ch] t-lead text-taupe [animation-delay:.4s]">
              Boîtes rigides, dattier en relief sur le couvercle, une datte par alvéole et une carte de dégustation. Composez-les librement, ou laissez-nous la main avec l&apos;édition limitée.
            </p>
            <nav aria-label="Formats" className="anim-fade-up mt-8 flex flex-wrap gap-2 [animation-delay:.55s]">
              {boxes.map((b) => (
                <a key={b.slug} href={`#${b.slug}`} className="border border-line-light px-4 py-2 t-small transition-colors hover:border-gold hover:text-gold">
                  {b.name.replace("Coffret ", "")}
                </a>
              ))}
            </nav>
          </div>
          <div className="relative lg:col-span-7">
            <div className="anim-unveil relative aspect-[4/3] overflow-hidden">
              <Image src={coffret.url} alt={coffret.alt} fill preload sizes="(min-width: 1024px) 56vw, 100vw" quality={85} placeholder={coffret.blur ? "blur" : "empty"} blurDataURL={coffret.blur} className="object-cover" />
              {coffret.concept && <ConceptBadge tone="dark" label={coffret.badge} className="right-3 top-3" />}
            </div>
            <p className="mt-3 t-micro text-taupe">Coffret Signature · 12 pièces</p>
          </div>
        </div>
      </header>

      {/* Le principe, en quatre gestes */}
      <section className="border-b hairline bg-creme py-14" aria-label="Composer un coffret en quatre étapes">
        <ol className="container-luxe grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <li key={t}>
              <FadeIn delay={i * 0.08}>
                <p className="t-numeral text-2xl text-bronze">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-1 font-display text-2xl">{t}</p>
                <p className="mt-1 t-small text-ink-soft">{d}</p>
              </FadeIn>
            </li>
          ))}
        </ol>
      </section>

      <div className="pb-[var(--section)]">
        {boxes.map((b, i) => {
          const flip = i % 2 === 1;
          const dark = b.kind === "edition-limitee";
          return (
            <section key={b.slug} id={b.slug} className={clsx("scroll-mt-28 py-[clamp(3.5rem,8vw,7rem)]", dark && "on-dark", b.kind === "entreprise" && "bg-cream")} aria-labelledby={`${b.slug}-t`}>
              <div className="container-luxe grid items-center gap-12 lg:grid-cols-12">
                <div className={clsx("relative lg:col-span-7", flip && "lg:order-2 lg:col-start-6")}>
                  {b.kind === "signature" ? (
                    <RevealImage className="aspect-[4/3]" from={flip ? "left" : "right"} parallax={5}>
                      <Image src={coffret.url} alt={coffret.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" quality={85} className="object-cover" />
                      {coffret.concept && <ConceptBadge tone="dark" label={coffret.badge} className="right-3 top-3" />}
                    </RevealImage>
                  ) : boxPhoto(b) ? (
                    <RevealImage className="aspect-[4/3]" from={flip ? "left" : "right"} parallax={5}>
                      <Image src={boxPhoto(b)!.url} alt={boxPhoto(b)!.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" quality={85} className="object-cover" />
                      <ConceptBadge tone="dark" label={boxPhoto(b)!.badge} className="right-3 top-3" />
                    </RevealImage>
                  ) : b.kind === "entreprise" && ambianceImg ? (
                    <RevealImage className="aspect-[4/3]" from={flip ? "left" : "right"} parallax={5}>
                      <Image src={ambianceImg.url} alt={ambianceImg.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" quality={85} className="object-cover" />
                      <span className="absolute bottom-2 left-3 t-micro text-ivory/80">{ambianceImg.concept ? ambianceImg.credit : `Photographie d’ambiance · ${ambianceImg.credit}`}</span>
                    </RevealImage>
                  ) : (
                    <div className={clsx("relative flex aspect-[4/3] items-center justify-center p-[8%]", dark ? "bg-chocolate-2" : "bg-creme")}>
                      <FormatDiagram pieces={b.pieces ?? 12} thumbs={b.kind === "edition-limitee" ? ephemeralThumbs : thumbs} className="w-full max-w-xl" />
                      <span className={clsx("absolute left-4 top-4 t-micro tracking-[0.14em]", dark ? "text-taupe" : "text-ink-soft")}>ILLUSTRATION DU FORMAT · PHOTOGRAPHIE À VENIR</span>
                    </div>
                  )}
                </div>
                <div className={clsx("lg:col-span-4", flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-9")}>
                  <p className={clsx("t-eyebrow", dark ? "text-gold" : "text-bronze")}>
                    {b.pieces ? `${b.pieces} pièces` : "Sur mesure"}
                    {b.status === "prototype" && b.kind !== "entreprise" ? " · format et prix provisoires" : ""}
                  </p>
                  <h2 id={`${b.slug}-t`} className="mt-3 t-display-m">{b.name}</h2>
                  <p className={clsx("mt-5", dark ? "text-taupe" : "text-ink-soft")}>{b.description}</p>
                  <ul className="mt-6 space-y-2 t-small">
                    {b.details.map((d) => (
                      <li key={d} className="flex gap-3">
                        <span className="mt-2 h-px w-4 shrink-0 bg-bronze" aria-hidden />
                        {d}
                      </li>
                    ))}
                  </ul>
                  {b.fixedComposition && (
                    <p className="mt-6 t-small text-taupe">
                      Composition : {Object.entries(b.fixedComposition).map(([s, q]) => `${q} ${nameOf(s)}`).join(", ")}.
                    </p>
                  )}
                  {b.priceCents != null && <p className="mt-8 font-display text-4xl tabular-nums">{euros(b.priceCents)}</p>}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {b.quoteOnly ? (
                      <Link href="/professionnels/devis?segment=entreprise" className="btn btn-primary">Demander un devis</Link>
                    ) : b.configurable ? (
                      <Link href={`/composer-mon-coffret?format=${b.pieces}`} className={clsx("btn", dark ? "btn-gold" : "btn-primary")}>Composer ce coffret</Link>
                    ) : b.fixedComposition ? (
                      <AddFixedBox boxId={b.id} composition={b.fixedComposition} label="Ajouter au panier" light={dark} disabled={!b.purchasable || b.stock < 1} />
                    ) : null}
                    {!b.purchasable && !b.quoteOnly && <p className="w-full t-small text-ink-soft">Ce coffret n&apos;est pas encore en vente.</p>}
                    {b.purchasable && !b.quoteOnly && b.stock < 1 && <p className="w-full t-small">Épuisé pour le moment.</p>}
                  </div>
                  {!b.quoteOnly && <p className={clsx("mt-5 t-micro", dark ? "text-taupe" : "text-ink-soft")}>Emballage cadeau en option : {euros(settings.giftWrapCents)}.</p>}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
