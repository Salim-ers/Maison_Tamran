"use client";

import { useState } from "react";
import { saveProposal, saveQuoteMeta, saveTier } from "@/app/actions/admin/quotes";
import { AdminForm, CheckboxField, ConfirmSubmit, SelectField, SubmitButton, TextArea, TextField, useAdminForm } from "./form";
import { centsToInput, fmtEuros, parseEuros } from "./format";
import { QUOTE_STATUS } from "./labels";
import { btnGhost, btnSecondary, btnSmall, inputCls, labelCls } from "./styles";

export function QuoteMetaForm({ id, status, internalNotes }: { id: string; status: string; internalNotes: string | null }) {
  return (
    <AdminForm action={saveQuoteMeta} hidden={{ id }} className="space-y-3">
      <SelectField name="status" label="Statut" defaultValue={status} options={Object.entries(QUOTE_STATUS).map(([value, label]) => ({ value, label }))} />
      <TextArea name="internalNotes" label="Notes internes" defaultValue={internalNotes} rows={5} hint="Jamais visibles par le client ni imprimées sur les PDF." />
      <SubmitButton small>Enregistrer</SubmitButton>
    </AdminForm>
  );
}

type Line = { k: number; label: string; qty: string; unit: string };
interface Tier { id: string; minQuantity: number; discountPercent: number; label: string | null }

function LinesError() {
  const { state } = useAdminForm();
  return state.fieldErrors?.lines ? <p role="alert" className="text-xs text-danger">{state.fieldErrors.lines}</p> : null;
}

export function ProposalForm({
  id, initial, suggestions, tiers, status,
}: {
  id: string;
  initial: { lines: { label: string; quantity: number; unitCents: number }[]; shippingCents: number; validUntil?: string; notes?: string } | null;
  suggestions: { label: string; quantity: number }[];
  tiers: Tier[];
  status: string;
}) {
  const startLines = (initial?.lines ?? []).filter((l) => !l.label.startsWith("Remise dégressive"));
  const appliedTier = initial?.lines.find((l) => l.label.startsWith("Remise dégressive"));
  const [lines, setLines] = useState<Line[]>(() =>
    (startLines.length ? startLines.map((l) => ({ label: l.label, qty: String(l.quantity), unit: centsToInput(l.unitCents) })) : suggestions.length ? suggestions.map((s) => ({ label: s.label, qty: String(s.quantity), unit: "" })) : [{ label: "", qty: "", unit: "" }]).map(
      (l, i) => ({ ...l, k: i })
    )
  );
  const [seq, setSeq] = useState(lines.length + 1);
  const [shipping, setShipping] = useState(centsToInput(initial?.shippingCents ?? 0));
  const maxQty = Math.max(0, ...lines.map((l) => Number(l.qty) || 0));
  const suggested = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity).find((t) => maxQty >= t.minQuantity);
  const defaultTier = appliedTier ? (tiers.find((t) => appliedTier.label.includes(`−${t.discountPercent} %`))?.id ?? "") : "";
  const [tierId, setTierId] = useState(defaultTier);
  const tier = tiers.find((t) => t.id === tierId);

  const subtotal = lines.reduce((a, l) => a + (Number(l.qty) || 0) * (parseEuros(l.unit) ?? 0), 0);
  const discount = tier ? Math.round((subtotal * tier.discountPercent) / 100) : 0;
  const ship = parseEuros(shipping) ?? 0;
  const update = (k: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.k === k ? { ...l, ...patch } : l)));

  return (
    <AdminForm action={saveProposal} hidden={{ id }} className="space-y-5">
      <fieldset>
        <legend className={labelCls}>Lignes (prix unitaires HT)</legend>
        <div className="hidden grid-cols-[1fr_6rem_8rem_7rem_auto] gap-2 px-0.5 pb-1 text-xs text-ink-soft sm:grid" aria-hidden>
          <span>Libellé</span><span>Quantité</span><span>Prix unitaire HT</span><span className="text-right">Total HT</span><span />
        </div>
        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={l.k} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_6rem_8rem_7rem_auto] sm:items-center">
              <input name="lineLabel" value={l.label} onChange={(e) => update(l.k, { label: e.target.value })} aria-label={`Libellé, ligne ${i + 1}`} className={`${inputCls} col-span-2 sm:col-span-1`} />
              <input name="lineQty" value={l.qty} onChange={(e) => update(l.k, { qty: e.target.value })} inputMode="numeric" aria-label={`Quantité, ligne ${i + 1}`} className={`${inputCls} text-right tabular-nums`} />
              <input name="lineUnit" value={l.unit} onChange={(e) => update(l.k, { unit: e.target.value })} inputMode="decimal" placeholder="0,00" aria-label={`Prix unitaire HT en euros, ligne ${i + 1}`} className={`${inputCls} text-right tabular-nums`} />
              <span className="text-right text-sm tabular-nums">{fmtEuros((Number(l.qty) || 0) * (parseEuros(l.unit) ?? 0))}</span>
              <button type="button" className={btnGhost} onClick={() => setLines((ls) => ls.filter((x) => x.k !== l.k))} aria-label={`Supprimer la ligne ${i + 1}`}>
                Retirer
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={`${btnSecondary} ${btnSmall} mt-2`}
          onClick={() => {
            setLines((ls) => [...ls, { k: seq, label: "", qty: "", unit: "" }]);
            setSeq((s) => s + 1);
          }}
        >
          Ajouter une ligne
        </button>
        <LinesError />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`ship-${id}`} className={labelCls}>Frais de livraison HT<span aria-hidden className="text-danger"> *</span></label>
          <div className="relative">
            <input id={`ship-${id}`} name="shippingCents" value={shipping} onChange={(e) => setShipping(e.target.value)} inputMode="decimal" className={`${inputCls} pr-9`} />
            <span aria-hidden className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink-soft">€</span>
          </div>
        </div>
        <TextField name="validUntil" label="Valable jusqu'au" type="date" defaultValue={initial?.validUntil} />
        <div className="sm:col-span-2">
          <label htmlFor={`tier-${id}`} className={labelCls}>Tarif dégressif</label>
          <select id={`tier-${id}`} name="tierId" value={tierId} onChange={(e) => setTierId(e.target.value)} className={inputCls} disabled={!tiers.length} aria-describedby={`tier-${id}-h`}>
            <option value="">Aucun</option>
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>{t.label ?? `Dès ${t.minQuantity} unités`} : −{t.discountPercent} %</option>
            ))}
          </select>
          <p id={`tier-${id}-h`} className="mt-1 text-xs text-ink-soft">
            {tiers.length
              ? <>Appliqué sous forme de ligne de remise sur le sous-total HT.{suggested ? ` Suggestion pour ${maxQty} unités : « ${suggested.label ?? `dès ${suggested.minQuantity}`} ».` : ""}</>
              : "Aucun tarif dégressif actif. Activez-en un dans « Tarifs dégressifs » une fois validé."}
          </p>
        </div>
        <TextArea name="notes" label="Conditions et remarques" defaultValue={initial?.notes} rows={3} className="sm:col-span-2" hint="Imprimées sur la proposition PDF (délais, acompte, personnalisation…)." />
      </div>

      <dl className="ml-auto max-w-sm space-y-1 text-sm tabular-nums" aria-live="polite">
        <div className="flex justify-between"><dt>Sous-total HT</dt><dd>{fmtEuros(subtotal)}</dd></div>
        {discount > 0 && <div className="flex justify-between"><dt>Remise dégressive (−{tier?.discountPercent} %)</dt><dd>−{fmtEuros(discount)}</dd></div>}
        <div className="flex justify-between"><dt>Livraison HT</dt><dd>{fmtEuros(ship)}</dd></div>
        <div className="flex justify-between border-t border-line pt-1 font-semibold"><dt>Total HT</dt><dd>{fmtEuros(subtotal - discount + ship)}</dd></div>
        <div className="text-xs text-ink-soft">TVA à appliquer selon le taux en vigueur.</div>
      </dl>

      <CheckboxField name="markQuoted" label="Passer le statut à « Proposition envoyée »" defaultChecked={status === "new" || status === "in_review"} />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton name="intent" value="save">Enregistrer la proposition</SubmitButton>
        {initial && (
          <ConfirmSubmit name="intent" value="clear" question="Supprimer la proposition ?" confirmLabel="Supprimer">
            Supprimer la proposition
          </ConfirmSubmit>
        )}
      </div>
    </AdminForm>
  );
}

export function TierForm({ t }: { t?: { id: string; minQuantity: number; discountPercent: number; label: string | null; active: boolean } }) {
  return (
    <AdminForm action={saveTier} hidden={{ id: t?.id }} resetOnSuccess={!t} className="grid items-end gap-3 sm:grid-cols-[8rem_7rem_1fr_auto_auto]">
      <TextField name="minQuantity" label="À partir de (unités)" type="number" defaultValue={t?.minQuantity} required />
      <TextField name="discountPercent" label="Remise (%)" type="number" defaultValue={t?.discountPercent} required />
      <TextField name="label" label="Libellé" defaultValue={t?.label} placeholder="À partir de 50 coffrets" />
      <CheckboxField name="active" label="Actif" defaultChecked={t?.active ?? false} className="pb-2" />
      <div className="flex gap-2 pb-0.5">
        <SubmitButton small>{t ? "Enregistrer" : "Ajouter"}</SubmitButton>
        {t && (
          <ConfirmSubmit small name="intent" value="delete" question="Supprimer ce tarif ?" confirmLabel="Supprimer">
            Supprimer
          </ConfirmSubmit>
        )}
      </div>
    </AdminForm>
  );
}
