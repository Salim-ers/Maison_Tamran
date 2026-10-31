"use client";

import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";
import type { ImageRef } from "@/db/schema";
import { euros } from "@/lib/money";
import { ConceptBadge } from "@/components/ui/media";
import { AddToCartButton } from "@/components/cart/add-button";

export interface CardProduct {
  slug: string;
  number: number;
  name: string;
  pairing: string;
  collectionName: string;
  chocolateLabel: string;
  fromCents: number | null;
  main: ImageRef | null;
  cut: ImageRef | null;
  accent: string;
  status: string;
  limited: boolean;
  /** format proposé à l'ajout rapide (absent si la création n'est pas achetable) */
  quick?: { id: string; label: string; priceCents: number } | null;
}

/**
 * Carte produit : la photographie de la création en plein cadre. Au survol (ou au focus), la caméra s'approche
 * et la vue bascule sur le cœur de la datte (macro de la garniture) ; un filet doré se dessine et l'accord apparaît.
 */
export function ProductCard({ p, tone = "light", className, sizes = "(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw" }: { p: CardProduct; sizes?: string; tone?: "light" | "dark"; className?: string }) {
  const dark = tone === "dark";
  return (
    <article className={clsx("group relative", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-chocolate">
        {p.main && (
          <Image src={p.main.url} alt={p.main.alt} fill sizes={sizes} quality={85} placeholder={p.main.blur ? "blur" : "empty"} blurDataURL={p.main.blur} className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-luxe)] group-hover:scale-[1.06]" />
        )}
        {p.cut && (
          <Image src={p.cut.url} alt="" aria-hidden fill sizes={sizes} quality={80} className="scale-[1.12] object-cover opacity-0 transition-[opacity,transform] duration-[1.1s] ease-[var(--ease-luxe)] group-hover:scale-100 group-hover:opacity-100 max-lg:hidden" />
        )}
        {/* halo à la couleur de la recette, et filet doré qui se dessine au survol */}
        <span aria-hidden className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light" style={{ background: `radial-gradient(ellipse 70% 50% at 50% 100%, ${p.accent}, transparent 70%)` }} />
        <span aria-hidden className="pointer-events-none absolute inset-3 border border-[#e3c38c]/0 transition-colors duration-700 group-hover:border-[#e3c38c]/55 group-focus-within:border-[#e3c38c]/55" />
        {p.main?.concept && <ConceptBadge className="left-3 top-3" tone="dark" label={p.main.badge} />}
        {/* l'accord, révélé au survol (toujours visible sur écran tactile) */}
        <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(20,12,9,.82),transparent)] p-4 pt-10 text-ivory transition-[opacity,transform] duration-500 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
          <p className="flex items-center justify-between gap-3 t-micro tracking-[0.14em]">
            <span className="truncate">ACCORD · {p.chocolateLabel.toUpperCase()}</span>
            <span aria-hidden className="max-lg:hidden">DÉCOUVRIR →</span>
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={clsx("t-micro", tone === "dark" ? "text-taupe" : "text-ink-soft")}>
            {p.collectionName.replace("Collection ", "")} N° {p.number}
          </p>
          <h3 className="mt-1 t-title">
            <Link href={`/creations/${p.slug}`} className="after:absolute after:inset-0 after:z-[1] focus-visible:outline-none">
              {p.name}
            </Link>
          </h3>
          <p className={clsx("mt-2 t-small max-w-[32ch]", tone === "dark" ? "text-taupe" : "text-ink-soft")}>{p.pairing}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3 pt-5">
          {p.fromCents != null && <p className="t-small tabular-nums">dès {euros(p.fromCents)}</p>}
          {p.quick && (
            <AddToCartButton
              variantId={p.quick.id}
              compact
              label={<span aria-hidden className="text-lg leading-none">+</span>}
              ariaLabel={`Ajouter ${p.name} au panier (${p.quick.label}, ${euros(p.quick.priceCents)})`}
              className={clsx(
                "relative z-[2] grid size-10 place-items-center rounded-full border transition-colors",
                tone === "dark" ? "border-line-light hover:bg-ivory hover:text-chocolate" : "border-line hover:bg-chocolate hover:text-ivory"
              )}
            />
          )}
        </div>
      </div>
    </article>
  );
}
