import { getImageProps } from "next/image";
import { Breadcrumbs, type Crumb } from "./page-intro";
import { PageHeroMotion } from "./page-hero-motion";

export type HeroImage = { url: string; w: number; h: number; alt: string; badge?: string };

/**
 * Ouverture plein cadre des pages éditoriales : une photographie (paysage sur ordinateur, verticale sur mobile,
 * par direction artistique : un téléphone ne télécharge jamais la version paysage), le titre posé dans l'ombre.
 * La photographie recule lentement au chargement et glisse en parallaxe au défilement.
 */
export function PageHero({
  title,
  intro,
  crumbs,
  image,
  mobile,
  children,
}: {
  title: React.ReactNode;
  intro?: React.ReactNode;
  crumbs: Crumb[];
  image: HeroImage;
  mobile?: HeroImage | null;
  children?: React.ReactNode;
}) {
  const common = { alt: image.alt, sizes: "100vw", quality: 82, loading: "eager" as const, fetchPriority: "high" as const };
  const {
    props: { srcSet: desktop, ...rest },
  } = getImageProps({ ...common, src: image.url, width: image.w, height: image.h });
  const m = mobile
    ? getImageProps({ ...common, src: mobile.url, width: mobile.w, height: mobile.h }).props.srcSet
    : undefined;

  return (
    <header className="on-dark relative isolate flex min-h-[min(92svh,60rem)] items-end overflow-hidden">
      <PageHeroMotion>
        <picture className="absolute inset-0 block">
          {m && <source media="(max-aspect-ratio: 1/1)" srcSet={m} />}
          <source srcSet={desktop} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img {...rest} alt={image.alt} className="absolute inset-0 size-full object-cover" />
        </picture>
      </PageHeroMotion>
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(20,12,9,.92)_0%,rgba(20,12,9,.55)_38%,rgba(20,12,9,.12)_70%,rgba(20,12,9,.35)_100%)]" />
      <div className="container-luxe relative pb-[clamp(2.5rem,7vh,5rem)] pt-[calc(var(--header-h)+var(--banner-h)+3rem)]">
        <Breadcrumbs items={crumbs} tone="dark" />
        <h1 className="anim-fade-up mt-5 max-w-[16ch] section-title">{title}</h1>
        {intro && <div className="anim-fade-up mt-6 max-w-[54ch] t-lead text-ivory/80 [animation-delay:.15s]">{intro}</div>}
        {children}
      </div>
      {image.badge && <p className="absolute bottom-3 right-4 t-micro text-ivory/50">{image.badge}</p>}
    </header>
  );
}
