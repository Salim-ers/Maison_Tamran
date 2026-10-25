import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { STATUS_LABELS } from "@/lib/email";
import { countryName } from "@/lib/countries";
import { adminPage } from "../../guard";
import { AdminHeader, Badge, DataTable, DefList, EmptyState, Panel } from "@/components/admin/ui";
import { ProForm, RoleForm } from "@/components/admin/customer-forms";
import { fmtDate, fmtDateTime, fmtEuros, fullName } from "@/components/admin/format";
import { ORDER_STATUS_TONE, QUOTE_STATUS, ROLE_LABELS } from "@/components/admin/labels";

export const instant = false;
export const metadata = { title: "Client" };

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await adminPage();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  // Sélection explicite : le hash du mot de passe n'est jamais lu.
  const [[u], orders, addresses, quotes] = await Promise.all([
    db
      .select({
        id: schema.users.id, email: schema.users.email, firstName: schema.users.firstName, lastName: schema.users.lastName, phone: schema.users.phone, role: schema.users.role,
        company: schema.users.company, vatNumber: schema.users.vatNumber, marketingConsent: schema.users.marketingConsent, createdAt: schema.users.createdAt, lastLoginAt: schema.users.lastLoginAt,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1),
    db.select().from(schema.orders).where(eq(schema.orders.userId, id)).orderBy(desc(schema.orders.createdAt)),
    db.select().from(schema.addresses).where(eq(schema.addresses.userId, id)),
    db.select().from(schema.quoteRequests).where(eq(schema.quoteRequests.userId, id)).orderBy(desc(schema.quoteRequests.createdAt)),
  ]);
  if (!u) notFound();
  const spent = orders.filter((o) => !o.isDemo && ["paid", "preparing", "shipped", "delivered"].includes(o.status)).reduce((a, o) => a + o.totalCents, 0);
  return (
    <>
      <AdminHeader title={fullName(u) || u.email} back={{ href: "/admin/clients", label: "clients" }} intro={<span className="flex flex-wrap gap-2"><Badge tone="info">{ROLE_LABELS[u.role]}</Badge>{u.id === me.id && <Badge tone="muted">Votre compte</Badge>}</span>} />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel title="Commandes" description={`Total payé hors démonstration : ${fmtEuros(spent)}`}>
            <DataTable
              rows={orders}
              rowKey={(o) => o.id}
              caption="Commandes du client"
              empty="Aucune commande liée à ce compte."
              columns={[
                { key: "n", header: "Numéro", cell: (o) => <Link href={`/admin/commandes/${o.id}`} className="underline underline-offset-2">{o.number}</Link> },
                { key: "d", header: "Date", cell: (o) => fmtDateTime(o.createdAt) },
                { key: "s", header: "Statut", cell: (o) => <span className="flex gap-1"><Badge tone={ORDER_STATUS_TONE[o.status]}>{STATUS_LABELS[o.status]}</Badge>{o.isDemo && <Badge tone="muted">Démo</Badge>}</span> },
                { key: "t", header: "Total", align: "right", cell: (o) => fmtEuros(o.totalCents) },
              ]}
            />
          </Panel>
          <Panel title="Adresses">
            {addresses.length === 0 ? (
              <EmptyState>Aucune adresse enregistrée.</EmptyState>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {addresses.map((a) => (
                  <li key={a.id} className="rounded-[2px] border border-line p-3 text-sm">
                    <p className="mb-1 font-medium">{a.label ?? "Adresse"} {a.isDefault && <Badge tone="muted">Par défaut</Badge>}</p>
                    <address className="not-italic leading-relaxed text-ink-soft">
                      {fullName(a)}{a.company && <><br />{a.company}</>}<br />{a.line1}{a.line2 && <><br />{a.line2}</>}<br />{a.postalCode} {a.city}<br />{countryName(a.country)}{a.phone && <><br />Tél. {a.phone}</>}
                    </address>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          {quotes.length > 0 && (
            <Panel title="Demandes de devis">
              <ul className="space-y-1 text-sm">
                {quotes.map((q) => (
                  <li key={q.id}><Link href={`/admin/devis/${q.id}`} className="underline underline-offset-2">{q.reference}</Link> · {q.company} · {QUOTE_STATUS[q.status]}</li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
        <div className="space-y-6">
          <Panel title="Compte">
            <DefList
              items={[
                ["Email", u.email],
                ["Téléphone", u.phone ?? "—"],
                ["Inscription", fmtDate(u.createdAt)],
                ["Dernière connexion", fmtDateTime(u.lastLoginAt)],
                ["Communications", u.marketingConsent ? "Accepte les communications commerciales" : "Non"],
              ]}
            />
          </Panel>
          <Panel title="Rôle">
            <RoleForm id={u.id} role={u.role} self={u.id === me.id} />
          </Panel>
          <Panel title="Compte professionnel" description="Société et numéro de TVA, utilisés pour les devis et la facturation professionnelle. Attribuez le rôle « Professionnel » pour l'accès aux services B2B.">
            <ProForm id={u.id} company={u.company} vatNumber={u.vatNumber} />
          </Panel>
        </div>
      </div>
    </>
  );
}
