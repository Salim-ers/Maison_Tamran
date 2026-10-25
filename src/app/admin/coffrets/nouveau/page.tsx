import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { storeMode } from "@/lib/env";
import { adminPage } from "../../guard";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { BoxForm } from "@/components/admin/box-form";

export const instant = false;
export const metadata = { title: "Nouveau coffret" };

export default async function NewBoxPage() {
  await adminPage();
  const products = await db.select({ slug: schema.products.slug, name: schema.products.name }).from(schema.products).orderBy(asc(schema.products.sortOrder), asc(schema.products.number));
  return (
    <>
      <AdminHeader title="Nouveau coffret" back={{ href: "/admin/coffrets", label: "coffrets" }} intro="Les images s'ajoutent après la création." />
      <Panel>
        <BoxForm box={null} products={products} demo={storeMode() === "demo"} />
      </Panel>
    </>
  );
}
