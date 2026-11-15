import type { Metadata } from "next";

import { LegalPage } from "@/components/ui/content";
import { site } from "@/data/site";

export const metadata: Metadata = { title: "Pawn Loan Terms & Disclosures" };

export default function Page() {
  return (
    <LegalPage title="Pawn Loan Terms & Disclosures" updated="[DATE]">
      <p className="border border-bx-ink p-5 !text-bx-ink"><strong>Important:</strong> Loan rates, fees, terms, grace periods and forfeiture rules follow Alabama law. Your pawn ticket is your contract and lists the exact amount financed, finance charge, annual percentage rate (APR), total of payments and maturity date.</p>
      <h2>Eligibility</h2>
      <ul>
        <li>You must be at least 18 years old and present a valid government-issued photo ID.</li>
        <li>You must be the legal owner of the pledged item and have the right to pawn it.</li>
      </ul>
      <h2>Loan term</h2>
      <p>The initial loan term is [XX] days. A grace period of [XX] days applies as required by Alabama law.</p>
      <h2>Finance charges and fees</h2>
      <p>[PLACEHOLDER: Monthly finance charge / interest rate and any storage, setup or insurance fees permitted under Alabama statute [CITATION].] All charges are disclosed on your pawn ticket before you sign.</p>
      <h2>Extending (renewing) a loan</h2>
      <p>You may extend your loan by paying the finance charges then due, subject to Alabama limits on renewals.</p>
      <h2>Redemption</h2>
      <p>To redeem your item, present your pawn ticket and pay the principal plus accrued charges. If your ticket is lost, Alabama law may require a signed affidavit.</p>
      <h2>Forfeiture</h2>
      <p>If the loan is not repaid or extended by the end of the term and grace period, ownership of the pledged item passes to {site.name}. You will have no further obligation, and the loan will not be reported to credit bureaus.</p>
      <h2>Lost or damaged items</h2>
      <p>[PLACEHOLDER: liability and replacement-value terms required under Alabama law.]</p>
      <h2>Regulatory information</h2>
      <p>{site.name} is licensed by [STATE REGULATOR], license #[NUMBER]. Complaints may be directed to [REGULATOR CONTACT].</p>
    </LegalPage>
  );
}
