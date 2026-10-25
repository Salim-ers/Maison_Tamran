"use client";

import Image from "next/image";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";
import { clsx } from "clsx";
import { ConceptBadge } from "@/components/ui/media";

const LAYERS = [
  { key: "datte", title: "La datte", text: "Une Medjool charnue, ouverte et dénoyautée. Sa chair, entre miel et caramel, devient l'écrin de la recette." },
  { key: "garniture", title: "La garniture", text: "Crème, praliné ou confit : le cœur porte l'accord. Ici, une crème de pistache où se cachent des fils de kadaïf." },
  { key: "chocolat", title: "Le chocolat", text: "Une coque fine enrobe le fruit et scelle la garniture. Elle craque avant de fondre." },
  { key: "finition", title: "La finition", text: "Éclats, fils dorés, zestes ou pétales : le dernier geste annonce le goût avant la première bouchée." },
] as const;

// élévation finale de chaque couche (translateZ, en vw) : la scène est inclinée, les couches montent vers l'œil
const OFFSET = { datte: -10, garniture: -2.5, chocolat: 6, finition: 14 };

function Layer({ k, progress, blur, alt, z }: { k: keyof typeof OFFSET; progress: MotionValue<number>; blur?: string; alt: string; z: number }) {
  const zv = useTransform(progress, [0.12, 0.72], [0, OFFSET[k]]);
  const transform = useTransform(zv, (v) => `translateZ(${v}vw)`);
  return (
    <motion.div style={{ transform, zIndex: z }} className="absolute inset-0">
      <Image src={`/images/concepts/couche-${k}.webp`} alt={alt} fill sizes="(min-width: 1024px) 60vw, 100vw" quality={75} placeholder={blur ? "blur" : "empty"} blurDataURL={blur} className="object-contain" />
    </motion.div>
  );
}

export function SensoryLayers({ blurs }: { blurs: Record<string, string | undefined> }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(-1);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = v < 0.14 ? -1 : Math.min(3, Math.floor((v - 0.14) / 0.15));
    setActive(i);
  });
  const tilt = useTransform(scrollYProgress, [0, 0.15, 0.8], [0, 58, 58]);
  const spin = useTransform(scrollYProgress, [0, 0.15, 0.8], [0, -8, -14]);
  const scale = useTransform(scrollYProgress, [0, 0.15], [1.08, 0.84]);
  const fixed = useTransform(() => 1);

  return (
    <section ref={ref} className={clsx("on-dark relative", reduce ? "" : "h-[340vh]")} aria-labelledby="sensory-title">
      <div className={clsx("flex flex-col overflow-hidden", reduce ? "py-[var(--section)]" : "sticky top-0 h-screen pt-[calc(var(--header-h)+var(--banner-h))]")}>
        <div className="container-luxe grid flex-1 items-center gap-8 lg:grid-cols-[1fr_1.5fr]">
          <div className="relative z-10 max-lg:order-2 max-lg:pb-8">
            <h2 id="sensory-title" className="t-display-m max-w-[14ch]">Une expérience sensorielle</h2>
            <p className="mt-4 max-w-[40ch] text-taupe max-lg:hidden">Quatre gestes, quatre couches. Faites défiler pour ouvrir la datte.</p>
            <ol className="mt-8 space-y-5 max-lg:mt-5 max-lg:space-y-0">
              {LAYERS.map((l, i) => {
                const on = reduce || i <= active;
                const current = reduce || i === active;
                return (
                  <li
                    key={l.key}
                    className={clsx(
                      "grid grid-cols-[2.25rem_1fr] transition-[opacity,color] duration-700",
                      on ? "opacity-100" : "opacity-30",
                      !reduce && !current && "max-lg:hidden"
                    )}
                    aria-current={current && !reduce ? "step" : undefined}
                  >
                    <span className="t-numeral pt-1 text-xl text-bronze-light">{i + 1}</span>
                    <div>
                      <h3 className="font-display text-2xl">{l.title}</h3>
                      <p className={clsx("mt-1 t-small text-taupe transition-[max-height,opacity] duration-700 lg:max-w-[38ch]", current ? "max-h-40 opacity-100" : "max-h-40 opacity-100 lg:max-h-0 lg:opacity-0")}>{l.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="relative aspect-[20/11] w-full max-lg:order-1 max-lg:mt-4" style={{ perspective: "1800px" }}>
            <motion.div
              className="absolute inset-0"
              style={{ rotateX: reduce ? 58 : tilt, rotateZ: reduce ? -14 : spin, scale: reduce ? 0.84 : scale, transformStyle: "preserve-3d" }}
            >
              <Layer k="datte" progress={reduce ? fixed : scrollYProgress} blur={blurs.datte} alt="La datte Medjool, ouverte" z={1} />
              <Layer k="garniture" progress={reduce ? fixed : scrollYProgress} blur={blurs.garniture} alt="La garniture" z={2} />
              <Layer k="chocolat" progress={reduce ? fixed : scrollYProgress} blur={blurs.chocolat} alt="La coque de chocolat" z={3} />
              <Layer k="finition" progress={reduce ? fixed : scrollYProgress} blur={blurs.finition} alt="La finition" z={4} />
            </motion.div>
            <ConceptBadge tone="dark" className="bottom-0 right-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
