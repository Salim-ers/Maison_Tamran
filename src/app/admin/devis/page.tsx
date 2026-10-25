import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { segmentShort } from "@/lib/segments";
import { adminPage, sp, type SearchParams } from "../guard";
import { AdminHeader, Badge, DataTable, FilterTabs, Notice, Panel } from "@/components/admin/ui";
import { fmtDate } from "@/components/admin/format";
import { QUOTE_STATUS, QUOTE_STATUS_TONE } from "@/components/admin/labels";
import { btnSecondary } from "@/components/admin/styles";

export const instant = false;
export const metadata = { title: "Devis B2B" };

export default async function QuotesPage({ searchParams }: { searchParams: SearchParams }) {
  await adminPage();
  const q = await searchParams;
  const keys = Object.keys(QUOTE_STATUS);
  const status = keys.includes(sp(q.statut)) ? (sp(q.statut) as (typeof schema.quoteRequests.status.enumValues)[number]) : "";
  const [rows, counts] = await Promise.all([
    db.select().from(schema.quoteRequests).where(status ? eq(schema.quoteRequests.status, status) : undefined).orderBy(desc(schema.quoteRequests.createdAt)).limit(200),
    db.select({ s: schema.quoteRequests.status, n: count() }).from(schema.quoteRequests).groupBy(schema.quoteRequests.status),
  ]);
  const cm = new Map(counts.map((c) => [c.s, c.n]));
  return (
    <>
      <AdminHeader title="Devis B2B" intro="Demandes reçues via la page Professionnels. Les PDF sont générés à la demande." actions={<Link href="/admin/devis/tarifs" className={btnSecondary}>Tarifs dégressifs</Link>} />
      <FilterTabs
        label="Filtrer par statut"
        current={status}
        items={[{ value: "", label: "Toutes", href: "/admin/devis", count: counts.reduce((a, c) => a + c.n, 0) }, ...keys.map((k) => ({ value: k, label: QUOTE_STATUS[k], href: `/admin/devis?statut=${k}`, count: cm.get(k as never) ?? 0 }))]}
      />
      <DataTable
        rows={rows}
        rowKey={(r) => r.id}
        caption="Demandes de devis"
        empty={status ? "Aucune demande avec ce statut." : "Aucune demande de devis reçue pour l'instant."}
        columns={[
          { key: "ref", header: "Référence", cell: (r) => <Link href={`/admin/devis/${r.id}`} className="font-medium underline decoration-ink/25 underline-offset-[3px] hover:decoration-ink">{r.reference}</Link> },
          { key: "co", header: "Société", cell: (r) => <span><span className="block">{r.company}</span><span className="text-xs text-ink-soft">{r.contactName}</span></span> },
          { key: "seg", header: "Segment", cell: (r) => segmentShort(r.segment) },
          { key: "st", header: "Statut", cell: (r) => <span className="flex gap-1"><Badge tone={QUOTE_STATUS_TONE[r.status]}>{QUOTE_STATUS[r.status]}</Badge>{r.proposal && <Badge tone="muted">Proposition</Badge>}</span> },
          { key: "d", header: "Reçue le", cell: (r) => fmtDate(r.createdAt) },
          { key: "w", header: "Date souhaitée", cell: (r) => r.desiredDate ?? "—" },
        ]}
      />
      <Panel title="Réassort professionnel" className="mt-8">
        <Notice title="Fonctionnalité prévue, pas encore active">
          Le réassort en ligne pour les comptes professionnels (commande récurrente aux tarifs négociés, depuis l&apos;espace client) n&apos;est pas encore disponible. En attendant, les réassorts passent par une nouvelle demande de devis ou par email.
        </Notice>
      </Panel>
    </>
  );
}
