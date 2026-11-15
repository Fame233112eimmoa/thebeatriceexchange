import type { Metadata } from "next";

import { OrdersView } from "@/components/account/account-views";
import { PageHero } from "@/components/ui/page-hero";
import { container } from "@/components/ui/styles";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Order History", robots: { index: false } };

export default function Page() {
  return (
    <>
      <PageHero title="Order History" description="Orders placed from this device." crumbs={[{ label: "My Account", href: routes.account }, { label: "Order History" }]} />
      <div className={`${container} py-12`}>
        <OrdersView />
      </div>
    </>
  );
}
