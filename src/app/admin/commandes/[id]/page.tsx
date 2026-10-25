import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import type { AddressSnapshot } from "@/db/schema";
import { allowedTransitions, orderDetail } from "@/lib/orders";
import { STATUS_LABELS } from "@/lib/email";
import { adminPage } from "../../guard";
import { AdminHeader, Badge, DefList, Notice, Panel, TextLink } from "@/components/admin/ui";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { fmtDateTime, fmtEuros, fullName } from "@/components/admin/format";
import { ORDER_STATUS_TONE } from "@/components/admin/labels";
import { countryName } from "@/lib/countries";

export const instant = false;
export const metadata = { title: "Commande" };

function Address({ a }: { a: AddressSnapshot }) {
  return (
    <address className="text-sm not-italic leading-relaxed">
      {fullName(a)}
      {a.company && <><br />{a.company}</>}
      <br />{a.line1}
      {a.line2 && <><br />{a.line2}</>}
      <br />{a.postalCode} {a.city}
      <br />{countryName(a.country)}
      {a.phone && <><br />Tél. {a.phone}</>}
    </address>
  );
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  await adminPage();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const detail = await orderDetail(id);
  if (!detail) notFound();
  const { order: o, items, events } = detail;
  const [products, customer] = await Promise.all([
    db.select({ slug: schema.products.slug, name: schema.products.name }).from(schema.products),
    o.userId ? db.select({ id: schema.users.id, email: schema.users.email }).from(schema.users).where(eq(schema.users.id, o.userId)).limit(1) : Promise.resolve([]),
  ]);
  const pname = new Map(products.map((p) => [p.slug, p.name]));
  const allowed = allowedTransitions(o.status).filter((s) => !(o.isDemo && (s === "preparing" || s === "shipped")));

  return (
    <>
      <AdminHeader
        title={`Commande ${o.number}`}
        back={{ href: "/admin/commandes", label: "commandes" }}
        intro={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={ORDER_STATUS_TONE[o.status]}>{STATUS_LABELS[o.status]}</Badge>
            {o.isDemo && <Badge tone="warning">Commande de démonstration</Badge>}
            <span>Passée le {fmtDateTime(o.createdAt)}</span>
          </span>
        }
      />
      {o.isDemo && (
        <Notice tone="warning" className="mb-6" title="Commande de démonstration">
          Cette commande a été passée en mode démonstration : aucun paiement n&apos;a été encaissé et elle ne doit pas être expédiée. Elle est exclue du chiffre d&apos;affaires.
        </Notice>
      )}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel title="Articles">
            <ul className="divide-y divide-line">
              {items.map((it) => (
                <li key={it.id} className="flex flex-wrap justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">{it.quantity} × {it.name}</p>
                    {it.description && <p className="text-ink-soft">{it.description}</p>}
                    {it.composition && Object.keys(it.composition).length > 0 && (
                      <ul className="mt-1 list-inside list-disc text-ink-soft">
                        {Object.entries(it.composition).map(([slug, q]) => (
                          <li key={slug}>{q} × {pname.get(slug) ?? slug}</li>
                        ))}
                      </ul>
                    )}
                    {it.giftWrap && <p className="mt-1"><Badge tone="info">Emballage cadeau</Badge></p>}
                    {it.giftMessage && (
                      <blockquote className="mt-2 border-l-2 border-bronze pl-3 italic">
                        <span className="sr-only">Message cadeau : </span>« {it.giftMessage} »
                      </blockquote>
                    )}
                  </div>
                  <div className="text-right tabular-nums">
                    <p>{fmtEuros(it.totalCents)}</p>
                    <p className="text-xs text-ink-soft">{fmtEuros(it.unitPriceCents)} l&apos;unité</p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 border-t border-line pt-4 text-sm tabular-nums">
              <div className="flex justify-between"><dt>Sous-total</dt><dd>{fmtEuros(o.subtotalCents)}</dd></div>
              {o.discountCents > 0 && <div className="flex justify-between"><dt>Remise{o.promoCode ? ` (code ${o.promoCode})` : ""}</dt><dd>−{fmtEuros(o.discountCents)}</dd></div>}
              {o.promoCode && o.discountCents === 0 && <div className="flex justify-between"><dt>Code promotionnel</dt><dd>{o.promoCode}</dd></div>}
              <div className="flex justify-between"><dt>Livraison{o.shippingMethod ? ` (${o.shippingMethod})` : ""}</dt><dd>{o.shippingCents ? fmtEuros(o.shippingCents) : "Offerte"}</dd></div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>Total TTC</dt><dd>{fmtEuros(o.totalCents)}</dd></div>
            </dl>
          </Panel>

          <div className="grid gap-6 md:grid-cols-2">
            <Panel title="Livraison">
              <Address a={o.shippingAddress} />
              <p className="mt-3 text-sm text-ink-soft">Mode : {o.shippingMethod ?? "—"}</p>
            </Panel>
            <Panel title="Facturation">
              {o.billingAddress ? <Address a={o.billingAddress} /> : <p className="text-sm text-ink-soft">Identique à l&apos;adresse de livraison.</p>}
            </Panel>
          </div>

          <Panel title="Historique">
            <ol className="space-y-3 border-l border-line pl-4">
              {events.map((e) => (
                <li key={e.id} className="text-sm">
                  <p>
                    <strong className="font-semibold">{STATUS_LABELS[e.status] ?? e.status}</strong>
                    <span className="text-ink-soft"> · {fmtDateTime(e.createdAt)}</span>
                  </p>
                  {e.note && <p className="text-ink-soft">{e.note}</p>}
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Statut et suivi">
            <OrderStatusForm id={o.id} current={o.status} allowed={allowed} labels={STATUS_LABELS} trackingNumber={o.trackingNumber} trackingUrl={o.trackingUrl} isDemo={o.isDemo} />
          </Panel>
          <Panel title="Client">
            <DefList
              items={[
                ["Email", o.email],
                ["Compte", customer[0] ? <TextLink href={`/admin/clients/${customer[0].id}`}>Voir le compte</TextLink> : "Commande invitée"],
                ["Note du client", o.customerNote ? <span className="whitespace-pre-line">{o.customerNote}</span> : "—"],
              ]}
            />
          </Panel>
          <Panel title="Paiement">
            <DefList
              items={[
                ["Payée le", o.paidAt ? fmtDateTime(o.paidAt) : "—"],
                ["Stock décrémenté", o.stockCommitted ? "Oui" : "Non"],
                ["Session Stripe", o.stripeSessionId ? <span className="font-mono text-xs">{o.stripeSessionId}</span> : "—"],
                ["Paiement Stripe", o.stripePaymentIntentId ? <span className="font-mono text-xs">{o.stripePaymentIntentId}</span> : "—"],
                ["Dernière mise à jour", fmtDateTime(o.updatedAt)],
              ]}
            />
            {o.stripePaymentIntentId && !o.isDemo && (
              <p className="mt-3 text-xs text-ink-soft">Les remboursements se font dans le tableau de bord Stripe ; passez ensuite la commande en « Remboursée » ici.</p>
            )}
          </Panel>
          <p className="text-sm"><Link href="/admin/emails" className="underline underline-offset-2">Voir les emails envoyés</Link></p>
        </div>
      </div>
    </>
  );
}
