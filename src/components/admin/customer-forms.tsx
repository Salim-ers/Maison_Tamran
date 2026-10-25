"use client";

import { saveProInfo, setUserRole } from "@/app/actions/admin/customers";
import { AdminForm, SelectField, SubmitButton, TextField } from "./form";
import { ROLE_LABELS } from "./labels";

export function RoleForm({ id, role, self }: { id: string; role: string; self: boolean }) {
  return (
    <AdminForm action={setUserRole} hidden={{ id }} className="space-y-3">
      <SelectField
        name="role"
        label="Rôle"
        defaultValue={role}
        options={Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))}
        hint={self ? "C'est votre compte : vous ne pouvez pas retirer votre propre rôle d'administrateur." : "Administrateur : accès complet au back-office. Retirer ce rôle ferme les sessions ouvertes du compte."}
      />
      <SubmitButton small>Changer le rôle</SubmitButton>
    </AdminForm>
  );
}

export function ProForm({ id, company, vatNumber }: { id: string; company: string | null; vatNumber: string | null }) {
  return (
    <AdminForm action={saveProInfo} hidden={{ id }} className="space-y-3">
      <TextField name="company" label="Société" defaultValue={company} />
      <TextField name="vatNumber" label="N° de TVA intracommunautaire" defaultValue={vatNumber} placeholder="FR12345678901" />
      <SubmitButton small>Enregistrer</SubmitButton>
    </AdminForm>
  );
}
