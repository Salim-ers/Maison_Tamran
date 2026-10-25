/** Formatages utilisables côté serveur comme côté client. */
const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "Europe/Paris" });
const dateTimeFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" });
const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const num = new Intl.NumberFormat("fr-FR");

export const fmtDate = (d: Date | string | null | undefined) => (d ? dateFmt.format(new Date(d)) : "—");
export const fmtDateTime = (d: Date | string | null | undefined) => (d ? dateTimeFmt.format(new Date(d)) : "—");
export const fmtEuros = (cents: number | null | undefined) => (cents == null ? "—" : eur.format(cents / 100));
export const fmtNumber = (n: number) => num.format(n);

/** Centimes → valeur de champ en euros (« 12,50 »). */
export function centsToInput(cents: number | null | undefined) {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

/** Date → valeur d'un champ <input type="date"> (jour à Paris). */
export function dateToInput(d: Date | string | null | undefined) {
  if (!d) return "";
  const parts = new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(d));
  return parts; // AAAA-MM-JJ
}

/** Saisie en euros (virgule ou point) → centimes, ou null si invalide. */
export function parseEuros(raw: string): number | null {
  const v = raw.replace(/[\s €]/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return null;
  return Math.round(parseFloat(v) * 100);
}

export function fullName(p: { firstName?: string | null; lastName?: string | null }) {
  return [p.firstName, p.lastName].filter(Boolean).join(" ");
}
