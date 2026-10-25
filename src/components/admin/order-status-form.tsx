"use client";

import { updateOrderStatus } from "@/app/actions/admin/orders";
import { AdminForm, CheckboxField, SelectField, SubmitButton, TextArea, TextField } from "./form";

export function OrderStatusForm({
  id, current, allowed, labels, trackingNumber, trackingUrl, isDemo,
}: {
  id: string;
  current: string;
  allowed: string[];
  labels: Record<string, string>;
  trackingNumber: string | null;
  trackingUrl: string | null;
  isDemo: boolean;
}) {
  const options = [{ value: current, label: `${labels[current]} (actuel)` }, ...allowed.map((s) => ({ value: s, label: labels[s] ?? s }))];
  return (
    <AdminForm action={updateOrderStatus} hidden={{ id }} className="space-y-4">
      <SelectField
        name="status"
        label="Nouveau statut"
        defaultValue={current}
        options={options}
        hint={allowed.length ? "Seules les transitions autorisées depuis le statut actuel sont proposées." : "Statut final : aucune transition possible. Vous pouvez encore ajouter une note."}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="trackingNumber" label="Numéro de suivi" defaultValue={trackingNumber} />
        <TextField name="trackingUrl" label="URL de suivi" type="url" defaultValue={trackingUrl} placeholder="https://…" />
      </div>
      <TextArea name="note" label="Note (historique interne)" rows={2} hint="Enregistrée dans l'historique de la commande, non envoyée au client." />
      <CheckboxField name="notify" label="Notifier le client par email" defaultChecked={!isDemo} hint="Un email récapitulant le nouveau statut (et le suivi) est envoyé si le statut change." />
      <SubmitButton>Enregistrer</SubmitButton>
    </AdminForm>
  );
}
