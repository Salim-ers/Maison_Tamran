// Planche contact des originaux générés, pour la revue visuelle avant publication.
// Usage : npx tsx scripts/images/contact-sheet.mts <sortie.jpg> <emplacement> [emplacement…]
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ROOT, readJson } from "./store";

const [out, ...ids] = process.argv.slice(2);
const gen = readJson<Record<string, { current: string; versions: { key: string; file: string }[] }>>(path.join(ROOT, "brand/generated/manifest.json"), {});
const H = 640;
const tiles: { input: Buffer; left: number; top: number }[] = [];
let x = 0;
for (const id of ids) {
  const v = gen[id]?.versions.find((k) => k.key === gen[id].current);
  if (!v || !fs.existsSync(path.join(ROOT, v.file))) continue;
  const img = sharp(path.join(ROOT, v.file)).resize({ height: H }).flatten({ background: "#3a3a3a" });
  const buf = await img.toBuffer();
  const { width } = await sharp(buf).metadata();
  tiles.push({ input: buf, left: x, top: 0 });
  x += width! + 8;
}
await sharp({ create: { width: Math.max(1, x - 8), height: H, channels: 3, background: "#111" } }).composite(tiles).jpeg({ quality: 78 }).toFile(out);
console.log(out);
