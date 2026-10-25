import Link from "next/link";
import { count, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { adminPage, sp, type SearchParams } from "../guard";
import { AdminHeader, Badge, EmptyState, FilterTabs, Notice, Panel } from "@/components/admin/ui";
import { ModerationButtons, NewTestimonialForm } from "@/components/admin/site-forms";
import { fmtDateTime } from "@/components/admin/format";
import { TESTIMONIAL_STATUS } from "@/components/admin/labels";

export const instant = false;
export const metadata = { title: "Témoignages" };

export default async function TestimonialsPage({ searchParams }: { searchParams: SearchParams }) {
  await adminPage();
  const q = await searchParams;
  const status = (["pending", "approved", "rejected"].includes(sp(q.statut)) ? sp(q.statut) : "pending") as "pending" | "approved" | "rejected";
  const [rows, counts, products] = await Promise.all([
    db.select().from(schema.testimonials).where(eq(schema.testimonials.status, status)).orderBy(desc(schema.testimonials.createdAt)),
    db.select({ s: schema.testimonials.status, n: count() }).from(schema.testimonials).groupBy(schema.testimonials.status),
    db.select({ slug: schema.products.slug, name: schema.products.name }).from(schema.products),
  ]);
  const orderIds = rows.map((r) => r.orderId).filter((x): x is string => !!x);
  const orders = orderIds.length ? await db.select({ id: schema.orders.id, number: schema.orders.number }).from(schema.orders).where(inArray(schema.orders.id, orderIds)) : [];
  const orderNo = new Map(orders.map((o) => [o.id, o.number]));
  const pname = new Map(products.map((p) => [p.slug, p.name]));
  const cm = new Map(counts.map((c) => [c.s, c.n]));
  return (
    <>
      <AdminHeader title="Témoignages" intro="Seuls les témoignages approuvés sont publiés sur le site." />
      <Notice tone="warning" className="mb-6" title="Uniquement des avis authentiques">
        Publiez seulement des avis réellement reçus de clients, sans les réécrire ni les sélectionner de façon trompeuse. Inventer ou acheter des avis est une pratique commerciale trompeuse (article L121-2 du Code de la consommation).
      </Notice>
      <FilterTabs
        label="Filtrer par statut"
        current={status}
        items={(["pending", "approved", "rejected"] as const).map((s) => ({ value: s, label: TESTIMONIAL_STATUS[s], href: `/admin/temoignages?statut=${s}`, count: cm.get(s) ?? 0 }))}
      />
      <div className="space-y-4">
        {rows.length === 0 && <EmptyState>Aucun témoignage {TESTIMONIAL_STATUS[status].toLowerCase()}.</EmptyState>}
        {rows.map((t) => (
          <Panel key={t.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 max-w-3xl">
                <blockquote className="font-display text-lg leading-snug">« {t.body} »</blockquote>
                <p className="mt-2 text-sm">
                  {t.authorName}
                  {t.authorCity && <span className="text-ink-soft">, {t.authorCity}</span>}
                  {t.rating != null && <span className="text-ink-soft"> · {t.rating}/5</span>}
                  {t.productSlug && <span className="text-ink-soft"> · {pname.get(t.productSlug) ?? t.productSlug}</span>}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                  Reçu le {fmtDateTime(t.createdAt)}
                  {t.moderatedAt && <> · modéré le {fmtDateTime(t.moderatedAt)}</>}
                  {t.orderId ? (
                    <Badge tone="success">
                      Achat vérifié{orderNo.get(t.orderId) ? <> : <Link href={`/admin/commandes/${t.orderId}`} className="ml-1 underline">{orderNo.get(t.orderId)}</Link></> : null}
                    </Badge>
                  ) : (
                    <Badge tone="muted">Achat non vérifié</Badge>
                  )}
                </p>
                {t.source && <p className="mt-1 text-xs text-ink-soft">Source : {t.source}{t.createdBy ? ` (saisi par ${t.createdBy})` : ""}</p>}
              </div>
              <ModerationButtons id={t.id} status={t.status} />
            </div>
          </Panel>
        ))}
      </div>
      <Panel title="Ajouter un témoignage reçu" className="mt-8" description="Pour un avis reçu hors du site (email, message, carte). La source est obligatoire.">
        <NewTestimonialForm products={products} />
      </Panel>
    </>
  );
}
