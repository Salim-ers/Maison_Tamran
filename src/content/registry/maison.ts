import type { ContentEntry } from "../types";

export const maisonOuverture = {
  key: "maison.ouverture",
  label: "Notre Maison : ouverture",
  page: "/maison",
  fields: [
    { name: "title", label: "Titre", type: "text" },
    { name: "lead", label: "Chapeau", type: "textarea" },
    { name: "quote", label: "Phrase mise en exergue", type: "textarea" },
  ],
  defaults: {
    title: "Notre Maison",
    lead: "MAISON TAMRĀN est une nouvelle maison française. Elle part d'un fruit, la datte Medjool, et lui applique l'exigence de la haute chocolaterie : le choix de la matière, la justesse des accords, le soin de l'objet que l'on offre.",
    quote: "Nous voulions qu'une datte se déguste comme un bonbon de chocolat : lentement, et en sachant ce que l'on goûte.",
  },
} satisfies ContentEntry;

export const maisonManifeste = {
  key: "maison.manifeste",
  label: "Notre Maison : manifeste",
  page: "/maison",
  fields: [
    { name: "title", label: "Titre de la section", type: "text" },
    { name: "matiereTitle", label: "Chapitre 1 : titre", type: "text" },
    { name: "matiereBody", label: "Chapitre 1 : texte", type: "textarea" },
    { name: "accordTitle", label: "Chapitre 2 : titre", type: "text" },
    { name: "accordBody", label: "Chapitre 2 : texte", type: "textarea" },
    { name: "objetTitle", label: "Chapitre 3 : titre", type: "text" },
    { name: "objetBody", label: "Chapitre 3 : texte", type: "textarea" },
  ],
  defaults: {
    title: "Ce que nous cherchons",
    matiereTitle: "La datte comme matière",
    matiereBody: "Nous ne voyons pas la datte comme un fruit sec que l'on grignote, mais comme une matière de pâtisserie. Sa chair dense, ses notes de miel et de caramel, sa tenue sous la lame : la Medjool a la générosité d'un fondant et la structure d'une confiserie. Elle apporte la douceur ; à nous de lui trouver un partenaire à sa mesure.",
    accordTitle: "L'accord",
    accordBody: "Chaque création réunit trois éléments : le fruit, un cœur, un chocolat. Nous cherchons le point où ils se répondent en une seule bouchée. Un agrume qui réveille le caramel du fruit, une torréfaction qui prolonge le cacao, un trait de sel qui allonge la finale.",
    objetTitle: "L'objet que l'on offre",
    objetBody: "Une datte MAISON TAMRĀN se donne autant qu'elle se goûte. Le coffret, ses calages, la carte qui raconte chaque recette : l'écrin fait partie de la création. Il annonce la manière de déguster avant même la première bouchée.",
  },
} satisfies ContentEntry;

export const maisonValeurs = {
  key: "maison.valeurs",
  label: "Notre Maison : engagements",
  page: "/maison",
  fields: [
    { name: "title", label: "Titre de la section", type: "text" },
    { name: "v1Title", label: "Engagement 1 : titre", type: "text" },
    { name: "v1Body", label: "Engagement 1 : texte", type: "textarea" },
    { name: "v2Title", label: "Engagement 2 : titre", type: "text" },
    { name: "v2Body", label: "Engagement 2 : texte", type: "textarea" },
    { name: "v3Title", label: "Engagement 3 : titre", type: "text" },
    { name: "v3Body", label: "Engagement 3 : texte", type: "textarea" },
    { name: "v4Title", label: "Engagement 4 : titre", type: "text" },
    { name: "v4Body", label: "Engagement 4 : texte", type: "textarea" },
  ],
  defaults: {
    title: "Ce qui nous engage",
    v1Title: "La justesse plutôt que l'abondance",
    v1Body: "Peu de recettes, chacune travaillée jusqu'à tenir en une bouchée. Une collection Signature qui dure, des éditions éphémères qui passent avec les saisons.",
    v2Title: "La précision du geste",
    v2Body: "Une datte fourrée et enrobée relève de la confiserie fine : la mesure d'une garniture, l'épaisseur d'une coque, la netteté d'une finition. C'est là que nous plaçons notre exigence.",
    v3Title: "La transparence",
    v3Body: "Nos recettes sont en développement : nous l'indiquons. Les images de ce site sont des visuels concept : nous le signalons. Les informations réglementaires ne sont publiées qu'une fois validées.",
    v4Title: "Le partage",
    v4Body: "Une datte se tend, se passe, accompagne un café. Nos formats sont pensés pour offrir et pour recevoir, du coffret que l'on glisse dans une main au plateau d'une réception.",
  },
} satisfies ContentEntry;

export const maisonHistoire = {
  key: "maison.histoire",
  label: "Notre Maison : histoire (à écrire)",
  page: "/maison",
  fields: [
    { name: "title", label: "Titre", type: "text" },
    { name: "body", label: "Texte", type: "textarea", help: "Remplacez ce texte par l'histoire réelle de la maison lorsqu'elle pourra être racontée." },
    { name: "signature", label: "Signature", type: "text" },
  ],
  defaults: {
    title: "Une histoire qui commence",
    body: "MAISON TAMRĀN en est à ses débuts. Les visages, les lieux et les rencontres qui feront cette maison trouveront leur place ici, le jour où ils pourront être racontés tels qu'ils sont. D'ici là, nous préférons vous montrer ce que nous cherchons plutôt que d'inventer d'où nous venons.",
    signature: "L'art de sublimer la datte.",
  },
} satisfies ContentEntry;

export const MAISON_ENTRIES: ContentEntry[] = [maisonOuverture, maisonManifeste, maisonValeurs, maisonHistoire];
