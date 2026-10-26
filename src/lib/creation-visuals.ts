import type { Ingredient } from "@/data/recipes";

// Photographies d'ambiance (npm run stock) associées aux créations. Les photos des créations elles-mêmes
// n'existent qu'en petite définition (voir IMAGE_AUDIT.md) : les grandes images d'une fiche ou d'une scène
// sont donc celles de leurs ingrédients, et la création y est présentée en petit format net.

/** Ingrédient de recette → photographie d'ambiance correspondante. */
export const INGREDIENT_PHOTO: Partial<Record<Ingredient, string>> = {
  pistache: "pistache", safran: "safran", amande: "amande", cardamome: "cardamome", noisette: "noisette",
  framboise: "framboise", rose: "rose", cafe: "cafe-grains", coco: "coco", matcha: "matcha",
};

export const INGREDIENT_LABEL: Partial<Record<Ingredient, string>> = {
  pistache: "Pistache", safran: "Safran", amande: "Amande blanche", cardamome: "Cardamome verte", noisette: "Noisette",
  framboise: "Framboise", rose: "Rose", cafe: "Café espresso", coco: "Noix de coco", matcha: "Matcha",
};

/** Grande image d'univers de chaque création : son ingrédient vedette (ou, à défaut, la matière principale). */
export const CREATION_STAGE: Record<string, string> = {
  "eclipse-noire": "chocolat",
  "velours-persan": "safran",
  "minuit-a-kyoto": "matcha",
  "or-de-marrakech": "pistache",
  "cafe-imperial": "cafe-grains",
  "rouge-desir": "framboise",
  "ile-secrete": "coco",
  "rose-de-nuit": "rose",
  "ambre-fume": "medjool-macro",
  "ebene-sale": "chocolat",
};
