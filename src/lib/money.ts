const fmt = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export function euros(cents: number | null | undefined) {
  if (cents == null) return "Sur devis";
  return fmt.format(cents / 100);
}
