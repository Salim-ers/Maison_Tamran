import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartNotice } from "@/components/cart/cart-notice";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ConsentBanner, PageViewTracker } from "@/components/consent/consent";
import { Suspense } from "react";
import { headerMenus } from "@/components/layout/header-menus";
import { MotionProvider } from "@/components/motion/reduced-motion";
import { IntroGate } from "@/components/home/intro-curtain";
import { ViewTransitionsListener } from "@/components/motion/transition-link";
import { ImageReveal } from "@/components/motion/image-reveal";

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <MotionProvider>
      <div className="flex min-h-dvh flex-col">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-cream focus:px-4 focus:py-2">
          Aller au contenu
        </a>
        <SiteHeader menus={headerMenus()} />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <CartDrawer />
        <CartNotice />
        <ConsentBanner />
        <IntroGate />
        <ImageReveal />
        <Suspense fallback={null}>
          <ViewTransitionsListener />
        </Suspense>
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
      </div>
      </MotionProvider>
    </CartProvider>
  );
}
