"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";

import { cx } from "../../lib/format";
import { Icon } from "./icon";

/** Accessible horizontal scroll-snap slider with prev/next controls. */
export function Slider({
  children,
  label,
  itemClassName = "w-[72%] sm:w-[42%] md:w-[31%] lg:w-[23.5%]",
  tone = "dark",
}: {
  children: React.ReactNode;
  label: string;
  itemClassName?: string;
  tone?: "dark" | "light";
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const frame = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const buttonClass = cx(
    "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border transition md:flex disabled:pointer-events-none disabled:opacity-0",
    tone === "dark"
      ? "border-bx-line bg-white text-bx-ink hover:border-bx-ink"
      : "border-white/30 bg-bx-ink text-white hover:bg-white hover:text-bx-ink",
  );

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={label}>
      <button type="button" aria-label={`Scroll ${label} left`} onClick={() => scroll(-1)} disabled={edges.start} className={cx(buttonClass, "-left-5")}>
        <Icon name="chevronLeft" />
      </button>
      <ul
        ref={trackRef}
        className="bx-scroll-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-0 sm:scroll-px-0 sm:px-0 sm:gap-5"
      >
        {Children.map(children, (child) => (
          <li className={cx("shrink-0 snap-start", itemClassName)}>{child}</li>
        ))}
      </ul>
      <button type="button" aria-label={`Scroll ${label} right`} onClick={() => scroll(1)} disabled={edges.end} className={cx(buttonClass, "-right-5")}>
        <Icon name="chevronRight" />
      </button>
    </div>
  );
}
