// Génère des candidats photo via Cloudflare Workers AI, sans jamais dépasser l'allocation gratuite.
// Les images restent dans .images-staging/ tant qu'elles ne sont pas validées (npm run images:approve).
//
// Usage :
//   npm run images:generate -- coupe-or-de-marrakech          un emplacement (regénération individuelle)
//   npm run images:generate -- recipe:or-de-marrakech         toutes les vues d'une recette
//   npm run images:generate -- group:hero group:coupe         par groupe (hero, produit, coupe, scene, coffret, univers, texture, couche)
//   npm run images:generate -- --missing                      tout ce qui n'a ni photo validée ni candidat, par priorité
//   Options : --variants 2  --model schnell  --seed 1234  --dry-run
import fs from "node:fs";
import path from "node:path";
import { randomInt } from "node:crypto";
import sharp from "sharp";
import { SHOTS, SHOT_BY_ID, type Shot } from "./shots";
import { MODELS, QuotaError, UsageLedger, dailyBudget, estimateNeurons, generateImage, remoteNeuronsToday, type ModelKey } from "./cloudflare";
import { LEDGER, MANIFEST, STAGING, candidates, readJson, type Candidate } from "./store";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const optionValues = new Set(["variants", "model", "seed"].map(option).filter(Boolean));
const selectors = args.filter((a) => !a.startsWith("--") && !optionValues.has(a));

const model = (option("model") ?? "klein") as ModelKey;
if (!MODELS[model]) throw new Error(`Modèle inconnu : ${model} (klein ou schnell)`);
const variants = Math.max(1, Math.min(4, Number(option("variants") ?? 1)));
const fixedSeed = option("seed") ? Number(option("seed")) : undefined;
const dryRun = flag("dry-run");

function select(): Shot[] {
  const approved = readJson<Record<string, unknown>>(MANIFEST, {});
  let list: Shot[] = [];
  if (flag("missing")) list = SHOTS.filter((s) => !approved[s.id] && candidates(s.id).length === 0);
  for (const sel of selectors) {
    if (sel.startsWith("group:")) list.push(...SHOTS.filter((s) => s.group === sel.slice(6)));
    else if (sel.startsWith("recipe:")) list.push(...SHOTS.filter((s) => s.recipe === sel.slice(7)));
    else {
      const s = SHOT_BY_ID.get(sel);
      if (!s) throw new Error(`Emplacement inconnu : ${sel}. Liste : npm run images:status`);
      list.push(s);
    }
  }
  const unique = [...new Map(list.map((s) => [s.id, s])).values()];
  return unique.sort((a, b) => a.priority - b.priority);
}

const shots = select();
if (!shots.length) {
  console.log("Rien à générer. Précisez un emplacement, un groupe (group:hero), une recette (recipe:<slug>) ou --missing.");
  process.exit(0);
}

const budget = dailyBudget();
const ledger = new UsageLedger(LEDGER);
const remote = dryRun ? null : await remoteNeuronsToday();
// Consommation de départ : la plus haute des deux sources (le compte peut servir à autre chose).
let used = Math.max(ledger.used, remote ?? 0);
const total = shots.length * variants;
const estimate = shots.reduce((s, x) => s + estimateNeurons(model, x.width, x.height) * variants, 0);

console.log(`Modèle : ${MODELS[model].label} (${MODELS[model].id})`);
console.log(`Images demandées : ${total}  ·  coût estimé : ${estimate.toFixed(0)} neurones`);
console.log(
  `Quota du jour (UTC) : ${used.toFixed(0)} / ${budget} neurones utilisés` +
    (remote === null ? " (estimation locale : le jeton n'a pas accès à Account Analytics)" : " (relevé Cloudflare)")
);
if (dryRun) {
  for (const s of shots) console.log(`\n— ${s.id} (${s.width}×${s.height})\n${s.prompt}`);
  process.exit(0);
}

let done = 0;
outer: for (const shot of shots) {
  for (let v = 0; v < variants; v++) {
    const cost = estimateNeurons(model, shot.width, shot.height);
    if (used + cost > budget) {
      console.log(`\nArrêt : le budget gratuit du jour serait dépassé (${used.toFixed(0)} + ${cost.toFixed(0)} > ${budget}). Reprise possible après 00:00 UTC avec --missing.`);
      break outer;
    }
    const seed = fixedSeed ?? randomInt(1, 2_147_483_647);
    process.stdout.write(`→ ${shot.id} (${shot.width}×${shot.height}, seed ${seed}) … `);
    try {
      const out = await generateImage({ model, prompt: shot.prompt, width: shot.width, height: shot.height, seed });
      ledger.record(cost);
      used += cost;
      // Contrôle du fichier reçu : image décodable, dimensions réelles (schnell produit toujours du 1024×1024).
      const info = await sharp(out.bytes).metadata();
      if (!info.width || !info.height) throw new Error("image illisible");
      const dir = path.join(STAGING, shot.id);
      fs.mkdirSync(dir, { recursive: true });
      const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
      const base = `${stamp}-${model}-s${seed}`;
      fs.writeFileSync(path.join(dir, `${base}.${out.ext}`), out.bytes);
      const meta: Candidate = {
        shot: shot.id,
        file: `${base}.${out.ext}`,
        model,
        modelId: MODELS[model].id,
        seed,
        width: info.width,
        height: info.height,
        prompt: shot.prompt,
        neuronsEstimate: cost,
        generatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(path.join(dir, `${base}.json`), JSON.stringify(meta, null, 2));
      done++;
      console.log(`ok ${info.width}×${info.height} → .images-staging/${shot.id}/${meta.file}`);
    } catch (e) {
      if (e instanceof QuotaError) {
        console.log(`\n${e.message}\nArrêt immédiat, aucune nouvelle requête n'est envoyée.`);
        break outer;
      }
      console.log(`échec : ${(e as Error).message}`);
    }
  }
}

console.log(`\n${done}/${total} image(s) générée(s). Consommation estimée du jour : ${used.toFixed(0)} / ${budget} neurones.`);
if (done) console.log("Aperçu et validation : npm run images:review, puis npm run images:approve -- <emplacement>");
