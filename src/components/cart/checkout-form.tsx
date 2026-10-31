"use client";

import Link from "@/components/motion/transition-link";
import Image from "next/image";
import { useActionState, useEffect, useState, useTransition } from "react";
import { clsx } from "clsx";
import { startCheckout, type CheckoutState } from "@/app/actions/checkout";
import { quoteShipping } from "@/app/actions/cart";
import type { CartView } from "@/lib/cart";
import { euros } from "@/lib/money";
import { COUNTRIES } from "@/lib/countries";
import { PromoForm } from "./promo-form";
import { useCart } from "./cart-context";

interface Prefill {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  addresses: { id: string; label: string | null; firstName: string; lastName: string; company: string | null; line1: string; line2: string | null; postalCode: string; city: string; country: string; phone: string | null }[];
}

function Field({ name, label, auto, required = true, type = "text", value, className, inputMode }: { name: string; label: string; auto?: string; required?: boolean; type?: string; value?: string; className?: string; inputMode?: "numeric" | "tel" | "email" }) {
  return (
    <div className={className}>
      <label htmlFor={`co-${name}`} className="field-label">
        {label}
        {!required && <span className="font-normal text-ink-soft"> (facultatif)</span>}
      </label>
      <input id={`co-${name}`} name={name} type={type} autoComplete={auto} required={required} defaultValue={value} inputMode={inputMode} className="field" />
    </div>
  );
}

export function CheckoutForm({ initial, prefill, demo, loggedIn }: { initial: CartView; prefill: Prefill; demo: boolean; loggedIn: boolean }) {
  const [state, action, submitting] = useActionState<CheckoutState, FormData>(startCheckout, { error: null });
  const { cart: liveCart } = useCart();
  const [cart, setCart] = useState<CartView>(initial);
  const [country, setCountry] = useState(prefill.addresses[0]?.country ?? "FR");
  const [rate, setRate] = useState<string | null>(initial.shipping[0]?.id ?? null);
  const [addr, setAddr] = useState<Prefill["addresses"][number] | null>(prefill.addresses[0] ?? null);
  const [pending, start] = useTransition();
  const f = state.fields ?? {};

  // recalcul serveur à chaque changement de pays, de mode de livraison ou du panier (code promo…)
  useEffect(() => {
    start(async () => {
      const c = await quoteShipping(country, rate);
      setCart(c);
      if (!c.shipping.find((s) => s.id === rate)) setRate(c.shipping[0]?.id ?? null);
    });
  }, [country, rate, liveCart?.promo?.code, liveCart?.subtotalCents]);

  if (!cart.lines.length) {
    return (
      <div className="py-16">
        <p className="t-title">Votre panier est vide.</p>
        <Link href="/creations" className="btn btn-primary mt-6">Découvrir les créations</Link>
      </div>
    );
  }

  const v = (k: string, fallback?: string | null) => f[k] ?? fallback ?? undefined;

  return (
    <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
      <form id="checkout-form" action={action} className="space-y-12">
        {demo && (
          <p className="border-l-2 border-pistachio bg-cream px-5 py-4 t-small" role="note">
            Mode démonstration : à l&apos;étape suivante, vous pourrez simuler un paiement accepté ou refusé. Aucune carte n&apos;est demandée et aucune commande ne sera expédiée.
          </p>
        )}

        <fieldset>
          <legend className="flex items-baseline gap-3 t-title"><span className="t-numeral text-bronze">1</span>Vos coordonnées</legend>
          {!loggedIn && (
            <p className="mt-3 t-small text-ink-soft">
              Déjà client&nbsp;? <Link href="/compte/connexion?suite=/paiement" className="link-draw text-ink">Se connecter</Link>. Vous pouvez aussi commander sans compte.
            </p>
          )}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field name="email" label="Email" type="email" auto="email" inputMode="email" value={v("email", prefill.email)} className="sm:col-span-2" />
            <Field name="phone" label="Téléphone" type="tel" auto="tel" inputMode="tel" required={false} value={v("phone", addr?.phone ?? prefill.phone)} className="sm:col-span-2" />
          </div>
        </fieldset>

        <fieldset>
          <legend className="flex items-baseline gap-3 t-title"><span className="t-numeral text-bronze">2</span>Adresse de livraison</legend>
          {prefill.addresses.length > 0 && (
            <div className="mt-5">
              <label htmlFor="co-saved" className="field-label">Mes adresses</label>
              <select
                id="co-saved"
                className="field"
                defaultValue={prefill.addresses[0]?.id}
                onChange={(e) => {
                  const a = prefill.addresses.find((x) => x.id === e.target.value) ?? null;
                  setAddr(a);
                  if (a) setCountry(a.country);
                }}
              >
                {prefill.addresses.map((a) => (
                  <option key={a.id} value={a.id}>{a.label ?? `${a.firstName} ${a.lastName}`}, {a.line1}, {a.city}</option>
                ))}
                <option value="">Nouvelle adresse</option>
              </select>
            </div>
          )}
          <div key={addr?.id ?? "new"} className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field name="firstName" label="Prénom" auto="given-name" value={v("firstName", addr?.firstName ?? prefill.firstName)} />
            <Field name="lastName" label="Nom" auto="family-name" value={v("lastName", addr?.lastName ?? prefill.lastName)} />
            <Field name="company" label="Société" auto="organization" required={false} value={v("company", addr?.company)} className="sm:col-span-2" />
            <Field name="line1" label="Adresse" auto="address-line1" value={v("line1", addr?.line1)} className="sm:col-span-2" />
            <Field name="line2" label="Complément" auto="address-line2" required={false} value={v("line2", addr?.line2)} className="sm:col-span-2" />
            <Field name="postalCode" label="Code postal" auto="postal-code" value={v("postalCode", addr?.postalCode)} />
            <Field name="city" label="Ville" auto="address-level2" value={v("city", addr?.city)} />
            <div className="sm:col-span-2">
              <label htmlFor="co-country" className="field-label">Pays</label>
              <select id="co-country" name="country" autoComplete="country" className="field" value={country} onChange={(e) => setCountry(e.target.value)}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          {loggedIn && !addr && (
            <label className="mt-5 flex items-center gap-3 t-small">
              <input type="checkbox" name="saveAddress" className="size-4 accent-[var(--color-chocolate)]" /> Enregistrer cette adresse dans mon compte
            </label>
          )}
        </fieldset>

        <fieldset>
          <legend className="flex items-baseline gap-3 t-title"><span className="t-numeral text-bronze">3</span>Livraison</legend>
          {cart.shipping.length === 0 ? (
            <p className="mt-5 t-small text-danger" role="alert">Aucun mode de livraison n&apos;est disponible pour ce pays.</p>
          ) : (
            <div className="mt-6 space-y-3" aria-busy={pending}>
              {cart.shipping.map((s) => (
                <label key={s.id} className={clsx("flex cursor-pointer items-start gap-4 border p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bronze", rate === s.id ? "border-chocolate bg-cream" : "hairline")}>
                  <input type="radio" name="shippingRateId" value={s.id} checked={rate === s.id} onChange={() => setRate(s.id)} className="mt-1 accent-[var(--color-chocolate)]" />
                  <span className="flex-1">
                    <span className="flex justify-between gap-4"><span>{s.name}</span><span className="tabular-nums">{s.priceCents ? euros(s.priceCents) : "Offerte"}</span></span>
                    {s.description && <span className="mt-1 block t-small text-ink-soft">{s.description}</span>}
                  </span>
                </label>
              ))}
              <p className="t-micro text-ink-soft">Le délai de livraison vous est communiqué à l&apos;expédition.</p>
            </div>
          )}
          <div className="mt-6">
            <label htmlFor="co-note" className="field-label">Note pour la préparation <span className="font-normal text-ink-soft">(facultatif)</span></label>
            <textarea id="co-note" name="note" rows={3} maxLength={500} defaultValue={v("note")} className="field" />
          </div>
        </fieldset>
      </form>

      <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <div className="bg-cream p-6 sm:p-8">
          <h2 className="t-title">Récapitulatif</h2>
          <ul className="mt-6 divide-y divide-line">
            {cart.lines.map((l) => (
              <li key={l.id} className="flex gap-4 py-4">
                <div className="relative size-16 shrink-0 overflow-hidden bg-taupe/30">
                  {l.image && <Image src={l.image} alt="" fill sizes="64px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1 t-small">
                  <p className="flex justify-between gap-3"><span className="font-display text-lg">{l.quantity} × {l.name}</span><span className="tabular-nums">{euros(l.totalCents)}</span></p>
                  <p className="text-ink-soft">{l.description}</p>
                  {l.errors.map((e) => <p key={e} className="text-danger">{e}</p>)}
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t hairline pt-5"><PromoForm compact /></div>
          <dl className="mt-5 space-y-2 t-small" aria-live="polite">
            <div className="flex justify-between"><dt>Sous-total</dt><dd className="tabular-nums">{euros(cart.subtotalCents)}</dd></div>
            {cart.discountCents > 0 && <div className="flex justify-between text-success"><dt>Remise</dt><dd className="tabular-nums">−{euros(cart.discountCents)}</dd></div>}
            <div className="flex justify-between"><dt>Livraison</dt><dd className="tabular-nums">{cart.shippingCents == null ? "—" : cart.shippingCents ? euros(cart.shippingCents) : "Offerte"}</dd></div>
            <div className="flex justify-between border-t hairline pt-3 text-base"><dt className="font-semibold">Total TTC</dt><dd className="font-display text-2xl tabular-nums">{euros(cart.totalCents)}</dd></div>
          </dl>
          <label className="mt-6 flex items-start gap-3 t-small">
            <input type="checkbox" name="cgv" form="checkout-form" required defaultChecked={f.cgv === "on"} className="mt-1 size-4 shrink-0 accent-[var(--color-chocolate)]" />
            <span>
              J&apos;accepte les <Link href="/cgv" target="_blank" className="link-draw">conditions générales de vente</Link> et j&apos;ai pris connaissance de la <Link href="/confidentialite" target="_blank" className="link-draw">politique de confidentialité</Link>.
            </span>
          </label>
          {state.error && <p className="mt-4 t-small text-danger" role="alert">{state.error}</p>}
          <button type="submit" form="checkout-form" className="btn btn-primary mt-6 w-full" disabled={submitting || pending || cart.blocking || !rate}>
            {submitting ? "Redirection…" : demo ? "Continuer vers le paiement simulé" : "Payer de façon sécurisée"}
          </button>
          <p className="mt-4 t-micro text-ink-soft">
            {demo ? "Aucun paiement réel en mode démonstration." : "Vous serez redirigé vers Stripe pour régler par carte, Apple Pay ou Google Pay. Vos données bancaires ne transitent jamais par notre site."}
          </p>
        </div>
      </aside>
    </div>
  );
}
