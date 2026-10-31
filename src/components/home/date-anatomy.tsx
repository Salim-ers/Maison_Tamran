"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionTemplate, useScroll, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { useRef } from "react";
import { span } from "@/components/motion/scroll";
import type { ImageRef } from "@/db/schema";
import { ConceptBadge } from "@/components/ui/media";

// Repères mesurés sur la photographie de Café Impérial (visuel généré 1632 × 2048, en % de l'image, ratio 4:5).
const ORIGIN = { x: 67.5, y: 56.8 }; // centre de la face coupée : point fixe du rapprochement
const POINTS = [
  { n: "01", title: "La chair de Medjool", text: "Épaisse et fondante, aux notes naturelles de miel et de caramel.", x: 53.1, y: 54.3, r: 11, label: { x: 5, y: 24 } },
  { n: "02", title: "Le cœur gourmand", text: "Un praliné noisette relevé d'espresso et de cardamome.", x: 69.5, y: 58.5, r: 11, label: { x: 5, y: 84 } },
  { n: "03", title: "L'enrobage", text: "Une fine coque de chocolat qui craque, puis fond.", x: 91.6, y: 56, r: 8, label: { x: 50, y: 12 } },
];
// fenêtres de défilement : entrée, rapprochement, puis un repère à la fois
const ENTER: [number, number] = [0, 0.14];
const CLOSER: [number, number] = [0.12, 0.3];
const STEP = (i: number): [number, number] => [0.32 + i * 0.2, 0.32 + i * 0.2 + 0.16];
const ZOOM = 1.2;
// position d'un repère une fois le rapprochement terminé (les étiquettes restent hors de l'image zoomée)
const zoomed = (q: { x: number; y: number }) => ({ x: ORIGIN.x + (q.x - ORIGIN.x) * ZOOM, y: ORIGIN.y + (q.y - ORIGIN.y) * ZOOM });

function Annotation({ p, i, progress, still }: { p: (typeof POINTS)[number]; i: number; progress: MotionValue<number>; still: boolean }) {
  const [a, b] = STEP(i);
  const draw = useTransform(progress, span(a, a + 0.08), [0, 1]);
  const opacity = useTransform(progress, span(a - 0.02, a + 0.04, b + 0.14, b + 0.2), [0, 1, 1, i === POINTS.length - 1 ? 1 : 0.35]);
  const z = still ? p : zoomed(p);
  return (
    <>
      <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden>
        <motion.path
          d={`M ${z.x} ${z.y * 1.25} L ${p.label.x + 2} ${p.label.y * 1.25 + 3}`}
          stroke="#f3dcae"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          fill="none"
          style={{ pathLength: still ? 1 : draw, opacity: still ? 1 : opacity }}
        />
      </svg>
      <motion.span style={{ left: `${z.x}%`, top: `${z.y}%`, opacity: still ? 1 : opacity }} className="absolute size-3 -translate-x-1/2 -translate-y-1/2" aria-hidden>
        <span className="absolute inset-0 rounded-full bg-[#f3dcae]" />
        <span className="absolute -inset-2 animate-ping rounded-full border border-[#f3dcae]/70 [animation-duration:2.4s]" />
      </motion.span>
      <motion.span
        style={{ left: `${p.label.x}%`, top: `${p.label.y}%`, opacity: still ? 1 : opacity }}
        className="absolute hidden whitespace-nowrap bg-ivory/92 px-3 py-1.5 t-micro tracking-[0.14em] text-ink shadow-[0_10px_30px_-12px_rgba(20,12,9,.6)] md:block"
        aria-hidden
      >
        {p.n} · {p.title.toUpperCase()}
      </motion.span>
    </>
  );
}

function Legend({ p, i, progress, still }: { p: (typeof POINTS)[number]; i: number; progress: MotionValue<number>; still: boolean }) {
  const [a, b] = STEP(i);
  const last = i === POINTS.length - 1;
  const opacity = useTransform(progress, span(a - 0.04, a + 0.03, b + 0.1, b + 0.16), [0.28, 1, 1, last ? 1 : 0.45]);
  const line = useTransform(progress, span(a, a + 0.12), ["0%", "100%"]);
  return (
    <motion.li style={{ opacity: still ? 1 : opacity }} className="relative pt-5">
      <span className="absolute left-0 top-0 h-px w-full bg-line" aria-hidden />
      <motion.span style={{ width: still ? "100%" : line }} className="absolute left-0 top-0 h-px bg-bronze" aria-hidden />
      <p className="t-numeral text-lg text-bronze">{p.n}</p>
      <h3 className="mt-1 font-display text-[1.7rem] leading-tight">{p.title}</h3>
      <p className="mt-1.5 max-w-[36ch] t-small text-ink-soft">{p.text}</p>
    </motion.li>
  );
}

/**
 * Le cœur de la datte : la photographie de référence Café Impérial entre dans le champ, le cadrage se
 * rapproche de la face coupée, puis une lumière isole tour à tour la chair, le cœur et l'enrobage.
 * Le rapprochement est borné (cadre plafonné par densité d'écran) : l'image n'est jamais affichée
 * au-delà de sa définition réelle (1122 × 1402).
 */
export function DateAnatomy({ image }: { image: ImageRef }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // entrée : la photo glisse et se redresse
  const enterX = useTransform(p, span(...ENTER), ["18%", "0%"]);
  const enterR = useTransform(p, span(...ENTER), [4, 0]);
  const enterO = useTransform(p, span(ENTER[0], ENTER[1] * 0.6), [0, 1]);
  // rapprochement de la coupe (borné)
  const scale = useTransform(p, span(...CLOSER), [1, ZOOM]);
  // lumière : un cercle clair qui va d'un repère à l'autre, le reste s'assombrit
  const stops = POINTS.map((_, i) => STEP(i)[0]);
  const sx = useTransform(p, span(...stops), POINTS.map((q) => q.x));
  const sy = useTransform(p, span(...stops), POINTS.map((q) => q.y));
  const sr = useTransform(p, span(...stops), POINTS.map((q) => q.r));
  const dark = useTransform(p, span(STEP(0)[0] - 0.06, STEP(0)[0], 0.94, 1), [0, 0.62, 0.62, 0.3]);
  const spot = useMotionTemplate`radial-gradient(circle at ${sx}% ${sy}%, transparent ${sr}%, rgba(20,12,9,1) calc(${sr}% + 14%))`;

  const photo = (
    <motion.div style={{ x: reduce ? "0%" : enterX, rotate: reduce ? 0 : enterR, opacity: reduce ? 1 : enterO }} className="anatomy-frame relative mx-auto">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-chocolate-2 shadow-[0_40px_80px_-30px_rgba(36,23,19,.55)]">
        <motion.div style={{ scale: reduce ? 1 : scale, transformOrigin: `${ORIGIN.x}% ${ORIGIN.y}%` }} className="absolute inset-0">
          <Image src={image.url} alt={image.alt} fill sizes="(max-width: 767px) 86vw, 460px" quality={85} placeholder={image.blur ? "blur" : "empty"} blurDataURL={image.blur} className="object-cover" />
          {!reduce && <motion.div aria-hidden style={{ background: spot, opacity: dark }} className="pointer-events-none absolute inset-0" />}
        </motion.div>
        {POINTS.map((q, i) => (
          <Annotation key={q.n} p={q} i={i} progress={p} still={reduce} />
        ))}
        {image.concept && <ConceptBadge tone="dark" label={image.badge} className="bottom-3 right-3" />}
      </div>
      <span aria-hidden className="absolute -inset-3 -z-10 border border-bronze/35" />
    </motion.div>
  );

  return (
    <section ref={ref} className="relative bg-[#f3e8d4] text-ink" style={{ height: reduce ? undefined : "330svh" }} aria-labelledby="anatomie-title">
      <div className={reduce ? "section-pad" : "sticky top-0 flex h-[100svh] items-center overflow-hidden"}>
        <div className="container-luxe grid w-full items-center gap-8 pt-[calc(var(--header-h)+var(--banner-h,0px))] lg:grid-cols-12 lg:gap-12 lg:pt-0">
          <div className="lg:col-span-5">
            <p className="t-eyebrow text-bronze">L&apos;anatomie d&apos;une création</p>
            <h2 id="anatomie-title" className="mt-4 section-title">
              Le cœur
              <br /> de la <em className="text-bronze">datte</em>
            </h2>
            <ol className="mt-10 grid gap-5 max-lg:hidden">
              {POINTS.map((q, i) => (
                <Legend key={q.n} p={q} i={i} progress={p} still={reduce} />
              ))}
            </ol>
            <Link href="/creations/cafe-imperial" className="mt-8 hidden t-small text-bronze link-draw lg:inline-block">
              Café Impérial : noisette, espresso, cardamome
            </Link>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">{photo}</div>
          <ol className="grid grid-cols-3 gap-3 lg:hidden">
            {POINTS.map((q) => (
              <li key={q.n}>
                <p className="t-numeral text-bronze">{q.n}</p>
                <p className="font-display text-lg leading-tight">{q.title}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
