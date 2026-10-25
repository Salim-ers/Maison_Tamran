import type { ContentEntry } from "./types";
import { HOME_ENTRIES } from "./registry/home";
import { MAISON_ENTRIES } from "./registry/maison";
import { SAVOIRFAIRE_ENTRIES } from "./registry/savoir-faire";
import { PROFESSIONNELS_ENTRIES } from "./registry/professionnels";
import { LEGAL_ENTRIES } from "./registry/legal";

/** Registre de tous les blocs de contenu éditables depuis le back-office (Admin › Contenu). */
export const CONTENT_ENTRIES: ContentEntry[] = [...HOME_ENTRIES, ...MAISON_ENTRIES, ...SAVOIRFAIRE_ENTRIES, ...PROFESSIONNELS_ENTRIES, ...LEGAL_ENTRIES];

export type { ContentEntry, ContentField } from "./types";
