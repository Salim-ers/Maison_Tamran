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
  | { file: string; fit: number } // fichier du dépôt ramené à `fit` px de côté au plus, envoyé en PNG
  | { shot: string }; // dernier original généré pour un autre emplacement

export interface OpenAIShot {
  id: string; // clé du manifeste photo lu par le site (src/data/photo-manifest.json)
  group: "produit" | "coupe" | "piece" | "coffret" | "univers" | "ambiance";
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
      usage: "Fiche produit (zoom sur la garniture), cartes (survol), Signatures et éditions de l'accueil",
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
      usage: "Configurateur et coffrets de l'accueil (pièce posée dans sa caissette)",
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
    usage: "Page Coffrets, menus de l'en-tête",
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
    usage: "Page Coffrets",
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
    usage: "Accueil (la Maison), Notre Maison, menus de l'en-tête",
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
    usage: "Professionnels, mariages et événements",
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
    usage: "Accueil (professionnels), Professionnels",
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
    usage: "Accueil, de la palmeraie à la création (le cœur)",
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
    usage: "Accueil, de la palmeraie à la création (l'enrobage), savoir-faire",
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
    usage: "Le savoir-faire, menus de l'en-tête",
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

/** Verticales 9:16 (2160 × 3840) : ouvertures des pages éditoriales sur mobile. */
const VERTICALES: OpenAIShot[] = [
  {
    id: "maison-palmeraie-v",
    group: "univers",
    size: "2160x3840",
    quality: "high",
    refs: [{ file: "brand/source/stock/dattier-regimes__pBxL6uM3Ezg.jpg" }],
    prompt:
      "Vertical 9:16 photograph of a date palm grove at golden hour: tall palm trunks, heavy clusters of ripening amber and brown Medjool dates hanging under the fronds in the foreground, " +
      "warm low sunlight filtering through the palms, soft haze, deep shadows at the bottom of the frame for text. Image 1 sets the subject and the light only. " +
      `${PHOTO_STYLE} ${NO_TEXT}`,
    alt: "Une palmeraie à l'heure dorée, régimes de dattes Medjool sous les palmes",
    usage: "Notre Maison (ouverture, mobile)",
    publishWidth: 2160,
    priority: 30,
  },
  {
    id: "atelier-ingredients-v",
    group: "univers",
    size: "2160x3840",
    quality: "high",
    refs: [{ shot: "atelier-ingredients" }],
    prompt:
      "Image 1 is the house's flat lay of ingredients. Recreate it as a vertical 9:16 top-down flat lay with the same dark stone, the same brass and ceramic bowls and the same ingredients " +
      "(pistachios, saffron, dried rose petals, cardamom, hazelnuts, black sesame, matcha, coconut, raspberries, pecans, coffee beans, dark chocolate, Medjool dates), arranged along the top " +
      `and the sides, with calm dark negative space in the lower third for text. Warm raking light. ${PHOTO_STYLE} ${NO_TEXT}`,
    alt: "Les ingrédients de la maison sur une pierre sombre, vus de dessus",
    usage: "Le savoir-faire (ouverture, mobile)",
    publishWidth: 2160,
    priority: 30,
  },
  {
    id: "coffrets-ruban-v",
    group: "univers",
    size: "2160x3840",
    quality: "high",
    refs: [{ shot: "coffret-entreprise" }],
    prompt:
      "Image 1 shows the Maison Tamran gift boxes tied with champagne ribbon. Vertical 9:16 photograph: a tall elegant stack of four closed cocoa-brown gift boxes of decreasing size, " +
      "each tied with a fine champagne silk ribbon and bow, blank lids, on a polished dark walnut surface, warm golden window light from the side, deep soft shadows, " +
      `calm dark space in the lower third for text. ${PHOTO_STYLE} ${NO_LETTERING}`,
    alt: "Coffrets Maison Tamrān empilés, noués de rubans champagne",
    usage: "Professionnels (ouverture, mobile)",
    publishWidth: 2160,
    priority: 30,
  },
];

/** Coffret Signature 12 pièces en définition 4K : remplace sur le site la photographie de référence (1448 px). */
const SIGNATURE: OpenAIShot = {
  id: "coffret-signature",
  group: "coffret",
  size: "3264x2448",
  quality: "high",
  refs: [{ shot: "coffret-ferme" }, ROW_1, ROW_2],
  prompt:
    `Image 1 shows the Maison Tamran box and setting. Three-quarter view, 4:3, of the open twelve-piece gift box: ${BOX_STYLE}, its blank lid leaning against the back. ` +
    `Twelve whole creations in a 4 × 3 grid of cups (${RANGE}; images 2 and 3 are the references). Warm travertine table, golden late-afternoon light, palm-frond shadows, ` +
    `a handleless ivory coffee cup and a small brass plate of plain Medjool dates beside it, a brass dallah softly out of focus behind. ${PHOTO_STYLE} ${NO_LETTERING}`,
  alt: "Coffret Signature ouvert : douze créations dans leurs caissettes, sur une table en travertin",
  usage: "Coffrets, accueil (format 12 pièces), Maison, Professionnels, Savoir-faire, compte",
  publishWidth: 3264,
  priority: 20,
};

// --- Photographies d'ambiance ----------------------------------------------------------------------------
// Remplacent les photographies libres de droits (src/data/ambiance-manifest.json), trop peu définies une fois
// agrandies : même sujet, même orientation, nouvelle prise de vue originale en définition native 4K.
// La photographie libre de droits ne sert qu'à indiquer le sujet et l'ambiance (image 1).
const LANDSCAPE = "3504x2336";
const PORTRAIT = "2336x3504";
const AMBIANCE: [key: string, file: string, size: string, prompt: string, alt: string, usage: string][] = [
  ["palmeraie", "palmeraie__v9MYNk3HMeM.jpg", LANDSCAPE,
    "Wide landscape photograph of a date palm grove rising from golden sand dunes under a clear deep-blue sky, warm late-afternoon light, long soft shadows on the sand, no buildings.",
    "Palmeraie de dattiers au milieu des dunes de sable doré, sous un ciel bleu", "Notre Maison"],
  ["dattier-regimes", "dattier-regimes__pBxL6uM3Ezg.jpg", PORTRAIT,
    "Vertical photograph looking up into a date palm: heavy bunches of ripening amber and dark brown dates hanging on long orange stalks beneath the fronds, golden backlight through the leaves, a small patch of blue sky.",
    "Régimes de dattes ambrées et brunes suspendus sous les palmes d'un dattier", "Accueil, Le savoir-faire"],
  ["dattes-naturelles", "dattes-naturelles__Ae6qKztd0Xw.jpg", LANDSCAPE,
    "Low-key still life: a small turned wooden bowl filled with glossy natural Medjool dates on a slice of walnut wood, dark brown linen, a few loose dates beside it, warm side light from the left.",
    "Petit bol en bois rempli de dattes Medjool naturelles sur un lin brun sombre", "Notre Maison, Le savoir-faire"],
  ["chocolat", "chocolat__BqJAbXk2Fuw.jpg", LANDSCAPE,
    "Top-down photograph of a bar of fine dark chocolate with a broken-off two-square piece, lightly dusted with cocoa powder, on a matte black surface, soft raking light revealing the snap.",
    "Tablette de chocolat noir saupoudrée de cacao sur fond noir, vue du dessus", "Fiches produit (ingrédients)"],
  ["riad-lumiere", "riad-lumiere__GtlrYb2cPp4.jpg", PORTRAIT,
    "Vertical photograph of a riad courtyard at dusk: a tall carved and painted wooden double door under a glowing hanging brass lantern, white walls with carved stucco friezes, an emerald zellige plunge pool, a black-and-white tiled floor, a banana plant, warm lamplight.",
    "Patio de riad, porte en bois sculpté éclairée par une lanterne en laiton, bassin de zellige vert", "Notre Maison"],
  ["cafe-oriental", "cafe-oriental__57BCZzL2t8E.jpg", LANDSCAPE,
    "Close-up of a polished brass Arabic coffee pot (dallah) with a curl of rising steam, on a dark warm brown background, warm rim light on the brass.",
    "Dallah en laiton enveloppée de vapeur sur fond sombre", "Contact, Professionnels"],
  ["art-de-recevoir", "art-de-recevoir__pbMf0vDIdO8.jpg", LANDSCAPE,
    "Photograph of a silver Moroccan teapot on a round engraved brass tray with engraved tea glasses and a small ceramic sugar pot, on a light wooden table on a sunlit riad terrace, soft ivory background, gentle morning light.",
    "Théière marocaine argentée et verres à thé ciselés sur un plateau en laiton", "Coffrets, Notre Maison, Professionnels"],
  ["pistache", "pistache__Zo0TZax87Cc.jpg", LANDSCAPE,
    "Macro photograph of split in-shell pistachios revealing their bright green kernels, on rustic dark wood, warm golden light, very shallow depth of field.",
    "Pistaches entrouvertes laissant voir leur amande verte, en lumière dorée", "Fiches produit (ingrédients)"],
  ["noisette", "noisette__SNQfkUNHWlA.jpg", PORTRAIT,
    "Top-down full-frame texture of roasted shelled hazelnuts with their brown skins, some partly peeled, warm muted dark tones, soft directional light.",
    "Noisettes torréfiées en gros plan, vue du dessus", "Fiches produit (ingrédients)"],
  ["amande", "amande__RZ-AHtxLPUE.jpg", LANDSCAPE,
    "Macro photograph of whole raw almonds filling the frame, showing the ridged skin texture, warm tones, shallow depth of field.",
    "Amandes entières en macro, texture de la peau", "Fiches produit (ingrédients)"],
  ["cardamome", "cardamome__dZIs-KaRdu8.jpg", LANDSCAPE,
    "A small pile of green cardamom pods, one split open showing its dark seeds, on dark grey slate, shallow depth of field, generous negative space on the right.",
    "Gousses de cardamome verte sur une ardoise sombre", "Fiches produit (ingrédients)"],
  ["safran", "safran__hTE438DvDgg.jpg", PORTRAIT,
    "Vertical photograph of a trail of loose deep-red saffron threads with orange tips spilling from a small brass bowl across a dark, warm, weathered surface, low-key light, shallow depth of field.",
    "Filaments de safran rouge sombre répandus depuis une coupelle en laiton", "Fiches produit (ingrédients)"],
  ["rose", "rose__FJM3wo0eCGY.jpg", LANDSCAPE,
    "Full-frame texture of dried rose petals in deep pink, magenta and dusky purple tones, soft warm light, fine detail of the petal veins.",
    "Pétales de rose séchés, texture rose et pourpre", "Fiches produit (ingrédients)"],
  ["framboise", "framboise__h-pMChQzbOM.jpg", LANDSCAPE,
    "Dark, moody macro photograph of fresh red raspberries with tiny water droplets, on a dark surface, warm side light.",
    "Framboises fraîches en macro, lumière sombre", "Fiches produit (ingrédients)"],
  ["cafe-grains", "cafe-grains__H80RH1Hhvu8.jpg", LANDSCAPE,
    "Full-frame close-up of glossy dark roasted coffee beans, warm raking light, shallow depth of field.",
    "Grains de café torréfiés en gros plan", "Fiches produit (ingrédients)"],
  ["coco", "coco__nUApCUJ1M6k.jpg", PORTRAIT,
    "Vertical photograph of two broken pieces of fresh coconut showing thick white flesh and brown fibrous shell, on crumpled natural linen, soft natural light, shallow depth of field.",
    "Morceaux de noix de coco ouverte sur un lin naturel froissé", "Fiches produit (ingrédients)"],
  ["matcha", "matcha__DgW9B48pRb4.jpg", LANDSCAPE,
    "Top-down photograph of vivid green matcha powder in a small handmade ivory ceramic cup, a bamboo whisk beside it, on a pale warm travertine surface, soft daylight.",
    "Poudre de matcha dans une coupelle en céramique ivoire, sur une pierre claire", "Fiches produit (ingrédients)"],
  ["medjool-macro", "medjool-macro__kO5ENCZTxoM.jpg", LANDSCAPE,
    "Macro photograph of a pile of large, glossy, deeply wrinkled reddish-brown Medjool dates in warm side light, very shallow depth of field, dark warm background.",
    "Gros plan de dattes Medjool brunes, charnues et ridées, en lumière chaude", "Accueil, fiches produit"],
  ["palmeraie-maroc", "palmeraie-maroc__ttOFPXjGFEA.jpg", LANDSCAPE,
    "Elevated view over a dense date palm grove on sandy ground, an earth-coloured village along the horizon and distant mountains, warm golden late-afternoon light, pale clear sky.",
    "Palmeraie de dattiers dense devant un village de terre et des montagnes", "Notre Maison"],
  ["riad-soleil", "riad-soleil__ClAUVD_88NY.jpg", LANDSCAPE,
    "Sunlit palace courtyard: white arcades with horseshoe arches, green-tiled eaves, a zellige-and-marble floor with a central marble fountain, deep blue sky, crisp architectural photograph.",
    "Cour ensoleillée aux arcades blanches et sol de zellige, fontaine au centre", "Notre Maison"],
];
const AMBIANCE_SHOTS: OpenAIShot[] = AMBIANCE.map(([key, file, size, subject, alt, usage]) => ({
  id: `amb-${key}`,
  group: "ambiance",
  size,
  quality: "high",
  refs: [{ file: `brand/source/stock/${file}`, fit: 1536 }],
  prompt:
    `Image 1 sets the subject and the mood only: create a new, original photograph, not a copy of it. ${subject} ` +
    `Editorial photography for a luxury French confectionery house, natural colours, crisp detail, rich warm grade. No people, no hands, no text, no letters, no logo.`,
  alt,
  usage,
  publishWidth: Number(size.split("x")[0]),
  priority: 30,
}));

/**
 * Définition native 4K des visuels déjà validés : chaque visuel est refait à partir de son original retenu,
 * gelé ci-dessous et envoyé comme dernière image de référence (mêmes cadrage, objets et lumière ; détail plus fin).
 * Les originaux gelés restent dans brand/generated/ (prune ne les supprime pas).
 */
const MASTERS: Record<string, string> = {
  "coffret-decouverte": "adfcaf4242d7",
  "coffret-edition": "f9c0cbc12fc5",
  "coffret-prestige": "c5c97cfa038f",
  "coffret-vide-12": "6ad326886314",
  "coffret-vide-24": "fb81dead44e5",
  "coffret-vide-6": "8015b9b3f581",
  "coupe-ambre-fume": "84d777ba185e",
  "coupe-cafe-imperial": "8b630223f248",
  "coupe-ebene-sale": "d1f959e7c1ab",
  "coupe-eclipse-noire": "5b9e149e9c53",
  "coupe-ile-secrete": "b20b28f3c072",
  "coupe-minuit-a-kyoto": "bfeb2879a6f6",
  "coupe-or-de-marrakech": "c7926116973b",
  "coupe-rose-de-nuit": "49135ce33240",
  "coupe-rouge-desir": "29c6c13a4697",
  "coupe-velours-persan": "76d5ddacf6bf",
  "meta-coeur": "c6c01a8e09b1",
  "meta-enrobage": "c566241e82e8",
  "piece-ambre-fume": "6ec2f3bb3c86",
  "piece-cafe-imperial": "aeeaf9323051",
  "piece-ebene-sale": "0a2c1539d351",
  "piece-eclipse-noire": "f9d6e0760b18",
  "piece-ile-secrete": "a28871e448a1",
  "piece-minuit-a-kyoto": "679fa30a9af8",
  "piece-or-de-marrakech": "9a02a674c1cf",
  "piece-rose-de-nuit": "7d8f7bffb2ba",
  "piece-rouge-desir": "c80d300b806a",
  "piece-velours-persan": "de6825816fdb",
  "produit-ambre-fume": "50e6566b331f",
  "produit-cafe-imperial": "7dfddd2cb2ad",
  "produit-ebene-sale": "f5984c1a5573",
  "produit-eclipse-noire": "cc586d2a83d7",
  "produit-ile-secrete": "965c11056c8b",
  "produit-minuit-a-kyoto": "e940018e61a5",
  "produit-or-de-marrakech": "1bcf670f2ea3",
  "produit-rose-de-nuit": "329b2bf17ae5",
  "produit-rouge-desir": "247b2c46f2b9",
  "produit-velours-persan": "60a7b1d940a3",
};
/** Tailles 4K (≤ 8,3 Mpx, multiples de 16), au même rapport que la version validée. */
function hdSize(s: OpenAIShot): string | undefined {
  if (s.group === "produit") return "2448x3072";
  if (s.group === "coupe") return "2880x2880";
  if (s.group === "piece") return "2048x2048";
  if (s.id === "coffret-vide-24") return "3504x2336";
  if (s.id.startsWith("coffret-")) return "3264x2448";
  if (s.id.startsWith("meta-")) return "3840x2160";
}
export const MASTER_FILES = Object.entries(MASTERS).map(([id, key]) => `brand/generated/${id}/${key}.webp`);

function hd(s: OpenAIShot): OpenAIShot {
  const master = MASTERS[s.id];
  const size = hdSize(s);
  if (!master || !size) return s;
  const n = s.refs.length + 1;
  const grid = s.id.startsWith("coffret-vide") ? " The box edges and every cup must stay at exactly the same position and size in the frame." : "";
  return {
    ...s,
    size,
    publishWidth: Number(size.split("x")[0]),
    refs: [...s.refs, { file: `brand/generated/${s.id}/${master}.webp`, fit: 2560 }],
    prompt:
      `${s.prompt} Image ${n} is the approved photograph of this exact shot, at a lower resolution: reproduce it faithfully as a native high-resolution photograph, ` +
      `same composition and framing, same camera angle, same objects at the same positions and sizes, same colours and light, with finer, crisper detail and texture. ` +
      `Do not add, remove or move anything.${grid}`,
  };
}

export const SHOTS: OpenAIShot[] = [...productShots(), ...UNIVERS, SIGNATURE, ...VERTICALES, ...AMBIANCE_SHOTS].map(hd).sort((a, b) => a.priority - b.priority);
export const SHOT_BY_ID = new Map(SHOTS.map((s) => [s.id, s]));
