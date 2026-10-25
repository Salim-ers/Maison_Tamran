"use client";

import { useState } from "react";
import { useCart } from "./cart-context";

export function PromoForm({ compact = false }: { compact?: boolean }) {
  const { cart, applyPromo, clearPromo } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const promo = cart?.promo;

  if (promo?.ok) {
    return (
      <div className="flex items-center justify-between t-small">
        <span>
          Code <strong className="font-semibold">{promo.code}</strong> : {promo.message.toLowerCase()}
        </span>
        <button className="link-draw text-ink-soft" onClick={() => clearPromo()}>Retirer</button>
      </div>
    );
  }
  return (
    <form
      className="t-small"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const res = await applyPromo(code);
        setBusy(false);
        if (res.ok) { setCode(""); setError(null); } else setError(res.error);
      }}
    >
      <label htmlFor={compact ? "promo-c" : "promo"} className={compact ? "sr-only" : "field-label"}>Code promotionnel</label>
      <div className="flex gap-2">
        <input
          id={compact ? "promo-c" : "promo"}
          className="field min-h-11 uppercase placeholder:normal-case"
          placeholder="Code promotionnel"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          aria-invalid={!!error}
          aria-describedby={error ? "promo-err" : undefined}
        />
        <button className="btn btn-outline min-h-11 px-5" disabled={busy || !code.trim()}>Appliquer</button>
      </div>
      {error && <p id="promo-err" className="mt-2 text-danger" role="alert">{error}</p>}
    </form>
  );
}
