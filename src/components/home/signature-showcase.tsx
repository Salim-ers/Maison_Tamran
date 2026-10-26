"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { clsx } from "clsx";
import type { ImageRef } from "@/db/schema";
import { euros } from "@/lib/money";
import { ConceptBadge } from "@/components/ui/media";

export interface ShowcaseProduct {
  slug: string;
  number: number;
  name: string;
  pairing: string;
  tagline: string;
  chocolateLabel: string;
  fromCents: number | null;
  accent: string;
  tasting: { attaque: string; coeur: string; finale: string } | null;
  main: ImageRef | null;
  cut: ImageRef | null;
}

const EASE = [0.22, 0.8, 0.12, 1] as const;

/**
 * Scène principale : la vue d'ensemble de la création ; au survol (ou au toucher du bouton),
 * le cœur se dévoile dans un cercle qui s'ouvre depuis le pointeur.
 */
function Stage({ p, reveal, onReveal }: { p: ShowcaseProduct; reveal: boolean; onReveal: (v: boolean) => void }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState({ x: 60, y: 55 });
  return (
    <div
      ref={ref}
      className="relative aspect-[4/5] w-full overflow-hidden bg-sand/40"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = ref.current!.getBoundingClientRect();
        setOrigin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onPointerEnter={(e) => e.pointerType === "mouse" && onReveal(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && onReveal(false)}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={p.slug}
          className="absolute inset-0"
          initial={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 0% 100%)", scale: 1.08 }}
          animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: reduce ? 0.2 : 1, ease: EASE }}
        >
          {p.main && <Image src={p.main.url} alt={p.main.alt} fill sizes="(min-width: 1024px) 46vw, 100vw" quality={85} placeholder={p.main.blur ? "blur" : "empty"} blurDataURL={p.main.blur} className="object-cover" />}
          {p.cut && (
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={{ clipPath: reveal ? `circle(150% at ${origin.x}% ${origin.y}%)` : `circle(0% at ${origin.x}% ${origin.y}%)` }}
              transition={{ duration: reduce ? 0 : 0.9, ease: EASE }}
            >
              <Image src={p.cut.url} alt={p.cut.alt} fill sizes="(min-width: 1024px) 46vw, 100vw" quality={85} className="object-cover" />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,rgba(36,23,19,.55),transparent)]" aria-hidden />
      <p className="pointer-events-none absolute bottom-4 left-5 t-micro tracking-[0.18em] text-ivory/85">{reveal ? "LE CŒUR" : "SURVOLEZ POUR DÉCOUVRIR LE CŒUR"}</p>
      {p.main?.concept && <ConceptBadge tone="dark" label={p.main.badge} className="right-3 top-3" />}
    </div>
  );
}

/** Les six créations Signature : scène éditoriale + sommaire sur ordinateur, carrousel tactile sur mobile. */
export function SignatureShowcase({ products, intro }: { products: ShowcaseProduct[]; intro: string }) {
  const [active, setActive] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [mobileHeart, setMobileHeart] = useState<string | null>(null);
  const p = products[active];
  if (!p) return null;

  return (
    <section className="relative overflow-hidden bg-ivory section-pad" aria-labelledby="signature-title">
      {/* halo coloré qui suit la création active */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-[20%] top-[10%] size-[70vw] rounded-full opacity-[0.16] blur-3xl"
        animate={{ backgroundColor: p.accent }}
        transition={{ duration: 1.2 }}
      />
      <div className="container-luxe relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="t-eyebrow text-bronze">Collection Signature</p>
            <h2 id="signature-title" className="mt-4 t-display-l max-w-[13ch]">Six créations, six voyages</h2>
          </div>
          <p className="max-w-[44ch] text-ink-soft">{intro}</p>
        </div>

        {/* Ordinateur : scène + sommaire */}
        <div className="mt-16 hidden gap-16 lg:grid lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Stage p={p} reveal={reveal} onReveal={setReveal} />
          </div>
          <div className="lg:col-span-6">
            <ol className="border-t hairline" aria-label="Créations Signature">
              {products.map((q, i) => {
                const on = i === active;
                return (
                  <li key={q.slug} className="border-b hairline">
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={() => setActive(i)}
                      aria-expanded={on}
                      className="group flex w-full items-baseline gap-6 py-5 text-left"
                    >
                      <span className="t-numeral w-10 text-lg text-bronze">N°{String(q.number).padStart(2, "0")}</span>
                      <span className={clsx("font-display text-[clamp(1.6rem,2.4vw,2.4rem)] leading-none transition-[color,transform] duration-500", on ? "translate-x-2 text-ink" : "text-ink/45 group-hover:text-ink/80")}>
                        {q.name}
                      </span>
                      <span className="ml-auto t-small tabular-nums text-ink-soft">{q.fromCents != null ? `dès ${euros(q.fromCents)}` : ""}</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.6, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <div className="pb-7 pl-16">
                            <p className="text-ink-soft">{q.pairing}</p>
                            <p className="mt-2 font-display text-xl italic">{q.tagline}</p>
                            {q.tasting && (
                            <dl className="mt-5 grid grid-cols-3 gap-4 t-small">
                              {(["attaque", "coeur", "finale"] as const).map((k) => (
                                <div key={k}>
                                  <dt className="t-micro uppercase tracking-[0.16em] text-bronze">{k === "coeur" ? "Cœur" : k[0].toUpperCase() + k.slice(1)}</dt>
                                  <dd className="mt-1 text-ink-soft">{q.tasting![k]}</dd>
                                </div>
                              ))}
                            </dl>
                            )}
                            <div className="mt-6 flex flex-wrap items-center gap-5">
                              <Link href={`/creations/${q.slug}`} className="btn btn-primary">Découvrir la création</Link>
                              <span className="t-small text-ink-soft">{q.chocolateLabel}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Mobile et tablette : carrousel tactile à défilement natif */}
        <ul className="no-scrollbar -mx-[var(--gutter)] mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-2 lg:hidden" aria-label="Créations Signature">
          {products.map((q) => {
            const heart = mobileHeart === q.slug;
            return (
              <li key={q.slug} className="w-[82%] shrink-0 snap-center sm:w-[46%]">
                <div className="relative aspect-[4/5] overflow-hidden bg-sand/40">
                  {q.main && <Image src={q.main.url} alt={q.main.alt} fill sizes="(min-width: 640px) 46vw, 82vw" quality={75} className="object-cover" />}
                  {q.cut && (
                    <div className={clsx("absolute inset-0 transition-[clip-path] duration-700 ease-[var(--ease-luxe)]", heart ? "[clip-path:circle(150%_at_50%_60%)]" : "[clip-path:circle(0%_at_50%_60%)]")}>
                      <Image src={q.cut.url} alt={q.cut.alt} fill sizes="(min-width: 640px) 46vw, 82vw" quality={75} className="object-cover" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setMobileHeart(heart ? null : q.slug)}
                    aria-pressed={heart}
                    className="absolute bottom-3 left-3 bg-chocolate/75 px-3 py-2 t-micro tracking-[0.14em] text-ivory backdrop-blur-sm"
                  >
                    {heart ? "VOIR LA CRÉATION" : "VOIR LE CŒUR"}
                  </button>
                  {q.main?.concept && <ConceptBadge tone="dark" label={q.main.badge} className="right-3 top-3" />}
                </div>
                <p className="mt-4 t-numeral text-bronze">N°{String(q.number).padStart(2, "0")}</p>
                <h3 className="font-display text-2xl leading-tight">
                  <Link href={`/creations/${q.slug}`}>{q.name}</Link>
                </h3>
                <p className="mt-1 t-small text-ink-soft">{q.pairing}</p>
                <p className="mt-2 t-small tabular-nums">{q.fromCents != null ? `dès ${euros(q.fromCents)}` : ""}</p>
              </li>
            );
          })}
        </ul>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link href="/collections/signature" className="btn btn-outline">Toute la collection Signature</Link>
          <Link href="/creations" className="btn px-2 link-draw">Toutes les créations</Link>
        </div>
      </div>
    </section>
  );
}
