import { site } from "../data/site";
import { stockProductPhotos } from "./images";
import type { Product } from "./types";

/**
 * The live site's address, with no trailing slash. Search engines need full
 * URLs in the sitemap, canonical tags and structured data.
 *
 * Set NEXT_PUBLIC_SITE_URL in your host's environment variables (e.g.
 * https://www.yourdomain.com) or change `site.url` in data/site.ts.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || site.url).replace(/\/+$/, "");

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}

/** Full URLs of a product's photos (own photos first, then stock). */
export function productImageUrls(product: Product) {
  const files = product.images?.length ? product.images : stockProductPhotos(product.slug).map((photo) => photo.src);
  return files.map((file) => absoluteUrl(file));
}

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** "Monday – Friday" → ["Monday", …, "Friday"]; "Saturday" → ["Saturday"]. */
function expandDays(label: string) {
  const [from, to] = label.split(/\s*[–-]\s*/);
  const start = DAY_ORDER.indexOf(from);
  const end = DAY_ORDER.indexOf(to ?? from);
  return start < 0 || end < start ? [] : DAY_ORDER.slice(start, end + 1);
}

/** "7:00 PM" → "19:00". */
function to24h(time: string) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match) return undefined;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour += 12;
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
}

function openingHours() {
  return site.hours.flatMap(({ days, time }) => {
    const [opens, closes] = time.split(/\s*[–-]\s*/).map(to24h);
    const dayOfWeek = expandDays(days);
    if (!opens || !closes || !dayOfWeek.length) return [];
    return [{ "@type": "OpeningHoursSpecification", dayOfWeek, opens, closes }];
  });
}

/** True for real values, false for "[PLACEHOLDER]" text or bare social homepages. */
function isReal(value: string) {
  return !/\[|\]|^0+$/.test(value) && !/^https:\/\/(www\.)?[a-z]+\.com(\/maps)?\/?$/.test(value);
}

/**
 * The store's details for Google (Knowledge Panel, Maps, local results).
 * Placeholder fields are left out so they never reach search results.
 */
export function localBusinessJsonLd() {
  const { street, city, state, zip } = site.address;
  const addressKnown = [street, city, state, zip].every(isReal);
  const sameAs = [...Object.values(site.social), site.googleReviewsUrl].filter(isReal);
  return {
    "@context": "https://schema.org",
    "@type": ["JewelryStore", "PawnShop"],
    "@id": `${SITE_URL}/#store`,
    name: site.name,
    description: site.description,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo-dark.svg"),
    image: absoluteUrl("/opengraph-image"),
    telephone: site.phone.tel,
    priceRange: "$$",
    ...(addressKnown
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: street,
            addressLocality: city,
            addressRegion: state,
            postalCode: zip,
            addressCountry: "US",
          },
        }
      : {}),
    openingHoursSpecification: openingHours(),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: site.name,
    alternateName: site.shortName,
    url: absoluteUrl("/"),
  };
}

/** Serialize JSON-LD for a <script> tag without letting "</script>" break out. */
export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
