import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/ui/content";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  alternates: { canonical: "/returns" }, title: "Returns Policy" };

export default function Page() {
  return (
    <LegalPage title="Returns Policy" updated="[DATE]">
      <h2>14-day returns</h2>
      <p>Most items may be returned within 14 days of delivery or pickup for a refund to the original payment method, provided they are in the same condition, with all included accessories and packaging.</p>
      <h2>Exclusions</h2>
      <ul>
        <li>Gold and silver bullion, coins and other precious-metal investment products</li>
        <li>Items marked &ldquo;Final Sale&rdquo;</li>
        <li>Items that have been altered, resized or engraved</li>
        <li>Gift cards</li>
      </ul>
      <h2>How to return</h2>
      <ol>
        <li>Bring the item and your receipt to the store, or <Link href={routes.contact}>contact us</Link> for a prepaid return label (shipped orders).</li>
        <li>We inspect the item and process your refund within 5 business days.</li>
      </ol>
      <h2>Authenticity guarantee</h2>
      <p>If an item we sold is ever determined not to be authentic, we will refund the full purchase price.</p>
      <h2>Pawned items</h2>
      <p>Redeemed pawn items are not &ldquo;returns.&rdquo; Questions about your loan? See <Link href={routes.howToPawn}>How to Pawn</Link>.</p>
    </LegalPage>
  );
}
