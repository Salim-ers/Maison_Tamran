import type { Metadata } from "next";
import { ContactEmail } from "@/components/legal/legal";
import Link from "next/link";
import { getContent, getSettings } from "@/lib/catalog";
import { getActiveShippingRates } from "@/lib/public-data";
import { countryName } from "@/lib/countries";
import { euros } from "@/lib/money";
import { PageIntro, Prose, Provisional } from "@/components/layout/page-intro";
import { livraisonContenu } from "@/content/registry/legal";

export const metadata: Metadata = {
  title: "Livraison et retours",
  description: "Tarifs de livraison MAISON TAMRĀN en France et en Europe, conditions d'expédition, colis abîmé et droit de rétractation pour les denrées périssables.",
  alternates: { canonical: "/livraison-retours" },
};

export default async function LivraisonPage() {
  const [rates, c, settings] = await Promise.all([getActiveShippingRates(), getContent(livraisonContenu.key, livraisonContenu.defaults), getSettings()]);
  const anyProvisional = rates.some((r) => r.provisional);
  return (
    <>
      <PageIntro title="Livraison et retours" crumbs={[{ href: "/livraison-retours", label: "Livraison et retours" }]} intro={<p>{c.intro}</p>}>
        <nav aria-label="Sur cette page" className="mt-8 flex flex-wrap gap-x-8 gap-y-2 t-small">
          <a href="#tarifs" className="link-draw">Tarifs</a>
          <a href="#expedition" className="link-draw">Expédition</a>
          <a href="#retours" className="link-draw">Retours et colis abîmé</a>
        </nav>
      </PageIntro>

      <div className="container-luxe pb-[var(--section)]">
        <section id="tarifs" className="scroll-mt-28" aria-labelledby="tarifs-t">
          <h2 id="tarifs-t" className="t-display-m border-b border-chocolate pb-5">Tarifs de livraison</h2>
          {rates.length ? (
            <div className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)]">
              <table className="mt-2 w-full min-w-[40rem] text-left">
                <caption className="sr-only">Tarifs de livraison actifs</caption>
                <thead>
                  <tr className="t-small text-ink-soft">
                    <th scope="col" className="py-4 pr-6 font-normal">Mode</th>
                    <th scope="col" className="py-4 pr-6 font-normal">Pays desservis</th>
                    <th scope="col" className="py-4 pr-6 text-right font-normal">Prix</th>
                    <th scope="col" className="py-4 text-right font-normal">Offerte dès</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((r) => (
                    <tr key={r.id} className="border-t hairline align-top">
                      <th scope="row" className="py-6 pr-6 font-normal">
                        <span className="block font-display text-xl">{r.name}</span>
                        {r.description && <span className="mt-1 block max-w-[34ch] t-small text-ink-soft">{r.description}</span>}
                        {r.provisional && <span className="mt-2 inline-block border border-bronze px-2 py-0.5 text-[0.72rem] text-ink-soft">Tarif provisoire</span>}
                      </th>
                      <td className="py-6 pr-6 t-small">{r.countries.map(countryName).join(", ")}</td>
                      <td className="py-6 pr-6 text-right tabular-nums">{euros(r.priceCents)}</td>
                      <td className="py-6 text-right tabular-nums">{r.freeAboveCents != null ? euros(r.freeAboveCents) : <span className="text-ink-soft">Non</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-8 text-ink-soft">Les tarifs de livraison seront publiés ici dès leur mise en place.</p>
          )}
          {anyProvisional && (
            <Provisional className="mt-8 max-w-[64ch]">
              Les tarifs signalés comme provisoires n&apos;ont pas encore fait l&apos;objet d&apos;un contrat avec un transporteur. Ils peuvent évoluer ; le tarif appliqué à votre commande est toujours celui affiché au moment du paiement.
            </Provisional>
          )}
        </section>

        <div className="mt-24 grid gap-16 lg:grid-cols-12">
          <section id="expedition" className="scroll-mt-28 lg:col-span-5" aria-labelledby="exp-t">
            <h2 id="exp-t" className="t-display-m">Expédition</h2>
            <Prose className="text-ink-soft">
              <h3 className="text-ink">Délais</h3>
              <p>{c.preparation}</p>
              <h3 className="text-ink">Par temps chaud</h3>
              <p>{c.chaleur}</p>
              <h3 className="text-ink">Suivi</h3>
              <p>
                Le numéro de suivi vous est envoyé par email à l&apos;expédition. Vous le retrouvez aussi sur la page <Link href="/suivi-commande">Suivre une commande</Link>.
              </p>
            </Prose>
          </section>

          <section id="retours" className="scroll-mt-28 lg:col-span-6 lg:col-start-7" aria-labelledby="ret-t">
            <h2 id="ret-t" className="t-display-m">Retours et colis abîmé</h2>
            <Prose className="text-ink-soft">
              <h3 className="text-ink">Droit de rétractation</h3>
              <p>
                Nos créations sont des denrées alimentaires périssables. Conformément à l&apos;article L221-28 4° du Code de la consommation, le droit de rétractation ne peut pas être exercé pour la fourniture de biens susceptibles de se détériorer ou de se périmer rapidement. Une commande expédiée ne peut donc pas être retournée pour simple changement d&apos;avis.
              </p>
              <h3 className="text-ink">Colis abîmé ou incomplet</h3>
              <p>{c.dommage}</p>
              <ol>
                <li>Vérifiez le colis en présence du livreur lorsque c&apos;est possible.</li>
                <li>Photographiez l&apos;emballage extérieur, le coffret et son contenu.</li>
                <li>
                  Écrivez-nous à <ContactEmail value={settings.contactEmail} /> ou via le <Link href="/contact">formulaire de contact</Link>, avec votre numéro de commande et les photos.
                </li>
              </ol>
              <p>
                Ces dispositions ne privent pas des garanties légales (conformité, vices cachés). Le détail figure dans les <Link href="/cgv">conditions générales de vente</Link>.
              </p>
            </Prose>
          </section>
        </div>
      </div>
    </>
  );
}
