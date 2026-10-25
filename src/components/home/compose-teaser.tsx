"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { BoxPreview, type FlavorSwatch } from "@/components/configurator/box-preview";

/** Avant-goût du configurateur : on remplit un coffret de six en touchant les saveurs. */
export function ComposeTeaser({ flavors }: { flavors: FlavorSwatch[] }) {
  const [slots, setSlots] = useState<string[]>([]);
  const map = useMemo(() => new Map(flavors.map((f) => [f.slug, f])), [flavors]);
  const left = 6 - slots.length;
  const selection = Object.entries(slots.reduce<Record<string, number>>((a, s) => ({ ...a, [s]: (a[s] ?? 0) + 1 }), {}))
    .map(([s, q]) => `${s}:${q}`)
    .join(",");

  return (
    <section className="section-pad bg-cream" aria-labelledby="compose-title">
      <div className="container-luxe grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 id="compose-title" className="t-display-l max-w-[11ch]">Composez votre sélection</h2>
          <p className="mt-6 max-w-[44ch] text-ink-soft">
            Six, douze ou vingt-quatre pièces, dans l&apos;ordre de votre choix. Essayez ici avec un coffret Découverte : touchez une saveur pour la placer, touchez une datte pour la retirer.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Saveurs disponibles">
            {flavors.map((f) => (
              <li key={f.slug}>
                <button
                  type="button"
                  disabled={left === 0}
                  onClick={() => setSlots((s) => (s.length < 6 ? [...s, f.slug] : s))}
                  className="flex items-center gap-2 border hairline bg-ivory px-3 py-2 t-small transition-colors hover:border-chocolate disabled:opacity-40"
                >
                  <span className="size-2.5 rounded-full" style={{ background: f.accent }} aria-hidden />
                  {f.name}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-6 t-small" aria-live="polite">
            {left === 0 ? "Votre coffret est complet." : `Il reste ${left} place${left > 1 ? "s" : ""}.`}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/composer-mon-coffret?format=6${selection ? `&selection=${encodeURIComponent(selection)}` : ""}`} className={clsx("btn", left === 0 ? "btn-primary" : "btn-outline")}>
              {slots.length ? "Continuer dans le configurateur" : "Ouvrir le configurateur"}
            </Link>
            {slots.length > 0 && (
              <button className="btn px-3 link-draw [background-size:0_1px] hover:[background-size:100%_1px]" onClick={() => setSlots([])}>
                Vider
              </button>
            )}
          </div>
        </div>
        <BoxPreview pieces={6} slots={slots} flavors={map} onRemoveAt={(i) => setSlots((s) => s.filter((_, j) => j !== i))} className="mx-auto w-full max-w-xl" />
      </div>
    </section>
  );
}
