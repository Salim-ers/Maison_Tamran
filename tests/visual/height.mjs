// Longueur d’une page, en écrans, et hauteur de chacune de ses sections.
// node tests/visual/height.mjs <url>
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome" });
for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const p = await b.newPage({ viewport: vp });
  await p.addInitScript(() => sessionStorage.setItem("mt-intro", "1"));
  await p.goto(process.argv[2], { waitUntil: "networkidle" });
  const r = await p.evaluate(() => ({ total: document.documentElement.scrollHeight, sections: [...document.querySelectorAll("main > section, main > div > section, footer")].map((s) => [s.getAttribute("aria-labelledby") || s.getAttribute("aria-label") || s.tagName, Math.round(s.getBoundingClientRect().height)]) }));
  console.log(vp.width, "total", r.total, "=", (r.total / vp.height).toFixed(1), "écrans", JSON.stringify(r.sections));
  await p.close();
}
await b.close();
