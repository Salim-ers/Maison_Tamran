"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BoxPreview, DateThumb, type FlavorSwatch } from "@/components/configurator/box-preview";

const PIECES = 6;

/** Avant-goût du configurateur : on remplit un coffret Découverte en touchant les saveurs. */
export function ComposeTeaser({ flavors }: { flavors: FlavorSwatch[] }) {
  const reduce = useReducedMotion();
  const [slots, setSlots] = useState<string[]>([]);
  const map = useMemo(() => new Map(flavors.map((f) => [f.slug, f])), [flavors]);
  const left = PIECES - slots.length;
  const full = left === 0;
  const selection = Object.entries(slots.reduce<Record<string, number>>((a, s) => ({ ...a, [s]: (a[s] ?? 0) + 1 }), {}))
    .map(([s, q]) => `${s}:${q}`)
    .join(",");
  const last = slots.length ? map.get(slots[slots.length - 1]) : undefined;

  return (
    <section className="relative overflow-hidden bg-sand/45 section-pad" aria-labelledby="compose-title">
      <div className="container-luxe grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="t-eyebrow text-bronze">Sur mesure</p>
          <h2 id="compose-title" className="mt-4 t-display-l max-w-[11ch]">Composez votre coffret</h2>
          <p className="mt-6 max-w-[46ch] text-ink-soft">
            Six, douze ou vingt-quatre pièces, dans l&apos;ordre de votre choix. Essayez ici avec un coffret Découverte : touchez une création pour la placer, touchez une datte dans le coffret pour la retirer.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Créations disponibles">
            {flavors.map((f) => (
              <li key={f.slug}>
                <button
                  type="button"
                  disabled={full}
                  onClick={() => setSlots((s) => (s.length < PIECES ? [...s, f.slug] : s))}
                  className="group flex w-full items-center gap-3 border border-line bg-cream/80 p-2 pr-3 text-left t-small transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-chocolate active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  <DateThumb f={f} className="h-8 w-12 shrink-0" />
                  <span className="leading-tight">{f.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-4" aria-live="polite">
            <div className="h-px flex-1 bg-line">
              <motion.div className="h-px bg-bronze" animate={{ width: `${(slots.length / PIECES) * 100}%` }} transition={{ duration: 0.5 }} />
            </div>
            <p className="t-small tabular-nums">
              {slots.length} / {PIECES}
              <span className="sr-only">{full ? " : votre coffret est complet." : ` : il reste ${left} place${left > 1 ? "s" : ""}.`}</span>
            </p>
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={full ? "full" : last?.slug ?? "empty"} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 h-6 t-small text-ink-soft">
              {full ? "Votre coffret est complet." : last ? `${last.name} ajoutée.` : "Votre coffret attend sa première datte."}
            </motion.p>
          </AnimatePresence>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/composer-mon-coffret?format=${PIECES}${selection ? `&selection=${encodeURIComponent(selection)}` : ""}`} className={clsx("btn", full ? "btn-primary" : "btn-outline")}>
              {slots.length ? "Continuer dans le configurateur" : "Ouvrir le configurateur"}
            </Link>
            {slots.length > 0 && (
              <button className="btn px-3 link-draw [background-size:0_1px] hover:[background-size:100%_1px]" onClick={() => setSlots([])}>
                Vider
              </button>
            )}
          </div>
        </div>
        <motion.div animate={full && !reduce ? { scale: [1, 1.02, 1] } : { scale: 1 }} transition={{ duration: 0.8 }} className="relative mx-auto w-full max-w-xl">
          <div aria-hidden className={clsx("pointer-events-none absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(199,160,106,.45),transparent_65%)] blur-2xl transition-opacity duration-1000", full ? "opacity-100" : "opacity-0")} />
          <BoxPreview pieces={PIECES} slots={slots} flavors={map} onRemoveAt={(i) => setSlots((s) => s.filter((_, j) => j !== i))} className="relative w-full" />
          <p className="mt-6 text-center t-micro text-ink-soft">Aperçu du principe : les vignettes reprennent les visuels conceptuels de chaque création.</p>
        </motion.div>
      </div>
    </section>
  );
}
