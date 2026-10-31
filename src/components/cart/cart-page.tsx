"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "./cart-context";
import { PromoForm } from "./promo-form";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { quoteShipping } from "@/app/actions/cart";
import type { CartView } from "@/lib/cart";
import { euros } from "@/lib/money";
import { COUNTRIES } from "@/lib/countries";

export function CartPage() {
  const { cart, setQuantity, remove } = useCart();
  const [country, setCountry] = useState("FR");
  const [estimate, setEstimate] = useState<CartView | null>(null);

  useEffect(() => {
    if (!cart?.lines.length) return;
    void quoteShipping(country, null).then(setEstimate);
  }, [country, cart?.subtotalCents, cart?.promo?.code, cart?.lines.length]);

  if (!cart) return <div className="h-64" aria-busy />;
  if (!cart.lines.length) {
    return (
      <div className="py-12">
        <p className="t-display-m max-w-[18ch]">Votre panier attend sa première création.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/creations" className="btn btn-primary">Découvrir les créations</Link>
          <Link href="/composer-mon-coffret" className="btn btn-outline">Composer un coffret</Link>
        </div>
      </div>
    );
  }
  const cheapest = estimate?.shipping.length ? Math.min(...estimate.shipping.map((s) => s.priceCents)) : null;

  return (
    <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
      <ul className="divide-y divide-line border-y hairline">
        {cart.lines.map((l) => (
          <li key={l.id} className="grid grid-cols-[6rem_1fr] gap-5 py-6 sm:grid-cols-[8rem_1fr]">
            <Link href={l.href} className="relative aspect-[4/5] overflow-hidden bg-taupe/30">
              {l.image && <Image src={l.image} alt="" fill sizes="128px" className="object-cover" />}
            </Link>
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={l.href} className="font-display text-2xl">{l.name}</Link>
                  <p className="t-small text-ink-soft">{euros(l.unitCents)} l&apos;unité</p>
                </div>
                <p className="font-display text-xl tabular-nums">{euros(l.totalCents)}</p>
              </div>
              {l.composition ? (
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 t-small text-ink-soft">
                  {l.composition.map((c) => (
                    <li key={c.slug} className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: c.color }} aria-hidden />{c.qty} × {c.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 t-small text-ink-soft">{l.description}</p>
              )}
              {l.giftWrap && <p className="mt-2 t-small">Emballage cadeau</p>}
              {l.giftMessage && <p className="mt-2 border-l-2 border-bronze pl-3 font-display italic">« {l.giftMessage} »</p>}
              {l.errors.map((e) => <p key={e} className="mt-2 t-small text-danger" role="alert">{e}</p>)}
              <div className="mt-4 flex items-center gap-6">
                <QtyStepper value={l.quantity} min={1} max={20} onChange={(q) => setQuantity(l.id, q)} label={`Quantité pour ${l.name}`} size="sm" />
                <button onClick={() => remove(l.id)} className="t-small link-draw text-ink-soft">Retirer</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <div className="bg-cream p-6 sm:p-8">
          <PromoForm />
          <div className="mt-6">
            <label htmlFor="est-country" className="field-label">Estimer la livraison</label>
            <select id="est-country" className="field" value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
          <dl className="mt-6 space-y-2 t-small">
            <div className="flex justify-between"><dt>Sous-total</dt><dd className="tabular-nums">{euros(cart.subtotalCents)}</dd></div>
            {cart.discountCents > 0 && <div className="flex justify-between text-success"><dt>Remise {cart.promo?.code}</dt><dd className="tabular-nums">−{euros(cart.discountCents)}</dd></div>}
            <div className="flex justify-between"><dt>Livraison</dt><dd>{cheapest == null ? "Non disponible pour ce pays" : cheapest === 0 ? "Offerte" : `dès ${euros(cheapest)}`}</dd></div>
            <div className="flex justify-between border-t hairline pt-3 text-base"><dt className="font-semibold">Total estimé</dt><dd className="font-display text-2xl tabular-nums">{euros(cart.subtotalCents - cart.discountCents + (cheapest ?? 0))}</dd></div>
          </dl>
          <Link href="/paiement" aria-disabled={cart.blocking} onClick={(e) => cart.blocking && e.preventDefault()} className="btn btn-primary mt-6 w-full">Passer commande</Link>
          {cart.blocking && <p className="mt-3 t-small text-danger">Corrigez les articles signalés pour continuer.</p>}
          <p className="mt-4 t-micro text-ink-soft">Prix et disponibilités vérifiés à nouveau au moment du paiement.</p>
        </div>
      </aside>
    </div>
  );
}
