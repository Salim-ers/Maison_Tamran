"use client";

import { saveCollection } from "@/app/actions/admin/catalog";
import { AdminForm, CheckboxField, ConfirmSubmit, SubmitButton, TextArea, TextField } from "./form";

export function CollectionForm({ c, productCount }: { c?: { id: string; name: string; slug: string; intro: string; ephemeral: boolean; sortOrder: number }; productCount?: number }) {
  return (
    <AdminForm action={saveCollection} hidden={{ id: c?.id }} resetOnSuccess={!c} className="grid gap-3 sm:grid-cols-2">
      <TextField name="name" label="Nom" defaultValue={c?.name} required />
      <TextField name="slug" label="Slug (adresse)" defaultValue={c?.slug} required hint="Adresse publique : /collections/slug." />
      <TextArea name="intro" label="Introduction" defaultValue={c?.intro} rows={3} className="sm:col-span-2" />
      <TextField name="sortOrder" label="Ordre" type="number" defaultValue={c?.sortOrder ?? 0} required />
      <CheckboxField name="ephemeral" label="Collection éphémère" defaultChecked={c?.ephemeral} hint="Recettes de saison, produites en petites séries." className="self-end" />
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <SubmitButton small>{c ? "Enregistrer la collection" : "Créer la collection"}</SubmitButton>
        {c && (
          <ConfirmSubmit small name="intent" value="delete" question={productCount ? `${productCount} recette(s) liée(s) : suppression impossible.` : `Supprimer « ${c.name} » ?`} confirmLabel="Supprimer">
            Supprimer
          </ConfirmSubmit>
        )}
      </div>
    </AdminForm>
  );
}
