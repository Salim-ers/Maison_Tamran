import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { adminPage } from "../guard";
import { AdminHeader, Badge, DataTable, Panel } from "@/components/admin/ui";
import { StockAdjust } from "@/components/admin/stock-adjust";
import { PRODUCT_STATUS, PRODUCT_STATUS_TONE } from "@/components/admin/labels";

export const instant = false;
export const metadata = { title: "Stock" };

const link = "font-medium underline decoration-ink/25 underline-offset-[3px] hover:decoration-ink";
const level = (n: number, low: number) => (n <= 0 ? "text-danger font-semibold" : n < low ? "text-danger" : "");

export default async function StockPage() {
  await adminPage();
  const [products, boxes, variants] = await Promise.all([
    db.select().from(schema.products).orderBy(asc(schema.products.sortOrder), asc(schema.products.number)),
    db.select().from(schema.boxes).orderBy(asc(schema.boxes.sortOrder)),
    db
      .select({ v: schema.variants, product: schema.products.name, status: schema.products.status })
      .from(schema.variants)
      .innerJoin(schema.products, eq(schema.variants.productId, schema.products.id))
      .orderBy(asc(schema.products.sortOrder), asc(schema.products.number), asc(schema.variants.sortOrder)),
  ]);
  return (
    <>
      <AdminHeader
        title="Stock"
        intro="Le stock est décrémenté automatiquement à la confirmation du paiement (pièces pour les coffrets, étuis pour les variantes). Les ajustements ci-dessous sont immédiats. Un retrait ne descend jamais sous zéro."
      />
      <div className="space-y-6">
        <Panel title="Pièces par recette" description="Pièces disponibles pour composer les coffrets. Alerte sous 24 pièces.">
          <DataTable
            rows={products}
            rowKey={(p) => p.id}
            caption="Pièces par recette"
            dense
            columns={[
              { key: "n", header: "Recette", cell: (p) => <Link href={`/admin/produits/${p.id}`} className={link}>{p.name}</Link> },
              { key: "s", header: "Statut", cell: (p) => <Badge tone={PRODUCT_STATUS_TONE[p.status]}>{PRODUCT_STATUS[p.status]}</Badge> },
              { key: "q", header: "En stock", align: "right", cell: (p) => <span className={level(p.stockPieces, 24)}>{p.stockPieces}</span> },
              { key: "a", header: <span className="sr-only">Ajuster</span>, align: "right", cell: (p) => <StockAdjust kind="product" id={p.id} value={p.stockPieces} label={p.name} step={12} /> },
            ]}
          />
        </Panel>
        <Panel title="Boîtes par coffret" description="Boîtes vides disponibles. Alerte sous 10 boîtes.">
          <DataTable
            rows={boxes}
            rowKey={(b) => b.id}
            caption="Boîtes par coffret"
            dense
            columns={[
              { key: "n", header: "Coffret", cell: (b) => <Link href={`/admin/coffrets/${b.id}`} className={link}>{b.name}</Link> },
              { key: "s", header: "Statut", cell: (b) => <span className="flex gap-1"><Badge tone={PRODUCT_STATUS_TONE[b.status]}>{PRODUCT_STATUS[b.status]}</Badge>{b.quoteOnly && <Badge tone="muted">Sur devis</Badge>}</span> },
              { key: "q", header: "En stock", align: "right", cell: (b) => <span className={b.quoteOnly ? "" : level(b.stock, 10)}>{b.stock}</span> },
              { key: "a", header: <span className="sr-only">Ajuster</span>, align: "right", cell: (b) => <StockAdjust kind="box" id={b.id} value={b.stock} label={b.name} step={10} /> },
            ]}
          />
        </Panel>
        <Panel title="Étuis par variante" description="Étuis monosaveur prêts à expédier. Alerte sous 6 étuis.">
          <DataTable
            rows={variants}
            rowKey={(r) => r.v.id}
            caption="Étuis par variante"
            dense
            empty="Aucun étui."
            columns={[
              { key: "n", header: "Étui", cell: (r) => <Link href={`/admin/produits/${r.v.productId}#variantes`} className={link}>{r.product} : {r.v.name}</Link> },
              { key: "sku", header: "SKU", cell: (r) => <span className="font-mono text-xs">{r.v.sku}</span> },
              { key: "act", header: "Vente", cell: (r) => (r.v.active ? <Badge tone="success">Actif</Badge> : <Badge tone="muted">Inactif</Badge>) },
              { key: "q", header: "En stock", align: "right", cell: (r) => <span className={level(r.v.stock, 6)}>{r.v.stock}</span> },
              { key: "a", header: <span className="sr-only">Ajuster</span>, align: "right", cell: (r) => <StockAdjust kind="variant" id={r.v.id} value={r.v.stock} label={`${r.product}, ${r.v.name}`} step={6} /> },
            ]}
          />
        </Panel>
      </div>
    </>
  );
}
