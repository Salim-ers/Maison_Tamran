import { and, count, desc, isNotNull, isNull, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import { adminPage, sp, type SearchParams } from "../guard";
import { AdminHeader, Badge, DataTable, FilterTabs, Notice, Pagination } from "@/components/admin/ui";
import { fmtDateTime } from "@/components/admin/format";
import { btnPrimary } from "@/components/admin/styles";

export const instant = false;
export const metadata = { title: "Newsletter" };
const PER_PAGE = 50;
const t = schema.newsletterSubscribers;

const FILTERS: Record<string, { label: string; where: SQL }> = {
  confirmes: { label: "Confirmés", where: and(isNotNull(t.confirmedAt), isNull(t.unsubscribedAt))! },
  attente: { label: "En attente de confirmation", where: and(isNull(t.confirmedAt), isNull(t.unsubscribedAt))! },
  desinscrits: { label: "Désinscrits", where: isNotNull(t.unsubscribedAt) },
};

export default async function NewsletterPage({ searchParams }: { searchParams: SearchParams }) {
  await adminPage();
  const q = await searchParams;
  const f = FILTERS[sp(q.statut)] ? sp(q.statut) : "confirmes";
  const page = Math.max(1, Number.parseInt(sp(q.page), 10) || 1);
  const [rows, [total], ...counts] = await Promise.all([
    db.select({ id: t.id, email: t.email, consentAt: t.consentAt, confirmedAt: t.confirmedAt, unsubscribedAt: t.unsubscribedAt, source: t.source }).from(t).where(FILTERS[f].where).orderBy(desc(t.consentAt)).limit(PER_PAGE).offset((page - 1) * PER_PAGE),
    db.select({ n: count() }).from(t).where(FILTERS[f].where),
    ...Object.values(FILTERS).map((x) => db.select({ n: count() }).from(t).where(x.where)),
  ]);
  const pages = Math.max(1, Math.ceil((total?.n ?? 0) / PER_PAGE));
  return (
    <>
      <AdminHeader
        title="Newsletter"
        intro="Inscriptions en double opt-in : seuls les abonnés ayant confirmé leur adresse peuvent recevoir la lettre."
        actions={<a href="/admin/newsletter/export" className={btnPrimary} download>Exporter les confirmés (CSV)</a>}
      />
      <Notice className="mb-6">L&apos;export contient l&apos;email, la date et le texte du consentement : conservez-le comme preuve du consentement et ne l&apos;utilisez que pour la lettre TAMBRÉ.</Notice>
      <FilterTabs label="Filtrer les abonnés" current={f} items={Object.entries(FILTERS).map(([k, v], i) => ({ value: k, label: v.label, href: `/admin/newsletter?statut=${k}`, count: counts[i][0]?.n ?? 0 }))} />
      <DataTable
        rows={rows}
        rowKey={(r) => r.id}
        caption="Abonnés à la newsletter"
        empty="Aucun abonné dans cette catégorie."
        columns={[
          { key: "e", header: "Email", cell: (r) => <span className="break-all">{r.email}</span> },
          { key: "s", header: "Statut", cell: (r) => (r.unsubscribedAt ? <Badge tone="muted">Désinscrit</Badge> : r.confirmedAt ? <Badge tone="success">Confirmé</Badge> : <Badge tone="warning">En attente</Badge>) },
          { key: "c", header: "Consentement", cell: (r) => fmtDateTime(r.consentAt) },
          { key: "cf", header: "Confirmation", cell: (r) => fmtDateTime(r.confirmedAt) },
          { key: "u", header: "Désinscription", cell: (r) => fmtDateTime(r.unsubscribedAt) },
          { key: "src", header: "Origine", cell: (r) => r.source ?? "—" },
        ]}
      />
      <Pagination page={Math.min(page, pages)} pages={pages} hrefFor={(p) => `/admin/newsletter?statut=${f}${p > 1 ? `&page=${p}` : ""}`} />
    </>
  );
}
