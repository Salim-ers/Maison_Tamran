// Catalogue des visuels générés par l'API Images d'OpenAI (npm run images:openai).
// Chaque visuel part de références réelles du projet : la case de la création sur la planche validée
// (aspect exact : enrobage, garniture, coupe), la photographie de référence Café Impérial (décor, assiette,
// lumière) et, pour les vues dérivées, le visuel déjà généré de la même création (cohérence d'une vue à l'autre).
// Aucun logo ni texte n'est demandé au modèle : le logo officiel est composé ensuite à partir des fichiers de marque.
import { RECIPES } from "../../src/data/recipes";
import type { Quality } from "./openai";
import type { Quad } from "./lid";

export type Region = { left: number; top: number; width: number; height: number };
export type Ref =
  | { file: string } // fichier du dépôt
  | { file: string; crop: Region } // extrait d'un fichier du dépôt
  | { shot: string }; // dernier original généré pour un autre emplacement

export interface OpenAIShot {
  id: string; // clé du manifeste photo lu par le site (src/data/photo-manifest.json)
  group: "produit" | "coupe" | "piece" | "coffret" | "univers";
  size: string; // LARGEURxHAUTEUR, multiples de 16
  quality: Quality;
  background?: "transparent" | "opaque";
  refs: Ref[];
  prompt: string;
  alt: string;
  usage: string;
  /** Largeur maximale publiée sur le site (l'original reste dans brand/generated/). */
  publishWidth: number;
  priority: number;
  /** Logo officiel posé à la publication : filet cuivré du couvercle mesuré sur chaque version (clé → quadrilatère). */
  lidLogo?: Record<string, Quad>;
}

const PACK = "brand/source/pack-photos";
const SHEET = `${PACK}/APERCU_10_RECETTES.jpg`;
const PRODUCT_REF = `${PACK}/references/photo-modele-produit.png`;
const BOX_REF = `${PACK}/references/photo-modele-coffret.png`;

// Cases de la planche (mêmes coordonnées que scripts/pack-photos.mts).
const SHEET_COLS = [[42, 456], [528, 947], [1016, 1435], [1505, 1921], [1994, 2408]];
const SHEET_ROWS = [[117, 616], [738, 1237]];
const SHEET_ORDER = ["eclipse-noire", "velours-persan", "minuit-a-kyoto", "or-de-marrakech", "cafe-imperial", "rouge-desir", "ebene-sale", "ile-secrete", "ambre-fume", "rose-de-nuit"];

export function sheetCell(slug: string): Ref {
  const i = SHEET_ORDER.indexOf(slug);
  if (i < 0) throw new Error(`Création absente de la planche : ${slug}`);
  const [x0, x1] = SHEET_COLS[i % 5];
  const [y0, y1] = SHEET_ROWS[Math.floor(i / 5)];
  return { file: SHEET, crop: { left: x0 + 2, top: y0 + 2, width: x1 - x0 - 4, height: y1 - y0 - 4 } };
}

/**
 * Description visuelle de chaque création, d'après sa case de planche ET sa composition enregistrée
 * (src/data/recipes.ts) : on n'ajoute aucun ingrédient absent de la recette (ex. pas de fruits à coque
 * sur une création dont les allergènes n'en mentionnent pas).
 */
const LOOK: Record<string, { coat: string; cut: string; props: string; forbid?: string }> = {
  "eclipse-noire": {
    coat: "a glossy dark chocolate shell densely coated with black sesame seeds and a few golden toasted sesame seeds",
    cut: "a dark, almost black toasted black-sesame praline core with a small bright yellow yuzu insert",
    props: "a little heap of black sesame seeds and a few curls of candied yuzu zest",
  },
  "velours-persan": {
    coat: "a milk chocolate shell topped with flaked white almonds and a few fine red saffron threads",
    cut: "a smooth ivory almond cream around a soft, glossy orange apricot heart",
    props: "two dried apricots, two whole almonds and a pinch of saffron threads",
  },
  "minuit-a-kyoto": {
    coat: "a pale matcha-green white chocolate shell, lightly dusted with matcha powder and dotted with tiny golden cubes of candied yuzu zest",
    cut: "a green matcha ganache with a bright yellow yuzu heart",
    props: "a small mound of matcha powder and a thin slice of yuzu",
    forbid:
      "Unlike image 1, there are NO pistachios and no nuts of any kind anywhere (this recipe contains none): the only toppings are matcha powder and small candied yuzu cubes, and the plate holds only matcha powder and yuzu.",
  },
  "or-de-marrakech": {
    coat: "a milk chocolate shell topped with chopped bright green pistachios and a few golden kadaif pastry threads",
    cut: "a pale green pistachio cream laced with crisp golden kadaif threads",
    props: "a few shelled pistachios and a small nest of golden toasted kadaif threads",
  },
  "cafe-imperial": {
    coat: "a dark chocolate shell topped with chopped toasted hazelnuts and fine praline crumbs",
    cut: "a creamy hazelnut and espresso praline with visible hazelnut pieces",
    props: "a few roasted coffee beans, two green cardamom pods and some halved hazelnuts",
  },
  "rouge-desir": {
    coat: "a dark chocolate shell sprinkled with crimson freeze-dried raspberry pieces and crushed dried hibiscus",
    cut: "a glossy deep red raspberry and hibiscus confit",
    props: "two fresh raspberries and a few dried hibiscus petals",
  },
  "ebene-sale": {
    coat: "a dark chocolate shell coated with toasted buckwheat groats and a few flakes of sea salt (no nuts)",
    cut: "an amber miso caramel set with crunchy toasted buckwheat praline",
    props: "a small heap of toasted buckwheat groats, two soft caramel cubes and a few salt flakes",
    forbid: "Unlike image 1, there are NO nuts of any kind (no hazelnuts, no almonds): the crunchy topping is only toasted buckwheat groats.",
  },
  "ile-secrete": {
    coat: "a pale golden blond chocolate shell (caramelised white chocolate, ivory with a light biscuit tint) topped with toasted coconut flakes",
    cut: "a soft pale green pandan cream mixed with grated coconut",
    props: "a piece of fresh coconut, a little grated coconut and a folded pandan leaf",
  },
  "ambre-fume": {
    coat: "a milk chocolate shell generously topped with chopped toasted pecans",
    cut: "an amber maple caramel with pecan pieces and a few crystals of smoked salt",
    props: "a few pecan halves, two maple caramel cubes and some smoked salt crystals",
  },
  "rose-de-nuit": {
    coat: "a white chocolate shell sprinkled with dried pink rose petals and crimson freeze-dried raspberry pieces (no nuts)",
    cut: "a pale pink lychee and rose ganache speckled with raspberry",
    props: "a peeled lychee, a fresh raspberry and a few dried rose petals",
    forbid: "Unlike image 1, there are NO nuts of any kind (no pistachios, no almonds, no hazelnuts): toppings are only dried rose petals and freeze-dried raspberry.",
  },
};

const PHOTO_STYLE =
  "High-end advertising food photography for a luxury French confectionery house. Real photograph, natural textures, " +
  "natural chocolate sheen, true-to-life proportions, crisp focus on the product, gentle falloff. Never plastic, never CGI, never illustrated.";
const NO_TEXT = "No hands, no people, no text, no letters, no logo, no box or packaging in frame.";

function productShots(): OpenAIShot[] {
  return RECIPES.flatMap((r, i) => {
    const look = LOOK[r.slug];
    const intro =
      `Image 1 shows the exact creation to photograph, "${r.name}" by Maison Tamran: a Medjool date coated in ${look.coat}. ` +
      `Keep exactly the same coating colour, toppings, filling colours, date size and cut style as image 1. ` +
      (look.forbid ? `${look.forbid} ` : "");
    const produit: OpenAIShot = {
      id: `produit-${r.slug}`,
      group: "produit",
      size: "1632x2048",
      quality: "high",
      refs: [sheetCell(r.slug), { file: PRODUCT_REF }],
      prompt:
        intro +
        "Image 2 sets the photographic direction only: hammered antique brass plate, dark stone surface, warm low-key light, depth of field, framing. " +
        "Portrait 4:5 composition. On the brass plate: on the left, one whole coated date lying diagonally; on the right, its twin cut crosswise in half, " +
        `the cut face turned toward the camera, revealing the glossy dark date flesh as a ring around ${look.cut}, with the thin chocolate shell around it. ` +
        `On the plate, a few raw ingredients of the recipe: ${look.props}. ` +
        "Background softly out of focus: dark brown and brass tones, a blurred brass vessel. Warm light from the upper left, delicate rim light on the chocolate, " +
        `crisp detail on the cut face. ${PHOTO_STYLE} ${NO_TEXT}`,
      alt: `${r.name} : une datte entière et une datte coupée révélant sa garniture, sur une assiette en laiton`,
      usage: "Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil",
      publishWidth: 1632,
      priority: 10,
    };
    const coupe: OpenAIShot = {
      id: `coupe-${r.slug}`,
      group: "coupe",
      size: "1920x1920",
      quality: "high",
      refs: [{ shot: produit.id }, sheetCell(r.slug)],
      prompt:
        `Image 1 is the reference photograph of "${r.name}" (image 2 is the same creation, smaller). ` +
        "Create an extreme macro close-up of the cut half of this same date, square 1:1: the cut face fills most of the frame, seen straight on, " +
        `showing the glossy dark Medjool flesh ring, ${look.cut}, the thin crisp chocolate shell edge and its toppings (${look.coat.replace(/^an? /, "")}). ` +
        "Same colours, same filling, same shell as image 1. " + (look.forbid ? `${look.forbid.replace("Unlike image 1", "Unlike image 2")} ` : "") +
        "Very shallow depth of field, warm raking light from the left revealing every texture, " +
        `dark brown blurred background with brass reflections. ${PHOTO_STYLE} ${NO_TEXT}`,
      alt: `${r.name} : le cœur de la datte coupée, en macrophotographie`,
      usage: "Fiche produit (zoom sur la garniture), anatomie, galerie",
      publishWidth: 1920,
      priority: 20,
    };
    const piece: OpenAIShot = {
      id: `piece-${r.slug}`,
      group: "piece",
      size: "1024x1024",
      quality: "high",
      background: "transparent",
      refs: [{ shot: produit.id }, sheetCell(r.slug)],
      prompt:
        `Image 1 is the reference photograph of "${r.name}". Isolate one single whole coated date of this exact creation (same coating, same toppings), ` +
        "seen from directly above (top-down view), lying horizontally with its long axis left to right, centred, filling about 70% of the width. " +
        (look.forbid ? `${look.forbid.replace("Unlike image 1", "Unlike image 2")} ` : "") +
        "Fully transparent background: no plate, no surface, no ingredients, no cast shadow. Soft warm light from the upper left. " +
        `${PHOTO_STYLE} ${NO_TEXT}`,
      alt: `${r.name}, vue de dessus`,
      usage: "Configurateur de coffret (alvéoles), animations de remplissage",
      publishWidth: 1024,
      priority: 20,
    };
    return [produit, coupe, piece];
  });
}

const BOX_STYLE =
  "a rigid luxury gift box in deep cocoa-brown soft-touch paper with a thin champagne-copper inset line, ivory interior, " +
  "individual dark brown pleated paper cups";
const NO_LETTERING = "No hands, no people, no text, no letters, no logo, no emblem on any box or card.";

// Les deux rangées de la planche, sans les légendes : la gamme complète comme référence d'aspect.
const ROW_1: Ref = { file: SHEET, crop: { left: 42, top: 117, width: 2366, height: 499 } };
const ROW_2: Ref = { file: SHEET, crop: { left: 42, top: 738, width: 2366, height: 499 } };
const RANGE =
  "the house's chocolate-coated filled Medjool dates shown in the reference sheets (black sesame on dark chocolate, pistachio and golden kadaif on milk chocolate, " +
  "pale matcha-green coating dusted only with matcha and tiny golden yuzu cubes, toasted hazelnuts on dark chocolate, crimson raspberry on dark chocolate, " +
  "toasted coconut on blond chocolate, pecans on milk chocolate, rose petals and raspberry on white chocolate). Important: unlike the reference sheet, " +
  "the green matcha piece and the white rose piece carry no pistachio and no nuts; pistachios appear only on the milk chocolate kadaif piece";

function emptyBox(pieces: number, cols: number, rows: number, size: string, ref: Ref): OpenAIShot {
  return {
    id: `coffret-vide-${pieces}`,
    group: "coffret",
    size,
    quality: "high",
    refs: [ref],
    prompt:
      `Image 1 shows the Maison Tamran gift box style. Photograph the same kind of box, open and empty, seen from directly above (perfect top-down flat lay, orthographic feel): ${BOX_STYLE}. ` +
      `The box base is centred, its edges exactly parallel to the frame edges, occupying about 78% of the width. Inside: ${pieces} identical empty pleated paper cups in a perfectly regular grid ` +
      `of ${cols} columns by ${rows} rows, evenly spaced, each cup round-oval and seen from straight above. No lid in frame. The box sits on a warm travertine surface. ` +
      `Soft, even warm light from the upper left with a gentle shadow on the right. ${PHOTO_STYLE} ${NO_LETTERING}`,
    alt: `Coffret ouvert et vide, vu de dessus : ${pieces} alvéoles en papier plissé`,
    usage: `Configurateur (format ${pieces} pièces)`,
    publishWidth: 2048,
    priority: pieces === 12 ? 10 : 20,
  };
}

const UNIVERS: OpenAIShot[] = [
  emptyBox(12, 4, 3, "2048x1536", { file: BOX_REF }),
  emptyBox(6, 3, 2, "2048x1536", { shot: "coffret-vide-12" }),
  emptyBox(24, 6, 4, "2304x1536", { shot: "coffret-vide-12" }),
  {
    id: "coffret-ouvert",
    group: "coffret",
    size: "3840x2160",
    quality: "high",
    refs: [{ shot: "coffret-ferme" }, ROW_1, ROW_2],
    prompt:
      "Image 1 is the hero photograph of the closed Maison Tamran box. Recreate image 1 with exactly the same camera, framing, table, props, palm-frond shadows and golden light, " +
      "and the box base at exactly the same place and size, but the lid has been removed from the frame: the box is now open. Inside, twelve creations sit in individual dark brown " +
      `pleated paper cups in a 4 × 3 grid, each whole (not cut), toppings clearly visible: ${RANGE}. Images 2 and 3 are references for the creations only. ` +
      `The left half of the frame stays calm, with negative space. ${PHOTO_STYLE} ${NO_LETTERING}`,
    alt: "Coffret Maison Tamrān ouvert : douze créations dans leurs caissettes, sur une table en travertin, dans la lumière dorée",
    usage: "Hero de l'accueil (ouverture du coffret au défilement), page Coffrets",
    publishWidth: 3840,
    priority: 20,
  },
  {
    id: "coffret-decouverte",
    group: "coffret",
    size: "2304x1728",
    quality: "high",
    refs: [{ shot: "coffret-ferme" }, ROW_1],
    prompt:
      `Image 1 shows the Maison Tamran box and setting. Three-quarter view, 4:3, of a small open gift box for six: ${BOX_STYLE}, its lid leaning against the back. ` +
      `Six whole creations in a 3 × 2 grid of cups (${RANGE}; image 2 is the reference for the creations). Warm travertine table, golden late-afternoon light, palm shadows, ` +
      `a handleless ivory coffee cup beside it. ${PHOTO_STYLE} ${NO_LETTERING}`,
    alt: "Coffret Découverte ouvert : six créations dans leurs caissettes",
    usage: "Page Coffrets, accueil (formats), configurateur",
    publishWidth: 2304,
    priority: 20,
  },
  {
    id: "coffret-prestige",
    group: "coffret",
    size: "2304x1728",
    quality: "high",
    refs: [{ shot: "coffret-ferme" }, ROW_1, ROW_2],
    prompt:
      `Image 1 shows the Maison Tamran box and setting. Three-quarter view, 4:3, of a large two-tier gift box for twenty-four: ${BOX_STYLE}. The upper tray is lifted and set ` +
      `slightly offset on top so both tiers are visible, each holding twelve whole creations in a 4 × 3 grid of cups (${RANGE}; images 2 and 3 are the references). ` +
      `The lid rests behind. Warm travertine table, golden light, palm shadows, a brass dallah softly out of focus. ${PHOTO_STYLE} ${NO_LETTERING}`,
    alt: "Coffret Prestige ouvert sur deux étages : vingt-quatre créations",
    usage: "Page Coffrets, accueil (formats)",
    publishWidth: 2304,
    priority: 20,
  },
  {
    id: "coffret-edition",
    group: "coffret",
    size: "2304x1728",
    quality: "high",
    refs: [{ shot: "coffret-ferme" }, ROW_2],
    prompt:
      "Image 1 shows the Maison Tamran box and setting. Three-quarter view, 4:3, of a limited-edition gift box: rigid box in deep olive green soft-touch paper with a thin champagne-copper inset line, " +
      "ivory interior, lid leaning against the back, twelve whole creations in dark pleated cups in a 4 × 3 grid, the four ephemeral creations of image 2 (buckwheat on dark chocolate, " +
      "toasted coconut on blond chocolate, pecans on milk chocolate, rose petals on white chocolate). Dusk light, deep shadows, dark walnut table, a single candle. " +
      `${PHOTO_STYLE} ${NO_LETTERING}`,
    alt: "Coffret Édition Limitée, vert olive, ouvert sur les quatre créations éphémères",
    usage: "Page Coffrets, éditions éphémères",
    publishWidth: 2304,
    priority: 20,
  },
  {
    id: "coffret-entreprise",
    group: "univers",
    size: "3840x2160",
    quality: "high",
    refs: [{ shot: "coffret-ferme" }],
    prompt:
      "Image 1 shows the Maison Tamran box. Wide 16:9 photograph for corporate gifting: on a polished dark walnut desk in a calm, elegant office at golden hour, a neat stack and a row of closed " +
      "cocoa-brown gift boxes (same box as image 1, blank lids), each tied with a fine champagne silk ribbon, with small blank ivory cards tucked under the ribbons. A brass desk lamp glows softly, " +
      `large window with warm light, shallow depth of field. Negative space on the left. ${PHOTO_STYLE} ${NO_LETTERING}`,
    alt: "Coffrets Maison Tamrān noués de rubans champagne, préparés pour des cadeaux d'entreprise",
    usage: "Professionnels, cadeaux d'entreprise",
    publishWidth: 3840,
    priority: 20,
  },
  {
    id: "rituel-cafe",
    group: "univers",
    size: "3840x2160",
    quality: "high",
    refs: [ROW_1, { file: BOX_REF }],
    prompt:
      "Wide 16:9 photograph of a tasting ritual in a contemporary riad salon at golden hour. On a low travertine table: a brass dallah coffee pot, two small handleless ivory cups of Arabic coffee, " +
      `a hammered brass plate with five creations (${RANGE}; image 1 is the reference for the creations), a folded natural linen napkin. Light falls through a carved wooden mashrabiya screen, ` +
      "casting delicate geometric shadows. Image 2 sets the mood and materials only. The right third of the frame stays quiet for text. " +
      `${PHOTO_STYLE} ${NO_LETTERING}`,
    alt: "Rituel de dégustation : café, dallah en laiton et créations Maison Tamrān sur une table en travertin",
    usage: "Accueil (la Maison), savoir-faire, rituel",
    publishWidth: 3840,
    priority: 10,
  },
  {
    id: "cadeau-mariage",
    group: "univers",
    size: "3840x2160",
    quality: "high",
    refs: [{ shot: "coffret-ferme" }, ROW_1],
    prompt:
      "Wide 16:9 photograph of an evening wedding reception table: ivory linen tablecloth, tall candles in brass holders, white flowers and dried palm leaves, at each place a small cocoa-brown " +
      `gift box (same box style as image 1, blank lid) tied with champagne silk ribbon, and in the centre a large hammered brass tray of creations (${RANGE}; image 2 is the reference). ` +
      `Warm candlelight, soft bokeh, shallow depth of field. ${PHOTO_STYLE} ${NO_LETTERING}`,
    alt: "Table de réception de mariage : coffrets noués de rubans et plateau de créations à la lueur des bougies",
    usage: "Professionnels, mariages et événements, l'art d'offrir",
    publishWidth: 3840,
    priority: 20,
  },
  {
    id: "pro-hotel",
    group: "univers",
    size: "3840x2160",
    quality: "high",
    refs: [ROW_1, { file: BOX_REF }],
    prompt:
      "Wide 16:9 photograph of the lounge of a luxury hotel at dusk: a polished travertine and walnut counter in the foreground with a brass tray of creations in dark pleated cups " +
      `(${RANGE}; image 1 is the reference), a silver-brass coffee service and two small cups. Behind, softly out of focus: arches, warm lamps, plants, a calm and refined interior. ` +
      `Image 2 sets the materials and mood only. No people. ${PHOTO_STYLE} ${NO_LETTERING}`,
    alt: "Salon d'un hôtel de luxe : plateau de créations Maison Tamrān et service à café",
    usage: "Professionnels (hôtels, restaurants, épiceries fines)",
    publishWidth: 3840,
    priority: 10,
  },
  {
    id: "meta-coeur",
    group: "univers",
    size: "2560x1440",
    quality: "high",
    refs: [{ file: PRODUCT_REF }],
    prompt:
      "Macro 16:9 photograph, step 'the heart': a single plain Medjool date (no chocolate yet), slit open lengthwise, pit removed, its two halves gently parted to reveal the glossy amber flesh, " +
      "with a generous line of smooth pale green pistachio cream nested inside. Beside it, a small brass spoon with a little pistachio cream and a few shelled pistachios. " +
      `Dark brown stone surface, warm side light from the left, very shallow depth of field. Image 1 sets the light and colour only. ${PHOTO_STYLE} ${NO_TEXT}`,
    alt: "Une datte Medjool ouverte, dénoyautée, garnie d'une crème de pistache",
    usage: "Accueil, la métamorphose (03 · le cœur)",
    publishWidth: 2560,
    priority: 10,
  },
  {
    id: "meta-enrobage",
    group: "univers",
    size: "2560x1440",
    quality: "high",
    refs: [{ file: PRODUCT_REF }],
    prompt:
      "Macro 16:9 photograph, step 'the coating': three filled Medjool dates freshly coated in glossy tempered dark chocolate, resting on a chocolate-stained cooling rack, the coating still settling; " +
      "a slow ribbon of molten chocolate drips from the rack; behind, a bowl of molten dark chocolate with a soft swirl. Dark background, warm rim light making the chocolate shine. " +
      `Image 1 sets the light and colour only. ${PHOTO_STYLE} ${NO_TEXT}`,
    alt: "Dattes garnies fraîchement enrobées de chocolat noir, sur une grille",
    usage: "Accueil, la métamorphose (04 · l'enrobage), savoir-faire",
    publishWidth: 2560,
    priority: 10,
  },
  {
    id: "atelier-ingredients",
    group: "univers",
    size: "3840x2160",
    quality: "high",
    refs: [{ file: PRODUCT_REF }],
    prompt:
      "Wide 16:9 top-down flat lay on dark stone of the house's raw ingredients arranged with restraint in small brass and ceramic bowls and loose on the stone: shelled pistachios, saffron threads, " +
      "dried rose petals, green cardamom pods, roasted hazelnuts, black sesame seeds, matcha powder, toasted coconut flakes, fresh raspberries, pecans, coffee beans, broken pieces of dark chocolate, " +
      "and a few glossy Medjool dates. Warm raking light from the left, deep soft shadows, generous dark negative space in the centre. Image 1 sets the light and colour only. " +
      `${PHOTO_STYLE} ${NO_TEXT}`,
    alt: "Les ingrédients de la maison : pistache, safran, rose, cardamome, noisette, sésame noir, matcha, coco, framboise, pécan, café, chocolat et dattes Medjool",
    usage: "Accueil (les saveurs), savoir-faire",
    publishWidth: 3840,
    priority: 10,
  },
  {
    id: "coffret-ferme",
    group: "coffret",
    size: "3840x2160",
    quality: "high",
    refs: [{ file: BOX_REF }],
    prompt:
      "Image 1 shows the Maison Tamran gift box style. Wide cinematic 16:9 still life, camera looking straight down at a warm travertine table at golden hour. " +
      `On the right half of the frame: a closed ${BOX_STYLE.replace(", ivory interior, individual dark brown pleated paper cups", "")}, its lid completely blank and smooth ` +
      "(no logo, no emblem, no text: the lid is plain cocoa-brown with only the thin champagne-copper line). Around it, with restraint: a small hammered brass plate " +
      "with three glossy Medjool dates, a handleless ivory coffee cup, a few pistachios, a sprig of dried date palm. Long soft shadows of palm fronds fall across the table from the left. " +
      "The left half of the frame stays calm and dark-warm, with negative space for a headline. Rich, warm, editorial. " +
      `${PHOTO_STYLE} No hands, no people, no text, no letters, no logo.`,
    alt: "Coffret Maison Tamrān fermé sur une table en travertin, dans la lumière dorée",
    usage: "Hero de l'accueil (coffret fermé)",
    publishWidth: 3840,
    priority: 10,
    lidLogo: { abbba38883ae: [[2317, 341], [3465, 726], [3115, 1685], [1931, 1232]] },
  },
];

export const SHOTS: OpenAIShot[] = [...productShots(), ...UNIVERS].sort((a, b) => a.priority - b.priority);
export const SHOT_BY_ID = new Map(SHOTS.map((s) => [s.id, s]));
