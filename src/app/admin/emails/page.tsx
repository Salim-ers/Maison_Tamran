import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { emailProvider } from "@/lib/env";
import { adminPage, sp, type SearchParams } from "../guard";
import { AdminHeader, Badge, DataTable, Notice, Pagination, Panel } from "@/components/admin/ui";
import { fmtDateTime } from "@/components/admin/format";

export const instant = false;
export const metadata = { title: "Emails envoyés" };
const PER_PAGE = 30;

export default async function EmailsPage({ searchParams }: { searchParams: SearchParams }) {
  await adminPage();
  const q = await searchParams;
  const page = Math.max(1, Number.parseInt(sp(q.page), 10) || 1);
  const selected = z.uuid().safeParse(sp(q.voir)).success ? sp(q.voir) : null;
  const [rows, [total], preview] = await Promise.all([
    db
      .select({ id: schema.emailLog.id, to: schema.emailLog.to, subject: schema.emailLog.subject, template: schema.emailLog.template, status: schema.emailLog.status, error: schema.emailLog.error, createdAt: schema.emailLog.createdAt })
      .from(schema.emailLog)
      .orderBy(desc(schema.emailLog.createdAt))
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE),
    db.select({ n: count() }).from(schema.emailLog),
    selected ? db.select().from(schema.emailLog).where(eq(schema.emailLog.id, selected)).limit(1) : Promise.resolve([]),
  ]);
  const pages = Math.max(1, Math.ceil((total?.n ?? 0) / PER_PAGE));
  const mail = preview[0];
  const href = (p: number, voir?: string) => {
    const u = new URLSearchParams();
    if (p > 1) u.set("page", String(p));
    if (voir) u.set("voir", voir);
    const s = u.toString();
    return `/admin/emails${s ? `?${s}` : ""}`;
  };
  return (
    <>
      <AdminHeader title="Emails envoyés" intro="Journal de tous les emails transactionnels (confirmations, changements de statut, newsletter…)." />
      {emailProvider() === "log" ? (
        <Notice tone="warning" className="mb-6" title="Aucun email n'est réellement envoyé">
          La variable RESEND_API_KEY n&apos;est pas configurée : les emails sont seulement journalisés ici (statut « Journalisé »). Configurez Resend pour les envoyer aux destinataires.
        </Notice>
      ) : (
        <Notice className="mb-6">Envoi via Resend. Un email « Échec » n&apos;a pas été remis ; le détail de l&apos;erreur est indiqué.</Notice>
      )}
      <div className={mail ? "grid gap-6 2xl:grid-cols-[1fr_1fr]" : ""}>
        <div>
          <DataTable
            rows={rows}
            rowKey={(r) => r.id}
            caption="Journal des emails"
            empty="Aucun email pour l'instant."
            columns={[
              { key: "d", header: "Date", cell: (r) => <span className="whitespace-nowrap">{fmtDateTime(r.createdAt)}</span> },
              { key: "to", header: "Destinataire", cell: (r) => <span className="break-all">{r.to}</span> },
              { key: "s", header: "Sujet", cell: (r) => <Link href={href(page, r.id)} className="underline decoration-ink/25 underline-offset-2 hover:decoration-ink" aria-current={r.id === selected ? "true" : undefined}>{r.subject}</Link> },
              {
                key: "st",
                header: "Statut",
                cell: (r) => (
                  <span title={r.error ?? undefined}>
                    {r.status === "sent" ? <Badge tone="success">Envoyé</Badge> : r.status === "failed" ? <Badge tone="danger">Échec</Badge> : <Badge tone="muted">Journalisé</Badge>}
                  </span>
                ),
              },
            ]}
          />
          <Pagination page={Math.min(page, pages)} pages={pages} hrefFor={(p) => href(p)} />
        </div>
        {mail && (
          <Panel title="Aperçu" description={<>{mail.subject} · à {mail.to} · modèle « {mail.template} »</>} actions={<Link href={href(page)} className="text-sm underline underline-offset-2">Fermer l&apos;aperçu</Link>}>
            {mail.error && <Notice tone="danger" className="mb-3">Erreur : {mail.error}</Notice>}
            <iframe title={`Aperçu de l'email : ${mail.subject}`} srcDoc={mail.html} sandbox="" className="h-[70vh] w-full rounded-[2px] border border-line bg-white" />
          </Panel>
        )}
      </div>
    </>
  );
}
