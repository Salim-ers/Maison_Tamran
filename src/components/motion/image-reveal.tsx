"use client";

import { useEffect } from "react";

/**
 * Les images du contenu apparaissent en fondu au moment où elles finissent de charger (ni aperçu flou : voir
 * globals.css, ni image qui surgit d'un coup). Le fondu passe par l'API Web Animations : aucun attribut n'est
 * ajouté au DOM, donc aucun écart avec le rendu serveur, même dans les blocs hydratés plus tard. Une image déjà
 * chargée s'affiche telle quelle ; `data-instant` sur un conteneur supprime le fondu (pièces posées dans le coffret).
 */
export function ImageReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onLoad = (e: Event) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement) || !img.closest("main") || img.closest("[data-instant]")) return;
      // une seule image clé, posée au départ : de transparent à l'opacité propre de l'image (une vignette masquée
      // le reste). Sans `offset: 0`, l'image clé unique serait l'arrivée, et le fondu irait vers le transparent.
      img.animate([{ opacity: 0, offset: 0 }], { duration: 900, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
    };
    document.addEventListener("load", onLoad, true);
    return () => document.removeEventListener("load", onLoad, true);
  }, []);
  return null;
}
