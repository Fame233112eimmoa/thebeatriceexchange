import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { WhyUs } from "@/components/home/sections";
import { Monogram } from "@/components/ui/logo";
import { PageHero } from "@/components/ui/page-hero";
import { btn, container } from "@/components/ui/styles";
import { site } from "@/data/site";
import { siteImage } from "@/lib/images";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  alternates: { canonical: "/about" }, title: "About Us", description: `Meet ${site.owner}, founder of BHS Premier Pawn and Jewelry, a boutique pawn and resale shop where value meets trust.` };

export default function AboutPage() {
  const store = siteImage("about", "store");
  return (
    <>
      <PageHero title="Where Value Meets Trust." crumbs={[{ label: "About" }]} description="BHS Premier Pawn and Jewelry was founded on a simple idea: a pawn shop can feel like a boutique, with honest prices, expert eyes and genuine hospitality." />

      <section aria-labelledby="meet-beatrice" className={`${container} grid items-center gap-12 py-16 lg:grid-cols-2`}>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
          {/* Replace with a portrait: <Image src="/beatrice.jpg" alt="Beatrice Hostetler Smith" fill /> */}
          <div role="img" aria-label="Portrait placeholder for Beatrice Hostetler Smith" className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#f4f4f3]">
            <Monogram size={88} />
            <span className="text-xs text-bx-muted">Portrait coming soon</span>
          </div>
        </div>
        <div>
          <p className="text-[13px] text-bx-muted">Founder &amp; owner</p>
          <h2 id="meet-beatrice" className="mt-2 font-bx-serif text-5xl font-normal text-bx-ink">Meet Beatrice</h2>
          <p className="mt-1 text-base text-bx-muted">{site.owner}</p>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-bx-charcoal">
            <p>
              [PLACEHOLDER BIO] Beatrice opened BHS Premier Pawn and Jewelry to give the community a place where people are treated with respect, whether they&apos;re pawning a family ring, selling a laptop, or hunting for a vintage watch.
            </p>
            <p>
              With an eye for fine jewelry and a belief that every customer deserves a straight answer, Beatrice built a shop around fair appraisals, careful authentication and complete confidentiality.
            </p>
            <blockquote className="border-l border-bx-ink pl-5 font-bx-serif text-2xl leading-snug text-bx-ink">
              “Everything that comes through our door has a story. Our job is to honor it with a fair price and an honest word.”
            </blockquote>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={routes.stores} className={btn.primary}>Visit the store</Link>
            <Link href={routes.contact} className={btn.outline}>Contact Us</Link>
          </div>
        </div>
      </section>

      {store ? (
        <div className={`${container} pb-16`}>
          <div className="relative aspect-[16/9] overflow-hidden bg-[#f4f4f3] sm:aspect-[21/8]">
            <Image src={store.src} alt={store.alt} fill sizes="(min-width: 1280px) 1216px, 100vw" className="object-cover" />
          </div>
        </div>
      ) : null}

      <section className="border-t border-bx-line">
        <div className={`${container} grid gap-10 py-16 md:grid-cols-3 md:gap-8`}>
          {[
            ["Boutique standards", "Every piece is cleaned, tested and authenticated before it reaches our cases or our website."],
            ["Everyday welcome", "Luxury doesn't have to be intimidating. Come browse, ask questions, or just get something appraised."],
            ["Community first", "We're a local, independent business. When you shop with us, you support your neighbors."],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="font-bx-serif text-2xl text-bx-ink">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-bx-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <WhyUs />
    </>
  );
}
