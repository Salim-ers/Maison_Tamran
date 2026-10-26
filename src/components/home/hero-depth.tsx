"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { useEffect, useRef } from "react";

/**
 * Profondeur du hero : au défilement, le visuel s'éloigne doucement et le texte remonte ;
 * sur ordinateur, le coffret suit très légèrement le pointeur (quelques pixels).
 * Rien n'est masqué par ce composant : il ne fait que déplacer des éléments déjà visibles.
 */
export function HeroDepth({ media, content }: { media: React.ReactNode; content: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "14%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-22%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 20 });
  const sy = useSpring(py, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth - 0.5) * -14);
      py.set((e.clientY / window.innerHeight - 0.5) * -10);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, px, py]);

  return (
    <div ref={ref} className="relative min-h-[100svh]">
      <motion.div style={{ y: mediaY, scale: mediaScale }} className="absolute inset-0 origin-[60%_40%]">
        <motion.div style={{ x: sx, y: sy }} className="absolute -inset-4">
          {media}
        </motion.div>
      </motion.div>
      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative">
        {content}
      </motion.div>
    </div>
  );
}
