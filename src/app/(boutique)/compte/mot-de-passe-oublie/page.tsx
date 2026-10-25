import type { Metadata } from "next";
import { AuthShell } from "@/components/account/auth-shell";
import { ForgotForm } from "@/components/account/forms";

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default function ForgotPage() {
  return (
    <AuthShell title="Mot de passe oublié" intro="Indiquez l'email de votre compte : nous vous envoyons un lien valable une heure." crumb={{ href: "/compte/mot-de-passe-oublie", label: "Mot de passe oublié" }}>
      <ForgotForm />
    </AuthShell>
  );
}
