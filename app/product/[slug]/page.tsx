import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductRail } from "@/components/home/sections";
import { BuyBox } from "@/components/product/buy-box";
import { Gallery } from "@/components/product/gallery";
import { container } from "@/components/ui/styles";
import { getCategory } from "@/data/categories";
import { site } from "@/data/site";
import { getAllProducts, getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { routes } from "@/lib/routes";
import { absoluteUrl, jsonLdScript, productImageUrls } from "@/lib/seo";

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Item not found" };
  const description = `${product.condition} ${product.name}, ${formatMoney(product.price)}. ${product.description}`.slice(0, 160);
  const [image] = productImageUrls(product);
  return {
    title: product.name,
    description,
    alternates: { canonical: routes.product(product.slug) },
    openGraph: { title: product.name, description, url: routes.product(product.slug), ...(image ? { images: [{ url: image, alt: product.name }] } : {}) },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const category = getCategory(product.category);
  const related = getRelatedProducts(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: absoluteUrl(routes.product(product.slug)),
    image: productImageUrls(product),
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description,
    itemCondition: "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price,
      url: absoluteUrl(routes.product(product.slug)),
      itemCondition: "https://schema.org/UsedCondition",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: site.name },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <div className={`${container} py-8`}>
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-bx-muted">
          <ol className="flex flex-wrap gap-1.5">
            <li><Link href={routes.home} className="hover:text-bx-ink">Home</Link> /</li>
            <li><Link href={routes.shop} className="hover:text-bx-ink">Shop</Link> /</li>
            {category ? <li><Link href={routes.category(category.slug)} className="hover:text-bx-ink">{category.name}</Link> /</li> : null}
            <li aria-current="page" className="line-clamp-1 text-bx-ink">{product.name}</li>
          </ol>
        </nav>
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <Gallery product={product} />
          <BuyBox product={product} />
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <section aria-labelledby="details">
            <h2 id="details" className="font-bx-serif text-3xl text-bx-ink">Details</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-bx-charcoal">{product.description}</p>
            <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.08em] text-bx-ink">Specifications</h3>
            <dl className="mt-3 divide-y divide-bx-line border border-bx-line bg-white">
              {[["Brand", product.brand], ["Category", category?.name ?? ""], ["Type", product.subcategory], ["Condition", product.condition], ...Object.entries(product.specs), ["SKU", product.sku]].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[140px_1fr] gap-4 px-5 py-3 text-sm sm:grid-cols-[200px_1fr]">
                  <dt className="text-bx-muted">{k}</dt>
                  <dd className="font-medium text-bx-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section aria-labelledby="shipping-returns" className="space-y-3">
            <h2 id="shipping-returns" className="font-bx-serif text-3xl text-bx-ink">Shipping &amp; Returns</h2>
            {[
              ["Shipping", `Free insured shipping on orders over $${site.commerce.freeShippingThreshold} within the contiguous U.S. Orders ship in 1–2 business days. Items over $1,000 require a signature.`],
              ["Buy Online, Pick Up In Store", "Choose in-store pickup at checkout. It's free, and usually ready the next business day. Bring a photo ID that matches the order name."],
              ["Returns", "Return most items within 14 days in the same condition for a refund to your original payment method. Bullion, coins and final-sale items are excluded."],
              ["Authenticity Guarantee", "Every luxury item is inspected by our specialists. If anything we sold is ever found not to be authentic, we'll refund it in full."],
            ].map(([title, text], i) => (
              <details key={title} open={i === 0} className="group border border-bx-line bg-white px-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-semibold text-bx-ink">
                  {title}
                  <span aria-hidden="true" className="text-xl transition group-open:rotate-45">+</span>
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-bx-muted">{text}</p>
              </details>
            ))}
            <p className="pt-2 text-sm">
              <Link href={routes.shipping} className="font-semibold underline">Shipping policy</Link> · <Link href={routes.returns} className="font-semibold underline">Returns policy</Link>
            </p>
          </section>
        </div>
      </div>
      {related.length ? <ProductRail id="related" title="Related Products" products={related} viewAllHref={routes.category(product.category)} /> : null}
    </>
  );
}
