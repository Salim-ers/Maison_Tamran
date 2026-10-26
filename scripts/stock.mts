// Photographies d'ambiance (Unsplash, licence gratuite) : brand/source/stock/stock.json → public/images/ambiance/.
// Les originaux (lourds) ne sont pas versionnés : ils sont retéléchargés par le lien officiel s'ils manquent.
// Traitement : recadrage éventuel, légère harmonisation chaude (cohérence avec la palette), WebP optimisé.
// Licences et justificatifs : ASSET_LICENSES.md.
// Usage : npm run stock
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const SRC = path.join(root, "brand/source/stock/stock.json");
const OUT_DIR = path.join(root, "public/images/ambiance");
const MANIFEST = path.join(root, "src/data/ambiance-manifest.json");

interface StockEntry {
  key: string;
  file: string;
  id: string;
  page: string;
  photographer: string;
  alt: string;
  width: number;
  height: number;
}

// Recadrages (fractions de l'image) : la palmeraie est cadrée sur les palmiers et les dunes
// (le premier plan de sable comporte un petit déchet plastique).
const CROPS: Record<string, { left: number; top: number; width: number; height: number }> = {
  palmeraie: { left: 0.17, top: 0.1, width: 0.66, height: 0.52 },
};

const list = JSON.parse(fs.readFileSync(SRC, "utf8")) as StockEntry[];
const manifest: Record<string, { url: string; w: number; h: number; blur: string; alt: string; credit: string; page: string }> = {};
fs.mkdirSync(OUT_DIR, { recursive: true });

for (const e of list) {
  const file = path.join(root, e.file);
  if (!fs.existsSync(file)) {
    // lien de téléchargement officiel Unsplash (compte les téléchargements, conforme aux règles de la plateforme)
    const res = await fetch(`https://unsplash.com/photos/${e.id}/download?force=true`);
    if (!res.ok) throw new Error(`Téléchargement impossible pour ${e.key} (${res.status})`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    console.log(`téléchargé : ${e.file}`);
  }
  let img = sharp(file).rotate();
  const crop = CROPS[e.key];
  if (crop) {
    const m = await sharp(file).metadata();
    img = img.extract({ left: Math.round(m.width! * crop.left), top: Math.round(m.height! * crop.top), width: Math.round(m.width! * crop.width), height: Math.round(m.height! * crop.height) });
  }
  const buf = await img
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .recomb([
      [1.05, 0.02, 0],
      [0, 1, 0],
      [0, 0.02, 0.9],
    ])
    .modulate({ saturation: 0.9, brightness: 0.98 })
    .webp({ quality: 80, effort: 6 })
    .toBuffer();
  const url = `/images/ambiance/${e.key}.webp`;
  fs.writeFileSync(path.join(OUT_DIR, `${e.key}.webp`), buf);
  const m = await sharp(buf).metadata();
  const blur = await sharp(buf).resize(16).webp({ quality: 40 }).toBuffer();
  manifest[e.key] = { url, w: m.width!, h: m.height!, blur: `data:image/webp;base64,${blur.toString("base64")}`, alt: e.alt, credit: `Photo ${e.photographer} / Unsplash`, page: e.page };
  console.log(`${e.key.padEnd(20)} ${m.width}×${m.height}  ${(buf.length / 1024).toFixed(0)} Ko  public${url}`);
}

fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${list.length} photos d'ambiance → src/data/ambiance-manifest.json`);
