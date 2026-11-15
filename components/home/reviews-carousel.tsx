"use client";

import { useState } from "react";

import { reviews } from "../../data/reviews";
import { site } from "../../data/site";
import { formatDate } from "../../lib/format";
import { Icon } from "../ui/icon";
import { SectionHeading } from "../ui/section-heading";
import { Stars } from "../ui/stars";
import { container } from "../ui/styles";

export function ReviewsCarousel() {
  const [start, setStart] = useState(0);
  const count = reviews.length;
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / count;
  const visible = [0, 1, 2].map((offset) => reviews[(start + offset) % count]);

  return (
    <section className="border-t border-bx-line" aria-labelledby="reviews-heading">
      <div className={`${container} py-16`}>
        <SectionHeading id="reviews-heading" title="Customer reviews" viewAllHref={site.googleReviewsUrl} viewAllLabel="See all reviews on Google" />
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-bx-ink">
          <Stars rating={Math.round(average)} size={16} />
          <span>{average.toFixed(1)} average</span>
          {site.reviewsAreSamples ? <span className="text-xs text-bx-ruby">Sample reviews: replace before launch</span> : null}
        </div>
        <ul className="grid gap-10 md:grid-cols-3 md:gap-8" aria-live="polite">
          {visible.map((review, i) => (
            <li key={review.id} className={i > 0 ? "hidden md:block" : ""}>
              <Stars rating={review.rating} size={14} />
              <blockquote className="mt-4 font-bx-serif text-[22px] leading-snug text-bx-ink">“{review.text}”</blockquote>
              <p className="mt-4 text-sm text-bx-ink">{review.name}</p>
              <p className="text-xs text-bx-muted">
                {review.topic} · {formatDate(review.date)}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex items-center gap-1">
          <button type="button" aria-label="Previous review" onClick={() => setStart((s) => (s - 1 + count) % count)} className="flex h-9 w-9 items-center justify-center border border-bx-line hover:border-bx-ink">
            <Icon name="chevronLeft" size={16} />
          </button>
          <button type="button" aria-label="Next review" onClick={() => setStart((s) => (s + 1) % count)} className="flex h-9 w-9 items-center justify-center border border-bx-line hover:border-bx-ink">
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
