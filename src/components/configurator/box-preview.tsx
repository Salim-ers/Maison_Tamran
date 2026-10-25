"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { clsx } from "clsx";
import { Monogram } from "@/components/brand";

export interface FlavorSwatch {
  slug: string;
  name: string;
  coat: string;
  coatLight: string;
  accent: string;
}

/** Datte stylisée (vectorielle, légère) pour l'aperçu du coffret. */
export function DatePill({ f, className }: { f: FlavorSwatch; className?: string }) {
  const id = `g-${f.slug}`;
  return (
    <svg viewBox="0 0 120 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={f.coatLight} />
          <stop offset=".55" stopColor={f.coat} />
          <stop offset="1" stopColor={f.coat} stopOpacity=".85" />
        </linearGradient>
      </defs>
      <path d="M6 33C5 17 26 7 56 6c30-1 54 8 58 25 3 15-20 26-56 27C24 59 7 49 6 33Z" fill={`url(#${id})`} />
      <path d="M86 9c14 3 26 11 28 22 2 12-12 21-34 25 8-9 12-17 12-27 0-8-2-14-6-20Z" fill="#4A200D" opacity=".9" />
      <path d="M22 20c14-7 40-9 58-6" stroke="#fff" strokeOpacity=".35" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M20 30c12 4 26-6 38 0s24-4 30 0" stroke={f.accent} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".9" />
    </svg>
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
    <div className={clsx("relative p-[4%] shadow-[0_30px_60px_-30px_rgba(37,28,26,.6)]", dark ? "bg-[#2E231F]" : "bg-chocolate", className)}>
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
                    initial={reduce ? false : { scale: 0.4, opacity: 0, y: -18 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { scale: 0.5, opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 380, damping: 24 }}
                    onClick={onRemoveAt ? () => onRemoveAt(i) : undefined}
                    tabIndex={onRemoveAt ? 0 : -1}
                    disabled={!onRemoveAt}
                    className="absolute inset-[6%] grid place-items-center disabled:cursor-default"
                    aria-label={onRemoveAt ? `Retirer ${f.name} (place ${i + 1})` : f.name}
                  >
                    <DatePill f={f} className="h-full w-full drop-shadow-[0_3px_3px_rgba(0,0,0,.5)]" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <Monogram className="pointer-events-none absolute -bottom-[1px] left-1/2 h-[7%] w-auto -translate-x-1/2 translate-y-1/2 text-bronze-light" title={null} />
    </div>
  );
}
