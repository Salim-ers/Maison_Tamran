import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { findOrderByAccess, orderDetail } from "@/lib/orders";
import { storeMode } from "@/lib/env";
import { euros } from "@/lib/money";
import { simulateDemoPayment } from "@/app/actions/checkout";
import { PageIntro } from "@/components/layout/page-intro";
import { OrderRecap } from "@/components/cart/order-recap";

export const metadata: Metadata = { title: "Paiement simulé", robots: { index: false } };

async function Simulator({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ number }, sp] = await Promise.all([params, searchParams]);
  const token = typeof sp.t === "string" ? sp.t : "";
  const order = await findOrderByAccess(decodeURIComponent(number), token);
  if (!order || !order.isDemo || storeMode() !== "demo") notFound();
  const detail = await orderDetail(order.id);
  const { products } = await getCatalog();
  const names = Object.fromEntries(products.map((p) => [p.slug, p.name]));
  const act = simulateDemoPayment.bind(null, order.number, token);
  return (
    <div className="space-y-12">
      <div className="border-2 border-dashed border-pistachio bg-cream p-6 sm:p-8">
        <p className="t-title">Terminal de paiement simulé</p>
        <p className="mt-3 max-w-[60ch] t-small text-ink-soft">
          Cette boutique fonctionne en mode démonstration : aucune carte n&apos;est demandée, aucun montant n&apos;est prélevé et la commande <strong className="font-semibold text-ink">{order.number}</strong> ne sera pas expédiée. Choisissez l&apos;issue à simuler pour tester le parcours complet (confirmation, email, stock, statut).
        </p>
        <p className="mt-6 font-display text-3xl tabular-nums">{euros(order.totalCents)}</p>
        {order.status === "pending_payment" ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <form action={act.bind(null, "accepted")}><button className="btn btn-primary">Simuler un paiement accepté</button></form>
            <form action={act.bind(null, "refused")}><button className="btn btn-outline">Simuler un refus de la banque</button></form>
            <form action={act.bind(null, "abandoned")}><button className="btn px-3 link-draw [background-size:0_1px] hover:[background-size:100%_1px]">Abandonner le paiement</button></form>
          </div>
        ) : (
          <p className="mt-6 t-small">Cette commande n&apos;est plus en attente de paiement.</p>
        )}
      </div>
      {detail && <OrderRecap order={detail.order} items={detail.items} names={names} />}
    </div>
  );
}

export default function DemoPaymentPage({ params, searchParams }: PageProps<"/paiement/demo/[number]">) {
  return (
    <>
      <PageIntro title="Paiement" crumbs={[{ href: "/panier", label: "Panier" }, { href: "/paiement", label: "Paiement" }]} />
      <section className="container-luxe pb-[var(--section)]">
        <Suspense fallback={<div className="h-64" aria-busy />}>
          <Simulator params={params} searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}
