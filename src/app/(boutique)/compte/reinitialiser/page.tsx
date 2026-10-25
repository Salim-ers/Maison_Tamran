import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/account/auth-shell";
import { ResetForm } from "@/components/account/forms";

export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false } };

async function Form({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const t = typeof sp.t === "string" ? sp.t : "";
  if (!t) return <p>Ce lien est incomplet. <Link href="/compte/mot-de-passe-oublie" className="link-draw">Faire une nouvelle demande</Link>.</p>;
  return <ResetForm token={t} />;
}

export default function ResetPage({ searchParams }: PageProps<"/compte/reinitialiser">) {
  return (
    <AuthShell title="Nouveau mot de passe" crumb={{ href: "/compte/reinitialiser", label: "Nouveau mot de passe" }}>
      <Suspense fallback={<div className="h-64" aria-busy />}><Form searchParams={searchParams} /></Suspense>
    </AuthShell>
  );
}
