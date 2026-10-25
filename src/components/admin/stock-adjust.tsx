"use client";

import { adjustStock } from "@/app/actions/admin/catalog";
import { AdminForm, useAdminForm } from "./form";
import { btnSecondary, btnSmall, inputCls } from "./styles";

function Inner({ value, label, step }: { value: number; label: string; step: number }) {
  const { state, pending } = useAdminForm();
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-1.5 lg:flex-nowrap" role="group" aria-label={`Ajuster le stock : ${label}`}>
        <button type="submit" name="op" value={`delta:-${step}`} className={`${btnSecondary} ${btnSmall} tabular-nums`} disabled={pending} aria-label={`Retirer ${step}`}>−{step}</button>
        <button type="submit" name="op" value="delta:-1" className={`${btnSecondary} ${btnSmall}`} disabled={pending} aria-label="Retirer 1">−1</button>
        <button type="submit" name="op" value="delta:1" className={`${btnSecondary} ${btnSmall}`} disabled={pending} aria-label="Ajouter 1">+1</button>
        <button type="submit" name="op" value={`delta:${step}`} className={`${btnSecondary} ${btnSmall} tabular-nums`} disabled={pending} aria-label={`Ajouter ${step}`}>+{step}</button>
        <input
          key={value}
          name="value"
          type="number"
          min={0}
          defaultValue={value}
          aria-label={`Nouveau stock : ${label}`}
          className={`${inputCls.replace("w-full", "")} !w-20 min-h-7 py-1 text-right tabular-nums`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.currentTarget.form?.querySelector('button[value="set"]') as HTMLButtonElement | null)?.click();
            }
          }}
        />
        <button type="submit" name="op" value="set" className={`${btnSecondary} ${btnSmall}`} disabled={pending}>Définir</button>
      </div>
      {state.error && <span role="alert" className="text-xs text-danger">{state.error}</span>}
      {state.ok && <span role="status" className="text-xs text-success">{state.message}</span>}
    </div>
  );
}

/** Ajustement rapide d'un stock (+/−, ou saisie directe). */
export function StockAdjust({ kind, id, value, label, step = 6 }: { kind: "product" | "box" | "variant"; id: string; value: number; label: string; step?: number }) {
  return (
    <AdminForm action={adjustStock} hidden={{ kind, id }} showStatus={false}>
      <Inner value={value} label={label} step={step} />
    </AdminForm>
  );
}
