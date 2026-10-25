// Génère la documentation des prompts photo à partir du catalogue de prises de vue (scripts/images/shots.ts).
// Usage : npm run prompts  →  docs/PROMPTS-PHOTO.md + docs/photo-prompts.json
import fs from "node:fs";
import path from "node:path";
import { SHOTS } from "./images/shots";

const root = path.resolve(import.meta.dirname, "..");

fs.mkdirSync(path.join(root, "docs"), { recursive: true });
fs.writeFileSync(path.join(root, "docs/photo-prompts.json"), `${JSON.stringify(SHOTS, null, 2)}\n`);

const md = [
  "# Prompts photo MAISON TAMRĀN",
  "",
  `Ce document liste ${SHOTS.length} prises de vue, une par emplacement d'image du site, dans l'ordre de priorité de génération. Il est produit par \`npm run prompts\` à partir de \`scripts/images/shots.ts\` (source unique, également utilisée par le pipeline de génération).`,
  "",
  "## Pipeline (Cloudflare Workers AI)",
  "",
  "1. `npm run images:generate -- <emplacement>` (ou `group:hero`, `recipe:<slug>`, `--missing`) : génère un candidat dans `.images-staging/` (hors dépôt). Le script s'arrête avant de dépasser l'allocation gratuite quotidienne.",
  "2. `npm run images:review` : planche d'aperçu locale pour comparer les candidats.",
  "3. `npm run images:approve -- <emplacement> [fichier]` : optimise l'image (WebP), la publie dans `public/images/<dossier>/` et l'enregistre dans `src/data/photo-manifest.json`. Le site l'affiche aussitôt à la place du visuel concept.",
  "4. `npm run images:approve -- --revoke <emplacement>` : retire une photo. `npm run images:status` : état et quota du jour.",
  "",
  "**Nature des images** : ce sont des images conceptuelles générées par IA, signalées « Image conceptuelle · IA » à l'écran et dans `src/data/photo-provenance.json`. Elles ne représentent pas des produits réellement fabriqués : à remplacer par un shooting avant la commercialisation. Ne jamais utiliser la photo d'un concurrent.",
  "",
];
let group = "";
for (const s of SHOTS) {
  if (s.group !== group) {
    group = s.group;
    md.push(`## ${group}`, "");
  }
  md.push(`### \`${s.id}\` — ${s.title}`, "", `- Usage : ${s.usage}`, `- Format : ${s.width}×${s.height} · dossier \`public/images/${s.dir}/\` · priorité ${s.priority}`, "", "```text", s.prompt, "```", "");
}
fs.writeFileSync(path.join(root, "docs/PROMPTS-PHOTO.md"), md.join("\n"));
console.log(`${SHOTS.length} prompts écrits.`);
