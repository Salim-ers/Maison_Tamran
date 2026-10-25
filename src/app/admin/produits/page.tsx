import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { adminPage, sp, type SearchParams } from "../guard";
import { AdminHeader, Badge, DataTable, Notice } from "@/components/admin/ui";
import { fmtEuros } from "@/components/admin/format";
import { PRODUCT_STATUS, PRODUCT_STATUS_TONE } from "@/components/admin/labels";
import { btnPrimary } from "@/components/admin/styles";
import { CHOCOLATE_LABELS, type ChocolateKind } from "@/data/recipes";
import { storeMode } from "@/lib/env";

export const instant = false;
export const metadata = { title: "Produits" };

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  await adminPage();
  const q = await searchParams;
  const [products, collections, variants] = await Promise.all([
    db.select().from(schema.products).orderBy(asc(schema.products.sortOrder), asc(schema.products.number)),
    db.select().from(schema.collections),
    db.select().from(schema.variants).orderBy(asc(schema.variants.sortOrder)),
  ]);
  const colName = new Map(collections.map((c) => [c.id, c.name]));
  const demo = storeMode() === "demo";

  return (
    <>
      <AdminHeader
        title="Produits"
        intro={
          <>
            Les recettes et leurs étuis monosaveur. {demo ? "En mode démonstration, les prototypes sont vendables (commandes simulées)." : "En paiements réels, seules les recettes « Disponible » sont vendables."}
          </>
        }
        actions={<Link href="/admin/produits/nouveau" className={btnPrimary}>Nouvelle recette</Link>}
      />
      {sp(q.supprime) && <Notice tone="success" className="mb-4">La recette a été supprimée.</Notice>}
      <DataTable
        rows={products}
        rowKey={(p) => p.id}
        caption="Liste des recettes"
        empty={
          <>
            Aucune recette. <Link href="/admin/produits/nouveau" className="underline">Créer la première recette</Link>.
          </>
        }
        columns={[
          { key: "n", header: "N°", cell: (p) => <span className="tabular-nums text-ink-soft">{p.number}</span> },
          {
            key: "name",
            header: "Recette",
            cell: (p) => (
              <div className="flex items-center gap-3">
                <span aria-hidden className="size-6 shrink-0 rounded-full border border-line" style={{ background: `linear-gradient(135deg, ${p.palette.coat} 50%, ${p.palette.accent} 50%)` }} />
                <span>
                  <Link href={`/admin/produits/${p.id}`} className="font-medium underline decoration-ink/25 underline-offset-[3px] hover:decoration-ink">{p.name}</Link>
                  <span className="block text-xs text-ink-soft">{p.pairing}</span>
                </span>
              </div>
            ),
          },
          { key: "col", header: "Collection", cell: (p) => colName.get(p.collectionId ?? "") ?? <span className="text-ink-soft">Aucune</span> },
          { key: "choc", header: "Chocolat", cell: (p) => CHOCOLATE_LABELS[p.chocolate as ChocolateKind] ?? p.chocolate },
          {
            key: "status",
            header: "Statut",
            cell: (p) => (
              <span className="flex flex-wrap gap-1">
                <Badge tone={PRODUCT_STATUS_TONE[p.status]}>{PRODUCT_STATUS[p.status]}</Badge>
                {p.limited && <Badge tone="info">Édition limitée</Badge>}
                {!p.regulatoryValidated && <Badge tone="warning">Réglementaire à valider</Badge>}
              </span>
            ),
          },
          { key: "stock", header: "Pièces en stock", align: "right", cell: (p) => <span className={p.stockPieces < 24 ? "text-danger" : ""}>{p.stockPieces}</span> },
          {
            key: "variants",
            header: "Étuis",
            cell: (p) => {
              const vs = variants.filter((v) => v.productId === p.id);
              if (!vs.length) return <span className="text-ink-soft">Aucun</span>;
              return (
                <ul className="space-y-0.5 text-xs">
                  {vs.map((v) => (
                    <li key={v.id} className={v.active ? "" : "text-ink-soft line-through"}>
                      {v.pieces} pièces : {fmtEuros(v.priceCents)} <span className="text-ink-soft">({v.stock} en stock)</span>
                    </li>
                  ))}
                </ul>
              );
            },
          },
        ]}
      />
    </>
  );
}
