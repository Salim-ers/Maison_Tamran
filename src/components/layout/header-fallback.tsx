import Link from "next/link";
import { Logotype, Monogram } from "@/components/brand";

/** En-tête statique affiché le temps que l'en-tête interactif (dépendant de l'URL) soit prêt. */
export function HeaderFallback() {
  return (
    <header className="fixed inset-x-0 top-[var(--banner-h,0px)] z-50 bg-ivory/92 text-ink shadow-[0_1px_0_var(--color-line)] backdrop-blur-md">
      <div className="container-luxe grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center gap-4">
        <span />
        <Link href="/" aria-label="TAMBRÉ, accueil" className="flex items-center gap-3">
          <Monogram className="h-8 w-auto" title={null} />
          <Logotype className="hidden h-[1.05rem] w-auto xs:block" title={null} />
        </Link>
        <span />
      </div>
    </header>
  );
}
