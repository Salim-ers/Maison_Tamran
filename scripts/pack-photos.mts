// Intègre le pack photographique Maison Tamrān (brand/source/pack-photos) dans le site.
//
// Le pack livre des fichiers 3840×2160 qui sont des vignettes (~326×390) agrandies numériquement et
// posées au centre d'un fond flou étendu. On ne publie que la partie nette (détectée automatiquement),
// à sa définition réelle, sans prétendre à de la 4K native. Café Impérial et le coffret Signature
// proviennent de photographies de référence détaillées : on les utilise en priorité.
//
// Usage : npm run pack-photos  →  public/images/creations/, public/images/coffrets/, src/data/photo-manifest.json
import fs from "node:fs";
import path from "node:path";
import sharp, { type Sharp } from "sharp";
import { RECIPES } from "../src/data/recipes";
import { MANIFEST, PROVENANCE, readJson, writeJson, type ManifestEntry, type ProvenanceEntry } from "./images/store";

const root = path.resolve(import.meta.dirname, "..");
const PACK = path.join(root, "brand/source/pack-photos");
const PUBLIC = path.join(root, "public");
const BADGE = "Visuel conceptuel";

type Region = { left: number; top: number; width: number; height: number };

/** Zone nette d'un fichier du pack : là où le détail dépasse nettement celui du fond flouté. */
async function sharpRegion(file: string): Promise<Region> {
  const meta = await sharp(file).metadata();
  const W = 960;
  const H = Math.round((W * meta.height!) / meta.width!);
  const k = meta.width! / W;
  const g = await sharp(file).resize(W, H).greyscale().raw().toBuffer();
  const b = await sharp(file).resize(W, H).greyscale().blur(2.5).raw().toBuffer();
  const col = new Array<number>(W).fill(0);
  const row = new Array<number>(H).fill(0);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const d = Math.abs(g[y * W + x] - b[y * W + x]);
      col[x] += d;
      row[y] += d;
    }
  const span = (a: number[]) => {
    const t = Math.max(...a) * 0.25;
    const s = a.findIndex((v) => v > t);
    const e = a.length - 1 - [...a].reverse().findIndex((v) => v > t);
    return [s, e];
  };
  const [x0, x1] = span(col);
  const [y0, y1] = span(row);
  const inset = 10; // marge de sécurité contre le fondu des bords
  return {
    left: Math.round(x0 * k) + inset,
    top: Math.round(y0 * k) + inset,
    width: Math.round((x1 - x0) * k) - 2 * inset,
    height: Math.round((y1 - y0) * k) - 2 * inset,
  };
}

const manifest = readJson<Record<string, ManifestEntry & { badge?: string; alt?: string }>>(MANIFEST, {});
const provenance = readJson<Record<string, ProvenanceEntry | Record<string, unknown>>>(PROVENANCE, {});

async function publish(id: string, input: Sharp, url: string, alt: string, source: string, note: string) {
  const out = path.join(PUBLIC, url);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const buf = await input.webp({ quality: 84, effort: 6, smartSubsample: true }).toBuffer();
  fs.writeFileSync(out, buf);
  const m = await sharp(buf).metadata();
  const blur = await sharp(buf).resize(16).webp({ quality: 40 }).toBuffer();
  manifest[id] = { url, w: m.width!, h: m.height!, blur: `data:image/webp;base64,${blur.toString("base64")}`, badge: BADGE, alt };
  provenance[id] = {
    status: "approved",
    nature: `${BADGE} — ne représente pas un produit réellement fabriqué. ${note}`,
    source,
    file: `public${url}`,
    width: m.width,
    height: m.height,
    approvedAt: new Date().toISOString(),
  };
  console.log(`${id.padEnd(28)} ${m.width}×${m.height}  public${url}`);
}

const PACK_SOURCE = "Pack photographique Maison Tamrān (brand/source/pack-photos)";
const UPSCALE = "Agrandissement numérique d'une vignette de planche : pas une photographie native haute définition.";

// --- Les dix créations -------------------------------------------------------------------
const VIEWS = [
  { kind: "signature", slot: "produit", suffix: "vue", alt: (n: string) => `${n} : une datte entière et une datte coupée révélant sa garniture, sur une assiette dorée` },
  { kind: "macro", slot: "coupe", suffix: "coeur", alt: (n: string) => `${n} en gros plan : le cœur de la datte coupée` },
  { kind: "entier", slot: "scene", suffix: "entier", alt: (n: string) => `${n} : la datte entière et son décor` },
] as const;

for (const r of RECIPES) {
  const dir = path.join(PACK, r.collection === "signature" ? "signatures" : "ephemeres", r.slug);
  for (const v of VIEWS) {
    const id = `${v.slot}-${r.slug}`;
    const url = `/images/creations/${r.slug}/${r.slug}-${v.suffix}.webp`;
    if (r.slug === "cafe-imperial") continue; // traité depuis la photographie de référence ci-dessous
    const file = path.join(dir, `${r.slug}-${v.kind}-3840x2160.webp`);
    const region = await sharpRegion(file);
    await publish(id, sharp(file).extract(region), url, v.alt(r.name), PACK_SOURCE, `${UPSCALE} Vue « ${v.kind} » du pack${v.kind === "signature" ? "" : " (recadrage de la même image)"}.`);
  }
}

// Café Impérial : photographie de référence détaillée (1122×1402), recadrages pour le cœur et la datte entière.
{
  const ref = path.join(PACK, "references/photo-modele-produit.png");
  const name = "Café Impérial";
  const src = `${PACK_SOURCE}, photographie de référence`;
  await publish("produit-cafe-imperial", sharp(ref), "/images/creations/cafe-imperial/cafe-imperial-vue.webp", VIEWS[0].alt(name), src, "Photographie de référence fournie.");
  await publish("coupe-cafe-imperial", sharp(ref).extract({ left: 470, top: 440, width: 600, height: 750 }), "/images/creations/cafe-imperial/cafe-imperial-coeur.webp", VIEWS[1].alt(name), src, "Recadrage de la photographie de référence.");
  await publish("scene-cafe-imperial", sharp(ref).extract({ left: 160, top: 250, width: 640, height: 800 }), "/images/creations/cafe-imperial/cafe-imperial-entier.webp", VIEWS[2].alt(name), src, "Recadrage de la photographie de référence.");
}

// --- Coffret Signature 12 pièces (photographie de référence 1448×1086) -------------------------
{
  const ref = path.join(PACK, "references/photo-modele-coffret.png");
  const src = `${PACK_SOURCE}, photographie de référence du coffret Signature`;
  const alt = "Coffret Signature ouvert : douze dattes fourrées dans leurs caissettes, couvercle ivoire orné d'un dattier, café et pistaches sur une table en pierre";
  await publish("coffret-1", sharp(ref), "/images/coffrets/coffret-signature-12.webp", alt, src, "Format 12 pièces uniquement.");
  await publish("hero", sharp(ref), "/images/coffrets/coffret-signature-12-hero.webp", alt, src, "Format 12 pièces uniquement.");
  // cadrage vertical pour mobile, centré sur le coffret
  await publish("hero-portrait", sharp(ref).extract({ left: 268, top: 0, width: 869, height: 1086 }), "/images/coffrets/coffret-signature-12-portrait.webp", alt, src, "Recadrage vertical, format 12 pièces uniquement.");
}

writeJson(MANIFEST, manifest);
writeJson(PROVENANCE, provenance);
console.log("Manifeste mis à jour : src/data/photo-manifest.json");
