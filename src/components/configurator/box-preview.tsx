"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { clsx } from "clsx";
import { BrandLogo } from "@/components/brand";

export interface FlavorSwatch {
  slug: string;
  name: string;
  coat: string;
  coatLight: string;
  accent: string;
  /** photographie (gros plan du cœur) utilisée dans les alvéoles */
  thumb?: { url: string; blur?: string } | null;
}

/** Une pièce dans son alvéole : la photographie de la recette, cadrée sur la datte. */
export function DateThumb({ f, className }: { f: FlavorSwatch; className?: string }) {
  if (!f.thumb) return <span className={clsx("block rounded-[45%]", className)} style={{ background: `radial-gradient(ellipse at 40% 35%, ${f.coatLight}, ${f.coat})` }} aria-hidden />;
  return (
    <span className={clsx("relative block overflow-hidden rounded-[45%]", className)} aria-hidden>
      <Image src={f.thumb.url} alt="" fill sizes="120px" quality={75} className="scale-[1.35] object-cover" placeholder={f.thumb.blur ? "blur" : "empty"} blurDataURL={f.thumb.blur} />
    </span>
  );
}

/**
 * Aperçu vu de dessus d'un coffret : une alvéole par pièce.
 * `slots` contient l'ordre de remplissage (slug par pièce).
 */
export function BoxPreview({ pieces, slots, flavors, onRemoveAt, className, dark = false }: { pieces: number; slots: string[]; flavors: Map<string, FlavorSwatch>; onRemoveAt?: (index: number) => void; className?: string; dark?: boolean }) {
  const reduce = useReducedMotion();
  const cols = pieces === 6 ? 3 : pieces === 12 ? 4 : 6;
  return (
    <div className={clsx("relative p-[4%] shadow-[0_30px_60px_-30px_rgba(36,23,19,.6)]", dark ? "bg-chocolate-2" : "bg-chocolate", className)}>
      <div className="pointer-events-none absolute inset-[2.2%] border border-bronze/50" aria-hidden />
      <div className="grid gap-[2.5%]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: pieces }, (_, i) => {
          const slug = slots[i];
          const f = slug ? flavors.get(slug) : undefined;
          return (
            <div key={i} className="relative aspect-[1.7/1] rounded-[45%] bg-[radial-gradient(ellipse_at_50%_45%,#140d0b_0%,#2a1f1b_75%)] shadow-[inset_0_2px_6px_rgba(0,0,0,.6)]">
              <AnimatePresence>
                {f && (
                  <motion.button
                    type="button"
                    key={`${slug}-${i}`}
                    initial={reduce ? false : { scale: 1.25, opacity: 0, y: -26, rotate: -8 }}
                    animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                    exit={reduce ? { opacity: 0 } : { scale: 0.5, opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 380, damping: 24 }}
                    onClick={onRemoveAt ? () => onRemoveAt(i) : undefined}
                    tabIndex={onRemoveAt ? 0 : -1}
                    disabled={!onRemoveAt}
                    className="absolute inset-[6%] grid place-items-center disabled:cursor-default"
                    aria-label={onRemoveAt ? `Retirer ${f.name} (place ${i + 1})` : f.name}
                  >
                    <DateThumb f={f} className="size-full shadow-[0_4px_10px_rgba(0,0,0,.55)] ring-1 ring-[#c7a06a]/30" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <BrandLogo variant="mark" tone="light" height={48} alt="" className="pointer-events-none absolute -bottom-[1px] left-1/2 h-[9%] -translate-x-1/2 translate-y-1/2" />
    </div>
  );
}
