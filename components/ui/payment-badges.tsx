import { paymentMethods } from "../../data/site";
import { cx } from "../../lib/format";

/** Neutral text badges (not the networks' trademarked logos). */
export function PaymentBadges({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <ul className={cx("flex flex-wrap gap-2", className)} aria-label="Accepted payment methods">
      {paymentMethods.map((method) => (
        <li
          key={method}
          className={cx(
            "border px-2 py-0.5 text-[11px]",
            tone === "light" ? "border-white/15 bg-white/5 text-bx-ivory/80" : "border-bx-line bg-white text-bx-muted",
          )}
        >
          {method}
        </li>
      ))}
    </ul>
  );
}
