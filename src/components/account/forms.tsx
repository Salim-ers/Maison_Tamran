"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  changePassword, login, lookupOrder, register, requestPasswordReset, resetPassword, saveAddress, updateProfile, type FormState,
} from "@/app/actions/account";
import { COUNTRIES } from "@/lib/countries";

function Input({ name, label, type = "text", auto, value, required = true, hint, inputMode }: { name: string; label: string; type?: string; auto?: string; value?: string | null; required?: boolean; hint?: string; inputMode?: "email" | "tel" | "numeric" }) {
  return (
    <div>
      <label htmlFor={`f-${name}`} className="field-label">
        {label}
        {!required && <span className="font-normal text-ink-soft"> (facultatif)</span>}
      </label>
      <input id={`f-${name}`} name={name} type={type} autoComplete={auto} required={required} defaultValue={value ?? undefined} inputMode={inputMode} className="field" aria-describedby={hint ? `f-${name}-h` : undefined} />
      {hint && <p id={`f-${name}-h`} className="mt-1 t-micro text-ink-soft">{hint}</p>}
    </div>
  );
}

function Status({ state }: { state: FormState }) {
  if (state.error) return <p className="t-small text-danger" role="alert">{state.error}</p>;
  if (state.message) return <p className="t-small text-success" role="status">{state.message}</p>;
  return null;
}

const init: FormState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, init);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="suite" value={next} />
      <Input name="email" label="Email" type="email" auto="email" inputMode="email" value={state.fields?.email} />
      <Input name="password" label="Mot de passe" type="password" auto="current-password" />
      <Status state={state} />
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
      <p className="t-small"><Link href="/compte/mot-de-passe-oublie" className="link-draw">Mot de passe oublié</Link></p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(register, init);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="suite" value={next} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="firstName" label="Prénom" auto="given-name" value={state.fields?.firstName} />
        <Input name="lastName" label="Nom" auto="family-name" value={state.fields?.lastName} />
      </div>
      <Input name="email" label="Email" type="email" auto="email" inputMode="email" value={state.fields?.email} />
      <Input name="password" label="Mot de passe" type="password" auto="new-password" hint="10 caractères au moins, avec des lettres et des chiffres ou symboles." />
      <label className="flex items-start gap-3 t-small">
        <input type="checkbox" name="cgu" required defaultChecked={state.fields?.cgu === "on"} className="mt-1 size-4 accent-[var(--color-chocolate)]" />
        <span>J&apos;ai pris connaissance de la <Link href="/confidentialite" className="link-draw">politique de confidentialité</Link>.</span>
      </label>
      <Status state={state} />
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Création…" : "Créer mon compte"}</button>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, init);
  if (state.ok) return <p className="border-l-2 border-bronze pl-4" role="status">{state.message}</p>;
  return (
    <form action={action} className="space-y-5">
      <Input name="email" label="Email du compte" type="email" auto="email" inputMode="email" value={state.fields?.email} />
      <Status state={state} />
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Envoi…" : "Recevoir le lien"}</button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, init);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="t" value={token} />
      <Input name="password" label="Nouveau mot de passe" type="password" auto="new-password" hint="10 caractères au moins, avec des lettres et des chiffres ou symboles." />
      <Input name="confirm" label="Confirmation" type="password" auto="new-password" />
      <Status state={state} />
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer le mot de passe"}</button>
    </form>
  );
}

export function ProfileForm({ user }: { user: { firstName: string | null; lastName: string | null; phone: string | null; email: string; marketingConsent: boolean } }) {
  const [state, action, pending] = useActionState(updateProfile, init);
  return (
    <form action={action} className="space-y-5">
      <p className="t-small text-ink-soft">Email : {user.email}</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="firstName" label="Prénom" auto="given-name" value={user.firstName} />
        <Input name="lastName" label="Nom" auto="family-name" value={user.lastName} />
      </div>
      <Input name="phone" label="Téléphone" type="tel" auto="tel" inputMode="tel" value={user.phone} required={false} />
      <label className="flex items-start gap-3 t-small">
        <input type="checkbox" name="marketing" defaultChecked={user.marketingConsent} className="mt-1 size-4 accent-[var(--color-chocolate)]" />
        <span>J&apos;accepte de recevoir des nouvelles de la Maison par email.</span>
      </label>
      <Status state={state} />
      <button className="btn btn-outline" disabled={pending}>Enregistrer</button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, init);
  return (
    <form action={action} className="space-y-5">
      <Input name="current" label="Mot de passe actuel" type="password" auto="current-password" />
      <Input name="password" label="Nouveau mot de passe" type="password" auto="new-password" />
      <Status state={state} />
      <button className="btn btn-outline" disabled={pending}>Modifier le mot de passe</button>
    </form>
  );
}

type Addr = { id: string; label: string | null; firstName: string; lastName: string; company: string | null; line1: string; line2: string | null; postalCode: string; city: string; country: string; phone: string | null; isDefault: boolean };

export function AddressForm({ address }: { address?: Addr | null }) {
  const [state, action, pending] = useActionState(saveAddress, init);
  const f = state.fields ?? {};
  const v = (k: keyof Addr) => f[k] ?? (address?.[k] as string | null | undefined) ?? undefined;
  return (
    <form action={action} className="space-y-5">
      {address && <input type="hidden" name="id" value={address.id} />}
      <Input name="label" label="Nom de l'adresse" value={v("label")} required={false} hint="Par exemple : Maison, Bureau." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="firstName" label="Prénom" auto="given-name" value={v("firstName")} />
        <Input name="lastName" label="Nom" auto="family-name" value={v("lastName")} />
      </div>
      <Input name="company" label="Société" auto="organization" value={v("company")} required={false} />
      <Input name="line1" label="Adresse" auto="address-line1" value={v("line1")} />
      <Input name="line2" label="Complément" auto="address-line2" value={v("line2")} required={false} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="postalCode" label="Code postal" auto="postal-code" value={v("postalCode")} />
        <Input name="city" label="Ville" auto="address-level2" value={v("city")} />
      </div>
      <div>
        <label htmlFor="f-country" className="field-label">Pays</label>
        <select id="f-country" name="country" defaultValue={v("country") ?? "FR"} className="field">
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </div>
      <Input name="phone" label="Téléphone" type="tel" auto="tel" value={v("phone")} required={false} />
      <label className="flex items-center gap-3 t-small">
        <input type="checkbox" name="isDefault" defaultChecked={address?.isDefault} className="size-4 accent-[var(--color-chocolate)]" /> Adresse par défaut
      </label>
      <Status state={state} />
      <div className="flex gap-3">
        <button className="btn btn-primary" disabled={pending}>Enregistrer l&apos;adresse</button>
        <Link href="/compte/adresses" className="btn btn-outline">Annuler</Link>
      </div>
    </form>
  );
}

export function TrackForm() {
  const [state, action, pending] = useActionState(lookupOrder, init);
  return (
    <form action={action} className="space-y-5">
      <Input name="number" label="Numéro de commande" value={state.fields?.number} hint="Il figure dans l'email de confirmation, par exemple TB-2026-AB12CD." />
      <Input name="email" label="Email utilisé pour la commande" type="email" auto="email" inputMode="email" value={state.fields?.email} />
      <Status state={state} />
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Recherche…" : "Voir ma commande"}</button>
    </form>
  );
}
