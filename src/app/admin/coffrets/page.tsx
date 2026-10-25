import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { adminPage, sp, type SearchParams } from "../guard";
import { AdminHeader, Badge, DataTable, Notice } from "@/components/admin/ui";
import { fmtEuros } from "@/components/admin/format";
import { BOX_KINDS, PRODUCT_STATUS, PRODUCT_STATUS_TONE } from "@/components/admin/labels";
import { btnPrimary } from "@/components/admin/styles";

export const instant = false;
export const metadata = { title: "Coffrets" };

export default async function BoxesPage({ searchParams }: { searchParams: SearchParams }) {
  await adminPage();
  const q = await searchParams;
  const boxes = await db.select().from(schema.boxes).orderBy(asc(schema.boxes.sortOrder));
  return (
    <>
      <AdminHeader title="Coffrets" intro="Formats de boîte vendus sur le site ou sur devis." actions={<Link href="/admin/coffrets/nouveau" className={btnPrimary}>Nouveau coffret</Link>} />
      {sp(q.supprime) && <Notice tone="success" className="mb-4">Le coffret a été supprimé.</Notice>}
      <DataTable
        rows={boxes}
        rowKey={(b) => b.id}
        caption="Coffrets"
        empty="Aucun coffret."
        columns={[
          { key: "name", header: "Coffret", cell: (b) => <Link href={`/admin/coffrets/${b.id}`} className="font-medium underline decoration-ink/25 underline-offset-[3px] hover:decoration-ink">{b.name}</Link> },
          { key: "kind", header: "Type", cell: (b) => BOX_KINDS[b.kind] ?? b.kind },
          { key: "pieces", header: "Pièces", align: "right", cell: (b) => b.pieces ?? "—" },
          { key: "price", header: "Prix", align: "right", cell: (b) => (b.quoteOnly || b.priceCents == null ? "Sur devis" : fmtEuros(b.priceCents)) },
          { key: "stock", header: "Boîtes en stock", align: "right", cell: (b) => <span className={!b.quoteOnly && b.stock < 10 ? "text-danger" : ""}>{b.stock}</span> },
          {
            key: "status",
            header: "Statut",
            cell: (b) => (
              <span className="flex flex-wrap gap-1">
                <Badge tone={PRODUCT_STATUS_TONE[b.status]}>{PRODUCT_STATUS[b.status]}</Badge>
                {b.fixedComposition && <Badge tone="info">Composition imposée</Badge>}
                {b.configurable && !b.fixedComposition && <Badge tone="muted">Composable</Badge>}
              </span>
            ),
          },
        ]}
      />
    </>
  );
}
