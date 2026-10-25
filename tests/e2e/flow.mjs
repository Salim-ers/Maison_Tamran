import puppeteer from "puppeteer";
const base = process.argv[2] ?? process.env.BASE_URL ?? "http://localhost:3000";
const out = process.argv[3];
const b = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 900 } });
const p = await b.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 200)));
await p.setCookie({ name: "tb_consent", value: encodeURIComponent(JSON.stringify({ analytics: true, date: "x", v: 1 })), url: base });
const step = async (name, fn) => { const t = Date.now(); await fn(); console.log("ok", name, Date.now() - t, "ms"); };
const clickText = async (txt, sel = "button") => {
  await p.waitForFunction((t, s) => [...document.querySelectorAll(s)].some((e) => e.textContent.includes(t) && !e.disabled), { timeout: 30000 }, txt, sel);
  await p.evaluate((t, s) => [...document.querySelectorAll(s)].find((e) => e.textContent.includes(t) && !e.disabled).click(), txt, sel);
};
await step("configurateur", async () => {
  await p.goto(`${base}/composer-mon-coffret?format=6&selection=or-de-marrakech:4,eclipse-noire:2`, { waitUntil: "networkidle0" });
  await p.click("#gift-message"); await p.type("#gift-message", "Joyeux anniversaire !");
  await clickText("Ajouter le coffret au panier");
  await p.waitForFunction(() => document.querySelector('[role="dialog"]')?.textContent.includes("Coffret Découverte"), { timeout: 30000 });
});
await step("étui produit", async () => {
  await p.goto(`${base}/creations/rouge-desir`, { waitUntil: "networkidle0" });
  await clickText("Étui de 6 pièces", "label");
  await clickText("Ajouter au panier, 14,90");
  await p.waitForFunction(() => document.querySelector('[role="dialog"]')?.textContent.includes("Rouge Désir"), { timeout: 30000 });
});
await step("code promo", async () => {
  await p.goto(`${base}/panier`, { waitUntil: "networkidle0" });
  await p.waitForSelector("#promo");
  await p.type("#promo", "bienvenue10");
  await clickText("Appliquer");
  await p.waitForFunction(() => document.body.textContent.includes("Remise appliquée".toLowerCase()) || document.body.textContent.includes("remise appliquée"), { timeout: 30000 });
});
await step("paiement", async () => {
  await p.goto(`${base}/paiement`, { waitUntil: "networkidle0" });
  const fill = async (n, v) => { await p.$eval(`[name="${n}"]`, (e) => (e.value = "")); await p.type(`[name="${n}"]`, v); };
  await fill("email", "client.test@example.com");
  await fill("firstName", "Camille"); await fill("lastName", "Durand");
  await fill("line1", "12 rue des Lilas"); await fill("postalCode", "75011"); await fill("city", "Paris");
  await p.click('[name="cgv"]');
  await new Promise((r) => setTimeout(r, 1500));
  if (out) await p.screenshot({ path: `${out}-checkout.png`, fullPage: true });
  await clickText("Continuer vers le paiement simulé");
  await p.waitForFunction(() => location.pathname.startsWith("/paiement/demo/"), { timeout: 60000 });
});
await step("simulation acceptée", async () => {
  await new Promise((r) => setTimeout(r, 2500));
  if (out) await p.screenshot({ path: `${out}-demo.png`, fullPage: true });
  await clickText("Simuler un paiement accepté");
  await p.waitForFunction(() => location.pathname === "/paiement/confirmation", { timeout: 60000 });
  await p.waitForFunction(() => document.body.textContent.includes("votre commande est confirmée"), { timeout: 30000 });
  if (out) await p.screenshot({ path: `${out}-confirm.png`, fullPage: true });
});
await step("panier vidé", async () => {
  await p.goto(`${base}/panier`, { waitUntil: "networkidle0" });
  await p.waitForFunction(() => document.body.textContent.includes("attend sa première création"), { timeout: 30000 });
});
console.log("errors:", errs.slice(0, 10));
await b.close();
