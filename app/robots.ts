import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";

/**
 * /robots.txt — lets every search engine crawl the site and points them to the
 * sitemap. Cart, checkout and account pages stay crawlable on purpose: they
 * carry a noindex tag, and Google can only see that tag if it may fetch the page.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
