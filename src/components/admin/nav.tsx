"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

export interface NavGroup {
  label: string;
  items: { href: string; label: string; count?: number }[];
}

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/devis") return pathname === "/admin/devis" || (/^\/admin\/devis\/[^/]+/.test(pathname) && !pathname.startsWith("/admin/devis/tarifs"));
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Navigation latérale du back-office ; repliable sous forme de tiroir sur mobile. */
export function AdminNav({ groups, footer, brand }: { groups: NavGroup[]; footer: React.ReactNode; brand: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const nav = (
    <nav aria-label="Administration" className="flex-1 overflow-y-auto px-3 pb-6">
      {groups.map((g) => (
        <div key={g.label} className="mt-5 first:mt-2">
          <p className="px-3 pb-1.5 text-xs font-semibold text-ink-soft">{g.label}</p>
          <ul>
            {g.items.map((i) => {
              const active = isActive(pathname, i.href);
              return (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "flex min-h-9 items-center justify-between gap-2 border-l-2 px-3 text-sm transition-colors",
                      active ? "border-bronze bg-ivory font-semibold text-ink" : "border-transparent text-ink-soft hover:bg-ivory/70 hover:text-ink"
                    )}
                  >
                    <span>{i.label}</span>
                    {!!i.count && (
                      <span className="min-w-5 rounded-full bg-chocolate px-1.5 text-center text-[0.7rem] font-semibold leading-5 text-ivory tabular-nums">
                        {i.count}
                        <span className="sr-only"> à traiter</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Barre mobile */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-cream px-4 lg:hidden">
        {brand}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-sidebar"
          className="inline-flex min-h-9 items-center gap-2 rounded-[2px] border border-line px-3 text-sm"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            {open ? <path d="M5 5l14 14M19 5 5 19" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
          {open ? "Fermer" : "Menu"}
        </button>
      </div>
      {open && <div className="fixed inset-0 z-40 bg-chocolate/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
      <aside
        id="admin-sidebar"
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-cream transition-transform duration-300 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center px-6">{brand}</div>
        {nav}
        <div className="shrink-0 border-t border-line px-4 py-4">{footer}</div>
      </aside>
    </>
  );
}
