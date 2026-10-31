import type { Metadata } from "next";
import Link from "@/components/motion/transition-link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog";
import { orderDetail } from "@/lib/orders";
import { PageIntro } from "@/components/layout/page-intro";
import { OrderRecap } from "@/components/cart/order-recap";
import { OrderTimeline } from "@/components/account/order-timeline";

export const metadata: Metadata = { title: "Commande", robots: { index: false } };

async function Detail({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const user = await requireUser(`/compte/commandes/${number}`);
  const [o] = await db.select().from(schema.orders).where(and(eq(schema.orders.number, decodeURIComponent(number)), eq(schema.orders.userId, user.id))).limit(1);
  if (!o) notFound();
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
      <Link href="/compte" className="btn btn-outline">Toutes mes commandes</Link>
    </div>
  );
}

export default function CommandePage({ params }: PageProps<"/compte/commandes/[number]">) {
  return (
    <>
      <PageIntro title="Ma commande" crumbs={[{ href: "/compte", label: "Compte" }, { href: "/compte", label: "Commandes" }]} />
      <section className="container-luxe pb-[var(--section)]">
        <Suspense fallback={<div className="h-64" aria-busy />}><Detail params={params} /></Suspense>
      </section>
    </>
  );
}
