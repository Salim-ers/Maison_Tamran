import { clsx } from "clsx";
import { STATUS_LABELS } from "@/lib/email";

const FLOW = ["paid", "preparing", "shipped", "delivered"];
const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" });

/** Étapes d'une commande, d'après son statut et l'historique réel des événements. */
export function OrderTimeline({ status, events }: { status: string; events: { status: string; note: string | null; createdAt: Date }[] }) {
  const terminal = ["payment_failed", "cancelled", "refunded"].includes(status);
  const reached = (s: string) => events.some((e) => e.status === s) || FLOW.indexOf(status) >= FLOW.indexOf(s);
  return (
    <div>
      {terminal ? (
        <p className="border-l-2 border-danger pl-4">Statut : {STATUS_LABELS[status]}</p>
      ) : status === "pending_payment" ? (
        <p className="border-l-2 border-bronze pl-4">En attente de paiement.</p>
      ) : (
        <ol className="grid gap-6 sm:grid-cols-4" aria-label="Avancement de la commande">
          {FLOW.map((s, i) => {
            const on = reached(s);
            const ev = [...events].reverse().find((e) => e.status === s);
            return (
              <li key={s} className={clsx("border-t-2 pt-3", on ? "border-chocolate" : "border-line")} aria-current={status === s ? "step" : undefined}>
                <span className="t-numeral text-bronze">{i + 1}</span>
                <p className={clsx("font-display text-xl", !on && "text-ink-soft")}>{STATUS_LABELS[s]}</p>
                {ev && <p className="t-micro text-ink-soft">{fmt.format(ev.createdAt)}</p>}
              </li>
            );
          })}
        </ol>
      )}
      <details className="mt-6 t-small">
        <summary className="cursor-pointer text-ink-soft">Historique détaillé</summary>
        <ul className="mt-3 space-y-2">
          {events.map((e, i) => (
            <li key={i}><span className="text-ink-soft">{fmt.format(e.createdAt)}</span> : {STATUS_LABELS[e.status] ?? e.status}{e.note ? ` (${e.note})` : ""}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
