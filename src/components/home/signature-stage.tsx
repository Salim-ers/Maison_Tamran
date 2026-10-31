"use client";

import Image from "next/image";
import Link from "@/components/motion/transition-link";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { AddToCartButton } from "@/components/cart/add-button";
import { euros } from "@/lib/money";

export type StageCreation = {
  slug: string;
  number: number;
  name: string;
  pairing: string;
  tagline: string;
  fromCents: number | null;
  accent: string;
  product: { url: string; w: number; h: number; alt: string };
  stage: { url: string; alt: string; credit?: string; blur?: string } | null;
  quick?: { id: string; label: string; priceCents: number } | null;
};

const EASE = [0.22, 0.8, 0.12, 1] as const;

/**
 * Les Signatures : chaque création à deux échelles. En grand, sa photographie haute définition (ou, à défaut,
 * celle de son ingrédient vedette) ; posée dessus, en tirage incliné, le cœur de la datte en macro. Changement de création : la matière glisse par un volet, le tirage se soulève et se repose,
 * le nom monte lettre à lettre. Navigation au clic, au clavier (flèches) et au doigt.
 */
export function SignatureStage({ creations, intro }: { creations: StageCreation[]; intro: string }) {
  const [[i, dir], set] = useState<[number, number]>([0, 1]);
  const reduce = useReducedMotion();
  const touch = useRef<number | null>(null);
  const c = creations[i];
  if (!c) return null;
  const go = (k: number) => {
    const n = (k + creations.length) % creations.length;
    if (n !== i) set([n, n > i ? 1 : -1]);
  };

  return (
    <section
      className="relative isolate overflow-hidden bg-[#f4e8d6] text-ink"
      aria-labelledby="signatures-title"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(i + 1);
        if (e.key === "ArrowLeft") go(i - 1);
      }}
    >
      {/* la matière : grande photographie de l'ingrédient vedette */}
      <div
        className="absolute inset-x-0 top-0 h-[56svh] md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-[62%]"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
          touch.current = null;
        }}
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={c.slug}
            custom={dir}
            className="absolute inset-0"
            variants={{
              enter: (d: number) => (reduce ? { opacity: 0 } : { clipPath: d > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" }),
              center: reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" },
              exit: { opacity: 1 },
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0.2 : 1.1, ease: EASE }}
            style={{ zIndex: 1 }}
          >
            {c.stage && (
              <motion.div initial={reduce ? false : { scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: EASE }} className="absolute inset-0">
                <Image src={c.stage.url} alt={c.stage.alt} fill sizes="(max-width: 767px) 100vw, 62vw" quality={85} placeholder={c.stage.blur ? "blur" : "empty"} blurDataURL={c.stage.blur} className="object-cover" />
              </motion.div>
            )}
            {c.stage?.credit && <span className="absolute bottom-3 right-4 z-[1] t-micro text-ivory/70 [text-shadow:0_1px_2px_rgba(0,0,0,.6)]">{c.stage.credit}</span>}
          </motion.div>
        </AnimatePresence>
        <div aria-hidden className="absolute inset-0 z-[2] bg-[linear-gradient(90deg,#f4e8d6_0%,rgba(244,232,214,.7)_18%,transparent_46%)] max-md:bg-[linear-gradient(180deg,transparent_60%,#f4e8d6_100%)]" />
      </div>

      <div className="container-luxe relative z-[3] grid min-h-[min(100svh,64rem)] items-end gap-10 pb-12 pt-[58svh] md:grid-cols-12 md:items-center md:py-[clamp(6rem,12vh,9rem)]">
        <div className="md:col-span-6 lg:col-span-5">
          <p className="t-eyebrow text-bronze">Collection Signature</p>
          <h2 id="signatures-title" className="sr-only">Les créations Signature</h2>
          <p className="mt-3 max-w-[30rem] t-small text-ink-soft max-md:hidden">{intro}</p>
          <div className="mt-8 flex items-baseline gap-4 md:mt-12">
            <span className="t-numeral text-2xl text-bronze">N° {String(c.number).padStart(2, "0")}</span>
            <span className="h-px w-16 bg-bronze/50" />
            <span className="t-micro tracking-[0.2em] text-ink-soft">
              {String(i + 1).padStart(2, "0")} — {String(creations.length).padStart(2, "0")}
            </span>
          </div>
          <div className="relative mt-1 min-h-[2.3em] overflow-hidden pt-[0.18em] font-display text-[clamp(2.8rem,5.6vw,5.6rem)] leading-[0.98] tracking-[-0.025em]" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p key={c.slug} className="pb-[0.08em]" initial={reduce ? { opacity: 0 } : { y: "105%" }} animate={reduce ? { opacity: 1 } : { y: "0%" }} exit={reduce ? { opacity: 0 } : { y: "-105%" }} transition={{ duration: 0.9, ease: EASE }}>
                {c.name}
              </motion.p>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={c.slug} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease: EASE }}>
              <p className="mt-4 flex items-center gap-3 t-eyebrow text-ink">
                <span aria-hidden className="size-2.5 shrink-0 rotate-45" style={{ background: c.accent }} />
                {c.pairing}
              </p>
              <p className="mt-4 max-w-[32rem] text-lg leading-relaxed text-ink-soft">{c.tagline}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={`/creations/${c.slug}`} className="btn btn-primary">
                  Découvrir {c.name}
                </Link>
                {c.quick && (
                  <AddToCartButton variantId={c.quick.id} label={<>Ajouter · {euros(c.quick.priceCents)}</>} className="btn btn-outline" ariaLabel={`Ajouter · ${euros(c.quick.priceCents)} : ${c.name} (${c.quick.label}) au panier`} />
                )}
                {!c.quick && c.fromCents !== null && <span className="t-small text-ink-soft">dès {euros(c.fromCents)}</span>}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* la création, en tirage incliné qui déborde sur la matière */}
        <div className="pointer-events-none absolute bottom-[calc(100%-56svh)] right-[var(--gutter)] md:bottom-auto md:left-[50%] md:right-auto md:top-1/2 md:-translate-y-1/2">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.figure
              key={c.slug}
              className="print-inset bg-cream p-[6px] shadow-[0_34px_64px_-22px_rgba(36,23,19,.7)]"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 46, rotate: -9 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, rotate: -3 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -30, rotate: 4 }}
              transition={{ duration: 0.85, ease: EASE, delay: reduce ? 0 : 0.15 }}
            >
              <span className="relative block overflow-hidden" style={{ aspectRatio: `${c.product.w} / ${c.product.h}` }}>
                <Image src={c.product.url} alt={c.product.alt} fill sizes="(max-width: 767px) 44vw, 280px" quality={85} className="object-cover" />
              </span>
              <figcaption className="px-1 pb-0.5 pt-2 text-center text-[0.62rem] tracking-[0.14em] text-ink-soft">{c.product.w === c.product.h ? "LE CŒUR · VISUEL CONCEPTUEL" : "VISUEL CONCEPTUEL"}</figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
      </div>

      {/* sélection des six créations */}
      <div className="container-luxe relative z-[3] pb-10 md:pb-14">
        <ul className="no-scrollbar -mx-[var(--gutter)] flex gap-3 overflow-x-auto px-[var(--gutter)] md:mx-0 md:gap-5 md:px-0" role="tablist" aria-label="Choisir une création Signature">
          {creations.map((cr, k) => (
            <li key={cr.slug} role="presentation" className="shrink-0">
              <button type="button" role="tab" aria-selected={k === i} onClick={() => go(k)} className="group flex items-center gap-3 py-2 text-left">
                <span className={`relative block h-14 w-12 overflow-hidden rounded-t-[50%_38%] ring-1 transition-all duration-500 ${k === i ? "ring-bronze" : "ring-chocolate/15 opacity-60 group-hover:opacity-100"}`}>
                  <Image src={cr.product.url} alt="" fill sizes="48px" className="object-cover" />
                </span>
                <span className={`relative t-small transition-colors ${k === i ? "text-ink" : "text-ink-soft group-hover:text-ink"}`}>
                  {cr.name}
                  <span className={`absolute -bottom-1 left-0 h-px bg-bronze transition-all duration-500 ${k === i ? "w-full" : "w-0"}`} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
