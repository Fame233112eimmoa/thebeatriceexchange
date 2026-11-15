"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { fullAddress } from "../../data/site";
import { cx, formatMoney } from "../../lib/format";
import { paymentOptions, paymentProvider } from "../../lib/payments";
import { routes } from "../../lib/routes";
import { useHydrated } from "../../lib/persistent-store";
import { calculateTotals, useAccount, useCart, useOrders } from "../../lib/store";
import type { FulfillmentMethod, Order, PaymentMethod } from "../../lib/types";
import { Icon } from "../ui/icon";
import { ProductArt } from "../ui/product-art";
import { btn, container, field } from "../ui/styles";
import { OrderSummary } from "./cart-view";

export function CheckoutView({ initialFulfillment }: { initialFulfillment: FulfillmentMethod }) {
  const id = useId();
  const cart = useCart();
  const hydrated = useHydrated();
  const { addOrder } = useOrders();
  const { account } = useAccount();
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>(initialFulfillment);
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);

  const effective: FulfillmentMethod = cart.hasPickupOnly ? "pickup" : fulfillment;
  const effectivePayment: PaymentMethod = payment === "cash-pickup" && effective !== "pickup" ? "card" : payment;

  if (!hydrated) return <div className={`${container} py-24 text-center text-sm text-bx-muted`}>Loading your cart…</div>;

  if (placed) {
    return (
      <div className={`${container} max-w-2xl py-16 text-center`}>
        <span className="mx-auto flex h-12 w-12 items-center justify-center border border-bx-ink text-bx-ink"><Icon name="check" size={22} /></span>
        <h1 className="mt-5 font-bx-serif text-4xl text-bx-ink">Thank you for your order!</h1>
        <p className="mt-2 text-bx-muted">
          Order <strong className="text-bx-ink">#{placed.id}</strong> is confirmed. A receipt is on its way to {placed.email}.
        </p>
        <p className="mt-2 text-sm text-bx-muted">
          {placed.fulfillment === "pickup"
            ? `We'll email you when it's ready for pickup at ${fullAddress}. Bring a photo ID${placed.payment === "cash-pickup" ? " and payment" : ""}.`
            : "We'll send tracking details as soon as it ships."}
        </p>
        <p className="mt-6 bg-bx-cream px-4 py-3 text-xs text-bx-charcoal">
          Demo checkout: no payment was taken. Connect Stripe in <code>lib/payments.ts</code> to accept real payments.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href={routes.orders} className={btn.primary}>View Order History</Link>
          <Link href={routes.shop} className={btn.outline}>Keep Shopping</Link>
        </div>
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className={`${container} py-20 text-center`}>
        <h1 className="font-bx-serif text-4xl text-bx-ink">Nothing to check out yet</h1>
        <Link href={routes.shop} className={`${btn.primary} mt-6`}>Start Shopping</Link>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = new FormData(form);
    const email = String(data.get("email"));
    const { shipping, tax, total } = calculateTotals(cart.subtotal, effective);
    setSubmitting(true);
    setError("");
    const result = await paymentProvider.checkout({
      lines: cart.items.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      fulfillment: effective,
      method: effectivePayment,
      email,
      amount: total,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const order: Order = {
      id: result.orderId,
      placedAt: new Date().toISOString(),
      lines: cart.items.map((l) => ({ productId: l.productId, name: l.product.name, price: l.product.price, quantity: l.quantity })),
      subtotal: cart.subtotal,
      shipping,
      tax,
      total,
      fulfillment: effective,
      payment: effectivePayment,
      email,
      status: "Processing",
    };
    addOrder(order);
    cart.clear();
    setPlaced(order);
    window.scrollTo({ top: 0 });
  }

  const section = "border border-bx-line bg-white p-6 sm:p-8";
  const h2 = "mb-5 flex items-center gap-3 font-bx-serif text-2xl text-bx-ink";
  const step = "flex h-7 w-7 items-center justify-center bg-bx-ink font-bx-sans text-xs font-bold text-white";

  return (
    <div className={`${container} py-10`}>
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-bx-muted">
        <Link href={routes.cart} className="hover:text-bx-ink">Cart</Link> / <span className="text-bx-ink">Checkout</span>
      </nav>
      <h1 className="font-bx-serif text-4xl text-bx-ink sm:text-5xl">Checkout</h1>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className={section} aria-labelledby={`${id}-contact`}>
            <h2 id={`${id}-contact`} className={h2}><span className={step}>1</span> Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor={`${id}-email`} className={field.label}>Email *</label>
                <input id={`${id}-email`} name="email" type="email" required autoComplete="email" defaultValue={account?.email} className={field.input} />
              </div>
              <div>
                <label htmlFor={`${id}-first`} className={field.label}>First name *</label>
                <input id={`${id}-first`} name="first" required autoComplete="given-name" defaultValue={account?.name.split(" ")[0]} className={field.input} />
              </div>
              <div>
                <label htmlFor={`${id}-last`} className={field.label}>Last name *</label>
                <input id={`${id}-last`} name="last" required autoComplete="family-name" defaultValue={account?.name.split(" ").slice(1).join(" ")} className={field.input} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${id}-phone`} className={field.label}>Phone *</label>
                <input id={`${id}-phone`} name="phone" type="tel" required autoComplete="tel" className={field.input} />
              </div>
            </div>
          </section>

          <section className={section} aria-labelledby={`${id}-delivery`}>
            <h2 id={`${id}-delivery`} className={h2}><span className={step}>2</span> Delivery</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { value: "ship", icon: "truck", title: "Ship to me", disabled: cart.hasPickupOnly },
                  { value: "pickup", icon: "store", title: "Pick Up In Store", disabled: false },
                ] as const
              ).map((opt) => (
                <label key={opt.value} className={cx("flex cursor-pointer items-center gap-3 border p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bx-ink", effective === opt.value ? "border-bx-ink" : "border-bx-line", opt.disabled && "cursor-not-allowed opacity-50")}>
                  <input type="radio" name="fulfillment" className="sr-only" checked={effective === opt.value} disabled={opt.disabled} onChange={() => setFulfillment(opt.value)} />
                  <Icon name={opt.icon} size={22} className="text-bx-ink" />
                  <span className="text-sm font-semibold text-bx-ink">{opt.title}</span>
                </label>
              ))}
            </div>
            {effective === "ship" ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor={`${id}-addr`} className={field.label}>Street address *</label>
                  <input id={`${id}-addr`} name="address" required autoComplete="street-address" className={field.input} />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor={`${id}-city`} className={field.label}>City *</label>
                  <input id={`${id}-city`} name="city" required autoComplete="address-level2" className={field.input} />
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor={`${id}-state`} className={field.label}>State *</label>
                  <input id={`${id}-state`} name="state" required maxLength={2} autoComplete="address-level1" className={`${field.input} uppercase`} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor={`${id}-zip`} className={field.label}>ZIP *</label>
                  <input id={`${id}-zip`} name="zip" required inputMode="numeric" pattern="\d{5}(-\d{4})?" autoComplete="postal-code" className={field.input} />
                </div>
              </div>
            ) : (
              <p className="mt-4 flex items-start gap-2 bg-bx-cream p-4 text-sm text-bx-charcoal">
                <Icon name="pin" size={18} className="mt-0.5 shrink-0 text-bx-ink" />
                <span>Pick up at <strong>{fullAddress}</strong>. We&apos;ll email you when it&apos;s ready, usually the next business day. Please bring a photo ID.</span>
              </p>
            )}
          </section>

          <section className={section} aria-labelledby={`${id}-pay`}>
            <h2 id={`${id}-pay`} className={h2}><span className={step}>3</span> Payment</h2>
            <div className="grid gap-2">
              {paymentOptions
                .filter((o) => !o.pickupOnly || effective === "pickup")
                .map((opt) => (
                  <label key={opt.value} className={cx("flex cursor-pointer items-center gap-3 border p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bx-ink", effectivePayment === opt.value ? "border-bx-ink bg-bx-ivory" : "border-bx-line")}>
                    <input type="radio" name="payment" value={opt.value} checked={effectivePayment === opt.value} onChange={() => setPayment(opt.value)} className="h-4 w-4 accent-[#15161b]" />
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-bx-ink">{opt.label}</span>
                      <span className="block text-xs text-bx-muted">{opt.hint}</span>
                    </span>
                  </label>
                ))}
            </div>

            {effectivePayment === "card" ? (
              <div className="mt-5 border border-dashed border-bx-line p-5">
                {/* Stripe: replace this block with <PaymentElement /> from @stripe/react-stripe-js. */}
                <p className="mb-4 flex items-center gap-2 text-xs text-bx-muted"><Icon name="lock" size={14} /> Card fields are a demo placeholder. No card data is sent anywhere.</p>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="sm:col-span-4">
                    <label htmlFor={`${id}-cc`} className={field.label}>Card number</label>
                    <input id={`${id}-cc`} inputMode="numeric" autoComplete="off" placeholder="1234 1234 1234 1234" className={field.input} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor={`${id}-exp`} className={field.label}>Expiry</label>
                    <input id={`${id}-exp`} autoComplete="off" placeholder="MM / YY" className={field.input} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor={`${id}-cvc`} className={field.label}>CVC</label>
                    <input id={`${id}-cvc`} inputMode="numeric" autoComplete="off" placeholder="123" className={field.input} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-bx-muted">
                {effectivePayment === "cash-pickup"
                  ? "Your items will be held for 3 business days. Pay with cash or card when you pick up."
                  : "You'll be asked to confirm with your chosen provider after placing the order."}
              </p>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-40 lg:self-start">
          <OrderSummary subtotal={cart.subtotal} fulfillment={effective}>
            <ul className="mt-5 space-y-3 border-t border-bx-line pt-5">
              {cart.items.map(({ product }) => (
                <li key={product.id} className="flex items-center gap-3 text-sm">
                  <span className="h-12 w-12 shrink-0 overflow-hidden"><ProductArt product={product} sizes="48px" /></span>
                  <span className="line-clamp-2 flex-1 text-bx-charcoal">{product.name}</span>
                  <span className="font-medium text-bx-ink">{formatMoney(product.price)}</span>
                </li>
              ))}
            </ul>
            {error ? <p role="alert" className="mt-4 text-sm font-medium text-bx-ruby">{error}</p> : null}
            <button type="submit" disabled={submitting} className={`${btn.primary} mt-6 w-full !py-4`}>
              <Icon name="lock" size={18} /> {submitting ? "Placing order…" : "Place Order"}
            </button>
            <p className="mt-3 text-center text-xs text-bx-muted">
              By placing your order you agree to our <Link href={routes.terms} className="underline">Terms</Link> and <Link href={routes.returns} className="underline">Returns Policy</Link>.
            </p>
          </OrderSummary>
        </aside>
      </form>
    </div>
  );
}
