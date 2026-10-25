import Link from "next/link";
import { BrandLogo } from "@/components/brand";
import { getSettings } from "@/lib/catalog";
import { storeMode } from "@/lib/env";
import { IconInstagram, IconLinkedin, IconPinterest } from "./icons";
import { CookieSettingsLink } from "@/components/consent/cookie-settings-link";

const COLS = [
  {
    title: "Créations",
    links: [
      ["/creations", "Toutes les créations"],
      ["/collections/signature", "Collection Signature"],
      ["/collections/ephemere", "Collection Éphémère"],
      ["/coffrets", "Les coffrets"],
      ["/composer-mon-coffret", "Composer mon coffret"],
    ],
  },
  {
    title: "La Maison",
    links: [
      ["/maison", "Notre Maison"],
      ["/savoir-faire", "Le savoir-faire"],
      ["/professionnels", "Professionnels"],
      ["/professionnels/cadeaux-entreprise", "Cadeaux d'entreprise"],
      ["/professionnels/mariages-evenements", "Mariages et événements"],
    ],
  },
  {
    title: "Service client",
    links: [
      ["/faq", "Questions fréquentes"],
      ["/livraison-retours", "Livraison et retours"],
      ["/suivi-commande", "Suivre une commande"],
      ["/compte", "Mon compte"],
      ["/contact", "Nous écrire"],
    ],
  },
];

const SOCIAL = [
  { key: "instagram", label: "Instagram", Icon: IconInstagram },
  { key: "pinterest", label: "Pinterest", Icon: IconPinterest },
  { key: "linkedin", label: "LinkedIn", Icon: IconLinkedin },
] as const;

export async function SiteFooter() {
  const settings = await getSettings();
  const demo = storeMode() === "demo";
  const social = SOCIAL.filter((s) => settings.social[s.key]);
  return (
    <footer className="on-dark relative overflow-hidden">
      <div className="container-luxe grid gap-14 pb-10 pt-24 lg:grid-cols-[1.2fr_2fr]">
        <div className="max-w-sm">
          <BrandLogo variant="logo" tone="light" height={176} className="h-40 lg:h-44" />
          <p className="mt-6 font-display text-xl italic text-taupe">L&apos;art de sublimer la datte.</p>
          <p className="mt-6 t-small text-taupe">
            Une question sur une commande, un cadeau, une allergie&nbsp;?{" "}
            <a className="link-draw text-ivory" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          </p>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          {COLS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="font-sans text-[0.8rem] font-semibold tracking-[0.04em] text-taupe">{c.title}</h2>
              <ul className="mt-4 space-y-2.5 t-small">
                {c.links.map(([href, label]) => (
                  <li key={href}><Link href={href} className="hover:text-bronze-light transition-colors">{label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="container-luxe grid gap-6 border-t border-line-light py-8 t-small text-taupe md:grid-cols-3">
        <p>{demo ? "Paiement : boutique en mode démonstration, aucun encaissement." : "Paiement sécurisé par Stripe : carte bancaire, Apple Pay, Google Pay."}</p>
        <p>Livraison en France et dans six pays européens. Tarifs et conditions dans <Link href="/livraison-retours" className="link-draw text-ivory">Livraison et retours</Link>.</p>
        <div className="flex items-center gap-4 md:justify-end">
          {social.length ? (
            social.map(({ key, label, Icon }) => (
              <a key={key} href={settings.social[key]} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-ivory hover:text-bronze-light transition-colors">
                <Icon className="size-5" />
              </a>
            ))
          ) : (
            <span>Réseaux sociaux : liens à renseigner dans le back-office.</span>
          )}
        </div>
      </div>

      <div className="container-luxe flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line-light py-6 t-micro text-taupe">
        <span>© {settings.legal.companyName && !settings.legal.companyName.startsWith("[") ? settings.legal.companyName : "MAISON TAMRĀN"}</span>
        <Link href="/mentions-legales" className="hover:text-ivory">Mentions légales</Link>
        <Link href="/cgv" className="hover:text-ivory">Conditions générales de vente</Link>
        <Link href="/confidentialite" className="hover:text-ivory">Confidentialité</Link>
        <Link href="/cookies" className="hover:text-ivory">Cookies</Link>
        <CookieSettingsLink className="hover:text-ivory" />
      </div>
    </footer>
  );
}
