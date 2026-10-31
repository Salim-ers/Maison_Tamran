import { photo } from "@/lib/photos";
import type { HeaderMenus, MenuFeature } from "./site-header";

function feature(id: string, href: string, title: string, text: string): MenuFeature {
  const p = photo(id);
  return { href, title, text, image: p ? { url: p.url, alt: p.alt, blur: p.blur } : null };
}

/** Cartes illustrées des menus déroulants de l'en-tête. */
export function headerMenus(): HeaderMenus {
  return {
    creations: [
      feature("produit-or-de-marrakech", "/collections/signature", "Collection Signature", "Six créations, de l'Éclipse Noire au Rouge Désir."),
      feature("produit-rose-de-nuit", "/collections/ephemere", "Collection Éphémère", "Quatre recettes de saison, en petites séries."),
    ],
    maison: [
      feature("atelier-ingredients", "/savoir-faire", "Le savoir-faire", "De la datte Medjool à la création."),
      feature("rituel-cafe", "/maison", "Notre Maison", "L'art de recevoir et de partager."),
    ],
  };
}
