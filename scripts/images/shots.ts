// Catalogue des prises de vue MAISON TAMRĀN : un prompt photographique par emplacement d'image du site.
// Les identifiants reprennent ceux des anciens visuels concept (public/images/concepts/<id>.webp) :
// une photo validée remplace automatiquement le visuel concept partout où il est utilisé.
// Les recettes sont des prototypes : chaque image est une IMAGE CONCEPTUELLE (IA), jamais la photo d'un produit fabriqué.
import { RECIPES, type Recipe } from "../../src/data/recipes";

export type ShotGroup = "hero" | "produit" | "coupe" | "scene" | "coffret" | "univers" | "texture" | "couche";

export interface Shot {
  /** identifiant d'emplacement (clé du manifeste) */
  id: string;
  group: ShotGroup;
  title: string;
  usage: string;
  /** sous-dossier de public/images où la photo validée est publiée */
  dir: string;
  width: number;
  height: number;
  /** ordre de génération quand le quota est limité (1 = d'abord) */
  priority: number;
  recipe?: string;
  prompt: string;
}

const PHOTO =
  "Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.";
const AMBIENCE =
  "Ultra-realistic editorial photography for a luxury gourmet brand, natural light, true-to-life colours, refined composition, shallow depth of field. No text, no logo, no brand names, no people's faces.";
const BOX =
  "The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges.";

const PORTRAIT = { width: 1024, height: 1280 }; // 4:5
const LANDSCAPE = { width: 1536, height: 1024 }; // 3:2
const WIDE = { width: 1920, height: 1088 }; // ≈16:9 (multiples de 16)
const SQUARE = { width: 1024, height: 1024 };

const COAT: Record<Recipe["chocolate"], string> = {
  noir: "dark chocolate",
  lait: "milk chocolate",
  blanc: "ivory white chocolate",
  blond: "golden blond caramelised chocolate",
};

/** Direction photographique propre à chaque recette (univers, lumière, coupe, ingrédients). */
interface Direction {
  surface: string;
  light: string;
  finish: string; // enrobage + décor visibles sur la pièce entière
  heart: string; // ce que révèle la coupe
  props: string; // ingrédients de la mise en scène
}

const DIRECTION: Record<string, Direction> = {
  "eclipse-noire": {
    surface: "a deep cocoa-black slate surface against a near-black background",
    light: "low-key cinematic side light from the right drawing a thin highlight along the chocolate",
    finish: "fully enrobed in glossy dark chocolate, a delicate line of toasted black sesame seeds and a few fine threads of bright yellow yuzu zest on top",
    heart: "a creamy charcoal-black toasted black sesame praline heart, lightly marbled with a glossy golden yuzu gel",
    props: "a small matte black ceramic bowl of toasted black sesame seeds, half a fresh yuzu, a few shards of dark chocolate",
  },
  "velours-persan": {
    surface: "a warm ivory silk cloth with soft folds",
    light: "soft golden morning light from the left",
    finish: "enrobed in satin milk chocolate, decorated with a few deep red saffron threads and slivered white almonds",
    heart: "a smooth ivory white-almond cream infused with saffron, golden-tinted, around a soft glossy apricot centre",
    props: "a tiny brass dish of saffron threads, whole blanched almonds, a few plump dried apricots",
  },
  "minuit-a-kyoto": {
    surface: "a pale grey honed stone surface with a dark charcoal background",
    light: "cool soft diffused daylight, quiet Japanese minimalism",
    finish: "enrobed in ivory white chocolate, lightly dusted with vivid green matcha powder, a curl of yuzu zest",
    heart: "a vivid jade-green matcha ganache with a bright translucent yellow yuzu heart",
    props: "a dark ceramic bowl of matcha powder with a bamboo whisk, half a fresh yuzu",
  },
  "or-de-marrakech": {
    surface: "a cream travertine stone surface with natural pores",
    light: "warm natural light coming from the left, golden highlights",
    finish: "enrobed in milk chocolate, topped with crisp golden kadaif threads and bright green crushed pistachio",
    heart: "a generous bright green pistachio and orange-blossom cream studded with fine crisp golden kadaif threads",
    props: "a small bowl of shelled green pistachios, a nest of golden kadaif, a sprig of white orange blossoms",
  },
  "cafe-imperial": {
    surface: "a rich espresso-brown background and dark walnut wood surface",
    light: "warm low light, glowing highlights on the chocolate",
    finish: "enrobed in dark chocolate, a single roasted coffee bean and crushed green cardamom on top",
    heart: "an intense smooth hazelnut praline infused with espresso, flecked with ground coffee and green cardamom",
    props: "a few roasted coffee beans, whole toasted hazelnuts, green cardamom pods",
  },
  "rouge-desir": {
    surface: "a warm ivory plaster background and ivory stone surface",
    light: "bright soft light with a vibrant yet natural colour palette",
    finish: "enrobed in dark chocolate, a fine glossy raspberry drizzle, freeze-dried raspberry pieces and dried hibiscus petals",
    heart: "a glossy ruby-red tart raspberry and hibiscus confit",
    props: "fresh raspberries, dried deep-red hibiscus flowers, dark chocolate shards",
  },
  "ebene-sale": {
    surface: "a dark grey slate surface",
    light: "moody side light from the left, deep contrast",
    finish: "enrobed in dark chocolate, sprinkled with toasted buckwheat groats and a few flakes of sea salt",
    heart: "a crunchy toasted buckwheat praline bound with a glossy amber white-miso caramel",
    props: "a small bowl of toasted buckwheat groats, a little pot of amber caramel, flaky sea salt",
  },
  "ile-secrete": {
    surface: "a natural oatmeal linen tablecloth",
    light: "luminous warm tropical daylight with soft palm-leaf shadows",
    finish: "enrobed in golden blond caramelised chocolate, topped with toasted coconut flakes",
    heart: "a pale green pandan cream folded with golden toasted coconut",
    props: "fresh pandan leaves, toasted coconut flakes in a half coconut shell bowl",
  },
  "ambre-fume": {
    surface: "a deep chocolate-brown matte surface",
    light: "warm amber light with a faint wisp of smoke in the background",
    finish: "enrobed in milk chocolate, half a glossy pecan and a few smoked salt flakes on top",
    heart: "an amber maple caramel with roasted pecan pieces",
    props: "whole pecans, a small glass jug of amber maple syrup, smoked salt flakes",
  },
  "rose-de-nuit": {
    surface: "a white Carrara marble surface with soft grey veining",
    light: "soft romantic diffused light, delicate pink tones",
    finish: "enrobed in ivory white chocolate with a faint blush-pink marbling, crushed dried rose petals and a raspberry drizzle",
    heart: "a pale pink lychee and rose ganache around a bright raspberry heart",
    props: "fresh peeled lychees, pale pink rose petals, fresh raspberries",
  },
};

const shots: Shot[] = [];

// 1 — Hero
shots.push(
  {
    id: "hero",
    group: "hero",
    title: "Hero d'accueil",
    usage: "Ouverture plein écran de l'accueil (texte sur le tiers gauche : zone sombre et calme)",
    dir: "hero",
    ...WIDE,
    priority: 1,
    prompt: `A spectacular premium Medjool date enrobed in milk chocolate, cut in half to reveal a generous bright green pistachio and orange-blossom heart with golden kadaif threads, the two halves resting on a deep cocoa-brown surface, a few pistachio crumbs, dramatic contrast of warm light and deep shadows, the subject placed in the right half of the frame, the left third of the frame in deep calm cocoa shadow. ${PHOTO}`,
  },
  {
    id: "hero-portrait",
    group: "hero",
    title: "Hero d'accueil (mobile)",
    usage: "Hero plein écran sur mobile (texte en bas : zone sombre)",
    dir: "hero",
    width: 1088,
    height: 1920,
    priority: 1,
    prompt: `Vertical composition: a premium Medjool date enrobed in milk chocolate, cut in half revealing a generous bright green pistachio heart with golden kadaif threads, placed in the upper half of the frame on a deep cocoa-brown surface, the lower third in deep calm cocoa shadow, warm dramatic light. ${PHOTO}`,
  },
  {
    id: "collection-hero",
    group: "hero",
    title: "Hero de la page Créations",
    usage: "Panoramique de plusieurs créations (page /creations)",
    dir: "collections",
    ...WIDE,
    priority: 1,
    prompt: `Panoramic view of a row of ten different gourmet stuffed Medjool dates enrobed in dark, milk, white and blond chocolate, each with a different delicate topping (pistachio, black sesame, matcha, coffee bean, raspberry, rose petals, coconut, pecan, saffron, buckwheat), two of them cut in half showing colourful fillings, arranged on a long cream travertine slab against a deep cocoa background, warm side light. ${PHOTO}`,
  }
);

// 2 à 5 — Produits : principale (signature d'abord), coupe, mise en scène
for (const r of RECIPES) {
  const d = DIRECTION[r.slug];
  if (!d) throw new Error(`Direction photo manquante pour ${r.slug}`);
  const signature = r.collection === "signature";
  shots.push({
    id: `produit-${r.slug}`,
    group: "produit",
    title: `${r.name} — visuel principal`,
    usage: "Visuel principal (cartes, fiche produit)",
    dir: "products",
    ...PORTRAIT,
    priority: signature ? 2 : 5,
    recipe: r.slug,
    prompt: `Three-quarter view of a single gourmet Medjool date ${d.finish}, placed on ${d.surface}, ${d.light}, a second identical piece softly out of focus behind it. ${PHOTO}`,
  });
  shots.push({
    id: `coupe-${r.slug}`,
    group: "coupe",
    title: `${r.name} — vue en coupe`,
    usage: "Vue en coupe (survol des cartes, galerie de la fiche)",
    dir: "products/cutaway",
    ...PORTRAIT,
    priority: signature ? 3 : 5,
    recipe: r.slug,
    prompt: `Macro close-up of a gourmet Medjool date ${d.finish}, cut cleanly in half lengthwise, the two halves facing the camera revealing the precise layers: a thin crisp ${COAT[r.chocolate]} shell, a layer of glossy amber-brown date flesh, and ${d.heart}. A whole piece beside it. On ${d.surface}, ${d.light}, a few crumbs of the topping. ${PHOTO}`,
  });
  shots.push({
    id: `scene-${r.slug}`,
    group: "scene",
    title: `${r.name} — mise en scène`,
    usage: "Mise en scène avec les ingrédients (galerie, éditions éphémères)",
    dir: "products/scenes",
    ...LANDSCAPE,
    priority: signature ? 5 : 6,
    recipe: r.slug,
    prompt: `Elegant still life seen from a high angle: one whole gourmet Medjool date ${d.finish} and one halved piece revealing ${d.heart}, surrounded with restraint by ${d.props}, on ${d.surface}, ${d.light}, generous negative space. ${PHOTO}`,
  });
}

// 4 — Coffrets
const coffrets: [string, string, string][] = [
  ["coffret-1", "Coffret Signature ouvert (12)", `Top view of an open rigid deep chocolate-brown gift box holding twelve assorted gourmet chocolate-enrobed stuffed Medjool dates, each in its own cavity with different toppings (pistachio, black sesame, matcha, coffee bean, raspberry, saffron), the lid placed beside it, ivory tissue paper, cream travertine surface. ${BOX}`],
  ["coffret-ferme", "Coffret fermé", `A closed rigid deep chocolate-brown gift box tied with a thin satin bronze ribbon, three-quarter view on cream travertine, soft warm side light. ${BOX}`],
  ["coffret-2", "Coffret Prestige ouvert (24)", `A large open rigid deep chocolate-brown gift box with two rows of twenty-four assorted gourmet chocolate-enrobed stuffed dates with varied toppings, the lid leaning at an angle, on a dark cocoa surface, low warm light. ${BOX}`],
  ["coffret-3", "Coffret Découverte ouvert (6)", `An open small ivory rigid gift box holding six assorted gourmet chocolate-enrobed stuffed Medjool dates, the lid beside it, a few pistachio crumbs, pale limestone surface, bright soft daylight. ${BOX}`],
  ["coffret-4", "Coffret Édition limitée", `An open rigid gift box in a deep desaturated olive green with a bronze ribbon, holding twelve seasonal chocolate-enrobed stuffed dates with coconut, pecan, buckwheat and rose toppings, on dark slate. ${BOX}`],
];
for (const [id, title, subject] of coffrets) {
  shots.push({ id, group: "coffret", title, usage: "Coffrets (page Coffrets, accueil)", dir: "boxes", ...LANDSCAPE, priority: 4, prompt: `${subject} ${PHOTO}` });
}
const packaging: [string, string, string][] = [
  ["packaging-1", "Couvercle de coffret", `Top view of a closed rigid deep chocolate-brown gift box lid on oatmeal linen, soft side light revealing the fine paper texture. ${BOX}`],
  ["packaging-2", "Trois coffrets empilés", `Three stacked rigid gift boxes in deep chocolate brown, ivory and olive green, three-quarter view, soft side light, cream background. ${BOX}`],
  ["packaging-3", "Carte de dégustation", `A blank cream letterpress tasting card next to a satin bronze ribbon and two chocolate-enrobed stuffed dates on white marble. The card is completely blank. ${BOX}`],
];
for (const [id, title, subject] of packaging) {
  shots.push({ id, group: "coffret", title, usage: "Packaging (coffrets, connexion)", dir: "boxes", ...PORTRAIT, priority: 4, prompt: `${subject} ${PHOTO}` });
}
shots.push(
  { id: "pro-1", group: "coffret", title: "Coffrets entreprise", usage: "Cadeaux d'entreprise", dir: "boxes", ...LANDSCAPE, priority: 4, prompt: `Corporate gifting: neat stacks of rigid gift boxes in deep chocolate brown and ivory with bronze ribbons, one open box showing twelve chocolate-enrobed stuffed dates, pale limestone surface, clean bright studio light. ${BOX} ${PHOTO}` },
  { id: "pro-2", group: "coffret", title: "Mariage — mignardises", usage: "Mariages et événements", dir: "lifestyle", ...LANDSCAPE, priority: 6, prompt: `Elegant wedding reception table seen from above: cream porcelain plates, at each setting a tiny ivory box holding two chocolate-enrobed stuffed dates with a bronze ribbon, white linen tablecloth, white flowers, soft daylight. ${BOX} ${AMBIENCE}` }
);

// 6 — Univers : textures, origines, café, art de recevoir
const textures = [
  "Extreme macro of the boundary between glossy dark chocolate and the natural wrinkled skin of a Medjool date, black sesame seeds catching the light",
  "Extreme macro of vivid green matcha powder dusted over smooth ivory white chocolate with fine yuzu zest curls",
  "Extreme macro cross-section of bright green pistachio cream with golden kadaif threads inside a date under a thin milk chocolate shell",
  "Extreme macro of a thin glossy raspberry drizzle over dark chocolate with dried hibiscus fragments",
  "Extreme macro cross-section of hazelnut praline with espresso specks inside a dark-chocolate-enrobed date",
  "Extreme macro of red saffron threads and slivered almonds resting on satin milk chocolate",
];
textures.forEach((t, i) =>
  shots.push({ id: `macro-${i + 1}`, group: "texture", title: `Texture ${i + 1}`, usage: "Gros plan de texture (accueil, savoir-faire)", dir: "ingredients", ...SQUARE, priority: 6, prompt: `${t}. ${PHOTO}` })
);
const univers: [string, string, string, typeof LANDSCAPE][] = [
  ["datte-naturelle", "La datte naturelle", "A single fresh natural Medjool date, plump with glossy wrinkled mahogany skin, resting on a piece of dry palm frond on cream travertine, warm side light, macro still life", PORTRAIT],
  ["origines-1", "Oasis au coucher du soleil", "A peaceful date palm grove in a desert oasis at golden hour, tall date palms with heavy hanging clusters of ripening dates, warm haze, cinematic wide landscape, no buildings, no people", WIDE],
  ["origines-2", "Régimes de dattes", "Close-up of heavy clusters of ripe amber-brown Medjool dates hanging under green date palm fronds, warm backlight through the leaves, cinematic", LANDSCAPE],
  ["lifestyle-1", "Café et dattes", "Overhead: an espresso in a cream porcelain cup on its saucer beside a small dark plate with three chocolate-enrobed stuffed dates, coffee beans scattered, limestone table, morning light", LANDSCAPE],
  ["lifestyle-cafe-2", "Café à la cardamome", "A brass dallah pot pouring golden cardamom coffee into small handleless cups, a plate of chocolate-enrobed stuffed dates beside them, dark wood table, warm low light", LANDSCAPE],
  ["lifestyle-2", "L'art d'offrir", "A closed plain chocolate-brown gift box tied with a bronze ribbon and a blank handwritten-style card with no visible writing, oatmeal linen, soft daylight", LANDSCAPE],
  ["lifestyle-3", "Art de recevoir", "Art of hosting: a large cream ceramic platter with a ring of assorted chocolate-enrobed stuffed dates, two glasses of mint tea, an olive branch, marble table, overhead view", LANDSCAPE],
  ["recevoir-2", "Table du soir", "An elegant evening table: an open chocolate-brown box of assorted stuffed dates, candlelight, crystal glasses, dark linen tablecloth, warm intimate light", LANDSCAPE],
];
for (const [id, title, subject, size] of univers) {
  shots.push({ id, group: "univers", title, usage: "Univers de marque (accueil, Maison, Professionnels)", dir: "lifestyle", ...size, priority: 6, prompt: `${subject}. ${BOX} ${AMBIENCE}` });
}

// Vue éclatée « Au cœur de la création » : même cadrage pour les quatre couches
const couches: [string, string][] = [
  ["couche-datte", "a single opened and pitted natural Medjool date, slit along its length"],
  ["couche-garniture", "a quenelle of bright green pistachio cream with golden kadaif threads shaped to fit inside a date"],
  ["couche-chocolat", "a Medjool date fully enrobed in glossy milk chocolate, whole"],
  ["couche-finition", "a Medjool date enrobed in milk chocolate topped with golden kadaif threads and crushed pistachio"],
];
for (const [id, subject] of couches) {
  shots.push({ id, group: "couche", title: `Vue éclatée — ${id.replace("couche-", "")}`, usage: "Animation « Au cœur de la création » (même cadrage pour les 4 couches)", dir: "ingredients", ...LANDSCAPE, priority: 6, prompt: `Centered product shot of ${subject}, isolated on a seamless warm cream background, same scale and angle as a product series, soft even studio light. ${PHOTO}` });
}

export const SHOTS: Shot[] = shots.sort((a, b) => a.priority - b.priority);
export const SHOT_BY_ID = new Map(SHOTS.map((s) => [s.id, s]));
