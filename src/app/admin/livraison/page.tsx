import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { adminPage } from "../guard";
import { AdminHeader, Badge, EmptyState, Notice, Panel } from "@/components/admin/ui";
import { ShippingForm } from "@/components/admin/site-forms";
import { fmtEuros } from "@/components/admin/format";

export const instant = false;
export const metadata = { title: "Livraison" };

export default async function ShippingPage() {
  await adminPage();
  const rates = await db.select().from(schema.shippingRates).orderBy(asc(schema.shippingRates.sortOrder));
  const provisional = rates.filter((r) => r.provisional && r.active);
  return (
    <>
      <AdminHeader title="Livraison" intro="Tarifs proposés au client selon le pays de livraison et le montant du panier. Prix TTC." />
      {provisional.length > 0 && (
        <Notice tone="warning" className="mb-6" title={`${provisional.length} tarif(s) actif(s) encore provisoire(s)`}>
          Ces tarifs ne sont pas contractualisés avec un transporteur : {provisional.map((r) => r.name).join(", ")}. Vérifiez prix, zones et délais avant d&apos;accepter des paiements réels, puis décochez « Tarif provisoire ».
        </Notice>
      )}
      <div className="space-y-4">
        {rates.length === 0 && <EmptyState>Aucun tarif : les clients ne peuvent pas passer commande.</EmptyState>}
        {rates.map((r) => (
          <Panel
            key={r.id}
            title={r.name}
            description={`${r.countries.join(", ")} · ${fmtEuros(r.priceCents)}${r.freeAboveCents != null ? ` · offert dès ${fmtEuros(r.freeAboveCents)}` : ""}`}
            actions={<span className="flex gap-1">{r.active ? <Badge tone="success">Actif</Badge> : <Badge tone="muted">Inactif</Badge>}{r.provisional && <Badge tone="warning">Provisoire</Badge>}</span>}
          >
            <ShippingForm r={r} />
          </Panel>
        ))}
        <Panel title="Nouveau tarif">
          <ShippingForm />
        </Panel>
      </div>
    </>
  );
}
