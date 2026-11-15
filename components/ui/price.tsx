import { cx, discountOf, formatPrice } from "../../lib/format";

export function Price({
  price,
  originalPrice,
  size = "md",
}: {
  price: number;
  originalPrice?: number;
  size?: "md" | "lg";
}) {
  const discount = discountOf(price, originalPrice);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={cx("text-bx-ink", size === "lg" ? "text-2xl font-medium" : "text-[15px] font-medium", discount && "text-bx-ruby")}>
        {formatPrice(price)}
      </span>
      {discount ? (
        <>
          <span className={cx("text-bx-muted line-through", size === "lg" ? "text-base" : "text-[13px]")}>
            <span className="sr-only">Was </span>
            {formatPrice(originalPrice!)}
          </span>
          {size === "lg" ? <span className="text-sm text-bx-muted">You save {formatPrice(discount.savings)}</span> : null}
        </>
      ) : null}
    </div>
  );
}

export function DiscountBadge({ price, originalPrice }: { price: number; originalPrice?: number }) {
  const discount = discountOf(price, originalPrice);
  if (!discount) return null;
  return (
    <span className="inline-block bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-bx-ruby">
      {discount.percent}% off – Save {formatPrice(discount.savings)}
    </span>
  );
}
