// Moteur d'illustration « nature morte » en SVG pour les visuels concept TAMBRÉ.
// Les images produites sont des CONCEPTS illustrés, en attendant les vraies photographies.
import type { Recipe, Topping } from "../../src/data/recipes";
import { PIT_PATH, MONO_GROOVE, MONO_TRAVERSE, LOGOTYPE } from "../../src/lib/brand-paths";

export type RNG = () => number;
export function rng(seed: number): RNG {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n: number) => (Math.round(n * 100) / 100).toString();
const between = (r: RNG, a: number, b: number) => a + (b - a) * r();
const pick = <T,>(r: RNG, arr: T[]) => arr[Math.floor(r() * arr.length)];

// ---------- couleurs ----------
function hexToRgb(h: string) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]: number[]) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}
export function shade(hex: string, k: number) {
  // k<0 assombrit, k>0 éclaircit
  const c = hexToRgb(hex);
  return rgbToHex(c.map((v) => (k < 0 ? v * (1 + k) : v + (255 - v) * k)));
}
export function mix(a: string, b: string, t: number) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
}
function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// ---------- scène ----------
export class Scene {
  defs: string[] = [];
  layers: string[] = [];
  private n = 0;
  constructor(public W: number, public H: number, public seed = 1) {}
  id(p: string) {
    return `${p}${++this.n}`;
  }
  def(s: string) {
    this.defs.push(s);
  }
  add(s: string) {
    this.layers.push(s);
  }
  svg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.W} ${this.H}" width="${this.W}" height="${this.H}"><defs>${this.defs.join("")}</defs>${this.layers.join("")}</svg>`;
  }
  /** flou gaussien réutilisable */
  blur(std: number) {
    const id = this.id("b");
    this.def(`<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${f(std)}"/></filter>`);
    return id;
  }
}

// ---------- surfaces ----------
export type Surface = Recipe["palette"]["surface"];
const SURFACES: Record<Surface, { base: string; light: string; dark: string; grain: number; mottle: number }> = {
  ivoire: { base: "#EDE5D8", light: "#FAF6EF", dark: "#D3C7B5", grain: 0.05, mottle: 0.05 },
  lin: { base: "#E3D8C5", light: "#F2EBDD", dark: "#C4B49B", grain: 0.09, mottle: 0.04 },
  pierre: { base: "#CFC8BC", light: "#E6E1D8", dark: "#A79E90", grain: 0.07, mottle: 0.14 },
  marbre: { base: "#ECE8E1", light: "#F8F6F1", dark: "#CFC8BD", grain: 0.03, mottle: 0.04 },
  ardoise: { base: "#2E2B2A", light: "#45403D", dark: "#151313", grain: 0.1, mottle: 0.12 },
  chocolat: { base: "#2C201C", light: "#46332B", dark: "#140E0C", grain: 0.08, mottle: 0.08 },
};
export function isDark(s: Surface) {
  return s === "ardoise" || s === "chocolat";
}

export function surface(sc: Scene, kind: Surface, light: { x: number; y: number } = { x: 0.28, y: 0.22 }) {
  const S = SURFACES[kind];
  const g = sc.id("sg");
  sc.def(
    `<radialGradient id="${g}" cx="${light.x}" cy="${light.y}" r="1.05"><stop offset="0" stop-color="${S.light}"/><stop offset=".55" stop-color="${S.base}"/><stop offset="1" stop-color="${S.dark}"/></radialGradient>`
  );
  sc.add(`<rect width="${sc.W}" height="${sc.H}" fill="url(#${g})"/>`);
  // marbrures / variations de matière
  const m = sc.id("mt");
  sc.def(
    `<filter id="${m}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${f(1.6 / sc.W)} ${f(2.2 / sc.H)}" numOctaves="3" seed="${sc.seed}"/><feColorMatrix type="matrix" values="0 0 0 0 ${isDark(kind) ? 1 : 0}  0 0 0 0 ${isDark(kind) ? 0.95 : 0}  0 0 0 0 ${isDark(kind) ? 0.9 : 0}  ${isDark(kind) ? 1.2 : -1.2} 0 0 0 ${isDark(kind) ? -0.45 : 0.75}"/></filter>`
  );
  sc.add(`<rect width="${sc.W}" height="${sc.H}" filter="url(#${m})" opacity="${S.mottle}"/>`);
  if (kind === "marbre") {
    const v = sc.id("vn");
    sc.def(
      `<filter id="${v}" x="0" y="0" width="100%" height="100%"><feTurbulence type="turbulence" baseFrequency="${f(1.4 / sc.W)} ${f(3.2 / sc.H)}" numOctaves="5" seed="${sc.seed + 7}"/><feColorMatrix type="matrix" values="0 0 0 0 .42  0 0 0 0 .39  0 0 0 0 .36  -9 0 0 0 1.25"/><feGaussianBlur stdDeviation="1.2"/></filter>`
    );
    sc.add(`<rect width="${sc.W}" height="${sc.H}" filter="url(#${v})" opacity=".55"/>`);
  }
  if (kind === "lin") {
    const w = sc.id("wv");
    sc.def(
      `<filter id="${w}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.012" numOctaves="2" seed="${sc.seed + 3}" result="a"/><feTurbulence type="fractalNoise" baseFrequency="0.012 0.9" numOctaves="2" seed="${sc.seed + 4}" result="b"/><feBlend in="a" in2="b" mode="multiply"/><feColorMatrix type="matrix" values="0 0 0 0 .35  0 0 0 0 .28  0 0 0 0 .2  -2.4 0 0 0 1.3"/></filter>`
    );
    sc.add(`<rect width="${sc.W}" height="${sc.H}" filter="url(#${w})" opacity=".35"/>`);
  }
  // grain fin
  const gr = sc.id("gr");
  sc.def(
    `<filter id="${gr}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${sc.seed + 11}"/><feColorMatrix type="matrix" values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .4  0 0 0 1.6 -0.6"/></filter>`
  );
  sc.add(`<rect width="${sc.W}" height="${sc.H}" filter="url(#${gr})" opacity="${S.grain}"/>`);
}

export function vignette(sc: Scene, strength = 0.35, color = "#000") {
  const g = sc.id("vg");
  sc.def(
    `<radialGradient id="${g}" cx=".5" cy=".48" r=".75"><stop offset=".55" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}" stop-opacity="${strength}"/></radialGradient>`
  );
  sc.add(`<rect width="${sc.W}" height="${sc.H}" fill="url(#${g})"/>`);
}

/** lumière rasante chaude venant d'en haut à gauche */
export function lightSweep(sc: Scene, opacity = 0.18, warm = "#FFE9C8") {
  const g = sc.id("ls");
  sc.def(
    `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${warm}" stop-opacity="${opacity}"/><stop offset=".5" stop-color="${warm}" stop-opacity="0"/></linearGradient>`
  );
  sc.add(`<rect width="${sc.W}" height="${sc.H}" fill="url(#${g})"/>`);
}

// ---------- ombres ----------
export function castShadow(sc: Scene, shapeD: string, transform: string, s: number, opts: { soft?: number; contact?: number; dx?: number; dy?: number } = {}) {
  const soft = sc.blur(16 * s * (opts.soft ?? 1));
  const tight = sc.blur(2.2 * s);
  const dx = (opts.dx ?? 9) * s, dy = (opts.dy ?? 14) * s;
  return `<g transform="translate(${f(dx)} ${f(dy)})"><path d="${shapeD}" transform="${transform}" fill="#1a0f08" opacity="${opts.contact ? 0.38 : 0.32}" filter="url(#${soft})"/></g><g transform="translate(${f(dx * 0.18)} ${f(dy * 0.22)})"><path d="${shapeD}" transform="${transform}" fill="#0d0705" opacity="${opts.contact ?? 0.45}" filter="url(#${tight})"/></g>`;
}

// ---------- la datte ----------
// Silhouette Medjool en coordonnées locales : longueur 200, largeur ~95, axe horizontal.
export const DATE_D =
  "M-100 3 C-101 -26 -74 -45 -26 -47.5 C30 -50 86 -40 98.5 -9 C106 13 80 42 20 46.5 C-44 51 -99 33 -100 3 Z";
// Silhouette d'une demi-datte coupée (face de coupe), un peu plus large
export const HALF_D =
  "M-100 2 C-101 -30 -72 -52 -24 -54 C34 -56 88 -44 99 -10 C107 16 80 48 18 52 C-46 56 -99 36 -100 2 Z";

function scaled(d: string, sx: number, sy: number) {
  return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${f(+x * sx)} ${f(+y * sy)}`);
}

export interface DateOpts {
  x: number;
  y: number;
  s: number; // 1 = 200px de long
  rot: number;
  blur?: number;
  shadow?: boolean;
}

function skinFilter(sc: Scene, seed: number) {
  const id = sc.id("sk");
  sc.def(
    `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.014 0.075" numOctaves="4" seed="${seed}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .13  0 0 0 0 .05  0 0 0 0 .02  2.9 0 0 0 -1.25" result="lines"/><feComposite in="lines" in2="SourceGraphic" operator="atop"/></filter>`
  );
  return id;
}

function fiberFilter(sc: Scene, seed: number, color: string) {
  const id = sc.id("fb");
  const [r, g, b] = hexToRgb(color).map((v) => v / 255);
  sc.def(
    `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.018 0.16" numOctaves="3" seed="${seed}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 ${f(r)}  0 0 0 0 ${f(g)}  0 0 0 0 ${f(b)}  2.4 0 0 0 -1.05" result="l"/><feComposite in="l" in2="SourceGraphic" operator="atop"/></filter>`
  );
  return id;
}

function grainFilter(sc: Scene, seed: number, color: string, amount = 1, freq = 0.35) {
  const id = sc.id("gn");
  const [r, g, b] = hexToRgb(color).map((v) => v / 255);
  sc.def(
    `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 ${f(r)}  0 0 0 0 ${f(g)}  0 0 0 0 ${f(b)}  ${f(3 * amount)} 0 0 0 ${f(-1.45 * amount)}" result="l"/><feComposite in="l" in2="SourceGraphic" operator="atop"/></filter>`
  );
  return id;
}

/**
 * Filtre d'éclairage en relief : la silhouette floutée sert de carte de hauteur (forme bombée),
 * enrichie d'un bruit (rides de la peau, grain du chocolat), puis éclairée par une lumière
 * diffuse et spéculaire. L'azimut est compensé par la rotation pour garder une lumière
 * cohérente sur toute la scène (haut gauche).
 */
export function litFilter(sc: Scene, o: { pillow: number; height: number; noise?: [number, number]; noiseAmt?: number; spec?: number; exp?: number; rot: number; seed: number; ambient?: number; elevation?: number; specElevation?: number; smooth?: number }) {
  const id = sc.id("lit");
  const az = ((225 - o.rot) % 360 + 360) % 360;
  const el = o.elevation ?? 48;
  const noise = o.noise
    ? `<feTurbulence type="fractalNoise" baseFrequency="${f(o.noise[0])} ${f(o.noise[1])}" numOctaves="4" seed="${o.seed}" result="n"/><feComposite in="n" in2="p" operator="arithmetic" k1="0" k2="${f(o.noiseAmt ?? 0.3)}" k3="1" k4="${f(-(o.noiseAmt ?? 0.3) / 2)}" result="hm"/>`
    : `<feComposite in="p" in2="p" operator="over" result="hm"/>`;
  sc.def(`<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
<feGaussianBlur in="SourceAlpha" stdDeviation="${f(o.pillow)}" result="p"/>${noise}
<feDiffuseLighting in="hm" surfaceScale="${f(o.height)}" diffuseConstant="1" lighting-color="#fff" result="d0"><feDistantLight azimuth="${f(az)}" elevation="${f(el)}"/></feDiffuseLighting><feGaussianBlur in="d0" stdDeviation="${f(o.smooth ?? 1.2)}" result="d"/>
<feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="${f(1 / Math.sin((el * Math.PI) / 180) * (o.ambient ?? 1))}" k2="0" k3="0" k4="0" result="lit"/>
<feSpecularLighting in="hm" surfaceScale="${f(o.height)}" specularConstant="${f(o.spec ?? 0.6)}" specularExponent="${f(o.exp ?? 18)}" lighting-color="#FFF4E6" result="s0"><feDistantLight azimuth="${f(az)}" elevation="${f(o.specElevation ?? 26)}"/></feSpecularLighting>
<feGaussianBlur in="s0" stdDeviation="${f(o.smooth ?? 1.2)}" result="s"/><feComposite in="s" in2="SourceAlpha" operator="in" result="si"/>
<feComposite in="lit" in2="SourceAlpha" operator="in" result="li"/>
<feComposite in="si" in2="li" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
</filter>`);
  return id;
}

/** Datte entière, enrobée aux trois quarts — la pointe laisse voir la peau de la Medjool. */
export function wholeDate(sc: Scene, recipe: Recipe, o: DateOpts, seed = 1) {
  const r = rng(seed * 97 + recipe.number * 13);
  const P = recipe.palette;
  const T = `translate(${f(o.x)} ${f(o.y)}) rotate(${f(o.rot)}) scale(${f(o.s)})`;
  const parts: string[] = [];
  if (o.shadow !== false) parts.push(castShadow(sc, DATE_D, T, o.s));

  const clipDate = sc.id("cd");
  const coatShape = scaled(DATE_D, 1.035, 1.06);
  sc.def(`<clipPath id="${clipDate}"><path d="${coatShape}"/></clipPath>`);
  const dip = sc.id("dp");
  const dipX = between(r, 46, 60);
  const dipCurve = `C${f(dipX + 10)} -45 ${f(dipX - 8)} -18 ${f(dipX + 5)} 4 C${f(dipX + 16)} 26 ${f(dipX - 4)} 48 ${f(dipX + 9)} 90`;
  const dipD = `M-140 -90 L${f(dipX)} -90 ${dipCurve} L-140 90 Z`;
  sc.def(`<clipPath id="${dip}"><path d="${dipD}"/></clipPath>`);

  // peau : acajou profond, rides éclairées en relief
  const skinG = sc.id("sgr");
  sc.def(`<linearGradient id="${skinG}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A2A16"/><stop offset=".55" stop-color="#3E1C0E"/><stop offset="1" stop-color="#261008"/></linearGradient>`);
  const skinLit = litFilter(sc, { pillow: 16, height: 22, noise: [0.04, 0.06], noiseAmt: 0.3, spec: 0.28, exp: 16, rot: o.rot, seed: seed + recipe.number, specElevation: 30 });
  const skin = `<path d="${DATE_D}" fill="url(#${skinG})" filter="url(#${skinLit})"/>`;

  // enrobage chocolat : volume bombé, grain très fin, brillance satinée
  const dark = luminance(P.coat) < 0.35;
  const coatG = sc.id("cg");
  sc.def(`<linearGradient id="${coatG}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(P.coat, P.coatLight, 0.35)}"/><stop offset=".5" stop-color="${P.coat}"/><stop offset="1" stop-color="${shade(P.coat, -0.3)}"/></linearGradient>`);
  const coatLit = litFilter(sc, { pillow: 22, height: 46, spec: dark ? 1.1 : 0.7, exp: dark ? 34 : 20, rot: o.rot, seed: seed + 3, ambient: 1, specElevation: dark ? 24 : 28 });
  const coat = `<g filter="url(#${coatLit})"><g clip-path="url(#${dip})"><path d="${coatShape}" fill="url(#${coatG})"/></g></g>
<path d="M${f(dipX)} -60 ${dipCurve.replace(/ 90$/, " 70")}" fill="none" stroke="${shade(P.coat, -0.45)}" stroke-width="1.6" opacity=".55" clip-path="url(#${clipDate})" transform="translate(1.4 0)"/>`;

  const tops = `<g clip-path="url(#${clipDate})">${toppings(sc, recipe, r, dipX, dark, dip)}</g>`;

  let g = `<g transform="${T}">${skin}${coat}${tops}</g>`;
  if (o.blur) {
    const b = sc.blur(o.blur);
    g = `<g filter="url(#${b})">${g}</g>`;
  }
  parts.push(g);
  return parts.join("");
}

function toppings(sc: Scene, recipe: Recipe, r: RNG, dipX: number, darkCoat: boolean, dipClip: string) {
  const out: string[] = [];
  const P = recipe.palette;
  const inBand = () => {
    // position sur le dessus de la datte (moitié supérieure, zone enrobée)
    for (let i = 0; i < 20; i++) {
      const x = between(r, -86, dipX - 8);
      const y = between(r, -40, 8) + Math.abs(x) * 0.02;
      const ex = x / 100, ey = y / 47;
      if (ex * ex + ey * ey < 0.82) return { x, y };
    }
    return { x: 0, y: -10 };
  };
  const tiny = sc.blur(0.9);
  const drop = (shape: string) => `<g transform="translate(1.2 1.6)" opacity=".45" filter="url(#${tiny})">${shape.replace(/fill="[^"]+"/g, 'fill="#120804"').replace(/stroke="[^"]+"/g, 'stroke="#120804"')}</g>${shape}`;

  const has = (t: Topping) => recipe.toppings.includes(t);

  if (has("matcha")) {
    const g = sc.id("mg");
    sc.def(`<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6F8F2E" stop-opacity=".85"/><stop offset=".55" stop-color="#7E9C3A" stop-opacity="0"/></linearGradient>`);
    out.push(`<path d="${scaled(DATE_D, 1.035, 1.06)}" fill="url(#${g})" clip-path="url(#${dipClip})"/>`);
    for (let i = 0; i < 420; i++) {
      const { x, y } = inBand();
      out.push(`<circle cx="${f(x)}" cy="${f(y - 6)}" r="${f(between(r, 0.35, 1.1))}" fill="${pick(r, ["#5F7F24", "#7E9C3A", "#94AE4E"])}" opacity="${f(between(r, 0.5, 0.95))}"/>`);
    }
  }
  if (has("sesame-noir")) {
    for (let i = 0; i < 46; i++) {
      const { x, y } = inBand();
      const a = between(r, 0, 180);
      out.push(drop(`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><ellipse rx="3.3" ry="1.75" fill="#141111"/><ellipse cx="-.8" cy="-.5" rx="1.4" ry=".5" fill="#6a625e" opacity=".7"/></g>`));
    }
  }
  if (has("zeste")) {
    for (let i = 0; i < 6; i++) {
      const { x, y } = inBand();
      const L = between(r, 6, 11), a = between(r, -60, 60), b = between(r, -4, 4);
      out.push(drop(`<path transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})" d="M${f(-L / 2)} 0 Q0 ${f(b)} ${f(L / 2)} 0" stroke="${pick(r, ["#D4B03A", "#E2C55A", "#B88E22"])}" stroke-width="${f(between(r, 0.9, 1.3))}" fill="none" stroke-linecap="round"/>`));
    }
  }
  if (has("safran")) {
    for (let i = 0; i < 11; i++) {
      const { x, y } = inBand();
      const L = between(r, 9, 15), a = between(r, -80, 80), b = between(r, -3, 3);
      out.push(drop(`<path transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})" d="M${f(-L / 2)} 0 Q0 ${f(b)} ${f(L / 2)} 0" stroke="${pick(r, ["#C4361C", "#D9481E", "#B02A14"])}" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})" cx="${f(L / 2)}" r="1.1" fill="#E8822A"/>`));
    }
  }
  if (has("amande")) {
    for (let i = 0; i < 6; i++) {
      const { x, y } = inBand();
      const a = between(r, -40, 40);
      out.push(drop(`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><rect x="-7" y="-2.2" width="14" height="4.4" rx="2" fill="#F3E9D6"/><rect x="-7" y="-2.2" width="14" height="1.6" rx=".8" fill="#FFFDF8" opacity=".8"/><rect x="-7" y="1.2" width="14" height="1" fill="#D2BE9C"/></g>`));
    }
  }
  if (has("pistache")) {
    for (let i = 0; i < 46; i++) {
      const { x, y } = inBand();
      const s = between(r, 1.4, 3.6);
      const pts = Array.from({ length: 5 }, (_, k) => {
        const a = (k / 5) * Math.PI * 2 + between(r, -0.3, 0.3);
        const rr = s * between(r, 0.6, 1.1);
        return `${f(x + Math.cos(a) * rr)},${f(y + Math.sin(a) * rr)}`;
      }).join(" ");
      out.push(drop(`<polygon points="${pts}" fill="${pick(r, ["#7FA03A", "#A8BE5A", "#5E7A2A", "#B9C66A", "#8E5A6B"])}"/>`));
    }
  }
  if (has("kadaif")) {
    for (let i = 0; i < 46; i++) {
      const { x, y } = inBand();
      const L = between(r, 14, 36), a = between(r, -30, 30);
      const c1 = between(r, -8, 8), c2 = between(r, -8, 8);
      out.push(drop(`<path transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})" d="M${f(-L / 2)} 0 C${f(-L / 6)} ${f(c1)} ${f(L / 6)} ${f(c2)} ${f(L / 2)} 0" stroke="${pick(r, ["#D9A54A", "#E8BD62", "#B9822E", "#F2D08A"])}" stroke-width="${f(between(r, 0.7, 1.2))}" fill="none" stroke-linecap="round"/>`));
    }
  }
  if (has("cafe")) {
    for (let i = 0; i < 120; i++) {
      const { x, y } = inBand();
      out.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(between(r, 0.3, 0.9))}" fill="${pick(r, ["#4A2A18", "#6B3F22", "#2E190E"])}" opacity=".85"/>`);
    }
    for (let i = 0; i < 2; i++) {
      const x = -40 + i * 34, y = -22 + i * 4, a = between(r, -30, 30);
      out.push(drop(`<g transform="translate(${x} ${y}) rotate(${f(a)})"><ellipse rx="9" ry="6.4" fill="#3F2416"/><ellipse rx="9" ry="6.4" fill="url(#none)"/><path d="M-7.5 -.5 C-3 2.5 3 -2.5 7.5 .5" stroke="#1C0F08" stroke-width="1.3" fill="none"/><ellipse cx="-2.5" cy="-3.2" rx="4" ry="1.4" fill="#8A5A3A" opacity=".55"/></g>`));
    }
  }
  if (has("cardamome")) {
    for (let i = 0; i < 3; i++) {
      const { x, y } = inBand();
      const a = between(r, -50, 50);
      out.push(drop(`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><ellipse rx="6.5" ry="3.6" fill="#8DA05A"/><path d="M-5 -1 Q0 -2.5 5 -1 M-5 1.2 Q0 2.4 5 1.2" stroke="#6B7E3E" stroke-width=".7" fill="none"/><ellipse cx="-1.5" cy="-1.6" rx="3" ry="1" fill="#C4D08E" opacity=".6"/></g>`));
    }
  }
  if (has("framboise")) {
    // filet de framboise : une ligne souple qui ondule en travers de la datte
    const pts: string[] = [];
    const x0 = -84, x1 = dipX - 6, n = 9;
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      const y = (i % 2 ? -30 : 10) + between(r, -6, 6);
      pts.push(`${f(x)} ${f(y)}`);
    }
    let dz = `M${pts[0]}`;
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i - 1].split(" ").map(Number), [cx, cy] = pts[i].split(" ").map(Number);
      dz += ` C${f(px + (cx - px) * 0.5)} ${f(py)} ${f(px + (cx - px) * 0.5)} ${f(cy)} ${f(cx)} ${f(cy)}`;
    }
    out.push(`<path d="${dz}" stroke="#8E1530" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".55" transform="translate(.6 1)"/><path d="${dz}" stroke="#C8264A" stroke-width="2.1" fill="none" stroke-linecap="round"/><path d="${dz}" stroke="#F49AAE" stroke-width=".6" fill="none" transform="translate(-.4 -.6)" opacity=".8"/>`);
    for (let i = 0; i < 16; i++) {
      const { x, y } = inBand();
      const s = between(r, 1.6, 3.4);
      out.push(drop(`<path transform="translate(${f(x)} ${f(y)}) rotate(${f(between(r, 0, 180))})" d="M${f(-s)} 0 Q${f(-s)} ${f(-s)} 0 ${f(-s)} Q${f(s * 1.2)} ${f(-s * 0.8)} ${f(s)} ${f(s * 0.3)} Q0 ${f(s * 1.2)} ${f(-s)} 0 Z" fill="${pick(r, ["#C8264A", "#E25A78", "#B01E3C", "#EF8AA1"])}"/>`));
    }
  }
  if (has("hibiscus")) {
    for (let i = 0; i < 6; i++) {
      const { x, y } = inBand();
      const a = between(r, 0, 180), L = between(r, 7, 12);
      out.push(drop(`<path transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})" d="M0 0 C${f(L * 0.3)} ${f(-L * 0.35)} ${f(L * 0.8)} ${f(-L * 0.3)} ${f(L)} 0 C${f(L * 0.8)} ${f(L * 0.28)} ${f(L * 0.3)} ${f(L * 0.3)} 0 0 Z" fill="${pick(r, ["#8E1531", "#6E0F25", "#A3203F"])}"/>`));
    }
  }
  if (has("sarrasin")) {
    for (let i = 0; i < 34; i++) {
      const { x, y } = inBand();
      const s = between(r, 1.8, 2.6), a = between(r, 0, 360);
      out.push(drop(`<path transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})" d="M0 ${f(-s)} L${f(s * 0.9)} ${f(s * 0.7)} L${f(-s * 0.9)} ${f(s * 0.7)} Z" fill="${pick(r, ["#9C6B3C", "#7A4E26", "#B5824C"])}" stroke="${pick(r, ["#5A3518"])}" stroke-width=".3"/>`));
    }
  }
  if (has("sel")) {
    for (let i = 0; i < 12; i++) {
      const { x, y } = inBand();
      const s = between(r, 1.6, 3.2);
      const pts = Array.from({ length: 4 }, (_, k) => {
        const a = (k / 4) * Math.PI * 2 + between(r, -0.4, 0.4);
        return `${f(x + Math.cos(a) * s)},${f(y + Math.sin(a) * s)}`;
      }).join(" ");
      out.push(`<polygon points="${pts}" fill="#FFFFFF" opacity=".88" stroke="#E8E4DE" stroke-width=".3"/>`);
    }
  }
  if (has("coco")) {
    for (let i = 0; i < 14; i++) {
      const { x, y } = inBand();
      const a = between(r, -60, 60), L = between(r, 7, 13);
      out.push(drop(`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><path d="M${f(-L / 2)} 0 Q0 ${f(-L * 0.45)} ${f(L / 2)} 0 Q0 ${f(-L * 0.18)} ${f(-L / 2)} 0 Z" fill="#FBF6EC"/><path d="M${f(-L / 2)} 0 Q0 ${f(-L * 0.45)} ${f(L / 2)} 0" fill="none" stroke="#B9824A" stroke-width=".9"/></g>`));
    }
  }
  if (has("pecan")) {
    const x = -20, y = -18;
    out.push(drop(`<g transform="translate(${x} ${y}) rotate(-6)"><ellipse rx="24" ry="10" fill="#7A4220"/><path d="M-22 0 L22 0" stroke="#4E2610" stroke-width="1.6"/>${Array.from({ length: 6 }, (_, k) => `<path d="M${-18 + k * 7} -8 Q${-15 + k * 7} 0 ${-18 + k * 7} 8" stroke="#4E2610" stroke-width="1.1" fill="none"/>`).join("")}<ellipse cx="-4" cy="-5" rx="14" ry="2.5" fill="#B87445" opacity=".6"/></g>`));
  }
  if (has("rose")) {
    for (let i = 0; i < 9; i++) {
      const { x, y } = inBand();
      const a = between(r, 0, 180), L = between(r, 6, 10);
      out.push(drop(`<path transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})" d="M0 0 C${f(L * 0.2)} ${f(-L * 0.5)} ${f(L)} ${f(-L * 0.45)} ${f(L)} 0 C${f(L * 0.9)} ${f(L * 0.35)} ${f(L * 0.25)} ${f(L * 0.4)} 0 0 Z" fill="${pick(r, ["#D9667E", "#B8445E", "#E78DA0"])}"/>`));
    }
  }
  return out.join("");
}

/** Demi-datte coupée, face de coupe visible : enrobage fin, chair translucide, garniture, insert. */
export function cutDate(sc: Scene, recipe: Recipe, o: DateOpts, seed = 1, mirror = false) {
  const r = rng(seed * 31 + recipe.number * 7);
  const P = recipe.palette;
  const T = `translate(${f(o.x)} ${f(o.y)}) rotate(${f(o.rot)}) scale(${f(o.s * (mirror ? -1 : 1))} ${f(o.s)})`;
  const rotEff = mirror ? 180 - o.rot : o.rot;
  const parts: string[] = [];
  if (o.shadow !== false) parts.push(castShadow(sc, HALF_D, T, o.s));

  // flanc de la demi-datte (épaisseur visible sous la face de coupe)
  const wallG = sc.id("wl");
  sc.def(`<linearGradient id="${wallG}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(P.coat, -0.2)}"/><stop offset="1" stop-color="${shade(P.coat, -0.55)}"/></linearGradient>`);
  const wall = `<path d="${HALF_D}" transform="translate(2 9)" fill="url(#${wallG})"/>`;

  const flesh = sc.id("fl");
  sc.def(`<radialGradient id="${flesh}" cx=".45" cy=".42" r=".7"><stop offset="0" stop-color="#8E4A20"/><stop offset=".7" stop-color="#6A3013"/><stop offset="1" stop-color="#43190A"/></radialGradient>`);
  const fleshLit = litFilter(sc, { pillow: 2.5, height: 2.5, noise: [0.09, 0.14], noiseAmt: 0.9, spec: 0.7, exp: 16, rot: rotEff, seed: seed + 4, elevation: 55, specElevation: 35 });
  const fillLit = litFilter(sc, { pillow: 2, height: 2, noise: [0.28, 0.28], noiseAmt: 0.8, spec: 0.35, exp: 12, rot: rotEff, seed: seed + 9, elevation: 58, specElevation: 34 });
  const insLit = litFilter(sc, { pillow: 4, height: 5, spec: 1.3, exp: 40, rot: rotEff, seed: seed + 2, elevation: 58, specElevation: 30 });
  const coatFace = sc.id("cfz");
  sc.def(`<linearGradient id="${coatFace}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(P.coat, P.coatLight, 0.4)}"/><stop offset="1" stop-color="${shade(P.coat, -0.2)}"/></linearGradient>`);

  // garniture : forme organique (pas une ellipse parfaite)
  const fillD = `M-84 4 C-86 -20 -62 -38 -20 -39 C30 -41 74 -33 83 -8 C90 14 66 34 18 36 C-34 38 -82 30 -84 4 Z`;
  const insD = `M-46 3 C-48 -9 -30 -17 -4 -16 C24 -17 46 -11 48 0 C49 12 30 16 2 16 C-26 17 -45 13 -46 3 Z`;
  const inclusions: string[] = [];
  const clipF = sc.id("cf");
  sc.def(`<clipPath id="${clipF}"><path d="${fillD}"/></clipPath>`);
  const inFill = () => {
    for (let i = 0; i < 20; i++) {
      const x = between(r, -80, 80), y = between(r, -34, 34);
      const ex = x / 84, ey = y / 37;
      if (ex * ex + ey * ey < 0.9 && !(Math.abs(x) < 44 && Math.abs(y) < 14)) return { x, y };
    }
    return { x: 50, y: 0 };
  };
  const ing = recipe.ingredients;
  const add = (n: number, mk: (x: number, y: number) => string) => {
    for (let i = 0; i < n; i++) {
      const { x, y } = inFill();
      inclusions.push(mk(x, y));
    }
  };
  if (ing.includes("sesame")) add(70, (x, y) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="1.9" ry="1" transform="rotate(${f(between(r, 0, 180))} ${f(x)} ${f(y)})" fill="#0E0C0C" opacity=".85"/>`);
  if (ing.includes("pistache")) add(30, (x, y) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(between(r, 1, 2.2))}" fill="${pick(r, ["#4E6A22", "#A8BE5A", "#8E5A6B"])}" opacity=".9"/>`);
  if (ing.includes("kadaif")) add(26, (x, y) => `<path d="M${f(x - 7)} ${f(y)} q7 ${f(between(r, -3, 3))} 14 0" stroke="${pick(r, ["#E8BD62", "#C9902F"])}" stroke-width=".9" fill="none"/>`);
  if (ing.includes("noisette") || ing.includes("pecan") || ing.includes("sarrasin")) add(30, (x, y) => `<path d="M${f(x)} ${f(y - 2)} l${f(between(r, 1.6, 3))} 2.6 l-3 1.3 Z" fill="${pick(r, ["#5A3418", "#A0703F", "#7B4A26"])}"/>`);
  if (ing.includes("framboise")) add(22, (x, y) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx=".8" ry=".55" fill="#F2D27A" opacity=".85"/>`);
  if (ing.includes("abricot")) add(10, (x, y) => `<rect x="${f(x)}" y="${f(y)}" width="4" height="3" rx="1" fill="#E58A2E"/>`);
  if (ing.includes("coco")) add(30, (x, y) => `<rect x="${f(x)}" y="${f(y)}" width="2.6" height="1.2" rx=".6" fill="#FFFDF6" opacity=".9"/>`);
  if (ing.includes("matcha") || ing.includes("pandan")) add(40, (x, y) => `<circle cx="${f(x)}" cy="${f(y)}" r=".6" fill="${shade(P.filling, -0.35)}" opacity=".6"/>`);
  if (ing.includes("safran")) add(10, (x, y) => `<path d="M${f(x)} ${f(y)} l4 1" stroke="#C4361C" stroke-width=".8"/>`);
  if (ing.includes("rose")) add(8, (x, y) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="2.2" ry="1.2" fill="#D9667E" opacity=".7"/>`);

  const gloss = sc.blur(2.2);
  const cutFace = `<g transform="${T}">${wall}
<path d="${HALF_D}" fill="url(#${coatFace})"/>
<path d="${scaled(HALF_D, 0.965, 0.93)}" fill="#2A1006"/>
<path d="${scaled(HALF_D, 0.95, 0.9)}" fill="url(#${flesh})" filter="url(#${fleshLit})"/>
<path d="${fillD}" fill="${P.filling}" filter="url(#${fillLit})"/>
<g clip-path="url(#${clipF})">${inclusions.join("")}</g>
<path d="${fillD}" fill="none" stroke="${shade(P.filling, -0.45)}" stroke-width="1.2" opacity=".45"/>
<path d="${insD}" fill="${P.insert}" filter="url(#${insLit})"/>
<path d="M-82 -26 C-50 -46 20 -50 76 -34" fill="none" stroke="#fff" stroke-width="2" opacity=".18" filter="url(#${gloss})"/>
</g>`;
  let g = cutFace;
  if (o.blur) {
    const b = sc.blur(o.blur);
    g = `<g filter="url(#${b})">${g}</g>`;
  }
  parts.push(g);
  return parts.join("");
}

// ---------- accessoires / ingrédients ----------
export function scatter(sc: Scene, recipe: Recipe, area: { x: number; y: number; w: number; h: number }, n: number, seed: number, scale = 3) {
  const r = rng(seed);
  const out: string[] = [];
  const blur = sc.blur(1.3);
  for (let i = 0; i < n; i++) {
    const x = area.x + r() * area.w, y = area.y + r() * area.h;
    const s = scale * between(r, 0.8, 1.25);
    const t = pick(r, recipe.toppings);
    const a = between(r, 0, 360);
    let shape = "";
    switch (t) {
      case "sesame-noir": shape = `<ellipse rx="3.3" ry="1.75" fill="#141111"/>`; break;
      case "zeste": shape = `<path d="M-5 0 Q0 2.5 5 0" stroke="#D9B02A" stroke-width="1.3" fill="none" stroke-linecap="round"/>`; break;
      case "matcha": shape = `<circle r="1.1" fill="#7E9C3A"/>`; break;
      case "safran": shape = `<path d="M-6 0 Q0 2 6 0" stroke="#C4361C" stroke-width="1.5" fill="none" stroke-linecap="round"/>`; break;
      case "amande": shape = `<rect x="-7" y="-2.2" width="14" height="4.4" rx="2" fill="#F3E9D6"/>`; break;
      case "pistache": shape = `<polygon points="-2,-2 2.5,-1.5 2,2 -2.5,1.8" fill="${pick(r, ["#7FA03A", "#A8BE5A", "#8E5A6B"])}"/>`; break;
      case "kadaif": shape = `<path d="M-14 0 C-5 6 5 -6 14 0" stroke="#E8BD62" stroke-width="1" fill="none"/>`; break;
      case "cafe": shape = `<g><ellipse rx="9" ry="6.4" fill="#3F2416"/><path d="M-7.5 -.5 C-3 2.5 3 -2.5 7.5 .5" stroke="#1C0F08" stroke-width="1.3" fill="none"/></g>`; break;
      case "cardamome": shape = `<ellipse rx="6.5" ry="3.6" fill="#8DA05A"/>`; break;
      case "framboise": shape = `<path d="M-3 0 Q-3 -3 0 -3 Q3.6 -2.4 3 1 Q0 3.6 -3 0 Z" fill="#C8264A"/>`; break;
      case "hibiscus": shape = `<path d="M0 0 C3 -4 8 -3.5 10 0 C8 3.3 3 3.5 0 0 Z" fill="#8E1531"/>`; break;
      case "sarrasin": shape = `<path d="M0 -2.4 L2.2 1.8 L-2.2 1.8 Z" fill="#9C6B3C"/>`; break;
      case "sel": shape = `<polygon points="-2.5,-1 1,-2.6 2.6,1 -1,2.4" fill="#fff" opacity=".9"/>`; break;
      case "coco": shape = `<path d="M-6 0 Q0 -5 6 0 Q0 -2 -6 0 Z" fill="#FBF6EC" stroke="#B9824A" stroke-width=".8"/>`; break;
      case "pecan": shape = `<ellipse rx="12" ry="5" fill="#7A4220"/>`; break;
      case "rose": shape = `<path d="M0 0 C2 -5 8 -4.5 8 0 C7 3 2 3.2 0 0 Z" fill="#D9667E"/>`; break;
    }
    const sh = shape.replace(/fill="[^"]+"/g, 'fill="#1a0f08"').replace(/stroke="[^"]+"/g, 'stroke="#1a0f08"');
    out.push(`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)}) scale(${f(s)})"><g transform="translate(1.5 2)" opacity=".35" filter="url(#${blur})">${sh}</g>${shape}</g>`);
  }
  return out.join("");
}

/** Bol en céramique vu de dessus, avec un contenu (poudre, pâte, graines…) */
export function bowl(sc: Scene, x: number, y: number, R: number, content: { color: string; type: "poudre" | "pate" | "liquide" | "graines" | "fils"; accent?: string }, seed: number, ceramic = "#F4EFE6") {
  const r = rng(seed);
  const sh = castShadow(sc, `M${-R} 0 A${R} ${R} 0 1 0 ${R} 0 A${R} ${R} 0 1 0 ${-R} 0 Z`, `translate(${f(x)} ${f(y)})`, R / 100, { contact: 0.35 });
  const cg = sc.id("ce");
  sc.def(`<radialGradient id="${cg}" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="${shade(ceramic, 0.4)}"/><stop offset=".7" stop-color="${ceramic}"/><stop offset="1" stop-color="${shade(ceramic, -0.18)}"/></radialGradient>`);
  const inner = sc.id("in");
  sc.def(`<radialGradient id="${inner}" cx=".62" cy=".65" r=".75"><stop offset="0" stop-color="${shade(ceramic, 0.2)}"/><stop offset="1" stop-color="${shade(ceramic, -0.25)}"/></radialGradient>`);
  const ctG = sc.id("ct");
  sc.def(`<radialGradient id="${ctG}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="${shade(content.color, 0.22)}"/><stop offset=".75" stop-color="${content.color}"/><stop offset="1" stop-color="${shade(content.color, -0.3)}"/></radialGradient>`);
  const cr = R * 0.7;
  const grain = grainFilter(sc, seed, shade(content.color, -0.45), content.type === "poudre" ? 1 : 0.5, content.type === "poudre" ? 0.9 : 0.25);
  let extra = "";
  if (content.type === "graines" || content.type === "fils") {
    const items: string[] = [];
    for (let i = 0; i < (content.type === "fils" ? 70 : 140); i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * cr * 0.92;
      const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
      if (content.type === "fils") {
        const L = between(r, 18, 34) * (R / 120);
        items.push(`<path d="M${f(px - L / 2)} ${f(py)} q${f(L / 2)} ${f(between(r, -8, 8))} ${f(L)} 0" transform="rotate(${f(between(r, 0, 180))} ${f(px)} ${f(py)})" stroke="${pick(r, [content.color, content.accent ?? content.color, shade(content.color, 0.25)])}" stroke-width="${f(R / 90)}" fill="none" stroke-linecap="round"/>`);
      } else {
        items.push(`<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(R / 32)}" ry="${f(R / 60)}" transform="rotate(${f(between(r, 0, 180))} ${f(px)} ${f(py)})" fill="${pick(r, [content.color, content.accent ?? content.color, shade(content.color, -0.2)])}"/>`);
      }
    }
    extra = items.join("");
  }
  const hi = sc.blur(R / 30);
  return `${sh}<circle cx="${f(x)}" cy="${f(y)}" r="${f(R)}" fill="url(#${cg})"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(R * 0.84)}" fill="url(#${inner})"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(cr)}" fill="url(#${ctG})" filter="url(#${grain})"/>${extra}${content.type === "liquide" ? `<ellipse cx="${f(x - cr * 0.3)}" cy="${f(y - cr * 0.35)}" rx="${f(cr * 0.35)}" ry="${f(cr * 0.12)}" fill="#fff" opacity=".35" filter="url(#${hi})"/>` : ""}<path d="M${f(x - R * 0.8)} ${f(y - R * 0.35)} A${f(R * 0.88)} ${f(R * 0.88)} 0 0 1 ${f(x + R * 0.1)} ${f(y - R * 0.86)}" stroke="#fff" stroke-width="${f(R / 22)}" fill="none" opacity=".5" filter="url(#${hi})"/>`;
}

/** Demi-agrume (yuzu) vu de dessus */
export function citrusHalf(sc: Scene, x: number, y: number, R: number, seed: number, rind = "#E7C43A", flesh = "#F4DC6A") {
  const r = rng(seed);
  const sh = castShadow(sc, `M${-R} 0 A${R} ${R} 0 1 0 ${R} 0 A${R} ${R} 0 1 0 ${-R} 0 Z`, `translate(${f(x)} ${f(y)})`, R / 100);
  const segs: string[] = [];
  const n = 10;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 + 0.06, a1 = ((i + 1) / n) * Math.PI * 2 - 0.06;
    const rr = R * 0.8;
    segs.push(`<path d="M${f(x + Math.cos(a0) * R * 0.1)} ${f(y + Math.sin(a0) * R * 0.1)} L${f(x + Math.cos(a0) * rr)} ${f(y + Math.sin(a0) * rr)} A${f(rr)} ${f(rr)} 0 0 1 ${f(x + Math.cos(a1) * rr)} ${f(y + Math.sin(a1) * rr)} Z" fill="${flesh}" opacity="${f(between(r, 0.85, 1))}"/>`);
  }
  const grain = grainFilter(sc, seed, "#C9A21E", 0.7, 0.5);
  const g = sc.id("rg");
  sc.def(`<radialGradient id="${g}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="${shade(rind, 0.25)}"/><stop offset="1" stop-color="${shade(rind, -0.2)}"/></radialGradient>`);
  return `${sh}<circle cx="${f(x)}" cy="${f(y)}" r="${f(R)}" fill="url(#${g})"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(R * 0.86)}" fill="#FBF3D3"/><g filter="url(#${grain})">${segs.join("")}</g><circle cx="${f(x)}" cy="${f(y)}" r="${f(R * 0.08)}" fill="#FBF3D3"/>`;
}

/** Petits fruits ronds (framboises, litchis…) */
export function berry(sc: Scene, x: number, y: number, R: number, seed: number, color = "#C8264A", drupelets = true) {
  const r = rng(seed);
  const sh = castShadow(sc, `M${-R} 0 A${R} ${R} 0 1 0 ${R} 0 A${R} ${R} 0 1 0 ${-R} 0 Z`, `translate(${f(x)} ${f(y)})`, R / 60);
  const g = sc.id("be");
  sc.def(`<radialGradient id="${g}" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="${shade(color, 0.35)}"/><stop offset=".7" stop-color="${color}"/><stop offset="1" stop-color="${shade(color, -0.4)}"/></radialGradient>`);
  const dots: string[] = [];
  if (drupelets) {
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R * 0.85;
      const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
      dots.push(`<circle cx="${f(px)}" cy="${f(py)}" r="${f(R * 0.2)}" fill="url(#${g})"/><circle cx="${f(px - R * 0.06)}" cy="${f(py - R * 0.07)}" r="${f(R * 0.05)}" fill="#fff" opacity=".55"/>`);
    }
  }
  return `${sh}<circle cx="${f(x)}" cy="${f(y)}" r="${f(R)}" fill="url(#${g})"/>${dots.join("")}`;
}

/** Fruit à coque ou graine générique (amande, pistache, noisette, pécan, grain de café, cardamome) */
export function nut(sc: Scene, kind: "amande" | "pistache" | "noisette" | "pecan" | "cafe" | "cardamome" | "abricot" | "litchi", x: number, y: number, s: number, rot: number, seed: number) {
  const T = `translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})`;
  const shapes: Record<string, { d: string; body: string }> = {
    amande: { d: "M-16 0 C-14 -9 6 -11 18 0 C6 11 -14 9 -16 0 Z", body: `<path d="M-16 0 C-14 -9 6 -11 18 0 C6 11 -14 9 -16 0 Z" fill="#B97A48"/><path d="M-12 -2 C-6 -6 6 -6 14 -1" stroke="#8A5530" stroke-width="1" fill="none"/><path d="M-10 -4 C-2 -8 8 -6 13 -3" stroke="#E2B489" stroke-width="1.4" fill="none" opacity=".6"/>` },
    pistache: { d: "M-14 0 C-12 -8 10 -9 15 0 C10 9 -12 8 -14 0 Z", body: `<path d="M-14 0 C-12 -8 10 -9 15 0 C10 9 -12 8 -14 0 Z" fill="#D8C6A4"/><path d="M-9 0 C-7 -5 8 -6 11 0 C8 5 -7 5 -9 0 Z" fill="#7FA03A"/><path d="M-6 -2 C-2 -4 4 -4 8 -2" stroke="#B9C66A" stroke-width="1.2" fill="none"/><path d="M-9 1 C-4 4 6 4 10 1" stroke="#8E5A6B" stroke-width="1.2" fill="none" opacity=".7"/>` },
    noisette: { d: "M-12 0 A12 12 0 1 0 12 0 A12 12 0 1 0 -12 0 Z", body: `<circle r="12" fill="#9B6234"/><path d="M-12 -2 C-8 -12 8 -12 12 -2 C6 -6 -6 -6 -12 -2 Z" fill="#D2B48A"/><ellipse cx="-4" cy="2" rx="5" ry="3" fill="#C08A55" opacity=".6"/>` },
    pecan: { d: "M-20 0 C-18 -9 18 -9 20 0 C18 9 -18 9 -20 0 Z", body: `<path d="M-20 0 C-18 -9 18 -9 20 0 C18 9 -18 9 -20 0 Z" fill="#7A4220"/><path d="M-19 0 L19 0" stroke="#4E2610" stroke-width="1.5"/>${Array.from({ length: 6 }, (_, k) => `<path d="M${-15 + k * 6} -7 Q${-12 + k * 6} 0 ${-15 + k * 6} 7" stroke="#4E2610" stroke-width="1" fill="none"/>`).join("")}<ellipse cx="-3" cy="-4" rx="11" ry="2" fill="#B87445" opacity=".6"/>` },
    cafe: { d: "M-9 0 A9 6.4 0 1 0 9 0 A9 6.4 0 1 0 -9 0 Z", body: `<ellipse rx="9" ry="6.4" fill="#3F2416"/><path d="M-7.5 -.5 C-3 2.5 3 -2.5 7.5 .5" stroke="#1C0F08" stroke-width="1.3" fill="none"/><ellipse cx="-2.5" cy="-3.2" rx="4" ry="1.4" fill="#8A5A3A" opacity=".55"/>` },
    cardamome: { d: "M-8 0 A8 4.4 0 1 0 8 0 A8 4.4 0 1 0 -8 0 Z", body: `<ellipse rx="8" ry="4.4" fill="#8DA05A"/><path d="M-6 -1 Q0 -3 6 -1 M-6 1.4 Q0 3 6 1.4" stroke="#6B7E3E" stroke-width=".7" fill="none"/><ellipse cx="-2" cy="-2" rx="3.5" ry="1" fill="#C4D08E" opacity=".6"/>` },
    abricot: { d: "M-14 0 A14 13 0 1 0 14 0 A14 13 0 1 0 -14 0 Z", body: `<ellipse rx="14" ry="13" fill="#E58A2E"/><ellipse rx="11" ry="10" fill="#F0A048"/><path d="M0 -12 Q2 0 0 12" stroke="#C8701E" stroke-width="1" fill="none" opacity=".6"/><ellipse cx="-5" cy="-5" rx="5" ry="3" fill="#FFD08A" opacity=".55"/>` },
    litchi: { d: "M-12 0 A12 12 0 1 0 12 0 A12 12 0 1 0 -12 0 Z", body: `<circle r="12" fill="#F5EFE6"/><circle r="12" fill="none" stroke="#E7D9C9" stroke-width="1.5"/><ellipse cx="-4" cy="-4" rx="5" ry="3" fill="#fff" opacity=".9"/><path d="M12 0 A12 12 0 0 1 -6 10.4 L 0 0 Z" fill="#C64B5A"/>` },
  };
  const k = shapes[kind];
  return castShadow(sc, k.d, T, s / 8) + `<g transform="${T}">${k.body}</g>`;
}

/** Pétale ou feuille posé à plat */
export function leaf(sc: Scene, x: number, y: number, L: number, w: number, rot: number, color: string, seed: number, vein = true) {
  const d = `M0 0 C${f(L * 0.25)} ${f(-w)} ${f(L * 0.75)} ${f(-w)} ${f(L)} 0 C${f(L * 0.75)} ${f(w)} ${f(L * 0.25)} ${f(w)} 0 0 Z`;
  const T = `translate(${f(x)} ${f(y)}) rotate(${f(rot)})`;
  const g = sc.id("lf");
  sc.def(`<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(color, 0.25)}"/><stop offset="1" stop-color="${shade(color, -0.25)}"/></linearGradient>`);
  return castShadow(sc, d, T, L / 600) + `<g transform="${T}"><path d="${d}" fill="url(#${g})"/>${vein ? `<path d="M${f(L * 0.04)} 0 L${f(L * 0.96)} 0" stroke="${shade(color, 0.35)}" stroke-width="${f(Math.max(0.8, w / 14))}" opacity=".6"/>` : ""}</g>`;
}

// ---------- coffrets ----------
export interface BoxOpts {
  x: number;
  y: number;
  cols: number;
  rows: number;
  cell: number; // taille d'un calage (px)
  rot?: number;
  color?: string; // carton
  open?: boolean;
  recipes?: Recipe[];
  tissue?: boolean;
  seed?: number;
}

export function monogramMark(color: string, h: number, x: number, y: number, opacity = 1) {
  const s = h / 160;
  const id = `mm${Math.round(x)}_${Math.round(y)}_${Math.round(h)}`;
  return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="160"><rect width="100" height="160" fill="#fff"/><path d="${MONO_TRAVERSE}" fill="#000"/><path d="${MONO_GROOVE}" fill="#000"/></mask></defs><g transform="translate(${f(x - 50 * s)} ${f(y - 80 * s)}) scale(${f(s)})" opacity="${opacity}"><path d="${PIT_PATH}" fill="${color}" mask="url(#${id})"/></g>`;
}

export function logotypeMark(color: string, width: number, x: number, y: number, opacity = 1) {
  const [vx, vy, vw, vh] = LOGOTYPE.viewBox.split(" ").map(Number);
  const s = width / vw;
  return `<g transform="translate(${f(x - width / 2 - vx * s)} ${f(y - (vh * s) / 2 - vy * s)}) scale(${f(s)})" fill="${color}" opacity="${opacity}"><path d="${LOGOTYPE.d}"/><path transform="${LOGOTYPE.accent}" d="${LOGOTYPE.accentD}"/></g>`;
}

/** Coffret ouvert vu de dessus avec dattes dans leurs calages */
export function openBox(sc: Scene, o: BoxOpts) {
  const r = rng(o.seed ?? 3);
  const pad = o.cell * 0.32;
  const W = o.cols * o.cell + pad * 2, H = o.rows * o.cell * 0.62 + pad * 2;
  const color = o.color ?? "#2A1E1A";
  const T = `translate(${f(o.x)} ${f(o.y)}) rotate(${f(o.rot ?? 0)})`;
  const boxD = `M${f(-W / 2)} ${f(-H / 2)} H${f(W / 2)} V${f(H / 2)} H${f(-W / 2)} Z`;
  const out: string[] = [castShadow(sc, boxD, T, W / 900, { soft: 1.4 })];
  const g = sc.id("bx");
  sc.def(`<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(color, 0.12)}"/><stop offset="1" stop-color="${shade(color, -0.25)}"/></linearGradient>`);
  const inner = sc.id("bi");
  sc.def(`<linearGradient id="${inner}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(color, -0.35)}"/><stop offset=".08" stop-color="${shade(color, 0.05)}"/><stop offset="1" stop-color="${color}"/></linearGradient>`);
  const cells: string[] = [];
  const cw = o.cell, ch = o.cell * 0.62;
  const cellG = sc.id("cl");
  sc.def(`<radialGradient id="${cellG}" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="${shade(color, -0.45)}"/><stop offset="1" stop-color="${shade(color, -0.15)}"/></radialGradient>`);
  const list = o.recipes ?? [];
  let k = 0;
  for (let j = 0; j < o.rows; j++) {
    for (let i = 0; i < o.cols; i++) {
      const cx = -W / 2 + pad + cw * (i + 0.5), cy = -H / 2 + pad + ch * (j + 0.5);
      cells.push(`<rect x="${f(cx - cw * 0.46)}" y="${f(cy - ch * 0.44)}" width="${f(cw * 0.92)}" height="${f(ch * 0.88)}" rx="${f(ch * 0.4)}" fill="url(#${cellG})"/>`);
      const rec = list.length ? list[k % list.length] : undefined;
      if (rec) cells.push(wholeDate(sc, rec, { x: cx, y: cy, s: (cw * 0.82) / 200, rot: between(r, -4, 4) + (j % 2 ? 180 : 0), shadow: true }, k + 1));
      k++;
    }
  }
  let tissue = "";
  if (o.tissue) {
    const tg = sc.id("ts");
    sc.def(`<linearGradient id="${tg}" x1="0" y1="0" x2="1" y2=".3"><stop offset="0" stop-color="#FFFCF7" stop-opacity=".95"/><stop offset=".5" stop-color="#F1E9DD" stop-opacity=".9"/><stop offset="1" stop-color="#FFFCF7" stop-opacity=".85"/></linearGradient>`);
    tissue = `<path d="M${f(-W / 2 - 40)} ${f(H / 2 - 30)} C${f(-W / 4)} ${f(H / 2 + 20)} ${f(W / 6)} ${f(H / 2 - 10)} ${f(W / 2 + 60)} ${f(H / 2 + 40)} L${f(W / 2 + 80)} ${f(H / 2 + 160)} L${f(-W / 2 - 60)} ${f(H / 2 + 140)} Z" fill="url(#${tg})"/><path d="M${f(-W / 2 - 40)} ${f(H / 2 - 30)} C${f(-W / 4)} ${f(H / 2 + 20)} ${f(W / 6)} ${f(H / 2 - 10)} ${f(W / 2 + 60)} ${f(H / 2 + 40)}" fill="none" stroke="#D8CBB8" stroke-width="2"/>`;
  }
  out.push(`<g transform="${T}"><rect x="${f(-W / 2)}" y="${f(-H / 2)}" width="${f(W)}" height="${f(H)}" fill="url(#${g})"/><rect x="${f(-W / 2 + pad * 0.35)}" y="${f(-H / 2 + pad * 0.35)}" width="${f(W - pad * 0.7)}" height="${f(H - pad * 0.7)}" fill="url(#${inner})"/><rect x="${f(-W / 2 + pad * 0.35)}" y="${f(-H / 2 + pad * 0.35)}" width="${f(W - pad * 0.7)}" height="${f(H - pad * 0.7)}" fill="none" stroke="#A87455" stroke-width="${f(Math.max(1.2, W / 600))}" opacity=".6"/>${cells.join("")}${tissue}</g>`);
  return { svg: out.join(""), W, H };
}

/** Couvercle (boîte fermée) vu de dessus, monogramme en relief + logotype marqué à chaud */
export function lid(sc: Scene, x: number, y: number, W: number, H: number, rot: number, opts: { color?: string; foil?: string; ribbon?: string | null; card?: boolean; numbered?: string } = {}) {
  const color = opts.color ?? "#2A1E1A";
  const foil = opts.foil ?? "#B88866";
  const T = `translate(${f(x)} ${f(y)}) rotate(${f(rot)})`;
  const d = `M${f(-W / 2)} ${f(-H / 2)} H${f(W / 2)} V${f(H / 2)} H${f(-W / 2)} Z`;
  const g = sc.id("ld");
  sc.def(`<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(color, 0.14)}"/><stop offset=".55" stop-color="${color}"/><stop offset="1" stop-color="${shade(color, -0.28)}"/></linearGradient>`);
  const paper = grainFilter(sc, Math.round(W), luminance(color) > 0.5 ? shade(color, -0.2) : "#000000", 0.4, 0.7);
  const foilG = sc.id("fo");
  sc.def(`<linearGradient id="${foilG}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(foil, 0.35)}"/><stop offset=".45" stop-color="${foil}"/><stop offset=".6" stop-color="${shade(foil, 0.25)}"/><stop offset="1" stop-color="${shade(foil, -0.25)}"/></linearGradient>`);
  const emb = sc.blur(Math.max(0.8, H / 500));
  const mh = Math.min(W, H) * 0.32;
  // relief : ombre portée claire en haut à gauche et sombre en bas à droite
  const mono = `<g transform="translate(-${f(mh / 160)} -${f(mh / 160)})" filter="url(#${emb})">${monogramMark(shade(color, 0.3), mh, 0, -H * 0.06, 0.6)}</g><g transform="translate(${f(mh / 120)} ${f(mh / 120)})" filter="url(#${emb})">${monogramMark(shade(color, -0.5), mh, 0, -H * 0.06, 0.7)}</g>${monogramMark(shade(color, 0.02), mh, 0, -H * 0.06)}`;
  const logo = `<g fill="url(#${foilG})">${logotypeMark(`url(#${foilG})`, W * 0.34, 0, H * 0.22)}</g>`;
  let ribbon = "";
  if (opts.ribbon) {
    const rg = sc.id("rb");
    sc.def(`<linearGradient id="${rg}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(opts.ribbon, -0.2)}"/><stop offset=".5" stop-color="${shade(opts.ribbon, 0.2)}"/><stop offset="1" stop-color="${shade(opts.ribbon, -0.2)}"/></linearGradient>`);
    const rw = W * 0.05;
    ribbon = `<rect x="${f(W * 0.3)}" y="${f(-H / 2)}" width="${f(rw)}" height="${f(H)}" fill="url(#${rg})"/>`;
  }
  let num = "";
  if (opts.numbered) {
    num = `<rect x="${f(-W * 0.42)}" y="${f(H * 0.33)}" width="${f(W * 0.14)}" height="${f(H * 0.07)}" fill="none" stroke="${foil}" stroke-width="${f(W / 700)}" opacity=".8"/>`;
  }
  return castShadow(sc, d, T, W / 700, { soft: 1.3 }) + `<g transform="${T}"><path d="${d}" fill="url(#${g})" filter="url(#${paper})"/><rect x="${f(-W / 2 + W * 0.025)}" y="${f(-H / 2 + W * 0.025)}" width="${f(W * 0.95)}" height="${f(H - W * 0.05)}" fill="none" stroke="${foil}" stroke-width="${f(Math.max(1, W / 900))}" opacity=".45"/>${mono}${logo}${ribbon}${num}<path d="${d}" fill="none" stroke="${shade(color, -0.4)}" stroke-width="${f(W / 500)}"/></g>`;
}

/** Boîte fermée en perspective 3/4 (face + dessus + côté) */
export function box3d(sc: Scene, x: number, y: number, w: number, d: number, h: number, opts: { color?: string; foil?: string; ribbon?: string | null; label?: boolean } = {}) {
  const color = opts.color ?? "#2A1E1A";
  const foil = opts.foil ?? "#B88866";
  // projection oblique : dessus en parallélogramme
  const k = 0.5; // profondeur
  const dx = d * k * 0.9, dy = -d * k * 0.55;
  const top = `M${f(x)} ${f(y)} L${f(x + w)} ${f(y)} L${f(x + w + dx)} ${f(y + dy)} L${f(x + dx)} ${f(y + dy)} Z`;
  const front = `M${f(x)} ${f(y)} L${f(x + w)} ${f(y)} L${f(x + w)} ${f(y + h)} L${f(x)} ${f(y + h)} Z`;
  const side = `M${f(x + w)} ${f(y)} L${f(x + w + dx)} ${f(y + dy)} L${f(x + w + dx)} ${f(y + dy + h)} L${f(x + w)} ${f(y + h)} Z`;
  const shadowD = `M${f(x)} ${f(y + h)} L${f(x + w)} ${f(y + h)} L${f(x + w + dx)} ${f(y + h + dy)} L${f(x + dx)} ${f(y + h + dy)} Z`;
  const sb = sc.blur(w / 40);
  const tg = sc.id("tp");
  sc.def(`<linearGradient id="${tg}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${shade(color, 0.22)}"/><stop offset="1" stop-color="${shade(color, 0.05)}"/></linearGradient>`);
  const fg = sc.id("fr");
  sc.def(`<linearGradient id="${fg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${shade(color, -0.2)}"/></linearGradient>`);
  const lidLine = h * 0.32;
  let ribbon = "";
  if (opts.ribbon) {
    const rw = w * 0.045, rx = x + w * 0.66;
    ribbon = `<path d="M${f(rx)} ${f(y)} L${f(rx + rw)} ${f(y)} L${f(rx + rw)} ${f(y + h)} L${f(rx)} ${f(y + h)} Z" fill="${opts.ribbon}"/><path d="M${f(rx)} ${f(y)} L${f(rx + rw)} ${f(y)} L${f(rx + rw + dx)} ${f(y + dy)} L${f(rx + dx)} ${f(y + dy)} Z" fill="${shade(opts.ribbon, 0.2)}"/>`;
  }
  const mono = monogramMark(shade(color, 0.12), Math.min(-dy * 0.7, w * 0.16), x + w * 0.3 + dx / 2, y + dy / 2, 0.9);
  const logo = opts.label !== false ? logotypeMark(foil, w * 0.3, x + w * 0.5, y + lidLine * 0.5, 0.95) : "";
  return `<path d="${shadowD}" transform="translate(${f(w * 0.05)} ${f(h * 0.05)})" fill="#120a06" opacity=".45" filter="url(#${sb})"/><path d="${front}" fill="url(#${fg})"/><path d="${side}" fill="${shade(color, -0.32)}"/><path d="${top}" fill="url(#${tg})"/><path d="M${f(x)} ${f(y + lidLine)} L${f(x + w)} ${f(y + lidLine)} L${f(x + w + dx)} ${f(y + lidLine + dy)}" fill="none" stroke="${shade(color, -0.45)}" stroke-width="${f(w / 400)}"/>${ribbon}${mono}${logo}<path d="${top}" fill="none" stroke="${shade(color, 0.3)}" stroke-width="${f(w / 700)}" opacity=".6"/>`;
}

/** Tasse de café vue de dessus, avec soucoupe */
export function coffeeCup(sc: Scene, x: number, y: number, R: number, seed: number, ceramic = "#F4EFE6") {
  const sh = castShadow(sc, `M${-R * 1.45} 0 A${R * 1.45} ${R * 1.45} 0 1 0 ${R * 1.45} 0 A${R * 1.45} ${R * 1.45} 0 1 0 ${-R * 1.45} 0 Z`, `translate(${f(x)} ${f(y)})`, R / 100);
  const sg = sc.id("sa");
  sc.def(`<radialGradient id="${sg}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="${shade(ceramic, 0.4)}"/><stop offset="1" stop-color="${shade(ceramic, -0.15)}"/></radialGradient>`);
  const crema = sc.id("cr");
  sc.def(`<radialGradient id="${crema}" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#C9945A"/><stop offset=".55" stop-color="#9A5F2E"/><stop offset=".9" stop-color="#5A3214"/><stop offset="1" stop-color="#2E180A"/></radialGradient>`);
  const tiger = grainFilter(sc, seed, "#6A3A16", 0.9, 0.12);
  const cupSh = sc.blur(R / 10);
  return `${sh}<circle cx="${f(x)}" cy="${f(y)}" r="${f(R * 1.45)}" fill="url(#${sg})"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(R * 1.08)}" fill="${shade(ceramic, -0.12)}" opacity=".6"/><circle cx="${f(x + R * 0.08)}" cy="${f(y + R * 0.1)}" r="${f(R * 1.02)}" fill="#1a0f08" opacity=".35" filter="url(#${cupSh})"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(R)}" fill="${ceramic}"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(R * 0.82)}" fill="url(#${crema})" filter="url(#${tiger})"/><path d="M${f(x + R)} ${f(y - R * 0.12)} h${f(R * 0.42)} a${f(R * 0.12)} ${f(R * 0.12)} 0 0 1 0 ${f(R * 0.24)} h-${f(R * 0.42)}" fill="${ceramic}"/><ellipse cx="${f(x - R * 0.3)}" cy="${f(y - R * 0.3)}" rx="${f(R * 0.22)}" ry="${f(R * 0.08)}" fill="#fff" opacity=".35" transform="rotate(-30 ${f(x - R * 0.3)} ${f(y - R * 0.3)})"/>`;
}

/** Assiette / plat en céramique */
export function plate(sc: Scene, x: number, y: number, R: number, ceramic = "#F6F1E8", rim = true) {
  const sh = castShadow(sc, `M${-R} 0 A${R} ${R} 0 1 0 ${R} 0 A${R} ${R} 0 1 0 ${-R} 0 Z`, `translate(${f(x)} ${f(y)})`, R / 160);
  const g = sc.id("pl");
  sc.def(`<radialGradient id="${g}" cx=".4" cy=".35" r=".85"><stop offset="0" stop-color="${shade(ceramic, 0.5)}"/><stop offset=".8" stop-color="${ceramic}"/><stop offset="1" stop-color="${shade(ceramic, -0.15)}"/></radialGradient>`);
  return `${sh}<circle cx="${f(x)}" cy="${f(y)}" r="${f(R)}" fill="url(#${g})"/>${rim ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(R * 0.78)}" fill="none" stroke="${shade(ceramic, -0.1)}" stroke-width="${f(R / 60)}"/>` : ""}`;
}

/** Carte de dégustation / carte personnelle (sans texte lisible : traits figurant le texte) */
export function card(sc: Scene, x: number, y: number, W: number, H: number, rot: number, opts: { color?: string; ink?: string; mono?: boolean; lines?: number } = {}) {
  const color = opts.color ?? "#FBF7F0", ink = opts.ink ?? "#7A6152";
  const T = `translate(${f(x)} ${f(y)}) rotate(${f(rot)})`;
  const d = `M${f(-W / 2)} ${f(-H / 2)} H${f(W / 2)} V${f(H / 2)} H${f(-W / 2)} Z`;
  const lines: string[] = [];
  const n = opts.lines ?? 5;
  for (let i = 0; i < n; i++) {
    const lw = W * (i === 0 ? 0.36 : 0.6 - (i % 3) * 0.08);
    lines.push(`<rect x="${f(-lw / 2)}" y="${f(-H * 0.02 + i * H * 0.075)}" width="${f(lw)}" height="${f(Math.max(1.5, H * 0.012))}" rx="1" fill="${ink}" opacity="${i === 0 ? 0.75 : 0.35}"/>`);
  }
  const grain = grainFilter(sc, Math.round(W + H), "#C9BBA6", 0.35, 0.8);
  return castShadow(sc, d, T, W / 900) + `<g transform="${T}"><path d="${d}" fill="${color}" filter="url(#${grain})"/>${opts.mono !== false ? monogramMark("#A87455", H * 0.14, 0, -H * 0.24) : ""}${lines.join("")}</g>`;
}

/** Ruban posé (courbe) */
export function ribbonCurve(sc: Scene, d: string, color: string, width: number) {
  const g = sc.blur(width / 3);
  return `<path d="${d}" fill="none" stroke="#120a06" stroke-width="${f(width)}" opacity=".3" transform="translate(${f(width * 0.3)} ${f(width * 0.5)})" filter="url(#${g})"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${f(width)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${shade(color, 0.35)}" stroke-width="${f(width * 0.25)}" opacity=".6" transform="translate(${f(-width * 0.15)} ${f(-width * 0.15)})"/>`;
}

/** Verre (thé, eau) vu de dessus */
export function glass(sc: Scene, x: number, y: number, R: number, tint = "#D9A05A") {
  const g = sc.id("gl");
  sc.def(`<radialGradient id="${g}" cx=".45" cy=".45" r=".6"><stop offset="0" stop-color="${tint}" stop-opacity=".75"/><stop offset=".85" stop-color="${shade(tint, -0.3)}" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity=".6"/></radialGradient>`);
  const b = sc.blur(R / 12);
  return `<circle cx="${f(x + R * 0.25)}" cy="${f(y + R * 0.3)}" r="${f(R * 1.02)}" fill="${tint}" opacity=".25" filter="url(#${b})"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(R)}" fill="url(#${g})"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(R)}" fill="none" stroke="#fff" stroke-width="${f(R / 14)}" opacity=".7"/><path d="M${f(x - R * 0.7)} ${f(y - R * 0.3)} A${f(R * 0.8)} ${f(R * 0.8)} 0 0 1 ${f(x)} ${f(y - R * 0.78)}" stroke="#fff" stroke-width="${f(R / 10)}" fill="none" opacity=".7" filter="url(#${b})"/>`;
}

/** Couches séparées d'une datte (vue éclatée) : datte nue, garniture, coque de chocolat, finition. */
export function dateLayer(sc: Scene, recipe: Recipe, o: DateOpts, layer: "datte" | "garniture" | "chocolat" | "finition", seed = 1) {
  const r = rng(seed * 97 + recipe.number * 13);
  const P = recipe.palette;
  const T = `translate(${f(o.x)} ${f(o.y)}) rotate(${f(o.rot)}) scale(${f(o.s)})`;
  if (layer === "datte") {
    const skinG = sc.id("sgr");
    sc.def(`<linearGradient id="${skinG}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6A3016"/><stop offset=".55" stop-color="#4A200D"/><stop offset="1" stop-color="#2E1206"/></linearGradient>`);
    const skinLit = litFilter(sc, { pillow: 16, height: 22, noise: [0.04, 0.06], noiseAmt: 0.3, spec: 0.35, exp: 16, rot: o.rot, seed: seed + 5, specElevation: 30 });
    // fente longitudinale où loge la garniture
    const slit = `M-70 -4 C-40 -14 40 -14 74 -6 C40 2 -40 4 -70 -4 Z`;
    return castShadow(sc, DATE_D, T, o.s) + `<g transform="${T}"><path d="${DATE_D}" fill="url(#${skinG})" filter="url(#${skinLit})"/><path d="${slit}" fill="#1E0B04" opacity=".85"/></g>`;
  }
  if (layer === "garniture") {
    const lit = litFilter(sc, { pillow: 8, height: 16, noise: [0.2, 0.2], noiseAmt: 0.25, spec: 0.5, exp: 18, rot: o.rot, seed: seed + 9, specElevation: 32 });
    const blob = `M-74 -4 C-72 -26 -30 -34 4 -33 C44 -32 80 -22 80 -4 C80 14 44 22 2 22 C-36 22 -76 16 -74 -4 Z`;
    const ins: string[] = [];
    for (let i = 0; i < 40; i++) ins.push(`<path d="M${f(between(r, -60, 60))} ${f(between(r, -22, 12))} q6 ${f(between(r, -3, 3))} 12 0" stroke="${pick(r, ["#E8BD62", "#C9902F"])}" stroke-width="1" fill="none"/>`);
    return castShadow(sc, blob, T, o.s, { contact: 0.3 }) + `<g transform="${T}"><path d="${blob}" fill="${P.filling}" filter="url(#${lit})"/>${ins.join("")}</g>`;
  }
  if (layer === "chocolat") {
    const coatShape = scaled(DATE_D, 1.035, 1.06);
    const coatG = sc.id("cg");
    sc.def(`<linearGradient id="${coatG}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(P.coat, P.coatLight, 0.35)}"/><stop offset=".5" stop-color="${P.coat}"/><stop offset="1" stop-color="${shade(P.coat, -0.3)}"/></linearGradient>`);
    const lit = litFilter(sc, { pillow: 22, height: 46, spec: 0.8, exp: 26, rot: o.rot, seed: seed + 3, specElevation: 26 });
    return castShadow(sc, coatShape, T, o.s) + `<g transform="${T}"><path d="${coatShape}" fill="url(#${coatG})" filter="url(#${lit})"/></g>`;
  }
  // finition : garnitures seules, flottantes
  const clipDate = sc.id("cd");
  sc.def(`<clipPath id="${clipDate}"><path d="${scaled(DATE_D, 1.035, 1.06)}"/></clipPath>`);
  const dip = sc.id("dp");
  sc.def(`<clipPath id="${dip}"><rect x="-140" y="-90" width="280" height="180"/></clipPath>`);
  return `<g transform="${T}"><g clip-path="url(#${clipDate})">${toppings(sc, recipe, r, 92, true, dip)}</g></g>`;
}
