// Revue de plusieurs pages : captures par tranches, tuilées en une planche par page et par écran.
// node tests/visual/pages.mjs <url-de-base> <dossier> <largeur>x<hauteur>@<dpr> <chemin> [chemin…]
// Relève aussi les erreurs JavaScript, les images cassées et le débordement horizontal de chaque page.
import { chromium } from "playwright";
import sharp from "sharp";

const [base, out, vp, ...paths] = process.argv.slice(2);
const [, w, h, dpr = "1"] = vp.match(/^(\d+)x(\d+)(?:@([\d.]+))?$/) ?? [];
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "chrome" });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: +dpr });
await ctx.addCookies([{ name: "tb_consent", value: encodeURIComponent(JSON.stringify({ analytics: false, date: new Date().toISOString(), v: 1 })), url: base }]);
await ctx.addInitScript(() => sessionStorage.setItem("mt-intro", "1"));
const report = [];
for (const p of paths) {
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
  await page.goto(base + p, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(1500);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const n = Math.min(8, Math.max(1, Math.ceil(total / +h)));
  const shots = [];
  for (let i = 0; i < n; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(((total - +h) * i) / Math.max(1, n - 1)));
    await page.waitForTimeout(900);
    shots.push(await page.screenshot({ type: "jpeg", quality: 70 }));
  }
  const broken = await page.evaluate(() => [...document.images].filter((im) => im.complete && im.naturalWidth === 0 && im.currentSrc).map((im) => im.currentSrc.slice(-70)));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  // planche : 4 colonnes
  const tw = 480, th = Math.round((480 * +h) / +w);
  const tiles = await Promise.all(shots.map(async (b, i) => ({ input: await sharp(b).resize(tw, th).toBuffer(), left: (i % 4) * (tw + 6), top: Math.floor(i / 4) * (th + 6) })));
  const rows = Math.ceil(shots.length / 4);
  const name = p.replace(/\W+/g, "_").replace(/^_|_$/g, "") || "accueil";
  await sharp({ create: { width: 4 * (tw + 6) - 6, height: rows * (th + 6) - 6, channels: 3, background: "#000" } }).composite(tiles).jpeg({ quality: 72 }).toFile(`${out}/${name}-${w}.jpg`);
  report.push({ page: p, overflow, broken, errors: errors.slice(0, 4) });
  await page.close();
}
console.log(JSON.stringify(report, null, 1));
await browser.close();
