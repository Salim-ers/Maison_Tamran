import { Breadcrumbs } from "@/components/layout/page-intro";
import { concept, Media } from "@/components/ui/media";

/** Mise en page des écrans de connexion : formulaire étroit à gauche, visuel à droite. */
export function AuthShell({ title, intro, children, crumb }: { title: string; intro?: string; children: React.ReactNode; crumb: { href: string; label: string } }) {
  return (
    <div className="grid min-h-[90vh] lg:grid-cols-2">
      <div className="container-luxe flex flex-col justify-center pb-20 pt-[calc(var(--header-h)+3rem)] lg:px-[clamp(2rem,6vw,7rem)]">
        <Breadcrumbs items={[{ href: "/compte", label: "Compte" }, crumb]} />
        <h1 className="mt-6 t-display-m">{title}</h1>
        {intro && <p className="mt-4 max-w-[44ch] text-ink-soft">{intro}</p>}
        <div className="mt-10 w-full max-w-md">{children}</div>
      </div>
      <div className="relative hidden lg:block">
        <Media image={concept("coffret-1")} fill sizes="50vw" className="object-cover" wrapperClassName="absolute inset-0" />
      </div>
    </div>
  );
}
