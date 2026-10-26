"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { BoxPreview, DateThumb, type FlavorSwatch } from "@/components/configurator/box-preview";
import { FLIGHT_S, useFlights } from "@/components/configurator/fly";

const FORMATS = [6, 12, 24] as const;

/**
 * Composer son coffret, en direct sur l'accueil : on choisit un format (le coffret se redessine), on touche une
 * création et sa datte rejoint son alvéole ; le compteur suit, puis le configurateur reprend la sélection.
 * L'aperçu est une représentation graphique du coffret (alvéoles), distincte des photographies de produit.
 */
export function ComposeTeaser({ flavors }: { flavors: FlavorSwatch[] }) {
  const reduce = useReducedMotion();
  const [pieces, setPieces] = useState<(typeof FORMATS)[number]>(6);
  const [slots, setSlots] = useState<string[]>([]);
  const map = useMemo(() => new Map(flavors.map((f) => [f.slug, f])), [flavors]);
  const { launch, layer } = useFlights(reduce);
  const boxRef = useRef<HTMLDivElement>(null);
  const [incoming, setIncoming] = useState<Set<number>>(() => new Set());
  const left = pieces - slots.length;
  const full = left === 0;
  const selection = Object.entries(slots.reduce<Record<string, number>>((a, s) => ({ ...a, [s]: (a[s] ?? 0) + 1 }), {}))
    .map(([s, q]) => `${s}:${q}`)
    .join(",");
  const last = slots.length ? map.get(slots[slots.length - 1]) : undefined;

  const add = (f: FlavorSwatch, source: Element | null) => {
    if (slots.length >= pieces) return;
    const index = slots.length;
    if (launch(f, source, boxRef.current?.querySelector(`[data-slot="${index}"]`))) {
      setIncoming((s) => new Set(s).add(index));
      window.setTimeout(() => setIncoming((s) => { const n = new Set(s); n.delete(index); return n; }), FLIGHT_S * 1000 + 80);
    }
    setSlots((s) => (s.length < pieces ? [...s, f.slug] : s));
  };

  return (
    <section className="relative overflow-hidden bg-[#efe2cc] section-pad" aria-labelledby="compose-title">
      <div aria-hidden className="pointer-events-none absolute -right-[10vw] top-1/2 size-[70vmin] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(169,116,68,.22),transparent)]" />
      <div className="container-luxe relative grid items-center gap-14 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="t-eyebrow text-bronze">Sur mesure</p>
          <h2 id="compose-title" className="section-title mt-4 max-w-[10ch]">
            Composez <em className="text-bronze">votre</em> coffret
          </h2>
          <p className="mt-6 max-w-[44ch] text-ink-soft">Choisissez un format, puis touchez une création : sa datte rejoint son alvéole. Touchez une datte du coffret pour la retirer.</p>

          <div className="mt-8 inline-flex border border-chocolate/20 p-1" role="radiogroup" aria-label="Format du coffret">
            {FORMATS.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={pieces === n}
                onClick={() => {
                  setPieces(n);
                  setSlots((s) => s.slice(0, n));
                }}
                className={clsx("relative px-5 py-2.5 t-small transition-colors", pieces === n ? "text-ivory" : "text-ink hover:text-bronze")}
              >
                {pieces === n && <motion.span layoutId="compose-format" className="absolute inset-0 bg-chocolate" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span className="relative">{n} pièces</span>
              </button>
            ))}
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Créations disponibles">
            {flavors.map((f) => (
              <li key={f.slug}>
                <button
                  type="button"
                  disabled={full}
                  onClick={(e) => add(f, e.currentTarget.querySelector("[data-thumb]"))}
                  className="group flex w-full items-center gap-3 border border-chocolate/15 bg-cream/80 p-2 pr-3 text-left t-small transition-[border-color,background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-chocolate hover:shadow-[0_10px_24px_-14px_rgba(36,23,19,.5)] active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  <span data-thumb className="block h-8 w-12 shrink-0">
                    <DateThumb f={f} className="size-full" />
                  </span>
                  <span className="leading-tight">{f.name}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center gap-4" aria-live="polite">
            <div className="h-px flex-1 bg-chocolate/15">
              <motion.div className="h-px bg-bronze" animate={{ width: `${(slots.length / pieces) * 100}%` }} transition={{ duration: 0.5 }} />
            </div>
            <p className="relative h-6 min-w-[4.5rem] overflow-hidden text-right t-small tabular-nums">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={`${slots.length}/${pieces}`} className="block" initial={reduce ? false : { y: "100%" }} animate={{ y: "0%" }} exit={reduce ? { opacity: 0 } : { y: "-100%" }} transition={{ duration: 0.35 }}>
                  {slots.length} / {pieces}
                </motion.span>
              </AnimatePresence>
              <span className="sr-only">{full ? " : votre coffret est complet." : ` : il reste ${left} place${left > 1 ? "s" : ""}.`}</span>
            </p>
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={full ? "full" : last?.slug ?? "empty"} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 h-6 t-small text-ink-soft">
              {full ? "Votre coffret est complet." : last ? `${last.name} ajoutée.` : "Votre coffret attend sa première datte."}
            </motion.p>
          </AnimatePresence>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/composer-mon-coffret?format=${pieces}${selection ? `&selection=${encodeURIComponent(selection)}` : ""}`} className={clsx("btn", full ? "btn-primary" : "btn-outline")}>
              {slots.length ? "Continuer dans le configurateur" : "Ouvrir le configurateur"}
            </Link>
            {slots.length > 0 && (
              <button className="btn px-3 link-draw [background-size:0_1px] hover:[background-size:100%_1px]" onClick={() => setSlots([])}>
                Vider
              </button>
            )}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-2xl [perspective:1400px]" ref={boxRef}>
          <div aria-hidden className={clsx("pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(199,160,106,.5),transparent_65%)] blur-2xl transition-opacity duration-1000", full ? "opacity-100" : "opacity-0")} />
          <motion.div key={pieces} initial={reduce ? false : { opacity: 0, rotateX: 22, y: 30, scale: 0.94 }} animate={{ opacity: 1, rotateX: 0, y: 0, scale: full && !reduce ? [1, 1.025, 1] : 1 }} transition={{ duration: 0.8, ease: [0.22, 0.8, 0.12, 1] }}>
            <BoxPreview pieces={pieces} slots={slots} flavors={map} onRemoveAt={(i) => setSlots((s) => s.filter((_, j) => j !== i))} incoming={incoming} landDelay={FLIGHT_S} className="relative w-full" />
          </motion.div>
          <p className="mt-6 text-center t-micro text-ink-soft">Représentation du format · les vignettes reprennent les visuels conceptuels de chaque création.</p>
        </div>
      </div>
      {layer}
    </section>
  );
}
