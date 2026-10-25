// Rend les visuels concept en WebP dans public/images/concepts/.
// Usage : npx tsx scripts/concepts/build.ts [filtre]
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { slots } from "./compositions";

const root = path.resolve(import.meta.dirname, "../..");
const outDir = path.join(root, "public/images/concepts");
fs.mkdirSync(outDir, { recursive: true });
const filter = process.argv[2];
const preview = process.env.PREVIEW_DIR;

const manifest: Record<string, { w: number; h: number; alt: string; group: string; blur: string }> = {};
const manifestPath = path.join(root, "src/data/concepts-manifest.json");
if (fs.existsSync(manifestPath)) Object.assign(manifest, JSON.parse(fs.readFileSync(manifestPath, "utf8")));

for (const s of slots()) {
  if (filter && !s.id.includes(filter)) continue;
  const t0 = Date.now();
  const svg = s.build();
  const img = sharp(Buffer.from(svg), { density: 72, limitInputPixels: false });
  const buf = await img.png().toBuffer();
  await sharp(buf).webp({ quality: 84, effort: 5, alphaQuality: 90 }).toFile(path.join(outDir, `${s.id}.webp`));
  const tiny = await sharp(buf).resize(16).webp({ quality: 40 }).toBuffer();
  manifest[s.id] = { w: s.w, h: s.h, alt: s.alt, group: s.group, blur: `data:image/webp;base64,${tiny.toString("base64")}` };
  if (preview) await sharp(buf).resize(900).png().toFile(path.join(preview, `${s.id}.png`));
  console.log(s.id, `${Date.now() - t0}ms`);
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
