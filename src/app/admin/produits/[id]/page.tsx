import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { storeMode } from "@/lib/env";
import { adminPage, sp, type SearchParams } from "../../guard";
import { AdminHeader, Badge, Notice, Panel } from "@/components/admin/ui";
import { NewVariantForm, ProductForm, VariantRowForm } from "@/components/admin/product-form";
import { ImageManager } from "@/components/admin/images";
import { ActionButton } from "@/components/admin/form";
import { deleteProduct } from "@/app/actions/admin/catalog";
import { PRODUCT_STATUS, PRODUCT_STATUS_TONE } from "@/components/admin/labels";
import { btnSecondary } from "@/components/admin/styles";
import { z } from "zod";

export const instant = false;
export const metadata = { title: "Recette" };

export default async function ProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SearchParams }) {
  await adminPage();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const q = await searchParams;
  const [[product], collections, variants] = await Promise.all([
    db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1),
    db.select({ id: schema.collections.id, name: schema.collections.name }).from(schema.collections).orderBy(asc(schema.collections.sortOrder)),
    db.select().from(schema.variants).where(eq(schema.variants.productId, id)).orderBy(asc(schema.variants.sortOrder)),
  ]);
  if (!product) notFound();
  const demo = storeMode() === "demo";
  const publicVisible = product.status === "prototype" || product.status === "available";

  return (
    <>
      <AdminHeader
        title={product.name}
        back={{ href: "/admin/produits", label: "produits" }}
        intro={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={PRODUCT_STATUS_TONE[product.status]}>{PRODUCT_STATUS[product.status]}</Badge>
            {product.regulatoryValidated ? <Badge tone="success">Réglementaire validé</Badge> : <Badge tone="warning">Réglementaire à valider</Badge>}
            <span>N° {product.number}</span>
          </span>
        }
        actions={
          publicVisible ? (
            <Link href={`/creations/${product.slug}`} target="_blank" rel="noopener" className={btnSecondary}>
              Voir la fiche publique
            </Link>
          ) : undefined
        }
      />
      {sp(q.cree) && <Notice tone="success" className="mb-6">Recette créée. Ajoutez maintenant ses images et ses étuis.</Notice>}
      {product.status === "prototype" && !demo && (
        <Notice tone="warning" className="mb-6" title="Prototype non vendable">
          La boutique encaisse de vrais paiements : cette recette est visible mais ne peut pas être achetée tant qu&apos;elle n&apos;est pas « Disponible ».
        </Notice>
      )}

      <div className="grid gap-6 2xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Fiche recette">
          <ProductForm product={product} collections={collections} demo={demo} />
        </Panel>
        <div className="space-y-6">
          <Panel id="variantes" title="Étuis monosaveur" description="Chaque étui est une variante vendable de la recette, avec son SKU, son prix TTC et son stock.">
            <div className="space-y-3">
              {variants.length === 0 && <p className="text-sm text-ink-soft">Aucun étui : la recette n&apos;est proposée qu&apos;en coffret.</p>}
              {variants.map((v) => (
                <VariantRowForm key={v.id} productId={product.id} v={v} />
              ))}
              <NewVariantForm productId={product.id} slug={product.slug} nextOrder={(variants.at(-1)?.sortOrder ?? 0) + 1} />
            </div>
          </Panel>
          <Panel id="images" title="Images" description="L'ordre définit l'ordre d'affichage. L'image « Principale » sert de vignette.">
            <ImageManager owner="product" ownerId={product.id} images={product.images} folder="products" />
          </Panel>
          <Panel title="Supprimer la recette" description="Suppression définitive de la fiche et de ses étuis. Les commandes passées conservent leur historique. Pour retirer une recette du site sans la perdre, préférez le statut « Archivé ».">
            <ActionButton action={deleteProduct} fields={{ id: product.id }} label="Supprimer la recette" confirm={`Supprimer définitivement « ${product.name} » ?`} confirmLabel="Oui, supprimer" variant="danger" small={false} />
          </Panel>
        </div>
      </div>
    </>
  );
}
