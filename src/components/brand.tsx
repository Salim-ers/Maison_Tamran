import Image from "next/image";
import { clsx } from "clsx";
import dims from "@/data/logo-dimensions.json";

type Variant = "logo" | "lockup" | "mark";
type Dims = Record<string, { w: number; h: number }>;

/**
 * Logo officiel MAISON TAMRĀN (fichier fourni, détouré par `npm run logo`) : le T de TAMRĀN est un dattier.
 * - logo : version complète avec la signature DATTES GASTRONOMIQUES
 * - lockup : MAISON TAMRĀN sans la signature (en-tête)
 * - mark : le dattier-T seul (petits formats, motifs)
 * `tone="light"` : déclinaison ivoire pour fonds sombres. `height` : hauteur d'affichage nominale (px) pour le srcset.
 */
export function BrandLogo({
  variant = "lockup",
  tone = "dark",
  height,
  alt = "MAISON TAMRĀN",
  className,
  preload,
}: {
  variant?: Variant;
  tone?: "dark" | "light";
  height: number;
  alt?: string;
  className?: string;
  preload?: boolean;
}) {
  const name = `maison-tamran-${variant}${tone === "light" ? "-ivory" : ""}`;
  const d = (dims as Dims)[name];
  return (
    <Image
      src={`/brand/${name}.png`}
      alt={alt}
      width={Math.round((d.w * height) / d.h)}
      height={height}
      quality={85}
      preload={preload}
      className={clsx("w-auto select-none", className)}
      draggable={false}
    />
  );
}
