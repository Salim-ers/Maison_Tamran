"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { span } from "@/components/motion/scroll";
import type { ImageRef } from "@/db/schema";
import { ConceptBadge } from "@/components/ui/media";

// Repères mesurés sur la photographie de référence Café Impérial (en % de l'image, ratio 4:5).
const ORIGIN = { x: 68.2, y: 55.6 }; // centre de la face coupée : point fixe du zoom
const ZOOM = 1.35;
const POINTS = [
  { n: "01", title: "La Medjool", text: "Une chair généreuse aux notes naturellement caramélisées.", x: 53.5, y: 49.9, label: { x: 8, y: 26 } },
  { n: "02", title: "Le cœur gourmand", text: "Des associations singulières d'ingrédients et de textures.", x: 62.4, y: 55.6, label: { x: 10, y: 78 } },
  { n: "03", title: "L'enrobage", text: "Le chocolat révèle et prolonge les saveurs.", x: 89.1, y: 53.5, label: { x: 64, y: 18 } },
];
// position d'un repère une fois le zoom terminé
const zoomed = (p: { x: number; y: number }) => ({ x: ORIGIN.x + (p.x - ORIGIN.x) * ZOOM, y: ORIGIN.y + (p.y - ORIGIN.y) * ZOOM });

function Annotation({ p, i, progress }: { p: (typeof POINTS)[number]; i: number; progress: MotionValue<number> }) {
  const start = 0.32 + i * 0.17;
  const draw = useTransform(progress, span(start, start + 0.1), [0, 1]);
  const opacity = useTransform(progress, span(start, start + 0.06), [0, 1]);
  const z = zoomed(p);
  return (
    <>
      <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden>
        <motion.path
          d={`M ${z.x} ${z.y * 1.25} L ${p.label.x + 1} ${p.label.y * 1.25 + 4}`}
          stroke="#c7a06a"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          fill="none"
          style={{ pathLength: draw, opacity }}
        />
      </svg>
      <motion.span style={{ left: `${z.x}%`, top: `${z.y}%`, opacity }} className="absolute size-3 -translate-x-1/2 -translate-y-1/2" aria-hidden>
        <span className="absolute inset-0 rounded-full bg-gold" />
        <span className="absolute -inset-2 animate-ping rounded-full border border-gold/60 [animation-duration:2.4s]" />
      </motion.span>
      <motion.span
        style={{ left: `${p.label.x}%`, top: `${p.label.y}%`, opacity }}
        className="absolute hidden whitespace-nowrap border border-gold/40 bg-chocolate/75 px-3 py-1.5 t-micro tracking-[0.12em] text-ivory backdrop-blur-sm md:block"
        aria-hidden
      >
        {p.n} · {p.title}
      </motion.span>
    </>
  );
}

function Legend({ p, i, progress }: { p: (typeof POINTS)[number]; i: number; progress: MotionValue<number> }) {
  const start = 0.32 + i * 0.17;
  const opacity = useTransform(progress, span(start - 0.04, start + 0.06), [0.3, 1]);
  const line = useTransform(progress, span(start, start + 0.12), ["0%", "100%"]);
  return (
    <motion.li style={{ opacity }} className="relative pt-5">
      <span className="absolute left-0 top-0 h-px w-full bg-line-light" aria-hidden />
      <motion.span style={{ width: line }} className="absolute left-0 top-0 h-px bg-gold" aria-hidden />
      <p className="t-numeral text-lg text-gold">{p.n}</p>
      <h3 className="mt-1 font-display text-2xl">{p.title}</h3>
      <p className="mt-1.5 max-w-[34ch] t-small text-taupe">{p.text}</p>
    </motion.li>
  );
}

/**
 * Anatomie d'une création : la photographie de référence Café Impérial se rapproche de la face coupée,
 * puis trois repères (chair, cœur, enrobage) se dessinent au rythme du défilement.
 */
export function DateAnatomy({ image }: { image: ImageRef }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, span(0.02, 0.3), [1, reduce ? 1 : ZOOM]);
  const vignette = useTransform(scrollYProgress, span(0.02, 0.3), [0, 0.55]);

  const photo = (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-chocolate-2">
      <motion.div style={{ scale, transformOrigin: `${ORIGIN.x}% ${ORIGIN.y}%` }} className="absolute inset-0">
        <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 44vw, 100vw" quality={85} placeholder={image.blur ? "blur" : "empty"} blurDataURL={image.blur} className="object-cover" />
      </motion.div>
      <motion.div style={{ opacity: vignette }} className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_68%_55%,transparent_35%,rgba(36,23,19,.85)_100%)]" aria-hidden />
      {POINTS.map((p, i) => (
        <Annotation key={p.n} p={p} i={i} progress={scrollYProgress} />
      ))}
      {image.concept && <ConceptBadge tone="dark" label={image.badge} className="bottom-3 right-3" />}
    </div>
  );

  return (
    <section ref={ref} className="relative bg-chocolate text-ivory" style={{ height: reduce ? undefined : "280svh" }} aria-labelledby="anatomie-title">
      <div className={reduce ? "section-pad" : "sticky top-0 flex h-[100svh] items-center overflow-hidden"}>
        <div className="container-luxe grid w-full items-center gap-8 pt-[calc(var(--header-h)+var(--banner-h,0px))] lg:grid-cols-12 lg:gap-16 lg:pt-0">
          <div className="lg:col-span-5 lg:col-start-1">
            <p className="t-eyebrow text-gold">L&apos;anatomie d&apos;une création</p>
            <h2 id="anatomie-title" className="mt-4 font-display text-[clamp(2rem,4vw,4rem)] leading-[1.02] tracking-[-0.02em]">
              Au cœur
              <br className="max-lg:hidden" /> d&apos;une datte
            </h2>
            <ol className="mt-8 grid gap-5 max-lg:hidden">
              {POINTS.map((p, i) => (
                <Legend key={p.n} p={p} i={i} progress={scrollYProgress} />
              ))}
            </ol>
            <Link href="/creations/cafe-imperial" className="mt-8 hidden t-small text-gold link-draw lg:inline-block">
              Café Impérial : noisette, espresso, cardamome
            </Link>
          </div>
          <div className="mx-auto w-full max-w-[min(100%,60svh)] lg:col-span-6 lg:col-start-7 lg:max-w-[min(100%,74svh)]">{photo}</div>
          <ol className="grid grid-cols-3 gap-3 lg:hidden">
            {POINTS.map((p) => (
              <li key={p.n}>
                <p className="t-numeral text-gold">{p.n}</p>
                <p className="font-display text-lg leading-tight">{p.title}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
