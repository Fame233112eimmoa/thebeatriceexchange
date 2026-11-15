import type { Metadata } from "next";
import Link from "next/link";

import { EstimateForm } from "@/components/forms/estimate-form";
import { CallTextButtons, FaqAccordion, Prose, StepList } from "@/components/ui/content";
import { Icon } from "@/components/ui/icon";
import { PageHero } from "@/components/ui/page-hero";
import { btn, container } from "@/components/ui/styles";
import { faqGroups } from "@/data/faq";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "How to Pawn",
  description: "How pawn loans work at The Beatrice Exchange: what to bring, loan terms, and how to repay or extend. No credit check.",
};

export default function HowToPawnPage() {
  return (
    <>
      <PageHero title="How to Pawn" description="A pawn loan is a simple, private way to borrow cash using something you own. There's no credit check, and your item comes back to you when you repay." crumbs={[{ label: "How to Pawn" }]}>
        <div className="mt-6"><CallTextButtons /></div>
      </PageHero>

      <div className={`${container} space-y-16 py-14`}>
        <StepList
          steps={[
            { title: "Bring your item and a valid ID", text: "Bring the item with any chargers, boxes or papers, plus a current government-issued photo ID. No appointment is needed." },
            { title: "Get a free appraisal", text: "We inspect and test your item, check current market values and make you a loan offer. You're never obligated to accept." },
            { title: "Walk out with cash", text: "Accept the offer, sign your pawn ticket and leave with cash. We store your item securely until you come back for it." },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-2">
          <section aria-labelledby="terms">
            <h2 id="terms" className="font-bx-serif text-4xl font-normal text-bx-ink">Loan terms, explained</h2>
            <Prose>
              <p className="mt-4">Every loan comes with a printed pawn ticket listing the amount borrowed, the finance charge, the due date and the total needed to redeem your item. Typical terms:</p>
              <ul>
                <li><strong>Loan amount:</strong> based on your item&apos;s resale value, condition and demand.</li>
                <li><strong>Loan term:</strong> [XX] days, plus any grace period required by [STATE] law.</li>
                <li><strong>Finance charges:</strong> set according to [STATE] pawn regulations and disclosed in full before you sign.</li>
                <li><strong>No credit impact:</strong> we don&apos;t run credit checks or report to credit bureaus.</li>
              </ul>
              <p>Loan rates and terms follow [STATE] law. See our <Link href={routes.loanTerms}>Pawn Loan Terms &amp; Disclosures</Link>.</p>
            </Prose>
          </section>
          <section aria-labelledby="id" className="border border-bx-line p-8 sm:p-10">
            <Icon name="idCard" size={28} strokeWidth={1.25} className="text-bx-ink" />
            <h2 id="id" className="mt-4 font-bx-serif text-3xl font-normal">Accepted ID</h2>
            <p className="mt-2 text-sm text-bx-muted">State law requires a valid, unexpired government-issued photo ID for every pawn or sale:</p>
            <ul className="mt-4 space-y-2 text-sm">
              {["State driver's license", "State ID card", "U.S. passport or passport card", "Military ID", "Permanent resident card"].map((t) => (
                <li key={t} className="flex items-center gap-2"><Icon name="check" size={16} className="text-bx-ink" /> {t}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-bx-muted">You must be 18 or older and the legal owner of the item.</p>
          </section>
        </div>

        <section aria-labelledby="repay" className="grid gap-6 md:grid-cols-3">
          <h2 id="repay" className="font-bx-serif text-4xl font-normal text-bx-ink md:col-span-3">Repay, extend or walk away</h2>
          {[
            { icon: "cash" as const, title: "Repay & redeem", text: "Pay your loan plus the finance charge any time before the due date and take your item home." },
            { icon: "history" as const, title: "Extend your loan", text: "Need more time? Pay just the finance charge to renew for another term, and earn Beatrice Rewards points each time." },
            { icon: "shield" as const, title: "No further obligation", text: "If you choose not to repay, the item is forfeited after the term and grace period. You owe nothing more, and there's no effect on your credit." },
          ].map((c) => (
            <div key={c.title} className="border border-bx-line bg-white p-7">
              <Icon name={c.icon} size={28} className="text-bx-ink" />
              <h3 className="mt-4 font-bx-serif text-2xl text-bx-ink">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-bx-muted">{c.text}</p>
            </div>
          ))}
          <div className="md:col-span-3">
            <Link href={routes.payment} className={btn.primary}>Make a Loan Payment</Link>
          </div>
        </section>

        <section id="estimate" className="scroll-mt-40 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-bx-serif text-4xl font-normal text-bx-ink">Get a free loan estimate</h2>
            <p className="mt-3 text-bx-muted">Send us a few details and photos and we&apos;ll tell you roughly what we can lend before you visit.</p>
          </div>
          <EstimateForm defaultIntent="pawn" />
        </section>

        <FaqAccordion groups={faqGroups.filter((g) => g.title === "Pawn Loans")} />
      </div>
    </>
  );
}
