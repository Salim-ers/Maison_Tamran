"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { clsx } from "clsx";
import type { ActionState, AdminAction } from "./types";
import { btnDanger, btnPrimary, btnSecondary, btnSmall, hintCls, inputCls, labelCls } from "./styles";

const FormCtx = createContext<{ state: ActionState; pending: boolean }>({ state: {}, pending: false });
export const useAdminForm = () => useContext(FormCtx);

/**
 * Formulaire d'administration : Server Action + useActionState.
 * - Les saisies sont conservées en cas d'erreur (pas de réinitialisation automatique).
 * - `resetOnSuccess` vide le formulaire après un enregistrement réussi (formulaires d'ajout).
 * - Le bouton qui a soumis le formulaire est transmis (name/value), ce qui permet plusieurs intentions.
 */
export function AdminForm({
  action, children, className, resetOnSuccess, hidden, encType, id, showStatus = true,
}: {
  action: AdminAction;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  hidden?: Record<string, string | number | null | undefined>;
  encType?: "multipart/form-data";
  id?: string;
  showStatus?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ActionState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <FormCtx value={{ state, pending }}>
      <form
        ref={ref}
        id={id}
        encType={encType}
        noValidate
        className={className}
        onSubmit={(e) => {
          e.preventDefault();
          const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
          const fd = new FormData(e.currentTarget, submitter ?? undefined);
          startTransition(() => formAction(fd));
        }}
        aria-busy={pending || undefined}
      >
        {hidden && Object.entries(hidden).map(([k, v]) => (v == null ? null : <input key={k} type="hidden" name={k} value={String(v)} />))}
        {children}
        {showStatus && <FormStatus />}
      </form>
    </FormCtx>
  );
}

/** Message de résultat (succès ou erreur) du formulaire courant. */
export function FormStatus({ className }: { className?: string }) {
  const { state } = useAdminForm();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    setVisible(true);
    if (state.ok) {
      const t = setTimeout(() => setVisible(false), 6000);
      return () => clearTimeout(t);
    }
  }, [state]);
  if (state.error) {
    return (
      <p role="alert" className={clsx("mt-3 border-l-2 border-danger bg-danger/5 px-3 py-2 text-sm text-danger", className)}>
        {state.error}
      </p>
    );
  }
  if (state.ok && state.message && visible) {
    return (
      <p role="status" className={clsx("mt-3 border-l-2 border-success bg-success/5 px-3 py-2 text-sm text-success", className)}>
        {state.message}
      </p>
    );
  }
  return <p role="status" className="sr-only" />;
}

export function SubmitButton({
  children, pendingLabel = "Enregistrement…", variant = "primary", name, value, className, small, disabled,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  name?: string;
  value?: string;
  className?: string;
  small?: boolean;
  disabled?: boolean;
}) {
  const { pending } = useAdminForm();
  const fs = useFormStatus();
  const busy = pending || fs.pending;
  const cls = variant === "primary" ? btnPrimary : variant === "danger" ? btnDanger : btnSecondary;
  return (
    <button type="submit" name={name} value={value} disabled={busy || disabled} className={clsx(cls, small && btnSmall, className)}>
      {busy ? pendingLabel : children}
    </button>
  );
}

/**
 * Bouton de soumission à confirmation en deux temps (actions destructives).
 * Premier clic : demande de confirmation explicite ; second clic : soumission.
 */
export function ConfirmSubmit({
  children, confirmLabel, question, name = "intent", value = "delete", small, variant = "danger",
}: {
  children: React.ReactNode;
  confirmLabel: string;
  question: string;
  name?: string;
  value?: string;
  small?: boolean;
  variant?: "danger" | "secondary";
}) {
  const [asking, setAsking] = useState(false);
  const { pending } = useAdminForm();
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (asking) confirmRef.current?.focus();
  }, [asking]);
  const base = variant === "danger" ? btnDanger : btnSecondary;
  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} className={clsx(base, small && btnSmall)} disabled={pending}>
        {children}
      </button>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2" role="group" aria-label={question}>
      {/* Preuve de confirmation explicite, vérifiée côté serveur (assertConfirmed). */}
      <input type="hidden" name="confirmed" value="1" />
      <span className="text-sm text-danger">{question}</span>
      <button ref={confirmRef} type="submit" name={name} value={value} className={clsx(btnDanger, small && btnSmall)} disabled={pending}>
        {pending ? "…" : confirmLabel}
      </button>
      <button type="button" onClick={() => setAsking(false)} className={clsx(btnSecondary, small && btnSmall)}>
        Annuler
      </button>
    </span>
  );
}

/**
 * Petite action autonome (un bouton = un formulaire), avec confirmation optionnelle.
 * Exemple : approuver un témoignage, marquer un message comme traité, supprimer une ligne.
 */
export function ActionButton({
  action, fields, label, confirm, confirmLabel, variant = "secondary", small = true, pendingLabel,
}: {
  action: AdminAction;
  fields: Record<string, string | number>;
  label: string;
  confirm?: string;
  confirmLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  small?: boolean;
  pendingLabel?: string;
}) {
  return (
    <AdminForm action={action} hidden={fields} className="inline-flex flex-col items-start" showStatus={false}>
      {confirm ? (
        <ConfirmSubmit question={confirm} confirmLabel={confirmLabel ?? label} small={small} name="confirmed" value="1" variant={variant === "danger" ? "danger" : "secondary"}>
          {label}
        </ConfirmSubmit>
      ) : (
        <SubmitButton variant={variant} small={small} pendingLabel={pendingLabel ?? "…"}>
          {label}
        </SubmitButton>
      )}
      <InlineError />
    </AdminForm>
  );
}

function InlineError() {
  const { state } = useAdminForm();
  if (!state.error) return null;
  return <span role="alert" className="mt-1 max-w-64 text-xs text-danger">{state.error}</span>;
}

// ---------------------------------------------------------------------------
// Champs
// ---------------------------------------------------------------------------
interface BaseField {
  name: string;
  label: string;
  hint?: React.ReactNode;
  required?: boolean;
  className?: string;
  id?: string;
}

function useFieldIds(name: string, id?: string) {
  const auto = useId();
  const fid = id ?? `${auto}-${name}`;
  const { state } = useAdminForm();
  const error = state.fieldErrors?.[name];
  return { fid, error, hintId: `${fid}-hint`, errId: `${fid}-err` };
}

function Describe({ hint, hintId, error, errId }: { hint?: React.ReactNode; hintId: string; error?: string; errId: string }) {
  return (
    <>
      {hint && <p id={hintId} className={hintCls}>{hint}</p>}
      {error && <p id={errId} role="alert" className="mt-1 text-xs text-danger">{error}</p>}
    </>
  );
}

function describedBy(hint: unknown, error: unknown, hintId: string, errId: string) {
  return [hint ? hintId : null, error ? errId : null].filter(Boolean).join(" ") || undefined;
}

function Label({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className={labelCls}>
      {label}
      {required ? <span aria-hidden className="text-danger"> *</span> : null}
    </label>
  );
}

export function TextField({
  name, label, hint, required, className, defaultValue, type = "text", placeholder, inputMode, maxLength, autoComplete, id, suffix, min, max, step, pattern,
}: BaseField & {
  defaultValue?: string | number | null;
  type?: "text" | "email" | "url" | "number" | "date" | "datetime-local" | "search" | "tel";
  placeholder?: string;
  inputMode?: "text" | "decimal" | "numeric" | "email" | "url";
  maxLength?: number;
  autoComplete?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number | "any";
  pattern?: string;
}) {
  const { fid, error, hintId, errId } = useFieldIds(name, id);
  return (
    <div className={className}>
      <Label htmlFor={fid} label={label} required={required} />
      <div className={suffix ? "relative" : undefined}>
        <input
          id={fid}
          name={name}
          type={type}
          defaultValue={defaultValue ?? undefined}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete={autoComplete ?? "off"}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(hint, error, hintId, errId)}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          className={clsx(inputCls, suffix && "pr-9")}
        />
        {suffix && <span aria-hidden className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink-soft">{suffix}</span>}
      </div>
      <Describe hint={hint} hintId={hintId} error={error} errId={errId} />
    </div>
  );
}

/** Montant saisi en euros (virgule ou point), converti en centimes côté serveur. */
export function MoneyField(props: BaseField & { defaultValue?: string | null; placeholder?: string }) {
  return <TextField {...props} inputMode="decimal" suffix="€" placeholder={props.placeholder ?? "0,00"} />;
}

export function TextArea({
  name, label, hint, required, className, defaultValue, rows = 4, maxLength, id, placeholder,
}: BaseField & { defaultValue?: string | null; rows?: number; maxLength?: number; placeholder?: string }) {
  const { fid, error, hintId, errId } = useFieldIds(name, id);
  return (
    <div className={className}>
      <Label htmlFor={fid} label={label} required={required} />
      <textarea
        id={fid}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? undefined}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, error, hintId, errId)}
        className={clsx(inputCls, "min-h-20 resize-y")}
      />
      <Describe hint={hint} hintId={hintId} error={error} errId={errId} />
    </div>
  );
}

export function SelectField({
  name, label, hint, required, className, defaultValue, options, id, placeholder,
}: BaseField & { defaultValue?: string | null; options: { value: string; label: string }[]; placeholder?: string }) {
  const { fid, error, hintId, errId } = useFieldIds(name, id);
  return (
    <div className={className}>
      <Label htmlFor={fid} label={label} required={required} />
      <select
        id={fid}
        name={name}
        defaultValue={defaultValue ?? ""}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, error, hintId, errId)}
        className={clsx(inputCls, "pr-8")}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <Describe hint={hint} hintId={hintId} error={error} errId={errId} />
    </div>
  );
}

export function CheckboxField({
  name, label, hint, className, defaultChecked, id, value = "on",
}: Omit<BaseField, "required"> & { defaultChecked?: boolean; value?: string }) {
  const { fid, error, hintId, errId } = useFieldIds(name, id);
  return (
    <div className={className}>
      <label htmlFor={fid} className="flex cursor-pointer items-start gap-2.5 text-sm">
        <input
          id={fid}
          type="checkbox"
          name={name}
          value={value}
          defaultChecked={defaultChecked}
          aria-describedby={describedBy(hint, error, hintId, errId)}
          className="mt-0.5 size-4 shrink-0 accent-[var(--color-chocolate)]"
        />
        <span className="font-medium">{label}</span>
      </label>
      <div className="pl-6.5">
        <Describe hint={hint} hintId={hintId} error={error} errId={errId} />
      </div>
    </div>
  );
}

export function ColorField({ name, label, defaultValue, className }: { name: string; label: string; defaultValue: string; className?: string }) {
  const { fid, error, errId } = useFieldIds(name);
  const [v, setV] = useState(defaultValue);
  return (
    <div className={className}>
      <label htmlFor={fid} className={labelCls}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          id={fid}
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(v) ? v : "#000000"}
          onChange={(e) => setV(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-[2px] border border-line bg-cream p-1"
          aria-describedby={error ? errId : undefined}
        />
        <input
          name={name}
          value={v}
          onChange={(e) => setV(e.target.value)}
          aria-label={`${label} (code hexadécimal)`}
          aria-invalid={error ? true : undefined}
          className={clsx(inputCls, "w-28 font-mono text-xs uppercase")}
          maxLength={7}
        />
      </div>
      {error && <p id={errId} role="alert" className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

/** Cases à cocher multiples avec valeurs libres supplémentaires (ex. allergènes). */
export function MultiCheck({
  name, legend, options, defaultValues, allowOther, otherLabel = "Autres (séparés par des virgules)", hint,
}: {
  name: string;
  legend: string;
  options: { value: string; label: string }[];
  defaultValues: string[];
  allowOther?: boolean;
  otherLabel?: string;
  hint?: string;
}) {
  const known = new Set(options.map((o) => o.value));
  const others = defaultValues.filter((v) => !known.has(v));
  const auto = useId();
  return (
    <fieldset>
      <legend className={labelCls}>{legend}</legend>
      {hint && <p className={clsx(hintCls, "mb-2 mt-0")}>{hint}</p>}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {options.map((o) => (
          <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" name={name} value={o.value} defaultChecked={defaultValues.includes(o.value)} className="size-4 accent-[var(--color-chocolate)]" />
            {o.label}
          </label>
        ))}
      </div>
      {allowOther && (
        <div className="mt-3 max-w-md">
          <label htmlFor={`${auto}-other`} className={labelCls}>{otherLabel}</label>
          <input id={`${auto}-other`} name={`${name}Other`} defaultValue={others.join(", ")} className={inputCls} />
        </div>
      )}
    </fieldset>
  );
}

export function FormActions({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5", className)}>{children}</div>;
}
