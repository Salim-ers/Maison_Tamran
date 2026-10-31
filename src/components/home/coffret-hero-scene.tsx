"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { useReducedMotion } from "@/components/motion/reduced-motion";

export type HeroPhoto = { url: string; w: number; h: number; blur: string; alt: string };

/**
 * Géométrie mesurée sur les originaux 3840 × 2160 (en % de l'image) : silhouette du coffret fermé
 * (couvercle et flancs) et centre du coffret, point de visée du rapprochement.
 */
const LID: [number, number][] = [[59, 13.7], [91.8, 32.9], [91.6, 39.2], [82.1, 85.4], [49.3, 63.3], [48.4, 57.9]];
const LID_CLIP = `polygon(${LID.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
// le reste de la photo fermée (tout sauf le couvercle) : masque SVG à trou (règle evenodd)
const REST_MASK = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path fill-rule='evenodd' d='M0 0H100V100H0Z M${LID.map(([x, y]) => `${x} ${y}`).join(" L")}Z'/></svg>`
)}")`;

function Line({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="-mb-[0.1em] -mt-[0.18em] block overflow-hidden pb-[0.1em] pt-[0.18em]">
      <span className="anim-rise block" style={{ animationDelay: `calc(var(--intro, 0s) + ${delay}s)` }}>
        {children}
      </span>
    </span>
  );
}

function Chapter({ p, range, children, className }: { p: MotionValue<number>; range: [number, number, number, number]; children: React.ReactNode; className?: string }) {
  const opacity = useTransform(p, range, [0, 1, 1, 0]);
  const y = useTransform(p, [range[0], range[1]], [28, 0]);
  return (
    <motion.div style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Le hero de l'accueil, en une seule prise de vue :
 *  1. au chargement, la lumière se lève sur la table (le coffret porte le logo officiel en marquage cuivré) ;
 *  2. au défilement, le couvercle se soulève et s'efface : les douze créations apparaissent dans la même
 *     photographie (les deux originaux partagent exactement le même cadrage) ;
 *  3. la caméra se rapproche du coffret, un second titre invite à composer le sien.
 * Section épinglée (CSS sticky), animée uniquement en transform / opacity. Avec « réduire les animations » :
 * une seule image fixe, sans épinglage.
 */
export function CoffretHeroScene({
  closed,
  open,
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
}: {
  closed: HeroPhoto;
  open: HeroPhoto;
  title: [string, string, string];
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
}) {
  const track = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: track, offset: ["start start", "end end"] });

  // 2. le couvercle : se soulève (vers le haut, vers l'objectif), pivote légèrement et quitte le cadre
  const lidY = useTransform(p, [0.05, 0.4], ["0%", "-105%"]);
  const lidX = useTransform(p, [0.05, 0.4], ["0%", "9%"]);
  const lidRotate = useTransform(p, [0.05, 0.4], [0, -8]);
  const lidScale = useTransform(p, [0.05, 0.4], [1, 1.16]);
  const lidOpacity = useTransform(p, [0.34, 0.4], [1, 0]);
  const lidShadow = useTransform(p, [0.05, 0.3], ["drop-shadow(0px 0px 0px rgba(24,14,10,0))", "drop-shadow(-30px 60px 40px rgba(24,14,10,.45))"]);
  const restOpacity = useTransform(p, [0.08, 0.3], [1, 0]);
  // 3. la caméra s'approche du coffret ouvert
  const camScale = useTransform(p, [0.36, 1], [1, 1.7]);
  const textOpacity = useTransform(p, [0.1, 0.26], [1, 0]);
  const textY = useTransform(p, [0.1, 0.26], [0, -48]);
  const cue = useTransform(p, [0, 0.06], [1, 0]);
  const bar = useTransform(p, [0, 1], [0, 1]);

  const sizes = "(max-aspect-ratio: 1/1) 210vw, max(100vw, 178vh)";

  return (
    <section ref={track} aria-labelledby="hero-title" className={reduce ? "relative" : "relative h-[250svh]"}>
      <div className="hero-viewport sticky top-0 h-[100svh] overflow-hidden">
        {/* une seule prise de vue : photo ouverte au fond, photo fermée par-dessus (le couvercle à part) */}
        <motion.div className="hero-frame anim-sunrise" style={reduce ? undefined : { scale: camScale }}>
          <Image src={open.url} alt={open.alt} fill sizes={sizes} quality={85} placeholder="blur" blurDataURL={open.blur} className="object-cover" fetchPriority="low" />
          <motion.div aria-hidden className="absolute inset-0" style={reduce ? undefined : { opacity: restOpacity, WebkitMaskImage: REST_MASK, maskImage: REST_MASK, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}>
            <Image src={closed.url} alt="" fill sizes={sizes} quality={85} preload fetchPriority="high" placeholder="blur" blurDataURL={closed.blur} className="object-cover" />
          </motion.div>
          <motion.div
            className="absolute inset-0 origin-[70%_48%] will-change-transform"
            style={reduce ? { clipPath: LID_CLIP } : { clipPath: LID_CLIP, y: lidY, x: lidX, rotate: lidRotate, scale: lidScale, opacity: lidOpacity, filter: lidShadow }}
          >
            <Image src={closed.url} alt={closed.alt} fill sizes={sizes} quality={85} className="object-cover" />
          </motion.div>
          {/* lumière d'or qui dérive lentement sur la table */}
          <div aria-hidden className="hero-sun pointer-events-none absolute inset-0" />
        </motion.div>
        {/* lisibilité du titre : les ombres chaudes de la table s'approfondissent à gauche ; sous l'image sur mobile */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hero-shade" />

        <motion.div style={reduce ? undefined : { opacity: textOpacity, y: textY }} className="hero-copy container-luxe relative z-[2] flex h-full max-w-[124rem] flex-col justify-center">
          <div className="max-w-[38rem] text-ivory">
            <p className="anim-fade-up t-eyebrow text-gold max-md:hidden" style={{ animationDelay: "calc(var(--intro, 0s) + .9s)" }}>
              Maison Tamrān <span className="mx-2 text-gold/60">·</span> Dattes gastronomiques
            </p>
            <h1 id="hero-title" className="hero-title mt-5 font-display md:mt-7">
              <span className="sr-only">MAISON TAMRĀN : </span>
              <Line delay={1}>{title[0]}</Line>
              <Line delay={1.14}>
                <span className="text-gold-sheen italic">{title[1]}</span>
              </Line>
              <Line delay={1.28}>{title[2]}</Line>
            </h1>
            <p className="anim-fade-up mt-4 max-w-[30rem] text-[0.95rem] leading-relaxed text-ivory/85 md:mt-8 md:text-[1.12rem]" style={{ animationDelay: "calc(var(--intro, 0s) + 1.6s)" }}>
              {subtitle}
            </p>
            <div className="anim-fade-up mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-10 md:gap-3" style={{ animationDelay: "calc(var(--intro, 0s) + 1.8s)" }}>
              <Link href="/creations" className="btn btn-gold group">
                {ctaPrimary}
                <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </Link>
              {/* sur mobile, le second appel devient un lien : le coffret garde toute la place */}
              <Link href="/composer-mon-coffret" className="btn btn-outline-light max-md:min-h-0 max-md:border-0 max-md:p-0 max-md:link-draw max-md:hover:bg-transparent max-md:hover:text-ivory">
                {ctaSecondary}
              </Link>
            </div>
          </div>
        </motion.div>

        {!reduce && (
          <>
            <Chapter p={p} range={[0.5, 0.62, 0.9, 0.99]} className="hero-chapter pointer-events-none absolute z-[2] text-ivory">
              <p className="t-eyebrow text-gold">Le coffret Signature</p>
              <p className="mt-3 font-display text-[clamp(2.2rem,4.4vw,4.4rem)] leading-[1] tracking-[-0.02em]">
                Douze créations,
                <br />
                <span className="italic text-gold">une seule boîte.</span>
              </p>
              <Link href="/composer-mon-coffret" className="pointer-events-auto mt-6 inline-block link-draw t-small">
                Composer le vôtre
              </Link>
            </Chapter>
            <motion.a style={{ opacity: cue }} href="#oasis" className="anim-fade-up absolute bottom-6 left-1/2 z-[3] hidden -translate-x-1/2 flex-col items-center gap-3 t-micro text-ivory/75 [animation-delay:calc(var(--intro,0s)+2.2s)] hover:text-ivory md:flex">
              Ouvrir le coffret
              <span aria-hidden className="relative block h-12 w-px overflow-hidden bg-ivory/20">
                <span className="anim-scroll-cue absolute inset-0 bg-gold" />
              </span>
            </motion.a>
            <motion.span aria-hidden style={{ scaleY: bar }} className="absolute left-[calc(var(--gutter)/2)] top-1/2 z-[3] h-24 w-px origin-top -translate-y-1/2 bg-gold/70 max-md:hidden" />
          </>
        )}
        <p className="absolute bottom-3 right-4 z-[3] t-micro text-ivory/55 max-md:hidden">Visuel conceptuel · IA</p>
      </div>
    </section>
  );
}
