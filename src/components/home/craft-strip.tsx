"use client";

import Image from "next/image";
import Link from "@/components/motion/transition-link";
import { motion } from "motion/react";
import { useReducedMotion } from "@/components/motion/reduced-motion";

export type CraftStep = { key: string; title: string; text: string; image: { url: string; alt: string; blur?: string } | null };

/**
 * De la palmeraie à la création, en un seul écran : les étapes côte à côte (défilement latéral sur mobile),
 * chaque photographie montant à son tour à l'entrée dans l'écran. Le détail est sur la page Savoir-faire.
 */
export function CraftStrip({ steps }: { steps: CraftStep[] }) {
  const reduce = useReducedMotion();
  return (
    <section className="relative bg-[#140c09] py-[clamp(4.5rem,9vw,8rem)] text-ivory" aria-labelledby="craft-title">
      <div className="container-luxe">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div>
            <p className="t-eyebrow text-gold">Le savoir-faire</p>
            <h2 id="craft-title" className="section-title mt-4 max-w-[13ch]">
              De la palmeraie <em className="text-gold">à la création</em>
            </h2>
          </div>
          <Link href="/savoir-faire" className="btn btn-outline-light">Découvrir le savoir-faire</Link>
        </div>
        <ol className="no-scrollbar -mx-[var(--gutter)] mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 lg:mt-16">
          {steps.map((s, i) => (
            <motion.li
              key={s.key}
              initial={reduce ? false : { opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.9, delay: i * 0.09, ease: [0.22, 0.8, 0.12, 1] }}
              className="group w-[72vw] shrink-0 snap-start md:w-auto"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-chocolate">
                {s.image && (
                  <Image
                    src={s.image.url}
                    alt={s.image.alt}
                    fill
                    sizes="(min-width: 768px) 24vw, 72vw"
                    quality={82}
                    placeholder={s.image.blur ? "blur" : "empty"}
                    blurDataURL={s.image.blur}
                    className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.05]"
                  />
                )}
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,rgba(20,12,9,.55),transparent)]" />
                <span className="absolute bottom-4 left-4 font-display text-[1.05rem] text-gold">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-5 font-display text-[1.6rem] leading-tight">{s.title}</h3>
              <p className="mt-2 max-w-[34ch] t-small text-ivory/65">{s.text}</p>
            </motion.li>
          ))}
        </ol>
        <p className="mt-10 t-micro text-ivory/60">Visuels conceptuels générés par IA.</p>
      </div>
    </section>
  );
}
