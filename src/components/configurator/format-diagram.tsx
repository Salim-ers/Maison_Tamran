"use client";

import Image from "next/image";
import { animate, motion, useInView, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { clsx } from "clsx";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { BrandLogo } from "@/components/brand";

/**
 * Schéma vu de dessus d'un format de coffret (alvéoles). C'est une illustration du format, distincte de
 * toute photographie de produit. `fill` (0 → 1) remplit les alvéoles une à une.
 */
export function FormatDiagram({ pieces, thumbs, className, fill }: { pieces: number; thumbs: string[]; className?: string; fill?: MotionValue<number> }) {
  const cols = pieces <= 6 ? 3 : pieces <= 12 ? 4 : 6;
  // sans pilotage par le défilement : les alvéoles se remplissent une fois, à l'apparition du schéma
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const own = useMotionValue(fill || reduce ? 1 : 0);
  useEffect(() => {
    if (fill || reduce || !inView) return;
    const c = animate(own, 1, { duration: 1.4, ease: [0.22, 0.8, 0.12, 1] });
    return () => c.stop();
  }, [fill, reduce, inView, own]);
  return (
    <div ref={ref} className={clsx("relative bg-chocolate p-[5%] shadow-[0_24px_50px_-28px_rgba(0,0,0,.8)]", className)}>
      <div className="pointer-events-none absolute inset-[2.5%] border border-gold/40" aria-hidden />
      <div className="grid gap-[3%]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: pieces }, (_, i) => (
          <Slot key={i} i={i} pieces={pieces} thumb={thumbs.length ? thumbs[i % thumbs.length] : null} fill={fill ?? own} />
        ))}
      </div>
      <BrandLogo variant="mark" tone="light" height={40} alt="" className="pointer-events-none absolute bottom-0 left-1/2 h-[10%] -translate-x-1/2 translate-y-1/2" />
    </div>
  );
}

function Slot({ i, pieces, thumb, fill }: { i: number; pieces: number; thumb: string | null; fill: MotionValue<number> }) {
  const a = i / pieces;
  const v = useTransform(fill, [a * 0.9, a * 0.9 + 0.12], [0, 1]);
  const scale = useTransform(v, [0, 1], [0.55, 1]);
  const y = useTransform(v, [0, 1], [-8, 0]);
  return (
    <span className="relative block aspect-[1.6/1] overflow-hidden rounded-[45%] bg-[#140d0b] shadow-[inset_0_2px_5px_rgba(0,0,0,.6)]">
      {thumb && (
        <motion.span style={{ opacity: v, scale, y }} className="absolute inset-[5%] block overflow-hidden rounded-[45%]">
          <Image src={thumb} alt="" fill sizes="(min-width: 768px) 128px, 96px" quality={75} className="scale-[1.35] object-cover" />
        </motion.span>
      )}
    </span>
  );
}
