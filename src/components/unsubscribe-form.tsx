"use client";

import { useActionState } from "react";
import { unsubscribeNewsletter, type UnsubscribeState } from "@/app/actions/newsletter-unsubscribe";

export function UnsubscribeForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [state, action, pending] = useActionState<UnsubscribeState, FormData>(unsubscribeNewsletter, { status: "idle", message: "" });
  if (state.status === "ok") {
    return <p className="max-w-[52ch] border-l-2 border-bronze pl-6 t-lead" role="status">{state.message}</p>;
  }
  return (
    <form action={action} noValidate className="max-w-xl">
      <div className="hidden" aria-hidden>
        <label>Ne pas remplir <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label htmlFor="unsub-email" className="field-label">Adresse email inscrite</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="unsub-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          defaultValue={defaultEmail}
          className="field flex-1"
          aria-invalid={state.status === "error" ? true : undefined}
          aria-describedby={state.status === "error" ? "unsub-err" : undefined}
        />
        <button className="btn btn-primary" disabled={pending}>{pending ? "Envoi…" : "Me désinscrire"}</button>
      </div>
      {state.status === "error" && <p id="unsub-err" className="mt-3 t-small text-danger" role="alert">{state.message}</p>}
    </form>
  );
}
