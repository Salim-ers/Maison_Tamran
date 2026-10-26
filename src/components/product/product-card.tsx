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
 * Carte produit, en galerie : la création est présentée dans une niche en arc, sur un halo à la couleur de sa
 * recette, à une taille où sa photographie reste nette. Au survol (ou au focus), la niche se soulève, un arc
 * doré se dessine et l'accord apparaît.
 */
export function ProductCard({ p, tone = "light", className }: { p: CardProduct; sizes?: string; tone?: "light" | "dark"; className?: string }) {
  const dark = tone === "dark";
  return (
    <article className={clsx("group relative", className)}>
      <div
        className="relative aspect-[4/5] overflow-hidden"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 42%, color-mix(in srgb, ${p.accent} 30%, transparent), transparent 72%), ${dark ? "#2b1c16" : "#efe3d0"}`,
        }}
      >
        <span aria-hidden className={clsx("absolute inset-x-[10%] bottom-[9%] h-px", dark ? "bg-ivory/15" : "bg-chocolate/15")} />
        {p.main && (
          <div className="absolute inset-0 grid place-items-center pb-[6%]">
            <div className="native-cap relative transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:-translate-y-2" style={{ ["--nat" as string]: p.main.w ?? 412 }}>
              <span className="relative block overflow-hidden rounded-t-[50%_32%] shadow-[0_30px_50px_-24px_rgba(36,23,19,.65)]" style={{ aspectRatio: `${p.main.w ?? 412} / ${p.main.h ?? 495}` }}>
                <Image src={p.main.url} alt={p.main.alt} fill sizes="(min-width: 1024px) 300px, 62vw" quality={85} placeholder={p.main.blur ? "blur" : "empty"} blurDataURL={p.main.blur} className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.04]" />
              </span>
              {/* arc doré qui se dessine au survol */}
              <svg aria-hidden className="pointer-events-none absolute -inset-[7%] h-[114%] w-[114%]" viewBox="0 0 100 120" preserveAspectRatio="none" fill="none">
                <path d="M2 120 V42 A48 40 0 0 1 98 42 V120" pathLength={1} stroke="#c7a06a" strokeWidth="1.2" vectorEffect="non-scaling-stroke" className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-[1.1s] ease-[var(--ease-luxe)] group-hover:[stroke-dashoffset:0] group-focus-within:[stroke-dashoffset:0]" />
              </svg>
            </div>
          </div>
        )}
        {p.main?.concept && <ConceptBadge className="left-3 top-3" tone={dark ? "dark" : "light"} label={p.main.badge} />}
        {/* l'accord, révélé au survol (toujours visible sur écran tactile) */}
        <div className={clsx("absolute inset-x-0 bottom-0 p-4 transition-[opacity,transform] duration-500 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100", dark ? "bg-[linear-gradient(0deg,rgba(20,12,9,.85),transparent)] text-ivory" : "bg-[linear-gradient(0deg,rgba(250,246,237,.95),transparent)] text-ink")}>
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
