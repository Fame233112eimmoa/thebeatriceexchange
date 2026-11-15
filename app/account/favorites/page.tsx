import type { Metadata } from "next";

import { FavoritesView } from "@/components/account/account-views";
import { PageHero } from "@/components/ui/page-hero";
import { container } from "@/components/ui/styles";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Favorites", robots: { index: false } };

export default function Page() {
  return (
    <>
      <PageHero title="Favorites" description="Items you've saved. Pawn inventory is one-of-a-kind, so don't wait too long." crumbs={[{ label: "My Account", href: routes.account }, { label: "Favorites" }]} />
      <div className={`${container} py-12`}>
        <FavoritesView />
      </div>
    </>
  );
}
