import puppeteer from "puppeteer";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const b = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 900 } });
const p = await b.newPage();
await p.setCookie({ name: "tb_consent", value: encodeURIComponent(JSON.stringify({ analytics: false, date: "x", v: 1 })), url: base });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
const email = `test${Date.now()}@example.com`;
const ok = (m) => console.log("ok", m);
await p.goto(`${base}/compte/inscription`, { waitUntil: "networkidle0" });
await p.type("#f-firstName", "Léa"); await p.type("#f-lastName", "Martin"); await p.type("#f-email", email);
await p.type("#f-password", "court"); await p.click('[name="cgu"]');
await p.click('form button.btn-primary');
await p.waitForFunction(() => document.body.textContent.includes("au moins 10 caractères"), { timeout: 20000 }); ok("mot de passe faible refusé");
await p.$eval("#f-password", (e) => (e.value = "")); await p.type("#f-password", "Datte-Medjool-42");
await p.click('form button.btn-primary');
await p.waitForFunction(() => location.pathname === "/compte", { timeout: 30000 });
await p.waitForFunction(() => document.body.textContent.includes("Mes commandes"), { timeout: 30000 }); ok("inscription + session");
await p.goto(`${base}/compte/adresses?nouvelle=1`, { waitUntil: "networkidle0" });
for (const [k, v] of Object.entries({ firstName: "Léa", lastName: "Martin", line1: "3 place du Marché", postalCode: "69002", city: "Lyon" })) { await p.$eval(`#f-${k}`, (e) => (e.value = "")); await p.type(`#f-${k}`, v); }
await p.click('form button.btn-primary');
await p.waitForFunction(() => document.body.textContent.includes("Adresse enregistrée"), { timeout: 30000 }); ok("adresse");
// déconnexion puis reconnexion avec erreur
await p.goto(`${base}/compte`, { waitUntil: "networkidle0" });
await p.evaluate(() => [...document.querySelectorAll("button")].find((x) => x.textContent.includes("Se déconnecter")).click());
await p.waitForFunction(() => location.pathname === "/", { timeout: 30000 }); ok("déconnexion");
await p.goto(`${base}/compte/connexion`, { waitUntil: "networkidle0" });
await p.type("#f-email", email); await p.type("#f-password", "mauvais-mot-de-passe");
await p.click('form button.btn-primary');
await p.waitForFunction(() => document.body.textContent.includes("Email ou mot de passe incorrect"), { timeout: 20000 }); ok("mauvais mot de passe refusé");
await p.$eval("#f-password", (e) => (e.value = "")); await p.type("#f-password", "Datte-Medjool-42");
await p.click('form button.btn-primary');
await p.waitForFunction(() => location.pathname === "/compte", { timeout: 30000 }); ok("connexion");
// un client ne peut pas accéder à l'admin
await p.goto(`${base}/admin`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 2000));
console.log("admin as customer ->", p.url());
// suivi invité avec mauvais email
await p.goto(`${base}/suivi-commande`, { waitUntil: "networkidle0" });
await p.type("#f-number", "TB-2026-ZZZZZZ"); await p.type("#f-email", "x@example.com");
await p.click("form button.btn-primary");
await p.waitForFunction(() => document.body.textContent.includes("Aucune commande ne correspond"), { timeout: 20000 }); ok("suivi : commande inconnue");
console.log("errors", errs);
await b.close();
