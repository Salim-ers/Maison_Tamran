"use client";

import { MotionConfig } from "motion/react";
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const m = window.matchMedia(QUERY);
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
}

/**
 * Préférence « réduire les animations », identique côté serveur et à l'hydratation (false),
 * puis mise à jour dans le navigateur : évite les écarts d'hydratation de la version de Motion.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}

/** Motion respecte la préférence de l'utilisateur pour toutes les animations (déplacements supprimés). */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
