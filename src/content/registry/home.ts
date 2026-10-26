import type { ContentEntry } from "../types";

export const homeHero = {
  key: "home.hero",
  label: "Accueil : ouverture",
  page: "/",
  fields: [
    { name: "title", label: "Accroche (retours à la ligne conservés)", type: "textarea" },
    { name: "subtitle", label: "Sous-texte", type: "textarea" },
    { name: "ctaPrimary", label: "Bouton principal", type: "text" },
    { name: "ctaSecondary", label: "Bouton secondaire", type: "text" },
  ],
  defaults: {
    title: "L'art de\nsublimer\nla datte.",
    subtitle: "La datte Medjool rencontre la gourmandise des grands chocolats. Découvrez nos créations et nos coffrets imaginés pour offrir une expérience singulière.",
    ctaPrimary: "Découvrir les créations",
    ctaSecondary: "Composer mon coffret",
  },
} satisfies ContentEntry;

export const homeMaison = {
  key: "home.maison",
  label: "Accueil : la Maison",
  page: "/",
  fields: [
    { name: "title", label: "Titre", type: "text" },
    { name: "body", label: "Texte", type: "textarea" },
    { name: "signature", label: "Signature", type: "text" },
  ],
  defaults: {
    title: "Une maison née d'un fruit",
    body: "MAISON TAMRĀN part d'une conviction simple : la datte Medjool mérite le même soin qu'un grand cacao ou qu'un grand cru. Nous la traitons comme une matière de pâtisserie, avec ses accords, sa saisonnalité, ses éditions rares. Chaque recette naît d'un voyage, d'un souvenir ou d'une rencontre de saveurs, puis se resserre jusqu'à tenir en une bouchée.",
    signature: "L'art de sublimer la datte.",
  },
} satisfies ContentEntry;

export const HOME_ENTRIES: ContentEntry[] = [homeHero, homeMaison];
