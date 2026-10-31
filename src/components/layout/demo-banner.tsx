import Link from "next/link";
import { storeMode } from "@/lib/env";

/** Bandeau permanent tant que la boutique n'encaisse pas de vrais paiements. */
export function DemoBanner() {
  if (storeMode() !== "demo") return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex h-[var(--banner-h)] items-center justify-center bg-[#696e46] px-4 text-center text-[0.78rem] leading-tight text-cream">
      <p>
        Boutique de démonstration<span className="max-sm:hidden"> : les commandes sont simulées et aucun paiement n&apos;est encaissé</span>.{" "}
        <Link href="/faq#demonstration" className="underline underline-offset-2">En savoir plus</Link>
      </p>
    </div>
  );
}

export function bannerHeight() {
  return storeMode() === "demo" ? "2.25rem" : "0px";
}
