// Ouverture de la Maison : capture pendant l'animation, puis vérifie qu'elle a disparu et ne se rejoue pas.
import { chromium } from "playwright";
const [base = "http://localhost:3000", out] = process.argv.slice(2);
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: "tb_consent", value: encodeURIComponent(JSON.stringify({ analytics: false, date: new Date().toISOString(), v: 1 })), url: base }]);
const page = await ctx.newPage();
await page.goto(base + "/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1100);
if (out) await page.screenshot({ path: `${out}/intro-mid.jpg`, type: "jpeg", quality: 75 });
const playing = await page.evaluate(() => getComputedStyle(document.querySelector(".intro-curtain")).display !== "none");
await page.waitForTimeout(2200);
const gone = await page.evaluate(() => getComputedStyle(document.querySelector(".intro-curtain")).display === "none");
await page.goto(base + "/creations", { waitUntil: "domcontentloaded" });
await page.goto(base + "/", { waitUntil: "domcontentloaded" });
const replay = await page.evaluate(() => getComputedStyle(document.querySelector(".intro-curtain")).display !== "none");
console.log(JSON.stringify({ playing, goneAfter: gone, replayedOnReturn: replay }));
await browser.close();
process.exit(playing && gone && !replay ? 0 : 1);
