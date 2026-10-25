import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";
import { CartPage } from "@/components/cart/cart-page";

export const metadata: Metadata = { title: "Panier", robots: { index: false } };

export default function PanierPage() {
  return (
    <>
      <PageIntro title="Votre panier" crumbs={[{ href: "/panier", label: "Panier" }]} />
      <section className="container-luxe pb-[var(--section)]">
        <CartPage />
      </section>
    </>
  );
}
