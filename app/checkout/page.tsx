import type { Metadata } from "next";

import { CheckoutView } from "@/components/cart/checkout-view";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ fulfillment?: string }> }) {
  const { fulfillment } = await searchParams;
  return <CheckoutView initialFulfillment={fulfillment === "pickup" ? "pickup" : "ship"} />;
}
