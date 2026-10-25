import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { segmentLabel } from "@/lib/segments";
import { adminPage } from "../../guard";
import { AdminHeader, Badge, DefList, Notice, Panel } from "@/components/admin/ui";
import { ProposalForm, QuoteMetaForm } from "@/components/admin/quote-forms";
import { fmtDateTime } from "@/components/admin/format";
import { QUOTE_STATUS, QUOTE_STATUS_TONE } from "@/components/admin/labels";
import { btnPrimary, btnSecondary } from "@/components/admin/styles";

export const instant = false;
export const metadata = { title: "Devis" };

function safeLogoUrl(u: string | null) {
  if (!u) return null;
  if (/^\/uploads\/logos\/[\w-]+\.(png|jpe?g|webp|avif|pdf)$/i.test(u)) return u;
  if (/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(u)) return u;
  return null;
}

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  await adminPage();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [[q], tiers] = await Promise.all([
    db.select().from(schema.quoteRequests).where(eq(schema.quoteRequests.id, id)).limit(1),
    db.select().from(schema.priceTiers).where(eq(schema.priceTiers.active, true)).orderBy(asc(schema.priceTiers.minQuantity)),
  ]);
  if (!q) notFound();
  const logo = safeLogoUrl(q.logoUrl);
  const isPdf = logo?.toLowerCase().endsWith(".pdf");
  const pers = q.personalization;
  return (
    <>
      <AdminHeader
        title={`${q.company} · ${q.reference}`}
        back={{ href: "/admin/devis", label: "devis" }}
        intro={<span className="flex flex-wrap items-center gap-2"><Badge tone={QUOTE_STATUS_TONE[q.status]}>{QUOTE_STATUS[q.status]}</Badge><span>Reçue le {fmtDateTime(q.createdAt)}</span></span>}
        actions={
          <>
            <a href={`/admin/devis/${q.id}/pdf?type=demande`} className={btnSecondary} download>Exporter la demande (PDF)</a>
            <a href={`/admin/devis/${q.id}/pdf?type=proposition`} className={q.proposal ? btnPrimary : btnSecondary} download aria-disabled={!q.proposal || undefined}>Exporter la proposition (PDF)</a>
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <div className="space-y-6">
          <Panel title="Demande">
            <DefList
              items={[
                ["Segment", segmentLabel(q.segment)],
                ["Société", q.company],
                ["Contact", q.contactName],
                ["Email", <a key="e" href={`mailto:${q.email}?subject=${encodeURIComponent(`Votre demande ${q.reference}`)}`} className="underline underline-offset-2">{q.email}</a>],
                ["Téléphone", q.phone ?? "—"],
                ["TVA", q.vatNumber ?? "—"],
                ["Date souhaitée", q.desiredDate ?? "—"],
                ["Ville de livraison", q.deliveryCity ?? "—"],
                ["Budget", q.budget ?? "—"],
                ["Compte client", q.userId ? <Link key="u" href={`/admin/clients/${q.userId}`} className="underline underline-offset-2">Voir le compte</Link> : "Non connecté"],
              ]}
            />
          </Panel>
          <Panel title="Produits demandés">
            {q.lines.length === 0 ? (
              <p className="text-sm text-ink-soft">Aucune ligne précisée.</p>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {q.lines.map((l, i) => (
                  <li key={`${l.ref}-${i}`} className="flex justify-between gap-3 py-2">
                    <span>{l.label}</span>
                    <span className="tabular-nums">{l.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Personnalisation">
            {pers ? (
              <div className="space-y-2 text-sm">
                <p className="flex flex-wrap gap-1.5">
                  <Badge tone={pers.logo ? "info" : "muted"}>Logo : {pers.logo ? "oui" : "non"}</Badge>
                  <Badge tone={pers.card ? "info" : "muted"}>Carte : {pers.card ? "oui" : "non"}</Badge>
                  <Badge tone={pers.ribbon ? "info" : "muted"}>Ruban : {pers.ribbon ? "oui" : "non"}</Badge>
                </p>
                {pers.notes && <p className="whitespace-pre-line">{pers.notes}</p>}
              </div>
            ) : (
              <p className="text-sm text-ink-soft">Aucune personnalisation demandée.</p>
            )}
            {q.logoUrl && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Logo fourni</p>
                {logo ? (
                  isPdf ? (
                    <a href={logo} target="_blank" rel="noopener" className="underline underline-offset-2">Ouvrir le logo (PDF)</a>
                  ) : (
                    <a href={logo} target="_blank" rel="noopener" className="inline-block rounded-[2px] border border-line bg-ivory p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logo} alt={`Logo fourni par ${q.company}`} className="max-h-32 max-w-60 object-contain" />
                    </a>
                  )
                ) : (
                  <Notice tone="warning">Adresse de logo non reconnue : elle n&apos;est pas affichée par sécurité.</Notice>
                )}
              </div>
            )}
          </Panel>
          {q.message && (
            <Panel title="Message">
              <p className="whitespace-pre-line text-sm">{q.message}</p>
            </Panel>
          )}
          <Panel title="Suivi interne">
            <QuoteMetaForm id={q.id} status={q.status} internalNotes={q.internalNotes} />
          </Panel>
        </div>
        <Panel title="Proposition commerciale" description={q.proposal ? `Dernière mise à jour : ${fmtDateTime(q.updatedAt)}` : "Établissez la proposition chiffrée, puis exportez-la en PDF pour l'envoyer au client."}>
          <ProposalForm
            id={q.id}
            initial={q.proposal}
            suggestions={q.lines.map((l) => ({ label: l.label, quantity: l.quantity }))}
            tiers={tiers.map((t) => ({ id: t.id, minQuantity: t.minQuantity, discountPercent: t.discountPercent, label: t.label }))}
            status={q.status}
          />
        </Panel>
      </div>
    </>
  );
}
