"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ImageRef } from "@/db/schema";
import { imageAction } from "@/app/actions/admin/catalog";
import { AdminForm, CheckboxField, ConfirmSubmit, SelectField, SubmitButton, TextField, useAdminForm } from "./form";
import { IMAGE_ROLES } from "./labels";
import { btnSecondary, btnSmall, hintCls, labelCls } from "./styles";

const roleOptions = Object.entries(IMAGE_ROLES).map(([value, label]) => ({ value, label }));

/** Gestion des images d'une fiche (produit ou coffret) : liste, édition, ordre, suppression, ajout. */
export function ImageManager({ owner, ownerId, images, folder }: { owner: "product" | "box"; ownerId: string; images: ImageRef[]; folder: "products" | "boxes" }) {
  return (
    <div className="space-y-4">
      {images.length === 0 ? (
        <p className="rounded-[2px] border border-dashed border-ink/20 px-4 py-6 text-center text-sm text-ink-soft">
          Aucune image. Ajoutez au moins une image principale : elle sert de vignette sur le site.
        </p>
      ) : (
        <ol className="space-y-3">
          {images.map((img, i) => (
            <li key={`${img.url}-${i}`} className="rounded-[2px] border border-line bg-ivory/40 p-3">
              <AdminForm action={imageAction} hidden={{ owner, ownerId, index: i }} className="grid gap-4 md:grid-cols-[8rem_1fr]">
                <div className="relative aspect-[4/5] w-32 overflow-hidden rounded-[2px] bg-taupe/30">
                  {/* Aperçu brut : next/image n'accepte pas toutes les URL saisies. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
                  <span className="absolute left-1 top-1 rounded-[2px] bg-cream/90 px-1.5 text-xs tabular-nums">{i + 1}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField name="url" label="Adresse" defaultValue={img.url} required className="sm:col-span-2" />
                  <TextField name="alt" label="Texte alternatif" defaultValue={img.alt} required hint="Décrivez ce que montre l'image (lecteurs d'écran, référencement)." className="sm:col-span-2" />
                  <SelectField name="role" label="Rôle" defaultValue={img.role} options={roleOptions} />
                  <CheckboxField name="concept" label="Visuel concept" defaultChecked={!!img.concept} hint="Illustration, pas une photographie du produit réel. La mention « Visuel concept » est affichée." className="self-end" />
                  <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                    <SubmitButton small name="intent" value="update">Enregistrer l&apos;image</SubmitButton>
                    <SubmitButton small variant="secondary" name="intent" value="up" disabled={i === 0} pendingLabel="…">
                      Monter
                    </SubmitButton>
                    <SubmitButton small variant="secondary" name="intent" value="down" disabled={i === images.length - 1} pendingLabel="…">
                      Descendre
                    </SubmitButton>
                    <ConfirmSubmit small name="intent" value="delete" question="Retirer cette image de la fiche ?" confirmLabel="Retirer">
                      Retirer
                    </ConfirmSubmit>
                  </div>
                </div>
              </AdminForm>
            </li>
          ))}
        </ol>
      )}
      <AddImage owner={owner} ownerId={ownerId} folder={folder} hasMain={images.some((i) => i.role === "main")} />
    </div>
  );
}

function AddImage({ owner, ownerId, folder, hasMain }: { owner: "product" | "box"; ownerId: string; folder: "products" | "boxes"; hasMain: boolean }) {
  return (
    <details className="rounded-[2px] border border-line bg-cream p-4 open:pb-5" open={!hasMain}>
      <summary className="cursor-pointer text-sm font-semibold">Ajouter une image</summary>
      <AdminForm action={imageAction} hidden={{ owner, ownerId, intent: "add" }} resetOnSuccess className="mt-4 grid gap-3 sm:grid-cols-2">
        <UploadOrUrl folder={folder} />
        <TextField name="alt" label="Texte alternatif" required className="sm:col-span-2" />
        <SelectField name="role" label="Rôle" defaultValue={hasMain ? "extra" : "main"} options={roleOptions} />
        <CheckboxField name="concept" label="Visuel concept" hint="Cochez pour une illustration ou un rendu, pas une photographie du produit réel." className="self-end" />
        <div className="sm:col-span-2">
          <SubmitButton>Ajouter l&apos;image</SubmitButton>
        </div>
      </AdminForm>
    </details>
  );
}

/** Champ URL alimenté soit par saisie, soit par téléversement (route /admin/televersement). */
function UploadOrUrl({ folder }: { folder: "products" | "boxes" }) {
  const id = useId();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { state } = useAdminForm();
  const fieldErr = state.fieldErrors?.url;
  useEffect(() => {
    if (state.ok) setUrl("");
  }, [state]);

  async function upload(file: File) {
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", folder);
      const res = await fetch("/admin/televersement", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Le téléversement a échoué.");
      setUrl(data.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Le téléversement a échoué.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <div>
        <label htmlFor={`${id}-file`} className={labelCls}>Téléverser un fichier</label>
        <input
          ref={fileRef}
          id={`${id}-file`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          className="block w-full text-sm file:mr-3 file:cursor-pointer file:rounded-[2px] file:border file:border-ink/25 file:bg-cream file:px-3 file:py-1.5 file:text-sm"
          aria-describedby={`${id}-fh`}
        />
        <p id={`${id}-fh`} className={hintCls}>JPEG, PNG, WebP ou AVIF, 8 Mo au maximum. SVG refusé.</p>
        {busy && <p role="status" className="mt-1 text-xs">Téléversement en cours…</p>}
        {err && <p role="alert" className="mt-1 text-xs text-danger">{err}</p>}
      </div>
      <div>
        <label htmlFor={`${id}-url`} className={labelCls}>
          Ou adresse de l&apos;image<span aria-hidden className="text-danger"> *</span>
        </label>
        <div className="flex gap-2">
          <input
            id={`${id}-url`}
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/images/… ou https://….public.blob.vercel-storage.com/…"
            aria-invalid={fieldErr ? true : undefined}
            aria-describedby={fieldErr ? `${id}-ue` : undefined}
            className="block min-h-10 w-full rounded-[2px] border border-line bg-cream px-3 py-2 text-sm focus:border-chocolate focus:outline-none focus:ring-1 focus:ring-chocolate aria-[invalid=true]:border-danger"
          />
          {url && (
            <button type="button" className={`${btnSecondary} ${btnSmall}`} onClick={() => setUrl("")}>
              Effacer
            </button>
          )}
        </div>
        {fieldErr && <p id={`${id}-ue`} role="alert" className="mt-1 text-xs text-danger">{fieldErr}</p>}
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="mt-2 h-24 w-20 rounded-[2px] object-cover" />
        )}
      </div>
    </div>
  );
}
