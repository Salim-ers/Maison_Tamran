import type { Metadata } from "next";
import Link from "@/components/motion/transition-link";
import { LegalPage } from "@/components/legal/legal";
import { CookieSettingsLink } from "@/components/consent/cookie-settings-link";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Les cookies utilisés sur le site MAISON TAMRĀN, leur finalité, leur durée et la manière de gérer vos préférences.",
  alternates: { canonical: "/cookies" },
};

const TOC = [
  { id: "principe", label: "Notre approche" },
  { id: "liste", label: "Cookies utilisés" },
  { id: "stripe", label: "Page de paiement Stripe" },
  { id: "preferences", label: "Gérer vos préférences" },
];

const COOKIES = [
  ["tb_cart", "Indispensable", "Conserve le contenu de votre panier entre deux visites.", "60 jours"],
  ["tb_session", "Indispensable", "Maintient votre connexion à votre compte client. Déposé uniquement lorsque vous vous connectez.", "30 jours"],
  ["tb_consent", "Indispensable", "Mémorise vos choix en matière de cookies, pour ne pas vous les redemander à chaque page.", "6 mois"],
  ["tb_vid", "Mesure d'audience", "Identifiant aléatoire permettant de compter les visites de façon interne et agrégée. Déposé seulement si vous acceptez la mesure d'audience, supprimé si vous la refusez.", "6 mois"],
];

export default function CookiesPage() {
  return (
    <LegalPage title="Cookies" href="/cookies" toc={TOC} intro={<p>Un cookie est un petit fichier déposé sur votre appareil lors de la consultation d&apos;un site. Voici ceux que nous utilisons, et pourquoi.</p>}>
      <h2 id="principe">Notre approche</h2>
      <p>
        Nous utilisons le strict nécessaire au fonctionnement de la boutique : panier, connexion, mémorisation de vos choix. La mesure d&apos;audience, interne et sans publicité, n&apos;est activée qu&apos;avec votre accord. Aucun cookie publicitaire ni de réseau social n&apos;est déposé sur ce site.
      </p>

      <h2 id="liste">Cookies utilisés</h2>
      <div className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] lg:mx-0 lg:px-0">
        <table className="min-w-[40rem] t-small">
          <thead>
            <tr><th scope="col">Nom</th><th scope="col">Catégorie</th><th scope="col">Finalité</th><th scope="col">Durée</th></tr>
          </thead>
          <tbody>
            {COOKIES.map(([n, c, f, d]) => (
              <tr key={n} className="align-top"><th scope="row"><code className="font-sans font-semibold">{n}</code></th><td>{c}</td><td>{f}</td><td className="whitespace-nowrap">{d}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>Les cookies indispensables sont exemptés de consentement (article 82 de la loi Informatique et Libertés). Ils ne servent à aucun suivi publicitaire.</p>

      <h2 id="stripe">Page de paiement Stripe</h2>
      <p>
        Lors du paiement, vous êtes redirigé vers la page sécurisée de Stripe, qui dépose ses propres cookies, nécessaires à la sécurité de la transaction et à la prévention de la fraude. Ces cookies relèvent de la politique de Stripe, consultable sur <a href="https://stripe.com/fr/legal/cookies-policy" rel="noopener noreferrer" target="_blank">stripe.com</a>.
      </p>

      <h2 id="preferences">Gérer vos préférences</h2>
      <p>Vous pouvez modifier votre choix à tout moment : le panneau de préférences s&apos;ouvre avec le bouton ci-dessous, ou depuis le lien « Gérer mes cookies » en pied de page.</p>
      <p>
        <CookieSettingsLink className="btn btn-primary no-underline" label="Modifier mes préférences" />
      </p>
      <p>Vous pouvez aussi supprimer les cookies depuis les réglages de votre navigateur ; le panier et la connexion ne fonctionneront alors plus. Pour en savoir plus sur vos données, consultez la <Link href="/confidentialite">politique de confidentialité</Link>.</p>
    </LegalPage>
  );
}
