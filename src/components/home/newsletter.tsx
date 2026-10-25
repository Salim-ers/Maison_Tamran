"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type NewsletterState } from "@/app/actions/newsletter";

export function Newsletter({ consentText }: { consentText: string }) {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(subscribeNewsletter, { status: "idle", message: "" });
  return (
    <section className="section-pad bg-ivory" aria-labelledby="nl-title">
      <div className="container-luxe grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
        <div>
          <h2 id="nl-title" className="t-display-m max-w-[16ch]">Être prévenu avant la prochaine édition</h2>
          <p className="mt-5 max-w-[44ch] text-ink-soft">
            Une lettre par saison, pas davantage : les nouvelles recettes, les éditions éphémères avant leur mise en ligne, et les dates à retenir pour offrir.
          </p>
        </div>
        {state.status === "ok" ? (
          <p className="border-l-2 border-bronze pl-5 t-lead" role="status">{state.message}</p>
        ) : (
          <form action={action} className="w-full" noValidate>
            <input type="hidden" name="source" value="accueil" />
            <div className="hidden" aria-hidden>
              <label>Ne pas remplir <input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>
            <label htmlFor="nl-email" className="field-label">Adresse email</label>
            <div className="flex gap-0 border-b border-chocolate focus-within:border-bronze">
              <input
                id="nl-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="prenom@exemple.fr"
                className="min-h-14 flex-1 bg-transparent font-display text-2xl outline-none placeholder:text-ink-soft/50"
                aria-invalid={state.status === "error"}
                aria-describedby={state.status === "error" ? "nl-error" : undefined}
              />
              <button className="btn px-4 font-medium" disabled={pending}>{pending ? "Envoi…" : "S'inscrire"}</button>
            </div>
            <label className="mt-5 flex items-start gap-3 t-small text-ink-soft">
              <input type="checkbox" name="consent" required className="mt-1 size-4 shrink-0 accent-[var(--color-chocolate)]" />
              <span>{consentText} Voir la <a href="/confidentialite" className="link-draw text-ink">politique de confidentialité</a>.</span>
            </label>
            {state.status === "error" && <p id="nl-error" className="mt-3 t-small text-danger" role="alert">{state.message}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
