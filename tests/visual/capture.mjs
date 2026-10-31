// Captures plein écran d'une page par tranches régulières, pour la revue visuelle.
// node tests/visual/capture.mjs <url> <sortie-préfixe> [largeur] [hauteur] [tranches] [dpr]
// Bandeau cookies réglé et ouverture marquée comme vue (INTRO=1 pour la laisser jouer).
import { chromium } from "playwright";
const [url, out, w = "1440", h = "900", slices = "12", dpr = "1"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "chrome" });
const context = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: +dpr });
await context.addCookies([{ name: "tb_consent", value: encodeURIComponent(JSON.stringify({ analytics: false, date: new Date().toISOString(), v: 1 })), url: new URL(url).origin }]);
if (!process.env.INTRO) await context.addInitScript(() => sessionStorage.setItem("mt-intro", "1"));
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(2500);
const total = await page.evaluate(() => document.documentElement.scrollHeight);
const n = Math.min(+slices, Math.ceil(total / +h));
const step = Math.max(+h, Math.floor((total - +h) / Math.max(1, n - 1)));
for (let i = 0; i < n; i++) {
  const y = Math.min(i * step, total - +h);
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${out}-${String(i).padStart(2, "0")}.jpg`, type: "jpeg", quality: 70 });
}
// débordement horizontal (aucun élément ne doit dépasser la largeur de l'écran)
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
console.log(JSON.stringify({ total, n, overflow, errors: errors.slice(0, 10) }));
await browser.close();
