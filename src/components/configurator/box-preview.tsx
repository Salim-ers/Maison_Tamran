"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { clsx } from "clsx";
import { BrandLogo } from "@/components/brand";

export interface FlavorSwatch {
  slug: string;
  name: string;
  coat: string;
  coatLight: string;
  accent: string;
  /** photographie (gros plan du cœur), repli si la pièce détourée manque */
  thumb?: { url: string; blur?: string } | null;
  /** la création détourée, vue de dessus (fond transparent) : c'est elle qui se pose dans l'alvéole */
  piece?: { url: string } | null;
}

/** Photographie du coffret vide, vu de dessus (npm run images:openai : coffret-vide-6, -12, -24). */
export type BoxPhoto = { url: string; w: number; h: number; blur?: string };

/**
 * Centres des alvéoles mesurés sur les photographies des coffrets vides (en % de l'image), et diamètre d'une
 * caissette (en % de la largeur). Ordre de remplissage : ligne par ligne.
 */
export const BOX_GRID: Record<number, { x: number[]; y: number[]; cup: number }> = {
  6: { x: [26.2, 50, 73.7], y: [32.7, 62.9], cup: 22.5 },
  12: { x: [23.3, 41, 58.6, 76.5], y: [25.6, 48.3, 71.3], cup: 17 },
  24: { x: [20, 32.2, 44.1, 55.9, 67.8, 80], y: [24.4, 44.2, 64, 83.5], cup: 12 },
};

/** Légère rotation propre à chaque alvéole : les pièces posées à la main ne sont jamais parfaitement alignées. */
const tilt = (i: number) => ((i * 37) % 11) - 5;

/** Une pièce : la création détourée (ou, à défaut, sa photographie recadrée). */
export function DateThumb({ f, className, shadow = true }: { f: FlavorSwatch; className?: string; shadow?: boolean }) {
  if (f.piece)
    return (
      <span className={clsx("relative block", className)} aria-hidden>
        <Image src={f.piece.url} alt="" fill sizes="(min-width: 1024px) 140px, 90px" quality={80} className={clsx("object-contain", shadow && "drop-shadow-[2px_6px_5px_rgba(20,12,9,.55)]")} />
      </span>
    );
  if (!f.thumb) return <span className={clsx("block rounded-[45%]", className)} style={{ background: `radial-gradient(ellipse at 40% 35%, ${f.coatLight}, ${f.coat})` }} aria-hidden />;
  return (
    <span className={clsx("relative block overflow-hidden rounded-[45%]", className)} aria-hidden>
      <Image src={f.thumb.url} alt="" fill sizes="120px" quality={75} className="scale-[1.35] object-cover" placeholder={f.thumb.blur ? "blur" : "empty"} blurDataURL={f.thumb.blur} />
    </span>
  );
}

/**
 * Aperçu du coffret vu de dessus : la photographie du coffret vide, et chaque création détourée posée dans sa
 * caissette. `slots` contient l'ordre de remplissage (slug par pièce). Toucher une pièce la sélectionne
 * (remplacer ou retirer) ; sans `onSelect`, la toucher la retire.
 */
export function BoxPreview({
  pieces,
  slots,
  flavors,
  photo,
  onRemoveAt,
  onSelect,
  selected = null,
  complete = false,
  priority = false,
  className,
  dark = false,
  incoming,
  landDelay = 0,
}: {
  pieces: number;
  slots: string[];
  flavors: Map<string, FlavorSwatch>;
  photo?: BoxPhoto | null;
  onRemoveAt?: (index: number) => void;
  onSelect?: (index: number) => void;
  selected?: number | null;
  complete?: boolean;
  /** image principale de la page (configurateur) : chargée en priorité */
  priority?: boolean;
  className?: string;
  dark?: boolean;
  /** alvéoles vers lesquelles une datte est en vol : elle n'y apparaît qu'à l'atterrissage */
  incoming?: Set<number>;
  landDelay?: number;
}) {
  const reduce = useReducedMotion();
  const grid = BOX_GRID[pieces];
  const interactive = Boolean(onSelect ?? onRemoveAt);

  const piece = (i: number, f: FlavorSwatch | undefined, slug: string | undefined) => (
    <AnimatePresence>
      {f && (
        <motion.button
          type="button"
          key={`${slug}-${i}`}
          initial={reduce ? false : incoming?.has(i) ? { opacity: 0 } : { scale: 1.3, opacity: 0, y: -24, rotate: tilt(i) - 10 }}
          animate={{ scale: 1, opacity: 1, y: 0, rotate: tilt(i) }}
          exit={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0, y: -12 }}
          transition={incoming?.has(i) ? { duration: 0.01, delay: landDelay } : { type: "spring", stiffness: 380, damping: 24 }}
          onClick={interactive ? () => (onSelect ? onSelect(i) : onRemoveAt?.(i)) : undefined}
          tabIndex={interactive ? 0 : -1}
          disabled={!interactive}
          aria-pressed={onSelect ? selected === i : undefined}
          className="absolute inset-0 grid place-items-center disabled:cursor-default"
          aria-label={onSelect ? `${f.name}, place ${i + 1} : choisir pour remplacer ou retirer` : onRemoveAt ? `Retirer ${f.name} (place ${i + 1})` : f.name}
        >
          <DateThumb f={f} className={clsx("transition-transform duration-500", photo ? "size-[118%]" : "size-full", selected === i && "scale-110")} />
          {/* confirmation : un anneau doré s'ouvre quand la datte se pose */}
          {!reduce && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-[8%] rounded-full ring-2 ring-[#e3c38c]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0.95, 0], scale: [0.9, 1.35] }}
              transition={{ duration: 0.7, ease: "easeOut", delay: incoming?.has(i) ? landDelay : 0.1 }}
            />
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );

  // coffret photographié
  if (photo && grid) {
    return (
      <div className={clsx("relative overflow-hidden shadow-[0_40px_70px_-35px_rgba(36,23,19,.75)]", className)} style={{ aspectRatio: `${photo.w} / ${photo.h}` }}>
        <Image src={photo.url} alt={`Coffret ${pieces} pièces vu de dessus`} fill sizes="(min-width: 1024px) 40vw, 100vw" quality={85} fetchPriority={priority ? "high" : "auto"} loading={priority ? "eager" : "lazy"} placeholder={photo.blur ? "blur" : "empty"} blurDataURL={photo.blur} className="object-cover" />
        {Array.from({ length: pieces }, (_, i) => {
          const slug = slots[i];
          const f = slug ? flavors.get(slug) : undefined;
          const cx = grid.x[i % grid.x.length];
          const cy = grid.y[Math.floor(i / grid.x.length)];
          return (
            <div
              key={i}
              data-slot={i}
              className={clsx("absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-shadow duration-300", selected === i && "shadow-[0_0_0_2px_#e3c38c,0_0_24px_4px_rgba(227,195,140,.45)]")}
              style={{ left: `${cx}%`, top: `${cy}%`, width: `${grid.cup}%`, aspectRatio: "1" }}
            >
              {piece(i, f, slug)}
            </div>
          );
        })}
        {/* coffret complet : un reflet doré traverse les créations */}
        <AnimatePresence>
          {complete && !reduce && (
            <motion.span
              key="sheen"
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_35%,rgba(255,226,170,.42)_50%,transparent_65%)] mix-blend-screen"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: landDelay }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // repli : coffret dessiné (si la photographie du format n'est pas publiée)
  const cols = pieces === 6 ? 3 : pieces === 12 ? 4 : 6;
  return (
    <div className={clsx("relative p-[4%] shadow-[0_30px_60px_-30px_rgba(36,23,19,.6)]", dark ? "bg-chocolate-2" : "bg-chocolate", className)}>
      <div className="pointer-events-none absolute inset-[2.2%] border border-bronze/50" aria-hidden />
      <div className="grid gap-[2.5%]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: pieces }, (_, i) => {
          const slug = slots[i];
          const f = slug ? flavors.get(slug) : undefined;
          return (
            <div key={i} data-slot={i} className="relative aspect-[1.7/1] rounded-[45%] bg-[radial-gradient(ellipse_at_50%_45%,#140d0b_0%,#2a1f1b_75%)] shadow-[inset_0_2px_6px_rgba(0,0,0,.6)]">
              {piece(i, f, slug)}
            </div>
          );
        })}
      </div>
      <BrandLogo variant="mark" tone="light" height={48} alt="" className="pointer-events-none absolute -bottom-[1px] left-1/2 h-[9%] -translate-x-1/2 translate-y-1/2" />
    </div>
  );
}
