import Image, { type ImageProps } from "next/image";
import { clsx } from "clsx";
import type { ImageRef } from "@/db/schema";
import manifest from "@/data/concepts-manifest.json";
import { withPhoto } from "@/lib/photos";

type Manifest = Record<string, { w: number; h: number; alt: string; group: string; blur: string }>;
const M = manifest as Manifest;

/** Visuel d'un emplacement (ex. "lifestyle-1") : la photo validée si elle existe, sinon le visuel concept. */
export function concept(id: string): ImageRef {
  const m = M[id];
  return withPhoto({ url: `/images/concepts/${id}.webp`, alt: m?.alt ?? "", role: "extra", concept: true, w: m?.w, h: m?.h, blur: m?.blur });
}

/** Pastille discrète signalant un visuel illustré ou une image conceptuelle IA (et non une photographie du produit réel). */
export function ConceptBadge({ className, tone = "light", label }: { className?: string; tone?: "light" | "dark"; label?: string }) {
  return (
    <span
      className={clsx(
        "pointer-events-none absolute z-[2] select-none px-2 py-1 text-[0.68rem] leading-none tracking-[0.03em] backdrop-blur-sm",
        tone === "light" ? "bg-cream/85 text-ink-soft" : "bg-chocolate/80 text-ivory/85",
        className ?? "bottom-3 right-3"
      )}
    >
      {label ?? "Visuel concept"}
    </span>
  );
}

type MediaProps = Omit<ImageProps, "src" | "alt" | "placeholder" | "blurDataURL"> & {
  image: ImageRef | null | undefined;
  alt?: string;
  badge?: boolean | "dark";
  badgeClassName?: string;
  wrapperClassName?: string;
};

/** Image optimisée (next/image) avec flou de chargement et mention « Visuel concept » si nécessaire. */
export function Media({ image: source, alt, badge = true, badgeClassName, wrapperClassName, className, fill, ...rest }: MediaProps) {
  const image = withPhoto(source);
  if (!image) return <div className={clsx("bg-taupe/30", wrapperClassName)} aria-hidden />;
  const img = (
    <Image
      src={image.url}
      alt={alt ?? image.alt}
      placeholder={image.blur ? "blur" : "empty"}
      blurDataURL={image.blur}
      quality={85}
      className={className}
      {...(fill ? { fill: true } : { width: image.w ?? 1600, height: image.h ?? 2000 })}
      {...rest}
    />
  );
  return (
    <div className={wrapperClassName ?? "relative"}>
      {img}
      {badge && image.concept && <ConceptBadge className={badgeClassName} tone={badge === "dark" ? "dark" : "light"} label={image.badge} />}
    </div>
  );
}
