import type { Metadata } from "next";
import { isPlaceholderEmail } from "@/components/legal/legal";
import Link from "next/link";
import { getSettings } from "@/lib/catalog";
import { storeMode } from "@/lib/env";
import { PageIntro } from "@/components/layout/page-intro";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Commandes et paiement, livraison, conservation et allergènes, coffrets et cadeaux, offre professionnelle : les réponses aux questions courantes sur MAISON TAMRĀN.",
  alternates: { canonical: "/faq" },
};

interface QA {
  q: string;
  /** Réponse en texte brut (utilisée aussi pour les données structurées). */
  a: string;
  link?: { href: string; label: string };
}

function groups(contactEmail: string): { id: string; title: string; items: QA[] }[] {
  const reach = isPlaceholderEmail(contactEmail) ? "via le formulaire de contact" : `à ${contactEmail}`;
  return [
    {
      id: "commandes",
      title: "Commandes et paiement",
      items: [
        { q: "Comment passer commande ?", a: "Choisissez une création en étui, un coffret prêt à offrir ou composez votre propre coffret, puis validez votre panier. Vous pouvez commander sans créer de compte.", link: { href: "/creations", label: "Voir les créations" } },
        { q: "Quels moyens de paiement acceptez-vous ?", a: "Lorsque la boutique est ouverte à la vente, le paiement s'effectue sur la page sécurisée de notre prestataire Stripe, par carte bancaire et, selon votre appareil, Apple Pay ou Google Pay. Nous n'avons jamais accès à vos données de carte." },
        { q: "Comment suivre ma commande ?", a: "Le lien de suivi figure dans l'email de confirmation. Vous pouvez aussi retrouver vos commandes depuis votre compte, ou sur la page de suivi avec votre numéro de commande.", link: { href: "/suivi-commande", label: "Suivre une commande" } },
        { q: "Puis-je modifier ou annuler une commande ?", a: `Écrivez-nous au plus vite ${reach} en indiquant votre numéro de commande. Tant que la commande n'est pas préparée, nous faisons notre possible pour la modifier.`, link: { href: "/contact", label: "Nous écrire" } },
        { q: "Les recettes sont-elles toutes disponibles ?", a: "Certaines recettes portent la mention « Recette en développement » : elles sont encore en cours de mise au point et peuvent évoluer avant leur commercialisation." },
      ],
    },
    {
      id: "livraison",
      title: "Livraison",
      items: [
        { q: "Où livrez-vous ?", a: "En France métropolitaine et dans plusieurs pays européens. Les pays desservis et les tarifs sont détaillés sur la page Livraison et retours.", link: { href: "/livraison-retours", label: "Livraison et retours" } },
        { q: "Quel est le délai de livraison ?", a: "Le délai dépend de la période et du transporteur : il vous est communiqué à l'expédition, avec le numéro de suivi. Nous ne garantissons pas de délai à ce stade." },
        { q: "Mon colis est arrivé abîmé, que faire ?", a: "Photographiez l'emballage et son contenu, émettez si possible des réserves auprès du transporteur, puis écrivez-nous avec votre numéro de commande. Nous étudions chaque situation.", link: { href: "/livraison-retours#retours", label: "La procédure" } },
        { q: "Puis-je retourner une commande ?", a: "Nos créations sont des denrées périssables : elles sont exclues du droit de rétractation (article L221-28 4° du Code de la consommation). En cas de problème à la réception, contactez-nous." },
      ],
    },
    {
      id: "conservation",
      title: "Conservation et allergènes",
      items: [
        { q: "Comment conserver mes dattes ?", a: "Les conditions de conservation et la date de durabilité figurent sur l'étiquette de chaque coffret et sur la fiche produit. Reportez-vous à ces indications : elles priment sur toute recommandation générale." },
        { q: "Où trouver la liste des allergènes ?", a: "Chaque fiche produit indique les allergènes de la recette et la liste des ingrédients. L'étiquette du produit reçu fait foi. Nos créations contiennent du chocolat et peuvent contenir du lait, des fruits à coque, du soja, du sésame ou du gluten selon les recettes." },
        { q: "J'ai une allergie : puis-je déguster vos créations ?", a: `Consultez la fiche de chaque recette et l'étiquette. En cas de doute, écrivez-nous ${reach} avant de commander : nous vous répondrons avec les informations dont nous disposons.` },
        { q: "Les valeurs nutritionnelles sont-elles disponibles ?", a: "Elles sont publiées sur la fiche produit dès qu'elles ont été établies et validées pour la recette concernée." },
      ],
    },
    {
      id: "cadeaux",
      title: "Coffrets et cadeaux",
      items: [
        { q: "Puis-je composer mon propre coffret ?", a: "Oui : choisissez le format, puis les créations une à une. L'aperçu se remplit à mesure de votre sélection.", link: { href: "/composer-mon-coffret", label: "Composer mon coffret" } },
        { q: "Puis-je ajouter un message ?", a: "Oui. Lors de l'ajout d'un coffret au panier, vous pouvez choisir l'emballage cadeau et rédiger un message qui accompagnera le coffret." },
        { q: "Puis-je faire livrer un cadeau directement à son destinataire ?", a: "Oui : saisissez l'adresse du destinataire comme adresse de livraison. Pour toute consigne particulière, utilisez la note pour la préparation au moment de la commande : elle est transmise avec celle-ci." },
      ],
    },
    {
      id: "professionnels",
      title: "Professionnels",
      items: [
        { q: "Proposez-vous des coffrets personnalisés ?", a: "Oui : logo sur le coffret, carte imprimée, ruban, formats adaptés. Décrivez votre projet dans le formulaire de devis, nous revenons vers vous avec une proposition chiffrée.", link: { href: "/professionnels/devis", label: "Demander un devis" } },
        { q: "Existe-t-il des tarifs pour les grandes quantités ?", a: "Les tarifs dégressifs sont communiqués avec la proposition, selon les quantités, les créations et la personnalisation." },
        { q: "Je tiens un café, un hôtel ou une épicerie fine : puis-je revendre vos créations ?", a: "Un espace professionnel de réassort est en préparation. En attendant, présentez-nous votre établissement via le formulaire de devis.", link: { href: "/professionnels#revendeurs", label: "Revendeurs" } },
      ],
    },
  ];
}

function Item({ item }: { item: QA }) {
  return (
    <details className="group border-b hairline [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 font-display text-[1.3rem] leading-snug transition-colors hover:text-bronze focus-visible:text-bronze">
        <span>{item.q}</span>
        <span aria-hidden className="relative mt-2.5 size-3.5 shrink-0">
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current transition-transform duration-500 ease-[var(--ease-luxe)] group-open:scale-y-0" />
        </span>
      </summary>
      <div className="max-w-[62ch] pb-7 text-ink-soft">
        <p>{item.a}</p>
        {item.link && (
          <Link href={item.link.href} className="mt-4 inline-block link-draw text-ink">{item.link.label}</Link>
        )}
      </div>
    </details>
  );
}

export default async function FaqPage() {
  const settings = await getSettings();
  const all = groups(settings.contactEmail);
  const demo = storeMode() === "demo";
  return (
    <>
      <PageIntro
        title="Questions fréquentes"
        crumbs={[{ href: "/faq", label: "Questions fréquentes" }]}
        intro={<p>Les réponses aux questions que l&apos;on nous pose le plus souvent. Vous ne trouvez pas la vôtre ? <Link href="/contact" className="link-draw text-ink">Écrivez-nous</Link>.</p>}
      />
      <div className="container-luxe grid gap-14 pb-[var(--section)] lg:grid-cols-12">
        <nav aria-label="Rubriques" className="lg:col-span-3">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 t-small lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:block lg:space-y-3">
            {all.map((g) => (
              <li key={g.id}><a href={`#${g.id}`} className="hover:text-bronze">{g.title}</a></li>
            ))}
            <li><a href="#demonstration" className="hover:text-bronze">Mode démonstration</a></li>
          </ul>
        </nav>
        <div className="space-y-20 lg:col-span-8 lg:col-start-5">
          {all.map((g) => (
            <section key={g.id} id={g.id} className="scroll-mt-28" aria-labelledby={`${g.id}-t`}>
              <h2 id={`${g.id}-t`} className="t-display-m border-b border-chocolate pb-5">{g.title}</h2>
              {g.items.map((it) => <Item key={it.q} item={it} />)}
            </section>
          ))}

          <section id="demonstration" className="on-dark scroll-mt-28 p-[clamp(2rem,5vw,4rem)]" aria-labelledby="demo-t">
            <h2 id="demo-t" className="t-display-m">Le mode démonstration</h2>
            <p className="mt-6 max-w-[58ch] text-taupe">
              {demo
                ? "La boutique fonctionne actuellement en mode démonstration. Vous pouvez parcourir le site, composer un coffret et aller jusqu'au bout d'une commande pour découvrir le parcours, mais rien n'est réel :"
                : "Lorsque la boutique fonctionne en mode démonstration, un bandeau l'indique en haut de chaque page. Dans ce mode :"}
            </p>
            <ul className="mt-6 max-w-[58ch] space-y-3 text-ivory">
              <li className="border-l border-bronze-light pl-4">les commandes sont simulées et marquées comme telles ;</li>
              <li className="border-l border-bronze-light pl-4">aucun paiement n&apos;est demandé ni encaissé ;</li>
              <li className="border-l border-bronze-light pl-4">aucun colis n&apos;est préparé ni expédié ;</li>
              <li className="border-l border-bronze-light pl-4">les emails envoyés portent la mention « [DÉMO] » dans leur objet.</li>
            </ul>
            <p className="mt-6 max-w-[58ch] t-small text-taupe">Les recettes en développement et les visuels concept présentés sur le site illustrent les créations à venir : ils ne constituent pas une photographie des produits réels.</p>
          </section>
        </div>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: all.flatMap((g) => g.items).map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
        }}
      />
    </>
  );
}
