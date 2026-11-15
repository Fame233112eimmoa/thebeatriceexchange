import type { Metadata } from "next";

import { HeroCarousel } from "@/components/home/hero-carousel";
import { HowItWorks } from "@/components/home/how-it-works";
import { ReviewsCarousel } from "@/components/home/reviews-carousel";
import {
  BlogTeasers,
  CtaCards,
  FeaturedCategories,
  NewsletterSection,
  ProductRail,
  RewardsBanner,
  WhyUs,
} from "@/components/home/sections";
import { Icon } from "@/components/ui/icon";
import { EstimateForm } from "@/components/forms/estimate-form";
import { SectionHeading } from "@/components/ui/section-heading";
import { container } from "@/components/ui/styles";
import { getHotDeals, getNewArrivals, getRareFinds } from "@/lib/catalog";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: { absolute: "BHS Premier Pawn and Jewelry | Pawn, Sell & Shop Pre-Owned Luxury" },
};

export default function PawnshopHome() {
  return (
    <>
      <HeroCarousel />
      <CtaCards />
      <FeaturedCategories />
      <ProductRail
        id="hot-deals"
        title="Hot Deals"
        description="Our deepest markdowns on hand-picked pieces. When they're gone, they're gone."
        products={getHotDeals()}
        viewAllHref={routes.deals}
      />
      <RewardsBanner />
      <ProductRail id="new-arrivals" title="New Arrivals" products={getNewArrivals()} viewAllHref={routes.newArrivals} />
      <ProductRail
        id="rare-finds"
        title="Rare Finds"
        description="Gold, rare coins, luxury watches and collectibles, chosen by our specialists."
        products={getRareFinds()}
        viewAllHref={routes.rareFinds}
      />
      <HowItWorks />
      <section id="estimate" className="scroll-mt-40 border-t border-bx-line" aria-labelledby="estimate-heading">
        <div className={`${container} grid gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:py-20`}>
          <div>
            <SectionHeading
              id="estimate-heading"
              title="Get a Free Online Estimate"
              description="Tell us about your item and upload a few photos. A specialist will reply with an estimate, usually within one business day."
            />
            <ul className="space-y-3 text-sm text-bx-charcoal">
              {["No appointment or commitment required", "Confidential. We never share your details", "Estimates for both pawn loans and outright sales"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Icon name="check" size={16} className="shrink-0 text-bx-ink" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <EstimateForm />
        </div>
      </section>
      <WhyUs />
      <ReviewsCarousel />
      <BlogTeasers />
      <NewsletterSection />
    </>
  );
}
