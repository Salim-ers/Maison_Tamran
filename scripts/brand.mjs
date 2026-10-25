// Génère l'identité TAMBRÉ en SVG vectorisé (aucune police requise à l'affichage).
// Usage : node scripts/brand.mjs
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "brand");
const pub = path.join(root, "public", "brand");
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(pub, { recursive: true });

const load = (f) => opentype.parse(fs.readFileSync(path.join(root, "brand/fonts", f)).buffer);
const bodoni = load(process.env.LOGO_FONT || "BodoniModa-o28-w500.ttf");
const italic = load("BodoniModa-Italic.ttf");

export const COLORS = {
  ivory: "#F7F3EC",
  chocolate: "#251C1A",
  bronze: "#A87455",
  taupe: "#C7B9A8",
  pistachio: "#77745B",
  cream: "#FFFCF7",
};

const r = (n) => Math.round(n * 100) / 100;

// Sérialiseur maison (toPathData d'opentype.js produit parfois des NaN).
function pd(p) {
  const f = (v) => (Math.round(v * 100) / 100).toString();
  return p.commands
    .map((c) => {
      if (c.type === "M" || c.type === "L") return c.type + f(c.x) + " " + f(c.y);
      if (c.type === "Q") return "Q" + f(c.x1) + " " + f(c.y1) + " " + f(c.x) + " " + f(c.y);
      if (c.type === "C") return "C" + f(c.x1) + " " + f(c.y1) + " " + f(c.x2) + " " + f(c.y2) + " " + f(c.x) + " " + f(c.y);
      return "Z";
    })
    .join("");
}


// ---------------------------------------------------------------------------
// Monogramme : un noyau de datte dont la rainure naturelle devient le fût du T,
// et dont une entaille fine dessine la traverse. Lecture : T / noyau / datte.
// ---------------------------------------------------------------------------
// Silhouette du noyau (viewBox 0 0 100 160), légèrement asymétrique comme un vrai noyau.
const PIT =
  "M50 5 C66 7 78.5 33 79.5 68 C80.5 106 70 141 53 153.5 C51.2 154.8 48.8 154.8 47 153.5 C30 141 19.5 106 20.5 68 C21.5 33 34 7 50 5 Z";

function monogramCuts(weight = "fine") {
  // traverse (filet) + fût (rainure), soustraits par masque.
  // La traverse s'arrête avant le bord : le noyau reste d'un seul tenant, le T y est « gravé ».
  const fine = weight === "fine";
  const bar = fine ? 3.2 : 9;
  const stem = fine ? 9 : 16;
  const barY = fine ? 50 : 46;
  const inset = fine ? 9 : 7; // distance au bord du noyau
  const xL = 20.5 + inset + 2, xR = 79.5 - inset - 2;
  const stemTop = barY + bar - 0.01;
  const stemBottom = fine ? 128 : 126;
  const half = stem / 2;
  const groove = `M${50 - half} ${stemTop} L${50 + half} ${stemTop} C${50 + half} ${stemTop + 38} ${50 + half * 0.7} ${stemBottom - 16} 50 ${stemBottom} C${50 - half * 0.7} ${stemBottom - 16} ${50 - half} ${stemTop + 38} ${50 - half} ${stemTop} Z`;
  // extrémités de traverse légèrement en biseau, à la manière des empattements Bodoni
  const traverse = `M${xL} ${barY + bar * 0.15} L${xR} ${barY + bar * 0.15} L${xR + 1.2} ${barY + bar} L${xL - 1.2} ${barY + bar} Z`;
  return { groove, traverse };
}

function monogramSVG({ fill, bg = null, weight = "fine", size = null, id = "m" }) {
  const { groove, traverse } = monogramCuts(weight);
  const vb = "0 0 100 160";
  const dims = size ? ` width="${size * 0.625}" height="${size}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${dims} role="img" aria-label="TAMBRÉ">
${bg ? `<rect width="100" height="160" fill="${bg}"/>` : ""}<defs><mask id="${id}-cut" maskUnits="userSpaceOnUse"><rect width="100" height="160" fill="#fff"/><path d="${traverse}" fill="#000"/><path d="${groove}" fill="#000"/></mask></defs>
<path d="${PIT}" fill="${fill}" mask="url(#${id}-cut)"/>
</svg>`;
}

// Version « path seul » (sans masque) pour les usages où les masques sont mal supportés :
// on découpe géométriquement le noyau en morceaux avec evenodd.
function monogramPath(weight = "fine") {
  const { groove, traverse } = monogramCuts(weight);
  return { pit: PIT, groove, traverse };
}

// ---------------------------------------------------------------------------
// Logotype : TAMBRÉ en Bodoni Moda (taille optique display), interlettrage ouvert,
// approches ajustées à l'œil, accent de l'É redessiné en petit noyau incliné.
// ---------------------------------------------------------------------------
const UPM = bodoni.unitsPerEm; // 2000
const CAP = 1500;
const TRACK = 230; // interlettrage (unités)
// corrections optiques par paire (unités), négatif = resserrer
const PAIR = { TA: -150, AM: -20, MB: 0, BR: 10, RE: -20 };

function logotypeGlyphs() {
  const letters = ["T", "A", "M", "B", "R", "E"];
  let x = 0;
  const parts = [];
  letters.forEach((c, i) => {
    const g = bodoni.charToGlyph(c);
    const p = g.getPath(x, CAP, UPM); // y baseline = CAP (coord SVG, y vers le bas)
    parts.push({ c, d: pd(p), x, adv: g.advanceWidth });
    if (i < letters.length - 1) {
      const next = letters[i + 1];
      const kern = bodoni.getKerningValue(g, bodoni.charToGlyph(next)) || 0;
      x += g.advanceWidth + TRACK + kern + (PAIR[c + next] ?? 0);
    } else {
      x += g.advanceWidth;
    }
  });
  const E = parts[parts.length - 1];
  const eBox = bodoni.charToGlyph("E").getBoundingBox();
  // accent : noyau incliné posé au-dessus de l'E, décalé vers la droite comme un aigu
  const ax = E.x + (eBox.x1 + eBox.x2) / 2 + 60;
  const ay = -235; // au-dessus de la hauteur de capitale (y=0 en haut des capitales)
  const accent = `<path transform="translate(${ax} ${ay}) rotate(40) scale(1.7)" d="M0 -78 C20 -70 30 -30 30 0 C30 34 18 66 1.5 78 C0.6 78.6 -0.6 78.6 -1.5 78 C-18 66 -30 34 -30 0 C-30 -30 -20 -70 0 -78 Z"/>`;
  const width = x - 37 - 37; // retire les approches latérales
  return { d: parts.map((p) => p.d).join(" "), accent, width, x0: 37 };
}

function logotypeSVG({ fill, bg = null, id = "logotype" }) {
  const { d, accent, width, x0 } = logotypeGlyphs();
  const top = -330; // place pour l'accent
  const h = CAP - top + 30;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${top} ${r(width)} ${h}" role="img" aria-label="TAMBRÉ">
${bg ? `<rect x="${x0}" y="${top}" width="${r(width)}" height="${h}" fill="${bg}"/>` : ""}<g fill="${fill}" id="${id}"><path d="${d}"/>${accent}</g>
</svg>`;
}

// Signature secondaire en Bodoni italique, vectorisée
function textPathPerGlyph(font, text, size, tracking = 0) {
  const scale = size / font.unitsPerEm;
  let x = 0;
  const glyphs = font.stringToGlyphs(text);
  const parts = [];
  glyphs.forEach((g, i) => {
    parts.push({ g, x });
    const next = glyphs[i + 1];
    const kern = next ? font.getKerningValue(g, next) : 0;
    x += (g.advanceWidth + kern) * scale + (next ? tracking * size : 0);
  });
  return { parts, width: x };
}

function signaturePath(text, size, xCenter, baseline) {
  const { parts, width } = textPathPerGlyph(italic, text, size, 0.03);
  const x0 = xCenter - width / 2;
  const d = parts.map(({ g, x }) => pd(g.getPath(x0 + x, baseline, size))).join(" ");
  return { d, w: width };
}

// Logo principal vertical : monogramme + logotype + signature
function primarySVG({ fill, sub = fill, bg = null, withSignature = true }) {
  const lg = logotypeGlyphs();
  const W = 2600;
  const scale = (W * 0.86) / lg.width;
  const lx = (W - lg.width * scale) / 2 - lg.x0 * scale;
  const monoH = 760;
  const monoW = monoH * 0.625;
  const monoY = 150;
  const logoY = monoY + monoH + 300; // haut des capitales
  const capH = CAP * scale;
  const sigBase = logoY + capH + 300;
  const sig = withSignature ? signaturePath("Maison de dattes gastronomiques", 118, W / 2, sigBase) : null;
  const H = withSignature ? sigBase + 170 : logoY + capH + 170;
  const { groove, traverse } = monogramCuts("fine");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${r(H)}" role="img" aria-label="TAMBRÉ — Maison de dattes gastronomiques">
${bg ? `<rect width="${W}" height="${r(H)}" fill="${bg}"/>` : ""}<defs><mask id="pm-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="160"><rect width="100" height="160" fill="#fff"/><path d="${traverse}" fill="#000"/><path d="${groove}" fill="#000"/></mask></defs>
<g transform="translate(${r((W - monoW) / 2)} ${monoY}) scale(${r(monoH / 160)})"><path d="${PIT}" fill="${fill}" mask="url(#pm-cut)"/></g>
<g transform="translate(${r(lx)} ${r(logoY)}) scale(${r(scale)})" fill="${fill}"><path d="${lg.d}"/>${lg.accent}</g>
${sig ? `<path d="${sig.d}" fill="${sub}"/>` : ""}
</svg>`;
}

// Version compacte horizontale : monogramme + logotype
function horizontalSVG({ fill, bg = null }) {
  const lg = logotypeGlyphs();
  const H = 640;
  const monoH = 520;
  const monoW = monoH * 0.625;
  const scale = 300 / CAP; // capitales de 300
  const capTop = (H - 300) / 2 + 10;
  const gap = 150;
  const lx = 60 + monoW + gap - lg.x0 * scale;
  const W = 60 + monoW + gap + lg.width * scale + 60;
  const { groove, traverse } = monogramCuts("fine");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(W)} ${H}" role="img" aria-label="TAMBRÉ">
${bg ? `<rect width="${r(W)}" height="${H}" fill="${bg}"/>` : ""}<defs><mask id="hm-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="160"><rect width="100" height="160" fill="#fff"/><path d="${traverse}" fill="#000"/><path d="${groove}" fill="#000"/></mask></defs>
<g transform="translate(60 ${(H - monoH) / 2}) scale(${r(monoH / 160)})"><path d="${PIT}" fill="${fill}" mask="url(#hm-cut)"/></g>
<g transform="translate(${r(lx)} ${r(capTop)}) scale(${r(scale)})" fill="${fill}"><path d="${lg.d}"/>${lg.accent}</g>
</svg>`;
}

// Favicon : noyau plein, entailles épaissies, sur pastille chocolat
function faviconSVG() {
  const { groove, traverse } = monogramCuts("bold");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="14" fill="${COLORS.chocolate}"/>
<defs><mask id="fv" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="160"><rect width="100" height="160" fill="#fff"/><path d="${traverse}" fill="#000"/><path d="${groove}" fill="#000"/></mask></defs>
<g transform="translate(17.5 6) scale(0.325)"><path d="${PIT}" fill="${COLORS.ivory}" mask="url(#fv)"/></g>
</svg>`;
}

// Couvercle de coffret (fichier de travail packaging) : marquage à chaud bronze sur carton chocolat
function packagingLidSVG() {
  const lg = logotypeGlyphs();
  const W = 2400, H = 1600;
  const scale = 900 / lg.width;
  const lx = (W - lg.width * scale) / 2 - lg.x0 * scale;
  const { groove, traverse } = monogramCuts("fine");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<title>Couvercle coffret TAMBRÉ — fichier de travail (marquage à chaud bronze, gaufrage du monogramme)</title>
<rect width="${W}" height="${H}" fill="${COLORS.chocolate}"/>
<rect x="60" y="60" width="${W - 120}" height="${H - 120}" fill="none" stroke="${COLORS.bronze}" stroke-width="2" opacity=".55"/>
<defs><mask id="lid" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="160"><rect width="100" height="160" fill="#fff"/><path d="${traverse}" fill="#000"/><path d="${groove}" fill="#000"/></mask></defs>
<g transform="translate(${(W - 200) / 2} 470) scale(2)"><path d="${PIT}" fill="${COLORS.bronze}" mask="url(#lid)"/></g>
<g transform="translate(${r(lx)} 920) scale(${r(scale)})" fill="${COLORS.bronze}"><path d="${lg.d}"/>${lg.accent}</g>
</svg>`;
}

const files = {
  "monogram.svg": monogramSVG({ fill: COLORS.chocolate, id: "mono" }),
  "monogram-ivory.svg": monogramSVG({ fill: COLORS.ivory, id: "monoi" }),
  "monogram-bronze.svg": monogramSVG({ fill: COLORS.bronze, id: "monob" }),
  "monogram-black.svg": monogramSVG({ fill: "#000000", id: "monok" }),
  "monogram-white.svg": monogramSVG({ fill: "#FFFFFF", id: "monow" }),
  "logotype.svg": logotypeSVG({ fill: COLORS.chocolate }),
  "logotype-ivory.svg": logotypeSVG({ fill: COLORS.ivory }),
  "logotype-black.svg": logotypeSVG({ fill: "#000000" }),
  "logotype-white.svg": logotypeSVG({ fill: "#FFFFFF" }),
  "logo-primary.svg": primarySVG({ fill: COLORS.chocolate, sub: COLORS.bronze }),
  "logo-primary-on-chocolate.svg": primarySVG({ fill: COLORS.ivory, sub: COLORS.taupe, bg: COLORS.chocolate }),
  "logo-primary-on-ivory.svg": primarySVG({ fill: COLORS.chocolate, sub: COLORS.bronze, bg: COLORS.ivory }),
  "logo-primary-black.svg": primarySVG({ fill: "#000000" }),
  "logo-primary-white.svg": primarySVG({ fill: "#FFFFFF" }),
  "logo-horizontal.svg": horizontalSVG({ fill: COLORS.chocolate }),
  "logo-horizontal-ivory.svg": horizontalSVG({ fill: COLORS.ivory }),
  "favicon.svg": faviconSVG(),
  "packaging-lid.svg": packagingLidSVG(),
};

for (const [name, svg] of Object.entries(files)) {
  fs.writeFileSync(path.join(out, name), svg);
  fs.writeFileSync(path.join(pub, name), svg);
}

// Données réutilisées par les composants React (formes vectorielles)
const lg = logotypeGlyphs();
const { groove, traverse } = monogramCuts("fine");
const ts = `// Fichier généré par scripts/brand.mjs — ne pas modifier à la main.
export const PIT_PATH = ${JSON.stringify(PIT)};
export const MONO_TRAVERSE = ${JSON.stringify(traverse)};
export const MONO_GROOVE = ${JSON.stringify(groove)};
export const LOGOTYPE = {
  d: ${JSON.stringify(lg.d)},
  accent: ${JSON.stringify(lg.accent.match(/transform="([^"]+)"/)[1])},
  accentD: ${JSON.stringify(lg.accent.match(/ d="([^"]+)"/)[1])},
  viewBox: ${JSON.stringify(`${lg.x0} -330 ${r(lg.width)} ${1500 + 330 + 30}`)},
};
`;
fs.writeFileSync(path.join(root, "src/lib/brand-paths.ts"), ts);

// Favicons / icônes d'application
const app = path.join(root, "src/app");
const fav = Buffer.from(faviconSVG());
await sharp(fav, { density: 600 }).resize(180, 180).png().toFile(path.join(app, "apple-icon.png"));
await sharp(fav, { density: 600 }).resize(512, 512).png().toFile(path.join(pub, "icon-512.png"));
fs.writeFileSync(path.join(app, "icon.svg"), faviconSVG());
const fav32 = await sharp(fav, { density: 300 }).resize(32, 32).png().toBuffer();
// ICO minimal contenant un PNG 32×32
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
ico.writeUInt8(32, 6); ico.writeUInt8(32, 7); ico.writeUInt8(0, 8); ico.writeUInt8(0, 9);
ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12); ico.writeUInt32LE(fav32.length, 14); ico.writeUInt32LE(22, 18);
fs.writeFileSync(path.join(app, "favicon.ico"), Buffer.concat([ico, fav32]));

console.log("Identité générée :", Object.keys(files).length, "SVG");
