"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { useCart } from "@/components/cart/cart-context";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { euros } from "@/lib/money";
import { BoxPreview, type FlavorSwatch } from "./box-preview";
import type { ImageRef } from "@/db/schema";

export interface ConfBox {
  id: string;
  slug: string;
  name: string;
  pieces: number;
  priceCents: number;
  stock: number;
  purchasable: boolean;
}

export interface ConfFlavor extends FlavorSwatch {
  pairing: string;
  collection: string;
  stockPieces: number;
  supplementCents: number;
  purchasable: boolean;
  image: ImageRef | null;
}

const MESSAGE_MAX = 240;

export function Configurator({
  boxes, flavors, giftWrapCents, giftWrapLabel, initialFormat, initialSelection,
}: {
  boxes: ConfBox[];
  flavors: ConfFlavor[];
  giftWrapCents: number;
  giftWrapLabel: string;
  initialFormat: number | null;
  initialSelection: Record<string, number>;
}) {
  const { addBox } = useCart();
  const reduce = useReducedMotion();
  const byPieces = (n: number | null) => boxes.find((b) => b.pieces === n) ?? boxes.find((b) => b.pieces === 12) ?? boxes[0];
  const [boxId, setBoxId] = useState(() => byPieces(initialFormat)?.id ?? "");
  const box = boxes.find((b) => b.id === boxId)!;
  const flavorMap = useMemo(() => new Map(flavors.map((f) => [f.slug, f])), [flavors]);
  const [slots, setSlots] = useState<string[]>(() => {
    const out: string[] = [];
    for (const [slug, q] of Object.entries(initialSelection)) {
      const f = flavorMap.get(slug);
      if (!f?.purchasable) continue;
      for (let i = 0; i < q && out.length < (box?.pieces ?? 0); i++) out.push(slug);
    }
    return out;
  });
  const [giftWrap, setGiftWrap] = useState(false);
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "signature" | "ephemere">("all");

  if (!box) return <p className="py-20 text-center">Aucun coffret n&apos;est disponible pour le moment.</p>;

  const counts = slots.reduce<Record<string, number>>((a, s) => ((a[s] = (a[s] ?? 0) + 1), a), {});
  const left = box.pieces - slots.length;
  const supplements = slots.reduce((s, slug) => s + (flavorMap.get(slug)?.supplementCents ?? 0), 0);
  const unit = box.priceCents + supplements + (giftWrap ? giftWrapCents : 0);
  const total = unit * quantity;
  const available = (f: ConfFlavor) => Math.max(0, f.stockPieces - (counts[f.slug] ?? 0) * quantity);

  const setFormat = (b: ConfBox) => {
    setBoxId(b.id);
    setSlots((s) => s.slice(0, b.pieces));
    setError(null);
  };
  const inc = (slug: string) => setSlots((s) => (s.length < box.pieces ? [...s, slug] : s));
  const dec = (slug: string) =>
    setSlots((s) => {
      const i = s.lastIndexOf(slug);
      return i < 0 ? s : [...s.slice(0, i), ...s.slice(i + 1)];
    });
  const setCount = (slug: string, n: number) => {
    const cur = counts[slug] ?? 0;
    if (n > cur) for (let i = cur; i < n; i++) inc(slug);
    else for (let i = n; i < cur; i++) dec(slug);
  };
  /** Complète les places libres en alternant les saveurs déjà choisies (ou toute la collection Signature). */
  const fillRest = () =>
    setSlots((s) => {
      const chosen = [...new Set(s)];
      const pool = (chosen.length ? chosen : flavors.filter((f) => f.purchasable && f.collection === "signature").map((f) => f.slug)).filter((x) => flavorMap.get(x)?.purchasable);
      if (!pool.length) return s;
      const out = [...s];
      let k = 0;
      while (out.length < box.pieces) out.push(pool[k++ % pool.length]);
      return out;
    });

  const shown = flavors.filter((f) => filter === "all" || f.collection === filter);

  const submit = async () => {
    setError(null);
    if (left > 0) return setError(`Il reste ${left} place${left > 1 ? "s" : ""} à remplir.`);
    setBusy(true);
    const res = await addBox({ boxId: box.id, composition: counts, giftWrap, giftMessage: message.trim() || null, quantity });
    setBusy(false);
    if (!res.ok) setError(res.error);
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_minmax(22rem,0.85fr)] lg:gap-16">
      <div className="space-y-16">
        {/* 1. Format */}
        <section aria-labelledby="step-format">
          <h2 id="step-format" className="flex items-baseline gap-3 t-title"><span className="t-numeral text-bronze">1</span>Le format</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-labelledby="step-format">
            {boxes.map((b) => {
              const on = b.id === box.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={!b.purchasable || b.stock < 1}
                  onClick={() => setFormat(b)}
                  className={clsx("border p-5 text-left transition-colors disabled:opacity-40", on ? "border-chocolate bg-cream" : "hairline hover:border-chocolate/50")}
                >
                  <span className="block font-display text-4xl leading-none">{b.pieces}</span>
                  <span className="mt-2 block t-small">{b.name.replace("Coffret ", "")}</span>
                  <span className="mt-1 block t-small tabular-nums text-ink-soft">{b.stock < 1 ? "Épuisé" : euros(b.priceCents)}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Saveurs */}
        <section aria-labelledby="step-flavors">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="step-flavors" className="flex items-baseline gap-3 t-title"><span className="t-numeral text-bronze">2</span>Les saveurs</h2>
            <div className="flex gap-1 t-small" role="group" aria-label="Filtrer les saveurs">
              {(["all", "signature", "ephemere"] as const).map((k) => (
                <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={clsx("px-3 py-1.5 transition-colors", filter === k ? "bg-chocolate text-ivory" : "hover:bg-cream")}>
                  {k === "all" ? "Toutes" : k === "signature" ? "Signature" : "Éphémères"}
                </button>
              ))}
            </div>
          </div>
          <ul className="mt-6 divide-y divide-line border-y hairline">
            {shown.map((f) => {
              const n = counts[f.slug] ?? 0;
              const stockLeft = available(f);
              const disabled = !f.purchasable;
              return (
                <li key={f.slug} className={clsx("grid grid-cols-[4rem_1fr_auto] items-center gap-4 py-4", disabled && "opacity-50")}>
                  <div className="relative aspect-square overflow-hidden bg-taupe/30">
                    {f.image && <Image src={f.image.url} alt="" fill sizes="64px" quality={75} className="object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-display text-xl leading-tight">
                      <span className="size-2 shrink-0 rounded-full" style={{ background: f.accent }} aria-hidden />
                      {f.name}
                    </p>
                    <p className="t-small text-ink-soft">{f.pairing}</p>
                    <p className="t-micro text-ink-soft">
                      {disabled ? "Indisponible" : stockLeft <= 12 ? `Plus que ${stockLeft} pièce${stockLeft > 1 ? "s" : ""}` : f.collection === "ephemere" ? "Édition éphémère" : ""}
                      {f.supplementCents > 0 && ` Supplément ${euros(f.supplementCents)} par pièce.`}
                    </p>
                  </div>
                  <QtyStepper
                    value={n}
                    min={0}
                    max={Math.min(box.pieces, n + Math.min(left, stockLeft))}
                    onChange={(v) => setCount(f.slug, v)}
                    label={`Nombre de ${f.name}`}
                    decLabel={`Retirer un ${f.name}`}
                    incLabel={`Ajouter un ${f.name}`}
                    disabled={disabled}
                  />
                </li>
              );
            })}
          </ul>
        </section>

        {/* 3. Finition */}
        <section aria-labelledby="step-finish">
          <h2 id="step-finish" className="flex items-baseline gap-3 t-title"><span className="t-numeral text-bronze">3</span>L&apos;attention</h2>
          <label className="mt-6 flex cursor-pointer items-start gap-4 border hairline bg-cream p-5">
            <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="mt-1 size-4 accent-[var(--color-chocolate)]" />
            <span className="flex-1">
              <span className="flex justify-between gap-4"><span>Emballage cadeau</span><span className="tabular-nums">+{euros(giftWrapCents)}</span></span>
              <span className="mt-1 block t-small text-ink-soft">{giftWrapLabel}</span>
            </span>
          </label>
          <div className="mt-6">
            <label htmlFor="gift-message" className="field-label">Message personnel <span className="font-normal text-ink-soft">(facultatif, imprimé sur la carte)</span></label>
            <textarea
              id="gift-message"
              rows={4}
              maxLength={MESSAGE_MAX}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="field font-display text-lg italic"
              placeholder="Pour toi, une douceur à partager avec le café."
              aria-describedby="gift-count"
            />
            <p id="gift-count" className="mt-1 text-right t-micro text-ink-soft">{message.length} / {MESSAGE_MAX}</p>
          </div>
        </section>
      </div>

      {/* Aperçu et récapitulatif */}
      <aside className="lg:sticky lg:top-[calc(var(--header-h)+var(--banner-h)+1.5rem)] lg:self-start" aria-label="Aperçu du coffret">
        <motion.div key={box.id} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <BoxPreview pieces={box.pieces} slots={slots} flavors={flavorMap} onRemoveAt={(i) => setSlots((s) => s.filter((_, j) => j !== i))} />
        </motion.div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="t-small" aria-live="polite">
            {left === 0 ? <span className="text-success">Votre coffret est complet.</span> : <>Il reste <strong className="font-semibold">{left}</strong> place{left > 1 ? "s" : ""} sur {box.pieces}.</>}
          </p>
          <div className="flex gap-3 t-small">
            {left > 0 && <button type="button" onClick={fillRest} className="link-draw">Compléter</button>}
            {slots.length > 0 && <button type="button" onClick={() => setSlots([])} className="link-draw text-ink-soft">Vider</button>}
          </div>
        </div>
        <div className="mt-2 h-px w-full bg-line" aria-hidden>
          <motion.div className="h-px bg-chocolate" animate={{ width: `${(slots.length / box.pieces) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>

        {slots.length > 0 && (
          <ul className="mt-6 space-y-1 t-small">
            {Object.entries(counts).map(([slug, q]) => (
              <li key={slug} className="flex justify-between">
                <span>{flavorMap.get(slug)?.name}</span>
                <span className="tabular-nums text-ink-soft">× {q}</span>
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-6 space-y-1 border-t hairline pt-5 t-small">
          <div className="flex justify-between"><dt>{box.name}</dt><dd className="tabular-nums">{euros(box.priceCents)}</dd></div>
          {supplements > 0 && <div className="flex justify-between"><dt>Suppléments</dt><dd className="tabular-nums">{euros(supplements)}</dd></div>}
          {giftWrap && <div className="flex justify-between"><dt>Emballage cadeau</dt><dd className="tabular-nums">{euros(giftWrapCents)}</dd></div>}
        </dl>
        <div className="mt-5 flex items-center justify-between gap-4">
          <QtyStepper value={quantity} min={1} max={Math.max(1, Math.min(10, box.stock))} onChange={setQuantity} label="Nombre de coffrets" />
          <p className="font-display text-3xl tabular-nums">{euros(total)}</p>
        </div>
        <button type="button" onClick={submit} disabled={busy || !box.purchasable} aria-disabled={left > 0} className={clsx("btn btn-primary mt-6 w-full", left > 0 && "opacity-60")}>
          {busy ? "Ajout…" : "Ajouter le coffret au panier"}
        </button>
        {error && <p className="mt-3 t-small text-danger" role="alert">{error}</p>}
        <p className="mt-4 t-micro text-ink-soft">Le prix et la disponibilité sont vérifiés à nouveau au moment de l&apos;ajout au panier et du paiement.</p>
      </aside>
    </div>
  );
}
