"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { useRef } from "react";
import { span } from "@/components/motion/scroll";
import { clsx } from "clsx";
import type { ImageRef } from "@/db/schema";

export interface FruitStep {
  key: string;
  title: string;
  text: string;
  image: (ImageRef & { credit?: string }) | null;
}

/** Image d'une étape : elle se dévoile par le bas (comme une feuille qu'on soulève) quand vient son tour. */
function StepImage({ step, index, count, progress }: { step: FruitStep; index: number; count: number; progress: MotionValue<number> }) {
  const start = index / count - 0.06;
  const end = index / count + 0.08;
  const clip = useTransform(progress, span(start, end), index === 0 ? ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)"] : ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]);
  const scale = useTransform(progress, span(start, (index + 1) / count + 0.1), [1.12, 1]);
  if (!step.image) return null;
  return (
    <motion.div style={{ clipPath: clip, zIndex: index }} className="absolute inset-0 overflow-hidden">
      <motion.div style={{ scale }} className="absolute inset-0">
        <Image
          src={step.image.url}
          alt={step.image.alt}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          quality={75}
          placeholder={step.image.blur ? "blur" : "empty"}
          blurDataURL={step.image.blur}
          className="object-cover"
        />
      </motion.div>
      {step.image.credit && <span className="absolute bottom-2 right-3 t-micro text-ivory/70 [text-shadow:0_1px_2px_rgba(0,0,0,.6)]">{step.image.credit}</span>}
    </motion.div>
  );
}

function StepText({ step, index, count, progress }: { step: FruitStep; index: number; count: number; progress: MotionValue<number> }) {
  const a = index / count;
  const b = (index + 1) / count;
  const opacity = useTransform(progress, span(a - 0.07, a + 0.02, b - 0.04, b + 0.04), [0.3, 1, 1, index === count - 1 ? 1 : 0.3]);
  const x = useTransform(progress, span(a - 0.07, a + 0.02), [0, 12]);
  return (
    <motion.li style={{ opacity }} className="relative border-t hairline py-2.5 first:border-t-0">
      <motion.p style={{ x }} className="flex items-baseline gap-4">
        <span className="t-numeral w-6 text-bronze">{String(index + 1).padStart(2, "0")}</span>
        <span className="font-display text-[1.6rem] leading-tight">{step.title}</span>
      </motion.p>
    </motion.li>
  );
}

/** Description de l'étape en cours (ordinateur : sous le sommaire ; mobile : sous l'image). */
function StepCaption({ step, index, count, progress, withTitle }: { step: FruitStep; index: number; count: number; progress: MotionValue<number>; withTitle?: boolean }) {
  const a = index / count;
  const b = (index + 1) / count;
  const opacity = useTransform(progress, span(a - 0.05, a + 0.02, b - 0.03, b + 0.02), [0, 1, 1, index === count - 1 ? 1 : 0]);
  const y = useTransform(progress, span(a - 0.05, a + 0.02), [10, 0]);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 top-0">
      {withTitle && (
        <>
          <p className="t-numeral text-lg text-bronze">{String(index + 1).padStart(2, "0")}</p>
          <h3 className="mt-1 t-title">{step.title}</h3>
        </>
      )}
      <p className="mt-2 max-w-[40ch] text-ink-soft">{step.text}</p>
    </motion.div>
  );
}

/**
 * Séquence « Tout commence par un fruit » : du dattier à la garniture, piloté par le défilement natif
 * (section haute + contenu collant, sans détournement du scroll). Version statique si l'utilisateur
 * demande moins d'animations.
 */
export function FruitStory({ steps }: { steps: FruitStep[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const bar = useTransform(scrollYProgress, span(0, 1), ["0%", "100%"]);
  const n = steps.length;

  if (reduce) {
    return (
      <section ref={ref} id="fruit" className="section-pad bg-creme" aria-labelledby="fruit-title">
        <div className="container-luxe">
          <p className="t-eyebrow text-bronze">De la nature à la gourmandise</p>
          <h2 id="fruit-title" className="mt-4 t-display-l max-w-[14ch]">Tout commence par un fruit.</h2>
          <ol className="mt-14 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.key}>
                {s.image && (
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image src={s.image.url} alt={s.image.alt} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
                  </div>
                )}
                <p className="mt-5 t-numeral text-lg text-bronze">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="t-title">{s.title}</h3>
                <p className="mt-2 t-small text-ink-soft">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="fruit" className="relative bg-creme" style={{ height: `${n * 85 + 40}svh` }} aria-labelledby="fruit-title">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="container-luxe grid h-full w-full grid-rows-[auto_1fr_auto] gap-6 pb-8 pt-[calc(var(--header-h)+var(--banner-h,0px)+1.5rem)] lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-12 lg:py-0">
          <div className="lg:col-span-5">
            <p className="t-eyebrow text-bronze">De la nature à la gourmandise</p>
            <h2 id="fruit-title" className="mt-4 font-display text-[clamp(2.2rem,4.6vw,4.6rem)] leading-[1] tracking-[-0.02em]">
              Tout commence
              <br />
              par un fruit.
            </h2>
            <div className="relative mt-8 hidden pl-6 lg:block">
              <span className="absolute left-0 top-0 h-full w-px bg-line" aria-hidden />
              <motion.span style={{ height: bar }} className="absolute left-0 top-0 w-px bg-bronze" aria-hidden />
              <ol>
                {steps.map((s, i) => (
                  <StepText key={s.key} step={s} index={i} count={n} progress={scrollYProgress} />
                ))}
              </ol>
              <div className="relative mt-6 h-24">
                {steps.map((s, i) => (
                  <StepCaption key={s.key} step={s} index={i} count={n} progress={scrollYProgress} />
                ))}
              </div>
            </div>
          </div>
          <div className="relative min-h-0 lg:col-span-7 lg:h-[78svh]">
            <div className="absolute inset-0 overflow-hidden bg-sand/40">
              {steps.map((s, i) => (
                <StepImage key={s.key} step={s} index={i} count={n} progress={scrollYProgress} />
              ))}
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(36,23,19,.06)]" />
            </div>
          </div>
          <div className={clsx("relative h-[8.5rem] lg:hidden")}>
            {steps.map((s, i) => (
              <StepCaption key={s.key} step={s} index={i} count={n} progress={scrollYProgress} withTitle />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
