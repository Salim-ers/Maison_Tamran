import puppeteer from "puppeteer";
const base = process.env.BASE_URL ?? "http://localhost:3000", out = process.argv[2] ?? "admin";
const adminEmail = process.env.ADMIN_EMAIL ?? "admin@maison-tamran.local", adminPassword = process.env.ADMIN_PASSWORD ?? "MaisonTamran-admin-2026";
const b = await puppeteer.launch({ headless: true, defaultViewport: { width: 1440, height: 900 } });
const p = await b.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 300)));
await p.setCookie({ name: "tb_consent", value: encodeURIComponent(JSON.stringify({ analytics: false, date: "x", v: 1 })), url: base });
await p.goto(`${base}/compte/connexion?suite=/admin`, { waitUntil: "networkidle0" });
await p.type("#f-email", adminEmail); await p.type("#f-password", adminPassword);
await p.click("form button.btn-primary");
await p.waitForFunction(() => location.pathname === "/admin", { timeout: 60000 });
const pages = ["/admin", "/admin/commandes", "/admin/produits", "/admin/stock", "/admin/devis", "/admin/contenu", "/admin/reglages", "/admin/temoignages", "/admin/emails", "/admin/promotions", "/admin/livraison", "/admin/clients", "/admin/coffrets", "/admin/collections", "/admin/newsletter", "/admin/messages", "/admin/devis/tarifs", "/admin/produits/nouveau"];
for (const u of pages) {
  const r = await p.goto(base + u, { waitUntil: "networkidle0" });
  console.log(r.status(), u);
}
const prodLink = await (await p.goto(base + "/admin/produits", { waitUntil: "networkidle0" }), p.$eval('a[href^="/admin/produits/"]:not([href$="nouveau"])', (a) => a.getAttribute("href")));
await p.goto(base + prodLink, { waitUntil: "networkidle0" }); console.log("produit", prodLink);
await p.screenshot({ path: `${out}-produit.png`, fullPage: false });
const ordLink = await (await p.goto(base + "/admin/commandes", { waitUntil: "networkidle0" }), p.$eval('a[href^="/admin/commandes/"]', (a) => a.getAttribute("href")).catch(() => null));
if (ordLink) { await p.goto(base + ordLink, { waitUntil: "networkidle0" }); await p.screenshot({ path: `${out}-commande.png` }); }
await p.goto(base + "/admin", { waitUntil: "networkidle0" }); await p.screenshot({ path: `${out}-dash.png` });
console.log("errors", errs.slice(0, 8));
await b.close();
