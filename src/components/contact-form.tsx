"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useRef } from "react";
import { sendContactMessage, type ContactState } from "@/app/actions/contact";
import { CONTACT_SUBJECTS } from "@/lib/segments";

export function ContactForm({ initialSubject = "" }: { initialSubject?: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContactMessage, { status: "idle" });
  const uid = useId();
  const alertRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === "error") alertRef.current?.focus();
  }, [state]);

  if (state.status === "ok") {
    return (
      <div className="border-l-2 border-bronze pl-6" role="status">
        <h2 className="t-display-m">Message envoyé</h2>
        <p className="mt-5 max-w-[46ch] t-lead text-ink-soft">
          Merci {state.name}. Votre message nous est bien parvenu : nous vous répondrons à l&apos;adresse {state.email}.
        </p>
        <Link href="/" className="btn btn-outline mt-8">Retour à l&apos;accueil</Link>
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
  const E = ({ name }: { name: string }) => (err[name] ? <p id={`${uid}-${name}-err`} className="mt-2 t-small text-danger" role="alert">{err[name]}</p> : null);

  return (
    <form key={state.status === "error" ? state.attempt : "initial"} action={action} noValidate className="grid gap-7">
      {state.status === "error" && (
        <div ref={alertRef} tabIndex={-1} className="border-l-2 border-danger bg-cream px-5 py-4 font-semibold text-danger outline-none" role="alert">{state.message}</div>
      )}
      <div className="hidden" aria-hidden>
        <label>Ne pas remplir <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className="field-label">Nom</label>
          <input {...a("name")} defaultValue={v.name} autoComplete="name" className="field" required />
          <E name="name" />
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className="field-label">Email</label>
          <input {...a("email")} type="email" defaultValue={v.email} autoComplete="email" inputMode="email" className="field" required />
          <E name="email" />
        </div>
        <div>
          <label htmlFor={`${uid}-subject`} className="field-label">Sujet</label>
          <select {...a("subject")} defaultValue={v.subject ?? initialSubject} className="field" required>
            <option value="" disabled>Choisissez…</option>
            {CONTACT_SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <E name="subject" />
        </div>
        <div>
          <label htmlFor={`${uid}-orderNumber`} className="field-label">N° de commande <span className="font-normal text-ink-soft">(facultatif)</span></label>
          <input {...a("orderNumber")} defaultValue={v.orderNumber} placeholder="TB-2026-…" className="field" />
          <E name="orderNumber" />
        </div>
      </div>
      <div>
        <label htmlFor={`${uid}-message`} className="field-label">Message</label>
        <textarea {...a("message")} defaultValue={v.message} rows={7} className="field" required />
        <E name="message" />
      </div>
      <div>
        <label className="flex items-start gap-3 t-small text-ink-soft">
          <input type="checkbox" name="consent" defaultChecked={v.consent === "on"} className="mt-1 size-4 shrink-0 accent-[var(--color-chocolate)]" aria-invalid={err.consent ? true : undefined} aria-describedby={err.consent ? `${uid}-consent-err` : undefined} />
          <span>
            J&apos;accepte que ces informations soient utilisées pour répondre à mon message. Voir la{" "}
            <Link href="/confidentialite" className="link-draw text-ink">politique de confidentialité</Link>.
          </span>
        </label>
        <E name="consent" />
      </div>
      <div>
        <button className="btn btn-primary" disabled={pending}>{pending ? "Envoi en cours…" : "Envoyer mon message"}</button>
      </div>
    </form>
  );
}
