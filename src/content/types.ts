export interface ContentField {
  name: string;
  label: string;
  type: "text" | "textarea";
  help?: string;
}

export interface ContentEntry<T extends Record<string, string> = Record<string, string>> {
  key: string; // clé en base (table content_blocks)
  label: string; // nom affiché dans le back-office
  page: string; // URL publique concernée
  fields: ContentField[];
  defaults: T;
}
