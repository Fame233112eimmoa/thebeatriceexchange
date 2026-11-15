import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/ui/content";
import { fullAddress, site } from "@/data/site";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  alternates: { canonical: "/shipping" }, title: "Shipping Policy" };

export default function Page() {
  return (
    <LegalPage title="Shipping Policy" updated="[DATE]">
      <h2>Free shipping over ${site.commerce.freeShippingThreshold}</h2>
      <p>Orders over ${site.commerce.freeShippingThreshold} ship free within the contiguous United States. Orders under that amount ship for a flat ${site.commerce.flatShipping}.</p>
      <h2>Processing time</h2>
      <p>Orders ship within 1–2 business days. You&apos;ll get a tracking number by email.</p>
      <h2>Insured, signature-required delivery</h2>
      <p>All orders are fully insured. Orders over $1,000 require an adult signature.</p>
      <h2>Pickup-only items</h2>
      <p>Large items (such as TVs and bicycles) are marked &ldquo;In-store pickup only.&rdquo;</p>
      <h2>Buy Online, Pick Up In Store</h2>
      <p>Choose pickup at checkout. It&apos;s free, and orders are usually ready the next business day at {fullAddress}. See <Link href={routes.stores}>store hours</Link>.</p>
      <h2>Where we ship</h2>
      <p>We currently ship within the U.S. only. [Update for Alaska, Hawaii, APO/FPO as needed.]</p>
    </LegalPage>
  );
}
