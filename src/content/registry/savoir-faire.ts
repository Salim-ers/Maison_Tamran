import type { ContentEntry } from "../types";

export const savoirFaireIntro = {
  key: "savoir-faire.intro",
  label: "Savoir-faire : introduction",
  page: "/savoir-faire",
  fields: [
    { name: "title", label: "Titre", type: "text" },
    { name: "lead", label: "Chapeau", type: "textarea" },
    { name: "provisional", label: "Note sur le procédé", type: "textarea", help: "Encadré signalant que le procédé reste à confirmer." },
  ],
  defaults: {
    title: "Le savoir-faire",
    lead: "Six étapes séparent une Medjool d'une création MAISON TAMRĀN. Voici le parcours d'une pièce, de la sélection du fruit à la fermeture du coffret.",
    provisional: "Ce parcours décrit nos intentions de fabrication. Le procédé détaillé (lieux, équipements, durées, conditions de conservation) sera précisé et confirmé lorsque la production sera établie.",
  },
} satisfies ContentEntry;

export const savoirFaireEtapes = {
  key: "savoir-faire.etapes",
  label: "Savoir-faire : les étapes",
  page: "/savoir-faire",
  fields: [
    { name: "s1Title", label: "Étape 1 : titre", type: "text" },
    { name: "s1Body", label: "Étape 1 : texte", type: "textarea" },
    { name: "s2Title", label: "Étape 2 : titre", type: "text" },
    { name: "s2Body", label: "Étape 2 : texte", type: "textarea" },
    { name: "s3Title", label: "Étape 3 : titre", type: "text" },
    { name: "s3Body", label: "Étape 3 : texte", type: "textarea" },
    { name: "s4Title", label: "Étape 4 : titre", type: "text" },
    { name: "s4Body", label: "Étape 4 : texte", type: "textarea" },
    { name: "s5Title", label: "Étape 5 : titre", type: "text" },
    { name: "s5Body", label: "Étape 5 : texte", type: "textarea" },
    { name: "s6Title", label: "Étape 6 : titre", type: "text" },
    { name: "s6Body", label: "Étape 6 : texte", type: "textarea" },
  ],
  defaults: {
    s1Title: "La sélection des Medjool",
    s1Body: "Tout commence par le fruit. Nous recherchons des dattes Medjool charnues et souples, à la peau fine, dont le calibre permet d'accueillir une garniture sans perdre leur tenue.",
    s2Title: "L'ouverture et le dénoyautage",
    s2Body: "La datte est ouverte sur sa longueur et le noyau retiré, en préservant la forme du fruit. Cette incision devient l'écrin de la garniture.",
    s3Title: "La garniture",
    s3Body: "Le cœur de la recette est déposé au centre : crème de pistache, praliné, ganache ou fruit. Sa juste quantité équilibre la douceur de la datte sans la masquer.",
    s4Title: "L'enrobage",
    s4Body: "La datte garnie reçoit sa coque de chocolat, noir, lait, blanc ou blond selon la recette. Fine et nette, elle craque sous la dent puis laisse place au fruit.",
    s5Title: "La finition",
    s5Body: "Un dernier geste signe chaque création : éclats de pistache, fils de kadaïf, fleur de sel, poudre de matcha. La finition annonce le goût avant la première bouchée.",
    s6Title: "La mise en coffret",
    s6Body: "Chaque pièce rejoint son calage, accompagnée de la carte de dégustation qui décrit son accord. Le coffret est refermé, prêt à être offert.",
  },
} satisfies ContentEntry;

export const SAVOIRFAIRE_ENTRIES: ContentEntry[] = [savoirFaireIntro, savoirFaireEtapes];
