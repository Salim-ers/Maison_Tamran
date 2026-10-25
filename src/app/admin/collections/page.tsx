import { asc, count } from "drizzle-orm";
import { db, schema } from "@/db";
import { adminPage } from "../guard";
import { AdminHeader, Badge, EmptyState, Panel } from "@/components/admin/ui";
import { CollectionForm } from "@/components/admin/collection-form";

export const instant = false;
export const metadata = { title: "Collections" };

export default async function CollectionsPage() {
  await adminPage();
  const [collections, counts] = await Promise.all([
    db.select().from(schema.collections).orderBy(asc(schema.collections.sortOrder)),
    db.select({ id: schema.products.collectionId, n: count() }).from(schema.products).groupBy(schema.products.collectionId),
  ]);
  const byId = new Map(counts.map((c) => [c.id, c.n]));
  return (
    <>
      <AdminHeader title="Collections" intro="Les collections regroupent les recettes sur le site. Une collection contenant des recettes ne peut pas être supprimée." />
      <div className="grid gap-6 xl:grid-cols-2">
        {collections.length === 0 && <EmptyState>Aucune collection. Créez-en une ci-dessous.</EmptyState>}
        {collections.map((c) => (
          <Panel key={c.id} title={c.name} actions={<span className="flex gap-1">{c.ephemeral && <Badge tone="info">Éphémère</Badge>}<Badge tone="muted">{byId.get(c.id) ?? 0} recette(s)</Badge></span>}>
            <CollectionForm c={c} productCount={byId.get(c.id) ?? 0} />
          </Panel>
        ))}
        <Panel title="Nouvelle collection">
          <CollectionForm />
        </Panel>
      </div>
    </>
  );
}
