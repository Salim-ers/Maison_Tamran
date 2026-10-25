import { useId } from "react";
import { LOGOTYPE, MONO_GROOVE, MONO_TRAVERSE, PIT_PATH } from "@/lib/brand-paths";

/** Monogramme TAMBRÉ : un noyau de datte dont la rainure dessine le T. */
export function Monogram({ className, title = "TAMBRÉ" }: { className?: string; title?: string | null }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 160" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title ?? undefined}>
      <defs>
        <mask id={`m${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="160">
          <rect width="100" height="160" fill="#fff" />
          <path d={MONO_TRAVERSE} fill="#000" />
          <path d={MONO_GROOVE} fill="#000" />
        </mask>
      </defs>
      <path d={PIT_PATH} fill="currentColor" mask={`url(#m${id})`} />
    </svg>
  );
}

/** Logotype vectorisé (Bodoni Moda, approches ajustées, accent en forme de noyau). */
export function Logotype({ className, title = "TAMBRÉ" }: { className?: string; title?: string | null }) {
  return (
    <svg viewBox={LOGOTYPE.viewBox} className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title ?? undefined} fill="currentColor">
      <path d={LOGOTYPE.d} />
      <path transform={LOGOTYPE.accent} d={LOGOTYPE.accentD} />
    </svg>
  );
}
