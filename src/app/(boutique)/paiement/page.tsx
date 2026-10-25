import type { Metadata } from "next";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { computeCart, readCartId } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { storeMode } from "@/lib/env";
import { PageIntro } from "@/components/layout/page-intro";
import { CheckoutForm } from "@/components/cart/checkout-form";

export const metadata: Metadata = { title: "Paiement", robots: { index: false } };

async function Checkout() {
  const [user, cartId] = await Promise.all([getCurrentUser(), readCartId()]);
  const [cart, addresses] = await Promise.all([
    computeCart(cartId, { country: "FR" }),
    user ? db.select().from(schema.addresses).where(eq(schema.addresses.userId, user.id)).orderBy(schema.addresses.createdAt) : Promise.resolve([]),
  ]);
  const sorted = [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  return (
    <CheckoutForm
      initial={cart}
      demo={storeMode() === "demo"}
      loggedIn={!!user}
      prefill={{
        email: user?.email,
        firstName: user?.firstName ?? undefined,
        lastName: user?.lastName ?? undefined,
        phone: user?.phone ?? undefined,
        addresses: sorted.map((a) => ({ id: a.id, label: a.label, firstName: a.firstName, lastName: a.lastName, company: a.company, line1: a.line1, line2: a.line2, postalCode: a.postalCode, city: a.city, country: a.country, phone: a.phone })),
      }}
    />
  );
}

export default function PaiementPage() {
  return (
    <>
      <PageIntro title="Finaliser la commande" crumbs={[{ href: "/panier", label: "Panier" }, { href: "/paiement", label: "Paiement" }]} />
      <section className="container-luxe pb-[var(--section)]">
        <Suspense fallback={<div className="h-[60vh]" aria-busy />}>
          <Checkout />
        </Suspense>
      </section>
    </>
  );
}
