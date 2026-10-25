import { euros } from "@/lib/money";
import { countryName } from "@/lib/countries";
import type { schema } from "@/db";

type Order = typeof schema.orders.$inferSelect;
type Item = typeof schema.orderItems.$inferSelect;

/** Récapitulatif d'une commande (confirmation, suivi, compte). */
export function OrderRecap({ order, items, names }: { order: Order; items: Item[]; names: Record<string, string> }) {
  const a = order.shippingAddress;
  return (
    <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="t-title">Articles</h2>
        <ul className="mt-4 divide-y divide-line border-y hairline">
          {items.map((i) => (
            <li key={i.id} className="py-4 t-small">
              <p className="flex justify-between gap-4"><span className="font-display text-lg">{i.quantity} × {i.name}</span><span className="tabular-nums">{euros(i.totalCents)}</span></p>
              {i.composition ? (
                <p className="mt-1 text-ink-soft">{Object.entries(i.composition).map(([s, q]) => `${q} × ${names[s] ?? s}`).join(", ")}</p>
              ) : (
                <p className="mt-1 text-ink-soft">{i.description}</p>
              )}
              {i.giftWrap && <p className="mt-1">Emballage cadeau</p>}
              {i.giftMessage && <p className="mt-1 font-display italic">« {i.giftMessage} »</p>}
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 t-small">
          <div className="flex justify-between"><dt>Sous-total</dt><dd className="tabular-nums">{euros(order.subtotalCents)}</dd></div>
          {order.discountCents > 0 && <div className="flex justify-between"><dt>Remise {order.promoCode}</dt><dd className="tabular-nums">−{euros(order.discountCents)}</dd></div>}
          <div className="flex justify-between"><dt>Livraison ({order.shippingMethod})</dt><dd className="tabular-nums">{order.shippingCents ? euros(order.shippingCents) : "Offerte"}</dd></div>
          <div className="flex justify-between pt-2 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{euros(order.totalCents)}</dd></div>
        </dl>
      </div>
      <div>
        <h2 className="t-title">Livraison</h2>
        <address className="mt-4 not-italic t-small leading-relaxed">
          {a.firstName} {a.lastName}<br />
          {a.company && <>{a.company}<br /></>}
          {a.line1}<br />
          {a.line2 && <>{a.line2}<br /></>}
          {a.postalCode} {a.city}<br />
          {countryName(a.country)}
        </address>
        {order.trackingNumber && (
          <p className="mt-4 t-small">
            Suivi : {order.trackingUrl ? <a href={order.trackingUrl} className="link-draw" target="_blank" rel="noopener noreferrer">{order.trackingNumber}</a> : order.trackingNumber}
          </p>
        )}
      </div>
    </div>
  );
}
