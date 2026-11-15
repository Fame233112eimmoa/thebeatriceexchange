import Link from "next/link";

import { cx } from "../../lib/format";
import { routes } from "../../lib/routes";

const B_PATH =
  "M20 19H33C38.5 19 41 21.8 41 25.2C41 28.2 39 30.4 35.8 31.3C39.9 32 42.5 34.6 42.5 38.2C42.5 42.4 39.4 45 33.6 45H20V43.6H23V20.4H20ZM27 20.6V30.6H32.4C35.6 30.6 37 28.6 37 25.6C37 22.4 35.4 20.6 32.4 20.6ZM27 32.2V43.4H33C36.6 43.4 38.4 41.4 38.4 37.8C38.4 34.2 36.4 32.2 32.6 32.2Z";

/** The "B" monogram inside a double diamond frame. */
export function Monogram({ size = 44, tone = "dark", className }: { size?: number; tone?: "dark" | "light"; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M32 2 62 32 32 62 2 32Z" fill="none" stroke="#b8955a" strokeWidth="1.4" />
      <path d="M32 6.5 57.5 32 32 57.5 6.5 32Z" fill="none" stroke="#b8955a" strokeWidth="0.6" opacity="0.7" />
      <path d={B_PATH} fill={tone === "dark" ? "#15161b" : "#faf7f1"} fillRule="evenodd" />
    </svg>
  );
}

/**
 * Wordmark. `variant="dark"` = dark ink text for light backgrounds,
 * `variant="light"` = ivory text for dark backgrounds. Static SVG versions live
 * in /public/logo-dark.svg and logo-light.svg.
 */
export function Logo({
  variant = "dark",
  compact = false,
  className,
  href = routes.home,
}: {
  variant?: "dark" | "light";
  compact?: boolean;
  className?: string;
  href?: string | null;
}) {
  const content = (
    <span className={cx("flex items-center gap-3", !href && className)}>
      <Monogram size={compact ? 38 : 46} tone={variant} />
      <span className="flex flex-col leading-none">
        <span
          className={cx(
            "font-bx-serif font-normal tracking-[0.09em] whitespace-nowrap",
            compact ? "text-[17px]" : "text-[19px] sm:text-[21px]",
            variant === "dark" ? "text-bx-ink" : "text-bx-ivory",
          )}
        >
          THE BEATRICE
        </span>
        <span
          className={cx(
            "mt-1 font-bx-serif text-[10.5px] font-normal tracking-[0.62em]",
            variant === "dark" ? "text-bx-ink" : "text-bx-champagne-soft",
          )}
        >
          EXCHANGE
        </span>
      </span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="The Beatrice Exchange — home" className={cx("shrink-0", className ?? "inline-flex")}>
      {content}
    </Link>
  );
}
