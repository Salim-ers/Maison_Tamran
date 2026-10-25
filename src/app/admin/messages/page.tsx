import { count, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { adminPage, sp, type SearchParams } from "../guard";
import { AdminHeader, Badge, EmptyState, FilterTabs, Panel } from "@/components/admin/ui";
import { HandledButton } from "@/components/admin/site-forms";
import { fmtDateTime } from "@/components/admin/format";
import Link from "next/link";

export const instant = false;
export const metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: { searchParams: SearchParams }) {
  await adminPage();
  const q = await searchParams;
  const handled = sp(q.statut) === "traites";
  const [rows, counts] = await Promise.all([
    db.select().from(schema.contactMessages).where(eq(schema.contactMessages.handled, handled)).orderBy(desc(schema.contactMessages.createdAt)).limit(200),
    db.select({ h: schema.contactMessages.handled, n: count() }).from(schema.contactMessages).groupBy(schema.contactMessages.handled),
  ]);
  const orderNumbers = [...new Set(rows.map((r) => r.orderNumber).filter((x): x is string => !!x))];
  const orders = orderNumbers.length ? await db.select({ id: schema.orders.id, number: schema.orders.number }).from(schema.orders).where(inArray(schema.orders.number, orderNumbers)) : [];
  const orderId = new Map(orders.map((o) => [o.number, o.id]));
  const cm = new Map(counts.map((c) => [c.h, c.n]));
  return (
    <>
      <AdminHeader title="Messages de contact" intro="Messages envoyés depuis le formulaire de contact. Répondez par email, puis marquez le message comme traité." />
      <FilterTabs
        label="Filtrer"
        current={handled ? "traites" : "a-traiter"}
        items={[
          { value: "a-traiter", label: "À traiter", href: "/admin/messages", count: cm.get(false) ?? 0 },
          { value: "traites", label: "Traités", href: "/admin/messages?statut=traites", count: cm.get(true) ?? 0 },
        ]}
      />
      <div className="space-y-4">
        {rows.length === 0 && <EmptyState>{handled ? "Aucun message traité." : "Aucun message en attente."}</EmptyState>}
        {rows.map((m) => (
          <Panel key={m.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 max-w-3xl">
                <p className="font-semibold">{m.subject}</p>
                <p className="text-sm text-ink-soft">
                  {m.name} · <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re : ${m.subject}`)}`} className="underline underline-offset-2">{m.email}</a> · {fmtDateTime(m.createdAt)}
                  {m.orderNumber && (
                    <> · commande {orderId.get(m.orderNumber) ? <Link href={`/admin/commandes/${orderId.get(m.orderNumber)}`} className="underline underline-offset-2">{m.orderNumber}</Link> : <>{m.orderNumber} <Badge tone="warning">introuvable</Badge></>}</>
                  )}
                </p>
                <p className="mt-3 whitespace-pre-line text-sm">{m.message}</p>
              </div>
              <HandledButton id={m.id} handled={m.handled} />
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
