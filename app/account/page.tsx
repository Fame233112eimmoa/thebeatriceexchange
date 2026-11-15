import type { Metadata } from "next";

import { AuthPanel } from "@/components/account/account-views";
import { PageHero } from "@/components/ui/page-hero";
import { container } from "@/components/ui/styles";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default function Page() {
  return (
    <>
      <PageHero title="My Account" description="Sign in to track orders, save favorites and manage Beatrice Rewards." crumbs={[{ label: "My Account" }]} />
      <div className={`${container} py-12`}>
        <AuthPanel />
      </div>
    </>
  );
}
