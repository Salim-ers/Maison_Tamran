import type { Metadata } from "next";
import Link from "@/components/motion/transition-link";
import { Suspense } from "react";
import { getCatalog } from "@/lib/catalog";
import { findOrderByAccess, orderDetail } from "@/lib/orders";
import { PageIntro } from "@/components/layout/page-intro";
import { OrderRecap } from "@/components/cart/order-recap";
import { OrderTimeline } from "@/components/account/order-timeline";

export const metadata: Metadata = { title: "Suivi de commande", robots: { index: false } };

async function Tracking({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ number }, sp] = await Promise.all([params, searchParams]);
  const o = await findOrderByAccess(decodeURIComponent(number), typeof sp.t === "string" ? sp.t : "");
  if (!o) {
    return (
      <div>
        <p className="t-title">Ce lien de suivi n&apos;est pas valide.</p>
        <Link href="/suivi-commande" className="btn btn-primary mt-6">Rechercher ma commande</Link>
      </div>
    );
  }
  const d = (await orderDetail(o.id))!;
  const { products } = await getCatalog();
  return (
    <div className="space-y-14">
      <div>
        <h2 className="t-display-m">Commande {o.number}</h2>
        {o.isDemo && <p className="mt-2 t-small text-ink-soft">Commande de démonstration : aucun paiement encaissé, aucune expédition.</p>}
      </div>
      <OrderTimeline status={o.status} events={d.events} />
      <OrderRecap order={o} items={d.items} names={Object.fromEntries(products.map((p) => [p.slug, p.name]))} />
    </div>
  );
}

export default function SuiviDetailPage({ params, searchParams }: PageProps<"/suivi-commande/[number]">) {
  return (
    <>
      <PageIntro title="Suivi de commande" crumbs={[{ href: "/suivi-commande", label: "Suivi de commande" }]} />
      <section className="container-luxe pb-[var(--section)]">
        <Suspense fallback={<div className="h-64" aria-busy />}><Tracking params={params} searchParams={searchParams} /></Suspense>
      </section>
    </>
  );
}
