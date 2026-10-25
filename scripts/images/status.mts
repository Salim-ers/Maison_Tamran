// État du pipeline : photos validées, candidats en attente, emplacements manquants et quota du jour.
// Usage : npm run images:status
import { SHOTS } from "./shots";
import { UsageLedger, dailyBudget, remoteNeuronsToday, FREE_DAILY_NEURONS } from "./cloudflare";
import { LEDGER, MANIFEST, candidates, readJson, type ManifestEntry } from "./store";

const manifest = readJson<Record<string, ManifestEntry>>(MANIFEST, {});
let approved = 0;
let pending = 0;
for (const s of SHOTS) {
  const n = candidates(s.id).length;
  const ok = manifest[s.id];
  if (ok) approved++;
  else if (n) pending++;
  const state = ok ? `validée   public${ok.url}` : n ? `${n} candidat(s) à valider` : "à générer";
  console.log(`${String(s.priority).padStart(2)}  ${s.id.padEnd(28)} ${state}`);
}
console.log(`\n${approved} validée(s) · ${pending} en attente · ${SHOTS.length - approved - pending} à générer (sur ${SHOTS.length})`);

const local = new UsageLedger(LEDGER).used;
const hasCredentials = Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN);
const remote = hasCredentials ? await remoteNeuronsToday() : null;
console.log(
  `Quota du jour (UTC) : ${local.toFixed(0)} neurones estimés par ce pipeline` +
    (remote !== null ? ` · ${remote.toFixed(0)} relevés par Cloudflare sur le compte` : "") +
    ` · budget ${dailyBudget()} / allocation gratuite ${FREE_DAILY_NEURONS}`
);
