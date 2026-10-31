import type { Metadata } from "next";
import Link from "@/components/motion/transition-link";
import { Suspense } from "react";
import { AuthShell } from "@/components/account/auth-shell";
import { RegisterForm } from "@/components/account/forms";

export const metadata: Metadata = { title: "Créer un compte", robots: { index: false } };

async function Form({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <RegisterForm next={typeof sp.suite === "string" ? sp.suite : "/compte"} />;
}

export default function InscriptionPage({ searchParams }: PageProps<"/compte/inscription">) {
  return (
    <AuthShell title="Créer un compte" intro="Un compte n'est pas obligatoire pour commander, mais il garde la trace de vos commandes et de vos adresses." crumb={{ href: "/compte/inscription", label: "Inscription" }}>
      <Suspense fallback={<div className="h-96" aria-busy />}><Form searchParams={searchParams} /></Suspense>
      <p className="mt-10 border-t hairline pt-6 t-small">Déjà client&nbsp;? <Link href="/compte/connexion" className="link-draw">Se connecter</Link></p>
    </AuthShell>
  );
}
