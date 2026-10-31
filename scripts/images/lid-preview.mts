// Aperçu de la pose du logo sur le couvercle (revue avant publication).
import fs from "node:fs";
import sharp from "sharp";
import { composeLidLogo, type Quad } from "./lid";
const [src, out, q] = process.argv.slice(2);
const quad = JSON.parse(q) as Quad;
const buf = await composeLidLogo(fs.readFileSync(src), quad);
await sharp(buf).extract({ left: 1700, top: 150, width: 2000, height: 1700 }).resize(1200).jpeg({ quality: 85 }).toFile(out);
