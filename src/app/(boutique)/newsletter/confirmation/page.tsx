import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { sha256 } from "@/lib/auth";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "Confirmation d'inscription",
  robots: { index: false },
};

type Result = "ok" | "already" | "invalid";

async function confirm(email: string, token: string): Promise<Result> {
  if (!email || !token || token.length > 100 || email.length > 200) return "invalid";
  const [sub] = await db.select().from(schema.newsletterSubscribers).where(eq(schema.newsletterSubscribers.email, email.trim().toLowerCase())).limit(1);
  if (!sub) return "invalid";
  if (sub.confirmedAt && !sub.unsubscribedAt && !sub.confirmToken) return "already";
  if (!sub.confirmToken || sub.confirmToken !== sha256(token)) return sub.confirmedAt && !sub.unsubscribedAt ? "already" : "invalid";
  await db
    .update(schema.newsletterSubscribers)
    .set({ confirmedAt: new Date(), unsubscribedAt: null, confirmToken: null })
    .where(and(eq(schema.newsletterSubscribers.id, sub.id), eq(schema.newsletterSubscribers.confirmToken, sub.confirmToken)));
  return "ok";
}

const MESSAGES: Record<Result, { title: string; body: string }> = {
  ok: { title: "Inscription confirmée", body: "Merci. Vous recevrez la lettre de TAMBRÉ : les nouvelles recettes, les éditions éphémères avant leur mise en ligne et les dates à retenir pour offrir. Vous pourrez vous désinscrire à tout moment depuis chaque email." },
  already: { title: "Adresse déjà confirmée", body: "Votre inscription à la lettre de TAMBRÉ est déjà active. Vous n'avez rien d'autre à faire." },
  invalid: { title: "Ce lien n'est plus valide", body: "Le lien de confirmation est incomplet, a déjà servi ou a été remplacé par un lien plus récent. Inscrivez-vous de nouveau depuis le pied de l'accueil : un nouvel email vous sera envoyé." },
};

async function Outcome({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const result = await confirm(typeof sp.email === "string" ? sp.email : "", typeof sp.t === "string" ? sp.t : "");
  const m = MESSAGES[result];
  return (
    <div role="status" className={result === "invalid" ? "border-l-2 border-danger pl-6" : "border-l-2 border-bronze pl-6"}>
      <h2 className="t-display-m">{m.title}</h2>
      <p className="mt-5 max-w-[52ch] t-lead text-ink-soft">{m.body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/creations" className="btn btn-primary">Découvrir les créations</Link>
        {result === "invalid" && <Link href="/#nl-title" className="btn btn-outline">M&apos;inscrire de nouveau</Link>}
      </div>
    </div>
  );
}

export default function NewsletterConfirmationPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <>
      <PageIntro title="La lettre de TAMBRÉ" crumbs={[{ href: "/newsletter/confirmation", label: "Confirmation d'inscription" }]} />
      <div className="container-luxe pb-[var(--section)]">
        <Suspense fallback={<p className="t-lead text-ink-soft" role="status">Vérification de votre lien…</p>}>
          <Outcome searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
