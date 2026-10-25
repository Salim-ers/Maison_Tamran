// Catalogue de référence MAISON TAMRĀN — source unique pour le seed et le générateur de visuels concept.
// Toutes les recettes sont des PROTOTYPES CRÉATIFS : compositions, allergènes, poids et prix
// sont provisoires et doivent être validés (fiche technique, étiquetage) avant toute mise en vente réelle.

export type ChocolateKind = "noir" | "lait" | "blanc" | "blond";
export type CollectionSlug = "signature" | "ephemere";

export type Topping =
  | "sesame-noir"
  | "zeste"
  | "matcha"
  | "safran"
  | "amande"
  | "pistache"
  | "kadaif"
  | "cafe"
  | "cardamome"
  | "framboise"
  | "hibiscus"
  | "sarrasin"
  | "sel"
  | "coco"
  | "pecan"
  | "rose";

export type Ingredient =
  | "sesame"
  | "yuzu"
  | "safran"
  | "amande"
  | "abricot"
  | "matcha"
  | "fleur-oranger"
  | "pistache"
  | "kadaif"
  | "cafe"
  | "cardamome"
  | "noisette"
  | "framboise"
  | "hibiscus"
  | "sarrasin"
  | "caramel"
  | "miso"
  | "pandan"
  | "coco"
  | "pecan"
  | "erable"
  | "sel-fume"
  | "rose"
  | "litchi"
  | "chocolat";

export interface RecipePalette {
  /** fond de mise en scène */
  surface: "ivoire" | "pierre" | "ardoise" | "chocolat" | "lin" | "marbre";
  /** couleur d'enrobage */
  coat: string;
  coatLight: string;
  /** garniture principale */
  filling: string;
  /** second élément de garniture (cœur, insert) */
  insert: string;
  /** teinte d'accent pour l'interface */
  accent: string;
}

export interface Recipe {
  slug: string;
  number: number;
  name: string;
  collection: CollectionSlug;
  pairing: string; // « Sésame noir torréfié, yuzu et chocolat noir. »
  tagline: string;
  story: string;
  tasting: { attaque: string; coeur: string; finale: string };
  chocolate: ChocolateKind;
  flavorFamilies: string[]; // filtres « saveur »
  allergens: string[]; // provisoire
  ingredientsDraft: string; // provisoire
  toppings: Topping[];
  ingredients: Ingredient[];
  palette: RecipePalette;
}

export const ALLERGEN_LABELS: Record<string, string> = {
  lait: "Lait",
  "fruits-a-coque": "Fruits à coque",
  sesame: "Sésame",
  soja: "Soja",
  gluten: "Gluten",
};

export const FLAVOR_LABELS: Record<string, string> = {
  agrume: "Agrumes",
  fruite: "Fruité",
  floral: "Floral",
  torrefie: "Torréfié",
  epice: "Épicé",
  sale: "Salé",
  vegetal: "Végétal",
};

export const CHOCOLATE_LABELS: Record<ChocolateKind, string> = {
  noir: "Chocolat noir",
  lait: "Chocolat au lait",
  blanc: "Chocolat blanc",
  blond: "Chocolat blond",
};

export const RECIPES: Recipe[] = [
  {
    slug: "eclipse-noire",
    number: 1,
    name: "Éclipse Noire",
    collection: "signature",
    pairing: "Sésame noir torréfié, yuzu et chocolat noir.",
    tagline: "L'ombre et la lumière, dans la même bouchée.",
    story:
      "Un praliné de sésame noir, profond et légèrement fumé, enveloppe un trait de yuzu vif. Le chocolat noir referme le tout comme une nuit sans lune, puis l'agrume perce, net et lumineux.",
    tasting: {
      attaque: "Chocolat noir, craquant fin",
      coeur: "Sésame torréfié, presque grillé",
      finale: "Yuzu, longue et acidulée",
    },
    chocolate: "noir",
    flavorFamilies: ["torrefie", "agrume"],
    allergens: ["sesame", "soja", "lait"],
    ingredientsDraft:
      "Datte Medjool, chocolat noir, pâte de sésame noir torréfié, purée de yuzu, sucre de canne. Composition provisoire.",
    toppings: ["sesame-noir", "zeste"],
    ingredients: ["sesame", "yuzu", "chocolat"],
    palette: { surface: "ardoise", coat: "#2A1B17", coatLight: "#5B3E33", filling: "#3A3634", insert: "#D9A52A", accent: "#E2C04A" },
  },
  {
    slug: "velours-persan",
    number: 2,
    name: "Velours Persan",
    collection: "signature",
    pairing: "Safran, amande blanche et abricot.",
    tagline: "Un jardin d'Ispahan à l'heure dorée.",
    story:
      "Une crème d'amande blanche infusée au safran, posée sur un cœur d'abricot fondant. La datte apporte son miel, le safran sa chaleur ambrée, l'amande une douceur de lait.",
    tasting: {
      attaque: "Chocolat au lait, rond",
      coeur: "Amande blanche, abricot confit",
      finale: "Safran, chaude et florale",
    },
    chocolate: "lait",
    flavorFamilies: ["fruite", "epice", "floral"],
    allergens: ["fruits-a-coque", "lait", "soja"],
    ingredientsDraft:
      "Datte Medjool, chocolat au lait, pâte d'amande blanche, abricot sec, safran, sucre. Composition provisoire.",
    toppings: ["safran", "amande"],
    ingredients: ["safran", "amande", "abricot"],
    palette: { surface: "ivoire", coat: "#6B4429", coatLight: "#A8774F", filling: "#EFE3CF", insert: "#E58A2E", accent: "#C8792C" },
  },
  {
    slug: "minuit-a-kyoto",
    number: 3,
    name: "Minuit à Kyoto",
    collection: "signature",
    pairing: "Matcha, yuzu et chocolat blanc.",
    tagline: "Le calme d'un jardin de mousse, une étincelle d'agrume.",
    story:
      "Une ganache au matcha, herbacée et douce, relevée d'un cœur de yuzu. L'enrobage de chocolat blanc, à peine teinté de vert, laisse le thé s'exprimer jusqu'au bout.",
    tasting: {
      attaque: "Chocolat blanc, lacté",
      coeur: "Matcha, herbacé et umami",
      finale: "Yuzu, fraîche",
    },
    chocolate: "blanc",
    flavorFamilies: ["vegetal", "agrume"],
    allergens: ["lait", "soja"],
    ingredientsDraft:
      "Datte Medjool, chocolat blanc, crème, matcha, purée de yuzu. Composition provisoire.",
    toppings: ["matcha", "zeste"],
    ingredients: ["matcha", "yuzu", "chocolat"],
    palette: { surface: "pierre", coat: "#B9C39A", coatLight: "#E3E7CF", filling: "#6E8A3A", insert: "#EBCB3F", accent: "#8A9A5B" },
  },
  {
    slug: "or-de-marrakech",
    number: 4,
    name: "Or de Marrakech",
    collection: "signature",
    pairing: "Fleur d'oranger, pistache et kadaïf croustillant.",
    tagline: "La fraîcheur d'un riad, le croquant d'un feuilleté doré.",
    story:
      "Une crème de pistache parfumée à la fleur d'oranger, où se cachent des fils de kadaïf dorés au beurre. Le contraste entre le fondant de la datte et le croustillant fait toute la magie.",
    tasting: {
      attaque: "Chocolat au lait, kadaïf croquant",
      coeur: "Pistache, beurrée",
      finale: "Fleur d'oranger, aérienne",
    },
    chocolate: "lait",
    flavorFamilies: ["floral", "torrefie"],
    allergens: ["fruits-a-coque", "gluten", "lait", "soja"],
    ingredientsDraft:
      "Datte Medjool, chocolat au lait, pâte de pistache, kadaïf (farine de blé), beurre, eau de fleur d'oranger. Composition provisoire.",
    toppings: ["kadaif", "pistache"],
    ingredients: ["fleur-oranger", "pistache", "kadaif"],
    palette: { surface: "marbre", coat: "#5E3B26", coatLight: "#9A6A45", filling: "#8EA14A", insert: "#D9A54A", accent: "#9AA65A" },
  },
  {
    slug: "cafe-imperial",
    number: 5,
    name: "Café Impérial",
    collection: "signature",
    pairing: "Espresso, cardamome verte et praliné noisette.",
    tagline: "Le rituel du café, condensé.",
    story:
      "Un praliné noisette au grain serré, infusé d'espresso et réveillé par la cardamome verte. La datte joue le rôle du sucre, le chocolat noir celui de la tasse.",
    tasting: {
      attaque: "Chocolat noir, cacaoté",
      coeur: "Noisette torréfiée, espresso",
      finale: "Cardamome, poivrée et fraîche",
    },
    chocolate: "noir",
    flavorFamilies: ["torrefie", "epice"],
    allergens: ["fruits-a-coque", "soja", "lait"],
    ingredientsDraft:
      "Datte Medjool, chocolat noir, praliné noisette, café espresso, cardamome verte. Composition provisoire.",
    toppings: ["cafe", "cardamome"],
    ingredients: ["cafe", "cardamome", "noisette"],
    palette: { surface: "chocolat", coat: "#24160F", coatLight: "#55372A", filling: "#8B5A33", insert: "#3D2416", accent: "#B98A5E" },
  },
  {
    slug: "rouge-desir",
    number: 6,
    name: "Rouge Désir",
    collection: "signature",
    pairing: "Framboise acidulée, hibiscus et chocolat noir.",
    tagline: "Une morsure de fruit rouge, intense et franche.",
    story:
      "Un confit de framboise acidulé, infusé de fleurs d'hibiscus, contraste avec la rondeur de la datte. Le chocolat noir, presque austère, laisse le fruit éclater.",
    tasting: {
      attaque: "Chocolat noir, sec",
      coeur: "Framboise, juteuse",
      finale: "Hibiscus, acidulée et florale",
    },
    chocolate: "noir",
    flavorFamilies: ["fruite", "floral"],
    allergens: ["soja", "lait"],
    ingredientsDraft:
      "Datte Medjool, chocolat noir, confit de framboise, infusion d'hibiscus, sucre. Composition provisoire.",
    toppings: ["framboise", "hibiscus"],
    ingredients: ["framboise", "hibiscus", "chocolat"],
    palette: { surface: "ivoire", coat: "#2B1714", coatLight: "#5C302A", filling: "#B3203A", insert: "#E2577A", accent: "#B3203A" },
  },
  {
    slug: "ebene-sale",
    number: 7,
    name: "Ébène Salé",
    collection: "ephemere",
    pairing: "Praliné de sarrasin, caramel et miso blanc.",
    tagline: "Le caramel rencontre la terre.",
    story:
      "Un praliné de sarrasin torréfié, au goût de pain grillé, lié par un caramel au miso blanc. Le sel et le sucre se répondent sans jamais se couvrir.",
    tasting: {
      attaque: "Chocolat noir, sarrasin croquant",
      coeur: "Caramel, beurré",
      finale: "Miso, salée et profonde",
    },
    chocolate: "noir",
    flavorFamilies: ["sale", "torrefie"],
    allergens: ["soja", "lait"],
    ingredientsDraft:
      "Datte Medjool, chocolat noir, sarrasin torréfié, caramel (sucre, crème, beurre), miso blanc (soja). Composition provisoire.",
    toppings: ["sarrasin", "sel"],
    ingredients: ["sarrasin", "caramel", "miso"],
    palette: { surface: "ardoise", coat: "#1F1512", coatLight: "#4B3329", filling: "#B07A3E", insert: "#7A4E2A", accent: "#B07A3E" },
  },
  {
    slug: "ile-secrete",
    number: 8,
    name: "Île Secrète",
    collection: "ephemere",
    pairing: "Pandan, coco grillée et chocolat blond.",
    tagline: "Une vanille verte venue d'Asie du Sud-Est.",
    story:
      "Le pandan, parfum de riz vapeur et de vanille verte, s'allie à la noix de coco grillée. Le chocolat blond, aux notes de biscuit, prolonge la douceur.",
    tasting: {
      attaque: "Chocolat blond, biscuité",
      coeur: "Pandan, vanillé et végétal",
      finale: "Coco grillée",
    },
    chocolate: "blond",
    flavorFamilies: ["vegetal", "torrefie"],
    allergens: ["lait", "soja"],
    ingredientsDraft:
      "Datte Medjool, chocolat blond, noix de coco grillée, extrait de pandan, crème. Composition provisoire.",
    toppings: ["coco"],
    ingredients: ["pandan", "coco", "chocolat"],
    palette: { surface: "lin", coat: "#B98552", coatLight: "#E2B887", filling: "#6FA55A", insert: "#F2E8D5", accent: "#6FA55A" },
  },
  {
    slug: "ambre-fume",
    number: 9,
    name: "Ambre Fumé",
    collection: "ephemere",
    pairing: "Noix de pécan, érable et sel fumé.",
    tagline: "Un feu de bois, une forêt d'automne.",
    story:
      "Un caramel à l'érable, généreux en noix de pécan torréfiées, terminé par quelques cristaux de sel fumé. La datte apporte la profondeur, l'érable la lumière ambrée.",
    tasting: {
      attaque: "Chocolat au lait, pécan croquante",
      coeur: "Érable, caramélisé",
      finale: "Sel fumé, boisée",
    },
    chocolate: "lait",
    flavorFamilies: ["sale", "torrefie"],
    allergens: ["fruits-a-coque", "lait", "soja"],
    ingredientsDraft:
      "Datte Medjool, chocolat au lait, noix de pécan, sirop d'érable, crème, sel fumé. Composition provisoire.",
    toppings: ["pecan", "sel"],
    ingredients: ["pecan", "erable", "sel-fume"],
    palette: { surface: "chocolat", coat: "#5A3620", coatLight: "#8F5F3B", filling: "#C47A2C", insert: "#7B4A22", accent: "#C47A2C" },
  },
  {
    slug: "rose-de-nuit",
    number: 10,
    name: "Rose de Nuit",
    collection: "ephemere",
    pairing: "Rose, litchi et framboise.",
    tagline: "Un bouquet tendre, à la tombée du jour.",
    story:
      "Une ganache au litchi parfumée à la rose, autour d'un cœur de framboise. Délicate en attaque, elle s'ouvre comme une fleur, puis le fruit rouge réveille la bouche.",
    tasting: {
      attaque: "Chocolat blanc, lacté",
      coeur: "Litchi, rose",
      finale: "Framboise, acidulée",
    },
    chocolate: "blanc",
    flavorFamilies: ["floral", "fruite"],
    allergens: ["lait", "soja"],
    ingredientsDraft:
      "Datte Medjool, chocolat blanc, purée de litchi, eau de rose, framboise, crème. Composition provisoire.",
    toppings: ["rose", "framboise"],
    ingredients: ["rose", "litchi", "framboise"],
    palette: { surface: "marbre", coat: "#E7C6C4", coatLight: "#F7E6E2", filling: "#F1D7D3", insert: "#C42E4A", accent: "#C46A7A" },
  },
];

export interface BoxDef {
  slug: string;
  name: string;
  pieces: number | null;
  priceCents: number | null; // null = sur devis
  kind: "decouverte" | "signature" | "prestige" | "edition-limitee" | "entreprise";
  configurable: boolean;
  description: string;
  details: string[];
}

export const BOXES: BoxDef[] = [
  {
    slug: "coffret-decouverte",
    name: "Coffret Découverte",
    pieces: 6,
    priceCents: 1490,
    kind: "decouverte",
    configurable: true,
    description: "Six créations pour une première rencontre. Le format idéal pour un café, un remerciement, une attention.",
    details: ["6 pièces au choix", "Calage individuel", "Carte de dégustation"],
  },
  {
    slug: "coffret-signature",
    name: "Coffret Signature",
    pieces: 12,
    priceCents: 2790,
    kind: "signature",
    configurable: true,
    description: "Douze pièces pour parcourir la collection, ou se concentrer sur ses préférées.",
    details: ["12 pièces au choix", "Boîte rigide, logo en relief", "Papier de soie et carte de dégustation"],
  },
  {
    slug: "coffret-prestige",
    name: "Coffret Prestige",
    pieces: 24,
    priceCents: 4990,
    kind: "prestige",
    configurable: true,
    description: "Vingt-quatre pièces sur deux étages, pour les tables généreuses et les cadeaux qui comptent.",
    details: ["24 pièces au choix", "Deux étages séparés", "Finition bronze"],
  },
  {
    slug: "coffret-edition-limitee",
    name: "Coffret Édition Limitée",
    pieces: 12,
    priceCents: 3490,
    kind: "edition-limitee",
    configurable: false,
    description: "La sélection des recettes éphémères, dans une boîte numérotée. Composition et prix fixés à chaque édition.",
    details: ["Composition imposée", "Boîte numérotée", "Quantités limitées"],
  },
  {
    slug: "coffret-entreprise",
    name: "Coffret Entreprise",
    pieces: null,
    priceCents: null,
    kind: "entreprise",
    configurable: false,
    description: "Coffrets aux couleurs de votre entreprise ou de votre événement, du format à la carte imprimée.",
    details: ["Logo et message personnalisés", "Volumes sur mesure", "Prix sur devis"],
  },
];
