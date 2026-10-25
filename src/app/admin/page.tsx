import { and, count, desc, eq, gte, inArray, lt, sql, sum } from "drizzle-orm";
import { db, schema } from "@/db";
import { STATUS_LABELS } from "@/lib/email";
import { adminPage } from "./guard";
import { AdminHeader, Badge, DataTable, EmptyState, Notice, Panel, StatCard, TextLink } from "@/components/admin/ui";
import { fmtDateTime, fmtEuros, fmtNumber } from "@/components/admin/format";
import { ORDER_STATUS_TONE } from "@/components/admin/labels";

export const instant = false;
export const metadata = { title: "Tableau de bord" };

// Statuts considérés comme « payés » pour le chiffre d'affaires (le remboursement l'exclut).
const PAID = ["paid", "preparing", "shipped", "delivered"] as const;
const LOW = { pieces: 24, boxes: 10, variants: 6 };

async function revenue(since: Date | null) {
  const where = and(eq(schema.orders.isDemo, false), inArray(schema.orders.status, [...PAID]), since ? gte(schema.orders.paidAt, since) : undefined);
  const [r] = await db.select({ total: sum(schema.orders.totalCents), n: count() }).from(schema.orders).where(where);
  const total = Number(r?.total ?? 0);
  const n = r?.n ?? 0;
  return { total, n, avg: n ? Math.round(total / n) : 0 };
}

export default async function Dashboard() {
  await adminPage();
  const since = new Date(Date.now() - 30 * 864e5);

  const [r30, rAll, [demo], latest, lowProducts, lowBoxes, lowVariants, quotes, pendingTestimonials, funnelRows, [unpaid]] = await Promise.all([
    revenue(since),
    revenue(null),
    db.select({ n: count() }).from(schema.orders).where(eq(schema.orders.isDemo, true)),
    db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).limit(8),
    db
      .select({ id: schema.products.id, name: schema.products.name, stock: schema.products.stockPieces, status: schema.products.status })
      .from(schema.products)
      .where(and(lt(schema.products.stockPieces, LOW.pieces), sql`${schema.products.status} not in ('archived','draft')`))
      .orderBy(schema.products.stockPieces),
    db
      .select({ id: schema.boxes.id, name: schema.boxes.name, stock: schema.boxes.stock, quoteOnly: schema.boxes.quoteOnly })
      .from(schema.boxes)
      .where(and(lt(schema.boxes.stock, LOW.boxes), eq(schema.boxes.quoteOnly, false), sql`${schema.boxes.status} not in ('archived','draft')`))
      .orderBy(schema.boxes.stock),
    db
      .select({ id: schema.variants.id, productId: schema.variants.productId, sku: schema.variants.sku, name: schema.variants.name, stock: schema.variants.stock, product: schema.products.name })
      .from(schema.variants)
      .innerJoin(schema.products, eq(schema.variants.productId, schema.products.id))
      .where(and(lt(schema.variants.stock, LOW.variants), eq(schema.variants.active, true), sql`${schema.products.status} not in ('archived','draft')`))
      .orderBy(schema.variants.stock),
    db.select().from(schema.quoteRequests).where(eq(schema.quoteRequests.status, "new")).orderBy(desc(schema.quoteRequests.createdAt)).limit(5),
    db.select({ n: count() }).from(schema.testimonials).where(eq(schema.testimonials.status, "pending")),
    db
      .select({ name: schema.analyticsEvents.name, n: count(), visitors: sql<number>`count(distinct ${schema.analyticsEvents.sessionHash})::int` })
      .from(schema.analyticsEvents)
      .where(gte(schema.analyticsEvents.createdAt, since))
      .groupBy(schema.analyticsEvents.name),
    db.select({ n: count() }).from(schema.orders).where(and(eq(schema.orders.isDemo, false), eq(schema.orders.status, "paid"))),
  ]);

  const funnelSteps = [
    { key: "page_view", label: "Pages vues" },
    { key: "add_to_cart", label: "Ajouts au panier" },
    { key: "begin_checkout", label: "Débuts de commande" },
    { key: "purchase", label: "Achats" },
  ];
  const funnelMap = new Map(funnelRows.map((r) => [r.name, r]));
  const hasEvents = funnelRows.some((r) => r.n > 0);
  const top = Math.max(1, funnelMap.get("page_view")?.n ?? 0, ...funnelRows.map((r) => r.n));
  const stockAlerts = lowProducts.length + lowBoxes.length + lowVariants.length;

  return (
    <>
      <AdminHeader title="Tableau de bord" intro="Les chiffres excluent les commandes de démonstration. Les montants sont TTC, frais de livraison compris." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Chiffre d'affaires payé, 30 jours" value={fmtEuros(r30.total)} sub={`Total depuis l'ouverture : ${fmtEuros(rAll.total)}`} />
        <StatCard label="Commandes payées, 30 jours" value={fmtNumber(r30.n)} sub={`Total : ${fmtNumber(rAll.n)}${unpaid?.n ? ` · ${unpaid.n} à préparer` : ""}`} />
        <StatCard label="Panier moyen, 30 jours" value={r30.n ? fmtEuros(r30.avg) : "—"} sub={`Sur la durée : ${rAll.n ? fmtEuros(rAll.avg) : "—"}`} />
        <StatCard
          label="Commandes de démonstration"
          value={fmtNumber(demo?.n ?? 0)}
          sub="Simulées, jamais encaissées ni expédiées. Exclues des chiffres."
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Dernières commandes" actions={<TextLink href="/admin/commandes">Toutes les commandes</TextLink>}>
          <DataTable
            rows={latest}
            rowKey={(o) => o.id}
            caption="Dernières commandes"
            empty="Aucune commande pour l'instant. Elles apparaîtront ici dès le premier passage en caisse."
            columns={[
              { key: "n", header: "Numéro", cell: (o) => <TextLink href={`/admin/commandes/${o.id}`}>{o.number}</TextLink> },
              { key: "d", header: "Date", cell: (o) => <span className="whitespace-nowrap">{fmtDateTime(o.createdAt)}</span> },
              {
                key: "s",
                header: "Statut",
                cell: (o) => (
                  <span className="flex flex-wrap gap-1">
                    <Badge tone={ORDER_STATUS_TONE[o.status]}>{STATUS_LABELS[o.status]}</Badge>
                    {o.isDemo && <Badge tone="muted">Démo</Badge>}
                  </span>
                ),
              },
              { key: "t", header: "Total", align: "right", cell: (o) => fmtEuros(o.totalCents) },
            ]}
          />
        </Panel>

        <div className="space-y-6">
          <Panel title="Alertes de stock" description={`Seuils : moins de ${LOW.pieces} pièces par recette, ${LOW.boxes} boîtes par coffret, ${LOW.variants} étuis par variante.`} actions={<TextLink href="/admin/stock">Gérer le stock</TextLink>}>
            {stockAlerts === 0 ? (
              <p className="text-sm text-ink-soft">Aucun stock sous les seuils d&apos;alerte.</p>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {lowProducts.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3 py-2">
                    <TextLink href={`/admin/produits/${p.id}`}>{p.name}</TextLink>
                    <span className={p.stock <= 0 ? "text-danger" : ""}>{p.stock} pièces</span>
                  </li>
                ))}
                {lowBoxes.map((b) => (
                  <li key={b.id} className="flex justify-between gap-3 py-2">
                    <TextLink href={`/admin/coffrets/${b.id}`}>{b.name}</TextLink>
                    <span className={b.stock <= 0 ? "text-danger" : ""}>{b.stock} boîtes</span>
                  </li>
                ))}
                {lowVariants.map((v) => (
                  <li key={v.id} className="flex justify-between gap-3 py-2">
                    <TextLink href={`/admin/produits/${v.productId}#variantes`}>
                      {v.product} : {v.name}
                    </TextLink>
                    <span className={v.stock <= 0 ? "text-danger" : ""}>{v.stock} étuis</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="À traiter">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span>Témoignages en attente de modération</span>
                <TextLink href="/admin/temoignages">{pendingTestimonials[0]?.n ?? 0}</TextLink>
              </li>
              <li>
                <div className="flex items-center justify-between gap-3">
                  <span>Nouvelles demandes de devis</span>
                  <TextLink href="/admin/devis?statut=new">{quotes.length}</TextLink>
                </div>
                {quotes.length > 0 && (
                  <ul className="mt-2 space-y-1 border-l border-line pl-3">
                    {quotes.map((q) => (
                      <li key={q.id} className="flex justify-between gap-2">
                        <TextLink href={`/admin/devis/${q.id}`}>{q.company}</TextLink>
                        <span className="text-ink-soft">{q.reference}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>
          </Panel>
        </div>
      </div>

      <Panel title="Entonnoir de conversion, 30 jours" className="mt-6" description="Mesure d'audience interne, enregistrée uniquement pour les visiteurs ayant accepté la mesure d'audience.">
        {!hasEvents ? (
          <EmptyState>
            Aucun événement enregistré sur les 30 derniers jours. Soit la mesure d&apos;audience n&apos;est pas encore instrumentée sur les pages concernées, soit aucun visiteur n&apos;a donné son consentement. Aucun chiffre n&apos;est donc affiché.
          </EmptyState>
        ) : (
          <ol className="space-y-3">
            {funnelSteps.map((s, i) => {
              const row = funnelMap.get(s.key);
              const n = row?.n ?? 0;
              const prev = i > 0 ? (funnelMap.get(funnelSteps[i - 1].key)?.n ?? 0) : null;
              const rate = prev ? Math.round((n / prev) * 1000) / 10 : null;
              return (
                <li key={s.key} className="grid items-center gap-2 text-sm sm:grid-cols-[12rem_1fr_9rem]">
                  <span>{s.label}</span>
                  <span className="h-5 rounded-[2px] bg-taupe/25" aria-hidden>
                    <span className="block h-full rounded-[2px] bg-chocolate" style={{ width: `${Math.max(n ? 1.5 : 0, (n / top) * 100)}%` }} />
                  </span>
                  <span className="tabular-nums sm:text-right">
                    {fmtNumber(n)}
                    {row?.visitors ? <span className="text-ink-soft"> · {fmtNumber(row.visitors)} visit.</span> : null}
                    {rate != null && <span className="block text-xs text-ink-soft">{rate} % de l&apos;étape précédente</span>}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
        {hasEvents && <Notice className="mt-4">Ces chiffres ne couvrent que les visiteurs consentants : ils sous-estiment l&apos;audience réelle.</Notice>}
      </Panel>
    </>
  );
}
