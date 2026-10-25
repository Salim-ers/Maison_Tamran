import Link from "next/link";
import { clsx } from "clsx";
import type { Tone } from "./labels";

/** En-tête d'écran d'administration. */
export function AdminHeader({
  title, intro, actions, back,
}: {
  title: string;
  intro?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-2 inline-block text-sm text-ink-soft hover:text-ink hover:underline underline-offset-2">
            Retour : {back.label}
          </Link>
        )}
        <h1 className="font-display text-[clamp(1.75rem,2.6vw,2.4rem)] leading-tight">{title}</h1>
        {intro && <div className="mt-2 max-w-3xl text-sm text-ink-soft">{intro}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

const TONES: Record<Tone, string> = {
  neutral: "border-ink/20 text-ink",
  success: "border-success/40 bg-success/8 text-success",
  warning: "border-[#8a5a1c]/40 bg-[#8a5a1c]/8 text-[#7a4f16]",
  danger: "border-danger/40 bg-danger/8 text-danger",
  info: "border-chocolate/30 bg-chocolate/5 text-chocolate",
  muted: "border-ink/15 text-ink-soft",
};

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[0.72rem] font-medium leading-4", TONES[tone], className)}>
      {children}
    </span>
  );
}

/** Bloc de contenu à fond crème. */
export function Panel({
  title, description, children, className, actions, id,
}: {
  title?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  id?: string;
}) {
  const hid = id ? `${id}-t` : undefined;
  return (
    <section id={id} aria-labelledby={title ? hid : undefined} className={clsx("rounded-[2px] border border-line bg-cream p-5 sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 id={hid} className="font-display text-xl leading-snug">{title}</h2>}
            {description && <div className="mt-1 text-sm text-ink-soft">{description}</div>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="rounded-[2px] border border-line bg-cream p-4 sm:p-5">
      <p className="text-[0.8125rem] text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-[1.9rem] leading-tight tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}

/** Tableau de données dense, défilable horizontalement sur mobile. */
export function DataTable<T>({
  columns, rows, rowKey, empty, caption, dense,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: React.ReactNode;
  caption?: string;
  dense?: boolean;
}) {
  if (!rows.length) return <EmptyState>{empty ?? "Aucun élément."}</EmptyState>;
  return (
    <div className="overflow-x-auto rounded-[2px] border border-line bg-cream">
      <table className="w-full border-collapse text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-line bg-ivory/60 text-left">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={clsx("whitespace-nowrap px-3 py-2.5 text-[0.78rem] font-semibold text-ink-soft", c.align === "right" && "text-right", c.align === "center" && "text-center", c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className="border-b border-line last:border-b-0 hover:bg-ivory/50">
              {columns.map((c) => (
                <td key={c.key} className={clsx("px-3 align-middle", dense ? "py-1.5" : "py-2.5", c.align === "right" && "text-right tabular-nums", c.align === "center" && "text-center", c.className)}>
                  {c.cell(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-[2px] border border-dashed border-ink/20 bg-cream/60 px-5 py-8 text-center text-sm text-ink-soft">
      <div>{children}</div>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Notice({ children, tone = "info", title, className }: { children: React.ReactNode; tone?: "info" | "warning" | "danger" | "success"; title?: string; className?: string }) {
  const map = {
    info: "border-chocolate/30 bg-ivory",
    warning: "border-[#8a5a1c]/50 bg-[#8a5a1c]/6",
    danger: "border-danger/50 bg-danger/5",
    success: "border-success/50 bg-success/5",
  } as const;
  return (
    <div role={tone === "danger" || tone === "warning" ? "note" : undefined} className={clsx("border-l-2 px-4 py-3 text-sm", map[tone], className)}>
      {title && <p className="mb-0.5 font-semibold">{title}</p>}
      <div className="text-ink-soft [&_strong]:text-ink">{children}</div>
    </div>
  );
}

/** Liste de définitions (détails d'une commande, d'un devis…). */
export function DefList({ items, className }: { items: [string, React.ReactNode][]; className?: string }) {
  return (
    <dl className={clsx("grid grid-cols-[minmax(7rem,auto)_1fr] gap-x-4 gap-y-2 text-sm", className)}>
      {items.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-ink-soft">{k}</dt>
          <dd className="min-w-0 break-words">{v ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Pagination({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (p: number) => string }) {
  if (pages <= 1) return null;
  const link = "inline-flex min-h-9 items-center rounded-[2px] border border-line bg-cream px-3 text-sm hover:border-chocolate";
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3 text-sm">
      <span className="text-ink-soft">Page {page} sur {pages}</span>
      <div className="flex gap-2">
        {page > 1 ? <Link className={link} href={hrefFor(page - 1)} rel="prev">Page précédente</Link> : <span className={clsx(link, "opacity-40")} aria-disabled="true">Page précédente</span>}
        {page < pages ? <Link className={link} href={hrefFor(page + 1)} rel="next">Page suivante</Link> : <span className={clsx(link, "opacity-40")} aria-disabled="true">Page suivante</span>}
      </div>
    </nav>
  );
}

/** Onglets de filtre sous forme de liens (état dans l'URL). */
export function FilterTabs({ items, current, label }: { items: { value: string; label: string; href: string; count?: number }[]; current: string; label: string }) {
  return (
    <nav aria-label={label} className="mb-4 flex flex-wrap gap-1.5">
      {items.map((i) => (
        <Link
          key={i.value}
          href={i.href}
          aria-current={i.value === current ? "page" : undefined}
          className={clsx(
            "inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors",
            i.value === current ? "border-chocolate bg-chocolate text-ivory" : "border-line bg-cream hover:border-chocolate"
          )}
        >
          {i.label}
          {i.count != null && <span className={clsx("tabular-nums text-xs", i.value === current ? "text-taupe" : "text-ink-soft")}>{i.count}</span>}
        </Link>
      ))}
    </nav>
  );
}

export function TextLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={clsx("font-medium underline decoration-ink/25 underline-offset-[3px] hover:decoration-ink", className)}>
      {children}
    </Link>
  );
}

export function Skeleton({ lines = 6 }: { lines?: number }) {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-3">
      <span className="sr-only">Chargement…</span>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-[2px] bg-taupe/25" />
      ))}
    </div>
  );
}
