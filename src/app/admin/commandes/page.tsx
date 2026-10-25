import Link from "next/link";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import { STATUS_LABELS } from "@/lib/email";
import { adminPage, sp, type SearchParams } from "../guard";
import { AdminHeader, Badge, DataTable, Pagination } from "@/components/admin/ui";
import { fmtDateTime, fmtEuros, fullName } from "@/components/admin/format";
import { ORDER_STATUS_TONE } from "@/components/admin/labels";
import { btnPrimary, btnSecondary, inputCls, labelCls } from "@/components/admin/styles";

export const instant = false;
export const metadata = { title: "Commandes" };

const PER_PAGE = 25;
const STATUSES = Object.keys(STATUS_LABELS);

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  await adminPage();
  const q = await searchParams;
  const status = STATUSES.includes(sp(q.statut)) ? sp(q.statut) : "";
  const kind = ["reelles", "demo"].includes(sp(q.type)) ? sp(q.type) : "";
  const search = sp(q.q).trim().slice(0, 100);
  const page = Math.max(1, Number.parseInt(sp(q.page), 10) || 1);

  const conds: SQL[] = [];
  if (status) conds.push(eq(schema.orders.status, status as (typeof schema.orders.status.enumValues)[number]));
  if (kind) conds.push(eq(schema.orders.isDemo, kind === "demo"));
  if (search) {
    const like = `%${search.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    conds.push(or(ilike(schema.orders.number, like), ilike(schema.orders.email, like))!);
  }
  const where = conds.length ? and(...conds) : undefined;
  const [rows, [total]] = await Promise.all([
    db.select().from(schema.orders).where(where).orderBy(desc(schema.orders.createdAt)).limit(PER_PAGE).offset((page - 1) * PER_PAGE),
    db.select({ n: count() }).from(schema.orders).where(where),
  ]);
  const pages = Math.max(1, Math.ceil((total?.n ?? 0) / PER_PAGE));
  const hrefFor = (p: number) => {
    const u = new URLSearchParams();
    if (status) u.set("statut", status);
    if (kind) u.set("type", kind);
    if (search) u.set("q", search);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return `/admin/commandes${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <AdminHeader title="Commandes" intro={`${total?.n ?? 0} commande(s) correspondant aux filtres.`} />
      <form method="get" action="/admin/commandes" className="mb-5 grid gap-3 rounded-[2px] border border-line bg-cream p-4 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end" role="search">
        <div>
          <label htmlFor="f-q" className={labelCls}>Numéro ou email</label>
          <input id="f-q" name="q" type="search" defaultValue={search} className={inputCls} placeholder="TB-2026-… ou client@…" />
        </div>
        <div>
          <label htmlFor="f-statut" className={labelCls}>Statut</label>
          <select id="f-statut" name="statut" defaultValue={status} className={inputCls}>
            <option value="">Tous les statuts</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-type" className={labelCls}>Type</label>
          <select id="f-type" name="type" defaultValue={kind} className={inputCls}>
            <option value="">Réelles et démonstration</option>
            <option value="reelles">Réelles uniquement</option>
            <option value="demo">Démonstration uniquement</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className={btnPrimary}>Filtrer</button>
          {(status || kind || search) && <Link href="/admin/commandes" className={btnSecondary}>Effacer</Link>}
        </div>
      </form>
      <DataTable
        rows={rows}
        rowKey={(o) => o.id}
        caption="Commandes"
        empty={status || kind || search ? "Aucune commande ne correspond à ces filtres." : "Aucune commande pour l'instant."}
        columns={[
          { key: "n", header: "Numéro", cell: (o) => <Link href={`/admin/commandes/${o.id}`} className="whitespace-nowrap font-medium underline decoration-ink/25 underline-offset-[3px] hover:decoration-ink">{o.number}</Link> },
          { key: "d", header: "Date", cell: (o) => <span className="whitespace-nowrap">{fmtDateTime(o.createdAt)}</span> },
          { key: "c", header: "Client", cell: (o) => <span><span className="block">{fullName(o.shippingAddress)}</span><span className="text-xs text-ink-soft">{o.email}</span></span> },
          {
            key: "s",
            header: "Statut",
            cell: (o) => (
              <span className="flex flex-wrap gap-1">
                <Badge tone={ORDER_STATUS_TONE[o.status]}>{STATUS_LABELS[o.status]}</Badge>
                {o.isDemo && <Badge tone="muted">Démo</Badge>}
              </span>
            ),
          },
          { key: "l", header: "Livraison", cell: (o) => o.shippingMethod ?? "—" },
          { key: "t", header: "Total", align: "right", cell: (o) => fmtEuros(o.totalCents) },
        ]}
      />
      <Pagination page={Math.min(page, pages)} pages={pages} hrefFor={hrefFor} />
    </>
  );
}
