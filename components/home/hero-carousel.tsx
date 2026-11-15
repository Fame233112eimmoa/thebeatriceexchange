"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { getProductBySlug } from "../../lib/catalog";
import { cx } from "../../lib/format";
import { siteImage } from "../../lib/images";
import { routes } from "../../lib/routes";
import { Icon } from "../ui/icon";
import { ProductArt } from "../ui/product-art";
import { btn, container } from "../ui/styles";

type Slide = {
  /** Matches the hero image key written by scripts/fetch-images.ts. */
  id: "luxury" | "pawn" | "rare";
  title: string;
  text: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
  feature: string;
};

const slides: Slide[] = [
  {
    id: "luxury",
    title: "Luxury Finds. Everyday Prices.",
    text: "Up to 50% off jewelry, watches and electronics. Every piece inspected and authenticated.",
    cta: { label: "Shop now", href: routes.shop },
    secondary: { label: "Hot deals", href: routes.deals },
    feature: "rolex-datejust-36-steel-and-white-gold",
  },
  {
    id: "pawn",
    title: "Quick cash, kept confidential.",
    text: "Free appraisals, no credit check, and secure storage until you pick your item back up.",
    cta: { label: "How pawning works", href: routes.howToPawn },
    secondary: { label: "Free estimate", href: routes.estimate },
    feature: "1-52-ct-round-diamond-solitaire-14k-white-gold",
  },
  {
    id: "rare",
    title: "Gold, coins and rare pieces.",
    text: "Graded coins, bullion, vintage instruments and collector cameras, chosen by our specialists.",
    cta: { label: "Explore rare finds", href: routes.rareFinds },
    secondary: { label: "Sell your gold", href: routes.howToSell },
    feature: "1924-saint-gaudens-20-double-eagle-ms63",
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const go = useCallback((next: number) => setIndex((next + count) % count), [count]);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => go(index + 1), 7000);
    return () => window.clearTimeout(id);
  }, [index, paused, go]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative border-b border-bx-line bg-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="grid">
        {slides.map((slide, i) => {
          const product = getProductBySlug(slide.feature);
          const photo = siteImage("hero", slide.id);
          const active = i === index;
          return (
            <div
              key={slide.title}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              inert={!active}
              className={cx("col-start-1 row-start-1 transition-opacity duration-500", active ? "opacity-100" : "pointer-events-none opacity-0")}
            >
              <div className={`${container} grid items-center gap-6 pb-16 pt-5 md:grid-cols-2 md:gap-16 md:py-16`}>
                <div className="flex flex-col justify-center">
                  {i === 0 ? (
                    <h1 className="font-bx-serif text-[44px] font-normal leading-[1.05] text-bx-ink sm:text-6xl">{slide.title}</h1>
                  ) : (
                    <h2 className="font-bx-serif text-[44px] font-normal leading-[1.05] text-bx-ink sm:text-6xl">{slide.title}</h2>
                  )}
                  <p className="mt-5 max-w-md text-base leading-relaxed text-bx-muted">{slide.text}</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href={slide.cta.href} className={btn.primary}>
                      {slide.cta.label}
                    </Link>
                    {slide.secondary ? (
                      <Link href={slide.secondary.href} className={btn.outline}>
                        {slide.secondary.label}
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="relative order-first aspect-[16/10] overflow-hidden bg-[#f4f4f3] md:order-none md:aspect-[4/3]">
                  {photo ? (
                    <Image src={photo.src} alt={photo.alt} fill priority={i === 0} sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                  ) : product ? (
                    <ProductArt product={product} sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw" />
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`${container} absolute inset-x-0 bottom-5 flex items-center gap-4 md:bottom-6`}>
        <div className="-ml-2 flex items-center gap-1">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="flex h-8 w-8 items-center justify-center text-bx-ink hover:opacity-60">
            <Icon name="chevronLeft" size={18} />
          </button>
          <span className="w-10 text-center text-xs tabular-nums text-bx-muted" aria-live="polite">
            {index + 1} / {count}
          </span>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="flex h-8 w-8 items-center justify-center text-bx-ink hover:opacity-60">
            <Icon name="chevronRight" size={18} />
          </button>
        </div>
        <button type="button" onClick={() => setPaused((p) => !p)} className="text-xs text-bx-muted underline-offset-2 hover:underline">
          {paused ? "Play" : "Pause"}
        </button>
      </div>
    </section>
  );
}
