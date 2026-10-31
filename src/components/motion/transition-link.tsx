"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// Navigation en cours dans une transition de vue : résolue quand la nouvelle page est rendue.
let pending: (() => void) | null = null;

/** Signale la fin d'une navigation (changement d'adresse rendu) à la transition de vue qui l'attend. */
export function ViewTransitionsListener() {
  const path = usePathname();
  useEffect(() => {
    if (!pending) return;
    const resolve = pending;
    pending = null;
    // la nouvelle page doit être rendue (et non son squelette de chargement) avant la capture
    // (le navigateur suspend requestAnimationFrame pendant la mise à jour : on interroge par minuterie)
    const start = performance.now();
    const ready = () => {
      if (!document.querySelector('main [aria-busy="true"]') || performance.now() - start > 1500) resolve();
      else window.setTimeout(ready, 30);
    };
    ready();
  }, [path]);
  return null;
}

type Props = React.ComponentProps<typeof Link> & { href: string; direction?: "nav-forward" | "nav-back" };

/**
 * Lien qui change de page dans une transition de vue (API View Transitions du navigateur) : les éléments qui
 * portent le même `view-transition-name` sur les deux pages glissent de l'une à l'autre (la photo d'une
 * création, du catalogue à sa fiche), le reste de la page part dans le sens de la navigation.
 * Sans prise en charge du navigateur, avec « réduire les animations » ou avec une touche de modification
 * (nouvel onglet…), c'est un lien ordinaire.
 */
export function TransitionLink({ href, direction = "nav-forward", onClick, ...rest }: Props) {
  const router = useRouter();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (typeof document.startViewTransition !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        e.preventDefault();
        const root = document.documentElement;
        root.dataset.vt = direction;
        // seule la photo de la carte cliquée porte le nom partagé avec la page d'arrivée
        const shared = e.currentTarget.closest("article")?.querySelector<HTMLElement>("[data-vt-name]");
        if (shared) shared.style.viewTransitionName = shared.dataset.vtName ?? "";
        const transition = document.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              pending = resolve;
              router.push(href);
              // filet de sécurité : la page ne reste jamais figée si la navigation tarde
              window.setTimeout(resolve, 2500);
            })
        );
        transition.finished.finally(() => delete root.dataset.vt);
      }}
    />
  );
}
