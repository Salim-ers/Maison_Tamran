// Génère le catalogue de prompts photo (un par emplacement de visuel concept).
// Usage : npm run prompts  →  docs/PROMPTS-PHOTO.md + docs/photo-prompts.json
import fs from "node:fs";
import path from "node:path";
import { RECIPES } from "../src/data/recipes";

const root = path.resolve(import.meta.dirname, "..");

const STYLE =
  "hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands";
const NEGATIVE =
  "3D render, CGI, plastic look, cartoon, illustration, oversaturated, harsh flash, clutter, palm trees, crowns, arabesque ornaments, gold glitter, watermark, text, extra objects, deformed dates, melted chocolate puddles";

const SURFACE_EN: Record<string, string> = {
  ivoire: "warm ivory linen paper background (#F7F3EC)",
  pierre: "pale honed limestone surface",
  ardoise: "dark slate stone surface",
  chocolat: "deep chocolate-brown matte surface (#251C1A)",
  lin: "natural oatmeal linen tablecloth",
  marbre: "white Carrara marble with soft grey veining",
};
const CHOC_EN: Record<string, string> = { noir: "dark chocolate", lait: "milk chocolate", blanc: "white chocolate", blond: "blond caramelised chocolate" };

const FILLING_EN: Record<string, string> = {
  "eclipse-noire": "a charcoal-black toasted black sesame praline with a glossy golden yuzu gel core",
  "velours-persan": "an ivory white-almond cream infused with saffron threads around a soft apricot centre",
  "minuit-a-kyoto": "a vivid matcha ganache with a bright yuzu heart",
  "or-de-marrakech": "a green pistachio and orange-blossom cream studded with crisp golden kadaif threads",
  "cafe-imperial": "a hazelnut praline infused with espresso and green cardamom",
  "rouge-desir": "a glossy tart raspberry and hibiscus confit",
  "ebene-sale": "a toasted buckwheat praline bound with white-miso caramel",
  "ile-secrete": "a pale green pandan cream with toasted coconut",
  "ambre-fume": "a maple caramel with roasted pecan pieces and smoked salt",
  "rose-de-nuit": "a pale pink lychee and rose ganache around a raspberry heart",
};
const TOPPING_EN: Record<string, string> = {
  "eclipse-noire": "a scattering of black sesame seeds and fine yuzu zest",
  "velours-persan": "a few saffron threads and slivered white almonds",
  "minuit-a-kyoto": "a light dusting of matcha and fine yuzu zest",
  "or-de-marrakech": "golden kadaif threads and chopped pistachio",
  "cafe-imperial": "a whole coffee bean and crushed green cardamom",
  "rouge-desir": "a fine raspberry drizzle, freeze-dried raspberry pieces and dried hibiscus petals",
  "ebene-sale": "toasted buckwheat groats and flaky sea salt",
  "ile-secrete": "toasted coconut flakes",
  "ambre-fume": "half a pecan and smoked salt flakes",
  "rose-de-nuit": "crushed dried rose petals and a raspberry drizzle",
};
const INGREDIENTS_EN: Record<string, string> = {
  "eclipse-noire": "a small ceramic bowl of black sesame seeds, halved fresh yuzu, a broken piece of dark chocolate",
  "velours-persan": "saffron threads in a tiny dish, white almonds, dried apricots",
  "minuit-a-kyoto": "a dark ceramic bowl of matcha powder with a bamboo whisk, halved yuzu",
  "or-de-marrakech": "orange blossoms, a bowl of shelled pistachios, a nest of golden kadaif",
  "cafe-imperial": "roasted coffee beans, green cardamom pods, whole hazelnuts",
  "rouge-desir": "fresh raspberries, dried hibiscus flowers, dark chocolate shards",
  "ebene-sale": "a bowl of toasted buckwheat, a small pot of caramel, white miso paste",
  "ile-secrete": "fresh pandan leaves, toasted coconut flakes in a coconut shell bowl",
  "ambre-fume": "pecans, a small glass jug of amber maple syrup, smoked salt",
  "rose-de-nuit": "fresh lychees, rose petals, fresh raspberries",
};

interface PromptEntry {
  id: string;
  file: string;
  section: string;
  usage: string;
  ratio: string;
  size: string;
  prompt: string;
  negative: string;
}

const list: PromptEntry[] = [];
const add = (id: string, section: string, usage: string, ratio: string, size: string, subject: string) =>
  list.push({ id, file: `public/images/photos/${id}.jpg`, section, usage, ratio, size, prompt: `${subject}. ${STYLE}.`, negative: NEGATIVE });

add("hero", "Accueil", "Ouverture plein écran (le texte occupe le tiers gauche : garder cette zone sombre et calme)", "16:9", "3840×2160",
  "A gourmet Medjool date stuffed with pistachio and orange-blossom cream and kadaif, sliced lengthwise to reveal its green heart, the two halves resting on a deep chocolate-brown surface, a closed rigid chocolate-brown gift box with a subtle embossed monogram and bronze foil wordmark softly out of focus in the background right, warm rim light, left third of the frame left in deep shadow for text");

for (const r of RECIPES) {
  const choc = CHOC_EN[r.chocolate];
  const surf = SURFACE_EN[r.palette.surface];
  add(`produit-${r.slug}`, `Produit : ${r.name}`, "Visuel principal (cartes, fiche produit)", "4:5", "2400×3000",
    `A single Medjool date three-quarters enrobed in ${choc}, the uncoated tip showing the natural wrinkled date skin, topped with ${TOPPING_EN[r.slug]}, placed diagonally on ${surf}, a second identical piece softly blurred in the background`);
  add(`coupe-${r.slug}`, `Produit : ${r.name}`, "Vue en coupe (survol des cartes, galerie) — même cadrage que le visuel principal", "4:5", "2400×3000",
    `The same ${choc}-coated Medjool date cut cleanly in half lengthwise, the two halves showing a thin ${choc} shell, the amber translucent date flesh and ${FILLING_EN[r.slug]}, on ${surf}, crumbs of the topping around`);
  add(`scene-${r.slug}`, `Produit : ${r.name}`, "Mise en scène avec les ingrédients (galerie, éditions éphémères)", "3:2", "3600×2400",
    `Overhead flat lay: one whole ${choc}-coated stuffed Medjool date and one halved piece revealing ${FILLING_EN[r.slug]}, surrounded with restraint by ${INGREDIENTS_EN[r.slug]}, on ${surf}, generous negative space`);
}

const macros = [
  "Extreme macro of the boundary between glossy dark chocolate coating and the wrinkled skin of a Medjool date, black sesame seeds catching the light",
  "Extreme macro of matcha powder dusted over smooth white chocolate, fine yuzu zest curls",
  "Extreme macro cross-section: pistachio cream with golden kadaif threads inside a date, thin milk chocolate shell",
  "Extreme macro of a thin glossy raspberry drizzle over dark chocolate with dried hibiscus fragments",
  "Extreme macro cross-section of hazelnut praline with espresso specks inside a dark-chocolate-coated date",
  "Extreme macro of saffron threads and slivered almonds resting on satin milk chocolate",
];
macros.forEach((m, i) => add(`macro-${i + 1}`, "Textures", "Gros plan de texture (accueil, savoir-faire)", "1:1", "3000×3000", m));

const coffrets = [
  ["coffret-1", "Rigid chocolate-brown gift box of 12 stuffed dates, open, viewed from above, each date in its individual cavity, tissue paper, matching lid beside it with embossed monogram and bronze foil wordmark, a small cream tasting card, ivory background"],
  ["coffret-ferme", "The same 12-piece chocolate-brown box, closed, same framing and position as the open version, thin bronze ribbon, embossed monogram on the lid, bronze foil wordmark, ivory background"],
  ["coffret-2", "Large 24-piece box open from above on a dark chocolate surface, dates of ten different finishes in two-tone rows, lid leaning at an angle, low warm light"],
  ["coffret-3", "Ivory rigid 6-piece box open on pale limestone, lid beside it with tone-on-tone embossing and bronze foil, a few pistachio crumbs"],
  ["coffret-4", "Limited edition box in desaturated olive green with bronze ribbon and a numbered bronze foil label, open with 12 dates of the seasonal collection, dark slate surface"],
];
coffrets.forEach(([id, s]) => add(id, "Coffrets", "Mises en scène des coffrets", "3:2", "3600×2400", s));

const packaging = [
  "Top view of a closed chocolate-brown rigid box lid, blind-embossed date-pit monogram and bronze hot-foil wordmark, fine bronze border, on oatmeal linen",
  "Three stacked rigid boxes (chocolate, ivory, olive green), three-quarter view, bronze foil wordmark on each, soft side light",
  "Cream letterpress tasting card with a small bronze monogram next to a satin bronze ribbon and two stuffed dates on white marble",
];
packaging.forEach((s, i) => add(`packaging-${i + 1}`, "Packaging", "Visuels packaging (coffrets, connexion)", "4:5", "2400×3000", s));

const lifestyle = [
  "Overhead: an espresso in a cream porcelain cup on its saucer beside a small dark plate with three chocolate-coated stuffed dates, coffee beans scattered, limestone table, morning light",
  "A closed gift box tied with a bronze ribbon, a handwritten card, oatmeal linen, soft daylight, nobody in frame",
  "Art of hosting: a large cream ceramic platter with a ring of assorted stuffed dates, two glasses of mint tea, an olive branch, marble table, overhead",
];
lifestyle.forEach((s, i) => add(`lifestyle-${i + 1}`, "Art de vivre", "Lifestyle (accueil, Maison)", "3:2", "3600×2400", s));

const pro = [
  "Corporate gifting: stacks of rigid boxes in chocolate and ivory with bronze foil, a blank card placeholder where a client logo would go, pale limestone, clean studio light",
  "Wedding reception table from above: cream plates, a mini 2-piece box with bronze ribbon at each setting, linen tablecloth, place cards",
];
pro.forEach((s, i) => add(`pro-${i + 1}`, "Professionnels", "Offres entreprises et événements", "3:2", "3600×2400", s));

const layers = ["datte", "garniture", "chocolat", "finition"] as const;
const layerTxt = {
  datte: "a single opened and pitted Medjool date, slit along its length",
  garniture: "a quenelle of pistachio cream with golden kadaif threads shaped to fit inside a date",
  chocolat: "an empty thin milk chocolate shell shaped like a date",
  finition: "only the topping: golden kadaif threads and chopped pistachio, floating",
};
layers.forEach((k) => add(`couche-${k}`, "Vue éclatée", "Couche de l'animation « expérience sensorielle » (fond transparent, même cadrage pour les 4 couches)", "20:11", "4000×2200", `Isolated on a transparent or pure white background for cut-out, ${layerTxt[k]}, same scale, angle and position as the other layers of the series`));

fs.mkdirSync(path.join(root, "docs"), { recursive: true });
fs.writeFileSync(path.join(root, "docs/photo-prompts.json"), JSON.stringify(list, null, 2));

const md = [
  "# Prompts photo TAMBRÉ",
  "",
  `Ce document liste ${list.length} prompts, un par emplacement visuel du site. Chaque emplacement est actuellement occupé par un **visuel concept illustré** (\`public/images/concepts/<id>.webp\`), signalé « Visuel concept » à l'écran.`,
  "",
  "Pour remplacer un concept par une vraie photographie (shooting ou génération d'image validée) :",
  "",
  "1. Produisez l'image au ratio indiqué (la taille donnée est la cible).",
  "2. Téléversez-la dans Admin › Produits (ou Coffrets) sur l'image du même rôle, et décochez « visuel concept » ; ou remplacez le fichier dans `public/images/` en conservant le cadrage.",
  "3. Pour les visuels d'accueil et d'ambiance (hero, lifestyle, pro, coffret-ferme, couches), remplacez le fichier correspondant et mettez à jour `src/data/concepts-manifest.json` si les dimensions changent.",
  "",
  "**Rappel** : n'utilisez jamais de photo de concurrent, et faites valider tout visuel généré par IA avant publication (fidélité à la recette réelle).",
  "",
  `**Négatif commun** : ${NEGATIVE}.`,
  "",
];
let section = "";
for (const e of list) {
  if (e.section !== section) {
    section = e.section;
    md.push(`## ${section}`, "");
  }
  md.push(`### \`${e.id}\``, "", `- Usage : ${e.usage}`, `- Format : ${e.ratio}, ${e.size}`, "", "```text", e.prompt, "```", "");
}
fs.writeFileSync(path.join(root, "docs/PROMPTS-PHOTO.md"), md.join("\n"));
console.log(`${list.length} prompts écrits.`);
