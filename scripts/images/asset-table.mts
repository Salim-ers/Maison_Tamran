// Tableau Markdown des visuels générés (docs/asset-manifest.md) : définition native, version publiée, usage.
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./store";
import { SHOTS } from "./openai-shots";

const gen = JSON.parse(fs.readFileSync(path.join(ROOT, "brand/generated/manifest.json"), "utf8"));
const led = JSON.parse(fs.readFileSync(path.join(ROOT, "brand/generated/ledger.json"), "utf8"));
const rows = SHOTS.map((s) => {
  const e = gen[s.id];
  const v = e?.versions.find((x: { key: string }) => x.key === e.current);
  const pub = e?.published;
  return `| \`${s.id}\` | ${v ? `${v.width} × ${v.height}` : "—"} | ${pub ? `${pub.w} × ${pub.h}` : "—"} | ${s.usage} |`;
});
console.log(["| Emplacement | Original (natif) | Publié | Usage |", "| --- | --- | --- | --- |", ...rows].join("\n"));
console.log(`\n${led.lines.length} générations facturées, ${led.totalUsd.toFixed(2)} USD au total (brand/generated/ledger.json).`);
