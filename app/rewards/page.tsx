import type { Metadata } from "next";

import { RewardsJoinForm } from "@/components/forms/simple-forms";
import { Icon } from "@/components/ui/icon";
import { PageHero } from "@/components/ui/page-hero";
import { container } from "@/components/ui/styles";

export const metadata: Metadata = {
  alternates: { canonical: "/rewards" }, title: "BHS Rewards", description: "Earn points on purchases and loan renewals with BHS Rewards." };

export default function RewardsPage() {
  return (
    <>
      <PageHero title="BHS Rewards" crumbs={[{ label: "Rewards" }]} description="Our thank-you for coming back. Earn on every purchase and every loan renewal, and redeem for real savings." />
      <div className={`${container} grid gap-10 py-14 lg:grid-cols-[1fr_420px]`}>
        <div className="space-y-8">
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: "bag" as const, t: "1 point per $1", d: "On every in-store and online purchase." },
              { icon: "history" as const, t: "+25 per renewal", d: "Each time you extend a pawn loan." },
              { icon: "gift" as const, t: "$10 off per 500 pts", d: "Redeem in store or at online checkout." },
              { icon: "sparkle" as const, t: "Early access", d: "Preview new arrivals and rare finds before anyone else." },
            ].map((b) => (
              <li key={b.t} className="border border-bx-line bg-white p-6">
                <Icon name={b.icon} size={26} className="text-bx-ink" />
                <h2 className="mt-3 font-bx-serif text-2xl text-bx-ink">{b.t}</h2>
                <p className="text-sm text-bx-muted">{b.d}</p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-bx-muted">[PLACEHOLDER] Program terms: points have no cash value, expire after 12 months of inactivity, and may not be redeemed toward loan principal. BHS Premier Pawn and Jewelry may modify the program at any time.</p>
        </div>
        <RewardsJoinForm />
      </div>
    </>
  );
}
