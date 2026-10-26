// Éléments de mise en scène détourés (PNG/WebP transparents) pour les grandes scènes de l'accueil.
//
// - coffret : le coffret Signature ouvert, détouré dans la photographie de référence du pack
//   (contour géométrique relevé à la main : le carton a des arêtes droites). Définition réelle conservée.
// - ingrédients : photos Unsplash sur fond blanc uni (brand/source/stock/), fond retiré par distance
//   à la couleur du fond, bord adouci, recadrées au plus juste.
// - palmeraie : séparation ciel / paysage (ciel bleu uni) pour un effet de profondeur à deux plans.
//
// Aucun élément n'est agrandi : chaque fichier garde au plus la définition de sa source.
// Usage : npm run scene-assets  →  public/images/scene/, src/data/scene-manifest.json
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(root, "public/images/scene");
const MANIFEST = path.join(root, "src/data/scene-manifest.json");

type Pt = [number, number];
interface Asset {
  url: string;
  w: number;
  h: number;
  source: string;
  credit?: string;
}

const manifest: Record<string, Asset> = {};
const published = new Set<string>();
fs.mkdirSync(OUT_DIR, { recursive: true });

async function publish(key: string, rgba: Buffer, source: string, credit?: string, maxSide?: number) {
  let img = sharp(rgba);
  if (maxSide) img = img.resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true });
  const buf = await img.webp({ quality: 90, alphaQuality: 100, effort: 6 }).toBuffer();
  const name = `${key}-${createHash("sha1").update(buf).digest("hex").slice(0, 8)}.webp`;
  fs.writeFileSync(path.join(OUT_DIR, name), buf);
  published.add(name);
  const m = await sharp(buf).metadata();
  manifest[key] = { url: `/images/scene/${name}`, w: m.width!, h: m.height!, source, ...(credit && { credit }) };
  console.log(`${key.padEnd(24)} ${m.width}×${m.height}  ${(buf.length / 1024).toFixed(0)} Ko  public/images/scene/${name}`);
}

/** Détourage par contour : polygone rendu en SVG (anticrénelage), rétréci d'un demi-pixel (pas de liseré du fond). */
async function polygonCutout(file: string, outline: Pt[]) {
  const { width: W, height: H } = await sharp(file).metadata();
  const pts = outline.map((p) => p.join(",")).join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#000"/><polygon points="${pts}" fill="#fff" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
  const mask = await sharp(Buffer.from(svg)).extractChannel(0).raw().toBuffer();
  const rgb = await sharp(file).removeAlpha().raw().toBuffer();
  const rgba = await sharp(rgb, { raw: { width: W!, height: H!, channels: 3 } }).joinChannel(mask, { raw: { width: W!, height: H!, channels: 1 } }).png().toBuffer();
  const xs = outline.map((p) => p[0]);
  const ys = outline.map((p) => p[1]);
  const left = Math.max(0, Math.min(...xs) - 2);
  const top = Math.max(0, Math.min(...ys) - 2);
  return sharp(rgba)
    .extract({ left, top, width: Math.min(W! - left, Math.max(...xs) - left + 3), height: Math.min(H! - top, Math.max(...ys) - top + 3) })
    .png()
    .toBuffer();
}

// --- Coffret Signature ouvert (photographie de référence 1448×1086) ---
const COFFRET_OUTLINE: Pt[] = [
  [567, 41], [1208, 82], [1215, 112], [1207, 180], [1155, 545], [1150, 598], [1147, 690],
  [943, 1057], [840, 1007], [202, 831], [206, 725], [473, 492],
];
await publish(
  "coffret-ouvert",
  await polygonCutout(path.join(root, "brand/source/pack-photos/references/photo-modele-coffret.png"), COFFRET_OUTLINE),
  "Photographie de référence du coffret Signature (pack Maison Tamrān), détourée",
);

/**
 * Séparation ciel / paysage : le ciel bleu uni devient transparent (écart bleu − rouge), le paysage
 * (palmiers, dunes) reste opaque. Transition douce sur quelques niveaux pour garder le détail des palmes.
 * `crop` en fractions de l'image source (même recadrage que la photo d'ambiance publiée).
 */
async function skyCutout(file: string, crop: { left: number; top: number; width: number; height: number }, horizon: number) {
  const meta = await sharp(file).metadata();
  const region = {
    left: Math.round(meta.width! * crop.left),
    top: Math.round(meta.height! * crop.top),
    width: Math.round(meta.width! * crop.width),
    height: Math.round(meta.height! * crop.height),
  };
  const { data, info } = await sharp(file).rotate().extract(region).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const alpha = Buffer.alloc(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const r = data[i * 3], b = data[i * 3 + 2];
      // sous l'horizon, tout est paysage ; au-dessus, le bleu franc est du ciel
      const blue = y > H * horizon ? -99 : b - r;
      alpha[i] = Math.round(255 * Math.min(1, Math.max(0, (34 - blue) / 22)));
    }
  // bord légèrement adouci (pas d'escalier sur les palmes)
  const soft = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } }).blur(0.6).extractChannel(0).raw().toBuffer();
  return sharp(data, { raw: { width: W, height: H, channels: 3 } }).joinChannel(soft, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
}

// --- Palmeraie (même cadrage que la photo d'ambiance : déchets du premier plan exclus) ---
const PALMERAIE = path.join(root, "brand/source/stock/palmeraie__v9MYNk3HMeM.jpg");
if (fs.existsSync(PALMERAIE)) {
  await publish(
    "oasis-paysage",
    await skyCutout(PALMERAIE, { left: 0.166, top: 0.06, width: 0.834, height: 0.565 }, 0.86),
    "Photo Halima Bouchouicha / Unsplash (palmeraie), ciel retiré",
    "Photo Halima Bouchouicha / Unsplash",
    3840,
  );
}

/**
 * Ingrédients photographiés sur fond blanc : chaque pièce devient un élément transparent.
 * - est « ingrédient » ce qui est coloré et chaud (rouge > bleu : tous nos ingrédients le sont) sans être trop clair,
 *   ou ce qui est sombre ; les ombres portées (grises, bleutées ou très claires) restent du fond ;
 * - les trous sont comblés (reflets clairs au cœur d'une pièce), puis chaque pièce est isolée (composantes connexes) ;
 * - les pièces coupées par le cadre et les miettes sont écartées ; le bord est resserré d'un pixel (pas de liseré blanc).
 * Rend les pièces isolées (les plus grandes d'abord) et, s'il existe, le tas principal.
 */
async function whiteCutouts(file: string, opts: { chroma: number; dark: number; light: number; warm: number; work: number; singles: number }) {
  const base = await sharp(file).rotate().resize({ width: opts.work, height: opts.work, fit: "inside", withoutEnlargement: true }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data } = base;
  const W = base.info.width, H = base.info.height, N = W * H;
  // 1. masque brut
  const raw = Buffer.alloc(N);
  for (let i = 0; i < N; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const c = Math.max(r, g, b) - Math.min(r, g, b);
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    raw[i] = (c > opts.chroma && r - b > opts.warm && l < opts.light) || l < opts.dark ? 255 : 0;
  }
  // 2. nettoyage (fermeture légère) puis trous comblés : est fond ce qui est relié au bord
  const closed = await sharp(raw, { raw: { width: W, height: H, channels: 1 } }).blur(1.2).threshold(128).extractChannel(0).raw().toBuffer();
  const bg = new Uint8Array(N);
  const stack: number[] = [];
  for (let x = 0; x < W; x++) for (const y of [0, H - 1]) if (!closed[y * W + x]) { bg[y * W + x] = 1; stack.push(y * W + x); }
  for (let y = 0; y < H; y++) for (const x of [0, W - 1]) if (!closed[y * W + x] && !bg[y * W + x]) { bg[y * W + x] = 1; stack.push(y * W + x); }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % W;
    for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W]) {
      if (j < 0 || j >= N || bg[j] || closed[j]) continue;
      bg[j] = 1;
      stack.push(j);
    }
  }
  // 3. composantes connexes
  const label = new Int32Array(N).fill(-1);
  const comps: { area: number; x0: number; y0: number; x1: number; y1: number; edge: boolean }[] = [];
  for (let s = 0; s < N; s++) {
    if (bg[s] || label[s] >= 0) continue;
    const id = comps.length;
    const c = { area: 0, x0: W, y0: H, x1: 0, y1: 0, edge: false };
    label[s] = id;
    stack.push(s);
    while (stack.length) {
      const i = stack.pop()!;
      const x = i % W, y = (i - x) / W;
      c.area++;
      if (x < c.x0) c.x0 = x;
      if (x > c.x1) c.x1 = x;
      if (y < c.y0) c.y0 = y;
      if (y > c.y1) c.y1 = y;
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) c.edge = true;
      for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W]) {
        if (j < 0 || j >= N || bg[j] || label[j] >= 0) continue;
        label[j] = id;
        stack.push(j);
      }
    }
    comps.push(c);
  }
  const usable = comps.map((c, id) => ({ ...c, id })).filter((c) => !c.edge && c.area > N * 0.0015);
  if (!usable.length) return [];
  const areas = usable.map((c) => c.area).sort((a, b) => a - b);
  const median = areas[Math.floor(areas.length / 2)];
  const singles = usable.filter((c) => c.area < median * 1.9 && c.area > median * 0.45).sort((a, b) => b.area - a.area).slice(0, opts.singles);
  const pile = usable.filter((c) => c.area > median * 4).sort((a, b) => b.area - a.area)[0];
  // 4. alpha par pièce : bord resserré d'un pixel puis adouci
  const out: { kind: "piece" | "tas"; buf: Buffer }[] = [];
  for (const [kind, c] of [...singles.map((c) => ["piece", c] as const), ...(pile ? [["tas", pile] as const] : [])]) {
    const m = 6;
    const box = { left: Math.max(0, c.x0 - m), top: Math.max(0, c.y0 - m), width: Math.min(W, c.x1 + m + 1) - Math.max(0, c.x0 - m), height: Math.min(H, c.y1 + m + 1) - Math.max(0, c.y0 - m) };
    const a = Buffer.alloc(box.width * box.height);
    for (let y = 0; y < box.height; y++)
      for (let x = 0; x < box.width; x++) a[y * box.width + x] = label[(y + box.top) * W + x + box.left] === c.id ? 255 : 0;
    const alpha = await sharp(a, { raw: { width: box.width, height: box.height, channels: 1 } }).blur(1.4).threshold(218).blur(0.7).extractChannel(0).raw().toBuffer();
    const rgb = await sharp(data, { raw: { width: W, height: H, channels: 3 } }).extract(box).raw().toBuffer();
    // liseré : dans une bande de ~3 px le long du bord, un pixel nettement plus clair que l'ingrédient devient
    // transparent (halo d'accentuation de la photo source) ; l'intérieur et ses reflets sont conservés
    const inner = await sharp(a, { raw: { width: box.width, height: box.height, channels: 1 } }).blur(2.6).threshold(250).extractChannel(0).raw().toBuffer();
    for (let k = 0; k < alpha.length; k++) {
      if (!alpha[k] || inner[k]) continue;
      const l = 0.299 * rgb[k * 3] + 0.587 * rgb[k * 3 + 1] + 0.114 * rgb[k * 3 + 2];
      if (l > opts.light + 8) alpha[k] = 0;
    }
    out.push({ kind, buf: await sharp(rgb, { raw: { width: box.width, height: box.height, channels: 3 } }).joinChannel(alpha, { raw: { width: box.width, height: box.height, channels: 1 } }).png().toBuffer() });
  }
  return out;
}

const STOCK = path.join(root, "brand/source/stock");
const INGREDIENTS: { key: string; file: string; credit: string; chroma?: number; dark?: number; light?: number; warm?: number; singles?: number }[] = [
  { key: "pistache", file: "detourage-pistache__hHMF-zPm0jo.jpg", credit: "Photo Tamanna Rumee / Unsplash", chroma: 24, light: 248, warm: 32 },
  { key: "noisette", file: "detourage-noisette__nuaxGRQ9elM.jpg", credit: "Photo Mockup Graphics / Unsplash", light: 200 },
  { key: "amande", file: "detourage-amande__hw8vOPAIZgk.jpg", credit: "Photo Mockup Graphics / Unsplash", light: 205 },
  { key: "chocolat", file: "detourage-chocolat__aZkQgBfnFL0.jpg", credit: "Photo Amy Vann / Unsplash", chroma: 26, dark: 110, light: 140 },
  { key: "framboise", file: "detourage-framboise__TvPoJ6GWNmc.jpg", credit: "Photo Mockup Graphics / Unsplash", chroma: 34, light: 200 },
  { key: "cafe", file: "detourage-cafe__m7ijvnNGaV0.jpg", credit: "Photo Mockup Graphics / Unsplash", dark: 100, light: 128 },
];
for (const ing of INGREDIENTS) {
  const file = path.join(STOCK, ing.file);
  if (!fs.existsSync(file)) {
    console.log(`source absente (npm run stock la retélécharge) : ${ing.file}`);
    continue;
  }
  const pieces = await whiteCutouts(file, { chroma: ing.chroma ?? 22, dark: ing.dark ?? 120, light: ing.light ?? 236, warm: ing.warm ?? 14, work: 2600, singles: ing.singles ?? 5 });
  let n = 0;
  for (const p of pieces) {
    const key = p.kind === "tas" ? `ing-${ing.key}-tas` : `ing-${ing.key}-${++n}`;
    await publish(key, p.buf, `${ing.credit}, fond retiré`, ing.credit, 900);
  }
}

// --- Palme de premier plan (ciel uni retiré) ---
const PALME = path.join(STOCK, "palme-premier-plan__gH2lS064NT4.jpg");
if (fs.existsSync(PALME)) {
  const cut = await skyCutout(PALME, { left: 0, top: 0, width: 1, height: 1 }, 1.01);
  await publish("oasis-palme", await sharp(cut).trim({ threshold: 1 }).png().toBuffer(), "Photo kz mozaffari / Unsplash (couronne de dattier), ciel retiré", "Photo kz mozaffari / Unsplash", 2600);
}

for (const f of fs.readdirSync(OUT_DIR)) if (f.endsWith(".webp") && !published.has(f)) fs.unlinkSync(path.join(OUT_DIR, f));
fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${Object.keys(manifest).length} éléments → src/data/scene-manifest.json`);
