// Vérification rapide : chaque page publique répond et ne contient pas d'erreur de rendu.
// Usage : node scripts/smoke.mjs [http://localhost:3000]
const base = process.argv[2] ?? "http://localhost:3000";

const PAGES = [
  "/", "/creations", "/collections/signature", "/collections/ephemere", "/creations/eclipse-noire", "/creations/rose-de-nuit",
  "/coffrets", "/composer-mon-coffret", "/composer-mon-coffret?format=24&selection=cafe-imperial:4", "/recherche?q=pistache",
  "/panier", "/paiement", "/maison", "/savoir-faire", "/professionnels", "/professionnels/cadeaux-entreprise",
  "/professionnels/mariages-evenements", "/professionnels/devis", "/faq", "/contact", "/livraison-retours",
  "/mentions-legales", "/cgv", "/confidentialite", "/cookies", "/suivi-commande", "/compte/connexion", "/compte/inscription",
  "/compte/mot-de-passe-oublie", "/newsletter/desinscription", "/sitemap.xml", "/robots.txt", "/manifest.webmanifest",
];
const EXPECT_404 = ["/creations/n-existe-pas", "/page-inconnue", "/collections/inconnue"];
const REDIRECT = ["/admin"];

let failed = 0;
const check = async (path, expected) => {
  const t = Date.now();
  const res = await fetch(base + path, { redirect: "manual" });
  const body = res.status === 200 ? await res.text() : "";
  // Avec le prérendu partiel, une page dynamique introuvable peut être diffusée en 200 avec la page 404
  // et une balise noindex : on l'accepte comme « introuvable ».
  const streamed404 = expected === 404 && res.status === 200 && /noindex/.test(body);
  const okStatus = expected === "redirect" ? res.status >= 300 && res.status < 400 : res.status === expected || streamed404;
  const renderError = /Application error|Unhandled Runtime Error|Internal Server Error/.test(body);
  const ok = okStatus && !renderError;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${res.status} ${String(Date.now() - t).padStart(5)}ms ${path}${renderError ? "  (erreur de rendu)" : ""}`);
};

for (const p of PAGES) await check(p, 200);
for (const p of EXPECT_404) await check(p, 404);
for (const p of REDIRECT) await check(p, "redirect");
console.log(failed ? `\n${failed} échec(s)` : "\nToutes les pages répondent.");
process.exit(failed ? 1 : 0);
