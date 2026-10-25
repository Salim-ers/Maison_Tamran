import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { findOrderByAccess } from "@/lib/orders";
import { STATUS_LABELS } from "@/lib/email";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = { title: "Paiement non abouti", robots: { index: false } };

const REASONS: Record<string, string> = {
  refuse: "Votre banque a refusé le paiement.",
  annule: "Le paiement a été interrompu avant sa validation.",
};

async function Failure({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const number = typeof sp.commande === "string" ? sp.commande : "";
  const token = typeof sp.t === "string" ? sp.t : "";
  const reason = typeof sp.raison === "string" ? sp.raison : "";
  const order = await findOrderByAccess(number, token);
  // Cohérence avec l'état réel : une commande payée n'affiche jamais d'échec.
  if (order?.status === "paid") {
    return (
      <div>
        <p className="t-display-m">Cette commande est payée.</p>
        <Link href={`/paiement/confirmation?commande=${encodeURIComponent(order.number)}&t=${encodeURIComponent(token)}`} className="btn btn-primary mt-6">Voir la confirmation</Link>
      </div>
    );
  }
  return (
    <div>
      <p className="t-display-m max-w-[20ch]">Le paiement n&apos;a pas abouti.</p>
      <p className="mt-5 max-w-[58ch] text-ink-soft">
        {REASONS[reason] ?? "Le paiement n'a pas été validé."} Aucun montant n&apos;a été débité.
        {order && ` Commande ${order.number} : ${STATUS_LABELS[order.status].toLowerCase()}.`} Votre panier est conservé : vous pouvez réessayer, avec la même carte ou un autre moyen de paiement.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/paiement" className="btn btn-primary">Réessayer le paiement</Link>
        <Link href="/panier" className="btn btn-outline">Revoir mon panier</Link>
        <Link href="/contact" className="btn px-3 link-draw [background-size:0_1px] hover:[background-size:100%_1px]">Nous écrire</Link>
      </div>
    </div>
  );
}

export default function EchecPage({ searchParams }: PageProps<"/paiement/echec">) {
  return (
    <>
      <PageIntro title="Paiement" crumbs={[{ href: "/paiement", label: "Paiement" }]} />
      <section className="container-luxe pb-[var(--section)]">
        <Suspense fallback={<div className="h-64" aria-busy />}>
          <Failure searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}
