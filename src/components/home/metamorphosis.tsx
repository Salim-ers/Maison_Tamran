"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { span } from "@/components/motion/scroll";

type Photo = { url: string; w: number; h: number; alt: string; credit?: string; blur?: string; focus?: string };
export type MetaStep = { key: string; title: string; text: string; photo: Photo | null };
export type MetaCreation = { slug: string; name: string; url: string; w: number; h: number };

/** Fenêtres de défilement (fractions de la section) : apparition de chaque étape. */
const AT = { datte: [0.1, 0.28], coeur: [0.34, 0.5], chocolat: [0.56, 0.72], creation: [0.78, 0.92] } as const;
/** Étape active (pour le texte) selon la progression. */
const TEXT_WINDOWS: [number, number][] = [
  [0, 0.19],
  [0.19, 0.42],
  [0.42, 0.64],
  [0.64, 0.85],
  [0.85, 1.01],
];

function Full({ photo, priority, sizes = "100vw" }: { photo: Photo; priority?: boolean; sizes?: string }) {
  return (
    <>
      <Image
        src={photo.url}
        alt={photo.alt}
        fill
        sizes={sizes}
        quality={75}
        preload={priority}
        placeholder={photo.blur ? "blur" : "empty"}
        blurDataURL={photo.blur}
        className="object-cover"
        style={{ objectPosition: photo.focus }}
      />
      {photo.credit && <span className="absolute bottom-3 right-4 z-[1] t-micro text-ivory/75 [text-shadow:0_1px_2px_rgba(0,0,0,.6)]">{photo.credit}</span>}
    </>
  );
}

/** Une création dans sa niche en arc : vignette affichée en petit, à sa définition réelle (≈ 412 px). */
function Niche({ c, i, p }: { c: MetaCreation; i: number; p: MotionValue<number> }) {
  const a = AT.creation[0] + 0.02 + i * 0.011;
  const y = useTransform(p, span(a, a + 0.06), ["36px", "0px"]);
  const opacity = useTransform(p, span(a, a + 0.05), [0, 1]);
  return (
    <motion.li style={{ y, opacity }} className="group relative">
      <Link href={`/creations/${c.slug}`} className="block" tabIndex={-1}>
        <span className="relative block aspect-[412/495] overflow-hidden rounded-t-[50%_38%] ring-1 ring-gold/35">
          <Image src={c.url} alt={c.name} fill sizes="(max-width: 767px) 18vw, 132px" quality={85} className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        </span>
        <span className="mt-2 block truncate text-center text-[0.68rem] tracking-[0.06em] text-ivory/70 max-md:hidden">{c.name}</span>
      </Link>
    </motion.li>
  );
}

function StepText({ step, i, p }: { step: MetaStep; i: number; p: MotionValue<number> }) {
  const [a, b] = TEXT_WINDOWS[i];
  const last = i === TEXT_WINDOWS.length - 1;
  const opacity = useTransform(p, span(a - 0.02, a + 0.03, b - 0.04, b), [i === 0 ? 1 : 0, 1, 1, last ? 1 : 0]);
  const y = useTransform(p, span(a - 0.02, a + 0.04, b - 0.04, b), [i === 0 ? "0px" : "40px", "0px", "0px", last ? "0px" : "-30px"]);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 bottom-0 md:bottom-auto md:top-0">
      <p className="t-numeral text-[clamp(1.4rem,2vw,1.9rem)] text-gold">{String(i + 1).padStart(2, "0")}</p>
      <h3 className="meta-title mt-1">{step.title}</h3>
      <p className="mt-4 max-w-[26rem] text-[1.02rem] leading-relaxed text-ivory/85 md:text-lg">{step.text}</p>
    </motion.div>
  );
}

function Rail({ p, count }: { p: MotionValue<number>; count: number }) {
  const h = useTransform(p, [0, 0.92], ["0%", "100%"]);
  return (
    <div aria-hidden className="absolute left-[var(--gutter)] top-1/2 hidden h-[40vh] -translate-y-1/2 md:block">
      <div className="relative h-full w-px bg-ivory/20">
        <motion.div style={{ height: h }} className="absolute inset-x-0 top-0 bg-gold" />
      </div>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="absolute -left-[3px] size-[7px] rotate-45 border border-gold bg-[#140c09]" style={{ top: `calc(${(i / (count - 1)) * 100}% - 3px)` }} />
      ))}
    </div>
  );
}

/**
 * La métamorphose : du palmier à la création, une histoire continue au défilement. Chaque passage a son
 * propre masque, lié au récit : la datte apparaît dans une forme de datte, elle s'ouvre en deux sur son cœur,
 * le chocolat monte comme une vague, puis tout se resserre dans un écrin en arc autour de la création
 * (photographie de référence, affichée à une taille où elle reste nette).
 */
export function Metamorphosis({ steps, creations }: { steps: MetaStep[]; creations: MetaCreation[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [palmier, datte, coeur, chocolat] = steps;

  // 1 → 2 : une forme de datte s'ouvre au centre
  const d = useTransform(p, span(...AT.datte), [0, 1]);
  const ellipse = useTransform(d, (e) => {
    const k = e * e * (3 - 2 * e);
    return `ellipse(${(7 + 93 * k).toFixed(2)}% ${(15 + 115 * k).toFixed(2)}% at 50% 52%)`;
  });
  const datteScale = useTransform(d, [0, 1], [1.25, 1.04]);
  const palmierScale = useTransform(p, span(0, AT.datte[1]), [1.04, 1.14]);
  // 2 → 3 : la datte se fend en deux sur son cœur
  const s = useTransform(p, span(...AT.coeur), [0, 1]);
  const leftX = useTransform(s, [0, 1], ["0%", "-58%"]);
  const rightX = useTransform(s, [0, 1], ["0%", "58%"]);
  const leftR = useTransform(s, [0, 1], [0, -5]);
  const rightR = useTransform(s, [0, 1], [0, 5]);
  const cutLine = useTransform(s, [0, 0.08, 0.3], [0, 1, 0]);
  const coeurShow = useTransform(p, span(AT.datte[1], AT.datte[1] + 0.01), [0, 1]);
  const coeurScale = useTransform(s, [0, 1], [1.16, 1.02]);
  // 3 → 4 : le chocolat monte comme une vague
  const w = useTransform(p, span(...AT.chocolat), [0, 1]);
  const maskPos = useTransform(w, (e) => `${(e * 60).toFixed(2)}% ${(e * 100).toFixed(2)}%`);
  const chocoScale = useTransform(w, [0, 1], [1.12, 1]);
  // 4 → 5 : l'écrin
  const c = useTransform(p, span(...AT.creation), [0, 1]);
  const dim = useTransform(c, [0, 1], [0, 0.78]);
  const galleryEvents = useTransform(c, (v) => (v > 0.6 ? "auto" : "none"));
  const cta = useTransform(p, span(0.9, 0.95), [0, 1]);
  const ctaEvents = useTransform(cta, (v) => (v > 0.5 ? "auto" : "none"));

  if (!palmier?.photo || !datte?.photo || !coeur?.photo || !chocolat?.photo) return null;

  if (reduce) {
    return (
      <section className="bg-[#140c09] text-ivory section-pad" aria-labelledby="meta-title">
        <div className="container-luxe">
          <p className="t-eyebrow text-gold">La métamorphose</p>
          <h2 id="meta-title" className="mt-4 t-display-l">Du fruit à la création</h2>
          <ol className="mt-14 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((st, i) => (
              <li key={st.key}>
                {st.photo ? (
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Full photo={st.photo} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw" />
                  </div>
                ) : (
                  <ul className="grid grid-cols-5 gap-2">
                    {creations.map((c) => (
                      <li key={c.slug} className="relative aspect-[412/495] overflow-hidden rounded-t-[50%_38%]">
                        <Image src={c.url} alt={c.name} fill sizes="80px" className="object-cover" />
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-5 t-numeral text-lg text-gold">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="t-title">{st.title}</h3>
                <p className="mt-2 t-small text-ivory/80">{st.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[480vh] bg-[#140c09] text-ivory" aria-labelledby="meta-title">
      <h2 id="meta-title" className="sr-only">La métamorphose : du palmier à la création</h2>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* 1. le palmier */}
        <motion.div style={{ scale: palmierScale }} className="absolute inset-0 origin-[45%_60%]">
          <Full photo={palmier.photo!} sizes="(max-aspect-ratio: 2/3) 67vh, 100vw" />
        </motion.div>

        {/* 3. le cœur (sous la datte, visible quand elle se fend) */}
        <motion.div style={{ opacity: coeurShow }} className="absolute inset-0 overflow-hidden">
          <motion.div style={{ scale: coeurScale }} className="absolute inset-0">
            <Full photo={coeur.photo!} />
          </motion.div>
        </motion.div>

        {/* 2. la datte, dans une forme de datte, puis fendue en deux */}
        <motion.div style={{ clipPath: ellipse }} className="absolute inset-0">
          {(["left", "right"] as const).map((side) => (
            <motion.div
              key={side}
              style={{ x: side === "left" ? leftX : rightX, rotate: side === "left" ? leftR : rightR }}
              className="absolute inset-0 origin-[50%_100%]"
            >
              <div className="absolute inset-0" style={{ clipPath: side === "left" ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)" }}>
                <motion.div style={{ scale: datteScale }} className="absolute inset-0">
                  <Full photo={datte.photo!} />
                </motion.div>
              </div>
            </motion.div>
          ))}
          <motion.span aria-hidden style={{ opacity: cutLine }} className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-[linear-gradient(180deg,transparent,#f3dcae,transparent)] shadow-[0_0_24px_6px_rgba(243,220,174,.45)]" />
        </motion.div>

        {/* 4. le chocolat monte comme une vague */}
        <motion.div style={{ maskPosition: maskPos, WebkitMaskPosition: maskPos }} className="mask-wave absolute inset-0">
          <motion.div style={{ scale: chocoScale }} className="absolute inset-0">
            <Full photo={chocolat.photo!} />
          </motion.div>
        </motion.div>

        {/* 5. la création : les dix recettes dans leurs niches, à leur taille nette */}
        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_66%_50%,rgba(20,12,9,.5),#140c09_72%)]" />
        <motion.div style={{ pointerEvents: galleryEvents }} className="absolute inset-0 flex items-start justify-center pt-[calc(var(--header-h)+var(--banner-h,0px)+3vh)] md:items-center md:justify-end md:pr-[max(var(--gutter),6vw)] md:pt-0">
          <ul className="meta-niches grid grid-cols-5 gap-x-[clamp(.5rem,1vw,1rem)] gap-y-[clamp(1rem,2.4vh,1.6rem)]" aria-label="Les dix créations">
            {creations.map((cr, i) => (
              <Niche key={cr.slug} c={cr} i={i} p={p} />
            ))}
          </ul>
        </motion.div>

        {/* textes des étapes */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(180deg,transparent,rgba(20,12,9,.78))] md:inset-y-0 md:left-0 md:h-auto md:w-[55%] md:bg-[linear-gradient(90deg,rgba(20,12,9,.72),rgba(20,12,9,.35)_60%,transparent)]" />
        <Rail p={p} count={steps.length} />
        <div className="container-luxe absolute inset-x-0 bottom-[8vh] md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:pl-[calc(var(--gutter)+3rem)]">
          <p className="t-eyebrow text-gold md:mb-6">La métamorphose</p>
          <div className="relative mt-4 h-[15rem] md:mt-0 md:h-[17rem] md:max-w-[34rem]">
            {steps.map((st, i) => (
              <StepText key={st.key} step={st} i={i} p={p} />
            ))}
          </div>
          <motion.div style={{ opacity: cta, pointerEvents: ctaEvents }} className="mt-2">
            <Link href="/creations" className="link-draw text-ivory">Découvrir les dix créations</Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
