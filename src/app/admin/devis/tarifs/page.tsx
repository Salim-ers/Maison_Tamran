import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { adminPage } from "../../guard";
import { AdminHeader, Badge, EmptyState, Notice, Panel } from "@/components/admin/ui";
import { TierForm } from "@/components/admin/quote-forms";

export const instant = false;
export const metadata = { title: "Tarifs dégressifs" };

export default async function TiersPage() {
  await adminPage();
  const tiers = await db.select().from(schema.priceTiers).orderBy(asc(schema.priceTiers.minQuantity));
  const pending = tiers.filter((t) => !t.active || /valider/i.test(t.label ?? ""));
  return (
    <>
      <AdminHeader title="Tarifs dégressifs" back={{ href: "/admin/devis", label: "devis" }} intro="Remises par volume proposées dans les propositions commerciales. Seuls les tarifs actifs peuvent être appliqués à un devis." />
      {pending.length > 0 && (
        <Notice tone="warning" className="mb-6" title="Tarifs à valider">
          {pending.length} tarif(s) inactif(s) ou marqué(s) « à valider ». Vérifiez les marges avant de les activer ; retirez la mention « (à valider) » du libellé une fois la grille arrêtée.
        </Notice>
      )}
      <Panel title="Grille">
        <div className="space-y-3">
          {tiers.length === 0 && <EmptyState>Aucun tarif dégressif.</EmptyState>}
          {tiers.map((t) => (
            <div key={t.id} className="rounded-[2px] border border-line p-3">
              <p className="mb-2 flex flex-wrap gap-1.5">
                {t.active ? <Badge tone="success">Actif</Badge> : <Badge tone="muted">Inactif</Badge>}
                {/valider/i.test(t.label ?? "") && <Badge tone="warning">À valider</Badge>}
              </p>
              <TierForm t={t} />
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Nouveau tarif" className="mt-6">
        <TierForm />
      </Panel>
    </>
  );
}
