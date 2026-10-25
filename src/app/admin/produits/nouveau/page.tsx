import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { storeMode } from "@/lib/env";
import { adminPage } from "../../guard";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

export const instant = false;
export const metadata = { title: "Nouvelle recette" };

export default async function NewProductPage() {
  await adminPage();
  const collections = await db.select({ id: schema.collections.id, name: schema.collections.name }).from(schema.collections).orderBy(asc(schema.collections.sortOrder));
  return (
    <>
      <AdminHeader title="Nouvelle recette" back={{ href: "/admin/produits", label: "produits" }} intro="Une nouvelle recette est créée en « Prototype » par défaut. Les images et les étuis s'ajoutent après la création." />
      <Panel>
        <ProductForm product={null} collections={collections} demo={storeMode() === "demo"} />
      </Panel>
    </>
  );
}
