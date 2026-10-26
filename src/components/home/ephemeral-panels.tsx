"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import { clsx } from "clsx";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import type { ImageRef } from "@/db/schema";

export type EphemeralItem = {
  slug: string;
  name: string;
  pairing: string;
  tagline: string;
  image: ImageRef | null;
  stage: { url: string; alt: string; credit?: string } | null;
  accent: string;
  edition: number;
};

const EASE = [0.22, 0.8, 0.12, 1] as const;

/**
 * Les éditions éphémères : une atmosphère à part, de nuit (aubergine, or rose). Quatre niches en arc côte à côte,
 * chacune éclairée par la photographie haute définition de son ingrédient, la création posée en petit au pied
 * (vignette à sa définition réelle). Au survol ou au focus, la niche s'élargit et révèle l'accord.
 */
export function EphemeralPanels({ intro, items }: { intro: string; items: EphemeralItem[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#1b1320] text-ivory section-pad" aria-labelledby="ephemere-title">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_0%,rgba(214,150,160,.16),transparent_70%),radial-gradient(ellipse_60%_45%_at_90%_100%,rgba(199,160,106,.14),transparent_70%)]" />
      {/* ciel de nuit : quelques étoiles fixes */}
      <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[40%] w-full opacity-60" preserveAspectRatio="none" viewBox="0 0 100 40">
        {Array.from({ length: 36 }, (_, i) => (
          <circle key={i} cx={(i * 37.7) % 100} cy={(i * 13.3) % 38} r={i % 5 === 0 ? 0.16 : 0.08} fill="#f3dcae" opacity={0.35 + ((i * 7) % 6) / 10} />
        ))}
      </svg>
      <div className="container-luxe relative">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="t-eyebrow text-[#e6b9b0]">Collection Éphémère</p>
            <h2 id="ephemere-title" className="section-title mt-4 max-w-[12ch]">
              Éditions <em className="text-[#e6b9b0]">éphémères</em>
            </h2>
          </div>
          <p className="max-w-[34rem] text-ivory/75 md:col-span-5">{intro}</p>
        </div>

        <ul className="no-scrollbar -mx-[var(--gutter)] mt-14 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] md:mx-0 md:h-[min(72svh,46rem)] md:gap-4 md:overflow-visible md:px-0" aria-label="Les quatre éditions éphémères">
          {items.map((it, i) => {
            const on = i === active;
            return (
              <motion.li
                key={it.slug}
                layout={!reduce}
                transition={{ duration: 0.8, ease: EASE }}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={clsx(
                  "relative shrink-0 snap-center overflow-hidden rounded-t-[50%_22%] max-md:h-[68svh] max-md:w-[78vw]",
                  on ? "md:flex-[2.4]" : "md:flex-1",
                )}
              >
                <Link href={`/creations/${it.slug}`} className="group absolute inset-0 block focus-visible:outline-offset-[-6px]">
                  {it.stage && (
                    <Image src={it.stage.url} alt="" fill sizes="(max-width: 767px) 78vw, 45vw" quality={75} className={clsx("object-cover transition-transform duration-[1.6s] ease-[var(--ease-luxe)]", on ? "scale-100" : "scale-110")} />
                  )}
                  <span aria-hidden className={clsx("absolute inset-0 transition-colors duration-700", on ? "bg-[linear-gradient(180deg,rgba(27,19,32,.15),rgba(27,19,32,.35)_45%,rgba(27,19,32,.94))]" : "bg-[rgba(27,19,32,.62)]")} />
                  <span aria-hidden className="absolute inset-[10px] rounded-t-[50%_22%] border border-[#e6b9b0]/30" />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <p className="t-numeral text-lg" style={{ color: it.accent }}>
                      Édition {String(it.edition).padStart(2, "0")}
                    </p>
                    <h3 className={clsx("mt-1 font-display leading-[1.02] transition-[font-size] duration-700", on ? "text-[clamp(2rem,3.2vw,3.2rem)]" : "text-[clamp(1.5rem,2vw,2rem)]")}>{it.name}</h3>
                    <div className={clsx("grid transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-luxe)]", on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 max-md:grid-rows-[1fr] max-md:opacity-100")}>
                      <div className="overflow-hidden">
                        <p className="mt-3 t-eyebrow text-[#e6b9b0]">{it.pairing}</p>
                        <div className="mt-5 flex items-end gap-5">
                          {it.image && (
                            <span className="print-inset-sm relative block shrink-0 bg-ivory p-[4px] shadow-[0_24px_40px_-18px_rgba(0,0,0,.9)] [transform:rotate(-3deg)]">
                              <span className="relative block aspect-[412/495] overflow-hidden">
                                <Image src={it.image.url} alt={it.image.alt} fill sizes="150px" quality={85} className="object-cover" />
                              </span>
                            </span>
                          )}
                          <p className="max-w-[24rem] t-small text-ivory/80">{it.tagline}</p>
                        </div>
                        <span className="mt-5 inline-block t-small link-draw text-ivory">Découvrir l&apos;édition</span>
                      </div>
                    </div>
                  </div>
                  {it.stage?.credit && <span className="absolute right-4 top-[38%] origin-right rotate-90 t-micro text-ivory/45 max-md:hidden">{it.stage.credit}</span>}
                </Link>
              </motion.li>
            );
          })}
        </ul>
        <p className="mt-6 t-micro text-ivory/45">Visuels conceptuels des créations · photographies d&apos;ingrédients Unsplash.</p>
      </div>
    </section>
  );
}
