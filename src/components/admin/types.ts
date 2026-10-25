/** État renvoyé par toutes les Server Actions du back-office (consommé par useActionState). */
export interface ActionState {
  ok?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  at?: number;
}

export type AdminAction = (state: ActionState, form: FormData) => Promise<ActionState>;
