import Link from "next/link";
import { clsx } from "clsx";
import { siteUrl } from "@/lib/env";
import { JsonLd } from "@/components/seo/json-ld";

export interface Crumb {
  href: string;
  label: string;
}

/** Fil d'Ariane visible + données structurées BreadcrumbList. */
export function Breadcrumbs({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "dark" }) {
  const all = [{ href: "/", label: "Accueil" }, ...items];
  return (
    <>
      <nav aria-label="Fil d'Ariane" className={clsx("t-micro", tone === "dark" ? "text-taupe" : "text-ink-soft")}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden>/</span>}
              {i === all.length - 1 ? (
                <span aria-current="page">{c.label}</span>
              ) : (
                <Link href={c.href} className="hover:underline underline-offset-2">{c.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: `${siteUrl()}${c.href}` })),
        }}
      />
    </>
  );
}

/**
 * En-tête de page standard (pages éditoriales, catalogue, service client).
 * Gère l'espace sous l'en-tête fixe et le bandeau de démonstration.
 */
export function PageIntro({
  title, intro, crumbs, children, tone = "light", align = "left", className,
}: {
  title: string;
  intro?: React.ReactNode;
  crumbs: Crumb[];
  children?: React.ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <header className={clsx(tone === "dark" ? "on-dark" : "", "pb-[clamp(3rem,7vw,6rem)] pt-[calc(var(--header-h)+var(--banner-h)+clamp(2.5rem,6vw,5rem))]", className)}>
      <div className={clsx("container-luxe", align === "center" && "text-center")}>
        <div className={clsx(align === "center" && "flex justify-center")}><Breadcrumbs items={crumbs} tone={tone} /></div>
        <h1 className={clsx("mt-6 t-display-l", align === "center" ? "mx-auto max-w-[16ch]" : "max-w-[18ch]")}>{title}</h1>
        {intro && <div className={clsx("mt-6 max-w-[56ch] t-lead", tone === "dark" ? "text-taupe" : "text-ink-soft", align === "center" && "mx-auto")}>{intro}</div>}
        {children}
      </div>
    </header>
  );
}

/** Mise en forme des contenus longs (pages légales, FAQ, savoir-faire). */
export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "max-w-[68ch] [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-14 [&_h2]:t-title [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_li]:mt-2 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-4 [&_strong]:font-semibold [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_table]:mt-6 [&_table]:w-full [&_td]:border-b [&_td]:border-line [&_td]:py-2 [&_td]:pr-4 [&_th]:border-b [&_th]:border-line [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th]:font-semibold",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Encadré signalant une information à valider (donnée provisoire, mention à compléter). */
export function Provisional({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <aside className={clsx("border-l-2 border-bronze bg-cream px-5 py-4 t-small text-ink-soft", className)} role="note">
      {children}
    </aside>
  );
}
