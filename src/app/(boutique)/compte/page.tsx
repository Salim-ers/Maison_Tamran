import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { STATUS_LABELS } from "@/lib/email";
import { euros } from "@/lib/money";
import { logout } from "@/app/actions/account";
import { PageIntro } from "@/components/layout/page-intro";
import { PasswordForm, ProfileForm } from "@/components/account/forms";

export const metadata: Metadata = { title: "Mon compte", robots: { index: false } };
const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" });

async function Account({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [user, sp] = await Promise.all([requireUser("/compte"), searchParams]);
  const orders = await db.select().from(schema.orders).where(eq(schema.orders.userId, user.id)).orderBy(desc(schema.orders.createdAt)).limit(50);
  return (
    <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr]">
      <section aria-labelledby="orders-t">
        {sp.acces === "refuse" && <p className="mb-6 border-l-2 border-danger pl-4 t-small" role="alert">Cet espace est réservé à l&apos;administration de la boutique.</p>}
        {sp.motdepasse === "modifie" && <p className="mb-6 border-l-2 border-success pl-4 t-small" role="status">Votre mot de passe a été modifié.</p>}
        <h2 id="orders-t" className="t-title">Mes commandes</h2>
        {orders.length === 0 ? (
          <div className="mt-6 border-y hairline py-10">
            <p>Vous n&apos;avez pas encore passé commande.</p>
            <Link href="/creations" className="btn btn-primary mt-5">Découvrir les créations</Link>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-line border-y hairline">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/compte/commandes/${encodeURIComponent(o.number)}`} className="grid grid-cols-[1fr_auto] gap-2 py-5 transition-colors hover:bg-cream sm:grid-cols-[1fr_auto_auto] sm:gap-8 sm:px-2">
                  <span><span className="font-display text-lg">{o.number}</span>{o.isDemo && <span className="ml-2 t-micro text-ink-soft">démonstration</span>}<br /><span className="t-small text-ink-soft">{fmt.format(o.createdAt)}</span></span>
                  <span className="t-small sm:self-center">{STATUS_LABELS[o.status]}</span>
                  <span className="tabular-nums sm:self-center">{euros(o.totalCents)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/compte/adresses" className="btn btn-outline">Mes adresses</Link>
          {user.role === "admin" && <Link href="/admin" className="btn btn-outline">Back-office</Link>}
          <form action={logout}><button className="btn px-3 link-draw [background-size:0_1px] hover:[background-size:100%_1px]">Se déconnecter</button></form>
        </div>
      </section>
      <div className="space-y-14">
        <section aria-labelledby="profile-t"><h2 id="profile-t" className="t-title">Mes informations</h2><div className="mt-6"><ProfileForm user={user} /></div></section>
        <section aria-labelledby="pw-t"><h2 id="pw-t" className="t-title">Mot de passe</h2><div className="mt-6"><PasswordForm /></div></section>
      </div>
    </div>
  );
}

export default function ComptePage({ searchParams }: PageProps<"/compte">) {
  return (
    <>
      <PageIntro title="Mon compte" crumbs={[{ href: "/compte", label: "Compte" }]} />
      <section className="container-luxe pb-[var(--section)]">
        <Suspense fallback={<div className="h-96" aria-busy />}><Account searchParams={searchParams} /></Suspense>
      </section>
    </>
  );
}
