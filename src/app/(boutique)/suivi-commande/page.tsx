import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";
import { TrackForm } from "@/components/account/forms";

export const metadata: Metadata = { title: "Suivre une commande", description: "Retrouvez l'état de votre commande MAISON TAMRĀN avec son numéro et votre email.", alternates: { canonical: "/suivi-commande" } };

export default function SuiviPage() {
  return (
    <>
      <PageIntro title="Suivre une commande" crumbs={[{ href: "/suivi-commande", label: "Suivi de commande" }]} intro={<p>Avec ou sans compte : indiquez le numéro reçu par email et l&apos;adresse utilisée lors de la commande.</p>} />
      <section className="container-luxe pb-[var(--section)]"><div className="max-w-md"><TrackForm /></div></section>
    </>
  );
}
