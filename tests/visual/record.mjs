// Ce que le navigateur affiche réellement, image par image (capture d'écran continue du compositeur), pendant
// l'ouverture de l'accueil et une suite de navigations : une planche par séquence, horodatée. Compte aussi les
// transitions de vue lancées à chaque navigation.
// node tests/visual/record.mjs [url] <dossier-captures>
import { chromium } from "playwright";
import sharp from "sharp";

const [base = "http://localhost:3000", out] = process.argv.slice(2);
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.addCookies([{ name: "tb_consent", value: encodeURIComponent(JSON.stringify({ analytics: false, date: new Date().toISOString(), v: 1 })), url: base }]);
await ctx.addInitScript(() => {
  window.__vt = 0;
  const start = document.startViewTransition?.bind(document);
  if (start) document.startViewTransition = (cb) => ((window.__vt += 1), start(cb));
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
const cdp = await ctx.newCDPSession(page);
let frames = [];
cdp.on("Page.screencastFrame", async (f) => {
  frames.push({ t: f.metadata.timestamp, data: Buffer.from(f.data, "base64") });
  await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
});

async function record(name, action, ms = 2400) {
  frames = [];
  const vt0 = await page.evaluate(() => window.__vt).catch(() => 0);
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 55, maxWidth: 640, maxHeight: 400, everyNthFrame: 1 });
  await action();
  await page.waitForTimeout(ms);
  await cdp.send("Page.stopScreencast");
  const vt = (await page.evaluate(() => window.__vt)) - vt0;
  const t0 = frames[0]?.t ?? 0;
  const step = Math.max(1, Math.ceil(frames.length / 16));
  const pick = frames.filter((_, i) => i % step === 0).slice(0, 16);
  const tiles = await Promise.all(
    pick.map(async (f, i) => ({
      input: await sharp(f.data).resize(320, 200).composite([{ input: Buffer.from(`<svg width="320" height="200"><rect width="64" height="18" fill="#b00"/><text x="4" y="14" font-size="13" fill="white">${Math.round((f.t - t0) * 1000)} ms</text></svg>`) }]).toBuffer(),
      left: (i % 4) * 322,
      top: Math.floor(i / 4) * 202,
    }))
  );
  if (out) await sharp({ create: { width: 1286, height: 806, channels: 3, background: "#000" } }).composite(tiles).jpeg({ quality: 75 }).toFile(`${out}/rec-${name}.jpg`);
  console.log(`${name.padEnd(22)} ${String(frames.length).padStart(4)} images · transitions de vue : ${vt}`);
}

await record("ouverture-accueil", () => page.goto(base + "/", { waitUntil: "commit" }), 4200);
await page.waitForLoadState("networkidle");
await record("menu-vers-maison", () => page.locator('header nav a[href="/maison"]').first().click());
await record("menu-vers-coffrets", () => page.locator('header nav a[href="/coffrets"]').first().click());
await page.goto(base + "/creations", { waitUntil: "networkidle" });
await page.evaluate(() => window.scrollTo(0, 900));
await page.waitForTimeout(800);
await record("carte-vers-fiche", () => page.locator('article a[href^="/creations/"]').first().click());
await record("retour-arriere", () => page.goBack());
await record("pied-de-page", async () => { await page.locator('footer a[href="/savoir-faire"]').first().click(); });
console.log(errors.length ? `\nErreurs : ${errors.join(" | ")}` : "\nAucune erreur JavaScript");
await browser.close();
