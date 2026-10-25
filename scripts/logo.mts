// Déclinaisons du logo officiel MAISON TAMRĀN à partir du fichier fourni (brand/source/maison-tamran-logo-original.png).
// Aucun redessin : le fond papier est retiré (« couleur vers alpha » sur le fond local), puis le dessin est recadré.
// Usage : npm run logo
import fs from "node:fs";
import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(root, "brand/source/maison-tamran-logo-original.png");
const OUT = path.join(root, "public/brand");

const { data, info } = await sharp(SOURCE).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;

// 1. Fond papier local : pour chaque bloc, la teinte la plus claire (le papier), lissée sur le voisinage.
const B = 48;
const bw = Math.ceil(W / B);
const bh = Math.ceil(H / B);
const block: number[][] = [];
for (let by = 0; by < bh; by++) {
  for (let bx = 0; bx < bw; bx++) {
    const px: [number, number, number, number][] = [];
    for (let y = by * B; y < Math.min(H, (by + 1) * B); y += 2)
      for (let x = bx * B; x < Math.min(W, (bx + 1) * B); x += 2) {
        const i = (y * W + x) * 3;
        px.push([data[i] + data[i + 1] + data[i + 2], data[i], data[i + 1], data[i + 2]]);
      }
    px.sort((a, b) => b[0] - a[0]);
    const top = px.slice(0, Math.max(1, Math.floor(px.length * 0.08)));
    block.push([0, 1, 2].map((c) => top.reduce((s, p) => s + p[c + 1], 0) / top.length));
  }
}
// un bloc entièrement couvert par le dessin prend le plus clair de ses voisins
const smooth = block.map((_, k) => {
  const bx = k % bw;
  const by = Math.floor(k / bw);
  let best = block[k];
  for (let dy = -2; dy <= 2; dy++)
    for (let dx = -2; dx <= 2; dx++) {
      const x = bx + dx;
      const y = by + dy;
      if (x < 0 || y < 0 || x >= bw || y >= bh) continue;
      const v = block[y * bw + x];
      if (v[0] + v[1] + v[2] > best[0] + best[1] + best[2]) best = v;
    }
  return best;
});
function bg(x: number, y: number) {
  const fx = Math.min(bw - 1.001, Math.max(0, x / B - 0.5));
  const fy = Math.min(bh - 1.001, Math.max(0, y / B - 0.5));
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = fx - x0;
  const ty = fy - y0;
  const g = (xx: number, yy: number) => smooth[yy * bw + xx];
  return [0, 1, 2].map(
    (c) => g(x0, y0)[c] * (1 - tx) * (1 - ty) + g(x0 + 1, y0)[c] * tx * (1 - ty) + g(x0, y0 + 1)[c] * (1 - tx) * ty + g(x0 + 1, y0 + 1)[c] * tx * ty
  );
}

// 2. Couleur vers alpha (méthode GIMP) : le papier devient transparent, le dessin garde ses teintes.
const rgba = Buffer.alloc(W * H * 4);
const NOISE = 0.1; // grain du papier
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    const b = bg(x, y);
    let a = 0;
    for (let c = 0; c < 3; c++) {
      const p = data[i + c];
      const ac = p < b[c] ? (b[c] - p) / b[c] : (p - b[c]) / (255 - b[c] || 1);
      a = Math.max(a, ac);
    }
    const o = (y * W + x) * 4;
    const alpha = Math.max(0, Math.min(1, (a - NOISE) / (1 - NOISE)));
    for (let c = 0; c < 3; c++) {
      const p = data[i + c];
      rgba[o + c] = a > 0 ? Math.max(0, Math.min(255, Math.round((p - b[c] * (1 - a)) / a))) : p;
    }
    rgba[o + 3] = Math.round(alpha * 255);
  }
}

// 3. Variante « en réserve » pour fonds sombres : ivoire, intensité suivant la densité du trait d'origine.
const ivory = [246, 240, 230];
const reserve = Buffer.alloc(W * H * 4);
for (let k = 0; k < W * H; k++) {
  const o = k * 4;
  const l = (0.299 * rgba[o] + 0.587 * rgba[o + 1] + 0.114 * rgba[o + 2]) / 255;
  reserve[o] = ivory[0];
  reserve[o + 1] = ivory[1];
  reserve[o + 2] = ivory[2];
  reserve[o + 3] = Math.round(rgba[o + 3] * (0.45 + 0.55 * (1 - l)));
}

const raw = (buf: Buffer) => sharp(buf, { raw: { width: W, height: H, channels: 4 } });

/** Région conservée : 1 = gardé, 0 = retiré, entre les deux = fondu. */
type Keep = (x: number, y: number) => number;

/** Emprise du dessin (alpha significatif) dans une région donnée. */
function bbox(keep: Keep) {
  let x0 = W;
  let y0 = H;
  let x1 = 0;
  let y1 = 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (keep(x, y) > 0.3 && rgba[(y * W + x) * 4 + 3] > 40) {
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
      }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}
function masked(buf: Buffer, keep: Keep) {
  const out = Buffer.from(buf);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const k = keep(x, y);
      const o = (y * W + x) * 4;
      if (k < 1) out[o + 3] = Math.round(out[o + 3] * k);
      if (out[o + 3] === 0) out[o] = out[o + 1] = out[o + 2] = 0; // pixels invisibles neutres : fichiers bien plus légers
    }
  return out;
}

const pad = (r: ReturnType<typeof bbox>, m: number) => ({
  left: Math.max(0, r.left - m),
  top: Math.max(0, r.top - m),
  width: Math.min(W - Math.max(0, r.left - m), r.width + 2 * m),
  height: Math.min(H - Math.max(0, r.top - m), r.height + 2 * m),
});

// Zones (coordonnées mesurées sur le fichier d'origine 1254×1254)
const inLogo: Keep = (_x, y) => Number(y > 120 && y < 1010); // logo complet avec signature
const inLockup: Keep = (_x, y) => Number(y > 120 && y < 905); // MAISON TAMRĀN sans la signature
// Le dattier-T seul : palmes et régimes (sans l'étoile ni le filet qui commence en x=606, y=610),
// tronc à gauche du A (x<445), et le pied de la courbe sous les lettres qui s'efface en fondu.
const inMark: Keep = (x, y) => {
  if (y <= 120 || y >= 905) return 0;
  if (y < 605) return Number(x < 870 && !(x > 700 && y > 575));
  if (y < 640) return Number(x < 605);
  if (x < 445) return 1;
  if (y > 840 && x < 525) return (525 - x) / 80;
  return 0;
};

fs.mkdirSync(OUT, { recursive: true });
const variants: [string, Buffer, Keep][] = [
  ["maison-tamran-logo", rgba, inLogo],
  ["maison-tamran-logo-ivory", reserve, inLogo],
  ["maison-tamran-lockup", rgba, inLockup],
  ["maison-tamran-lockup-ivory", reserve, inLockup],
  ["maison-tamran-mark", rgba, inMark],
  ["maison-tamran-mark-ivory", reserve, inMark],
];
const dims: Record<string, { w: number; h: number }> = {};
for (const [name, buf, keep] of variants) {
  const box = pad(bbox(keep), 6);
  const img = await raw(masked(buf, keep)).extract(box).png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(path.join(OUT, `${name}.png`), img);
  dims[name] = { w: box.width, h: box.height };
  console.log(`${name}.png  ${box.width}×${box.height}`);
}

// 4. Icônes : le dattier-T sur fond cacao (favicon, PWA, Apple), carré centré.
async function icon(size: number, file: string, radius = 0) {
  const markBox = pad(bbox(inMark), 6);
  const mark = await raw(masked(reserve, inMark)).extract(markBox).png().toBuffer();
  const inner = Math.round(size * 0.78);
  const fitted = await sharp(mark).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  const base = sharp({ create: { width: size, height: size, channels: 4, background: { r: 0x32, g: 0x1f, b: 0x18, alpha: 1 } } });
  const layers: OverlayOptions[] = [{ input: fitted, gravity: "center" }];
  if (radius) {
    const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#fff"/></svg>`);
    layers.push({ input: mask, blend: "dest-in" });
  }
  const png = await base.composite(layers).png({ compressionLevel: 9 }).toBuffer();
  if (file) fs.writeFileSync(file, png);
  return png;
}
await icon(512, path.join(OUT, "icon-512.png"));
await icon(512, path.join(root, "src/app/icon.png"), 96);
await icon(180, path.join(root, "src/app/apple-icon.png"));

// favicon.ico (PNG 48×48 encapsulé, format ICO standard)
const fav = await icon(48, "", 8);
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(48, 6);
header.writeUInt8(48, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(fav.length, 14);
header.writeUInt32LE(22, 18);
fs.writeFileSync(path.join(root, "src/app/favicon.ico"), Buffer.concat([header, fav]));

// Versions allégées : devis PDF (lues par le serveur) et emails (URL publique).
const ASSETS = path.join(root, "src/assets/brand");
fs.mkdirSync(ASSETS, { recursive: true });
await sharp(path.join(OUT, "maison-tamran-logo.png")).resize({ width: 700 }).png({ compressionLevel: 9 }).toFile(path.join(ASSETS, "logo-pdf.png"));
await sharp(path.join(OUT, "maison-tamran-lockup.png")).resize({ width: 400 }).png({ compressionLevel: 9 }).toFile(path.join(ASSETS, "lockup-pdf.png"));
await sharp(path.join(OUT, "maison-tamran-logo.png")).resize({ width: 360 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, "maison-tamran-logo-email.png"));

fs.writeFileSync(path.join(root, "src/data/logo-dimensions.json"), `${JSON.stringify(dims, null, 2)}\n`);
console.log("Icônes : src/app/icon.png, src/app/apple-icon.png, src/app/favicon.ico, public/brand/icon-512.png");
