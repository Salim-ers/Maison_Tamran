// Captures d'une section épinglée à des fractions précises de son défilement (revue du motion design).
// node tests/visual/scene.mjs <url> <sélecteur> <sortie-préfixe> [largeur] [hauteur] [fractions "0,0.3,0.6"] [dpr]
// Variables : INTRO=1 pour laisser jouer l'ouverture (sinon marquée comme déjà vue), PW_CHANNEL (défaut chrome).
import { chromium } from "playwright";

const [url, selector, out, w = "1440", h = "900", fr = "0,0.25,0.5,0.75,1", dpr = "1"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "chrome" });
const context = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: +dpr });
const origin = new URL(url).origin;
// bandeau cookies déjà réglé (refus de la mesure d'audience)
if (!process.env.NO_CONSENT) await context.addCookies([{ name: "tb_consent", value: encodeURIComponent(JSON.stringify({ analytics: false, date: new Date().toISOString(), v: 1 })), url: origin }]);
if (!process.env.INTRO) await context.addInitScript(() => sessionStorage.setItem("mt-intro", "1"));
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(process.env.INTRO ? 400 : 3200);
for (const [i, f] of fr.split(",").map(Number).entries()) {
  const y = await page.evaluate(([sel, f]) => {
    const el = document.querySelector(sel);
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    return top + Math.max(0, r.height - window.innerHeight) * f;
  }, [selector, f]);
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${out}-${String(i).padStart(2, "0")}.jpg`, type: "jpeg", quality: 72 });
}
console.log(JSON.stringify({ errors: errors.slice(0, 8) }));
await browser.close();
