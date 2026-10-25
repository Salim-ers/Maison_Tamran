"use client";

import type { ProductRow, VariantRow } from "@/lib/catalog";
import { saveProduct, saveVariant } from "@/app/actions/admin/catalog";
import {
  AdminForm, CheckboxField, ColorField, ConfirmSubmit, FormActions, MoneyField, MultiCheck, SelectField, SubmitButton, TextArea, TextField,
} from "./form";
import { PairsEditor } from "./editors";
import { centsToInput, dateToInput } from "./format";
import { PRODUCT_STATUS, PRODUCT_STATUS_HELP, SURFACES } from "./labels";

const ALLERGENS = [
  { value: "lait", label: "Lait" },
  { value: "fruits-a-coque", label: "Fruits à coque" },
  { value: "sesame", label: "Sésame" },
  { value: "soja", label: "Soja" },
  { value: "gluten", label: "Gluten" },
];
const FLAVORS = [
  { value: "agrume", label: "Agrumes" },
  { value: "fruite", label: "Fruité" },
  { value: "floral", label: "Floral" },
  { value: "torrefie", label: "Torréfié" },
  { value: "epice", label: "Épicé" },
  { value: "sale", label: "Salé" },
  { value: "vegetal", label: "Végétal" },
];
const CHOCOLATES = [
  { value: "noir", label: "Chocolat noir" },
  { value: "lait", label: "Chocolat au lait" },
  { value: "blanc", label: "Chocolat blanc" },
  { value: "blond", label: "Chocolat blond" },
];
const NUTRITION_SUGGESTIONS = ["Énergie", "Matières grasses", "dont acides gras saturés", "Glucides", "dont sucres", "Fibres", "Protéines", "Sel"];

const DEFAULT_PALETTE = { coat: "#2A1B17", coatLight: "#5B3E33", filling: "#8A5A3C", insert: "#C9A15B", accent: "#A87455", surface: "ivoire" as const };

function Section({ title, children, description }: { title: string; children: React.ReactNode; description?: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-6 first:border-t-0 first:pt-0">
      <legend className="float-left mb-4 w-full font-display text-xl">{title}</legend>
      {description && <p className="clear-both mb-4 text-sm text-ink-soft">{description}</p>}
      <div className="clear-both grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function ProductForm({ product, collections, demo }: { product: ProductRow | null; collections: { id: string; name: string }[]; demo: boolean }) {
  const p = product;
  const pal = p?.palette ?? DEFAULT_PALETTE;
  const statusOptions = Object.entries(PRODUCT_STATUS).map(([value, label]) => ({ value, label }));
  return (
    <AdminForm action={saveProduct} hidden={{ id: p?.id }} className="space-y-8">
      <Section title="Identité">
        <TextField name="name" label="Nom" defaultValue={p?.name} required maxLength={120} />
        <TextField name="slug" label="Slug (adresse)" defaultValue={p?.slug} required hint="Unique. Lettres minuscules, chiffres et tirets. Modifier le slug change l'adresse publique de la fiche." />
        <TextField name="number" label="Numéro" type="number" defaultValue={p?.number ?? 0} required hint="Numéro affiché sur la fiche (N° 01…)." />
        <SelectField name="collectionId" label="Collection" defaultValue={p?.collectionId ?? ""} options={collections.map((c) => ({ value: c.id, label: c.name }))} placeholder="Aucune collection" />
        <TextField name="pairing" label="Accord" defaultValue={p?.pairing} required hint="Ex. « Sésame noir et yuzu »." />
        <SelectField name="chocolate" label="Chocolat" defaultValue={p?.chocolate ?? "noir"} options={CHOCOLATES} required />
        <TextField name="tagline" label="Accroche" defaultValue={p?.tagline} className="sm:col-span-2" maxLength={240} />
        <TextArea name="story" label="Récit" defaultValue={p?.story} rows={6} className="sm:col-span-2" hint="N'inventez rien : pas d'histoire de fondateur, de récompense ou de provenance non vérifiée." />
      </Section>

      <Section title="Dégustation">
        <TextField name="tastingAttaque" label="Attaque" defaultValue={p?.tasting?.attaque} />
        <TextField name="tastingCoeur" label="Cœur" defaultValue={p?.tasting?.coeur} />
        <TextField name="tastingFinale" label="Finale" defaultValue={p?.tasting?.finale} />
        <div className="sm:col-span-2">
          <MultiCheck name="flavorFamilies" legend="Familles de saveurs" options={FLAVORS} defaultValues={p?.flavorFamilies ?? []} allowOther otherLabel="Autres familles (séparées par des virgules)" />
        </div>
      </Section>

      <Section
        title="Composition et informations réglementaires"
        description="Ces informations engagent la maison. Ne renseignez que des données validées (fiche technique, étiquetage). Les champs vides sont affichés « à confirmer » sur le site."
      >
        <div className="sm:col-span-2">
          <MultiCheck
            name="allergens"
            legend="Allergènes"
            options={ALLERGENS}
            defaultValues={p?.allergens ?? []}
            allowOther
            otherLabel="Autres allergènes (séparés par des virgules)"
            hint="Les 14 allergènes réglementaires doivent être déclarés s'ils sont présents."
          />
        </div>
        <TextArea name="ingredients" label="Liste des ingrédients" defaultValue={p?.ingredients} rows={4} className="sm:col-span-2" hint="Par ordre décroissant de poids, allergènes mis en évidence sur l'étiquette." />
        <TextField name="netWeightG" label="Poids net par pièce (g)" type="number" defaultValue={p?.netWeightG} min={1} hint="Laisser vide tant que non pesé et validé." />
        <TextField name="bestBefore" label="DDM / DLC" defaultValue={p?.bestBefore} hint="Uniquement si validée (ex. « À consommer de préférence dans les 21 jours »)." />
        <TextArea name="storage" label="Conservation" defaultValue={p?.storage} rows={2} />
        <TextArea name="origin" label="Origine et traçabilité" defaultValue={p?.origin} rows={2} hint="Uniquement des provenances documentées." />
        <div className="sm:col-span-2">
          <PairsEditor
            legend="Valeurs nutritionnelles (pour 100 g)"
            labelName="nutritionLabel"
            valueName="nutritionValue"
            initial={Object.entries(p?.nutrition ?? {})}
            labelHeader="Nutriment"
            valueHeader="Valeur (ex. 412 kcal)"
            hint="Laissez vide tant que l'analyse n'est pas disponible. Les lignes incomplètes sont ignorées."
            suggestions={NUTRITION_SUGGESTIONS}
          />
        </div>
        <CheckboxField
          name="regulatoryValidated"
          label="Informations réglementaires validées"
          defaultChecked={p?.regulatoryValidated}
          hint="À cocher uniquement après vérification des allergènes, ingrédients, poids, DDM et valeurs nutritionnelles. Obligatoire pour le statut « Disponible »."
          className="sm:col-span-2"
        />
      </Section>

      <Section title="Vente">
        <SelectField
          name="status"
          label="Statut"
          defaultValue={p?.status ?? "prototype"}
          options={statusOptions}
          required
          hint={
            <span className="block space-y-0.5">
              {Object.entries(PRODUCT_STATUS_HELP).map(([k, v]) => (
                <span key={k} className="block">
                  <strong className="font-semibold">{PRODUCT_STATUS[k]}</strong> : {v}
                </span>
              ))}
              <span className="block pt-1">Mode actuel : {demo ? "démonstration (les prototypes sont vendables)" : "paiements réels (seul « Disponible » est vendable)"}.</span>
            </span>
          }
        />
        <MoneyField name="boxSupplementCents" label="Supplément par pièce en coffret" defaultValue={centsToInput(p?.boxSupplementCents ?? 0)} required hint="Ajouté au prix du coffret pour chaque pièce de cette recette. 0 si aucun." />
        <TextField name="stockPieces" label="Stock de pièces (coffrets)" type="number" defaultValue={p?.stockPieces ?? 0} required hint="Pièces disponibles pour composer les coffrets. Les étuis ont leur propre stock." />
        <TextField name="sortOrder" label="Ordre d'affichage" type="number" defaultValue={p?.sortOrder ?? 0} required />
        <CheckboxField name="limited" label="Édition limitée" defaultChecked={p?.limited} className="sm:col-span-2" />
        <TextField name="availableFrom" label="Disponible à partir du" type="date" defaultValue={dateToInput(p?.availableFrom)} hint="Facultatif." />
        <TextField name="availableUntil" label="Disponible jusqu'au" type="date" defaultValue={dateToInput(p?.availableUntil)} hint="Facultatif, inclus." />
      </Section>

      <Section title="Palette" description="Couleurs utilisées pour les visuels générés, le configurateur de coffret et les accents de la fiche.">
        <div className="grid gap-4 sm:col-span-2 sm:grid-cols-3">
          <ColorField name="coat" label="Enrobage" defaultValue={pal.coat} />
          <ColorField name="coatLight" label="Enrobage, reflet" defaultValue={pal.coatLight} />
          <ColorField name="filling" label="Garniture" defaultValue={pal.filling} />
          <ColorField name="insert" label="Insert" defaultValue={pal.insert} />
          <ColorField name="accent" label="Accent" defaultValue={pal.accent} />
          <SelectField name="surface" label="Fond de mise en scène" defaultValue={pal.surface} options={SURFACES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))} />
        </div>
      </Section>

      <Section title="Référencement">
        <TextField name="seoTitle" label="Titre SEO" defaultValue={p?.seoTitle} maxLength={90} hint="60 caractères environ. Vide : le nom de la recette est utilisé." />
        <TextArea name="seoDescription" label="Description SEO" defaultValue={p?.seoDescription} rows={2} maxLength={200} hint="155 caractères environ." />
      </Section>

      <FormActions className="sticky bottom-0 z-10 -mx-5 bg-cream px-5 pb-4 sm:-mx-6 sm:px-6">
        <SubmitButton>{p ? "Enregistrer la recette" : "Créer la recette"}</SubmitButton>
      </FormActions>
    </AdminForm>
  );
}

export function VariantRowForm({ productId, v }: { productId: string; v: VariantRow }) {
  return (
    <AdminForm action={saveVariant} hidden={{ productId, id: v.id }} className="rounded-[2px] border border-line bg-ivory/40 p-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1.2fr_0.6fr_0.8fr_0.6fr_0.5fr]">
        <TextField name="sku" label="SKU" defaultValue={v.sku} required />
        <TextField name="name" label="Nom" defaultValue={v.name} required />
        <TextField name="pieces" label="Pièces" type="number" defaultValue={v.pieces} required />
        <MoneyField name="priceCents" label="Prix TTC" defaultValue={centsToInput(v.priceCents)} required />
        <TextField name="stock" label="Stock" type="number" defaultValue={v.stock} required />
        <TextField name="sortOrder" label="Ordre" type="number" defaultValue={v.sortOrder} required />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <CheckboxField name="active" label="Actif (en vente)" defaultChecked={v.active} />
        <span className="flex-1" />
        <SubmitButton small>Enregistrer l&apos;étui</SubmitButton>
        <ConfirmSubmit small name="intent" value="delete" question={`Supprimer l'étui ${v.sku} ?`} confirmLabel="Supprimer">
          Supprimer
        </ConfirmSubmit>
      </div>
    </AdminForm>
  );
}

export function NewVariantForm({ productId, slug, nextOrder }: { productId: string; slug: string; nextOrder: number }) {
  return (
    <details className="rounded-[2px] border border-line p-3">
      <summary className="cursor-pointer text-sm font-semibold">Ajouter un étui</summary>
      <AdminForm action={saveVariant} hidden={{ productId }} resetOnSuccess className="mt-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_1.2fr_0.6fr_0.8fr_0.6fr_0.5fr]">
          <TextField name="sku" label="SKU" required placeholder={`${slug}-9`} />
          <TextField name="name" label="Nom" required placeholder="Étui de 9 pièces" />
          <TextField name="pieces" label="Pièces" type="number" required />
          <MoneyField name="priceCents" label="Prix TTC" required />
          <TextField name="stock" label="Stock" type="number" defaultValue={0} required />
          <TextField name="sortOrder" label="Ordre" type="number" defaultValue={nextOrder} required />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <CheckboxField name="active" label="Actif (en vente)" defaultChecked />
          <SubmitButton small>Ajouter l&apos;étui</SubmitButton>
        </div>
      </AdminForm>
    </details>
  );
}
