// Pose du logo officiel sur un couvercle photographié en perspective (marquage à chaud cuivré).
// Le modèle d'image ne dessine jamais le logo : on part du fichier de marque détouré (npm run logo) et on le
// projette dans le quadrilatère du filet cuivré du couvercle, mesuré sur l'original généré.
import path from "node:path";
import sharp from "sharp";
import { ROOT } from "./store";

export type Quad = [[number, number], [number, number], [number, number], [number, number]]; // HG, HD, BD, BG

/** Homographie du carré unité vers un quadrilatère (méthode de Heckbert). */
function squareToQuad([[x0, y0], [x1, y1], [x2, y2], [x3, y3]]: Quad) {
  const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2;
  const sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (sx * dy2 - dx2 * sy) / den;
  const h = (dx1 * sy - sx * dy1) / den;
  return [x1 - x0 + g * x1, x3 - x0 + h * x3, x0, y1 - y0 + g * y1, y3 - y0 + h * y3, y0, g, h, 1];
}

function invert(m: number[]) {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map((v) => v / det);
}

/**
 * Compose le logo dans le quadrilatère `quad` (coordonnées de l'image), centré, sur `widthRatio` de la largeur.
 * `aspect` = rapport largeur / hauteur réel du couvercle (le quadrilatère est vu en perspective).
 */
export async function composeLidLogo(image: Buffer, quad: Quad, { aspect = 1.25, widthRatio = 0.6 } = {}): Promise<Buffer> {
  const logoFile = path.join(ROOT, "public/brand/maison-tamran-logo-ivory.png");
  const logo = await sharp(logoFile).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const LW = logo.info.width, LH = logo.info.height;
  const base = sharp(image);
  const { width: W, height: H } = await base.metadata();
  const H2Q = squareToQuad(quad);
  const Q2H = invert(H2Q);

  // emplacement du logo dans le plan du couvercle (unités : largeur 1, hauteur 1 / aspect)
  const lw = widthRatio;
  const lh = (widthRatio * aspect * LH) / LW; // hauteur relative (le carré unité couvre la hauteur du couvercle)
  const u0 = 0.5 - lw / 2, v0 = 0.5 - lh / 2;

  const xs = quad.map((p) => p[0]), ys = quad.map((p) => p[1]);
  const left = Math.max(0, Math.floor(Math.min(...xs))), top = Math.max(0, Math.floor(Math.min(...ys)));
  const right = Math.min(W!, Math.ceil(Math.max(...xs))), bottom = Math.min(H!, Math.ceil(Math.max(...ys)));
  const bw = right - left, bh = bottom - top;
  const foil = Buffer.alloc(bw * bh * 4);
  const shade = Buffer.alloc(bw * bh * 4);

  const alphaAt = (u: number, v: number) => {
    const lx = ((u - u0) / lw) * (LW - 1), ly = ((v - v0) / lh) * (LH - 1);
    if (lx < 0 || ly < 0 || lx >= LW - 1 || ly >= LH - 1) return 0;
    const x = Math.floor(lx), y = Math.floor(ly), fx = lx - x, fy = ly - y;
    const p = (xx: number, yy: number) => logo.data[(yy * LW + xx) * 4 + 3];
    return (p(x, y) * (1 - fx) + p(x + 1, y) * fx) * (1 - fy) + (p(x, y + 1) * (1 - fx) + p(x + 1, y + 1) * fx) * fy;
  };
  const toLid = (X: number, Y: number) => {
    const w = Q2H[6] * X + Q2H[7] * Y + Q2H[8];
    return [(Q2H[0] * X + Q2H[1] * Y + Q2H[2]) / w, (Q2H[3] * X + Q2H[4] * Y + Q2H[5]) / w];
  };

  for (let y = 0; y < bh; y++)
    for (let x = 0; x < bw; x++) {
      const X = left + x + 0.5, Y = top + y + 0.5;
      const [u, v] = toLid(X, Y);
      if (u < u0 - 0.01 || u > u0 + lw + 0.01 || v < v0 - 0.01 || v > v0 + lh + 0.01) continue;
      const a = alphaAt(u, v) / 255;
      // ombre de gaufrage : le même tracé, décalé d'un pixel vers le bas et la droite
      const [us, vs] = toLid(X - 1.6, Y - 1.6);
      const s = alphaAt(us, vs) / 255;
      const k = (y * bw + x) * 4;
      // cuivre champagne, plus clair vers la lumière (haut gauche du couvercle)
      const light = 1 - 0.35 * ((u + v) / 2);
      foil[k] = Math.round(206 * light + 150 * (1 - light));
      foil[k + 1] = Math.round(158 * light + 104 * (1 - light));
      foil[k + 2] = Math.round(108 * light + 70 * (1 - light));
      foil[k + 3] = Math.round(a * 235);
      shade[k] = 14; shade[k + 1] = 8; shade[k + 2] = 6;
      shade[k + 3] = Math.round(Math.max(0, s - a) * 150);
    }

  const raw = { raw: { width: bw, height: bh, channels: 4 as const } };
  return base
    .composite([
      { input: await sharp(shade, raw).png().toBuffer(), left, top },
      { input: await sharp(foil, raw).png().toBuffer(), left, top },
    ])
    .png()
    .toBuffer();
}
