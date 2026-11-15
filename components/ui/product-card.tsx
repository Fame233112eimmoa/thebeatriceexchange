"use client";

import Link from "next/link";
import { useState } from "react";

import { cx } from "../../lib/format";
import { routes } from "../../lib/routes";
import { useCart, useFavorites } from "../../lib/store";
import type { Product } from "../../lib/types";
import { Icon } from "./icon";
import { DiscountBadge, Price } from "./price";
import { ProductArt } from "./product-art";
import { QuickView } from "./quick-view";

export function ProductCard({ product, layout = "grid" }: { product: Product; layout?: "grid" | "list" }) {
  const favorites = useFavorites();
  const cart = useCart();
  const [quickView, setQuickView] = useState(false);
  const isFavorite = favorites.has(product.id);
  const inCart = cart.has(product.id);

  const iconBtn = "flex h-9 w-9 items-center justify-center bg-white text-bx-ink hover:bg-bx-ink hover:text-white";

  return (
    <article className={cx("group relative h-full", layout === "list" ? "flex flex-col gap-5 border-b border-bx-line pb-5 sm:flex-row" : "flex flex-col")}>
      <div className={cx("relative overflow-hidden", layout === "list" ? "aspect-square sm:w-56 sm:shrink-0" : "aspect-[4/5]")}>
        <Link href={routes.product(product.slug)} tabIndex={-1} aria-hidden="true" className="block h-full">
          <ProductArt product={product} sizes="(min-width: 1280px) 300px, (min-width: 768px) 30vw, 50vw" />
        </Link>

        <div className="absolute left-0 top-3 flex flex-col items-start gap-1">
          <DiscountBadge price={product.price} originalPrice={product.originalPrice} />
          {product.rareFind ? (
            <span className="bg-bx-ink px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-white">Rare find</span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => favorites.toggle(product.id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
          className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center text-bx-ink hover:opacity-60"
        >
          <Icon name="heart" size={20} filled={isFavorite} />
        </button>

        <div className="absolute inset-x-0 bottom-0 z-10 flex gap-px bg-bx-line opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          <button type="button" onClick={() => setQuickView(true)} aria-label={`Quick view ${product.name}`} className={cx(iconBtn, "h-10 flex-1 gap-2 text-[12px] font-medium uppercase tracking-[0.06em]")}>
            <Icon name="eye" size={16} /> <span className="hidden sm:inline">Quick view</span>
          </button>
          <button
            type="button"
            onClick={() => cart.add(product.id)}
            disabled={inCart}
            aria-label={inCart ? `${product.name} is in your cart` : `Add ${product.name} to cart`}
            className={cx(iconBtn, "h-10 flex-1 gap-2 text-[12px] font-medium uppercase tracking-[0.06em] disabled:bg-white disabled:text-bx-muted")}
          >
            <Icon name={inCart ? "check" : "bag"} size={16} /> <span className="hidden sm:inline">{inCart ? "In cart" : "Add to cart"}</span>
          </button>
        </div>
      </div>

      <div className={cx("flex flex-1 flex-col gap-1", layout === "grid" && "pt-3")}>
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-bx-muted">{product.brand}</p>
        <h3 className="line-clamp-2 text-[14px] leading-snug text-bx-ink">
          <Link href={routes.product(product.slug)} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <div className="mt-1">
          <Price price={product.price} originalPrice={product.originalPrice} />
        </div>
        <p className="text-[12px] text-bx-muted">{product.condition}</p>
        {layout === "list" ? <p className="mt-2 line-clamp-2 text-sm text-bx-muted">{product.description}</p> : null}
      </div>
      {quickView ? <QuickView product={product} onClose={() => setQuickView(false)} /> : null}
    </article>
  );
}
