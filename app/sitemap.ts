import type { MetadataRoute } from "next";

import { blogPosts } from "@/data/blog";
import { getAllProducts } from "@/lib/catalog";
import { routes } from "@/lib/routes";
import { absoluteUrl, productImageUrls } from "@/lib/seo";

/**
 * /sitemap.xml — submit this URL in Google Search Console (Sitemaps).
 * Cart, checkout and account pages are left out on purpose: they are
 * marked noindex and have nothing for search.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }> = [
    { path: routes.home, priority: 1, changeFrequency: "daily" },
    { path: routes.shop, priority: 0.9, changeFrequency: "daily" },
    { path: routes.howToPawn, priority: 0.8, changeFrequency: "monthly" },
    { path: routes.howToSell, priority: 0.8, changeFrequency: "monthly" },
    { path: routes.stores, priority: 0.8, changeFrequency: "monthly" },
    { path: routes.contact, priority: 0.7, changeFrequency: "monthly" },
    { path: routes.about, priority: 0.6, changeFrequency: "monthly" },
    { path: routes.faq, priority: 0.6, changeFrequency: "monthly" },
    { path: routes.payment, priority: 0.6, changeFrequency: "monthly" },
    { path: routes.rewards, priority: 0.5, changeFrequency: "monthly" },
    { path: routes.blog, priority: 0.6, changeFrequency: "weekly" },
    { path: routes.shipping, priority: 0.3, changeFrequency: "yearly" },
    { path: routes.returns, priority: 0.3, changeFrequency: "yearly" },
    { path: routes.loanTerms, priority: 0.3, changeFrequency: "yearly" },
    { path: routes.privacy, priority: 0.2, changeFrequency: "yearly" },
    { path: routes.terms, priority: 0.2, changeFrequency: "yearly" },
    { path: routes.accessibility, priority: 0.2, changeFrequency: "yearly" },
    { path: routes.photoCredits, priority: 0.1, changeFrequency: "yearly" },
  ];

  const products = getAllProducts();
  const newest = products.reduce((latest, p) => (p.addedAt > latest ? p.addedAt : latest), "2026-01-01");

  return [
    ...pages.map(({ path, priority, changeFrequency }) => ({
      url: absoluteUrl(path),
      lastModified: path === routes.home || path === routes.shop ? new Date(newest) : undefined,
      changeFrequency,
      priority,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(routes.product(product.slug)),
      lastModified: new Date(product.addedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: productImageUrls(product),
    })),
    ...blogPosts.map((post) => ({
      url: absoluteUrl(routes.post(post.slug)),
      lastModified: new Date(post.date),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
