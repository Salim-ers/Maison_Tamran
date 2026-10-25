import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCatalog } from "@/lib/catalog";
import { findOrderByAccess, orderDetail } from "@/lib/orders";
import { syncOrderFromSession } from "@/lib/stripe";
import { STATUS_LABELS } from "@/lib/email";
import { PageIntro } from "@/components/layout/page-intro";
import { OrderRecap } from "@/components/cart/order-recap";
import { AutoRefresh } from "@/components/cart/auto-refresh";
import { Monogram } from "@/components/brand";

export const metadata: Metadata = { title: "Confirmation de commande", robots: { index: false } };

async function Confirmation({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const number = typeof sp.commande === "string" ? sp.commande : "";
  const token = typeof sp.t === "string" ? sp.t : "";
  let order = await findOrderByAccess(number, token);
  if (!order) {
    return (
      <div className="py-10">
        <p className="t-title">Nous ne retrouvons pas cette commande.</p>
        <p className="mt-3 text-ink-soft">Le lien est peut-être incomplet. Retrouvez votre commande avec son numéro et votre email.</p>
        <Link href="/suivi-commande" className="btn btn-primary mt-6">Suivre une commande</Link>
      </div>
    );
  }
  // Si le webhook n'est pas encore arrivé, on interroge Stripe (sans jamais supposer le paiement).
  if (order.status === "pending_payment" && order.stripeSessionId && process.env.STRIPE_SECRET_KEY) {
    try {
      await syncOrderFromSession(order);
      order = (await findOrderByAccess(number, token)) ?? order;
    } catch (e) {
      console.error("sync stripe", e);
    }
  }
  const detail = await orderDetail(order.id);
  const { products } = await getCatalog();
  const names = Object.fromEntries(products.map((p) => [p.slug, p.name]));
  const track = `/suivi-commande/${encodeURIComponent(order.number)}?t=${encodeURIComponent(token)}`;

  if (order.status === "pending_payment") {
    return (
      <div className="py-6" aria-live="polite">
        <p className="t-display-m">Paiement en cours de confirmation</p>
        <p className="mt-4 max-w-[56ch] text-ink-soft">Votre banque n&apos;a pas encore confirmé le paiement de la commande {order.number}. Cette page se met à jour automatiquement.</p>
        <AutoRefresh />
      </div>
    );
  }
  if (order.status === "payment_failed" || order.status === "cancelled") {
    return (
      <div className="py-6">
        <p className="t-display-m">Le paiement n&apos;a pas abouti</p>
        <p className="mt-4 max-w-[56ch] text-ink-soft">La commande {order.number} est au statut « {STATUS_LABELS[order.status].toLowerCase()} ». Aucun montant n&apos;a été débité pour celle-ci.</p>
        <Link href="/paiement" className="btn btn-primary mt-6">Reprendre ma commande</Link>
      </div>
    );
  }
  return (
    <div>
      <div className="flex flex-col items-start gap-6 border-b hairline pb-12">
        <Monogram className="h-14 w-auto text-bronze" title={null} />
        <p className="t-display-m max-w-[20ch]">Merci, votre commande est confirmée.</p>
        <p className="max-w-[58ch] text-ink-soft">
          Commande <strong className="font-semibold text-ink">{order.number}</strong>. Un email récapitulatif vient d&apos;être envoyé à {order.email}.
          {order.isDemo && " Commande de démonstration : rien ne sera expédié."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={track} className="btn btn-primary">Suivre ma commande</Link>
          <Link href="/creations" className="btn btn-outline">Continuer la visite</Link>
        </div>
      </div>
      {detail && <div className="pt-12"><OrderRecap order={detail.order} items={detail.items} names={names} /></div>}
    </div>
  );
}

export default function ConfirmationPage({ searchParams }: PageProps<"/paiement/confirmation">) {
  return (
    <>
      <PageIntro title="Votre commande" crumbs={[{ href: "/paiement/confirmation", label: "Confirmation" }]} />
      <section className="container-luxe pb-[var(--section)]">
        <Suspense fallback={<div className="h-64" aria-busy />}>
          <Confirmation searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}
