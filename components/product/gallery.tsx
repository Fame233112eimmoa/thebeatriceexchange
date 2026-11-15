"use client";

import { useState } from "react";

import { cx } from "../../lib/format";
import type { Product } from "../../lib/types";
import { Icon } from "../ui/icon";
import { DiscountBadge } from "../ui/price";
import { ProductArt, productPhotos, usesStockPhotos } from "../ui/product-art";

/** Image gallery with thumbnail strip and hover / tap-to-zoom. */
export function Gallery({ product }: { product: Product }) {
  const [view, setView] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [locked, setLocked] = useState(false);
  const photoCount = productPhotos(product).length;
  const views = Array.from({ length: photoCount || 4 }, (_, i) => i);

  function track(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      <ul className="flex gap-3 md:flex-col" aria-label="Product images">
        {views.map((v) => (
          <li key={v}>
            <button
              type="button"
              onClick={() => setView(v)}
              aria-label={`Show image ${v + 1}`}
              aria-current={v === view}
              className={cx(
                "h-16 w-16 overflow-hidden border-2 sm:h-20 sm:w-20",
                v === view ? "border-bx-ink" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <ProductArt product={product} view={v} sizes="80px" />
            </button>
          </li>
        ))}
      </ul>
      <div className="relative flex-1">
        <div
          className={cx("relative aspect-square overflow-hidden border border-bx-line", zoom ? "cursor-zoom-out" : "cursor-zoom-in")}
          onPointerMove={(e) => (e.pointerType === "mouse" || locked) && track(e)}
          onPointerLeave={() => !locked && setZoom(null)}
          onClick={(e) => {
            if (locked) {
              setLocked(false);
              setZoom(null);
            } else {
              setLocked(true);
              track(e as unknown as React.PointerEvent<HTMLDivElement>);
            }
          }}
        >
          <div
            className="h-full w-full transition-transform duration-200 ease-out"
            style={zoom ? { transform: "scale(2.2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          >
            <ProductArt product={product} view={view} sizes="(min-width: 1024px) 560px, 100vw" priority />
          </div>
          <div className="pointer-events-none absolute left-4 top-4">
            <DiscountBadge price={product.price} originalPrice={product.originalPrice} />
          </div>
          <span className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-1.5 bg-white/90 px-3 py-1.5 text-xs font-medium text-bx-charcoal">
            <Icon name="search" size={14} /> {zoom ? "Click to exit zoom" : "Hover or tap to zoom"}
          </span>
        </div>
        {usesStockPhotos(product) ? (
          <p className="mt-2 text-xs text-bx-muted">Representative photos. Ask us for pictures of the actual item.</p>
        ) : null}
      </div>
    </div>
  );
}
