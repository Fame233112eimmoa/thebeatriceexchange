import type { Metadata } from "next";
import { Suspense } from "react";

import { ShopBrowser } from "@/components/shop/shop-browser";

export const metadata: Metadata = {
  title: "Shop Pre-Owned Jewelry, Watches & Electronics",
  description: "Browse authenticated pre-owned jewelry, gold, coins, designer handbags, electronics and more. Free shipping over $99 or pick up in store.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<p className="py-24 text-center text-sm text-bx-muted">Loading inventory…</p>}>
      <ShopBrowser />
    </Suspense>
  );
}
