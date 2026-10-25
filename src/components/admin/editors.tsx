"use client";

import { useId, useState } from "react";
import { btnGhost, btnSecondary, btnSmall, inputCls, labelCls, hintCls } from "./styles";

/** Liste éditable de paires libellé / valeur (ex. valeurs nutritionnelles). */
export function PairsEditor({
  legend, labelName, valueName, initial, labelHeader = "Libellé", valueHeader = "Valeur", hint, addLabel = "Ajouter une ligne", suggestions,
}: {
  legend: string;
  labelName: string;
  valueName: string;
  initial: [string, string][];
  labelHeader?: string;
  valueHeader?: string;
  hint?: string;
  addLabel?: string;
  suggestions?: string[];
}) {
  const [rows, setRows] = useState<{ k: number; l: string; v: string }[]>(() => (initial.length ? initial : [["", ""]]).map(([l, v], i) => ({ k: i, l, v })));
  const [seq, setSeq] = useState(rows.length);
  const id = useId();
  return (
    <fieldset>
      <legend className={labelCls}>{legend}</legend>
      {hint && <p className={`${hintCls} mb-2 mt-0`}>{hint}</p>}
      {suggestions && (
        <datalist id={`${id}-sugg`}>
          {suggestions.map((s) => <option key={s} value={s} />)}
        </datalist>
      )}
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={r.k} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
            <input
              name={labelName}
              defaultValue={r.l}
              aria-label={`${labelHeader}, ligne ${i + 1}`}
              placeholder={labelHeader}
              list={suggestions ? `${id}-sugg` : undefined}
              className={inputCls}
            />
            <input name={valueName} defaultValue={r.v} aria-label={`${valueHeader}, ligne ${i + 1}`} placeholder={valueHeader} className={inputCls} />
            <button type="button" className={btnGhost} onClick={() => setRows((rs) => rs.filter((x) => x.k !== r.k))} aria-label={`Supprimer la ligne ${i + 1}`}>
              Retirer
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className={`${btnSecondary} ${btnSmall} mt-2`}
        onClick={() => {
          setRows((rs) => [...rs, { k: seq, l: "", v: "" }]);
          setSeq((s) => s + 1);
        }}
      >
        {addLabel}
      </button>
    </fieldset>
  );
}

/** Liste éditable de textes (ex. détails d'un coffret). */
export function ListEditor({ legend, name, initial, hint, addLabel = "Ajouter un élément" }: { legend: string; name: string; initial: string[]; hint?: string; addLabel?: string }) {
  const [rows, setRows] = useState<{ k: number; v: string }[]>(() => (initial.length ? initial : [""]).map((v, i) => ({ k: i, v })));
  const [seq, setSeq] = useState(rows.length);
  return (
    <fieldset>
      <legend className={labelCls}>{legend}</legend>
      {hint && <p className={`${hintCls} mb-2 mt-0`}>{hint}</p>}
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={r.k} className="flex items-center gap-2">
            <input name={name} defaultValue={r.v} aria-label={`${legend}, élément ${i + 1}`} className={inputCls} />
            <button type="button" className={btnGhost} onClick={() => setRows((rs) => rs.filter((x) => x.k !== r.k))} aria-label={`Supprimer l'élément ${i + 1}`}>
              Retirer
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className={`${btnSecondary} ${btnSmall} mt-2`}
        onClick={() => {
          setRows((rs) => [...rs, { k: seq, v: "" }]);
          setSeq((s) => s + 1);
        }}
      >
        {addLabel}
      </button>
    </fieldset>
  );
}

/** Composition imposée d'un coffret : quantité par recette, avec total en direct. */
export function CompositionEditor({
  products, initial, pieces, enabled,
}: {
  products: { slug: string; name: string }[];
  initial: Record<string, number>;
  pieces: number | null;
  enabled: boolean;
}) {
  const [on, setOn] = useState(enabled);
  const [q, setQ] = useState<Record<string, number>>(initial);
  const total = Object.values(q).reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  const id = useId();
  return (
    <fieldset className="space-y-3">
      <legend className={labelCls}>Composition imposée</legend>
      <label className="flex cursor-pointer items-start gap-2.5 text-sm">
        <input type="checkbox" name="useFixed" checked={on} onChange={(e) => setOn(e.target.checked)} className="mt-0.5 size-4 accent-[var(--color-chocolate)]" />
        <span>
          <span className="font-medium">Ce coffret a une composition imposée</span>
          <span className={`${hintCls} block`}>Pour les éditions limitées : le client ne choisit pas les recettes. Le total doit égaler le nombre de pièces du coffret.</span>
        </span>
      </label>
      {on && (
        <div className="rounded-[2px] border border-line p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {products.map((p) => (
              <div key={p.slug} className="flex items-center justify-between gap-3">
                <label htmlFor={`${id}-${p.slug}`} className="text-sm">{p.name}</label>
                <input
                  id={`${id}-${p.slug}`}
                  name={`comp:${p.slug}`}
                  type="number"
                  min={0}
                  max={500}
                  inputMode="numeric"
                  value={q[p.slug] ?? ""}
                  onChange={(e) => setQ((x) => ({ ...x, [p.slug]: e.target.value === "" ? 0 : Number(e.target.value) }))}
                  className={`${inputCls} w-20 text-right tabular-nums`}
                />
              </div>
            ))}
          </div>
          <p className={`mt-3 text-sm ${pieces != null && total !== pieces ? "text-danger" : "text-success"}`} aria-live="polite">
            Total : {total} pièce{total > 1 ? "s" : ""}
            {pieces != null ? ` sur ${pieces} attendue${pieces > 1 ? "s" : ""}` : " (nombre de pièces du coffret non renseigné)"}
          </p>
        </div>
      )}
    </fieldset>
  );
}
