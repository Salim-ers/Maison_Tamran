"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import type { AmbianceImage } from "@/lib/ambiance";

function Photo({ image, sizes, className }: { image: AmbianceImage; sizes: string; className?: string }) {
  return (
    <>
      <Image src={image.url} alt={image.alt} fill sizes={sizes} quality={75} placeholder={image.blur ? "blur" : "empty"} blurDataURL={image.blur} className={className ?? "object-cover"} style={{ objectPosition: image.focus }} />
      <span className="absolute bottom-2 left-3 t-micro text-ivory/80 [text-shadow:0_1px_2px_rgba(0,0,0,.6)]">{image.credit}</span>
    </>
  );
}

function Floating({ image, p, speed, rotate, className, sizes }: { image: AmbianceImage; p: MotionValue<number>; speed: number; rotate: number; className: string; sizes: string }) {
  const reduce = useReducedMotion();
  const y = useTransform(p, [0, 1], [`${speed}%`, `${-speed}%`]);
  return (
    <motion.figure style={{ y: reduce ? 0 : y, rotate }} className={`absolute overflow-hidden shadow-[0_34px_60px_-26px_rgba(36,23,19,.6)] ring-[6px] ring-ivory ${className}`}>
      <Photo image={image} sizes={sizes} />
    </motion.figure>
  );
}

/**
 * L'univers de la maison : art de recevoir, patrimoine esthétique marocain, gastronomie. Grande cour baignée de
 * soleil dans un cadre en arc ; trois photographies flottent par-dessus à des vitesses différentes (profondeur).
 * Photographies d'ambiance : elles évoquent une culture, sans prétendre montrer les lieux de la maison.
 */
export function MaisonStory({
  title,
  body,
  signature,
  main,
  photos,
}: {
  title: string;
  body: string;
  signature: string;
  main: AmbianceImage | null;
  photos: (AmbianceImage | null)[];
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const mainScale = useTransform(p, [0, 1], [1.12, 1]);
  const [a, b, c] = photos;

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#f6eddd] section-pad" aria-labelledby="maison-title">
      <div aria-hidden className="pointer-events-none absolute -left-[12vw] top-0 size-[60vmax] rounded-full bg-[radial-gradient(closest-side,rgba(255,214,150,.45),transparent)]" />
      <div className="container-luxe relative grid gap-16 lg:grid-cols-12 lg:items-center">
        <div className="relative lg:col-span-7">
          {main && (
            <div className="relative mx-auto aspect-[4/5] w-[min(100%,36rem)] overflow-hidden rounded-t-[50%_32%] shadow-[0_50px_90px_-40px_rgba(36,23,19,.55)]">
              <motion.div style={{ scale: reduce ? 1 : mainScale }} className="absolute inset-0">
                <Photo image={main} sizes="(min-width: 1024px) 36rem, 100vw" />
              </motion.div>
            </div>
          )}
          {a && <Floating image={a} p={p} speed={18} rotate={-4} sizes="260px" className="-left-2 top-[6%] aspect-[3/4] w-[clamp(8rem,17vw,15rem)] max-sm:hidden" />}
          {b && <Floating image={b} p={p} speed={30} rotate={3} sizes="280px" className="-right-2 top-[38%] aspect-square w-[clamp(8rem,18vw,16rem)]" />}
          {c && <Floating image={c} p={p} speed={12} rotate={-2} sizes="320px" className="bottom-[-4%] left-[10%] aspect-[16/10] w-[clamp(10rem,22vw,19rem)]" />}
        </div>
        <div className="lg:col-span-5">
          <p className="t-eyebrow text-bronze">L&apos;univers Maison Tamrān</p>
          <h2 id="maison-title" className="section-title mt-4 max-w-[11ch]">{title}</h2>
          <p className="mt-8 max-w-[44ch] text-lg leading-relaxed text-ink-soft">{body}</p>
          <p className="mt-8 font-display text-[1.7rem] italic text-bronze">{signature}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/maison" className="btn btn-primary">Notre Maison</Link>
            <Link href="/savoir-faire" className="btn btn-outline">Le savoir-faire</Link>
          </div>
          <p className="mt-10 t-micro text-ink-soft">Photographies d&apos;ambiance (licence Unsplash) : elles évoquent une culture, pas les lieux de la maison.</p>
        </div>
      </div>
    </section>
  );
}
