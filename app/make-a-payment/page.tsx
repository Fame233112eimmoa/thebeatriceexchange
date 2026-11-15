import type { Metadata } from "next";
import Link from "next/link";

import { LoanPaymentForm } from "@/components/forms/simple-forms";
import { PageHero } from "@/components/ui/page-hero";
import { container } from "@/components/ui/styles";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Make a Loan Payment", description: "Pay or extend your Beatrice Exchange pawn loan online." };

export default function PaymentPage() {
  return (
    <>
      <PageHero title="Make a Loan Payment" crumbs={[{ label: "Make a Payment" }]} description="Pay the finance charge to extend your loan, or pay in full to redeem your item." />
      <div className={`${container} grid gap-10 py-14 lg:grid-cols-[1fr_380px]`}>
        <LoanPaymentForm />
        <aside className="space-y-4 text-sm leading-relaxed text-bx-muted">
          <h2 className="font-bx-serif text-2xl text-bx-ink">Good to know</h2>
          <p>Payments made online post to your loan within one business day.</p>
          <p>To pick up your item after paying in full, bring your pawn ticket and the photo ID used to open the loan.</p>
          <p>Each renewal earns 25 <Link href={routes.rewards} className="font-semibold text-bx-ink underline">Beatrice Rewards</Link> points.</p>
          <p>Loan rates and terms follow [STATE] law. <Link href={routes.loanTerms} className="font-semibold text-bx-ink underline">View disclosures</Link>.</p>
        </aside>
      </div>
    </>
  );
}
