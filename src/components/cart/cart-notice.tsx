"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCart } from "./cart-context";

/** Message éphémère (ajout au panier, erreur de stock…) annoncé aux lecteurs d'écran. */
export function CartNotice() {
  const { notice, open } = useCart();
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-1/2 z-[95] -translate-x-1/2">
      <AnimatePresence>
        {notice && !(open && notice.kind === "ok") && (
          <motion.p
            key={notice.text}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className={`px-5 py-3 t-small shadow-lg ${notice.kind === "error" ? "bg-danger text-cream" : "bg-chocolate text-ivory"}`}
            role={notice.kind === "error" ? "alert" : "status"}
          >
            {notice.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
