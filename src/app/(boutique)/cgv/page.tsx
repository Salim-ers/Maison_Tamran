import type { Metadata } from "next";
import Link from "@/components/motion/transition-link";
import { getSettings } from "@/lib/catalog";
import { storeMode } from "@/lib/env";
import { LegalPage, LegalValue, ContactEmail } from "@/components/legal/legal";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions générales de vente de la boutique en ligne MAISON TAMRĀN : commande, prix, paiement, livraison, rétractation, garanties, médiation.",
  alternates: { canonical: "/cgv" },
};

const TOC = [
  { id: "objet", label: "1. Objet et champ d'application" },
  { id: "vendeur", label: "2. Vendeur" },
  { id: "produits", label: "3. Produits" },
  { id: "prix", label: "4. Prix" },
  { id: "commande", label: "5. Commande" },
  { id: "paiement", label: "6. Paiement" },
  { id: "livraison", label: "7. Livraison" },
  { id: "retractation", label: "8. Droit de rétractation" },
  { id: "garanties", label: "9. Garanties légales" },
  { id: "professionnels", label: "10. Clients professionnels" },
  { id: "donnees", label: "11. Données personnelles" },
  { id: "litiges", label: "12. Réclamations et médiation" },
  { id: "droit", label: "13. Droit applicable" },
];

export default async function CgvPage() {
  const { legal, contactEmail } = await getSettings();
  const demo = storeMode() === "demo";
  return (
    <LegalPage title="Conditions générales de vente" href="/cgv" toc={TOC} intro={<p>Ces conditions s&apos;appliquent aux commandes passées sur la boutique en ligne MAISON TAMRĀN par des consommateurs. Les ventes aux professionnels font l&apos;objet d&apos;une proposition dédiée.</p>}>
      <h2 id="objet">1. Objet et champ d&apos;application</h2>
      <p>
        Les présentes conditions générales de vente (CGV) régissent les ventes de produits conclues sur le site entre le vendeur désigné à l&apos;article 2 et toute personne physique agissant à des fins non professionnelles (le « client »). Toute commande vaut acceptation des CGV en vigueur au jour de la commande, que le client reconnaît avoir lues avant de valider.
      </p>
      {demo && (
        <p>
          <strong>Mode démonstration.</strong> Tant que la boutique fonctionne en mode démonstration, aucune vente n&apos;est conclue : les commandes sont simulées, aucun paiement n&apos;est encaissé et aucun produit n&apos;est expédié. Voir la <Link href="/faq#demonstration">foire aux questions</Link>.
        </p>
      )}

      <h2 id="vendeur">2. Vendeur</h2>
      <p>
        <LegalValue value={legal.companyName} fallback="Raison sociale" />, <LegalValue value={legal.legalForm} fallback="Forme juridique et capital" />, dont le siège est situé <LegalValue value={legal.address} fallback="Adresse du siège" />, immatriculée sous le numéro SIRET <LegalValue value={legal.siret} fallback="SIRET" /> (<LegalValue value={legal.rcs} fallback="RCS" />), TVA intracommunautaire <LegalValue value={legal.vat} fallback="N° TVA" />. Contact : <ContactEmail value={contactEmail} />.
      </p>

      <h2 id="produits">3. Produits</h2>
      <p>
        Les produits sont des dattes Medjool fourrées et enrobées de chocolat, vendues à la pièce en étui ou en coffret. Leurs caractéristiques essentielles (ingrédients, allergènes, poids net, conditions de conservation et date de durabilité lorsqu&apos;elles sont établies) figurent sur la fiche produit et sur l&apos;étiquette. L&apos;étiquette du produit livré fait foi.
      </p>
      <p>
        Les visuels signalés « Visuel concept » sont des illustrations et ne sont pas contractuels. Les recettes portant la mention « Recette en développement » ne sont pas encore commercialisées et ne peuvent faire l&apos;objet d&apos;une vente qu&apos;une fois leur statut passé à « Disponible ».
      </p>
      <p>Les produits sont proposés dans la limite des stocks disponibles. En cas d&apos;indisponibilité après commande, le client est informé et remboursé des sommes versées pour le produit concerné.</p>

      <h2 id="prix">4. Prix</h2>
      <p>
        Les prix sont indiqués en euros, toutes taxes comprises, hors frais de livraison. Les frais de livraison applicables sont indiqués avant la validation de la commande et détaillés sur la page <Link href="/livraison-retours">Livraison et retours</Link>. Le prix applicable est celui affiché au moment de la validation de la commande.
      </p>

      <h2 id="commande">5. Commande</h2>
      <p>
        Le client sélectionne les produits, vérifie le contenu de son panier, renseigne ses coordonnées et l&apos;adresse de livraison, choisit le mode de livraison puis procède au paiement. La commande est définitive après confirmation du paiement. Un email de confirmation récapitulant la commande est alors adressé au client.
      </p>
      <p>Le vendeur se réserve le droit de refuser une commande pour un motif légitime, notamment en cas de litige antérieur ou de suspicion de fraude.</p>

      <h2 id="paiement">6. Paiement</h2>
      <p>
        Le paiement est exigible à la commande. Il est réalisé sur la page sécurisée du prestataire de paiement Stripe, par carte bancaire et, selon l&apos;appareil du client, par Apple Pay ou Google Pay. Les données de paiement ne transitent pas par les serveurs du vendeur.
      </p>

      <h2 id="livraison">7. Livraison</h2>
      <p>
        Les produits sont livrés à l&apos;adresse indiquée par le client, dans les pays mentionnés sur la page <Link href="/livraison-retours">Livraison et retours</Link>. Le délai de livraison est communiqué au client à l&apos;expédition. À défaut d&apos;indication, la livraison intervient au plus tard dans les trente jours suivant la conclusion du contrat, conformément à l&apos;article L216-1 du Code de la consommation.
      </p>
      <p>
        Le client vérifie l&apos;état du colis à la réception. En cas de colis endommagé ou incomplet, il est invité à émettre des réserves auprès du transporteur lorsque c&apos;est possible et à contacter le vendeur dans les meilleurs délais, photographies à l&apos;appui. Le transfert des risques intervient lors de la prise de possession des produits par le client.
      </p>

      <h2 id="retractation">8. Droit de rétractation</h2>
      <p>
        Conformément à l&apos;article L221-28 4° du Code de la consommation, le droit de rétractation ne peut être exercé pour les contrats de fourniture de biens susceptibles de se détériorer ou de se périmer rapidement. Les produits vendus sur le site étant des denrées alimentaires périssables, ils sont exclus du droit de rétractation.
      </p>

      <h2 id="garanties">9. Garanties légales</h2>
      <p>
        Le client bénéficie de la garantie légale de conformité (articles L217-3 et suivants du Code de la consommation) et de la garantie des vices cachés (articles 1641 et suivants du Code civil). En cas de produit non conforme ou défectueux, le client contacte le vendeur à l&apos;adresse <ContactEmail value={contactEmail} /> en précisant son numéro de commande.
      </p>

      <h2 id="professionnels">10. Clients professionnels</h2>
      <p>
        Les commandes de professionnels (coffrets personnalisés, quantités importantes, événements) font l&apos;objet d&apos;une demande de devis via la page <Link href="/professionnels/devis">Demande de devis</Link> puis d&apos;une proposition commerciale précisant les prix hors taxes, les conditions de paiement, de fabrication et de livraison. Cette proposition prévaut sur les présentes CGV pour ce qui la concerne.
      </p>

      <h2 id="donnees">11. Données personnelles</h2>
      <p>Les données collectées lors de la commande sont traitées conformément à la <Link href="/confidentialite">politique de confidentialité</Link>.</p>

      <h2 id="litiges">12. Réclamations et médiation</h2>
      <p>
        Toute réclamation est adressée en priorité au vendeur à <ContactEmail value={contactEmail} />. À défaut de résolution amiable, et conformément aux articles L612-1 et suivants du Code de la consommation, le client peut recourir gratuitement au médiateur de la consommation suivant : <LegalValue value={legal.mediator} fallback="Médiateur de la consommation" />.
      </p>

      <h2 id="droit">13. Droit applicable</h2>
      <p>Les présentes CGV sont soumises au droit français. Elles ne privent pas le client consommateur de la protection que lui assurent les dispositions impératives de la loi de son pays de résidence.</p>
    </LegalPage>
  );
}
