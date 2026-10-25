/** Pays de livraison proposés (doivent correspondre aux tarifs configurés dans le back-office). */
export const COUNTRIES: { code: string; name: string }[] = [
  { code: "FR", name: "France métropolitaine" },
  { code: "BE", name: "Belgique" },
  { code: "LU", name: "Luxembourg" },
  { code: "DE", name: "Allemagne" },
  { code: "NL", name: "Pays-Bas" },
  { code: "IT", name: "Italie" },
  { code: "ES", name: "Espagne" },
];
export const COUNTRY_CODES = COUNTRIES.map((c) => c.code);
export const countryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name ?? code;
