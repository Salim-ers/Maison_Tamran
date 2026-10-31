// Parcours du configurateur dans un vrai navigateur : poser, remplacer, revenir, compléter, ajouter au panier.
// node tests/visual/configurator.mjs [url] [dossier-captures]
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3];
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "chrome" });
const errors = [];
const check = (cond, msg) => {
  if (!cond) errors.push(msg);
  console.log(`${cond ? "ok " : "ÉCHEC"} ${msg}`);
};

for (const [name, viewport, dpr] of [["desktop", { width: 1440, height: 900 }, 1], ["mobile", { width: 390, height: 844 }, 3]]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: dpr });
  await ctx.addCookies([{ name: "tb_consent", value: encodeURIComponent(JSON.stringify({ analytics: false, date: new Date().toISOString(), v: 1 })), url: base }]);
  await ctx.addInitScript(() => sessionStorage.setItem("mt-intro", "1"));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name}: ${e}`));
  await page.goto(`${base}/composer-mon-coffret?format=6`, { waitUntil: "networkidle" });
  const slots = page.locator("[data-slot]");
  check((await slots.count()) === 6, `${name} : 6 alvéoles pour le format Découverte`);
  check((await page.locator('aside img[alt^="Coffret 6 pièces"]').count()) === 1, `${name} : photographie du coffret 6 pièces`);

  const cards = page.locator('button[aria-label^="Poser "]');
  await cards.nth(0).click();
  await cards.nth(1).click();
  await cards.nth(3).click();
  await page.waitForTimeout(900);
  check((await page.locator("[data-slot] button").count()) === 3, `${name} : trois pièces posées`);

  // remplacer la première pièce
  await page.locator("[data-slot='0'] button").click();
  check(await page.getByText("Choisissez une création pour la remplacer").isVisible(), `${name} : pièce sélectionnée, remplacement proposé`);
  await page.locator('button[aria-label^="Remplacer la place 1 par"]').nth(4).click();
  await page.waitForTimeout(900);
  check((await page.locator("[data-slot] button").count()) === 3, `${name} : remplacement sans pièce en plus`);

  // revenir en arrière, puis compléter
  await page.getByRole("button", { name: "Revenir" }).click();
  await page.getByRole("button", { name: "Compléter" }).click();
  await page.waitForTimeout(1600);
  check((await page.locator("[data-slot] button").count()) === 6, `${name} : coffret complété`);
  check(await page.getByText("Votre coffret est prêt").isVisible(), `${name} : état final « Votre coffret est prêt »`);
  if (out) await page.screenshot({ path: `${out}/conf-${name}.jpg`, type: "jpeg", quality: 75 });

  // détail d'une création
  await page.getByRole("button", { name: /^Détail de / }).first().click();
  check(await page.locator("dialog[open]").isVisible(), `${name} : fiche détail ouverte`);
  if (out) await page.screenshot({ path: `${out}/conf-${name}-detail.jpg`, type: "jpeg", quality: 75 });
  await page.getByRole("button", { name: "Fermer" }).click();

  // ajout au panier (mode démonstration)
  await page.getByRole("button", { name: "Ajouter le coffret au panier" }).last().click({ trial: false }).catch(() => {});
  await page.locator('[role="dialog"], [aria-label*="anier"]').first().waitFor({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const cartCount = await page.locator("header").getByText(/^[1-9]$/).count();
  check(cartCount > 0, `${name} : coffret ajouté au panier`);
  await ctx.close();
}
await browser.close();
console.log(errors.length ? `\n${errors.length} problème(s)` : "\nParcours complet sans erreur");
process.exit(errors.length ? 1 : 0);
