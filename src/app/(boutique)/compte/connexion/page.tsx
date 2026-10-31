import type { Metadata } from "next";
import Link from "@/components/motion/transition-link";
import { Suspense } from "react";
import { AuthShell } from "@/components/account/auth-shell";
import { LoginForm } from "@/components/account/forms";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

async function Next({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = typeof sp.suite === "string" ? sp.suite : "/compte";
  return (
    <>
      <LoginForm next={next} />
      <p className="mt-10 border-t hairline pt-6 t-small">
        Première commande&nbsp;? <Link href={`/compte/inscription?suite=${encodeURIComponent(next)}`} className="link-draw">Créer un compte</Link>
      </p>
    </>
  );
}

export default function ConnexionPage({ searchParams }: PageProps<"/compte/connexion">) {
  return (
    <AuthShell title="Se connecter" intro="Retrouvez vos commandes, leur suivi et vos adresses." crumb={{ href: "/compte/connexion", label: "Connexion" }}>
      <Suspense fallback={<div className="h-72" aria-busy />}><Next searchParams={searchParams} /></Suspense>
    </AuthShell>
  );
}
