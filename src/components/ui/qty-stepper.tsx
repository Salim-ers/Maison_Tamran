"use client";

import { clsx } from "clsx";

export function QtyStepper({
  value, min = 0, max = 99, onChange, label, size = "md", disabled, decLabel, incLabel,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  label: string;
  size?: "sm" | "md";
  disabled?: boolean;
  decLabel?: string;
  incLabel?: string;
}) {
  const s = size === "sm" ? "size-8" : "size-10";
  return (
    <div role="group" aria-label={label} className={clsx("inline-flex items-center border hairline bg-cream", disabled && "opacity-50")}>
      <button
        type="button"
        className={clsx(s, "grid place-items-center text-lg leading-none transition-colors hover:bg-ivory disabled:opacity-30")}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label={decLabel ?? "Retirer un"}
      >
        −
      </button>
      <output className={clsx("min-w-8 text-center tabular-nums", size === "sm" ? "text-sm" : "text-base")} aria-live="polite">{value}</output>
      <button
        type="button"
        className={clsx(s, "grid place-items-center text-lg leading-none transition-colors hover:bg-ivory disabled:opacity-30")}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label={incLabel ?? "Ajouter un"}
      >
        +
      </button>
    </div>
  );
}
