import Link from "next/link";
import { getImageProps } from "next/image";
import { preload } from "react-dom";
import { BrandLogo } from "@/components/brand";
import { ConceptBadge } from "@/components/ui/media";
import type { ImageRef } from "@/db/schema";
import { HeroDepth } from "./hero-depth";

/** Découpe l'accroche en lignes (retours à la ligne explicites, sinon par groupes de mots). */
function toLines(title: string) {
  if (title.includes("\n")) return title.split("\n");
  const words = title.split(" ");
  if (words.length <= 3) return [title];
  const per = Math.ceil(words.length / 3);
  return [0, 1, 2].map((i) => words.slice(i * per, (i + 1) * per).join(" ")).filter(Boolean);
}

// Particules de cacao : très peu nombreuses, lentes, sur ordinateur uniquement (positions fixes, rendu serveur).
const DUST = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${30 + ((i * 53) % 60)}%`,
  size: 2 + (i % 3),
  dur: 10 + (i % 5) * 2,
  delay: -(i * 1.3),
  dx: `${((i % 4) - 1.5) * 10}px`,
  dy: `${-40 - (i % 3) * 20}px`,
}));

/**
 * Ouverture de l'accueil : le coffret Signature ouvert, révélé par un masque qui s'élargit,
 * puis le logo (reflet lumineux), l'accroche ligne à ligne et les deux actions.
 * L'entrée est en CSS (visible sans JavaScript) ; HeroDepth ajoute la profondeur au défilement.
 */
export function Hero({
  image,
  portrait,
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
}: {
  image: ImageRef;
  portrait: ImageRef;
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
}) {
  const common = { alt: image.alt, quality: 85 } as const;
  const desktop = getImageProps({ ...common, src: image.url, width: image.w ?? 1448, height: image.h ?? 1086, sizes: "(min-width: 768px) 68vw, 100vw" }).props;
  const mobile = getImageProps({ ...common, src: portrait.url, width: portrait.w ?? 869, height: portrait.h ?? 1086, sizes: "100vw" }).props;
  // image du premier écran (LCP) : préchargée selon le format d'écran
  preload(desktop.src, { as: "image", imageSrcSet: desktop.srcSet, imageSizes: desktop.sizes, media: "(min-width: 768px)", fetchPriority: "high" });
  preload(mobile.src, { as: "image", imageSrcSet: mobile.srcSet, imageSizes: mobile.sizes, media: "(max-width: 767px)", fetchPriority: "high" });

  const lines = toLines(title);

  const media = (
    <div className="absolute inset-x-0 top-0 h-[62svh] md:inset-0 md:left-[30%] md:h-auto">
      <div className="anim-unveil absolute inset-0 overflow-hidden">
        <picture>
          <source media="(min-width: 768px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />
          <img
            {...mobile}
            alt={image.alt}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 size-full object-cover object-[50%_45%] md:object-[46%_60%]"
            style={{ backgroundImage: image.blur ? `url("${image.blur}")` : undefined, backgroundSize: "cover" }}
          />
        </picture>
      </div>
      {/* voiles : fondu vers le chocolat côté texte (gauche sur ordinateur, bas sur mobile) */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(36,23,19,.5)_0%,rgba(36,23,19,0)_20%,rgba(36,23,19,0)_62%,rgba(36,23,19,.85)_86%,#241713_100%)] md:bg-[linear-gradient(90deg,#241713_0%,rgba(36,23,19,.86)_14%,rgba(36,23,19,.2)_38%,rgba(36,23,19,0)_55%),linear-gradient(180deg,rgba(36,23,19,.6)_0%,rgba(36,23,19,0)_24%,rgba(36,23,19,0)_80%,rgba(36,23,19,.7)_100%)]" />
      {/* lueur chaude sur le coffret */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_58%_52%,rgba(227,174,88,.16),transparent_55%)] mix-blend-screen" />
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        {DUST.map((d, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#c7a06a] opacity-25 blur-[1px] [animation:cocoa-drift_var(--t)_ease-in-out_infinite_alternate]"
            style={{ left: d.left, top: d.top, width: d.size, height: d.size, ["--t" as string]: `${d.dur}s`, ["--dx" as string]: d.dx, ["--dy" as string]: d.dy, animationDelay: `${d.delay}s` }}
          />
        ))}
      </div>
      {image.concept && <ConceptBadge tone="dark" label={image.badge} className="right-[calc(var(--gutter)+1rem)] top-[calc(var(--header-h)+var(--banner-h,0px)+1rem)] md:bottom-8 md:top-auto" />}
    </div>
  );

  const content = (
    <div className="container-luxe flex min-h-[100svh] flex-col justify-end pb-[clamp(4.5rem,10vh,8rem)] pt-[54svh] md:justify-center md:pb-24 md:pt-[calc(var(--header-h)+var(--banner-h,0px)+2rem)]">
      <div className="max-w-[36rem]">
        <div className="relative inline-block overflow-hidden">
          <BrandLogo variant="logo" tone="light" height={132} alt="MAISON TAMRĀN, dattes gastronomiques" preload className="anim-logo h-16 md:h-32" />
          <span aria-hidden className="anim-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(255,236,205,.55),transparent)] mix-blend-overlay" />
        </div>
        <p className="anim-fade-up mt-4 t-eyebrow text-gold [animation-delay:.55s] md:mt-7">Dattes gastronomiques · Coffrets à offrir</p>
        <h1 id="hero-title" className="mt-3 font-display text-[clamp(2.4rem,min(5.4vw,9vh),5.6rem)] md:mt-5 leading-[0.98] tracking-[-0.025em]">
          <span className="sr-only">MAISON TAMRĀN, dattes gastronomiques et coffrets : </span>
          {lines.map((l, i) => (
            <span key={i} className="block overflow-hidden pb-[0.06em]">
              <span className="anim-rise block" style={{ animationDelay: `${0.75 + i * 0.13}s` }}>
                {l}
              </span>
            </span>
          ))}
        </h1>
        <p className="anim-fade-up mt-4 max-w-[30rem] text-[0.98rem] leading-relaxed text-ivory/80 md:mt-7 md:text-lg" style={{ animationDelay: "1.25s" }}>
          {subtitle}
        </p>
        <div className="anim-fade-up mt-6 grid grid-cols-2 gap-2 sm:flex sm:gap-3 md:mt-9" style={{ animationDelay: "1.45s" }}>
          <Link href="/coffrets" className="btn btn-gold group max-sm:px-3 max-sm:text-[0.85rem]">
            {ctaPrimary}
            <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1 max-sm:hidden">→</span>
          </Link>
          <Link href="/creations" className="btn btn-outline-light max-sm:px-3 max-sm:text-[0.85rem]">{ctaSecondary}</Link>
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative isolate overflow-hidden bg-chocolate text-ivory" aria-labelledby="hero-title">
      <HeroDepth media={media} content={content} />
      <a href="#fruit" className="anim-fade-up absolute bottom-6 left-1/2 z-[2] hidden md:flex -translate-x-1/2 flex-col items-center gap-3 t-micro text-ivory/70 [animation-delay:2s] hover:text-ivory">
        Découvrir
        <span aria-hidden className="relative block h-12 w-px overflow-hidden bg-ivory/15">
          <span className="anim-scroll-cue absolute inset-0 bg-gold" />
        </span>
      </a>
    </section>
  );
}
