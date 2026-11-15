import type { Metadata } from "next";

import { CallTextButtons, FaqAccordion } from "@/components/ui/content";
import { PageHero } from "@/components/ui/page-hero";
import { container } from "@/components/ui/styles";
import { faqGroups } from "@/data/faq";

export const metadata: Metadata = { title: "FAQ", description: "Answers about pawn loans, selling, shipping, in-store pickup, payments and returns at The Beatrice Exchange." };

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap((g) => g.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } }))),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero title="Frequently Asked Questions" crumbs={[{ label: "FAQ" }]} />
      <div className={`${container} grid gap-12 py-14 lg:grid-cols-[1fr_320px]`}>
        <FaqAccordion groups={faqGroups} />
        <aside className="h-fit border border-bx-line p-8 lg:sticky lg:top-40">
          <h2 className="font-bx-serif text-3xl">Still have questions?</h2>
          <p className="mb-6 mt-2 text-sm text-bx-muted">Our team is happy to help by phone or text during store hours.</p>
          <div className="[&_a]:w-full"><CallTextButtons /></div>
        </aside>
      </div>
    </>
  );
}
