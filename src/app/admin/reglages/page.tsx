import { readSettings } from "@/lib/settings";
import { adminPage } from "../guard";
import { AdminHeader, Notice, Panel } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/site-forms";

export const instant = false;
export const metadata = { title: "Réglages" };

export default async function SettingsPage() {
  await adminPage();
  const s = await readSettings();
  const missing = Object.values(s.legal).filter((v) => !v || /compléter/i.test(v)).length;
  return (
    <>
      <AdminHeader title="Réglages" intro="Paramètres généraux de la boutique." />
      {missing > 0 && (
        <Notice tone="warning" className="mb-6" title={`${missing} mention(s) légale(s) à compléter`}>
          Les mentions légales sont obligatoires avant toute vente réelle (raison sociale, SIRET, médiateur de la consommation…).
        </Notice>
      )}
      <Panel>
        <SettingsForm s={s} />
      </Panel>
    </>
  );
}
