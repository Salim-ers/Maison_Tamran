"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// Navigation en cours dans une transition de vue : résolue quand la nouvelle page est rendue.
let pending: (() => void) | null = null;

/** Images de la nouvelle page visibles à l'écran : on leur laisse un court instant pour arriver avant le dévoilement. */
function viewportImages(max: number) {
  const imgs = [...document.querySelectorAll<HTMLImageElement>("main img")].filter((img) => {
    if (img.complete) return false;
    const r = img.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
  });
  // une image paresseuse ne se charge pas tant que l'affichage est suspendu : on la demande tout de suite
  for (const img of imgs) img.loading = "eager";
  const loaded = imgs.map((img) => new Promise<void>((done) => {
    img.addEventListener("load", () => done(), { once: true });
    img.addEventListener("error", () => done(), { once: true });
  }));
  return Promise.race([Promise.all(loaded), new Promise<void>((done) => window.setTimeout(done, max))]);
}

/**
 * Signale la fin d'une navigation (changement d'adresse rendu) à la transition de vue qui l'attend. Une navigation
 * sans transition de vue (retour arrière, avancer) fait simplement apparaître la nouvelle page en fondu.
 */
export function ViewTransitionsListener() {
  const path = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!pending) {
      const main = document.querySelector("main");
      if (!main || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      main.classList.remove("page-enter");
      void main.offsetWidth;
      main.classList.add("page-enter");
      const t = window.setTimeout(() => main.classList.remove("page-enter"), 900);
      return () => window.clearTimeout(t);
    }
    const resolve = pending;
    pending = null;
    // la nouvelle page doit être rendue (et non son squelette de chargement) avant la capture
    // (le navigateur suspend requestAnimationFrame pendant la mise à jour : on interroge par minuterie)
    const start = performance.now();
    const ready = () => {
      if (!document.querySelector('main [aria-busy="true"]') || performance.now() - start > 1500) void viewportImages(350).then(resolve);
      else window.setTimeout(ready, 30);
    };
    ready();
  }, [path]);
  return null;
}

type Direction = "page" | "nav-forward" | "nav-back";
type Props = React.ComponentProps<typeof Link> & { href: string; direction?: Direction };

/** Navigation interne vers une autre page (ni nouvel onglet, ni ancre, ni simple changement de paramètres). */
function isPageChange(href: string, target?: string) {
  if (target && target !== "_self") return false;
  if (!href.startsWith("/") || href.startsWith("//")) return false;
  const url = new URL(href, window.location.href);
  return url.pathname !== window.location.pathname;
}

/**
 * Lien du site : chaque changement de page se fait dans une transition de vue (API View Transitions du
 * navigateur). Par défaut (« page ») l'ancienne page s'efface en remontant légèrement, la nouvelle se lève à sa
 * place ; « nav-forward » / « nav-back » font glisser la page dans le sens de la lecture (création suivante,
 * précédente). Les éléments qui portent le même `view-transition-name` sur les deux pages glissent de l'une à
 * l'autre (la photo d'une création, du catalogue à sa fiche). L'en-tête ne bouge pas.
 * Sans prise en charge du navigateur, avec « réduire les animations », une touche de modification, un nouvel
 * onglet ou une ancre, c'est un lien ordinaire.
 */
export function TransitionLink({ href, direction = "page", onClick, ...rest }: Props) {
  const router = useRouter();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.currentTarget.hasAttribute("download")) return;
        if (typeof document.startViewTransition !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (!isPageChange(href, rest.target)) return;
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
              if (rest.replace) router.replace(href, { scroll: rest.scroll !== false });
              else router.push(href, { scroll: rest.scroll !== false });
              // filet de sécurité : la page ne reste jamais figée si la navigation tarde
              window.setTimeout(() => {
                if (pending === resolve) pending = null;
                resolve();
              }, 1800);
            })
        );
        transition.finished.finally(() => delete root.dataset.vt);
      }}
    />
  );
}

export default TransitionLink;
