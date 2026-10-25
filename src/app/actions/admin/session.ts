"use server";

import { redirect } from "next/navigation";
import { destroySession, requireAdmin } from "@/lib/auth";

/** Déconnexion depuis le back-office. */
export async function adminLogout() {
  await requireAdmin();
  await destroySession();
  redirect("/");
}
