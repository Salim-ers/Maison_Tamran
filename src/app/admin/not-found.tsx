import Link from "next/link";
import { btnPrimary } from "@/components/admin/styles";

export default function AdminNotFound() {
  return (
    <div className="max-w-xl py-10">
      <h1 className="font-display text-3xl">Élément introuvable</h1>
      <p className="mt-3 text-sm text-ink-soft">Cet élément n&apos;existe pas ou a été supprimé. Vérifiez le lien, ou revenez à la liste.</p>
      <Link href="/admin" className={`${btnPrimary} mt-6`}>Retour au tableau de bord</Link>
    </div>
  );
}
