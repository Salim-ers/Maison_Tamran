"use client";

import Link from "next/link";
import { useState } from "react";
import { clsx } from "clsx";
import { AddToCartButton } from "@/components/cart/add-button";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { euros } from "@/lib/money";

interface V {
  id: string;
  name: string;
  pieces: number;
  priceCents: number;
  stock: number;
}

export function BuyBox({ slug, name, variants, purchasable, statusNote }: { slug: string; name: string; variants: V[]; purchasable: boolean; statusNote: string | null }) {
  const [vid, setVid] = useState(variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const v = variants.find((x) => x.id === vid);
  const out = !v || v.stock < 1;
  const max = Math.max(1, Math.min(20, v?.stock ?? 1));

  return (
    <div className="border-y hairline py-8">
      {variants.length > 0 && (
        <fieldset>
          <legend className="t-small font-semibold">Format</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {variants.map((x) => (
              <label
                key={x.id}
                className={clsx(
                  "flex cursor-pointer items-center justify-between border px-4 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bronze",
                  x.id === vid ? "border-chocolate bg-cream" : "hairline hover:border-chocolate/50"
                )}
              >
                <input type="radio" name="variant" value={x.id} checked={x.id === vid} onChange={() => { setVid(x.id); setQty(1); }} className="sr-only" />
                <span>
                  <span className="block">{x.name}</span>
                  <span className="t-micro text-ink-soft">{x.stock < 1 ? "Épuisé" : x.stock <= 5 ? `Plus que ${x.stock} disponible${x.stock > 1 ? "s" : ""}` : "En stock"}</span>
                </span>
                <span className="tabular-nums">{euros(x.priceCents)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {purchasable ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <QtyStepper value={qty} min={1} max={max} onChange={setQty} label="Quantité" disabled={out} />
          <AddToCartButton
            variantId={vid}
            quantity={qty}
            disabled={out}
            className="btn btn-primary flex-1"
            label={out ? "Épuisé" : `Ajouter au panier, ${euros((v?.priceCents ?? 0) * qty)}`}
          />
        </div>
      ) : (
        <p className="mt-6 t-small text-ink-soft" role="note">
          Cette recette n&apos;est pas encore disponible à la vente. Inscrivez-vous à la lettre de la Maison pour être prévenu de son lancement.
        </p>
      )}
      {statusNote && <p className="mt-4 t-micro text-ink-soft">{statusNote}</p>}
      <Link href={`/composer-mon-coffret?format=12&selection=${encodeURIComponent(`${slug}:3`)}`} className="mt-6 inline-block t-small link-draw">
        Composer un coffret avec {name}
      </Link>
    </div>
  );
}
