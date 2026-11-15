import Image from "next/image";

import { getCategory } from "../../data/categories";
import { cx } from "../../lib/format";
import { stockProductPhotos, type SiteImage } from "../../lib/images";
import type { Product } from "../../lib/types";
import { Icon } from "./icon";

/**
 * Photos for a product, best source first:
 *   1. `product.images` (your own photos of the actual item)
 *   2. stock photos downloaded by `npm run fetch-images`
 */
export function productPhotos(product: Product): SiteImage[] {
  if (product.images?.length) {
    return product.images.map((src, i) => ({ src, alt: i ? `${product.name}, photo ${i + 1}` : product.name }));
  }
  return stockProductPhotos(product.slug);
}

/** True when the product is shown with stock photography rather than its own photos. */
export function usesStockPhotos(product: Product) {
  return !product.images?.length && stockProductPhotos(product.slug).length > 0;
}

/**
 * Product image for cards, galleries and thumbnails. Falls back to a flat
 * gray tile with a category glyph when no photo exists yet.
 */
export function ProductArt({
  product,
  view = 0,
  className,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority = false,
}: {
  product: Product;
  view?: number;
  className?: string;
  /** Rendered width hint for next/image, e.g. "80px". */
  sizes?: string;
  priority?: boolean;
}) {
  const photo = productPhotos(product)[view];
  if (photo) {
    return (
      <span className={cx("relative block h-full w-full overflow-hidden bg-[#f4f4f3]", className)}>
        <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </span>
    );
  }

  const icon = /watch/i.test(product.subcategory) ? "watch" : getCategory(product.category)?.icon ?? "sparkle";
  const width = ["38%", "52%", "30%", "44%"][view % 4];

  return (
    <div
      role="img"
      aria-label={`${product.name}${view ? `, view ${view + 1}` : ""}`}
      className={cx("flex h-full w-full items-center justify-center bg-[#f4f4f3]", className)}
    >
      <Icon name={icon} strokeWidth={0.75} size={24} style={{ width, height: "auto" }} className="text-[#2a2a2a]" />
    </div>
  );
}
