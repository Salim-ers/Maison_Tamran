"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { clsx } from "clsx";
import type { ImageRef } from "@/db/schema";
import { euros } from "@/lib/money";
import { ConceptBadge } from "@/components/ui/media";

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
}

/**
 * Carte produit : au survol (ou au focus), la coupe se dévoile par un masque circulaire
 * qui part du pointeur. Sur écran tactile, un bouton explicite bascule entre les deux vues.
 */
export function ProductCard({ p, sizes = "(min-width: 1024px) 30vw, 80vw", tone = "light", className }: { p: CardProduct; sizes?: string; tone?: "light" | "dark"; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inside, setInside] = useState(false);
  const [hover, setHover] = useState(false);
  const show = inside || hover;

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--x", `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current.style.setProperty("--y", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <article
      className={clsx("group relative", className)}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") { move(e); setHover(true); } }}
      onPointerMove={move}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(false); }}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <div
        ref={ref}
        className="relative aspect-[4/5] overflow-hidden bg-taupe/30 [--x:50%] [--y:55%]"
      >
        {p.main && (
          <Image src={p.main.url} alt={p.main.alt} fill sizes={sizes} quality={75} placeholder={p.main.blur ? "blur" : "empty"} blurDataURL={p.main.blur} className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.03]" />
        )}
        {p.cut && (
          <div
            className="absolute inset-0 transition-[clip-path] duration-[900ms] ease-[var(--ease-luxe)] motion-reduce:transition-none"
            style={{ clipPath: show ? "circle(150% at var(--x) var(--y))" : "circle(0% at var(--x) var(--y))" }}
            aria-hidden={!show}
          >
            <Image src={p.cut.url} alt={p.cut.alt} fill sizes={sizes} quality={75} className="object-cover" loading="lazy" />
          </div>
        )}
        {p.main?.concept && <ConceptBadge className="left-3 top-3" tone={tone === "dark" ? "dark" : "light"} />}
        {p.cut && (
          <button
            type="button"
            onClick={() => setInside((v) => !v)}
            aria-pressed={inside}
            className={clsx(
              "absolute bottom-3 right-3 z-[3] px-3 py-2 text-[0.78rem] backdrop-blur-md transition-colors lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100",
              tone === "dark" ? "bg-chocolate/70 text-ivory" : "bg-cream/85 text-ink"
            )}
          >
            {inside ? "Voir la création" : "Voir l'intérieur"}
          </button>
        )}
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
        {p.fromCents != null && <p className="shrink-0 pt-5 t-small tabular-nums">dès {euros(p.fromCents)}</p>}
      </div>
    </article>
  );
}
