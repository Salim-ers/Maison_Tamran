import Link from "next/link";
import { db, schema } from "@/db";
import { CONTENT_ENTRIES } from "@/content";
import { adminPage } from "../guard";
import { AdminHeader, Badge, EmptyState, Panel } from "@/components/admin/ui";
import { ContentForm } from "@/components/admin/site-forms";
import { fmtDateTime } from "@/components/admin/format";

export const instant = false;
export const metadata = { title: "Contenu éditorial" };

export default async function ContentPage() {
  await adminPage();
  const rows = await db.select().from(schema.contentBlocks);
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const pages = [...new Set(CONTENT_ENTRIES.map((e) => e.page))];
  return (
    <>
      <AdminHeader
        title="Contenu éditorial"
        intro="Textes des pages du site. Les modifications sont publiées immédiatement. Rédigez au vouvoiement, sans rien inventer (histoire, récompenses, labels, provenance)."
      />
      {CONTENT_ENTRIES.length === 0 ? (
        <EmptyState>Aucun bloc éditable n&apos;est déclaré dans le registre de contenu.</EmptyState>
      ) : (
        <>
          <nav aria-label="Blocs de contenu" className="mb-6 rounded-[2px] border border-line bg-cream p-4 text-sm">
            <ul className="columns-1 gap-6 sm:columns-2 xl:columns-3">
              {CONTENT_ENTRIES.map((e) => (
                <li key={e.key} className="mb-1 break-inside-avoid">
                  <a href={`#c-${e.key.replace(/\W/g, "-")}`} className="underline decoration-ink/25 underline-offset-2 hover:decoration-ink">{e.label}</a>
                  {byKey.has(e.key) && <span className="text-xs text-ink-soft"> · modifié</span>}
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-6">
            {pages.map((page) => (
              <div key={page} className="space-y-6">
                {CONTENT_ENTRIES.filter((e) => e.page === page).map((e) => {
                  const row = byKey.get(e.key);
                  const values = { ...(e.defaults as Record<string, string>), ...(row?.value ?? {}) };
                  return (
                    <Panel
                      key={e.key}
                      id={`c-${e.key.replace(/\W/g, "-")}`}
                      title={e.label}
                      description={
                        <span>
                          Page <Link href={e.page} target="_blank" rel="noopener" className="underline underline-offset-2">{e.page}</Link>
                          {row ? ` · modifié le ${fmtDateTime(row.updatedAt)}` : " · texte par défaut"}
                        </span>
                      }
                      actions={row ? <Badge tone="info">Personnalisé</Badge> : <Badge tone="muted">Par défaut</Badge>}
                    >
                      <ContentForm entryKey={e.key} fields={e.fields} values={values} customized={!!row} />
                    </Panel>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
