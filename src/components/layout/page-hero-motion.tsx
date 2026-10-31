"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useReducedMotion } from "@/components/motion/reduced-motion";

/** Mouvement de l'ouverture des pages : léger recul à l'apparition, parallaxe et assombrissement au défilement. */
export function PageHeroMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08]);
  return (
    <div ref={ref} className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div style={{ y, scale }} className="anim-hero-settle absolute inset-0">
        {children}
      </motion.div>
    </div>
  );
}
