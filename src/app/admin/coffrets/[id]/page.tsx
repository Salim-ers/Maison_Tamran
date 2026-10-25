import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { storeMode } from "@/lib/env";
import { adminPage, sp, type SearchParams } from "../../guard";
import { AdminHeader, Badge, Notice, Panel } from "@/components/admin/ui";
import { BoxForm } from "@/components/admin/box-form";
import { ImageManager } from "@/components/admin/images";
import { ActionButton } from "@/components/admin/form";
import { deleteBox } from "@/app/actions/admin/catalog";
import { PRODUCT_STATUS, PRODUCT_STATUS_TONE } from "@/components/admin/labels";

export const instant = false;
export const metadata = { title: "Coffret" };

export default async function BoxPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SearchParams }) {
  await adminPage();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const q = await searchParams;
  const [[box], products] = await Promise.all([
    db.select().from(schema.boxes).where(eq(schema.boxes.id, id)).limit(1),
    db.select({ slug: schema.products.slug, name: schema.products.name }).from(schema.products).orderBy(asc(schema.products.sortOrder), asc(schema.products.number)),
  ]);
  if (!box) notFound();
  return (
    <>
      <AdminHeader title={box.name} back={{ href: "/admin/coffrets", label: "coffrets" }} intro={<Badge tone={PRODUCT_STATUS_TONE[box.status]}>{PRODUCT_STATUS[box.status]}</Badge>} />
      {sp(q.cree) && <Notice tone="success" className="mb-6">Coffret créé. Ajoutez maintenant ses images.</Notice>}
      <div className="grid gap-6 2xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Coffret">
          <BoxForm box={box} products={products} demo={storeMode() === "demo"} />
        </Panel>
        <div className="space-y-6">
          <Panel title="Images">
            <ImageManager owner="box" ownerId={box.id} images={box.images} folder="boxes" />
          </Panel>
          <Panel title="Supprimer le coffret" description="Suppression définitive. Les paniers qui contiennent ce coffret le perdent ; les commandes passées conservent leur historique. Préférez « Archivé » pour le retirer du site.">
            <ActionButton action={deleteBox} fields={{ id: box.id }} label="Supprimer le coffret" confirm={`Supprimer définitivement « ${box.name} » ?`} confirmLabel="Oui, supprimer" variant="danger" small={false} />
          </Panel>
        </div>
      </div>
    </>
  );
}
