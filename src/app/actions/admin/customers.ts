"use server";

import { z } from "zod";
import { refresh } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import type { ActionState } from "@/components/admin/types";
import { done, fail, formObject, run, zId, zOptText, zodFail } from "./helpers";

const roleInput = z.object({ id: zId, role: z.enum(["customer", "pro", "admin"], { message: "Rôle invalide." }) });

export async function setUserRole(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const parsed = roleInput.safeParse(formObject(form));
  if (!parsed.success) return zodFail(parsed.error);
  const { id, role } = parsed.data;
  if (id === me.id && role !== "admin") return fail("Vous ne pouvez pas retirer votre propre rôle d'administrateur. Demandez à un autre administrateur de le faire.");
  const res = await run(async () => {
    const r = await db.update(schema.users).set({ role }).where(eq(schema.users.id, id)).returning({ id: schema.users.id });
    if (!r.length) return fail("Compte introuvable.");
    // Un changement de rôle invalide les sessions ouvertes pour appliquer immédiatement les nouveaux droits.
    if (role !== "admin") await db.delete(schema.sessions).where(eq(schema.sessions.userId, id));
    return done("Rôle mis à jour.");
  });
  if (res.ok) refresh();
  return res;
}

const proInput = z.object({
  id: zId,
  company: zOptText(160),
  vatNumber: zOptText(40).pipe(
    z
      .string()
      .nullable()
      .transform((v) => (v ? v.replace(/\s+/g, "").toUpperCase() : null))
      .refine((v) => v == null || /^[A-Z]{2}[0-9A-Z]{2,13}$/.test(v), "Numéro de TVA intracommunautaire invalide (ex. FR12345678901).")
  ),
});

export async function saveProInfo(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = proInput.safeParse(formObject(form));
  if (!parsed.success) return zodFail(parsed.error);
  const { id, ...v } = parsed.data;
  const res = await run(async () => {
    const r = await db.update(schema.users).set(v).where(eq(schema.users.id, id)).returning({ id: schema.users.id });
    if (!r.length) return fail("Compte introuvable.");
    return done("Informations professionnelles enregistrées.");
  });
  if (res.ok) refresh();
  return res;
}
