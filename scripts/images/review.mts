// Planche d'aperçu locale des candidats (et des photos déjà validées) avant validation manuelle.
// Usage : npm run images:review   →   ouvre .images-staging/review.html dans le navigateur
import fs from "node:fs";
import path from "node:path";
import { SHOTS } from "./shots";
import { MANIFEST, STAGING, candidates, readJson, type ManifestEntry } from "./store";

const manifest = readJson<Record<string, ManifestEntry>>(MANIFEST, {});
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const sections = SHOTS.map((shot) => {
  const list = candidates(shot.id);
  const approved = manifest[shot.id];
  if (!list.length && !approved) return "";
  const current = approved
    ? `<figure class="ok"><img src="../public${approved.url}" loading="lazy"><figcaption><b>Validée</b> · ${approved.w}×${approved.h}<br><code>public${esc(approved.url)}</code></figcaption></figure>`
    : "";
  const items = list
    .map(
      (c) => `<figure><img src="${esc(`${shot.id}/${c.file}`)}" loading="lazy"><figcaption>${c.width}×${c.height} · ${esc(c.model)} · seed ${c.seed}<br>${esc(c.generatedAt.replace("T", " ").slice(0, 19))} UTC<br><code>npm run images:approve -- ${esc(shot.id)} ${esc(c.file)}</code></figcaption></figure>`
    )
    .join("");
  return `<section><h2>${esc(shot.title)} <small>${esc(shot.id)} · cible ${shot.width}×${shot.height}</small></h2><p class="usage">${esc(shot.usage)}</p><details><summary>Prompt</summary><p>${esc(shot.prompt)}</p></details><div class="grid">${current}${items}</div></section>`;
}).join("");

const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Visuels MAISON TAMRĀN — validation</title>
<style>
body{margin:0;padding:32px 16px;background:#241713;color:#F6F0E6;font:15px/1.5 system-ui,sans-serif}
h1{font-weight:500;margin:0 0 4px}h2{font-weight:500;margin:0}small{color:#B7835D;font-size:13px;margin-left:8px}
.lead,.usage{color:#d9cbb8;margin:4px 0 12px}section{border-top:1px solid #4a3328;padding:24px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
figure{margin:0;background:#321F18;padding:8px}figure.ok{outline:2px solid #888C65}img{width:100%;height:auto;display:block}
figcaption{font-size:12px;color:#d9cbb8;margin-top:8px}code{color:#E3AE58;word-break:break-all}details{margin:0 0 12px;color:#d9cbb8;font-size:13px}
</style></head><body><h1>Visuels MAISON TAMRĀN — candidats à valider</h1>
<p class="lead">Images conceptuelles générées par IA (Cloudflare Workers AI). Elles ne représentent pas des produits réellement fabriqués. Validez une image avec la commande indiquée sous celle-ci ; les autres restent en attente.</p>
${sections || "<p>Aucun candidat. Lancez npm run images:generate.</p>"}</body></html>`;

const out = path.join(STAGING, "review.html");
fs.mkdirSync(STAGING, { recursive: true });
fs.writeFileSync(out, html);
console.log(`Planche d'aperçu : ${out}`);
