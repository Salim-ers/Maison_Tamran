import Image from "next/image";
import Link from "next/link";
import type { ImageRef } from "@/db/schema";
import { Breadcrumbs, type Crumb } from "@/components/layout/page-intro";

export interface StripItem {
  slug: string;
  name: string;
  pairing: string;
  image: ImageRef | null;
}

/**
 * En-tête de collection sur fond chocolat : titre éditorial et frise panoramique des créations
 * qui défile lentement (arrêtée au survol, au focus et en mode « animations réduites »).
 * Les entrées sont en CSS : rien ne dépend de JavaScript pour s'afficher.
 */
export function CreationsHero({ title, subtitle, crumbs, items, children }: { title: string; subtitle: string; crumbs: Crumb[]; items: StripItem[]; children?: React.ReactNode }) {
  const loop = [...items, ...items];
  return (
    <header className="on-dark relative overflow-hidden grain pt-[calc(var(--header-h)+clamp(2rem,5vw,4rem))]">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(ellipse_at_30%_0%,rgba(169,116,68,.25),transparent_65%)]" />
      <div className="container-luxe relative">
        <div className="anim-fade-up">
          <Breadcrumbs items={crumbs} tone="dark" />
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <h1 className="font-display text-[clamp(3rem,8vw,8.5rem)] leading-[0.92] tracking-[-0.03em] lg:col-span-7">
            <span className="-mt-[0.16em] block overflow-hidden pb-[0.05em] pt-[0.16em]">
              <span className="anim-rise block [animation-delay:.15s]">{title}</span>
            </span>
          </h1>
          <div className="anim-fade-up lg:col-span-5 [animation-delay:.45s]">
            <p className="max-w-[44ch] t-lead text-taupe">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>

      {/* frise panoramique */}
      <div className="relative mt-[clamp(3rem,6vw,5rem)] overflow-hidden pb-[clamp(3rem,6vw,5rem)]">
        <ul className="anim-marquee flex w-max gap-4 [--marquee-duration:80s] md:gap-6" aria-label="Les créations">
          {loop.map((it, i) => (
            <li key={`${it.slug}-${i}`} className="anim-fade-up w-[46vw] shrink-0 sm:w-[30vw] lg:w-[min(19vw,17.5rem)]" style={{ animationDelay: `${0.5 + (i % items.length) * 0.07}s` }} aria-hidden={i >= items.length || undefined}>
              <Link href={`/creations/${it.slug}`} className="group relative block aspect-[4/5] overflow-hidden" tabIndex={i >= items.length ? -1 : undefined}>
                {it.image && (
                  <Image
                    src={it.image.url}
                    alt={i >= items.length ? "" : it.image.alt}
                    fill
                    sizes="(min-width: 1024px) 280px, (min-width: 640px) 30vw, 46vw"
                    quality={75}
                    placeholder={it.image.blur ? "blur" : "empty"}
                    blurDataURL={it.image.blur}
                    className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.05]"
                  />
                )}
                <span className="absolute inset-0 bg-[linear-gradient(0deg,rgba(36,23,19,.85),rgba(36,23,19,0)_55%)]" />
                <span className="absolute inset-x-0 bottom-0 p-4">
                  <span className="block font-display text-2xl leading-tight">{it.name}</span>
                  <span className="mt-1 block max-h-0 overflow-hidden t-micro text-taupe transition-[max-height] duration-700 group-hover:max-h-12">{it.pairing}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="container-luxe mt-4 t-micro text-taupe">Visuels conceptuels : les recettes sont en cours de développement.</p>
      </div>
    </header>
  );
}
