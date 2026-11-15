import type { Metadata } from "next";

import { EstimateForm } from "@/components/forms/estimate-form";
import { CallTextButtons, FaqAccordion, StepList } from "@/components/ui/content";
import { Icon } from "@/components/ui/icon";
import { PageHero } from "@/components/ui/page-hero";
import { container } from "@/components/ui/styles";
import { categories } from "@/data/categories";
import { faqGroups } from "@/data/faq";

export const metadata: Metadata = {
  title: "How to Sell",
  description: "Sell gold, diamonds, watches, designer bags and electronics to The Beatrice Exchange. Get a free estimate and get paid on the spot.",
};

export default function HowToSellPage() {
  return (
    <>
      <PageHero title="Sell Your Stuff" description="Turn jewelry, watches, designer pieces and electronics into cash today. Fair offers, fast payment and no pressure." crumbs={[{ label: "How to Sell" }]}>
        <div className="mt-6"><CallTextButtons /></div>
      </PageHero>
      <div className={`${container} space-y-16 py-14`}>
        <StepList
          steps={[
            { title: "Get an estimate", text: "Fill out the free online estimate below with photos, or just walk in with your item and a valid photo ID." },
            { title: "Receive a fair offer", text: "We verify authenticity and condition in person, then make a firm cash offer based on today's market." },
            { title: "Get paid on the spot", text: "Accept and get paid immediately. There's no loan and nothing to repay." },
          ]}
        />
        <section aria-labelledby="we-buy">
          <h2 id="we-buy" className="mb-6 font-bx-serif text-4xl font-normal text-bx-ink">What we buy</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <li key={c.slug} className="flex items-center gap-3 border border-bx-line bg-white p-4 text-sm font-medium text-bx-ink">
                <Icon name={c.icon} size={22} className="shrink-0 text-bx-ink" /> {c.name}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-bx-muted">Tip: bring original boxes, receipts, certificates and accessories. Complete items get better offers.</p>
        </section>
        <section id="estimate" className="scroll-mt-40 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-bx-serif text-4xl font-normal text-bx-ink">Free Online Estimate</h2>
            <p className="mt-3 text-bx-muted">Tell us what you have. A specialist will reply, usually within one business day.</p>
          </div>
          <EstimateForm defaultIntent="sell" />
        </section>
        <FaqAccordion groups={faqGroups.filter((g) => g.title === "Selling")} />
      </div>
    </>
  );
}
