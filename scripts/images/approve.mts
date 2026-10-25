// Validation manuelle d'un candidat : optimisation, publication dans public/images/ et branchement
// automatique dans le catalogue (le composant Media remplace le visuel concept par la photo validée).
//
// Usage :
//   npm run images:approve -- coupe-or-de-marrakech                 valide le candidat le plus récent
//   npm run images:approve -- coupe-or-de-marrakech <fichier>       valide un candidat précis
//   npm run images:approve -- --revoke coupe-or-de-marrakech        retire la photo (retour au visuel concept)
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { SHOT_BY_ID } from "./shots";
import { MANIFEST, NATURE, PROVENANCE, ROOT, STAGING, candidates, readJson, writeJson, type ManifestEntry, type ProvenanceEntry } from "./store";

const args = process.argv.slice(2);
const revoke = args[0] === "--revoke";
const [id, file] = revoke ? args.slice(1) : args;
const shot = id ? SHOT_BY_ID.get(id) : undefined;
if (!shot) {
  console.error("Usage : npm run images:approve -- <emplacement> [fichier]   ·   --revoke <emplacement>");
  process.exit(1);
}

const manifest = readJson<Record<string, ManifestEntry>>(MANIFEST, {});
const provenance = readJson<Record<string, ProvenanceEntry>>(PROVENANCE, {});
const publicFile = (url: string) => path.join(ROOT, "public", url);

if (revoke) {
  const current = manifest[shot.id];
  if (!current) {
    console.log(`${shot.id} n'a pas de photo validée.`);
    process.exit(0);
  }
  fs.rmSync(publicFile(current.url), { force: true });
  delete manifest[shot.id];
  if (provenance[shot.id]) provenance[shot.id] = { ...provenance[shot.id], status: "revoked", revokedAt: new Date().toISOString(), file: undefined };
  writeJson(MANIFEST, manifest);
  writeJson(PROVENANCE, provenance);
  console.log(`Photo retirée : ${shot.id} (le visuel concept reprend sa place).`);
  process.exit(0);
}

const list = candidates(shot.id);
const chosen = file ? list.find((c) => c.file === file) : list[0];
if (!chosen) {
  console.error(file ? `Candidat introuvable : ${file}` : `Aucun candidat pour ${shot.id}. Lancez d'abord : npm run images:generate -- ${shot.id}`);
  process.exit(1);
}

const source = path.join(STAGING, shot.id, chosen.file);
const input = sharp(source).rotate();
const meta = await input.metadata();
const sw = meta.width!;
const sh = meta.height!;

// Recadrage au ratio de l'emplacement si nécessaire (jamais d'agrandissement : on garde la définition native).
const target = shot.width / shot.height;
let w = sw;
let h = sh;
if (Math.abs(sw / sh - target) > 0.01) {
  if (sw / sh > target) w = Math.round(sh * target);
  else h = Math.round(sw / target);
}
const pipeline = w !== sw || h !== sh ? input.resize(w, h, { fit: "cover", position: "attention" }) : input;
const webp = await pipeline.webp({ quality: 88, effort: 6, smartSubsample: true }).toBuffer();
const blurBuf = await sharp(webp).resize(16).webp({ quality: 40 }).toBuffer();

const hash = createHash("sha1").update(webp).digest("hex").slice(0, 8);
const url = `/images/${shot.dir}/${shot.id}-${hash}.webp`;
const previous = manifest[shot.id];
if (previous && previous.url !== url) fs.rmSync(publicFile(previous.url), { force: true });
fs.mkdirSync(path.dirname(publicFile(url)), { recursive: true });
fs.writeFileSync(publicFile(url), webp);

manifest[shot.id] = { url, w, h, blur: `data:image/webp;base64,${blurBuf.toString("base64")}` };
provenance[shot.id] = {
  status: "approved",
  nature: NATURE,
  source: "Cloudflare Workers AI",
  model: chosen.model,
  modelId: chosen.modelId,
  seed: chosen.seed,
  prompt: chosen.prompt,
  generatedAt: chosen.generatedAt,
  approvedAt: new Date().toISOString(),
  file: `public${url}`,
  width: w,
  height: h,
  candidate: chosen.file,
};
writeJson(MANIFEST, manifest);
writeJson(PROVENANCE, provenance);

console.log(`Validée : ${shot.id}`);
console.log(`  fichier : public${url}  (${w}×${h}, ${(webp.length / 1024).toFixed(0)} Ko, WebP)`);
console.log(`  source  : .images-staging/${shot.id}/${chosen.file}`);
console.log("  Le site affiche désormais cette photo à la place du visuel concept (formats AVIF/WebP servis par next/image).");
