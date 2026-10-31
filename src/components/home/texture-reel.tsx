"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/motion/reduced-motion";

export type TextureItem = { slug: string; name: string; coeur: string; accent: string; collection: string; image: { url: string; alt: string; blur?: string } };

function Panel({ t, i, n, p }: { t: TextureItem; i: number; n: number; p: MotionValue<number> }) {
  // chaque macro se resserre légèrement quand elle passe au centre de l'écran
  const c = (i + 0.5) / n;
  const scale = useTransform(p, [c - 0.35, c, c + 0.35], [1.18, 1, 1.12]);
  const line = useTransform(p, [c - 0.2, c - 0.05], [0, 1]);
  return (
    <li className="texture-panel shrink-0">
      <Link href={`/creations/${t.slug}`} className="group block focus-visible:outline-offset-4">
        <div className="relative aspect-square overflow-hidden bg-chocolate">
          <motion.div style={{ scale }} className="absolute inset-0">
            <Image src={t.image.url} alt={t.image.alt} fill sizes="(max-width: 767px) 78vw, 56vh" quality={82} placeholder={t.image.blur ? "blur" : "empty"} blurDataURL={t.image.blur} className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.06]" />
          </motion.div>
          <span className="absolute left-4 top-4 font-display text-sm italic text-ivory/80">{String(i + 1).padStart(2, "0")}</span>
        </div>
        <motion.span aria-hidden style={{ scaleX: line, background: t.accent }} className="mt-5 block h-px w-full origin-left" />
        <p className="mt-4 t-micro tracking-[0.16em] text-gold/80">{t.collection === "ephemere" ? "ÉDITION ÉPHÉMÈRE" : "SIGNATURE"}</p>
        <p className="mt-1 font-display text-[clamp(1.6rem,2.4vw,2.3rem)] leading-tight">{t.name}</p>
        <p className="mt-1 t-small text-ivory/65">Au cœur : {t.coeur.charAt(0).toLowerCase() + t.coeur.slice(1)}</p>
      </Link>
    </li>
  );
}

/**
 * Au cœur de chaque datte : section épinglée qui fait défiler latéralement les dix garnitures en macrophotographie,
 * au rythme du défilement vertical. Avec « réduire les animations » : une rangée qui se fait défiler au doigt.
 */
export function TextureReel({ items }: { items: TextureItem[] }) {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.0005 });
  const x = useTransform(p, (v) => -v * distance);

  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const intro = (
    <li className="texture-intro shrink-0 self-center pr-[6vw]">
      <p className="t-eyebrow text-gold">Les garnitures</p>
      <h2 id="textures-title" className="section-title mt-4">
        Au cœur
        <br />
        de chaque datte,
        <br />
        <em className="text-gold">une création.</em>
      </h2>
      <p className="mt-6 max-w-[24rem] text-ivory/70">Praliné, ganache, confit, crème de pistache : dix cœurs, dix textures, sous une coque de chocolat.</p>
      <p className="mt-8 t-micro text-ivory/65">Visuels conceptuels · IA</p>
    </li>
  );

  if (reduce) {
    return (
      <section className="on-dark section-pad" aria-labelledby="textures-title">
        <ul className="no-scrollbar flex snap-x gap-[4vw] overflow-x-auto px-[var(--gutter)]">
          {intro}
          {items.map((t, i) => (
            <Panel key={t.slug} t={t} i={i} n={items.length} p={scrollYProgress} />
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative bg-[#120a07] text-ivory" style={{ height: `calc(100svh + ${distance}px)` }} aria-labelledby="textures-title">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div aria-hidden className="grain absolute inset-0" />
        <motion.ul ref={track} style={{ x }} className="relative flex items-end gap-[4vw] px-[var(--gutter)] will-change-transform">
          {intro}
          {items.map((t, i) => (
            <Panel key={t.slug} t={t} i={i} n={items.length} p={p} />
          ))}
        </motion.ul>
        <motion.span aria-hidden style={{ scaleX: p }} className="absolute bottom-8 left-[var(--gutter)] right-[var(--gutter)] h-px origin-left bg-gold/50" />
      </div>
    </section>
  );
}
