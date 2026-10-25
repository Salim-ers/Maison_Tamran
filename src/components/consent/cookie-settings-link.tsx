"use client";

export function CookieSettingsLink({ className, label = "Gérer mes cookies" }: { className?: string; label?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("tb:open-consent"))}>
      {label}
    </button>
  );
}
