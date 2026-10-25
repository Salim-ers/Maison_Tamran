import Link from "next/link";
import { and, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import { adminPage, sp, type SearchParams } from "../guard";
import { AdminHeader, Badge, DataTable, FilterTabs, Pagination } from "@/components/admin/ui";
import { fmtDate, fullName } from "@/components/admin/format";
import { ROLE_LABELS } from "@/components/admin/labels";
import { btnPrimary, inputCls } from "@/components/admin/styles";

export const instant = false;
export const metadata = { title: "Clients" };
const PER_PAGE = 30;

export default async function CustomersPage({ searchParams }: { searchParams: SearchParams }) {
  await adminPage();
  const q = await searchParams;
  const role = ["customer", "pro", "admin"].includes(sp(q.role)) ? (sp(q.role) as "customer" | "pro" | "admin") : "";
  const search = sp(q.q).trim().slice(0, 100);
  const page = Math.max(1, Number.parseInt(sp(q.page), 10) || 1);
  const conds: SQL[] = [];
  if (role) conds.push(eq(schema.users.role, role));
  if (search) {
    const like = `%${search.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    conds.push(or(ilike(schema.users.email, like), ilike(schema.users.lastName, like), ilike(schema.users.firstName, like), ilike(schema.users.company, like))!);
  }
  const where = conds.length ? and(...conds) : undefined;
  const orderCount = sql<number>`(select count(*)::int from ${schema.orders} where ${schema.orders.userId} = ${schema.users.id})`;
  const [rows, [total], roleCounts] = await Promise.all([
    db
      .select({ id: schema.users.id, email: schema.users.email, firstName: schema.users.firstName, lastName: schema.users.lastName, role: schema.users.role, company: schema.users.company, createdAt: schema.users.createdAt, orders: orderCount })
      .from(schema.users)
      .where(where)
      .orderBy(desc(schema.users.createdAt))
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE),
    db.select({ n: count() }).from(schema.users).where(where),
    db.select({ role: schema.users.role, n: count() }).from(schema.users).groupBy(schema.users.role),
  ]);
  const rc = new Map(roleCounts.map((r) => [r.role, r.n]));
  const all = roleCounts.reduce((a, r) => a + r.n, 0);
  const href = (r: string, p = 1) => {
    const u = new URLSearchParams();
    if (r) u.set("role", r);
    if (search) u.set("q", search);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return `/admin/clients${s ? `?${s}` : ""}`;
  };
  const pages = Math.max(1, Math.ceil((total?.n ?? 0) / PER_PAGE));
  return (
    <>
      <AdminHeader title="Clients" intro="Comptes créés sur le site. Les commandes invitées n'apparaissent pas ici (voir Commandes)." />
      <FilterTabs
        label="Filtrer par rôle"
        current={role}
        items={[
          { value: "", label: "Tous", href: href(""), count: all },
          { value: "customer", label: "Clients", href: href("customer"), count: rc.get("customer") ?? 0 },
          { value: "pro", label: "Professionnels", href: href("pro"), count: rc.get("pro") ?? 0 },
          { value: "admin", label: "Administrateurs", href: href("admin"), count: rc.get("admin") ?? 0 },
        ]}
      />
      <form method="get" className="mb-4 flex max-w-xl gap-2" role="search">
        {role && <input type="hidden" name="role" value={role} />}
        <label htmlFor="c-q" className="sr-only">Rechercher un client</label>
        <input id="c-q" name="q" type="search" defaultValue={search} placeholder="Email, nom ou société" className={inputCls} />
        <button className={btnPrimary}>Rechercher</button>
      </form>
      <DataTable
        rows={rows}
        rowKey={(u) => u.id}
        caption="Comptes clients"
        empty="Aucun compte ne correspond."
        columns={[
          { key: "e", header: "Email", cell: (u) => <Link href={`/admin/clients/${u.id}`} className="font-medium underline decoration-ink/25 underline-offset-[3px] hover:decoration-ink">{u.email}</Link> },
          { key: "n", header: "Nom", cell: (u) => fullName(u) || <span className="text-ink-soft">—</span> },
          { key: "r", header: "Rôle", cell: (u) => <Badge tone={u.role === "admin" ? "info" : u.role === "pro" ? "success" : "muted"}>{ROLE_LABELS[u.role]}</Badge> },
          { key: "s", header: "Société", cell: (u) => u.company ?? <span className="text-ink-soft">—</span> },
          { key: "d", header: "Inscription", cell: (u) => fmtDate(u.createdAt) },
          { key: "o", header: "Commandes", align: "right", cell: (u) => u.orders },
        ]}
      />
      <Pagination page={Math.min(page, pages)} pages={pages} hrefFor={(p) => href(role, p)} />
    </>
  );
}
