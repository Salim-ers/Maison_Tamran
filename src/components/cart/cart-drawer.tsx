"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCart } from "./cart-context";
import { euros } from "@/lib/money";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { PromoForm } from "./promo-form";

export function CartDrawer() {
  const { cart, open, setOpen, setQuantity, remove, pending } = useCart();
  const reduce = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement;
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lastFocus.current?.focus?.();
    };
  }, [open, setOpen]);

  const lines = cart?.lines ?? [];
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-labelledby="cart-title">
          <motion.div
            className="absolute inset-0 bg-chocolate/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            ref={panel}
            className="absolute right-0 top-0 flex h-full w-full max-w-[30rem] flex-col bg-ivory shadow-[0_0_60px_rgba(37,28,26,.25)]"
            initial={reduce ? { opacity: 0 } : { x: "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.6, ease: [0.22, 0.8, 0.12, 1] }}
          >
            <div className="flex items-center justify-between border-b hairline px-6 py-5">
              <h2 id="cart-title" className="t-title">Votre panier</h2>
              <button data-autofocus onClick={() => setOpen(false)} className="t-small link-draw" aria-label="Fermer le panier">
                Fermer
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-start justify-center gap-6 px-6">
                <p className="t-display-m max-w-[14ch]">Votre panier attend sa première création.</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/creations" className="btn btn-primary" onClick={() => setOpen(false)}>Découvrir les créations</Link>
                  <Link href="/composer-mon-coffret" className="btn btn-outline" onClick={() => setOpen(false)}>Composer un coffret</Link>
                </div>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto px-6" aria-busy={pending}>
                  <AnimatePresence initial={false}>
                    {lines.map((l) => (
                      <motion.li
                        key={l.id}
                        layout={!reduce}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                        transition={{ duration: 0.45, ease: [0.22, 0.8, 0.12, 1] }}
                        className="grid grid-cols-[5.5rem_1fr] gap-4 border-b hairline py-5"
                      >
                        <Link href={l.href} onClick={() => setOpen(false)} className="relative block aspect-[4/5] overflow-hidden bg-cream">
                          {l.image && <Image src={l.image} alt="" fill sizes="88px" className="object-cover" />}
                        </Link>
                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <Link href={l.href} onClick={() => setOpen(false)} className="font-display text-xl leading-tight">{l.name}</Link>
                            <span className="shrink-0 tabular-nums">{euros(l.totalCents)}</span>
                          </div>
                          {l.composition ? (
                            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 t-micro text-ink-soft" aria-label="Composition">
                              {l.composition.map((c) => (
                                <li key={c.slug} className="flex items-center gap-1.5">
                                  <span className="inline-block size-2 rounded-full" style={{ background: c.color }} aria-hidden />
                                  {c.qty} × {c.name}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-1 t-small text-ink-soft">{l.description}</p>
                          )}
                          {l.giftWrap && <p className="mt-1 t-micro text-ink-soft">Emballage cadeau{l.giftMessage ? " et message personnel" : ""}</p>}
                          {l.errors.map((e) => (
                            <p key={e} className="mt-2 t-small text-danger" role="alert">{e}</p>
                          ))}
                          <div className="mt-3 flex items-center justify-between">
                            <QtyStepper value={l.quantity} min={1} max={20} onChange={(q) => setQuantity(l.id, q)} label={`Quantité pour ${l.name}`} size="sm" />
                            <button onClick={() => remove(l.id)} className="t-small text-ink-soft link-draw">Retirer</button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="border-t hairline bg-cream px-6 py-5">
                  <PromoForm compact />
                  <dl className="mt-4 space-y-1 t-small">
                    <div className="flex justify-between"><dt>Sous-total</dt><dd className="tabular-nums">{euros(cart!.subtotalCents)}</dd></div>
                    {cart!.discountCents > 0 && (
                      <div className="flex justify-between text-success"><dt>Remise {cart!.promo?.code}</dt><dd className="tabular-nums">−{euros(cart!.discountCents)}</dd></div>
                    )}
                    <div className="flex justify-between text-ink-soft"><dt>Livraison</dt><dd>calculée à l&apos;étape suivante</dd></div>
                  </dl>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link href="/panier" onClick={() => setOpen(false)} className="btn btn-outline">Voir le panier</Link>
                    <Link
                      href="/paiement"
                      onClick={(e) => {
                        if (cart!.blocking) e.preventDefault();
                        else setOpen(false);
                      }}
                      aria-disabled={cart!.blocking}
                      className="btn btn-primary"
                    >
                      Commander
                    </Link>
                  </div>
                  {cart!.blocking && <p className="mt-3 t-small text-danger">Corrigez les articles signalés pour continuer.</p>}
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
