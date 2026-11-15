"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { site } from "../../data/site";
import { routes } from "../../lib/routes";
import { Icon } from "../ui/icon";
import { container } from "../ui/styles";

export function UtilityBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % site.announcements.length), 4500);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <div className="bg-bx-ink text-white">
      <div className={`${container} flex h-9 items-center justify-between gap-4 text-xs`}>
        <div
          className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          aria-live="polite"
        >
          <p key={index} className="truncate">
            {site.announcements[index]}
          </p>
        </div>
        <ul className="hidden items-center gap-5 text-white/75 md:flex">
          <li>
            <Link href={routes.stores} className="inline-flex items-center gap-1.5 hover:text-white">
              <Icon name="clock" size={14} /> Store Hours
            </Link>
          </li>
          <li>
            <Link href={routes.stores} className="inline-flex items-center gap-1.5 hover:text-white">
              <Icon name="pin" size={14} /> Store Locator
            </Link>
          </li>
          <li>
            <a href={`tel:${site.phone.tel}`} className="inline-flex items-center gap-1.5 text-white hover:text-white">
              <Icon name="phone" size={14} /> {site.phone.display}
            </a>
          </li>
        </ul>
        <a
          href={`tel:${site.phone.tel}`}
          className="inline-flex shrink-0 items-center gap-1.5 font-semibold md:hidden"
          aria-label={`Call ${site.phone.display}`}
        >
          <Icon name="phone" size={14} /> Call
        </a>
      </div>
    </div>
  );
}
