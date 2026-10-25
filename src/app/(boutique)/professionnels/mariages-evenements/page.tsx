import type { Metadata } from "next";
import { getContent } from "@/lib/catalog";
import { ProLanding } from "@/components/pro/pro-landing";
import { proMariages } from "@/content/registry/professionnels";

export const metadata: Metadata = {
  title: "Mariages et événements",
  description: "Mini-coffrets MAISON TAMRĀN pour vos invités, plateaux de dattes gastronomiques pour la table des desserts, couleurs accordées à votre réception. Demandez un devis.",
  alternates: { canonical: "/professionnels/mariages-evenements" },
};

export default async function MariagesEvenementsPage() {
  const c = await getContent(proMariages.key, proMariages.defaults);
  return (
    <ProLanding
      title={c.title}
      lead={c.lead}
      usages={c.usages}
      crumbLabel="Mariages et événements"
      href="/professionnels/mariages-evenements"
      segment="mariage"
      ctaLabel="Demander un devis pour mon événement"
      heroImage="pro-2"
      sideImage="packaging-3"
      formats={[
        { name: "Mini-coffret", text: "Deux ou trois pièces, à poser à chaque couvert ou à remettre au départ des invités." },
        { name: "Coffret Découverte", text: "Six pièces, pour les témoins, la famille ou les invités d'honneur." },
        { name: "Plateau à partager", text: "Une sélection assortie servie avec le café ou sur la table des desserts." },
        { name: "Sur mesure", text: "Quantités et présentation étudiées pour votre réception." },
      ]}
      personalization={[
        { name: "Une carte à vos prénoms", text: "Date, lieu, message aux invités ou prénom de chacun pour le plan de table." },
        { name: "Un ruban accordé à votre décor", text: "Nous cherchons avec vous la teinte qui répond à vos couleurs." },
        { name: "Le choix des créations", text: "Une ou plusieurs recettes selon vos goûts, les allergies de vos invités et le menu." },
      ]}
      organisation={[
        { name: "Nous écrire tôt", text: "Indiquez la date et le nombre d'invités dès que possible : le calendrier de préparation est précisé dans la proposition." },
        { name: "Choisir", text: "Nous vous guidons dans le choix des créations et des formats." },
        { name: "Valider", text: "Vous validez la proposition, le texte des cartes et les couleurs." },
        { name: "Recevoir", text: "Livraison à l'adresse de votre choix ou sur le lieu de réception, selon la proposition." },
      ]}
    />
  );
}
