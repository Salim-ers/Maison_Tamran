import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/catalog";
import { PageIntro } from "@/components/layout/page-intro";
import { ContactForm } from "@/components/contact-form";
import { concept, Media } from "@/components/ui/media";

export const metadata: Metadata = {
  title: "Nous écrire",
  description: "Une question sur une commande, un cadeau, un allergène ou un projet professionnel ? Écrivez à la maison TAMBRÉ.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSettings();
  return (
    <>
      <PageIntro
        title="Nous écrire"
        crumbs={[{ href: "/contact", label: "Nous écrire" }]}
        intro={<p>Une commande, un cadeau à préparer, une question sur un allergène : écrivez-nous, nous vous répondons par email.</p>}
      />
      <div className="container-luxe grid gap-16 pb-[var(--section)] lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Media image={concept("lifestyle-2")} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover object-[30%_50%]" wrapperClassName="absolute inset-0" />
          </div>
          <dl className="mt-10 space-y-8">
            <div>
              <dt className="t-small text-ink-soft">Par email</dt>
              <dd className="mt-1 font-display text-2xl"><a href={`mailto:${settings.contactEmail}`} className="link-draw break-all">{settings.contactEmail}</a></dd>
            </div>
            <div>
              <dt className="t-small text-ink-soft">Un projet professionnel</dt>
              <dd className="mt-1">Pour un devis, le <Link href="/professionnels/devis" className="link-draw">formulaire dédié</Link> nous transmet tous les éléments utiles.</dd>
            </div>
            <div>
              <dt className="t-small text-ink-soft">Avant d&apos;écrire</dt>
              <dd className="mt-1">Les réponses aux questions courantes sont dans la <Link href="/faq" className="link-draw">foire aux questions</Link>.</dd>
            </div>
          </dl>
        </aside>
      </div>
    </>
  );
}
