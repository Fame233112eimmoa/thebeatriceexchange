import type { Review } from "../lib/types";

/**
 * SAMPLE CONTENT — these are placeholder reviews for layout only.
 * Replace them with genuine customer reviews (or a Google Reviews embed)
 * before launch, then set `site.reviewsAreSamples` to false.
 * Publishing invented reviews as real ones is deceptive and violates FTC rules.
 */
export const reviews: Review[] = [
  {
    id: "r1",
    name: "Sample Customer A.",
    rating: 5,
    date: "2026-10-30",
    topic: "Pawn loan",
    text: "Placeholder review: the appraisal was explained step by step and I left with a loan the same visit.",
  },
  {
    id: "r2",
    name: "Sample Customer B.",
    rating: 5,
    date: "2026-10-18",
    topic: "Jewelry purchase",
    text: "Placeholder review: found an estate ring for far less than retail, and they resized it for me.",
  },
  {
    id: "r3",
    name: "Sample Customer C.",
    rating: 4,
    date: "2026-09-29",
    topic: "Sold electronics",
    text: "Placeholder review: fair offer on my laptop and a quick, no-pressure process.",
  },
  {
    id: "r4",
    name: "Sample Customer D.",
    rating: 5,
    date: "2026-09-12",
    topic: "Designer handbag",
    text: "Placeholder review: they walked me through how the bag was authenticated before I bought it.",
  },
  {
    id: "r5",
    name: "Sample Customer E.",
    rating: 5,
    date: "2026-08-27",
    topic: "Online order",
    text: "Placeholder review: ordered online, picked up in store the next day. Easy.",
  },
];
