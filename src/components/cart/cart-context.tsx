"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { CartView } from "@/lib/cart";
import {
  addBoxToCart, addVariantToCart, applyPromoCode, getCartView, removeCartItem, removePromoCode, updateCartItem, type CartResult,
} from "@/app/actions/cart";

type BoxArgs = Parameters<typeof addBoxToCart>[0];

interface CartCtx {
  cart: CartView | null;
  open: boolean;
  setOpen: (v: boolean) => void;
  pending: boolean;
  notice: { kind: "ok" | "error"; text: string } | null;
  addVariant: (variantId: string, quantity?: number) => Promise<CartResult>;
  addBox: (args: BoxArgs) => Promise<CartResult>;
  setQuantity: (itemId: string, q: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  applyPromo: (code: string) => Promise<CartResult>;
  clearPromo: () => Promise<void>;
  refresh: () => Promise<void>;
  pulse: number; // incrémenté à chaque ajout (animation du compteur)
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<CartCtx["notice"]>(null);
  const [pulse, setPulse] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((n: CartCtx["notice"]) => {
    setNotice(n);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 4200);
  }, []);

  const refresh = useCallback(async () => {
    const c = await getCartView();
    setCart(c);
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  const run = useCallback(
    async (fn: () => Promise<CartResult>, openOnSuccess = false) => {
      const res = await fn();
      startTransition(() => setCart(res.cart));
      if (res.ok) {
        if (openOnSuccess) {
          setPulse((p) => p + 1);
          setOpen(true);
        }
        if (res.message) flash({ kind: "ok", text: res.message });
      } else flash({ kind: "error", text: res.error });
      return res;
    },
    [flash]
  );

  const value = useMemo<CartCtx>(
    () => ({
      cart,
      open,
      setOpen,
      pending,
      notice,
      pulse,
      refresh,
      addVariant: (variantId, quantity = 1) => run(() => addVariantToCart({ variantId, quantity }), true),
      addBox: (args) => run(() => addBoxToCart(args), true),
      setQuantity: async (id, q) => void (await run(() => updateCartItem(id, q))),
      remove: async (id) => void (await run(() => removeCartItem(id))),
      applyPromo: (code) => run(() => applyPromoCode(code)),
      clearPromo: async () => void (await run(() => removePromoCode())),
    }),
    [cart, open, pending, notice, pulse, refresh, run]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return c;
}
