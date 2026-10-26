"use client";

import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DateThumb, type FlavorSwatch } from "./box-preview";

/** Durée du vol d'une datte vers son alvéole (s). L'alvéole attend la fin du vol pour afficher la datte. */
export const FLIGHT_S = 0.62;

type Rect = { x: number; y: number; w: number; h: number };
type Flight = { id: number; f: FlavorSwatch; from: Rect; to: Rect };

const rect = (el: Element): Rect => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};

/**
 * Vol d'une datte : la vignette de la création choisie quitte son bouton et rejoint, en arc, l'alvéole
 * qu'elle va occuper dans l'aperçu du coffret. Purement visuel (le coffret est mis à jour immédiatement) ;
 * rien ne s'affiche si l'utilisateur réduit les animations.
 */
export function useFlights(reduce: boolean) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const seq = useRef(0);

  const launch = useCallback(
    (f: FlavorSwatch, from: Element | null | undefined, to: Element | null | undefined) => {
      if (reduce || !from || !to) return false;
      const id = ++seq.current;
      setFlights((l) => [...l, { id, f, from: rect(from), to: rect(to) }]);
      return true;
    },
    [reduce],
  );

  // rien n'est rendu tant qu'aucune datte ne vole (même rendu côté serveur et à l'hydratation)
  const layer =
    flights.length === 0 || typeof document === "undefined"
      ? null
      : createPortal(
          <div aria-hidden className="pointer-events-none fixed inset-0 z-[70]">
            {flights.map((fl) => {
              const { from, to } = fl;
              // sommet de l'arc : au-dessus des deux points, mais jamais sous l'en-tête
              const peak = Math.max(96, Math.min(from.y, to.y) - Math.max(40, Math.abs(to.x - from.x) * 0.12));
              return (
                <motion.div
                  key={fl.id}
                  className="absolute left-0 top-0"
                  style={{ width: to.w * 0.88, height: to.h * 0.88 }}
                  initial={{ x: from.x, y: from.y, scale: Math.max(0.6, from.w / to.w), rotate: -10, opacity: 1 }}
                  animate={{
                    x: [from.x, (from.x + to.x) / 2, to.x + to.w * 0.06],
                    y: [from.y, peak, to.y + to.h * 0.06],
                    scale: [Math.max(0.6, from.w / to.w), 1.12, 1],
                    rotate: [-10, 8, 0],
                  }}
                  transition={{ duration: FLIGHT_S, ease: [0.45, 0, 0.2, 1], times: [0, 0.5, 1] }}
                  onAnimationComplete={() => setFlights((l) => l.filter((x) => x.id !== fl.id))}
                >
                  <DateThumb f={fl.f} className="size-full shadow-[0_14px_24px_rgba(0,0,0,.45)] ring-1 ring-[#c7a06a]/50" />
                </motion.div>
              );
            })}
          </div>,
          document.body,
        );

  return { launch, layer, flying: flights.length > 0 };
}
