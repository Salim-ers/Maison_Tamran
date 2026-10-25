// Compositions des visuels concept, un par emplacement du site.
import { RECIPES, type Recipe } from "../../src/data/recipes";
import {
  dateLayer, Scene, surface, vignette, lightSweep, wholeDate, cutDate, scatter, bowl, citrusHalf, berry, nut, leaf,
  openBox, lid, box3d, coffeeCup, plate, card, ribbonCurve, glass, isDark, shade, rng,
} from "./engine";

export interface Slot {
  id: string; // nom de fichier
  group: "hero" | "produit" | "coupe" | "scene" | "macro" | "coffret" | "packaging" | "lifestyle" | "pro";
  w: number;
  h: number;
  alt: string;
  build: () => string;
  transparent?: boolean;
}

const bySlug = (s: string) => RECIPES.find((r) => r.slug === s)!;

// ---------- produit : datte entière ----------
function productMain(rec: Recipe) {
  const sc = new Scene(1600, 2000, rec.number * 11);
  surface(sc, rec.palette.surface);
  lightSweep(sc, isDark(rec.palette.surface) ? 0.12 : 0.22);
  sc.add(scatter(sc, rec, { x: 120, y: 1450, w: 700, h: 380 }, 26, rec.number * 5, 3.2));
  sc.add(scatter(sc, rec, { x: 980, y: 260, w: 480, h: 300 }, 12, rec.number * 9, 3));
  sc.add(wholeDate(sc, rec, { x: 1230, y: 470, s: 3.0, rot: 18, blur: 7 }, 2));
  sc.add(wholeDate(sc, rec, { x: 800, y: 1080, s: 5.6, rot: -28 }, 1));
  vignette(sc, isDark(rec.palette.surface) ? 0.5 : 0.22);
  return sc.svg();
}

// ---------- produit : coupe (même cadrage → transition au survol) ----------
function productCut(rec: Recipe) {
  const sc = new Scene(1600, 2000, rec.number * 11);
  surface(sc, rec.palette.surface);
  lightSweep(sc, isDark(rec.palette.surface) ? 0.12 : 0.22);
  sc.add(scatter(sc, rec, { x: 120, y: 1450, w: 700, h: 380 }, 26, rec.number * 5, 3.2));
  sc.add(scatter(sc, rec, { x: 980, y: 260, w: 480, h: 300 }, 12, rec.number * 9, 3));
  sc.add(wholeDate(sc, rec, { x: 1230, y: 470, s: 3.0, rot: 18, blur: 7 }, 2));
  sc.add(cutDate(sc, rec, { x: 980, y: 860, s: 3.5, rot: -24 + 180 }, 2, true));
  sc.add(cutDate(sc, rec, { x: 640, y: 1290, s: 3.7, rot: -30 }, 1));
  vignette(sc, isDark(rec.palette.surface) ? 0.5 : 0.22);
  return sc.svg();
}

// ---------- produit : mise en scène avec ingrédients ----------
function ingredientProps(sc: Scene, rec: Recipe, seed: number) {
  const r = rng(seed);
  const out: string[] = [];
  const spots = [
    { x: 420, y: 380, R: 190 },
    { x: 1960, y: 1240, R: 170 },
    { x: 2020, y: 360, R: 150 },
  ];
  rec.ingredients.forEach((ing, i) => {
    const s = spots[i % spots.length];
    switch (ing) {
      case "sesame": out.push(bowl(sc, s.x, s.y, s.R, { color: "#1C1919", type: "graines", accent: "#3A3534" }, seed + i)); break;
      case "yuzu": out.push(citrusHalf(sc, s.x, s.y, s.R * 0.8, seed + i), citrusHalf(sc, s.x + s.R * 1.1, s.y + s.R * 0.6, s.R * 0.55, seed + i + 1)); break;
      case "safran": out.push(bowl(sc, s.x, s.y, s.R * 0.7, { color: "#C4361C", type: "fils", accent: "#E8822A" }, seed + i)); break;
      case "amande": for (let k = 0; k < 9; k++) out.push(nut(sc, "amande", s.x + (r() - 0.5) * s.R * 2, s.y + (r() - 0.5) * s.R * 1.6, 4.2, r() * 360, seed + k)); break;
      case "abricot": for (let k = 0; k < 4; k++) out.push(nut(sc, "abricot", s.x + (r() - 0.5) * s.R * 1.8, s.y + (r() - 0.5) * s.R * 1.4, 5.5, r() * 360, seed + k)); break;
      case "matcha": out.push(bowl(sc, s.x, s.y, s.R, { color: "#7E9C3A", type: "poudre" }, seed + i, "#2B2826")); break;
      case "fleur-oranger": for (let k = 0; k < 6; k++) { const x = s.x + (r() - 0.5) * s.R * 2, y = s.y + (r() - 0.5) * s.R * 1.5; for (let p = 0; p < 5; p++) out.push(leaf(sc, x, y, 34, 12, p * 72 + r() * 10, "#FBF7EE", seed + k * 7 + p, false)); out.push(`<circle cx="${x}" cy="${y}" r="7" fill="#E8C24A"/>`); } break;
      case "pistache": out.push(bowl(sc, s.x, s.y, s.R, { color: "#7FA03A", type: "graines", accent: "#A8BE5A" }, seed + i)); for (let k = 0; k < 5; k++) out.push(nut(sc, "pistache", s.x + s.R * 1.2 + r() * 120, s.y + (r() - 0.5) * s.R, 4.5, r() * 360, seed + k)); break;
      case "kadaif": out.push(bowl(sc, s.x, s.y, s.R, { color: "#D9A54A", type: "fils", accent: "#F2D08A" }, seed + i, "#E9E2D6")); break;
      case "cafe": for (let k = 0; k < 18; k++) out.push(nut(sc, "cafe", s.x + (r() - 0.5) * s.R * 2.2, s.y + (r() - 0.5) * s.R * 1.6, 4.4, r() * 360, seed + k)); break;
      case "cardamome": for (let k = 0; k < 10; k++) out.push(nut(sc, "cardamome", s.x + (r() - 0.5) * s.R * 1.8, s.y + (r() - 0.5) * s.R * 1.4, 4.6, r() * 360, seed + k)); break;
      case "noisette": for (let k = 0; k < 10; k++) out.push(nut(sc, "noisette", s.x + (r() - 0.5) * s.R * 2, s.y + (r() - 0.5) * s.R * 1.5, 4, r() * 360, seed + k)); break;
      case "framboise": for (let k = 0; k < 7; k++) out.push(berry(sc, s.x + (r() - 0.5) * s.R * 2, s.y + (r() - 0.5) * s.R * 1.4, 46, seed + k)); break;
      case "hibiscus": out.push(bowl(sc, s.x, s.y, s.R * 0.85, { color: "#7E1028", type: "graines", accent: "#A3203F" }, seed + i)); break;
      case "sarrasin": out.push(bowl(sc, s.x, s.y, s.R, { color: "#9C6B3C", type: "graines", accent: "#7A4E26" }, seed + i)); break;
      case "caramel": out.push(bowl(sc, s.x, s.y, s.R * 0.8, { color: "#B06A28", type: "liquide" }, seed + i)); break;
      case "miso": out.push(bowl(sc, s.x, s.y, s.R * 0.7, { color: "#D9B677", type: "pate" }, seed + i, "#3A3431")); break;
      case "pandan": for (let k = 0; k < 4; k++) out.push(leaf(sc, s.x - 260 + k * 40, s.y - 60 + k * 50, 620, 34, -12 + k * 6, "#4F8A35", seed + k)); break;
      case "coco": out.push(bowl(sc, s.x, s.y, s.R, { color: "#F4EBDC", type: "fils", accent: "#B9824A" }, seed + i, "#6B4A33")); break;
      case "pecan": for (let k = 0; k < 9; k++) out.push(nut(sc, "pecan", s.x + (r() - 0.5) * s.R * 2, s.y + (r() - 0.5) * s.R * 1.5, 4, r() * 360, seed + k)); break;
      case "erable": out.push(bowl(sc, s.x, s.y, s.R * 0.8, { color: "#B5671E", type: "liquide" }, seed + i, "#F2EEE7")); break;
      case "sel-fume": out.push(bowl(sc, s.x, s.y, s.R * 0.6, { color: "#E9E3DA", type: "graines", accent: "#8A7F72" }, seed + i, "#2C2725")); break;
      case "rose": for (let k = 0; k < 14; k++) out.push(leaf(sc, s.x + (r() - 0.5) * s.R * 2, s.y + (r() - 0.5) * s.R * 1.5, 70, 26, r() * 360, k % 2 ? "#D9667E" : "#B8445E", seed + k, false)); break;
      case "litchi": for (let k = 0; k < 4; k++) out.push(nut(sc, "litchi", s.x + (r() - 0.5) * s.R * 1.8, s.y + (r() - 0.5) * s.R * 1.3, 5, r() * 360, seed + k)); break;
      case "chocolat": for (let k = 0; k < 6; k++) { const x = s.x + (r() - 0.5) * s.R * 2, y = s.y + (r() - 0.5) * s.R * 1.4; out.push(`<g transform="translate(${x} ${y}) rotate(${r() * 360})"><rect x="-38" y="-26" width="76" height="52" rx="3" fill="${rec.palette.coat}"/><rect x="-38" y="-26" width="76" height="10" rx="3" fill="${rec.palette.coatLight}" opacity=".6"/></g>`); } break;
    }
  });
  return out.join("");
}

function productScene(rec: Recipe) {
  const sc = new Scene(2400, 1600, rec.number * 17);
  surface(sc, rec.palette.surface, { x: 0.35, y: 0.25 });
  lightSweep(sc, isDark(rec.palette.surface) ? 0.1 : 0.2);
  sc.add(ingredientProps(sc, rec, rec.number * 101));
  sc.add(scatter(sc, rec, { x: 700, y: 1100, w: 900, h: 400 }, 30, rec.number * 3, 3.4));
  sc.add(cutDate(sc, rec, { x: 1420, y: 520, s: 3.2, rot: 22 }, 3));
  sc.add(wholeDate(sc, rec, { x: 1060, y: 900, s: 4.4, rot: -14 }, 4));
  vignette(sc, isDark(rec.palette.surface) ? 0.5 : 0.2);
  return sc.svg();
}

// ---------- macros ----------
function macro(kind: number) {
  const sc = new Scene(1600, 1600, 900 + kind);
  const recs = ["eclipse-noire", "minuit-a-kyoto", "or-de-marrakech", "rouge-desir", "cafe-imperial", "velours-persan"].map(bySlug);
  const rec = recs[kind];
  surface(sc, rec.palette.surface);
  if (kind === 0) sc.add(wholeDate(sc, rec, { x: 420, y: 820, s: 8, rot: -10 }, 9));
  if (kind === 1) sc.add(wholeDate(sc, rec, { x: 980, y: 900, s: 7.6, rot: 6 }, 3));
  if (kind === 2) sc.add(cutDate(sc, rec, { x: 820, y: 800, s: 7.2, rot: -6 }, 5));
  if (kind === 3) sc.add(wholeDate(sc, rec, { x: 980, y: 860, s: 7.6, rot: -16 }, 7));
  if (kind === 4) sc.add(cutDate(sc, rec, { x: 780, y: 800, s: 7, rot: 12 }, 4));
  if (kind === 5) sc.add(wholeDate(sc, rec, { x: 900, y: 860, s: 7.4, rot: -8 }, 2));
  sc.add(scatter(sc, rec, { x: 80, y: 1260, w: 1440, h: 300 }, 26, 40 + kind, 5));
  vignette(sc, 0.35);
  return sc.svg();
}

// ---------- coffrets (mises en scène) ----------
const SIG = RECIPES.filter((r) => r.collection === "signature");
const EPH = RECIPES.filter((r) => r.collection === "ephemere");

function coffretScene(kind: number) {
  const sc = new Scene(2400, 1600, 700 + kind);
  if (kind === 0) {
    surface(sc, "ivoire");
    lightSweep(sc, 0.22);
    const b = openBox(sc, { x: 1250, y: 820, cols: 4, rows: 3, cell: 300, rot: -6, recipes: SIG, tissue: true, seed: 5 });
    sc.add(lid(sc, 330, 420, 760, 560, 14, { ribbon: null }));
    sc.add(b.svg);
    sc.add(card(sc, 2050, 1260, 380, 540, 10));
  } else if (kind === 1) {
    surface(sc, "chocolat");
    lightSweep(sc, 0.14);
    sc.add(lid(sc, 1900, 600, 820, 900, -78, { foil: "#C4936C" }));
    const b = openBox(sc, { x: 1040, y: 820, cols: 6, rows: 4, cell: 240, rot: 4, recipes: [...SIG, ...EPH], seed: 9 });
    sc.add(b.svg);
    vignette(sc, 0.45);
  } else if (kind === 2) {
    surface(sc, "pierre");
    lightSweep(sc, 0.2);
    sc.add(lid(sc, 640, 760, 640, 520, -8, { color: "#F3EDE3", foil: "#A87455" }));
    const b = openBox(sc, { x: 1600, y: 800, cols: 3, rows: 2, cell: 300, rot: 6, recipes: SIG.slice(0, 6), color: "#F3EDE3", seed: 2 });
    sc.add(b.svg);
    sc.add(scatter(sc, SIG[3], { x: 300, y: 1250, w: 600, h: 250 }, 20, 4, 3.4));
  } else {
    surface(sc, "ardoise");
    lightSweep(sc, 0.1);
    sc.add(lid(sc, 820, 760, 900, 640, -10, { color: "#3E4434", foil: "#C4936C", ribbon: "#A87455", numbered: "01" }));
    const b = openBox(sc, { x: 1760, y: 880, cols: 3, rows: 4, cell: 230, rot: 8, recipes: EPH, color: "#3E4434", seed: 6 });
    sc.add(b.svg);
    vignette(sc, 0.45);
  }
  return sc.svg();
}

// coffret Signature fermé, même cadrage que coffret-1 (ouvert) pour la transition d'ouverture
function coffretClosed() {
  const sc = new Scene(2400, 1600, 700);
  surface(sc, "ivoire");
  lightSweep(sc, 0.22);
  sc.add(lid(sc, 1250, 820, 1412, 770, -6, { foil: "#C4936C", ribbon: "#A87455" }));
  sc.add(card(sc, 2050, 1260, 380, 540, 10));
  return sc.svg();
}

// ---------- packaging (portraits) ----------
function packaging(kind: number) {
  const sc = new Scene(1600, 2000, 600 + kind);
  if (kind === 0) {
    surface(sc, "lin");
    lightSweep(sc, 0.25);
    sc.add(lid(sc, 800, 980, 1120, 1300, 0, { foil: "#C4936C" }));
  } else if (kind === 1) {
    surface(sc, "ivoire", { x: 0.3, y: 0.15 });
    lightSweep(sc, 0.2);
    sc.add(box3d(sc, 260, 1300, 900, 700, 260, { color: "#2A1E1A", foil: "#C4936C" }));
    sc.add(box3d(sc, 330, 1020, 760, 600, 220, { color: "#EFE7DC", foil: "#A87455" }));
    sc.add(box3d(sc, 400, 790, 600, 480, 190, { color: "#3E4434", foil: "#C4936C", ribbon: "#A87455" }));
  } else {
    surface(sc, "marbre");
    lightSweep(sc, 0.2);
    sc.add(card(sc, 700, 900, 760, 1060, -6, { lines: 9 }));
    sc.add(ribbonCurve(sc, "M120 1700 C500 1500 900 1900 1500 1600", "#A87455", 26));
    sc.add(wholeDate(sc, SIG[0], { x: 1200, y: 1360, s: 2.6, rot: -30 }, 2));
    sc.add(wholeDate(sc, SIG[2], { x: 1320, y: 1180, s: 2.6, rot: -24 }, 3));
  }
  vignette(sc, 0.2);
  return sc.svg();
}

// ---------- lifestyle ----------
function lifestyle(kind: number) {
  const sc = new Scene(2400, 1600, 500 + kind);
  if (kind === 0) {
    // le café
    surface(sc, "pierre", { x: 0.2, y: 0.2 });
    lightSweep(sc, 0.22);
    sc.add(coffeeCup(sc, 780, 760, 230, 4));
    sc.add(plate(sc, 1560, 860, 360, "#2C2724"));
    sc.add(wholeDate(sc, bySlug("cafe-imperial"), { x: 1460, y: 800, s: 2.2, rot: -20 }, 1));
    sc.add(cutDate(sc, bySlug("cafe-imperial"), { x: 1690, y: 980, s: 1.9, rot: -20 }, 1));
    sc.add(wholeDate(sc, bySlug("eclipse-noire"), { x: 1580, y: 620, s: 2.2, rot: -20 }, 2));
    sc.add(scatter(sc, bySlug("cafe-imperial"), { x: 300, y: 1150, w: 900, h: 350 }, 16, 3, 4));
  } else if (kind === 1) {
    // le cadeau
    surface(sc, "lin", { x: 0.3, y: 0.2 });
    lightSweep(sc, 0.22);
    sc.add(lid(sc, 1060, 800, 1000, 760, -8, { ribbon: "#A87455", foil: "#C4936C" }));
    sc.add(ribbonCurve(sc, "M1500 520 C1800 380 2050 700 2250 520", "#A87455", 30));
    sc.add(card(sc, 1960, 1180, 420, 300, 12, { lines: 4 }));
    sc.add(card(sc, 360, 1240, 360, 480, -14, { lines: 6 }));
  } else {
    // l'art de recevoir
    surface(sc, "marbre", { x: 0.3, y: 0.25 });
    lightSweep(sc, 0.18);
    sc.add(plate(sc, 1080, 820, 520, "#F6F1E8"));
    const recs = SIG;
    recs.forEach((rec, i) => {
      const a = (i / recs.length) * Math.PI * 2 - Math.PI / 2;
      sc.add(wholeDate(sc, rec, { x: 1080 + Math.cos(a) * 300, y: 820 + Math.sin(a) * 300, s: 1.6, rot: (a * 180) / Math.PI + 90 }, i + 1));
    });
    sc.add(cutDate(sc, bySlug("or-de-marrakech"), { x: 1080, y: 820, s: 1.7, rot: 30 }, 2));
    sc.add(glass(sc, 1880, 460, 140, "#C98A3E"));
    sc.add(glass(sc, 1980, 1120, 120, "#E9E2D2"));
    sc.add(leaf(sc, 260, 1220, 520, 70, -28, "#8A9A5B", 2));
  }
  vignette(sc, 0.22);
  return sc.svg();
}

// ---------- professionnels ----------
function pro(kind: number) {
  const sc = new Scene(2400, 1600, 400 + kind);
  if (kind === 0) {
    // cadeaux d'entreprise : piles de coffrets + carte « votre logo »
    surface(sc, "pierre", { x: 0.25, y: 0.2 });
    lightSweep(sc, 0.2);
    for (let i = 0; i < 3; i++) sc.add(box3d(sc, 300 + i * 40, 1180 - i * 190, 760, 560, 180, { color: i % 2 ? "#EFE7DC" : "#2A1E1A", foil: "#C4936C", ribbon: i === 2 ? "#A87455" : null }));
    for (let i = 0; i < 2; i++) sc.add(box3d(sc, 1240 + i * 30, 1260 - i * 190, 700, 520, 180, { color: i % 2 ? "#2A1E1A" : "#EFE7DC", foil: "#A87455" }));
    sc.add(card(sc, 2040, 1260, 420, 300, -8, { lines: 3, mono: false }));
    sc.add(`<g transform="translate(2040 1210) rotate(-8)"><rect x="-90" y="-40" width="180" height="80" rx="6" fill="none" stroke="#7A6152" stroke-width="3" stroke-dasharray="10 8" opacity=".6"/></g>`);
  } else {
    // événements : table dressée, mini-coffrets à chaque couvert
    surface(sc, "lin", { x: 0.4, y: 0.15 });
    lightSweep(sc, 0.2);
    for (let i = 0; i < 3; i++) {
      const x = 420 + i * 780;
      sc.add(plate(sc, x, 560, 260, "#F8F4EC"));
      sc.add(plate(sc, x, 560, 170, "#F2ECE1", false));
      sc.add(lid(sc, x, 1180, 300, 220, (i - 1) * 4, { ribbon: "#A87455" }));
      sc.add(card(sc, x + 190, 760, 120, 160, 8, { lines: 2 }));
      sc.add(glass(sc, x + 250, 300, 70, "#EDE6D8"));
    }
    sc.add(ribbonCurve(sc, "M0 1460 C700 1380 1600 1540 2400 1420", "#C7B9A8", 18));
  }
  vignette(sc, 0.2);
  return sc.svg();
}

// ---------- hero ----------
function hero() {
  const sc = new Scene(3200, 1800, 77);
  surface(sc, "chocolat", { x: 0.7, y: 0.3 });
  // halo lumineux derrière le produit
  sc.def(`<radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#E9B98A" stop-opacity=".32"/><stop offset=".6" stop-color="#A87455" stop-opacity=".08"/><stop offset="1" stop-color="#A87455" stop-opacity="0"/></radialGradient>`);
  sc.add(`<ellipse cx="2150" cy="860" rx="1150" ry="820" fill="url(#halo)"/>`);
  const ecl = bySlug("eclipse-noire");
  const orm = bySlug("or-de-marrakech");
  sc.add(lid(sc, 2620, 560, 980, 720, 12, { foil: "#C4936C" }));
  sc.add(scatter(sc, orm, { x: 1500, y: 1250, w: 1300, h: 400 }, 30, 8, 4.2));
  sc.add(wholeDate(sc, ecl, { x: 1640, y: 640, s: 3.2, rot: 24, blur: 5 }, 3));
  sc.add(cutDate(sc, orm, { x: 2000, y: 1060, s: 5.4, rot: -16 }, 1));
  sc.add(cutDate(sc, orm, { x: 2560, y: 1230, s: 5.4, rot: -16 + 180 }, 2, true));
  vignette(sc, 0.55);
  return sc.svg();
}

function layer(kind: "datte" | "garniture" | "chocolat" | "finition") {
  const sc = new Scene(2000, 1100, 31);
  sc.add(dateLayer(sc, bySlug("or-de-marrakech"), { x: 1000, y: 560, s: 8.2, rot: -6 }, kind, 3));
  return sc.svg();
}

export function slots(): Slot[] {
  const list: Slot[] = [{ id: "hero", group: "hero", w: 3200, h: 1800, alt: "Datte Or de Marrakech ouverte révélant sa crème de pistache, devant un coffret TAMBRÉ", build: hero }];
  for (const rec of RECIPES) {
    list.push({ id: `produit-${rec.slug}`, group: "produit", w: 1600, h: 2000, alt: `${rec.name} : datte enrobée de ${rec.chocolate === "noir" ? "chocolat noir" : `chocolat ${rec.chocolate}`}`, build: () => productMain(rec) });
    list.push({ id: `coupe-${rec.slug}`, group: "coupe", w: 1600, h: 2000, alt: `${rec.name} en coupe : la garniture au cœur de la datte`, build: () => productCut(rec) });
    list.push({ id: `scene-${rec.slug}`, group: "scene", w: 2400, h: 1600, alt: `${rec.name} entourée de ses ingrédients`, build: () => productScene(rec) });
  }
  const macroAlts = ["Peau de la Medjool et enrobage, en très gros plan", "Poudre de matcha sur chocolat blanc", "Coupe : crème de pistache et fils de kadaïf", "Filet de framboise sur chocolat noir", "Coupe : praliné noisette et espresso", "Fils de safran et amande sur chocolat au lait"];
  for (let i = 0; i < 6; i++) list.push({ id: `macro-${i + 1}`, group: "macro", w: 1600, h: 1600, alt: macroAlts[i], build: () => macro(i) });
  const coffretAlts = ["Coffret Signature ouvert, douze dattes dans leurs calages", "Coffret Prestige de vingt-quatre pièces", "Coffret Découverte ivoire, six pièces", "Coffret Édition Limitée numéroté"];
  for (let i = 0; i < 4; i++) list.push({ id: `coffret-${i + 1}`, group: "coffret", w: 2400, h: 1600, alt: coffretAlts[i], build: () => coffretScene(i) });
  list.push({ id: "coffret-ferme", group: "coffret", w: 2400, h: 1600, alt: "Coffret Signature fermé, monogramme en relief et ruban bronze", build: coffretClosed });
  const packAlts = ["Couvercle chocolat, monogramme en relief et logotype bronze", "Trois coffrets empilés : chocolat, ivoire et vert", "Carte de dégustation et ruban bronze"];
  for (let i = 0; i < 3; i++) list.push({ id: `packaging-${i + 1}`, group: "packaging", w: 1600, h: 2000, alt: packAlts[i], build: () => packaging(i) });
  const lifeAlts = ["Un espresso et quelques dattes Café Impérial", "Un coffret prêt à offrir, ruban et carte", "Plat de dattes à partager au centre de la table"];
  for (let i = 0; i < 3; i++) list.push({ id: `lifestyle-${i + 1}`, group: "lifestyle", w: 2400, h: 1600, alt: lifeAlts[i], build: () => lifestyle(i) });
  const proAlts = ["Coffrets empilés pour un cadeau d'entreprise, carte personnalisable", "Table de réception avec un mini-coffret à chaque couvert"];
  for (let i = 0; i < 2; i++) list.push({ id: `pro-${i + 1}`, group: "pro", w: 2400, h: 1600, alt: proAlts[i], build: () => pro(i) });
  const layerAlts: Record<string, string> = { datte: "La datte Medjool, ouverte", garniture: "La garniture : crème de pistache et kadaïf", chocolat: "La coque de chocolat", finition: "La finition : kadaïf doré et éclats de pistache" };
  for (const k of ["datte", "garniture", "chocolat", "finition"] as const) list.push({ id: `couche-${k}`, group: "macro", w: 2000, h: 1100, alt: layerAlts[k], build: () => layer(k), transparent: true } as Slot);
  return list;
}
