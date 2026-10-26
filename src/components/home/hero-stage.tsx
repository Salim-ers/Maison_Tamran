"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/motion/reduced-motion";

export type HeroProp = { key: string; url: string; x: number; y: number; w: number; depth: number; rotate: number; mobile?: boolean; natW: number; natH: number };

function Prop({ p, i, px, py }: { p: HeroProp; i: number; px: MotionValue<number>; py: MotionValue<number> }) {
  const x = useTransform(px, (v) => v * p.depth * 16);
  const y = useTransform(py, (v) => v * p.depth * 12);
  return (
    <motion.div
      aria-hidden
      style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, x, y, zIndex: p.depth < 0 ? 0 : 3 }}
      className={p.mobile ? "absolute" : "absolute max-md:hidden"}
    >
      <div className="anim-prop-in" style={{ animationDelay: `${1.25 + i * 0.09}s`, ["--r" as string]: `${p.rotate}deg` }}>
        <Image
          src={p.url}
          alt=""
          width={p.natW}
          height={p.natH}
          sizes={`(max-width: 767px) ${Math.round(p.w * 0.9)}vw, ${Math.round(p.w * 0.46)}vw`}
          quality={75}
          className="block h-auto w-full drop-shadow-[0_14px_14px_rgba(0,0,0,.55)]"
          style={{ transform: `rotate(${p.rotate}deg)` }}
          draggable={false}
        />
      </div>
    </motion.div>
  );
}

/**
 * Scène du hero : profondeur et interaction.
 * - Pointeur (ordinateur) : le coffret pivote de quelques degrés, les ingrédients glissent selon leur plan,
 *   une lumière douce suit la souris.
 * - Défilement : le coffret s'éloigne, le texte remonte et s'efface.
 * Rien n'est masqué par ce composant : il ne déplace que des éléments déjà visibles (entrée en CSS).
 */
export function HeroStage({
  backdrop,
  arch,
  product,
  props,
  content,
}: {
  backdrop: React.ReactNode;
  arch: React.ReactNode;
  product: React.ReactNode;
  props: HeroProp[];
  content: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const productY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "16%"]);
  const productScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.9]);
  const archY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "8%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, reduce ? 1 : 0]);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 50, damping: 18 });
  const sy = useSpring(py, { stiffness: 50, damping: 18 });
  const rotateY = useTransform(sx, (v) => v * 6);
  const rotateX = useTransform(sy, (v) => v * -4);
  const lx = useTransform(sx, (v) => 62 + v * 18);
  const ly = useTransform(sy, (v) => 42 + v * 16);
  const light = useMotionTemplate`radial-gradient(38rem circle at ${lx}% ${ly}%, rgba(255,198,128,.14), transparent 62%)`;

  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, px, py]);

  return (
    <div ref={ref} className="relative min-h-[100svh]">
      {backdrop}
      <motion.div aria-hidden style={{ background: light }} className="pointer-events-none absolute inset-0 max-md:hidden" />
      <div className="container-luxe relative grid min-h-[100svh] max-w-[124rem] items-center gap-y-8 pb-[clamp(3.5rem,9vh,6rem)] pt-[calc(var(--header-h)+var(--banner-h,0px)+1.5rem)] md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-[clamp(2rem,4vw,5rem)] md:pt-[calc(var(--header-h)+var(--banner-h,0px)+2rem)]">
        <motion.div style={{ y: contentY, opacity: contentOpacity }} className="order-2 md:order-1">
          {content}
        </motion.div>
        <div className="relative order-1 justify-self-center md:order-2 md:justify-self-end [perspective:1400px]">
          <motion.div style={{ y: archY }} className="pointer-events-none absolute inset-0">
            {arch}
          </motion.div>
          <motion.div style={{ y: productY, scale: productScale }} className="relative">
            <motion.div style={{ rotateX, rotateY }} className="hero-coffret relative [transform-style:preserve-3d]">
              {props.map((p, i) => (p.depth < 0 ? <Prop key={p.key} p={p} i={i} px={sx} py={sy} /> : null))}
              <div className="relative z-[1]">{product}</div>
              {props.map((p, i) => (p.depth >= 0 ? <Prop key={p.key} p={p} i={i} px={sx} py={sy} /> : null))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
