import Image from "next/image";
import Link from "next/link";

import { blogPosts } from "../../data/blog";
import { categories } from "../../data/categories";
import { formatDate } from "../../lib/format";
import { siteImage } from "../../lib/images";
import { routes } from "../../lib/routes";
import type { Product } from "../../lib/types";
import { NewsletterForm } from "../forms/newsletter-form";
import { Icon, type IconName } from "../ui/icon";
import { ProductCard } from "../ui/product-card";
import { SectionHeading } from "../ui/section-heading";
import { Slider } from "../ui/slider";
import { btn, container } from "../ui/styles";

export function CtaCards() {
  const cards = [
    {
      title: "Need quick cash? Pawn with us.",
      text: "No credit check and a free appraisal. Your item is stored securely and returned when you repay.",
      href: routes.howToPawn,
      cta: "Start a pawn loan",
    },
    {
      title: "Have items to sell? Get an offer today.",
      text: "Gold, diamonds, watches, designer bags and electronics. Get a fair offer and get paid on the spot.",
      href: routes.howToSell + "#estimate",
      cta: "Get an offer",
    },
  ];
  return (
    <section aria-label="Pawn or sell">
      <div className={`${container} grid divide-y divide-bx-line md:grid-cols-2 md:divide-x md:divide-y-0`}>
      {cards.map((card) => (
        <Link key={card.title} href={card.href} className="group flex flex-col py-12 md:px-12 md:first:pl-0 md:last:pr-0">
          <h2 className="font-bx-serif text-3xl font-normal leading-tight text-bx-ink sm:text-[34px]">{card.title}</h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-bx-muted">{card.text}</p>
          <span className="mt-6 inline-flex w-fit items-center gap-2 border-b border-bx-ink pb-0.5 text-[13px] font-medium text-bx-ink group-hover:opacity-60">
            {card.cta}
          </span>
        </Link>
      ))}
      </div>
    </section>
  );
}

export function FeaturedCategories() {
  return (
    <section className="border-t border-bx-line" aria-labelledby="featured-categories">
      <div className={`${container} py-16`}>
        <SectionHeading id="featured-categories" title="Shop by category" viewAllHref={routes.shop} viewAllLabel="Shop all" />
        <Slider label="Featured categories" itemClassName="w-[42%] sm:w-[28%] md:w-[20%] lg:w-[15.4%]">
          {categories.map((category) => {
            const photo = siteImage("categories", category.slug);
            return (
            <Link key={category.slug} href={routes.category(category.slug)} className="group block">
              <span className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#f4f4f3] transition-colors group-hover:bg-[#ececea]">
                {photo ? (
                  <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 200px, (min-width: 640px) 28vw, 42vw" className="object-cover transition-opacity group-hover:opacity-90" />
                ) : (
                  <Icon name={category.icon} size={40} strokeWidth={1} className="text-bx-ink" />
                )}
              </span>
              <span className="mt-3 block text-[14px] leading-snug text-bx-ink group-hover:underline">{category.name}</span>
            </Link>
            );
          })}
        </Slider>
      </div>
    </section>
  );
}

export function ProductRail({
  id,
  title,
  description,
  products,
  viewAllHref,
}: {
  id: string;
  title: string;
  description?: string;
  products: Product[];
  viewAllHref: string;
}) {
  return (
    <section className="border-t border-bx-line" aria-labelledby={id}>
      <div className={`${container} py-16`}>
        <SectionHeading id={id} title={title} description={description} viewAllHref={viewAllHref} />
        <Slider label={title}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Slider>
      </div>
    </section>
  );
}

export function RewardsBanner() {
  return (
    <section className="bg-bx-ink text-white" aria-labelledby="rewards-heading">
      <div className={`${container} flex flex-col gap-8 py-14 lg:flex-row lg:items-center lg:justify-between`}>
        <div className="max-w-xl">
          <h2 id="rewards-heading" className="font-bx-serif text-3xl font-normal sm:text-[40px]">
            Beatrice Rewards
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/70">
            Earn 1 point for every $1 you spend and 25 points every time you renew a loan. Redeem for savings, early access to new arrivals and birthday perks.
          </p>
        </div>
        <Link href={routes.rewards} className={`${btn.outlineLight} shrink-0`}>
          Join now
        </Link>
      </div>
    </section>
  );
}

const trust: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: "scale", title: "Fair appraisals", text: "Transparent offers based on today's market, explained clearly." },
  { icon: "lock", title: "Secure storage", text: "Pawned items are tagged, logged and kept in a monitored vault." },
  { icon: "bolt", title: "Fast cash", text: "Most loans and sales are completed in about 15 minutes." },
  { icon: "eyeOff", title: "Confidential service", text: "Private consultations. Your business stays your business." },
  { icon: "shield", title: "Licensed & insured", text: "Fully licensed under [STATE] law and insured." },
];

export function WhyUs() {
  return (
    <section className="border-t border-bx-line" aria-labelledby="why-us">
      <div className={`${container} py-16`}>
        <SectionHeading id="why-us" title="Why The Beatrice Exchange" />
        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {trust.map((item) => (
            <li key={item.title}>
              <Icon name={item.icon} size={24} strokeWidth={1.25} className="text-bx-ink" />
              <h3 className="mt-4 text-[15px] font-semibold text-bx-ink">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-bx-muted">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function BlogTeasers() {
  return (
    <section className="border-t border-bx-line" aria-labelledby="blog-heading">
      <div className={`${container} py-16`}>
        <SectionHeading id="blog-heading" title="From the journal" viewAllHref={routes.blog} />
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {blogPosts.slice(0, 3).map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function BlogCard({ post }: { post: (typeof blogPosts)[number] }) {
  const photo = siteImage("blog", post.slug);
  return (
    <article className="group flex flex-col">
      <Link href={routes.post(post.slug)} tabIndex={-1} aria-hidden="true" className="relative flex aspect-[3/2] items-center justify-center overflow-hidden bg-[#f4f4f3]">
        {photo ? (
          <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
        ) : (
          <Icon name={post.icon} size={56} strokeWidth={0.75} className="text-bx-ink" />
        )}
      </Link>
      <p className="mt-4 text-[12px] text-bx-muted">
        {post.category} · <time dateTime={post.date}>{formatDate(post.date)}</time>
      </p>
      <h3 className="mt-1 font-bx-serif text-2xl font-normal leading-snug text-bx-ink">
        <Link href={routes.post(post.slug)} className="hover:underline">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-bx-muted">{post.excerpt}</p>
      <Link href={routes.post(post.slug)} className="mt-4 w-fit border-b border-bx-ink pb-0.5 text-[13px] font-medium text-bx-ink hover:opacity-60">
        Read more<span className="sr-only">: {post.title}</span>
      </Link>
    </article>
  );
}

export function NewsletterSection() {
  return (
    <section className="border-t border-bx-line" aria-labelledby="newsletter-heading">
      <div className={`${container} grid gap-8 py-16 md:grid-cols-2 md:items-center`}>
        <div>
          <h2 id="newsletter-heading" className="font-bx-serif text-3xl font-normal text-bx-ink sm:text-[40px]">
            First look at new arrivals
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-bx-muted">
            Rare finds, weekly deals and gold-buying events. Unsubscribe anytime.
          </p>
        </div>
        <NewsletterForm />
      </div>
    </section>
  );
}
