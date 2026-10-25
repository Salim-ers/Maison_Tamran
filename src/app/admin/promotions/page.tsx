import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { adminPage } from "../guard";
import { AdminHeader, Badge, EmptyState, Panel } from "@/components/admin/ui";
import { PromoForm } from "@/components/admin/site-forms";
import { fmtDate, fmtEuros } from "@/components/admin/format";
import { PROMO_KIND } from "@/components/admin/labels";

export const instant = false;
export const metadata = { title: "Codes promotionnels" };

export default async function PromotionsPage() {
  await adminPage();
  const now = new Date();
  const promos = await db.select().from(schema.promoCodes).orderBy(asc(schema.promoCodes.code));
  const state = (p: (typeof promos)[number]) => {
    if (!p.active) return <Badge tone="muted">Inactif</Badge>;
    if (p.startsAt && now < p.startsAt) return <Badge tone="info">Programmé</Badge>;
    if (p.endsAt && now > p.endsAt) return <Badge tone="muted">Expiré</Badge>;
    if (p.maxUses != null && p.uses >= p.maxUses) return <Badge tone="muted">Épuisé</Badge>;
    return <Badge tone="success">Valable</Badge>;
  };
  return (
    <>
      <AdminHeader title="Codes promotionnels" intro="Le compteur d'utilisations augmente à chaque commande payée utilisant le code. Les montants s'entendent TTC." />
      <div className="space-y-4">
        {promos.length === 0 && <EmptyState>Aucun code promotionnel.</EmptyState>}
        {promos.map((p) => (
          <Panel
            key={p.id}
            title={p.code}
            description={`${PROMO_KIND[p.kind]}${p.kind === "percent" ? ` : ${p.value} %` : p.kind === "fixed" ? ` : ${fmtEuros(p.value)}` : ""}${p.minSubtotalCents ? ` · dès ${fmtEuros(p.minSubtotalCents)}` : ""}${p.startsAt || p.endsAt ? ` · du ${fmtDate(p.startsAt)} au ${fmtDate(p.endsAt)}` : ""}`}
            actions={<span className="flex items-center gap-2">{state(p)}<Badge tone="neutral">{p.uses}{p.maxUses != null ? ` / ${p.maxUses}` : ""} utilisation(s)</Badge></span>}
          >
            <PromoForm p={p} />
          </Panel>
        ))}
        <Panel title="Nouveau code">
          <PromoForm />
        </Panel>
      </div>
    </>
  );
}
