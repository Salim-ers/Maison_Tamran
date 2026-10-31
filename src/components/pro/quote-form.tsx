"use client";

import Link from "@/components/motion/transition-link";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { clsx } from "clsx";
import { submitQuote, type QuoteState } from "@/app/actions/quote";
import { BUDGETS, LOGO_MAX_MB, LOGO_TYPES, PRO_SEGMENTS } from "@/lib/segments";

export interface QuoteOption {
  ref: string;
  name: string;
  detail: string;
}

type Upload = { status: "idle" } | { status: "uploading"; name: string } | { status: "done"; name: string; url: string; sig: string } | { status: "error"; message: string };

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="mt-2 t-small text-danger" role="alert">
      {msg}
    </p>
  );
}

function Section({ n, title, children, hint }: { n: number; title: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <fieldset className="grid gap-8 border-t border-chocolate py-10 lg:grid-cols-[14rem_1fr] lg:gap-12">
      <legend className="sr-only">{title}</legend>
      <div aria-hidden>
        <span className="t-numeral text-2xl text-bronze">{n}</span>
        <p className="mt-1 t-title">{title}</p>
        {hint && <div className="mt-3 t-small text-ink-soft">{hint}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </fieldset>
  );
}

export function QuoteForm({ recipes, boxes, initialSegment, contactEmail }: { recipes: QuoteOption[]; boxes: QuoteOption[]; initialSegment: string; contactEmail: string | null }) {
  const [state, action, pending] = useActionState<QuoteState, FormData>(submitQuote, { status: "idle" });
  const [qty, setQty] = useState<Record<string, string>>({});
  const [upload, setUpload] = useState<Upload>({ status: "idle" });
  const [minDate, setMinDate] = useState<string>();
  const [wantsLogo, setWantsLogo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  useEffect(() => setMinDate(new Date().toISOString().slice(0, 10)), []);
  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
    if (state.status === "ok") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state]);

  if (state.status === "ok") {
    return (
      <div className="grid gap-10 border-t border-chocolate pt-12 lg:grid-cols-12" role="status">
        <div className="lg:col-span-7">
          <h2 className="t-display-m">Votre demande est enregistrée</h2>
          <p className="mt-6 max-w-[48ch] t-lead text-ink-soft">
            Un email de confirmation vient d&apos;être adressé à {state.email}. Nous étudions votre projet et revenons vers vous avec une proposition chiffrée.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={state.pdfPath} className="btn btn-primary" target="_blank" rel="noopener">Télécharger le récapitulatif (PDF)</a>
            <Link href="/professionnels" className="btn btn-outline">Retour à l&apos;espace professionnel</Link>
          </div>
        </div>
        <dl className="self-start bg-cream p-8 lg:col-span-4 lg:col-start-9">
          <dt className="t-small text-ink-soft">Référence de votre demande</dt>
          <dd className="mt-2 font-display text-3xl tracking-[0.02em]">{state.reference}</dd>
          <dd className="mt-4 t-small text-ink-soft">Rappelez-la dans vos échanges avec nous.</dd>
        </dl>
      </div>
    );
  }

  const err = state.status === "error" ? state.fieldErrors : {};
  const v = state.status === "error" ? state.values : {};
  const a = (name: string) => ({
    id: `${uid}-${name}`,
    name,
    "aria-invalid": err[name] ? true : undefined,
    "aria-describedby": err[name] ? `${uid}-${name}-err` : undefined,
  });
  const lineCount = Object.values(qty).filter((x) => Number(x) > 0).length;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) {
      setUpload({ status: "error", message: "Format non accepté. Choisissez un fichier PNG, JPEG, WebP ou PDF." });
      e.target.value = "";
      return;
    }
    if (file.size > LOGO_MAX_MB * 1024 * 1024) {
      setUpload({ status: "error", message: `Fichier trop lourd : ${LOGO_MAX_MB} Mo au maximum.` });
      e.target.value = "";
      return;
    }
    setUpload({ status: "uploading", name: file.name });
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/devis/logo", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { url?: string; sig?: string; error?: string };
      if (!res.ok || !data.url || !data.sig) throw new Error(data.error ?? "Le fichier n'a pas pu être envoyé. Vous pouvez envoyer la demande sans logo et nous le transmettre par email.");
      setUpload({ status: "done", name: file.name, url: data.url, sig: data.sig });
      setWantsLogo(true);
    } catch (x) {
      setUpload({ status: "error", message: x instanceof Error ? x.message : "Le fichier n'a pas pu être envoyé." });
      e.target.value = "";
    }
  }

  const qtyRow = (o: QuoteOption, unit: string) => {
    const id = `${uid}-q-${o.ref}`;
    return (
      <li key={o.ref} className="flex items-center justify-between gap-4 border-b hairline py-3">
        <label htmlFor={id} className="min-w-0">
          <span className="block font-display text-lg leading-tight">{o.name}</span>
          <span className="block t-small text-ink-soft">{o.detail}</span>
        </label>
        <div className="flex shrink-0 items-center gap-2">
          <input
            id={id}
            name={`qty:${o.ref}`}
            type="number"
            inputMode="numeric"
            min={0}
            max={100000}
            step={1}
            placeholder="0"
            value={qty[o.ref] ?? v[`qty:${o.ref}`] ?? ""}
            onChange={(e) => setQty((q) => ({ ...q, [o.ref]: e.target.value }))}
            className="field w-24 text-right tabular-nums"
            aria-label={`Quantité souhaitée : ${o.name} (${unit})`}
          />
          <span className="w-14 t-small text-ink-soft" aria-hidden>{unit}</span>
        </div>
      </li>
    );
  };

  return (
    <form key={state.status === "error" ? state.attempt : "initial"} action={action} noValidate className="relative">
      {state.status === "error" && (
        <div ref={summaryRef} tabIndex={-1} className="mb-10 border-l-2 border-danger bg-cream px-5 py-4 outline-none" role="alert">
          <p className="font-semibold text-danger">{state.message}</p>
        </div>
      )}

      <div className="hidden" aria-hidden>
        <label>Ne pas remplir <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <Section n={1} title="Votre projet">
        <label htmlFor={`${uid}-segment`} className="field-label">Type de projet</label>
        <select {...a("segment")} defaultValue={v.segment ?? initialSegment} className="field" required>
          <option value="" disabled>Choisissez…</option>
          {PRO_SEGMENTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <FieldError id={`${uid}-segment-err`} msg={err.segment} />
      </Section>

      <Section n={2} title="Vos coordonnées">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor={`${uid}-company`} className="field-label">Société, établissement ou événement</label>
            <input {...a("company")} defaultValue={v.company} autoComplete="organization" className="field" required />
            <FieldError id={`${uid}-company-err`} msg={err.company} />
          </div>
          <div>
            <label htmlFor={`${uid}-contactName`} className="field-label">Nom et prénom</label>
            <input {...a("contactName")} defaultValue={v.contactName} autoComplete="name" className="field" required />
            <FieldError id={`${uid}-contactName-err`} msg={err.contactName} />
          </div>
          <div>
            <label htmlFor={`${uid}-email`} className="field-label">Email</label>
            <input {...a("email")} type="email" defaultValue={v.email} autoComplete="email" inputMode="email" className="field" required />
            <FieldError id={`${uid}-email-err`} msg={err.email} />
          </div>
          <div>
            <label htmlFor={`${uid}-phone`} className="field-label">Téléphone <span className="font-normal text-ink-soft">(facultatif)</span></label>
            <input {...a("phone")} type="tel" defaultValue={v.phone} autoComplete="tel" className="field" />
            <FieldError id={`${uid}-phone-err`} msg={err.phone} />
          </div>
          <div>
            <label htmlFor={`${uid}-vatNumber`} className="field-label">N° de TVA intracommunautaire <span className="font-normal text-ink-soft">(facultatif)</span></label>
            <input {...a("vatNumber")} defaultValue={v.vatNumber} placeholder="FR12345678901" className="field" />
            <FieldError id={`${uid}-vatNumber-err`} msg={err.vatNumber} />
          </div>
        </div>
      </Section>

      <Section
        n={3}
        title="Votre sélection"
        hint={<p>Indiquez une quantité estimée pour ce qui vous intéresse. Elle pourra être ajustée avec la proposition.{lineCount > 0 && <span className="mt-2 block text-ink">{lineCount} élément{lineCount > 1 ? "s" : ""} sélectionné{lineCount > 1 ? "s" : ""}</span>}</p>}
      >
        <div className="grid gap-10 xl:grid-cols-2">
          <div>
            <h3 className="font-sans text-[0.9rem] font-semibold">Coffrets</h3>
            <ul className="mt-2">{boxes.map((o) => qtyRow(o, "coffrets"))}</ul>
          </div>
          <div>
            <h3 className="font-sans text-[0.9rem] font-semibold">Créations à la pièce</h3>
            <ul className="mt-2">{recipes.map((o) => qtyRow(o, "pièces"))}</ul>
          </div>
        </div>
        {err.lines && <p id={`${uid}-lines-err`} className="mt-4 t-small text-danger" role="alert">{err.lines}</p>}
      </Section>

      <Section n={4} title="Personnalisation" hint={<p>Les options retenues sont détaillées et chiffrées dans la proposition.</p>}>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["logo", "Logo sur le coffret"],
            ["card", "Carte imprimée"],
            ["ribbon", "Ruban personnalisé"],
          ].map(([name, label]) => (
            <label key={name} className="flex cursor-pointer items-center gap-3 border hairline bg-cream px-4 py-4 has-[:checked]:border-chocolate">
              <input
                type="checkbox"
                name={name}
                {...(name === "logo" ? { checked: wantsLogo, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setWantsLogo(e.target.checked) } : { defaultChecked: v[name] === "on" })}
                className="size-4 accent-[var(--color-chocolate)]"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <div className="mt-8">
          <label htmlFor={`${uid}-logoFile`} className="field-label">Votre logo <span className="font-normal text-ink-soft">(facultatif)</span></label>
          <p id={`${uid}-logoFile-help`} className="mb-3 t-small text-ink-soft">PNG, JPEG, WebP ou PDF, {LOGO_MAX_MB} Mo au maximum. Un fichier vectoriel ou en haute définition donne le meilleur résultat.</p>
          <div className="flex flex-wrap items-center gap-4">
            <input
              ref={fileRef}
              id={`${uid}-logoFile`}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
              onChange={onFile}
              disabled={upload.status === "uploading"}
              aria-describedby={`${uid}-logoFile-help ${uid}-logoFile-status`}
              className="peer sr-only"
            />
            <label htmlFor={`${uid}-logoFile`} className="btn btn-outline min-h-11 cursor-pointer px-5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bronze peer-disabled:cursor-wait peer-disabled:opacity-50">
              {upload.status === "done" ? "Remplacer le fichier" : "Choisir un fichier"}
            </label>
            {upload.status === "idle" && <span className="t-small text-ink-soft">Aucun fichier sélectionné</span>}
          </div>
          <div id={`${uid}-logoFile-status`} aria-live="polite" className="mt-3 t-small">
            {upload.status === "uploading" && <p className="text-ink-soft">Envoi de « {upload.name} »…</p>}
            {upload.status === "done" && (
              <p className="flex flex-wrap items-center gap-3 text-success">
                Fichier joint : {upload.name}
                <button type="button" className="text-ink underline underline-offset-2" onClick={() => { setUpload({ status: "idle" }); if (fileRef.current) fileRef.current.value = ""; }}>Retirer</button>
              </p>
            )}
            {upload.status === "error" && <p className="text-danger" role="alert">{upload.message}</p>}
            {err.logoFile && upload.status !== "done" && <p className="text-danger" role="alert">{err.logoFile}</p>}
          </div>
          {upload.status === "done" && (
            <>
              <input type="hidden" name="logoUrl" value={upload.url} />
              <input type="hidden" name="logoSig" value={upload.sig} />
            </>
          )}
        </div>

        <div className="mt-8">
          <label htmlFor={`${uid}-personalizationNotes`} className="field-label">Précisions <span className="font-normal text-ink-soft">(facultatif)</span></label>
          <textarea {...a("personalizationNotes")} defaultValue={v.personalizationNotes} rows={3} className="field" placeholder="Couleurs, texte de la carte, emplacement du logo…" />
          <FieldError id={`${uid}-personalizationNotes-err`} msg={err.personalizationNotes} />
        </div>
      </Section>

      <Section n={5} title="Livraison et budget">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-desiredDate`} className="field-label">Date de livraison souhaitée <span className="font-normal text-ink-soft">(facultatif)</span></label>
            <input {...a("desiredDate")} type="date" min={minDate} defaultValue={v.desiredDate} className="field" />
            <FieldError id={`${uid}-desiredDate-err`} msg={err.desiredDate} />
          </div>
          <div>
            <label htmlFor={`${uid}-deliveryCity`} className="field-label">Ville de livraison <span className="font-normal text-ink-soft">(facultatif)</span></label>
            <input {...a("deliveryCity")} defaultValue={v.deliveryCity} autoComplete="address-level2" className="field" />
            <FieldError id={`${uid}-deliveryCity-err`} msg={err.deliveryCity} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`${uid}-budget`} className="field-label">Budget indicatif <span className="font-normal text-ink-soft">(facultatif)</span></label>
            <select {...a("budget")} defaultValue={v.budget ?? ""} className="field">
              <option value="">Non précisé</option>
              {BUDGETS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section n={6} title="Votre message">
        <label htmlFor={`${uid}-message`} className="field-label">Décrivez votre projet <span className="font-normal text-ink-soft">(facultatif)</span></label>
        <textarea {...a("message")} defaultValue={v.message} rows={6} className="field" placeholder="Occasion, nombre de destinataires, contraintes particulières, allergies à prendre en compte…" />
        <FieldError id={`${uid}-message-err`} msg={err.message} />
      </Section>

      <div className="border-t border-chocolate pt-10 lg:pl-[calc(14rem+3rem)]">
        <label className="flex items-start gap-3 t-small text-ink-soft">
          <input type="checkbox" name="consent" defaultChecked={v.consent === "on"} className="mt-1 size-4 shrink-0 accent-[var(--color-chocolate)]" aria-invalid={err.consent ? true : undefined} aria-describedby={err.consent ? `${uid}-consent-err` : undefined} />
          <span>
            J&apos;accepte que les informations saisies soient utilisées pour étudier ma demande et me recontacter. Elles ne sont jamais cédées. Voir la{" "}
            <Link href="/confidentialite" className="link-draw text-ink">politique de confidentialité</Link>.
          </span>
        </label>
        <FieldError id={`${uid}-consent-err`} msg={err.consent} />
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <button className="btn btn-primary" disabled={pending || upload.status === "uploading"}>{pending ? "Envoi en cours…" : "Envoyer ma demande"}</button>
          {contactEmail && <p className="t-small text-ink-soft">Une question avant d&apos;envoyer ? <a href={`mailto:${contactEmail}`} className="link-draw text-ink">{contactEmail}</a></p>}
        </div>
        {state.status === "error" && <p className={clsx("mt-4 t-small text-danger")}>{state.message}</p>}
      </div>
    </form>
  );
}
