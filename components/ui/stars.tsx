import { Icon } from "./icon";

export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-bx-ink" aria-label={`${rating} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={size} strokeWidth={1.25} filled={n <= rating} className={n <= rating ? "" : "text-bx-line"} />
      ))}
    </span>
  );
}
