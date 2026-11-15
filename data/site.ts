/**
 * Business details. Everything in [BRACKETS] is a placeholder to replace
 * before launch.
 */
export const site = {
  name: "The Beatrice Exchange",
  shortName: "Beatrice Exchange",
  tagline: "Where Value Meets Trust.",
  owner: "Beatrice Hostetler Smith",
  description:
    "The Beatrice Exchange is a boutique pawn and resale shop for fine jewelry, gold, designer goods and quality electronics. Shop pre-owned luxury, get a fair loan or sell your items for cash.",
  url: "https://www.beatriceexchange.com", // [PLACEHOLDER DOMAIN]
  email: "hello@beatriceexchange.com", // [PLACEHOLDER EMAIL]
  phone: {
    display: "(406) 621-0863",
    tel: "+14066210863",
    sms: "+14066210863",
  },
  address: {
    street: "123 Exchange Avenue",
    city: "[CITY]",
    state: "AL",
    zip: "00000",
    country: "USA",
  },
  /** Used for the Google Maps embed + directions link. */
  mapQuery: "123 Exchange Avenue, [CITY], AL",
  hours: [
    { days: "Monday – Friday", time: "10:00 AM – 7:00 PM" },
    { days: "Saturday", time: "10:00 AM – 6:00 PM" },
    { days: "Sunday", time: "12:00 PM – 5:00 PM" },
  ],
  social: {
    instagram: "https://instagram.com/", // [PLACEHOLDER]
    facebook: "https://facebook.com/", // [PLACEHOLDER]
    tiktok: "https://tiktok.com/", // [PLACEHOLDER]
  },
  googleReviewsUrl: "https://www.google.com/maps", // [PLACEHOLDER] your Google Business review link
  commerce: {
    freeShippingThreshold: 99,
    flatShipping: 9.95,
    /** [PLACEHOLDER] estimated sales tax shown in the cart; real tax should come from Stripe Tax or similar. */
    estimatedTaxRate: 0.07,
  },
  /**
   * The homepage review carousel ships with sample text. While this is true a
   * small "sample reviews" note is shown. Replace data/reviews.ts with genuine
   * customer reviews (or a Google reviews widget) and set this to false.
   */
  reviewsAreSamples: true,
  announcements: [
    "Free shipping on orders over $99",
    "Free appraisals — no appointment needed",
    "Buy online, pick up in store",
  ],
} as const;

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.zip}`;

export const paymentMethods = [
  "Visa",
  "Mastercard",
  "Amex",
  "Discover",
  "Apple Pay",
  "Google Pay",
  "PayPal",
  "Affirm",
  "Klarna",
] as const;
