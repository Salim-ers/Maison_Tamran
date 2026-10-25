import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { countryName } from "@/lib/countries";
import { deleteAddress } from "@/app/actions/account";
import { PageIntro } from "@/components/layout/page-intro";
import { AddressForm } from "@/components/account/forms";

export const metadata: Metadata = { title: "Mes adresses", robots: { index: false } };

async function Addresses({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [user, sp] = await Promise.all([requireUser("/compte/adresses"), searchParams]);
  const list = await db.select().from(schema.addresses).where(eq(schema.addresses.userId, user.id)).orderBy(schema.addresses.createdAt);
  const editing = typeof sp.modifier === "string" ? list.find((a) => a.id === sp.modifier) : undefined;
  if (sp.nouvelle === "1" || editing) {
    return <div className="max-w-xl"><h2 className="t-title">{editing ? "Modifier l'adresse" : "Nouvelle adresse"}</h2><div className="mt-6"><AddressForm address={editing} /></div></div>;
  }
  return (
    <div>
      {sp.enregistree === "1" && <p className="mb-6 border-l-2 border-success pl-4 t-small" role="status">Adresse enregistrée.</p>}
      {list.length === 0 ? (
        <p className="text-ink-soft">Aucune adresse enregistrée pour l&apos;instant.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <li key={a.id} className="border hairline bg-cream p-6">
              <p className="font-display text-xl">{a.label ?? `${a.firstName} ${a.lastName}`}{a.isDefault && <span className="ml-2 t-micro text-ink-soft">par défaut</span>}</p>
              <address className="mt-3 not-italic t-small leading-relaxed text-ink-soft">
                {a.firstName} {a.lastName}<br />{a.company && <>{a.company}<br /></>}{a.line1}<br />{a.line2 && <>{a.line2}<br /></>}{a.postalCode} {a.city}<br />{countryName(a.country)}
              </address>
              <div className="mt-5 flex gap-4 t-small">
                <Link href={`/compte/adresses?modifier=${a.id}`} className="link-draw">Modifier</Link>
                <form action={deleteAddress.bind(null, a.id)}><button className="link-draw text-ink-soft">Supprimer</button></form>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-10 flex gap-3">
        <Link href="/compte/adresses?nouvelle=1" className="btn btn-primary">Ajouter une adresse</Link>
        <Link href="/compte" className="btn btn-outline">Retour au compte</Link>
      </div>
    </div>
  );
}

export default function AdressesPage({ searchParams }: PageProps<"/compte/adresses">) {
  return (
    <>
      <PageIntro title="Mes adresses" crumbs={[{ href: "/compte", label: "Compte" }, { href: "/compte/adresses", label: "Adresses" }]} />
      <section className="container-luxe pb-[var(--section)]">
        <Suspense fallback={<div className="h-64" aria-busy />}><Addresses searchParams={searchParams} /></Suspense>
      </section>
    </>
  );
}
