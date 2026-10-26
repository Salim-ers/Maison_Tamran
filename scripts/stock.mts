// Photographies d'ambiance (Unsplash, licence gratuite) : brand/source/stock/stock.json → public/images/ambiance/.
// Les originaux (lourds) ne sont pas versionnés : ils sont retéléchargés par le lien officiel s'ils manquent.
// Traitement : recadrage éventuel, légère harmonisation chaude (cohérence avec la palette), WebP optimisé.
// Licences et justificatifs : ASSET_LICENSES.md.
// Usage : npm run stock
import { createHash } from "node:crypto";
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

// Définition publiée : 4K (3840 px sur le grand côté), sans jamais agrandir un original plus petit.
const MAX = 3840;

// Recadrages (fractions de l'image) : la palmeraie est cadrée sur les palmiers et les dunes, en gardant
// 3840 px de large ; deux déchets du premier plan (objet blanc à gauche, bouteille) restent hors champ.
// Coco et safran : bandeau de mur gris et bord de bol retirés en haut de l'image.
const CROPS: Record<string, { left: number; top: number; width: number; height: number }> = {
  palmeraie: { left: 0.166, top: 0.06, width: 0.834, height: 0.565 },
  coco: { left: 0, top: 0.1, width: 1, height: 0.9 },
  safran: { left: 0, top: 0.11, width: 1, height: 0.89 },
};

// Retouches (pixels de l'original) : une zone voisine unie recouvre un détail, bords fondus.
// Riad : numéro de chambre « 2 » vissé sur le montant central de la porte, recouvert par le bois juste au-dessus.
const PATCHES: Record<string, { from: { left: number; top: number }; to: { left: number; top: number }; width: number; height: number }[]> = {
  "riad-lumiere": [{ from: { left: 2036, top: 2262 }, to: { left: 2036, top: 2348 }, width: 58, height: 84 }],
};

// Point focal (object-position) quand le sujet n'est pas centré : le grand palmier, le régime de dattes.
const FOCUS: Record<string, string> = {
  palmeraie: "28% 50%",
  "dattier-regimes": "45% 60%",
};

/** Masque à bords progressifs (opaque au centre, transparent sur `feather` pixels au bord). */
function featherMask(width: number, height: number, feather: number) {
  const mask = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const d = Math.min(x, y, width - 1 - x, height - 1 - y);
      mask[y * width + x] = Math.round(255 * Math.min(1, (d + 1) / feather));
    }
  return mask;
}

async function source(file: string, key: string) {
  const patches = PATCHES[key];
  if (!patches) return sharp(file).rotate();
  const base = await sharp(file).rotate().toBuffer();
  const layers = await Promise.all(
    patches.map(async (p) => ({
      input: await sharp(base)
        .extract({ ...p.from, width: p.width, height: p.height })
        .removeAlpha()
        .joinChannel(featherMask(p.width, p.height, 10), { raw: { width: p.width, height: p.height, channels: 1 } })
        .png()
        .toBuffer(),
      ...p.to,
    })),
  );
  return sharp(await sharp(base).composite(layers).toBuffer());
}

const list = JSON.parse(fs.readFileSync(SRC, "utf8")) as StockEntry[];
const manifest: Record<string, { url: string; w: number; h: number; blur: string; alt: string; credit: string; page: string; focus?: string }> = {};
fs.mkdirSync(OUT_DIR, { recursive: true });
const published = new Set<string>();

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
  let img = await source(file, e.key);
  const crop = CROPS[e.key];
  if (crop) {
    const m = await sharp(file).metadata();
    img = img.extract({ left: Math.round(m.width! * crop.left), top: Math.round(m.height! * crop.top), width: Math.round(m.width! * crop.width), height: Math.round(m.height! * crop.height) });
  }
  const buf = await img
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .recomb([
      [1.05, 0.02, 0],
      [0, 1, 0],
      [0, 0.02, 0.9],
    ])
    .modulate({ saturation: 0.9, brightness: 0.98 })
    // qualité élevée : next/image réencode ensuite à la taille demandée (éviter une double perte visible)
    .webp({ quality: 85, effort: 6 })
    .toBuffer();
  // empreinte du contenu dans le nom : une photo remplacée change d'adresse (aucun cache ne sert l'ancienne)
  const name = `${e.key}-${createHash("sha1").update(buf).digest("hex").slice(0, 8)}.webp`;
  const url = `/images/ambiance/${name}`;
  fs.writeFileSync(path.join(OUT_DIR, name), buf);
  published.add(name);
  const m = await sharp(buf).metadata();
  const blur = await sharp(buf).resize(16).webp({ quality: 40 }).toBuffer();
  manifest[e.key] = { url, w: m.width!, h: m.height!, blur: `data:image/webp;base64,${blur.toString("base64")}`, alt: e.alt, credit: `Photo ${e.photographer} / Unsplash`, page: e.page, ...(FOCUS[e.key] && { focus: FOCUS[e.key] }) };
  const uhd = Math.max(m.width!, m.height!) >= MAX ? "4K" : "SOUS 4K";
  console.log(`${e.key.padEnd(20)} ${m.width}×${m.height}  ${uhd.padEnd(7)}  ${(buf.length / 1024).toFixed(0)} Ko  public${url}`);
}

// versions précédentes retirées (le dossier ne contient que ce script produit)
for (const f of fs.readdirSync(OUT_DIR)) if (f.endsWith(".webp") && !published.has(f)) fs.unlinkSync(path.join(OUT_DIR, f));
fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${list.length} photos d'ambiance → src/data/ambiance-manifest.json`);
