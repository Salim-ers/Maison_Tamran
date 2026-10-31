// Stabilité de l'en-tête d'une page à l'autre. Pendant chaque navigation, à chaque image affichée par le navigateur
// (requestAnimationFrame) : en-tête en haut, visible, de hauteur constante, et jamais la nouvelle page à l'ancienne
// position de défilement. Une fois la page posée : logo et panier identiques au pixel près.
// (Les captures d'écran prises pendant la mise à jour du DOM ne reflètent pas une image réellement affichée :
// d'où la mesure dans la page plutôt que par capture.)
// node tests/visual/header.mjs [url] [dossier-captures]
import { chromium } from "playwright";
import sharp from "sharp";

const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3];
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "chrome" });
const errors = [];
const check = (cond, msg) => {
  if (!cond) errors.push(msg);
  console.log(`${cond ? "ok " : "ÉCHEC"} ${msg}`);
};

/** Zones découpées dans une capture de l'écran (coordonnées de l'écran). */
const crop = (shot, zones) => Promise.all(zones.map((z) => sharp(shot).extract({ left: Math.round(z.x), top: Math.round(z.y), width: Math.round(z.width), height: Math.round(z.height) }).png().toBuffer()));

/** Écart moyen (0-255) entre deux captures de même taille. */
async function diff(a, b) {
  const [x, y] = await Promise.all([sharp(a).raw().toBuffer(), sharp(b).raw().toBuffer()]);
  let s = 0;
  for (let i = 0; i < x.length; i++) s += Math.abs(x[i] - y[i]);
  return s / x.length;
}

for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport });
  await ctx.addCookies([{ name: "tb_consent", value: encodeURIComponent(JSON.stringify({ analytics: false, date: new Date().toISOString(), v: 1 })), url: base }]);
  await ctx.addInitScript(() => sessionStorage.setItem("mt-intro", "1"));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name}: ${e}`));
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  // zones qui ne doivent jamais changer : le logo et le bouton du panier
  const zones = [
    await page.locator('header a[aria-label^="MAISON"]').filter({ visible: true }).first().boundingBox(),
    await page.locator('header button[aria-label^="Ouvrir le panier"]').boundingBox(),
  ];
  const ref = await crop(await page.screenshot(), zones);

  for (const href of ["/coffrets", "/creations", "/maison", "/professionnels", "/composer-mon-coffret", "/"]) {
    await page.evaluate(() => window.scrollTo(0, 700));
    await page.waitForTimeout(400);
    await page.evaluate(() => {
      const h = document.querySelector("header");
      const from = location.pathname;
      window.__frames = [];
      const tick = () => {
        const r = h.getBoundingClientRect();
        // pendant une transition de vue, le navigateur ne cible pas les éléments sous le pointeur : vérifié hors transition
        const vt = Boolean(document.documentElement.dataset.vt);
        const hit = vt || document.elementFromPoint(innerWidth / 2, r.height / 2)?.closest("header") === h;
        window.__frames.push({ top: r.top, height: r.height, visible: getComputedStyle(h).visibility === "visible", hit, vt, moved: location.pathname !== from, y: scrollY });
        if (window.__frames.length < 45) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    if (name === "desktop" && href !== "/" && href !== "/composer-mon-coffret") await page.locator(`header nav a[href="${href}"]`).first().click();
    else await page.evaluate((h) => document.querySelector(`a[href="${h}"]`)?.click(), href);
    await page.waitForURL((u) => u.pathname === href, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1200);
    const frames = await page.evaluate(() => window.__frames);
    const bad = frames.filter((f) => Math.abs(f.top) > 0.5 || Math.abs(f.height - frames[0].height) > 0.5 || !f.visible || !f.hit);
    const stale = frames.filter((f) => f.moved && f.y > 0 && f.y === frames[0].y);
    check(bad.length === 0, `${name} → ${href} : en-tête fixe, visible et de même hauteur sur ${frames.length} images (${frames.filter((f) => f.vt).length} en transition de vue)`);
    check(stale.length === 0, `${name} → ${href} : la nouvelle page n'apparaît jamais à l'ancienne position de défilement`);
    const now = await crop(await page.screenshot(), zones);
    const d = Math.max(...(await Promise.all(now.map((s, i) => diff(s, ref[i])))));
    check(d < 1, `${name} → ${href} : logo et panier identiques (écart ${d.toFixed(2)})`);
  }
  if (out) await page.screenshot({ path: `${out}/header-${name}.jpg`, type: "jpeg", quality: 80, clip: { x: 0, y: 0, width: viewport.width, height: 120 } });
  await ctx.close();
}
await browser.close();
console.log(errors.length ? `\n${errors.length} problème(s)` : "\nEn-tête stable sur tout le parcours");
process.exit(errors.length ? 1 : 0);
