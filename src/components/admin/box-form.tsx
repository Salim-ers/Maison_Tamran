"use client";

import type { BoxRow } from "@/lib/catalog";
import { saveBox } from "@/app/actions/admin/catalog";
import { AdminForm, CheckboxField, FormActions, SelectField, SubmitButton, TextArea, TextField, useAdminForm } from "./form";
import { CompositionEditor, ListEditor } from "./editors";
import { centsToInput } from "./format";
import { BOX_KINDS, PRODUCT_STATUS, PRODUCT_STATUS_HELP } from "./labels";
import { inputCls, labelCls, hintCls } from "./styles";
import { useId } from "react";

function PriceField({ defaultValue }: { defaultValue: string }) {
  const id = useId();
  const { state } = useAdminForm();
  const err = state.fieldErrors?.priceCents;
  return (
    <div>
      <label htmlFor={id} className={labelCls}>Prix TTC</label>
      <div className="relative">
        <input id={id} name="priceCents" inputMode="decimal" defaultValue={defaultValue} placeholder="Vide = sur devis" aria-invalid={err ? true : undefined} aria-describedby={`${id}-h${err ? ` ${id}-e` : ""}`} className={`${inputCls} pr-9`} />
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink-soft">€</span>
      </div>
      <p id={`${id}-h`} className={hintCls}>Prix de base du coffret. Les suppléments par recette s&apos;ajoutent.</p>
      {err && <p id={`${id}-e`} role="alert" className="mt-1 text-xs text-danger">{err}</p>}
    </div>
  );
}

function CompositionError() {
  const { state } = useAdminForm();
  const err = state.fieldErrors?.composition;
  return err ? <p role="alert" className="text-xs text-danger">{err}</p> : null;
}

export function BoxForm({ box, products, demo }: { box: BoxRow | null; products: { slug: string; name: string }[]; demo: boolean }) {
  const b = box;
  return (
    <AdminForm action={saveBox} hidden={{ id: b?.id }} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="name" label="Nom" defaultValue={b?.name} required />
        <TextField name="slug" label="Slug (adresse)" defaultValue={b?.slug} required />
        <SelectField name="kind" label="Type" defaultValue={b?.kind ?? "signature"} options={Object.entries(BOX_KINDS).map(([value, label]) => ({ value, label }))} required />
        <TextField name="pieces" label="Nombre de pièces" type="number" defaultValue={b?.pieces} hint="Vide pour un coffret sur devis au contenu libre." />
        <PriceField defaultValue={centsToInput(b?.priceCents)} />
        <TextField name="stock" label="Stock de boîtes vides" type="number" defaultValue={b?.stock ?? 0} required />
        <SelectField
          name="status"
          label="Statut"
          defaultValue={b?.status ?? "prototype"}
          options={Object.entries(PRODUCT_STATUS).map(([value, label]) => ({ value, label }))}
          hint={`${PRODUCT_STATUS_HELP.prototype} Mode actuel : ${demo ? "démonstration" : "paiements réels"}.`}
        />
        <TextField name="sortOrder" label="Ordre d'affichage" type="number" defaultValue={b?.sortOrder ?? 0} required />
        <CheckboxField name="configurable" label="Composable par le client" defaultChecked={b?.configurable ?? true} hint="Le client choisit les recettes dans le configurateur." />
        <CheckboxField name="quoteOnly" label="Sur devis uniquement" defaultChecked={b?.quoteOnly} hint="Non vendu en ligne : renvoie vers la demande de devis professionnelle." />
        <TextArea name="description" label="Description" defaultValue={b?.description} rows={4} className="sm:col-span-2" />
      </div>
      <ListEditor legend="Détails" name="details" initial={b?.details ?? []} hint="Une ligne par détail (dimensions, finition, contenu…). Lignes vides ignorées." addLabel="Ajouter un détail" />
      <CompositionEditor products={products} initial={b?.fixedComposition ?? {}} pieces={b?.pieces ?? null} enabled={!!b?.fixedComposition} />
      <CompositionError />
      <FormActions>
        <SubmitButton>{b ? "Enregistrer le coffret" : "Créer le coffret"}</SubmitButton>
      </FormActions>
    </AdminForm>
  );
}
