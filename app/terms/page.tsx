import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/ui/content";
import { site } from "@/data/site";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Terms of Service" };

export default function Page() {
  return (
    <LegalPage title="Terms of Service" updated="[DATE]">
      <p>By using this website or shopping with {site.name}, you agree to these Terms.</p>
      <h2>Products and descriptions</h2>
      <p>Most items are pre-owned and one-of-a-kind. We describe condition as accurately as possible using our grading scale (Like New, Excellent, Good, Fair). Photos may vary slightly from the actual item.</p>
      <h2>Pricing and availability</h2>
      <p>Prices are in U.S. dollars and may change without notice. Bullion prices fluctuate with the market. Because inventory is also sold in store, an item may become unavailable after you order; if so, we&apos;ll refund you promptly.</p>
      <h2>Orders and payment</h2>
      <p>We may refuse or cancel any order, including suspected fraud. Buy Now, Pay Later financing is provided by third parties subject to their terms and approval.</p>
      <h2>In-store pickup</h2>
      <p>Pickup orders are held for [3] business days. A photo ID matching the order name is required.</p>
      <h2>Pawn loans</h2>
      <p>Pawn transactions are governed by your pawn ticket and our <Link href={routes.loanTerms}>Pawn Loan Terms &amp; Disclosures</Link>, in accordance with Alabama law.</p>
      <h2>Limitation of liability</h2>
      <p>[PLACEHOLDER: standard limitation of liability, governing law (Alabama) and dispute resolution language.]</p>
    </LegalPage>
  );
}
