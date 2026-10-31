// Transitions de page : catalogue → fiche (morphose de la photo), fiche → création suivante (glissement).
// node tests/visual/transitions.mjs [url] [dossier-captures]
import { chromium } from "playwright";

const [base = "http://localhost:3000", out] = process.argv.slice(2);
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: "tb_consent", value: encodeURIComponent(JSON.stringify({ analytics: false, date: new Date().toISOString(), v: 1 })), url: base }]);
await ctx.addInitScript(() => sessionStorage.setItem("mt-intro", "1"));
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
const result = {};

await page.goto(`${base}/creations`, { waitUntil: "networkidle" });
const card = page.locator('article h3 a[href="/creations/velours-persan"]').first();
await card.scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
// une transition de vue est-elle déclenchée au clic ?
await page.evaluate(() => {
  window.__vt = 0;
  const orig = document.startViewTransition?.bind(document);
  if (orig) document.startViewTransition = (...a) => { window.__vt++; return orig(...a); };
});
await card.click();
await page.waitForTimeout(220);
if (out) await page.screenshot({ path: `${out}/vt-morph.jpg`, type: "jpeg", quality: 72 });
await page.waitForURL("**/creations/velours-persan", { timeout: 15000 });
await page.waitForTimeout(900);
result.toProduct = { url: page.url().replace(base, ""), viewTransitions: await page.evaluate(() => window.__vt) };

await page.evaluate(() => { window.__vt = 0; });
await page.getByRole("link", { name: /Création suivante/i }).click();
await page.waitForTimeout(240);
if (out) await page.screenshot({ path: `${out}/vt-next.jpg`, type: "jpeg", quality: 72 });
await page.waitForURL("**/creations/minuit-a-kyoto", { timeout: 15000 });
result.toNext = { url: page.url().replace(base, ""), viewTransitions: await page.evaluate(() => window.__vt) };
result.errors = errors;
console.log(JSON.stringify(result));
await browser.close();
process.exit(errors.length || !result.toProduct.viewTransitions || !result.toNext.viewTransitions ? 1 : 0);
