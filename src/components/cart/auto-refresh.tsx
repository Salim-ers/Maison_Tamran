"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Rafraîchit la page tant que le paiement est en cours de confirmation (webhook Stripe). */
export function AutoRefresh({ every = 3000, max = 10 }: { every?: number; max?: number }) {
  const router = useRouter();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= max) return;
    const t = setTimeout(() => { router.refresh(); setN((x) => x + 1); }, every);
    return () => clearTimeout(t);
  }, [n, every, max, router]);
  return n >= max ? <p className="mt-4 t-small">La confirmation prend plus de temps que prévu. Vous recevrez un email dès qu&apos;elle arrivera ; vous pouvez fermer cette page.</p> : null;
}
