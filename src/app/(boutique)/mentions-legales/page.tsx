import type { Metadata } from "next";
import Link from "@/components/motion/transition-link";
import { getSettings } from "@/lib/catalog";
import { siteUrl } from "@/lib/env";
import { LegalPage, LegalValue, ContactEmail } from "@/components/legal/legal";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site MAISON TAMRĀN : éditeur, directeur de la publication, hébergeur, propriété intellectuelle.",
  alternates: { canonical: "/mentions-legales" },
};

const TOC = [
  { id: "editeur", label: "Éditeur du site" },
  { id: "publication", label: "Directeur de la publication" },
  { id: "hebergement", label: "Hébergement" },
  { id: "propriete", label: "Propriété intellectuelle" },
  { id: "visuels", label: "Visuels du site" },
  { id: "contact", label: "Contact" },
];

export default async function MentionsLegalesPage() {
  const { legal, contactEmail } = await getSettings();
  const domain = siteUrl().replace(/^https?:\/\//, "");
  return (
    <LegalPage title="Mentions légales" href="/mentions-legales" toc={TOC} intro={<p>Informations relatives à l&apos;éditeur et à l&apos;hébergement du site {domain}, conformément à l&apos;article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique.</p>}>
      <h2 id="editeur">Éditeur du site</h2>
      <p>Le site est édité par :</p>
      <table className="[&_td]:break-words max-sm:[&_td]:block max-sm:[&_th]:block max-sm:[&_th]:border-0 max-sm:[&_th]:pb-0 max-sm:[&_th]:text-ink-soft max-sm:[&_th]:font-normal">
        <tbody>
          <tr><th scope="row">Raison sociale</th><td><LegalValue value={legal.companyName} fallback="Raison sociale" /></td></tr>
          <tr><th scope="row">Forme juridique et capital</th><td><LegalValue value={legal.legalForm} fallback="Forme juridique et capital" /></td></tr>
          <tr><th scope="row">Siège social</th><td><LegalValue value={legal.address} fallback="Adresse du siège" /></td></tr>
          <tr><th scope="row">SIRET</th><td><LegalValue value={legal.siret} fallback="SIRET" /></td></tr>
          <tr><th scope="row">RCS</th><td><LegalValue value={legal.rcs} fallback="RCS" /></td></tr>
          <tr><th scope="row">TVA intracommunautaire</th><td><LegalValue value={legal.vat} fallback="N° TVA intracommunautaire" /></td></tr>
          <tr><th scope="row">Email</th><td><ContactEmail value={contactEmail} /></td></tr>
        </tbody>
      </table>
      <p>MAISON TAMRĀN est la marque commerciale exploitée par l&apos;éditeur.</p>

      <h2 id="publication">Directeur de la publication</h2>
      <p><LegalValue value={legal.director} fallback="Directeur de la publication" /></p>

      <h2 id="hebergement">Hébergement</h2>
      <p>Le site est hébergé par : <LegalValue value={legal.host} fallback="Hébergeur" />.</p>
      <p>Les données de la boutique sont stockées par : <LegalValue value={legal.dbHost} fallback="Hébergeur de la base de données" />.</p>

      <h2 id="propriete">Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments du site (marque, logotype, monogramme, textes, noms des créations, mise en page, illustrations) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite préalable de l&apos;éditeur est interdite.
      </p>

      <h2 id="visuels">Visuels du site</h2>
      <p>
        Les images signalées par la mention « Visuel concept » sont des illustrations destinées à présenter l&apos;esprit des créations. Elles ne constituent pas des photographies des produits commercialisés, dont l&apos;aspect peut différer.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        Pour toute question relative au site, écrivez à <ContactEmail value={contactEmail} /> ou utilisez le <Link href="/contact">formulaire de contact</Link>. Le traitement de vos données personnelles est décrit dans la <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>
    </LegalPage>
  );
}
