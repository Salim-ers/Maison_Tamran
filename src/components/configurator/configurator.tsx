"use client";

import Image from "next/image";
import Link from "@/components/motion/transition-link";
import { useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { useCart } from "@/components/cart/cart-context";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { euros } from "@/lib/money";
import { BoxPreview, type BoxPhoto, type FlavorSwatch } from "./box-preview";
import { FLIGHT_S, useFlights } from "./fly";
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
  tagline: string;
  collection: string;
  chocolateLabel: string;
  allergens: string;
  stockPieces: number;
  supplementCents: number;
  purchasable: boolean;
  image: ImageRef | null;
  macro: ImageRef | null;
}

const MESSAGE_MAX = 240;
const DRAFT_KEY = "mt-composer";
const EASE = [0.22, 0.8, 0.12, 1] as const;

/** Lien partageable d'une composition (relu par la page : ?format=12&selection=slug:2,…). */
function shareUrl(pieces: number, counts: Record<string, number>) {
  const sel = Object.entries(counts).map(([s, q]) => `${s}:${q}`).join(",");
  return `${window.location.origin}/composer-mon-coffret?format=${pieces}${sel ? `&selection=${sel}` : ""}`;
}

export function Configurator({
  boxes, flavors, boxPhotos, giftWrapCents, giftWrapLabel, initialFormat, initialSelection,
}: {
  boxes: ConfBox[];
  flavors: ConfFlavor[];
  boxPhotos: Record<number, BoxPhoto>;
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
  const fromSelection = (sel: Record<string, number>, max: number) => {
    const out: string[] = [];
    for (const [slug, q] of Object.entries(sel)) {
      if (!flavorMap.get(slug)?.purchasable) continue;
      for (let i = 0; i < q && out.length < max; i++) out.push(slug);
    }
    return out;
  };
  const [slots, setSlots] = useState<string[]>(() => fromSelection(initialSelection, box?.pieces ?? 0));
  // états précédents de la composition, pour « Revenir » (un par action de l'utilisateur)
  const [history, setHistory] = useState<string[][]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [giftWrap, setGiftWrap] = useState(false);
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "signature" | "ephemere">("all");
  const [detail, setDetail] = useState<ConfFlavor | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  // la datte choisie rejoint visuellement son alvéole
  const { launch, layer } = useFlights(reduce);
  const boxRef = useRef<HTMLDivElement>(null);
  const lastSource = useRef<Element | null>(null);
  const [incoming, setIncoming] = useState<Set<number>>(() => new Set());

  // brouillon : restauré au retour sur la page (si aucun lien de composition n'est ouvert), puis tenu à jour
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    if (Object.keys(initialSelection).length) return;
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null") as { pieces: number; slots: string[] } | null;
      const b = d && boxes.find((x) => x.pieces === d.pieces);
      if (!b || !Array.isArray(d.slots) || !d.slots.length) return;
      setBoxId(b.id);
      setSlots(d.slots.filter((s) => flavorMap.get(s)?.purchasable).slice(0, b.pieces));
      setNotice("Votre dernière sélection a été retrouvée.");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!restored.current || !box) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ pieces: box.pieces, slots }));
    } catch {}
  }, [slots, box]);
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    if (detail) dialog.current?.showModal();
    else dialog.current?.close();
  }, [detail]);

  if (!box) return <p className="py-20 text-center">Aucun coffret n&apos;est disponible pour le moment.</p>;

  const counts = slots.reduce<Record<string, number>>((a, s) => ((a[s] = (a[s] ?? 0) + 1), a), {});
  const left = box.pieces - slots.length;
  const complete = left === 0;
  const supplements = slots.reduce((s, slug) => s + (flavorMap.get(slug)?.supplementCents ?? 0), 0);
  const unit = box.priceCents + supplements + (giftWrap ? giftWrapCents : 0);
  const total = unit * quantity;
  const available = (f: ConfFlavor) => Math.max(0, f.stockPieces - (counts[f.slug] ?? 0) * quantity);
  const photo = boxPhotos[box.pieces] ?? null;

  /** Chaque action de l'utilisateur mémorise la composition qu'elle modifie. */
  const remember = () => setHistory((h) => [...h.slice(-30), slots]);
  const setFormat = (b: ConfBox) => {
    remember();
    setBoxId(b.id);
    setSlots((s) => s.slice(0, b.pieces));
    setSelected(null);
    setError(null);
  };
  const fly = (slug: string, index: number) => {
    const f = flavorMap.get(slug);
    const to = boxRef.current?.querySelector(`[data-slot="${index}"]`);
    if (!f || !launch(f, lastSource.current, to)) return;
    setIncoming((s) => new Set(s).add(index));
    window.setTimeout(() => setIncoming((s) => { const n = new Set(s); n.delete(index); return n; }), FLIGHT_S * 1000 + 80);
  };
  /** Ajoute une création ; si une alvéole est sélectionnée, la création la remplace. */
  const place = (slug: string) => {
    remember();
    placeOne(slug);
  };
  const placeOne = (slug: string) => {
    if (selected !== null && slots[selected]) {
      if (slots[selected] !== slug) {
        fly(slug, selected);
        setSlots((s) => s.map((x, j) => (j === selected ? slug : x)));
      }
      setSelected(null);
      return;
    }
    if (slots.length >= box.pieces) return setError("Le coffret est complet : touchez une pièce pour la remplacer.");
    fly(slug, slots.length);
    setSlots((s) => [...s, slug]);
  };
  const removeOne = (slug: string) =>
    setSlots((s) => {
      const i = s.lastIndexOf(slug);
      return i < 0 ? s : [...s.slice(0, i), ...s.slice(i + 1)];
    });
  const setCount = (f: ConfFlavor, n: number) => {
    setError(null);
    const cur = counts[f.slug] ?? 0;
    remember();
    if (n > cur) for (let i = cur; i < n; i++) placeOne(f.slug);
    else for (let i = n; i < cur; i++) removeOne(f.slug);
  };
  /** Complète les places libres en alternant les saveurs déjà choisies (ou toute la collection Signature). */
  const fillRest = () => {
    remember();
    setSlots((s) => {
      const chosen = [...new Set(s)];
      const pool = (chosen.length ? chosen : flavors.filter((f) => f.purchasable && f.collection === "signature").map((f) => f.slug)).filter((x) => flavorMap.get(x)?.purchasable);
      if (!pool.length) return s;
      const out = [...s];
      let k = 0;
      while (out.length < box.pieces) out.push(pool[k++ % pool.length]);
      return out;
    });
  };
  const undo = () => {
    const prev = history.at(-1);
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setSlots(prev.slice(0, box.pieces));
    setSelected(null);
  };
  const clear = () => {
    remember();
    setSlots([]);
    setSelected(null);
  };
  const removeSelected = () => {
    remember();
    setSlots((s) => s.filter((_, j) => j !== selected));
    setSelected(null);
  };
  const save = async () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ pieces: box.pieces, slots }));
      await navigator.clipboard.writeText(shareUrl(box.pieces, counts));
      setNotice("Sélection enregistrée sur cet appareil. Le lien de votre composition est copié.");
    } catch {
      setNotice("Sélection enregistrée sur cet appareil.");
    }
  };

  const shown = flavors.filter((f) => filter === "all" || f.collection === filter);
  const sel = selected !== null ? flavorMap.get(slots[selected]) : undefined;

  const submit = async () => {
    setError(null);
    if (left > 0) return setError(`Il reste ${left} place${left > 1 ? "s" : ""} à remplir.`);
    setBusy(true);
    const res = await addBox({ boxId: box.id, composition: counts, giftWrap, giftMessage: message.trim() || null, quantity });
    setBusy(false);
    if (!res.ok) setError(res.error);
    else {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
    }
  };

  const summary = (
      <>
        <dl className="mt-6 space-y-1 border-t hairline pt-5 t-small">
          <div className="flex justify-between"><dt>{box.name}</dt><dd className="tabular-nums">{euros(box.priceCents)}</dd></div>
          {supplements > 0 && <div className="flex justify-between"><dt>Suppléments</dt><dd className="tabular-nums">{euros(supplements)}</dd></div>}
          {giftWrap && <div className="flex justify-between"><dt>Emballage cadeau</dt><dd className="tabular-nums">{euros(giftWrapCents)}</dd></div>}
        </dl>
        <div className="mt-5 flex items-center justify-between gap-4">
          <QtyStepper value={quantity} min={1} max={Math.max(1, Math.min(10, box.stock))} onChange={setQuantity} label="Nombre de coffrets" />
          <p className="relative overflow-hidden font-display text-3xl tabular-nums" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={total} className="block" initial={reduce ? false : { y: "100%", opacity: 0 }} animate={{ y: "0%", opacity: 1 }} exit={reduce ? { opacity: 0 } : { y: "-100%", opacity: 0 }} transition={{ duration: 0.45, ease: EASE }}>
                {euros(total)}
              </motion.span>
            </AnimatePresence>
          </p>
        </div>
        <button type="button" onClick={submit} disabled={busy || !box.purchasable} aria-disabled={left > 0} className={clsx("btn btn-primary mt-6 w-full", left > 0 && "opacity-60")}>
          {busy ? "Ajout…" : "Ajouter le coffret au panier"}
        </button>
        <button type="button" onClick={save} disabled={!slots.length} className="mt-3 w-full t-small underline-offset-2 hover:underline disabled:opacity-40">
          Enregistrer ma sélection et copier le lien
        </button>
        {error && <p className="mt-3 t-small text-danger" role="alert">{error}</p>}
        <p className="mt-4 t-micro text-ink-soft">Le prix et la disponibilité sont vérifiés à nouveau au moment de l&apos;ajout au panier et du paiement.</p>
      </>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.9fr)] lg:gap-16">
      {/* Aperçu : en tête et épinglé sur mobile, colonne droite épinglée sur ordinateur */}
      <aside className="sticky top-[calc(var(--header-h)+.5rem)] z-[5] -mx-[var(--gutter)] self-start bg-ivory/95 px-[var(--gutter)] pb-3 pt-2 backdrop-blur-md lg:order-2 lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none" aria-label="Aperçu du coffret">
        <div className="[perspective:1200px]" ref={boxRef} style={{ ["--box-ratio" as string]: photo ? photo.w / photo.h : 1.6 }}>
          <motion.div key={box.id} initial={reduce ? false : { opacity: 0, y: 24, rotateX: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} transition={{ duration: 0.8, ease: EASE }} className="relative">
            <BoxPreview
              pieces={box.pieces}
              slots={slots}
              flavors={flavorMap}
              photo={photo}
              priority
              onSelect={(i) => setSelected((s) => (s === i ? null : i))}
              selected={selected}
              complete={complete}
              incoming={incoming}
              landDelay={FLIGHT_S}
              className="max-lg:mx-auto max-lg:w-[min(100%,calc(28svh*var(--box-ratio)))]"
            />
            <AnimatePresence>
              {complete && (
                <motion.p
                  key="ready"
                  role="status"
                  initial={reduce ? false : { opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: reduce ? 0 : FLIGHT_S + 0.4 }}
                  className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap bg-chocolate/90 px-4 py-2 t-small text-ivory backdrop-blur-sm"
                >
                  <span aria-hidden className="grid size-5 place-items-center rounded-full bg-gold text-[0.7rem] text-chocolate">✓</span>
                  Votre coffret est prêt
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        {layer}

        {/* pièce sélectionnée : remplacer ou retirer */}
        <AnimatePresence initial={false}>
          {sel && selected !== null && (
            <motion.div key="sel" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-gold/60 bg-cream px-4 py-3 t-small">
                <p>
                  Place {selected + 1} : <strong className="font-semibold">{sel.name}</strong>. <span className="text-ink-soft">Choisissez une création pour la remplacer.</span>
                </p>
                <div className="flex gap-4">
                  <button type="button" className="link-draw" onClick={removeSelected}>Retirer</button>
                  <button type="button" className="link-draw text-ink-soft" onClick={() => setSelected(null)}>Annuler</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 flex items-center justify-between gap-4 lg:mt-6">
          <p className="t-small" aria-live="polite">
            {complete ? <span className="text-success">Coffret complet.</span> : <>Il reste <strong className="font-semibold">{left}</strong> place{left > 1 ? "s" : ""} sur {box.pieces}.</>}
          </p>
          <div className="flex gap-4 t-small">
            {history.length > 0 && <button type="button" onClick={undo} className="link-draw">Revenir</button>}
            {left > 0 && <button type="button" onClick={fillRest} className="link-draw">Compléter</button>}
            {slots.length > 0 && <button type="button" onClick={clear} className="link-draw text-ink-soft">Vider</button>}
          </div>
        </div>
        <div className="mt-2 h-px w-full bg-line" aria-hidden>
          <motion.div className="h-px bg-chocolate" animate={{ width: `${(slots.length / box.pieces) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>

        <div className="max-lg:hidden">
          {slots.length > 0 && (
            <ul className="mt-6 space-y-1 t-small">
              {Object.entries(counts).map(([slug, q]) => (
                <li key={slug} className="flex justify-between">
                  <span className="flex items-center gap-2"><span aria-hidden className="size-2 rounded-full" style={{ background: flavorMap.get(slug)?.accent }} />{flavorMap.get(slug)?.name}</span>
                  <span className="tabular-nums text-ink-soft">× {q}</span>
                </li>
              ))}
            </ul>
          )}
          {summary}
        </div>
        <AnimatePresence>
          {notice && (
            <motion.p key={notice} role="status" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 t-micro text-ink-soft">
              {notice}
            </motion.p>
          )}
        </AnimatePresence>
      </aside>

      <div className="space-y-14 lg:order-1">
        {/* 1. Format */}
        <section aria-labelledby="step-format">
          <h2 id="step-format" className="flex items-baseline gap-3 t-title"><span className="t-numeral text-bronze">1</span>Le format</h2>
          <div className="mt-6 grid grid-cols-3 gap-3" role="radiogroup" aria-labelledby="step-format">
            {boxes.map((b) => {
              const on = b.id === box.id;
              const ph = boxPhotos[b.pieces];
              return (
                <button
                  key={b.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={!b.purchasable || b.stock < 1}
                  onClick={() => setFormat(b)}
                  className={clsx("group border text-left transition-colors disabled:opacity-40", on ? "border-chocolate bg-cream" : "hairline hover:border-chocolate/50")}
                >
                  {ph && (
                    <span className="relative block aspect-[4/3] overflow-hidden">
                      <Image src={ph.url} alt="" fill sizes="(min-width: 1024px) 14rem, 30vw" quality={70} className={clsx("object-cover transition-transform duration-700", on ? "scale-100" : "scale-105 group-hover:scale-100")} />
                    </span>
                  )}
                  <span className="block p-3 sm:p-4">
                    <span className="block font-display text-3xl leading-none sm:text-4xl">{b.pieces}</span>
                    <span className="mt-1.5 block t-small">{b.name.replace("Coffret ", "")}</span>
                    <span className="block t-small tabular-nums text-ink-soft">{b.stock < 1 ? "Épuisé" : euros(b.priceCents)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Saveurs */}
        <section aria-labelledby="step-flavors">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="step-flavors" className="flex items-baseline gap-3 t-title"><span className="t-numeral text-bronze">2</span>Les créations</h2>
            <div className="flex gap-1 t-small" role="group" aria-label="Filtrer les créations">
              {(["all", "signature", "ephemere"] as const).map((k) => (
                <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={clsx("px-3 py-1.5 transition-colors", filter === k ? "bg-chocolate text-ivory" : "hover:bg-cream")}>
                  {k === "all" ? "Toutes" : k === "signature" ? "Signature" : "Éphémères"}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-3 t-small text-ink-soft">
            {selected !== null ? "Touchez une création pour remplacer la pièce sélectionnée." : "Touchez une création pour la poser dans le coffret ; touchez une pièce du coffret pour la remplacer."}
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
            {shown.map((f) => {
              const n = counts[f.slug] ?? 0;
              const stockLeft = available(f);
              const disabled = !f.purchasable;
              const img = f.image;
              return (
                <li
                  key={f.slug}
                  className={clsx("group", disabled && "opacity-50")}
                  onPointerDownCapture={(e) => (lastSource.current = e.currentTarget.querySelector("[data-thumb]"))}
                  onKeyDownCapture={(e) => (lastSource.current = e.currentTarget.querySelector("[data-thumb]"))}
                >
                  <button
                    type="button"
                    disabled={disabled || (selected === null && left === 0) || stockLeft < 1}
                    onClick={() => place(f.slug)}
                    className="relative block aspect-square w-full overflow-hidden bg-chocolate disabled:cursor-not-allowed"
                    aria-label={selected !== null ? `Remplacer la place ${selected + 1} par ${f.name}` : `Poser ${f.name} dans le coffret`}
                  >
                    {img && <Image src={img.url} alt="" fill sizes="(min-width: 1024px) 14rem, 45vw" quality={75} className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-luxe)] group-hover:scale-[1.07]" />}
                    {/* la pièce détourée, au centre : c'est elle qui s'envole vers le coffret */}
                    <span data-thumb className="pointer-events-none absolute left-1/2 top-1/2 block w-[46%] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ aspectRatio: "1" }}>
                      {f.piece && <Image src={f.piece.url} alt="" fill sizes="120px" quality={75} className="object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,.6)]" />}
                    </span>
                    {n > 0 && (
                      <motion.span key={n} initial={reduce ? false : { scale: 1.5 }} animate={{ scale: 1 }} className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-gold t-small font-semibold text-chocolate">
                        {n}
                      </motion.span>
                    )}
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-1" style={{ background: f.accent }} />
                  </button>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-[1.15rem] leading-tight">{f.name}</p>
                      <p className="mt-0.5 line-clamp-2 t-micro text-ink-soft">{f.pairing}</p>
                      <p className="mt-0.5 t-micro text-ink-soft">
                        {disabled ? "Indisponible" : stockLeft <= 12 ? `Plus que ${stockLeft} pièce${stockLeft > 1 ? "s" : ""}` : f.collection === "ephemere" ? "Édition éphémère" : ""}
                        {f.supplementCents > 0 && ` · +${euros(f.supplementCents)} / pièce`}
                      </p>
                    </div>
                    <button type="button" onClick={() => setDetail(f)} className="shrink-0 t-micro underline underline-offset-2 hover:text-bronze" aria-label={`Détail de ${f.name}`}>
                      Détail
                    </button>
                  </div>
                  <div className="mt-2">
                    <QtyStepper
                      value={n}
                      min={0}
                      max={Math.min(box.pieces, n + Math.min(left, stockLeft))}
                      onChange={(v) => setCount(f, v)}
                      label={`Nombre de ${f.name}`}
                      decLabel={`Retirer un ${f.name}`}
                      incLabel={`Ajouter un ${f.name}`}
                      disabled={disabled}
                    />
                  </div>
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
          <div className="mt-8 lg:hidden">{summary}</div>
        </section>
      </div>

      {/* détail d'une création */}
      <dialog
        ref={dialog}
        onClose={() => setDetail(null)}
        onClick={(e) => e.target === e.currentTarget && setDetail(null)}
        className="m-auto w-[min(92vw,52rem)] max-w-none bg-ivory p-0 text-ink backdrop:bg-chocolate/70 backdrop:backdrop-blur-sm"
        aria-labelledby="detail-title"
      >
        {detail && (
          <div className="grid sm:grid-cols-2">
            <div className="relative aspect-square bg-chocolate">
              {(detail.macro ?? detail.image) && <Image src={(detail.macro ?? detail.image)!.url} alt={(detail.macro ?? detail.image)!.alt} fill sizes="(min-width: 640px) 26rem, 92vw" quality={85} className="object-cover" />}
              <span className="absolute bottom-3 left-3 bg-chocolate/60 px-2 py-1 text-[0.68rem] text-taupe">Visuel conceptuel · IA</span>
            </div>
            <div className="flex flex-col p-6 sm:p-8">
              <p className="t-micro tracking-[0.14em] text-ink-soft">{detail.collection === "ephemere" ? "ÉDITION ÉPHÉMÈRE" : "COLLECTION SIGNATURE"}</p>
              <h3 id="detail-title" className="mt-2 t-display-m">{detail.name}</h3>
              <p className="mt-2 font-display text-lg italic text-ink-soft">{detail.tagline}</p>
              <p className="mt-4 t-small">{detail.pairing}</p>
              <dl className="mt-4 space-y-1 t-small text-ink-soft">
                <div><dt className="inline text-ink">Enrobage : </dt><dd className="inline">{detail.chocolateLabel}</dd></div>
                <div><dt className="inline text-ink">Allergènes (recette provisoire) : </dt><dd className="inline">{detail.allergens || "à confirmer"}</dd></div>
              </dl>
              <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
                <button type="button" className="btn btn-primary" disabled={!detail.purchasable || (selected === null && left === 0)} onClick={() => { place(detail.slug); setDetail(null); }}>
                  {selected !== null ? "Remplacer la pièce" : "Poser dans le coffret"}
                </button>
                <Link href={`/creations/${detail.slug}`} className="link-draw t-small">Fiche complète</Link>
              </div>
            </div>
            <button type="button" onClick={() => setDetail(null)} className="absolute right-3 top-3 grid size-9 place-items-center bg-ivory/90 text-ink" aria-label="Fermer">✕</button>
          </div>
        )}
      </dialog>
    </div>
  );

}
