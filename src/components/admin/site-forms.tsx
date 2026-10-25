"use client";

import { useState } from "react";
import { createTestimonial, moderateTestimonial, saveContent, savePromo, saveSettings, saveShippingRate, setMessageHandled } from "@/app/actions/admin/site";
import { ActionButton, AdminForm, CheckboxField, ConfirmSubmit, FormActions, MoneyField, SelectField, SubmitButton, TextArea, TextField } from "./form";
import { centsToInput, dateToInput } from "./format";
import { PROMO_KIND } from "./labels";

// ---------------------------------------------------------------------------
// Promotions
// ---------------------------------------------------------------------------
export interface PromoRow {
  id: string;
  code: string;
  kind: "percent" | "fixed" | "free_shipping";
  value: number;
  minSubtotalCents: number;
  startsAt: Date | null;
  endsAt: Date | null;
  maxUses: number | null;
  uses: number;
  active: boolean;
  note: string | null;
}

export function PromoForm({ p }: { p?: PromoRow }) {
  const [kind, setKind] = useState<PromoRow["kind"]>(p?.kind ?? "percent");
  return (
    <AdminForm action={savePromo} hidden={{ id: p?.id }} resetOnSuccess={!p} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <TextField name="code" label="Code" defaultValue={p?.code} required hint="Converti en majuscules." />
      <div>
        <label htmlFor={`kind-${p?.id ?? "new"}`} className="mb-1 block text-[0.8125rem] font-medium">Type</label>
        <select id={`kind-${p?.id ?? "new"}`} name="kind" value={kind} onChange={(e) => setKind(e.target.value as PromoRow["kind"])} className="block min-h-10 w-full rounded-[2px] border border-line bg-cream px-3 py-2 text-sm focus:border-chocolate focus:outline-none focus:ring-1 focus:ring-chocolate">
          {Object.entries(PROMO_KIND).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      {kind === "percent" && <TextField name="percentValue" label="Remise (%)" type="number" min={1} max={100} defaultValue={p?.kind === "percent" ? p.value : ""} required />}
      {kind === "fixed" && <MoneyField name="fixedValue" label="Remise (€ TTC)" defaultValue={p?.kind === "fixed" ? centsToInput(p.value) : ""} required />}
      {kind === "free_shipping" && <p className="self-end pb-2 text-sm text-ink-soft">Les frais de livraison sont offerts.</p>}
      <MoneyField name="minSubtotalCents" label="Minimum d'achat" defaultValue={centsToInput(p?.minSubtotalCents ?? 0)} required hint="0 si aucun." />
      <TextField name="startsAt" label="Début" type="date" defaultValue={dateToInput(p?.startsAt)} />
      <TextField name="endsAt" label="Fin (incluse)" type="date" defaultValue={dateToInput(p?.endsAt)} />
      <TextField name="maxUses" label="Utilisations max." type="number" min={1} defaultValue={p?.maxUses} hint="Vide : illimité." />
      <CheckboxField name="active" label="Actif" defaultChecked={p?.active ?? true} className="self-end pb-2" />
      <TextField name="note" label="Note interne" defaultValue={p?.note} className="sm:col-span-2 lg:col-span-4" />
      <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
        <SubmitButton small>{p ? "Enregistrer le code" : "Créer le code"}</SubmitButton>
        {p && (
          <ConfirmSubmit small name="intent" value="delete" question={`Supprimer le code ${p.code} ?`} confirmLabel="Supprimer">
            Supprimer
          </ConfirmSubmit>
        )}
      </div>
    </AdminForm>
  );
}

// ---------------------------------------------------------------------------
// Livraison
// ---------------------------------------------------------------------------
export interface ShippingRow {
  id: string;
  name: string;
  description: string | null;
  countries: string[];
  priceCents: number;
  freeAboveCents: number | null;
  minSubtotalCents: number;
  active: boolean;
  provisional: boolean;
  sortOrder: number;
}

export function ShippingForm({ r }: { r?: ShippingRow }) {
  return (
    <AdminForm action={saveShippingRate} hidden={{ id: r?.id }} resetOnSuccess={!r} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <TextField name="name" label="Nom" defaultValue={r?.name} required />
      <TextField name="countries" label="Pays (codes ISO)" defaultValue={r?.countries.join(", ")} required hint="Séparés par des virgules : FR, BE, LU." />
      <MoneyField name="priceCents" label="Prix TTC" defaultValue={centsToInput(r?.priceCents)} required />
      <MoneyField name="freeAboveCents" label="Offert à partir de" defaultValue={centsToInput(r?.freeAboveCents)} placeholder="Jamais" hint="Vide : jamais offert." />
      <MoneyField name="minSubtotalCents" label="Minimum de commande" defaultValue={centsToInput(r?.minSubtotalCents ?? 0)} required />
      <TextField name="sortOrder" label="Ordre" type="number" defaultValue={r?.sortOrder ?? 0} required />
      <CheckboxField name="active" label="Actif" defaultChecked={r?.active ?? true} className="self-end pb-2" />
      <CheckboxField name="provisional" label="Tarif provisoire" defaultChecked={r?.provisional ?? true} hint="Non contractualisé avec un transporteur." className="self-end" />
      <TextArea name="description" label="Description (affichée au client)" defaultValue={r?.description} rows={2} className="sm:col-span-2 lg:col-span-4" hint="N'annoncez pas de délai garanti tant qu'il n'est pas contractualisé." />
      <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
        <SubmitButton small>{r ? "Enregistrer le tarif" : "Créer le tarif"}</SubmitButton>
        {r && (
          <ConfirmSubmit small name="intent" value="delete" question={`Supprimer « ${r.name} » ?`} confirmLabel="Supprimer">
            Supprimer
          </ConfirmSubmit>
        )}
      </div>
    </AdminForm>
  );
}

// ---------------------------------------------------------------------------
// Contenu
// ---------------------------------------------------------------------------
export function ContentForm({
  entryKey, fields, values, customized,
}: {
  entryKey: string;
  fields: { name: string; label: string; type: "text" | "textarea"; help?: string }[];
  values: Record<string, string>;
  customized: boolean;
}) {
  return (
    <AdminForm action={saveContent} hidden={{ key: entryKey }} className="space-y-4">
      {fields.map((f) =>
        f.type === "textarea" ? (
          <TextArea key={f.name} name={f.name} label={f.label} defaultValue={values[f.name]} rows={Math.min(14, Math.max(3, Math.ceil((values[f.name]?.length ?? 0) / 110)))} hint={f.help} />
        ) : (
          <TextField key={f.name} name={f.name} label={f.label} defaultValue={values[f.name]} hint={f.help} />
        )
      )}
      <FormActions className="mt-4 pt-4">
        <SubmitButton name="intent" value="save">Enregistrer et publier</SubmitButton>
        {customized && (
          <ConfirmSubmit name="intent" value="reset" variant="secondary" question="Rétablir le texte d'origine ? Vos modifications seront perdues." confirmLabel="Rétablir">
            Rétablir le texte par défaut
          </ConfirmSubmit>
        )}
      </FormActions>
    </AdminForm>
  );
}

// ---------------------------------------------------------------------------
// Témoignages
// ---------------------------------------------------------------------------
export function ModerationButtons({ id, status }: { id: string; status: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {status !== "approved" && <ActionButton action={moderateTestimonial} fields={{ id, intent: "approved" }} label="Approuver et publier" variant="primary" />}
      {status !== "rejected" && <ActionButton action={moderateTestimonial} fields={{ id, intent: "rejected" }} label={status === "approved" ? "Dépublier (refuser)" : "Refuser"} />}
      {status !== "pending" && <ActionButton action={moderateTestimonial} fields={{ id, intent: "pending" }} label="Remettre en attente" />}
      <ActionButton action={moderateTestimonial} fields={{ id, intent: "delete" }} label="Supprimer" confirm="Supprimer définitivement ce témoignage ?" confirmLabel="Supprimer" variant="danger" />
    </div>
  );
}

export function NewTestimonialForm({ products }: { products: { slug: string; name: string }[] }) {
  return (
    <AdminForm action={createTestimonial} resetOnSuccess className="grid gap-3 sm:grid-cols-2">
      <TextField name="authorName" label="Nom affiché" required hint="Prénom et initiale suffisent (ex. Claire M.), avec l'accord de l'auteur." />
      <TextField name="authorCity" label="Ville" />
      <SelectField name="productSlug" label="Recette concernée" options={products.map((p) => ({ value: p.slug, label: p.name }))} placeholder="Aucune en particulier" />
      <SelectField name="rating" label="Note" options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} sur 5` }))} placeholder="Sans note" />
      <TextArea name="body" label="Témoignage" required rows={4} className="sm:col-span-2" hint="Texte exact de l'auteur. Ne le réécrivez pas." />
      <TextField name="source" label="Source" required className="sm:col-span-2" hint="D'où vient cet avis ? Ex. « Email du client du 12/10/2026 », « Message Instagram de @… ». Conservé pour justifier l'authenticité." />
      <TextField name="orderNumber" label="Numéro de commande (achat vérifié)" placeholder="TB-2026-…" hint="Facultatif. Si renseigné, l'avis est marqué « achat vérifié »." />
      <CheckboxField name="approve" label="Publier immédiatement" className="self-end pb-2" />
      <div className="sm:col-span-2">
        <SubmitButton>Ajouter le témoignage</SubmitButton>
      </div>
    </AdminForm>
  );
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------
export function HandledButton({ id, handled }: { id: string; handled: boolean }) {
  return <ActionButton action={setMessageHandled} fields={{ id, handled: handled ? "0" : "1" }} label={handled ? "Marquer à traiter" : "Marquer comme traité"} variant={handled ? "secondary" : "primary"} />;
}

// ---------------------------------------------------------------------------
// Réglages
// ---------------------------------------------------------------------------
const LEGAL_FIELDS: { key: string; label: string; area?: boolean }[] = [
  { key: "companyName", label: "Raison sociale" },
  { key: "legalForm", label: "Forme juridique et capital" },
  { key: "address", label: "Adresse du siège", area: true },
  { key: "siret", label: "SIRET" },
  { key: "rcs", label: "RCS" },
  { key: "vat", label: "N° de TVA intracommunautaire" },
  { key: "director", label: "Directeur de la publication" },
  { key: "host", label: "Hébergeur", area: true },
  { key: "dbHost", label: "Hébergeur de la base de données", area: true },
  { key: "mediator", label: "Médiateur de la consommation", area: true },
];

export function SettingsForm({ s }: { s: { giftWrapCents: number; giftWrapLabel: string; contactEmail: string; legal: Record<string, string>; social: Record<string, string> } }) {
  return (
    <AdminForm action={saveSettings} className="space-y-8">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 font-display text-xl">Emballage cadeau et contact</legend>
        <MoneyField name="giftWrapCents" label="Prix de l'emballage cadeau (TTC)" defaultValue={centsToInput(s.giftWrapCents)} required />
        <TextField name="giftWrapLabel" label="Description de l'emballage cadeau" defaultValue={s.giftWrapLabel} required />
        <TextField name="contactEmail" label="Email de contact" type="email" defaultValue={s.contactEmail} required hint="Affiché sur le site et utilisé comme adresse de réponse." />
      </fieldset>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-1 font-display text-xl">Informations légales</legend>
        <p className="text-sm text-ink-soft sm:col-span-2">Reprises dans les mentions légales, les CGV et les PDF de devis. Remplacez chaque mention « à compléter » avant la mise en ligne.</p>
        {LEGAL_FIELDS.map((f) =>
          f.area ? (
            <TextArea key={f.key} name={`legal_${f.key}`} label={f.label} defaultValue={s.legal[f.key]} rows={2} />
          ) : (
            <TextField key={f.key} name={`legal_${f.key}`} label={f.label} defaultValue={s.legal[f.key]} />
          )
        )}
      </fieldset>
      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-1 font-display text-xl">Réseaux sociaux</legend>
        <p className="text-sm text-ink-soft sm:col-span-3">Laissez vide pour masquer l&apos;icône sur le site.</p>
        <TextField name="social_instagram" label="Instagram" type="url" defaultValue={s.social.instagram} placeholder="https://instagram.com/…" />
        <TextField name="social_pinterest" label="Pinterest" type="url" defaultValue={s.social.pinterest} placeholder="https://pinterest.com/…" />
        <TextField name="social_linkedin" label="LinkedIn" type="url" defaultValue={s.social.linkedin} placeholder="https://linkedin.com/company/…" />
      </fieldset>
      <FormActions>
        <SubmitButton>Enregistrer les réglages</SubmitButton>
      </FormActions>
    </AdminForm>
  );
}
