"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { clsx } from "clsx";
import type { AmbianceImage } from "@/lib/ambiance";

export interface IngredientTile {
  key: string;
  label: string;
  image: AmbianceImage;
  recipes: { slug: string; name: string }[];
}

// Composition « nature morte » : tailles et profondeurs différentes (vitesse de défilement propre à chaque tuile).
const LAYOUT = [
  { span: "lg:col-span-5 lg:row-span-2", ratio: "aspect-[4/5]", depth: -60 },
  { span: "lg:col-span-4", ratio: "aspect-[4/3]", depth: 40 },
  { span: "lg:col-span-3 lg:mt-24", ratio: "aspect-[3/4]", depth: -20 },
  { span: "lg:col-span-3", ratio: "aspect-square", depth: 70 },
  { span: "lg:col-span-4 lg:-mt-10", ratio: "aspect-[4/3]", depth: -40 },
  { span: "lg:col-span-4", ratio: "aspect-[3/4]", depth: 30 },
  { span: "lg:col-span-4 lg:mt-16", ratio: "aspect-square", depth: -50 },
  { span: "lg:col-span-4", ratio: "aspect-[4/3]", depth: 50 },
  { span: "lg:col-span-3", ratio: "aspect-[3/4]", depth: -30 },
  { span: "lg:col-span-5 lg:-mt-12", ratio: "aspect-[16/10]", depth: 20 },
];

function Tile({ t, i, progress }: { t: IngredientTile; i: number; progress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const reduce = useReducedMotion();
  const l = LAYOUT[i % LAYOUT.length];
  const y = useTransform(progress, [0, 1], [reduce ? 0 : l.depth, reduce ? 0 : -l.depth]);
  return (
    <motion.li
      style={{ y }}
      className={clsx("group relative col-span-1", l.span)}
      initial={reduce ? false : { opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-6% 0px" }}
      transition={{ duration: 1.1, delay: (i % 4) * 0.08, ease: [0.22, 0.8, 0.12, 1] }}
    >
      <div className={clsx("relative overflow-hidden bg-sand/50", l.ratio)}>
        <Image
          src={t.image.url}
          alt={t.image.alt}
          fill
          sizes="(min-width: 1024px) 34vw, 50vw"
          quality={75}
          placeholder={t.image.blur ? "blur" : "empty"}
          blurDataURL={t.image.blur}
          className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-luxe)] group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(36,23,19,.78)_0%,rgba(36,23,19,0)_55%)] opacity-90 transition-opacity duration-700 lg:opacity-60 lg:group-hover:opacity-95" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-ivory lg:p-5">
          <p className="font-display text-xl leading-none lg:text-2xl">{t.label}</p>
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 transition-[opacity,transform] duration-500 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
            {t.recipes.map((r) => (
              <li key={r.slug}>
                <Link href={`/creations/${r.slug}`} className="relative z-[2] t-micro tracking-[0.06em] text-gold underline-offset-4 hover:underline">
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <a href={t.image.page} target="_blank" rel="noopener noreferrer" className="absolute right-2 top-2 hidden bg-chocolate/50 px-1.5 py-0.5 text-[0.62rem] text-ivory/80 group-hover:block">
          {t.image.credit}
        </a>
      </div>
    </motion.li>
  );
}

/** L'univers des ingrédients : chaque ingrédient est relié aux recettes réelles du catalogue qui l'emploient. */
export function Ingredients({ tiles }: { tiles: IngredientTile[] }) {
  return tiles.length ? <IngredientsCollage tiles={tiles} /> : null;
}

function IngredientsCollage({ tiles }: { tiles: IngredientTile[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  return (
    <section ref={ref} className="relative overflow-hidden bg-creme section-pad" aria-labelledby="ingredients-title">
      <div className="container-luxe">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="t-eyebrow text-bronze">Les matières</p>
            <h2 id="ingredients-title" className="mt-4 t-display-l max-w-[14ch]">L&apos;univers des ingrédients</h2>
          </div>
          <p className="max-w-[44ch] text-ink-soft lg:col-span-5">
            Pistache, safran, cardamome, framboise, rose… Chaque ingrédient a sa place dans une recette précise. Survolez une matière pour retrouver les créations qui l&apos;accueillent.
          </p>
        </div>
        <ul className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-12 lg:gap-6">
          {tiles.map((t, i) => (
            <Tile key={t.key} t={t} i={i} progress={scrollYProgress} />
          ))}
        </ul>
        <p className="mt-10 t-micro text-ink-soft">Photographies d&apos;ambiance libres de droits (licence Unsplash) : elles illustrent les ingrédients, pas nos créations.</p>
      </div>
    </section>
  );
}
