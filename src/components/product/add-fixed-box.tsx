"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";

/** Ajout d'un coffret à composition imposée (édition limitée). */
export function AddFixedBox({ boxId, composition, label, disabled, light = false }: { boxId: string; composition: Record<string, number>; label: string; disabled?: boolean; light?: boolean }) {
  const { addBox } = useCart();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={light ? "btn btn-light" : "btn btn-primary"}
      disabled={disabled || busy}
      onClick={async () => {
        setBusy(true);
        await addBox({ boxId, composition, giftWrap: false, giftMessage: null, quantity: 1 });
        setBusy(false);
      }}
    >
      {busy ? "Ajout…" : label}
    </button>
  );
}
