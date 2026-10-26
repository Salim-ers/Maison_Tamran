"use client";

import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { useCart } from "./cart-context";

type State = "idle" | "busy" | "done" | "error";

/**
 * Ajout au panier avec retour visuel immédiat : chargement, confirmation (coche), ou erreur.
 * Le texte d'état est annoncé aux lecteurs d'écran.
 */
export function AddToCartButton({
  variantId,
  quantity = 1,
  label,
  doneLabel = "Ajouté au panier",
  className,
  compact = false,
  disabled,
  ariaLabel,
}: {
  variantId: string;
  quantity?: number;
  label: React.ReactNode;
  doneLabel?: string;
  className?: string;
  compact?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const { addVariant } = useCart();
  const reduce = useReducedMotion();
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (state !== "done" && state !== "error") return;
    const t = setTimeout(() => setState("idle"), 2200);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <>
      <motion.button
        type="button"
        disabled={disabled || state === "busy"}
        aria-label={ariaLabel}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        onClick={async (e) => {
          e.stopPropagation();
          setState("busy");
          const r = await addVariant(variantId, quantity);
          setState(r.ok ? "done" : "error");
          setMessage(r.ok ? doneLabel : r.error);
        }}
        className={clsx("relative overflow-hidden", className)}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={state}
            initial={reduce ? false : { y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: -12, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center gap-2"
          >
            {state === "busy" && <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
            {state === "done" && (
              <svg aria-hidden viewBox="0 0 20 20" className="size-4">
                <motion.path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35 }} />
              </svg>
            )}
            {!compact && (state === "busy" ? "Ajout…" : state === "done" ? doneLabel : state === "error" ? "Réessayer" : label)}
            {compact && state === "idle" && label}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "done" || state === "error" ? message : ""}
      </span>
    </>
  );
}
