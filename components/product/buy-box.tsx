"use client";

import Link from "next/link";
import { useState } from "react";

import { fullAddress, site } from "../../data/site";
import { cx } from "../../lib/format";
import { routes } from "../../lib/routes";
import { useCart, useFavorites } from "../../lib/store";
import type { FulfillmentMethod, Product } from "../../lib/types";
import { Icon } from "../ui/icon";
import { Price } from "../ui/price";
import { btn } from "../ui/styles";

const gradeCopy: Record<Product["condition"], string> = {
  "Like New": "No visible wear. May include original packaging.",
  Excellent: "Minimal signs of use, fully functional.",
  Good: "Light wear consistent with normal use, fully functional.",
  Fair: "Noticeable wear, fully functional. Priced accordingly.",
};

export function BuyBox({ product }: { product: Product }) {
  const cart = useCart();
  const favorites = useFavorites();
  const [method, setMethod] = useState<FulfillmentMethod>(product.shippable ? "ship" : "pickup");
  const inCart = cart.has(product.id);
  const isFavorite = favorites.has(product.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-bx-ink">{product.brand}</p>
        <h1 className="mt-2 font-bx-serif text-3xl font-normal leading-tight text-bx-ink sm:text-4xl">{product.name}</h1>
        <p className="mt-2 text-xs text-bx-muted">SKU {product.sku}</p>
      </div>

      <Price price={product.price} originalPrice={product.originalPrice} size="lg" />
      <p className="-mt-3 text-sm text-bx-muted">
        Or as low as ${Math.ceil(product.price / 12)}/mo with Affirm or Klarna. <span className="text-xs">(Subject to approval.)</span>
      </p>

      <div className="border border-bx-line bg-white p-4">
        <p className="text-sm">
          <span className="font-semibold text-bx-ink">Condition: </span>
          <span className="text-bx-ink">{product.condition}</span>
        </p>
        <ol className="mt-3 grid grid-cols-4 gap-1" aria-label="Condition scale">
          {(["Fair", "Good", "Excellent", "Like New"] as const).map((g) => (
            <li key={g} className="text-center">
              <span className={cx("block h-1.5", g === product.condition ? "bg-bx-ink" : "bg-bx-line")} />
              <span className={cx("mt-1 block text-[11px]", g === product.condition ? "font-semibold text-bx-ink" : "text-bx-muted")}>{g}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-bx-muted">{gradeCopy[product.condition]}</p>
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-bx-ink">How would you like it?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              { value: "ship", icon: "truck", title: "Ship to me", text: product.shippable ? (product.price >= site.commerce.freeShippingThreshold ? "Free insured shipping" : "Ships in 1–2 business days") : "Not available for this item", disabled: !product.shippable },
              { value: "pickup", icon: "store", title: "Pick Up In Store", text: "Free, usually ready next business day", disabled: !product.pickupAvailable },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={cx(
                "flex cursor-pointer items-start gap-3 border p-4 transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bx-ink",
                method === opt.value ? "border-bx-ink bg-white" : "border-bx-line bg-white/60",
                opt.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <input type="radio" name="fulfillment" value={opt.value} checked={method === opt.value} disabled={opt.disabled} onChange={() => setMethod(opt.value)} className="sr-only" />
              <Icon name={opt.icon} size={22} className="mt-0.5 shrink-0 text-bx-ink" />
              <span>
                <span className="block text-sm font-semibold text-bx-ink">{opt.title}</span>
                <span className="block text-xs text-bx-muted">{opt.text}</span>
              </span>
            </label>
          ))}
        </div>
        {method === "pickup" ? <p className="mt-2 text-xs text-bx-muted">Pickup at {fullAddress}</p> : null}
      </fieldset>

      <div className="flex gap-3">
        <button type="button" className={`${btn.primary} flex-1 !py-4`} onClick={() => cart.add(product.id)} disabled={inCart}>
          <Icon name={inCart ? "check" : "bag"} size={18} /> {inCart ? "Added to Cart" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={() => favorites.toggle(product.id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={cx("flex h-14 w-14 shrink-0 items-center justify-center border", isFavorite ? "border-bx-ruby text-bx-ruby" : "border-bx-line text-bx-ink hover:border-bx-ink")}
        >
          <Icon name="heart" size={22} filled={isFavorite} />
        </button>
      </div>
      {inCart ? (
        <Link href={routes.cart} className={`${btn.gold} -mt-3`}>
          View Cart &amp; Checkout
        </Link>
      ) : null}
      <p className="-mt-2 text-xs text-bx-muted">One-of-a-kind item. Only 1 available.</p>

      <ul className="grid gap-3 border-t border-bx-line pt-5 text-sm text-bx-charcoal sm:grid-cols-3">
        <li className="flex items-center gap-2"><Icon name="shield" size={18} className="text-bx-ink" /> Authenticity guaranteed</li>
        <li className="flex items-center gap-2"><Icon name="history" size={18} className="text-bx-ink" /> 14-day returns</li>
        <li className="flex items-center gap-2"><Icon name="lock" size={18} className="text-bx-ink" /> Secure checkout</li>
      </ul>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="text-bx-muted">Questions about this item?</span>
        <a href={`tel:${site.phone.tel}`} className="font-semibold text-bx-ink underline underline-offset-2">Call</a>
        <span className="text-bx-muted">or</span>
        <a href={`sms:${site.phone.sms}?body=${encodeURIComponent(`Hi! Question about ${product.name} (${product.sku})`)}`} className="font-semibold text-bx-ink underline underline-offset-2">
          Text Us
        </a>
      </div>
    </div>
  );
}
