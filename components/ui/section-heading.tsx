import Link from "next/link";

import { cx } from "../../lib/format";

export function SectionHeading({
  title,
  description,
  viewAllHref,
  viewAllLabel = "View all",
  align = "left",
  tone = "dark",
  id,
}: {
  title: string;
  description?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  id?: string;
}) {
  return (
    <div
      className={cx(
        "mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "items-center text-center sm:flex-col sm:items-center",
      )}
    >
      <div className={cx(align === "center" && "mx-auto max-w-2xl")}>
        <h2
          id={id}
          className={cx("font-bx-serif text-3xl font-normal leading-tight sm:text-[40px]", tone === "dark" ? "text-bx-ink" : "text-white")}
        >
          {title}
        </h2>
        {description ? (
          <p className={cx("mt-2 max-w-xl text-[15px] leading-relaxed", tone === "dark" ? "text-bx-muted" : "text-white/70")}>{description}</p>
        ) : null}
      </div>
      {viewAllHref ? (
        <Link
          href={viewAllHref}
          className={cx(
            "shrink-0 self-start border-b pb-0.5 text-[13px] font-medium sm:self-auto",
            tone === "dark" ? "border-bx-ink text-bx-ink hover:opacity-60" : "border-white text-white hover:opacity-70",
          )}
        >
          {viewAllLabel}
        </Link>
      ) : null}
    </div>
  );
}
