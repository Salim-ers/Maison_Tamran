"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { useRef } from "react";
import { clsx } from "clsx";

const EASE = [0.22, 0.8, 0.12, 1] as const;

/** Révélation d'image par masque (rideau qui s'ouvre) à l'entrée dans le viewport, avec léger parallax. */
export function RevealImage({ children, className, from = "bottom", parallax = 8 }: { children: React.ReactNode; className?: string; from?: "bottom" | "left" | "right"; parallax?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-parallax}%`, `${parallax}%`]);
  const initial = from === "bottom" ? "inset(100% 0% 0% 0%)" : from === "left" ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)";
  return (
    <motion.div
      ref={ref}
      className={clsx("relative overflow-hidden", className)}
      initial={reduce ? false : { clipPath: initial }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 1.4, ease: EASE }}
    >
      <motion.div style={reduce ? { y: 0, scale: 1 } : { y, scale: 1 + parallax / 50 }} className="absolute inset-0">
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Titre révélé ligne par ligne (masque). L'observation se fait sur le titre entier : une ligne
 * décalée hors de son masque n'est jamais « visible » pour l'IntersectionObserver.
 */
export function RevealLines({ lines, as = "h2", className, delay = 0, id }: { lines: string[]; as?: "h1" | "h2" | "h3" | "p"; className?: string; delay?: number; id?: string }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag id={id} className={className} initial={reduce ? false : "hidden"} whileInView="show" viewport={{ once: true, margin: "-10% 0px" }}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className="block"
            variants={{ hidden: { y: "105%" }, show: { y: "0%", transition: { duration: 1.1, delay: delay + i * 0.1, ease: EASE } } }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Apparition douce, réservée aux blocs qui le justifient. */
export function FadeIn({ children, className, delay = 0, y = 18 }: { children: React.ReactNode; className?: string; delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
