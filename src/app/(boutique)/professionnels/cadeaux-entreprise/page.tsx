import type { Metadata } from "next";
import { getContent } from "@/lib/catalog";
import { ProLanding } from "@/components/pro/pro-landing";
import { proCadeaux } from "@/content/registry/professionnels";

export const metadata: Metadata = {
  title: "Cadeaux d'entreprise",
  description: "Coffrets MAISON TAMRĀN personnalisés à votre logo pour vos clients, partenaires et collaborateurs : fin d'année, remerciements, séminaires. Demandez un devis.",
  alternates: { canonical: "/professionnels/cadeaux-entreprise" },
};

export default async function CadeauxEntreprisePage() {
  const c = await getContent(proCadeaux.key, proCadeaux.defaults);
  return (
    <ProLanding
      title={c.title}
      lead={c.lead}
      usages={c.usages}
      crumbLabel="Cadeaux d'entreprise"
      href="/professionnels/cadeaux-entreprise"
      segment="entreprise"
      ctaLabel="Demander un devis entreprise"
      heroImage="coffret-entreprise"
      heroMobile="coffrets-ruban-v"
      sideImage="coffret-decouverte"
      formats={[
        { name: "Coffret Découverte", text: "Six pièces : l'attention juste pour un large envoi." },
        { name: "Coffret Signature", text: "Douze pièces : le cadeau de fin d'année par excellence." },
        { name: "Coffret Prestige", text: "Vingt-quatre pièces : pour vos clients et partenaires privilégiés." },
        { name: "Sur mesure", text: "Composition, nombre de pièces et présentation étudiés pour votre projet." },
      ]}
      personalization={[
        { name: "Votre logo sur le couvercle", text: "Joignez votre fichier à la demande de devis : nous étudions la technique adaptée." },
        { name: "Une carte à votre message", text: "Vœux, remerciements, nom du destinataire : imprimée et glissée dans chaque coffret." },
        { name: "Un ruban à vos couleurs", text: "Ou notre ruban bronze, pour rester dans l'esprit de la maison." },
      ]}
      organisation={[
        { name: "Anticiper", text: "Pour la fin d'année, contactez-nous le plus tôt possible : la personnalisation demande un temps de préparation que nous préciserons dans la proposition." },
        { name: "Choisir", text: "Nous vous aidons à composer la sélection selon vos destinataires et votre budget." },
        { name: "Valider", text: "Vous validez la proposition, le fichier du logo et le texte de la carte." },
        { name: "Livrer", text: "Livraison groupée à vos bureaux, ou envois individuels à partir de votre liste d'adresses." },
      ]}
    />
  );
}
