"use client";

import Link from "next/link";
import { useState } from "react";

import { site } from "../../data/site";
import { formatMoney, formatPrice } from "../../lib/format";
import { routes } from "../../lib/routes";
import { useHydrated } from "../../lib/persistent-store";
import { calculateTotals, useCart, useFavorites } from "../../lib/store";
import type { FulfillmentMethod } from "../../lib/types";
import { Icon } from "../ui/icon";
import { PaymentBadges } from "../ui/payment-badges";
import { ProductArt } from "../ui/product-art";
import { btn, container } from "../ui/styles";

export function OrderSummary({ subtotal, fulfillment, children }: { subtotal: number; fulfillment: FulfillmentMethod; children?: React.ReactNode }) {
  const { shipping, tax, total } = calculateTotals(subtotal, fulfillment);
  const remaining = site.commerce.freeShippingThreshold - subtotal;
  return (
    <div className="border border-bx-line bg-white p-6">
      <h2 className="font-bx-serif text-2xl text-bx-ink">Order Summary</h2>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between"><dt className="text-bx-muted">Subtotal</dt><dd className="font-medium text-bx-ink">{formatMoney(subtotal)}</dd></div>
        <div className="flex justify-between">
          <dt className="text-bx-muted">{fulfillment === "pickup" ? "In-store pickup" : "Shipping"}</dt>
          <dd className="font-medium text-bx-ink">{shipping === 0 ? "Free" : formatMoney(shipping)}</dd>
        </div>
        <div className="flex justify-between"><dt className="text-bx-muted">Estimated tax</dt><dd className="font-medium text-bx-ink">{formatMoney(tax)}</dd></div>
        <div className="flex justify-between border-t border-bx-line pt-3 text-base"><dt className="font-semibold text-bx-ink">Total</dt><dd className="font-semibold text-bx-ink">{formatMoney(total)}</dd></div>
      </dl>
      {fulfillment === "ship" && remaining > 0 && subtotal > 0 ? (
        <p className="mt-4 bg-bx-cream px-3 py-2 text-xs text-bx-charcoal">
          Add <strong>{formatPrice(Math.ceil(remaining * 100) / 100)}</strong> more for free shipping.
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function CartView() {
  const cart = useCart();
  const hydrated = useHydrated();
  const favorites = useFavorites();
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>("ship");
  const effective: FulfillmentMethod = cart.hasPickupOnly ? "pickup" : fulfillment;

  if (!hydrated) return <div className={`${container} py-24 text-center text-sm text-bx-muted`}>Loading your cart…</div>;

  if (!cart.items.length) {
    return (
      <div className={`${container} py-20 text-center`}>
        <Icon name="bag" size={44} className="mx-auto text-bx-ink" />
        <h1 className="mt-4 font-bx-serif text-4xl text-bx-ink">Your cart is empty</h1>
        <p className="mt-2 text-bx-muted">Treasures are waiting. Start with today&apos;s hot deals.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href={routes.deals} className={btn.primary}>Shop Hot Deals</Link>
          <Link href={routes.shop} className={btn.outline}>Browse All</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${container} py-10`}>
      <h1 className="font-bx-serif text-4xl text-bx-ink sm:text-5xl">Your Cart</h1>
      <p className="mt-1 text-sm text-bx-muted">{cart.count} {cart.count === 1 ? "item" : "items"}</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <ul className="divide-y divide-bx-line border border-bx-line bg-white">
            {cart.items.map(({ product }) => (
              <li key={product.id} className="flex gap-4 p-4 sm:p-5">
                <Link href={routes.product(product.slug)} className="h-24 w-24 shrink-0 overflow-hidden sm:h-28 sm:w-28">
                  <ProductArt product={product} sizes="112px" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-bx-muted">{product.brand}</p>
                      <Link href={routes.product(product.slug)} className="line-clamp-2 font-medium text-bx-ink hover:underline">{product.name}</Link>
                      <p className="mt-1 text-xs text-bx-muted">Condition: {product.condition} · Qty 1 (one of a kind)</p>
                      {!product.shippable ? <p className="mt-1 text-xs font-semibold text-bx-ruby">In-store pickup only</p> : null}
                    </div>
                    <p className="shrink-0 font-semibold text-bx-ink">{formatPrice(product.price)}</p>
                  </div>
                  <div className="mt-auto flex gap-4 pt-3 text-xs font-semibold">
                    <button type="button" onClick={() => cart.remove(product.id)} className="inline-flex items-center gap-1 text-bx-muted hover:text-bx-ruby">
                      <Icon name="trash" size={14} /> Remove
                    </button>
                    {!favorites.has(product.id) ? (
                      <button type="button" onClick={() => { favorites.toggle(product.id); cart.remove(product.id); }} className="inline-flex items-center gap-1 text-bx-muted hover:text-bx-ink">
                        <Icon name="heart" size={14} /> Save for later
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <fieldset className="border border-bx-line bg-white p-5">
            <legend className="sr-only">Delivery method</legend>
            <p className="mb-3 text-sm font-semibold text-bx-ink">Delivery method</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { value: "ship", icon: "truck", title: "Ship to me", text: `Free over $${site.commerce.freeShippingThreshold}, otherwise ${formatMoney(site.commerce.flatShipping)}` },
                  { value: "pickup", icon: "store", title: "Buy Online, Pick Up In Store", text: "Free · Pay online or with cash at pickup" },
                ] as const
              ).map((opt) => {
                const disabled = opt.value === "ship" && cart.hasPickupOnly;
                return (
                  <label key={opt.value} className={`flex cursor-pointer items-start gap-3 border p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bx-ink ${effective === opt.value ? "border-bx-ink" : "border-bx-line"} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}>
                    <input type="radio" name="cart-fulfillment" className="sr-only" checked={effective === opt.value} disabled={disabled} onChange={() => setFulfillment(opt.value)} />
                    <Icon name={opt.icon} size={22} className="mt-0.5 text-bx-ink" />
                    <span>
                      <span className="block text-sm font-semibold text-bx-ink">{opt.title}</span>
                      <span className="block text-xs text-bx-muted">{opt.text}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {cart.hasPickupOnly ? <p className="mt-3 text-xs text-bx-muted">Your cart has an item that&apos;s pickup only, so this order will be prepared for in-store pickup.</p> : null}
          </fieldset>
        </div>

        <aside className="lg:sticky lg:top-40 lg:self-start">
          <OrderSummary subtotal={cart.subtotal} fulfillment={effective}>
            <Link href={`${routes.checkout}?fulfillment=${effective}`} className={`${btn.primary} mt-6 w-full !py-4`}>
              <Icon name="lock" size={18} /> Secure Checkout
            </Link>
            <PaymentBadges tone="dark" className="mt-5 justify-center" />
          </OrderSummary>
        </aside>
      </div>
    </div>
  );
}
