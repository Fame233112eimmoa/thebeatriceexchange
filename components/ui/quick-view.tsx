"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { routes } from "../../lib/routes";
import { useCart, useFavorites } from "../../lib/store";
import type { Product } from "../../lib/types";
import { Icon } from "./icon";
import { DiscountBadge, Price } from "./price";
import { ProductArt } from "./product-art";
import { btn } from "./styles";

export function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cart = useCart();
  const favorites = useFavorites();
  const inCart = cart.has(product.id);

  useEffect(() => {
    // No close() in cleanup: under StrictMode that fires `close` → onClose and
    // unmounts the dialog immediately. Removing the node closes it anyway.
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      aria-labelledby={`qv-${product.id}`}
      className="m-auto w-[min(920px,calc(100vw-2rem))] max-w-none overflow-hidden bg-white p-0 text-left backdrop:bg-bx-ink/60"
    >
      <div className="relative grid max-h-[85vh] overflow-y-auto md:grid-cols-2">
        <button type="button" onClick={onClose} aria-label="Close quick view" className={`${btn.icon} absolute right-3 top-3 z-10 bg-white`}>
          <Icon name="close" />
        </button>
        <div className="relative aspect-square">
          <ProductArt product={product} sizes="(min-width: 768px) 460px, 100vw" />
          <div className="absolute left-4 top-4">
            <DiscountBadge price={product.price} originalPrice={product.originalPrice} />
          </div>
        </div>
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-bx-muted">{product.brand}</p>
          <h2 id={`qv-${product.id}`} className="font-bx-serif text-2xl font-normal leading-snug text-bx-ink sm:text-3xl">
            {product.name}
          </h2>
          <Price price={product.price} originalPrice={product.originalPrice} size="lg" />
          <p className="text-sm">
            <span className="font-semibold text-bx-ink">Condition:</span> <span className="text-bx-charcoal">{product.condition}</span>
          </p>
          <p className="text-sm leading-relaxed text-bx-muted">{product.description}</p>
          <div className="mt-auto flex flex-wrap gap-3 pt-2">
            <button type="button" className={btn.primary} onClick={() => cart.add(product.id)} disabled={inCart}>
              <Icon name={inCart ? "check" : "bag"} size={18} />
              {inCart ? "In Your Cart" : "Add to Cart"}
            </button>
            <button
              type="button"
              className={btn.outline}
              onClick={() => favorites.toggle(product.id)}
              aria-pressed={favorites.has(product.id)}
            >
              <Icon name="heart" size={18} filled={favorites.has(product.id)} />
              {favorites.has(product.id) ? "Saved" : "Save"}
            </button>
          </div>
          <Link href={routes.product(product.slug)} className="text-sm font-semibold text-bx-ink underline underline-offset-4">
            View full details
          </Link>
        </div>
      </div>
    </dialog>
  );
}
