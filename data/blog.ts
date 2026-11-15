import type { BlogPost } from "../lib/types";

export const blogPosts: BlogPost[] = [
  {
    slug: "how-pawn-loans-work",
    title: "How Pawn Loans Work",
    excerpt: "No credit check, no long applications. Here's exactly what happens from appraisal to payoff.",
    date: "2026-11-04",
    readMinutes: 5,
    category: "Pawn 101",
    icon: "coin",
    body: [
      {
        paragraphs: [
          "A pawn loan is one of the simplest ways to borrow money. Instead of a credit check, the loan is secured by something you own, such as a piece of jewelry, a watch, a laptop or a guitar.",
        ],
      },
      {
        heading: "1. Bring your item and a valid ID",
        paragraphs: [
          "Bring the item, plus any accessories, boxes or paperwork that came with it, and a government-issued photo ID. State law requires us to record your ID for every transaction.",
        ],
      },
      {
        heading: "2. Get a free appraisal",
        paragraphs: [
          "Our team inspects and tests the item, then checks current market values. We'll explain how we got to our number before we make an offer, and there's no obligation to accept.",
        ],
      },
      {
        heading: "3. Walk out with cash",
        paragraphs: [
          "If you accept, you'll sign a pawn ticket that lists the loan amount, finance charge, due date and total to redeem. Keep your ticket safe, because you'll need it to pay or pick up your item.",
        ],
      },
      {
        heading: "Repaying or extending",
        paragraphs: [
          "Pay the loan plus the finance charge before the due date and your item is returned to you. Need more time? In most cases you can pay just the finance charge to extend. Loan rates and terms follow Alabama law.",
        ],
      },
    ],
  },
  {
    slug: "whats-your-gold-worth",
    title: "What's Your Gold Worth?",
    excerpt: "Karats, weight and the spot price: a plain-English guide to valuing gold jewelry.",
    date: "2026-10-21",
    readMinutes: 4,
    category: "Gold & Bullion",
    icon: "bullion",
    body: [
      {
        paragraphs: [
          "Gold's value comes down to three things: purity, weight and the current market price, known as the spot price.",
        ],
      },
      {
        heading: "Purity (karats)",
        paragraphs: [
          "24K is pure gold. 18K is 75% gold, 14K is 58.3% and 10K is 41.7%. Look for a stamp inside a ring band or near a clasp, though we always verify with testing.",
        ],
      },
      {
        heading: "Weight",
        paragraphs: [
          "Gold is weighed in grams or pennyweight (dwt) and priced in troy ounces. One troy ounce is about 31.1 grams.",
        ],
      },
      {
        heading: "Melt value vs. resale value",
        paragraphs: [
          "Melt value is the gold content multiplied by spot. Designer pieces, antique jewelry and items with diamonds are often worth more than melt, and that's something we take into account.",
        ],
      },
    ],
  },
  {
    slug: "spotting-authentic-designer-bags",
    title: "Spotting Authentic Designer Bags",
    excerpt: "Stitching, hardware, date codes and smell: what our specialists check before anything hits the shelf.",
    date: "2026-10-07",
    readMinutes: 6,
    category: "Designer",
    icon: "handbag",
    body: [
      {
        paragraphs: [
          "Counterfeits keep getting better, which is why every bag we sell is inspected point by point. Here are a few things you can check yourself.",
        ],
      },
      {
        heading: "Stitching",
        paragraphs: [
          "Authentic bags have even, consistent stitches with a set count per inch. Crooked, loose or doubled stitching is a red flag.",
        ],
      },
      {
        heading: "Hardware",
        paragraphs: [
          "Zippers, clasps and feet should feel heavy and carry crisp, correctly spaced engravings.",
        ],
      },
      {
        heading: "Date codes and serials",
        paragraphs: [
          "Many houses use date codes or serial stickers. Their format should match the bag's style and production era.",
        ],
      },
      {
        heading: "When in doubt",
        paragraphs: [
          "Buy from a seller who stands behind authenticity. At BHS Premier Pawn and Jewelry, if an item we sold is ever found not to be genuine, you'll get a full refund.",
        ],
      },
    ],
  },
];

export function getPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
