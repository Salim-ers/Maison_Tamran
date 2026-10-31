// Visuels Maison Tamrān générés par l'API Images d'OpenAI, à partir des références photographiques du projet.
//
//   npm run images:openai -- status                         état de chaque emplacement, dépense cumulée
//   npm run images:openai -- produit-or-de-marrakech        estimation seule (aucune dépense sans --yes)
//   npm run images:openai -- produit-or-de-marrakech --yes  génère (une seule fois : un original existant n'est jamais repayé)
//   npm run images:openai -- group:produit --yes            par groupe (produit, coupe, piece, coffret, univers, ambiance)
//   npm run images:openai -- recipe:rouge-desir --yes       toutes les vues d'une création
//   npm run images:openai -- --missing --yes                tout ce qui n'a encore aucun original
//   npm run images:openai -- publish produit-rouge-desir    publie un original validé sur le site (manifeste photo)
//   npm run images:openai -- use coffret-ouvert <clé>       revient à une version déjà payée (aucune requête)
//   npm run images:openai -- prune                         supprime les originaux écartés (ni retenus ni publiés)
//   Options : --force (nouvelle version même si l'original existe), --quality high|xhigh|max, --budget 30, --concurrency 3
//
// Plafond de dépense cumulé : IMAGE_BUDGET_USD (défaut 20 $), ou --budget. La dépense réelle est calculée à partir
// des jetons facturés renvoyés par l'API et consignée dans brand/generated/ledger.json (versionné, sans secret).
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { MANIFEST, PROVENANCE, ROOT, readJson, writeJson } from "./images/store";
import { MASTER_FILES, SHOTS, SHOT_BY_ID, type OpenAIShot, type Ref } from "./images/openai-shots";
import { OpenAIError, checkSize, costOf, estimateCost, generate, megapixels, type Quality, type Usage } from "./images/openai";
import { composeLidLogo } from "./images/lid";

const OUT = path.join(ROOT, "brand/generated");
const LEDGER = path.join(OUT, "ledger.json");
const GEN_MANIFEST = path.join(OUT, "manifest.json");
const PUBLIC_DIR = "/images/generated";
const BADGE = "Visuel conceptuel · IA";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const optionValues = new Set(["quality", "budget", "concurrency", "model"].map(option).filter(Boolean));
const positional = args.filter((a) => !a.startsWith("--") && !optionValues.has(a));
const command = ["status", "publish", "use", "prune"].includes(positional[0]) ? positional.shift()! : "generate";

const MODEL = option("model") ?? process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2.5-sunburst";
const BUDGET = Number(option("budget") ?? process.env.IMAGE_BUDGET_USD ?? 20);
const CONCURRENCY = Math.max(1, Math.min(4, Number(option("concurrency") ?? 3)));
const QUALITY = option("quality") as Quality | undefined;

interface Version {
  key: string;
  file: string; // relatif au dépôt
  model: string;
  quality: Quality;
  size: string;
  width: number;
  height: number;
  prompt: string;
  refs: string[];
  usage: Usage;
  costUsd: number;
  ms: number;
  generatedAt: string;
}
interface GenEntry {
  current: string; // clé de la version retenue
  versions: Version[];
  published?: { key: string; url: string; w: number; h: number; at: string };
}
interface LedgerLine {
  id: string;
  key: string;
  model: string;
  quality: Quality;
  size: string;
  outputTokens: number;
  costUsd: number;
  at: string;
}

const gen = readJson<Record<string, GenEntry>>(GEN_MANIFEST, {});
const ledger = readJson<{ totalUsd: number; lines: LedgerLine[] }>(LEDGER, { totalUsd: 0, lines: [] });
const rel = (p: string) => path.relative(ROOT, p).replaceAll("\\", "/");
const usd = (n: number) => `${n.toFixed(2)} $`;

function save() {
  writeJson(GEN_MANIFEST, gen);
  fs.writeFileSync(LEDGER, `${JSON.stringify(ledger, null, 2)}\n`);
}

/** Jetons de sortie par mégapixel réellement facturés pour cette qualité (moyenne du registre). */
function measuredTokensPerMp(quality: Quality): number | undefined {
  const lines = ledger.lines.filter((l) => l.quality === quality && l.model === MODEL && l.outputTokens > 0);
  if (!lines.length) return undefined;
  return lines.reduce((s, l) => s + l.outputTokens / megapixels(l.size), 0) / lines.length;
}

function currentVersion(id: string): Version | undefined {
  const e = gen[id];
  return e?.versions.find((v) => v.key === e.current);
}

async function refBytes(ref: Ref): Promise<{ name: string; bytes: Buffer; label: string }> {
  if ("shot" in ref) {
    const v = currentVersion(ref.shot);
    if (!v) throw new Error(`référence « ${ref.shot} » pas encore générée`);
    // Les références sont envoyées en PNG (format le plus sûr pour l'endpoint d'édition).
    return { name: `${ref.shot}.png`, bytes: await sharp(path.join(ROOT, v.file)).png().toBuffer(), label: `${ref.shot}@${v.key}` };
  }
  const file = path.join(ROOT, ref.file);
  if ("crop" in ref) {
    const bytes = await sharp(file).extract(ref.crop).png().toBuffer();
    const c = ref.crop;
    return { name: `${path.parse(file).name}-crop.png`, bytes, label: `${ref.file}#${c.left},${c.top},${c.width}x${c.height}` };
  }
  if ("fit" in ref) {
    const bytes = await sharp(file).resize({ width: ref.fit, height: ref.fit, fit: "inside", withoutEnlargement: true }).png().toBuffer();
    return { name: `${path.parse(file).name}.png`, bytes, label: `${ref.file}@${ref.fit}` };
  }
  return { name: path.basename(file), bytes: fs.readFileSync(file), label: ref.file };
}

async function cacheKey(shot: OpenAIShot, quality: Quality, refs: { bytes: Buffer }[]): Promise<string> {
  const h = createHash("sha256");
  h.update([MODEL, shot.size, quality, shot.background ?? "", shot.prompt].join("\n"));
  for (const r of refs) h.update(createHash("sha256").update(r.bytes).digest());
  return h.digest("hex").slice(0, 12);
}

function select(): OpenAIShot[] {
  let list: OpenAIShot[] = [];
  if (flag("missing")) list = SHOTS.filter((s) => !gen[s.id]);
  for (const sel of positional) {
    if (sel.startsWith("group:")) list.push(...SHOTS.filter((s) => s.group === sel.slice(6)));
    else if (sel.startsWith("recipe:")) list.push(...SHOTS.filter((s) => s.id.endsWith(`-${sel.slice(7)}`)));
    else {
      const s = SHOT_BY_ID.get(sel);
      if (!s) throw new Error(`Emplacement inconnu : ${sel} (liste : npm run images:openai -- status)`);
      list.push(s);
    }
  }
  return [...new Map(list.map((s) => [s.id, s])).values()].sort((a, b) => a.priority - b.priority);
}

function status() {
  console.log(`Modèle : ${MODEL}  ·  dépense cumulée : ${usd(ledger.totalUsd)} / plafond ${usd(BUDGET)}\n`);
  for (const s of SHOTS) {
    const v = currentVersion(s.id);
    const pub = gen[s.id]?.published;
    const state = !v ? "—" : pub?.key === v.key ? "publié" : "à valider";
    console.log(`${s.id.padEnd(28)} ${s.size.padEnd(10)} ${state.padEnd(10)} ${v ? `${v.width}×${v.height} ${usd(v.costUsd)}  ${v.file}` : ""}`);
  }
}

async function publish(ids: string[]) {
  const manifest = readJson<Record<string, Record<string, unknown>>>(MANIFEST, {});
  const provenance = readJson<Record<string, Record<string, unknown>>>(PROVENANCE, {});
  for (const id of ids) {
    const shot = SHOT_BY_ID.get(id);
    const v = currentVersion(id);
    if (!shot || !v) throw new Error(`Rien à publier pour ${id}`);
    let original: Buffer = fs.readFileSync(path.join(ROOT, v.file));
    let logoNote = "";
    if (shot.lidLogo) {
      const quad = shot.lidLogo[v.key];
      if (!quad) throw new Error(`${id} : mesurez le filet du couvercle de la version ${v.key} (lidLogo) avant de publier`);
      original = await composeLidLogo(original, quad);
      logoNote = " Logo officiel (public/brand/maison-tamran-logo-ivory.png) composé en perspective, jamais dessiné par le modèle.";
    }
    const src = sharp(original);
    const resized = v.width > shot.publishWidth ? src.resize({ width: shot.publishWidth, kernel: "lanczos3" }) : src;
    const buf = await resized.webp({ quality: 86, alphaQuality: 90, effort: 6, smartSubsample: true }).toBuffer();
    const url = `${PUBLIC_DIR}/${shot.group}/${id}-${createHash("sha1").update(buf).digest("hex").slice(0, 8)}.webp`;
    const out = path.join(ROOT, "public", url);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, buf);
    const old = gen[id].published?.url;
    if (old && old !== url && old.startsWith(PUBLIC_DIR)) fs.rmSync(path.join(ROOT, "public", old), { force: true });
    const m = await sharp(buf).metadata();
    const blur = await sharp(buf).resize(16).webp({ quality: 40 }).toBuffer();
    manifest[id] = { url, w: m.width, h: m.height, blur: `data:image/webp;base64,${blur.toString("base64")}`, badge: BADGE, alt: shot.alt };
    provenance[id] = {
      status: "approved",
      nature: `${BADGE} — image générée (OpenAI ${v.model}, qualité ${v.quality}) à partir des références du projet ; ne représente pas un produit réellement fabriqué ni photographié.`,
      source: `Génération native ${v.width}×${v.height} (aucun agrandissement). Références : ${v.refs.join(" ; ")}.${logoNote}`,
      model: v.model,
      prompt: v.prompt,
      generatedAt: v.generatedAt,
      file: `public${url}`,
      original: v.file,
      width: m.width,
      height: m.height,
      approvedAt: new Date().toISOString(),
    };
    gen[id].published = { key: v.key, url, w: m.width!, h: m.height!, at: new Date().toISOString() };
    console.log(`publié  ${id.padEnd(28)} ${m.width}×${m.height}  public${url}`);
  }
  writeJson(MANIFEST, manifest);
  writeJson(PROVENANCE, provenance);
  save();
}

async function run() {
  const shots = select();
  if (!shots.length) {
    console.log("Rien à générer. Précisez un emplacement, group:<groupe>, recipe:<création> ou --missing (liste : status).");
    return;
  }
  const spend = flag("yes");
  console.log(`Modèle : ${MODEL}  ·  plafond cumulé : ${usd(BUDGET)}  ·  déjà dépensé : ${usd(ledger.totalUsd)}`);
  let planned = 0;
  for (const s of shots) {
    const q = QUALITY ?? s.quality;
    const { experimental } = checkSize(s.size);
    const est = estimateCost(MODEL, s.size, q, s.refs.length, measuredTokensPerMp(q));
    const has = Boolean(currentVersion(s.id));
    if (!has || flag("force")) planned += est;
    console.log(`  ${s.id.padEnd(28)} ${s.size.padEnd(10)} ${q.padEnd(6)} ≈ ${usd(est)}${experimental ? "  (résolution expérimentale)" : ""}${has && !flag("force") ? "  [original existant : vérifié par empreinte]" : ""}`);
  }
  console.log(`Estimation maximale de ce lot : ${usd(planned)}${measuredTokensPerMp("high") ? " (d'après les jetons déjà facturés)" : " (barème prudent, avant toute mesure)"}`);
  if (!spend) {
    console.log("\nAucune requête envoyée. Ajoutez --yes pour générer.");
    return;
  }

  // Exécution par paliers de priorité : une vue dérivée (coupe, pièce) attend le visuel produit dont elle part.
  const tiers = [...new Set(shots.map((s) => s.priority))];
  let done = 0;
  let reserved = 0;
  for (const tier of tiers) {
    const queue = shots.filter((s) => s.priority === tier);
    const worker = async () => {
      for (let s = queue.shift(); s; s = queue.shift()) {
        const q = QUALITY ?? s.quality;
        try {
          const refs = await Promise.all(s.refs.map(refBytes));
          const key = await cacheKey(s, q, refs);
          const existing = gen[s.id]?.versions.find((v) => v.key === key && fs.existsSync(path.join(ROOT, v.file)));
          if (existing && !flag("force")) {
            gen[s.id].current = key;
            console.log(`= ${s.id} : original déjà payé (${existing.file}), aucune requête`);
            continue;
          }
          const est = estimateCost(MODEL, s.size, q, refs.length, measuredTokensPerMp(q));
          if (ledger.totalUsd + reserved + est > BUDGET) {
            console.log(`■ ${s.id} : ignoré, le plafond serait dépassé (${usd(ledger.totalUsd + reserved)} + ≈${usd(est)} > ${usd(BUDGET)})`);
            continue;
          }
          reserved += est;
          console.log(`→ ${s.id} (${s.size}, ${q}, ${refs.length} réf.) …`);
          const res = await generate({ model: MODEL, prompt: s.prompt, size: s.size, quality: q, background: s.background, refs: refs.map(({ name, bytes }) => ({ name, bytes })) }).finally(() => {
            reserved -= est;
          });
          const cost = costOf(MODEL, res.usage);
          const at = new Date().toISOString();
          ledger.lines.push({ id: s.id, key, model: MODEL, quality: q, size: s.size, outputTokens: res.usage.output_tokens ?? 0, costUsd: +cost.toFixed(4), at });
          ledger.totalUsd = +(ledger.totalUsd + cost).toFixed(4);
          // Original conservé en WebP quasi sans perte (q 95), alpha compris.
          const info = await sharp(res.bytes).metadata();
          const file = path.join(OUT, s.id, `${key}.webp`);
          fs.mkdirSync(path.dirname(file), { recursive: true });
          await sharp(res.bytes).webp({ quality: 95, alphaQuality: 100, effort: 5 }).toFile(file);
          const version: Version = {
            key, file: rel(file), model: MODEL, quality: q, size: s.size, width: info.width!, height: info.height!,
            prompt: s.prompt, refs: refs.map((r) => r.label), usage: res.usage, costUsd: +cost.toFixed(4), ms: res.ms, generatedAt: at,
          };
          gen[s.id] = { ...gen[s.id], current: key, versions: [...(gen[s.id]?.versions ?? []).filter((v) => v.key !== key), version] };
          save();
          done++;
          console.log(`✓ ${s.id} ${info.width}×${info.height} en ${(res.ms / 1000).toFixed(0)} s · ${res.usage.output_tokens ?? "?"} jetons de sortie · ${usd(cost)} → ${version.file}`);
        } catch (e) {
          const err = e as Error;
          console.log(`✗ ${s.id} : ${err.message}${e instanceof OpenAIError ? ` (HTTP ${e.status}${e.code ? `, ${e.code}` : ""})` : ""}`);
          if (e instanceof OpenAIError && (e.status === 401 || e.code === "insufficient_quota" || e.code === "billing_hard_limit_reached")) {
            queue.length = 0;
          }
        }
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  }
  save();
  console.log(`\n${done} image(s) générée(s). Dépense cumulée : ${usd(ledger.totalUsd)} / ${usd(BUDGET)}.`);
  if (done) console.log("Vérifiez les originaux (brand/generated/), puis : npm run images:openai -- publish <emplacement>");
}

/** Revient à une version déjà payée d'un emplacement (aucune requête) : use <emplacement> <clé>. */
function use([id, key]: string[]) {
  if (!gen[id]?.versions.some((v) => v.key === key)) throw new Error(`Version inconnue : ${id} ${key}`);
  gen[id].current = key;
  save();
  console.log(`${id} → version ${key} (à republier : publish ${id})`);
}

/** Supprime les originaux écartés (ni retenus, ni publiés, ni gelés comme référence 4K) ; le registre garde la trace de leur coût. */
function prune() {
  let n = 0;
  const masters = new Set(MASTER_FILES);
  for (const e of Object.values(gen)) {
    const keep = new Set([e.current, e.published?.key, ...e.versions.filter((v) => masters.has(v.file)).map((v) => v.key)]);
    for (const v of e.versions.filter((x) => !keep.has(x.key))) {
      fs.rmSync(path.join(ROOT, v.file), { force: true });
      n++;
    }
    e.versions = e.versions.filter((x) => keep.has(x.key));
  }
  save();
  console.log(`${n} original(aux) écarté(s) supprimé(s).`);
}

if (command === "status") status();
else if (command === "use") use(positional);
else if (command === "prune") prune();
else if (command === "publish") await publish(positional);
else await run();
