import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/catalog";
import { LegalPage, LegalValue } from "@/components/legal/legal";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment MAISON TAMRĀN traite vos données personnelles : finalités, bases légales, durées de conservation, sous-traitants, vos droits.",
  alternates: { canonical: "/confidentialite" },
};

const TOC = [
  { id: "responsable", label: "Responsable de traitement" },
  { id: "traitements", label: "Données, finalités et bases légales" },
  { id: "durees", label: "Durées de conservation" },
  { id: "destinataires", label: "Destinataires et sous-traitants" },
  { id: "transferts", label: "Transferts hors de l'Union européenne" },
  { id: "securite", label: "Sécurité" },
  { id: "droits", label: "Vos droits" },
  { id: "cookies", label: "Cookies" },
];

const TREATMENTS = [
  ["Panier", "Identifiant technique du panier, contenu du panier", "Conserver votre sélection pendant votre visite", "Exécution de mesures précontractuelles"],
  ["Commande", "Identité, email, téléphone, adresses de livraison et de facturation, contenu de la commande, note de préparation", "Traiter, livrer et suivre la commande, service client, facturation", "Exécution du contrat ; obligation légale (comptabilité)"],
  ["Paiement", "Données de paiement saisies sur la page Stripe (le site n'y a pas accès)", "Encaisser le paiement, prévenir la fraude", "Exécution du contrat"],
  ["Compte client", "Email, mot de passe chiffré, nom, téléphone, adresses, historique de commandes", "Gérer votre espace client et la connexion", "Exécution du contrat (conditions d'utilisation du compte)"],
  ["Lettre d'information", "Email, date et texte du consentement", "Vous adresser la lettre de MAISON TAMRĀN", "Consentement, retirable à tout moment"],
  ["Demande de devis", "Société, contact, email, téléphone, n° de TVA, projet, fichier du logo", "Étudier votre demande et établir une proposition", "Mesures précontractuelles ; intérêt légitime (prospection B2B)"],
  ["Contact", "Nom, email, sujet, n° de commande, message", "Répondre à votre message", "Intérêt légitime ; mesures précontractuelles"],
  ["Mesure d'audience", "Identifiant aléatoire (haché), pages vues, étapes du parcours d'achat", "Comprendre l'usage du site, de façon interne et agrégée", "Consentement (cookie de mesure d'audience)"],
  ["Sécurité", "Adresse IP hachée, nombre de tentatives", "Limiter les tentatives de connexion et les envois abusifs", "Intérêt légitime (sécurité du service)"],
];

const DURATIONS = [
  ["Panier", "Cookie : 60 jours ; panier non converti : purgé périodiquement (durée à fixer)"],
  ["Commandes et factures", "10 ans (obligation comptable), en archivage intermédiaire au-delà de la relation commerciale"],
  ["Compte client", "Jusqu'à sa suppression, puis 3 ans après le dernier contact en l'absence d'activité"],
  ["Lettre d'information", "Jusqu'au désabonnement, ou 3 ans sans interaction"],
  ["Demandes de devis et messages", "3 ans après le dernier échange"],
  ["Mesure d'audience", "Cookie : 6 mois ; données agrégées : 25 mois au maximum"],
  ["Session de connexion", "30 jours"],
];

export default async function ConfidentialitePage() {
  const { legal, contactEmail } = await getSettings();
  return (
    <LegalPage title="Politique de confidentialité" href="/confidentialite" toc={TOC} intro={<p>Cette politique explique quelles données personnelles nous traitons, pourquoi, combien de temps, et comment exercer vos droits au titre du Règlement général sur la protection des données (RGPD) et de la loi Informatique et Libertés.</p>}>
      <h2 id="responsable">Responsable de traitement</h2>
      <p>
        Le responsable de traitement est <LegalValue value={legal.companyName} fallback="Raison sociale" />, <LegalValue value={legal.address} fallback="Adresse du siège" />, exploitant la marque MAISON TAMRĀN. Pour toute question relative à vos données : <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>

      <h2 id="traitements">Données, finalités et bases légales</h2>
      <p>Nous ne collectons que les données nécessaires à chaque usage. Nous ne vendons ni ne louons vos données.</p>
      <div className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] lg:mx-0 lg:px-0">
        <table className="min-w-[44rem] t-small">
          <thead>
            <tr><th scope="col">Traitement</th><th scope="col">Données</th><th scope="col">Finalité</th><th scope="col">Base légale</th></tr>
          </thead>
          <tbody>
            {TREATMENTS.map(([t, d, f, b]) => (
              <tr key={t} className="align-top"><th scope="row">{t}</th><td>{d}</td><td>{f}</td><td>{b}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="durees">Durées de conservation</h2>
      <table className="t-small">
        <tbody>
          {DURATIONS.map(([k, v]) => (
            <tr key={k} className="align-top"><th scope="row">{k}</th><td>{v}</td></tr>
          ))}
        </tbody>
      </table>

      <h2 id="destinataires">Destinataires et sous-traitants</h2>
      <p>Vos données sont accessibles aux seules personnes habilitées de MAISON TAMRĀN et aux prestataires suivants, dans la limite de leur mission :</p>
      <ul>
        <li><strong>Stripe</strong> : paiement en ligne et prévention de la fraude.</li>
        <li><strong>Vercel</strong> : hébergement du site (<LegalValue value={legal.host} fallback="Hébergeur" />).</li>
        <li><strong>Resend</strong> : envoi des emails transactionnels (confirmation de commande, devis, lettre d&apos;information).</li>
        <li><strong>Hébergeur de la base de données</strong> : <LegalValue value={legal.dbHost} fallback="Hébergeur de la base de données" />.</li>
        <li><strong>Stockage de fichiers</strong> : Vercel Blob, pour les logos joints aux demandes de devis.</li>
        <li><strong>Transporteurs</strong> : nom, adresse et téléphone de livraison, pour l&apos;acheminement des colis.</li>
      </ul>

      <h2 id="transferts">Transferts hors de l&apos;Union européenne</h2>
      <p>
        Certains prestataires (Stripe, Vercel, Resend) peuvent traiter des données aux États-Unis. Ces transferts sont encadrés par le cadre de protection des données UE-États-Unis lorsque le prestataire y adhère, ou par les clauses contractuelles types de la Commission européenne.
      </p>

      <h2 id="securite">Sécurité</h2>
      <p>Les mots de passe sont chiffrés, les jetons de session et d&apos;accès ne sont jamais stockés en clair, et les échanges avec le site sont chiffrés (HTTPS).</p>

      <h2 id="droits">Vos droits</h2>
      <p>
        Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et de portabilité de vos données, ainsi que du droit de retirer votre consentement à tout moment et de définir des directives relatives au sort de vos données après votre décès. Pour les exercer, écrivez à <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. Une pièce justificative pourra vous être demandée en cas de doute sur votre identité.
      </p>
      <p>
        Vous pouvez vous désinscrire de la lettre d&apos;information à tout moment depuis chaque email ou sur la page <Link href="/newsletter/desinscription">désinscription</Link>.
      </p>
      <p>
        Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL, 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, <a href="https://www.cnil.fr" rel="noopener noreferrer" target="_blank">www.cnil.fr</a>.
      </p>

      <h2 id="cookies">Cookies</h2>
      <p>La liste des cookies utilisés et la manière de gérer vos préférences sont détaillées sur la page <Link href="/cookies">Cookies</Link>.</p>
    </LegalPage>
  );
}
