import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { count, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { storeMode, emailProvider } from "@/lib/env";
import { AdminNav, type NavGroup } from "@/components/admin/nav";
import { Skeleton } from "@/components/admin/ui";
import { btnGhost } from "@/components/admin/styles";
import { adminLogout } from "@/app/actions/admin/session";
import { fullName } from "@/components/admin/format";

// Back-office entièrement dynamique (lecture de session) : la navigation peut bloquer sur le serveur.
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Administration MAISON TAMRĀN" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connection(); // requireAdmin compare l'expiration de session à l'heure courante
  const user = await requireAdmin();
  const [[quotes], [testimonials], [messages]] = await Promise.all([
    db.select({ n: count() }).from(schema.quoteRequests).where(eq(schema.quoteRequests.status, "new")),
    db.select({ n: count() }).from(schema.testimonials).where(eq(schema.testimonials.status, "pending")),
    db.select({ n: count() }).from(schema.contactMessages).where(eq(schema.contactMessages.handled, false)),
  ]);
  const mode = storeMode();

  const groups: NavGroup[] = [
    { label: "Pilotage", items: [{ href: "/admin", label: "Tableau de bord" }, { href: "/admin/commandes", label: "Commandes" }, { href: "/admin/stock", label: "Stock" }] },
    {
      label: "Catalogue",
      items: [
        { href: "/admin/produits", label: "Produits" },
        { href: "/admin/collections", label: "Collections" },
        { href: "/admin/coffrets", label: "Coffrets" },
      ],
    },
    {
      label: "Ventes",
      items: [
        { href: "/admin/promotions", label: "Codes promotionnels" },
        { href: "/admin/livraison", label: "Livraison" },
        { href: "/admin/devis", label: "Devis B2B", count: quotes?.n },
        { href: "/admin/devis/tarifs", label: "Tarifs dégressifs" },
      ],
    },
    {
      label: "Relation client",
      items: [
        { href: "/admin/clients", label: "Clients" },
        { href: "/admin/messages", label: "Messages", count: messages?.n },
        { href: "/admin/temoignages", label: "Témoignages", count: testimonials?.n },
        { href: "/admin/newsletter", label: "Newsletter" },
        { href: "/admin/emails", label: "Emails envoyés" },
      ],
    },
    { label: "Site", items: [{ href: "/admin/contenu", label: "Contenu éditorial" }, { href: "/admin/reglages", label: "Réglages" }] },
  ];

  const brand = (
    <Link href="/admin" className="flex items-baseline gap-2">
      <span className="font-display text-xl tracking-[0.2em]">MAISON TAMRĀN</span>
      <span className="text-xs text-ink-soft">Administration</span>
    </Link>
  );

  const footer = (
    <div className="space-y-3 text-sm">
      <p className="truncate text-ink-soft" title={user.email}>
        {fullName(user) || user.email}
      </p>
      <div className="flex flex-wrap gap-1">
        <Link href="/" className={btnGhost} target="_blank" rel="noopener">
          Voir le site
        </Link>
        <form action={adminLogout}>
          <button type="submit" className={btnGhost}>
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-ivory text-[0.9375rem] lg:flex">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-cream focus:px-4 focus:py-2">
        Aller au contenu
      </a>
      <AdminNav groups={groups} footer={footer} brand={brand} />
      <div className="min-w-0 flex-1">
        <div
          className={
            mode === "demo"
              ? "flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-pistachio/30 bg-pistachio px-4 py-2 text-[0.8125rem] text-cream sm:px-8"
              : "flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line bg-chocolate px-4 py-2 text-[0.8125rem] text-ivory sm:px-8"
          }
        >
          <strong className="font-semibold">{mode === "demo" ? "Mode démonstration" : "Paiements réels Stripe"}</strong>
          <span className={mode === "demo" ? "text-cream/90" : "text-taupe"}>
            {mode === "demo"
              ? "Aucun paiement n'est encaissé ; les commandes sont simulées et marquées « démo »."
              : "Les commandes passées sur le site sont encaissées via Stripe."}
            {emailProvider() === "log" ? " Emails : journalisés uniquement (RESEND_API_KEY absente)." : ""}
          </span>
        </div>
        <main id="admin-main" className="mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-8 lg:py-10">
          <Suspense fallback={<Skeleton />}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
