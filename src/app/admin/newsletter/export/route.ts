import { and, asc, isNotNull, isNull } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";

const t = schema.newsletterSubscribers;

/** Protège contre l'injection de formules dans les tableurs et échappe les guillemets. */
function cell(v: string | null | undefined) {
  let s = v ?? "";
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** Export CSV des abonnés confirmés et non désinscrits (administrateurs uniquement). */
export async function GET() {
  await requireAdmin();
  const rows = await db
    .select({ email: t.email, consentAt: t.consentAt, confirmedAt: t.confirmedAt, consentText: t.consentText, source: t.source })
    .from(t)
    .where(and(isNotNull(t.confirmedAt), isNull(t.unsubscribedAt)))
    .orderBy(asc(t.confirmedAt));
  const header = ["email", "consentement_le", "confirme_le", "texte_du_consentement", "origine"].join(";");
  const lines = rows.map((r) => [cell(r.email), cell(r.consentAt.toISOString()), cell(r.confirmedAt?.toISOString()), cell(r.consentText), cell(r.source)].join(";"));
  const csv = `﻿${[header, ...lines].join("\r\n")}\r\n`;
  const day = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-confirmes-${day}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
