import type { Metadata } from "next";
import Link from "@/components/motion/transition-link";
import { PageIntro } from "@/components/layout/page-intro";
import { UnsubscribeForm } from "@/components/unsubscribe-form";

export const metadata: Metadata = {
  title: "Désinscription de la lettre",
  robots: { index: false },
  alternates: { canonical: "/newsletter/desinscription" },
};

export default function DesinscriptionPage() {
  return (
    <>
      <PageIntro
        title="Se désinscrire de la lettre"
        crumbs={[{ href: "/newsletter/desinscription", label: "Désinscription" }]}
        intro={<p>Saisissez l&apos;adresse à retirer de la liste de diffusion. La désinscription est immédiate ; vous pourrez vous réinscrire à tout moment.</p>}
      />
      <div className="container-luxe pb-[var(--section)]">
        <UnsubscribeForm />
        <p className="mt-12 t-small text-ink-soft">
          Vos données sont traitées selon notre <Link href="/confidentialite" className="link-draw text-ink">politique de confidentialité</Link>.
        </p>
      </div>
    </>
  );
}
