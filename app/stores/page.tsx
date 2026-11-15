import type { Metadata } from "next";

import { CallTextButtons, directionsUrl, HoursList, MapEmbed } from "@/components/ui/content";
import { Icon } from "@/components/ui/icon";
import { PageHero } from "@/components/ui/page-hero";
import { btn, container } from "@/components/ui/styles";
import { fullAddress, site } from "@/data/site";

export const metadata: Metadata = { title: "Store Locator & Hours", description: `Visit BHS Premier Pawn and Jewelry at ${fullAddress}. Hours, directions and contact.` };

export default function StoresPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PawnShop",
    name: site.name,
    telephone: site.phone.tel,
    address: { "@type": "PostalAddress", streetAddress: site.address.street, addressLocality: site.address.city, addressRegion: site.address.state, postalCode: site.address.zip, addressCountry: "US" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero title="Store Locator & Hours" crumbs={[{ label: "Store Locator" }]} description="Walk-ins welcome. Free appraisals, no appointment needed." />
      <div className={`${container} grid gap-8 py-14 lg:grid-cols-[400px_1fr]`}>
        <div className="space-y-6 border border-bx-line bg-white p-8">
          <div>
            <h2 className="font-bx-serif text-3xl text-bx-ink">{site.name}</h2>
            <address className="mt-3 flex items-start gap-2 not-italic text-bx-charcoal">
              <Icon name="pin" size={20} className="mt-0.5 shrink-0 text-bx-ink" /> {fullAddress}
            </address>
            <a href={directionsUrl()} target="_blank" rel="noopener noreferrer" className={`${btn.outline} mt-4 !py-2`}>
              Get Directions <Icon name="arrowRight" size={16} />
            </a>
          </div>
          <div>
            <h3 className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-bx-ink"><Icon name="clock" size={16} /> Store Hours</h3>
            <HoursList />
            <p className="mt-2 text-xs text-bx-muted">Holiday hours may vary. Call ahead to confirm.</p>
          </div>
          <CallTextButtons />
          <ul className="space-y-2 border-t border-bx-line pt-5 text-sm text-bx-charcoal">
            {["Free parking", "Wheelchair accessible", "Private appraisal room", "Buy Online, Pick Up In Store counter"].map((t) => (
              <li key={t} className="flex items-center gap-2"><Icon name="check" size={16} className="text-bx-ink" /> {t}</li>
            ))}
          </ul>
        </div>
        <MapEmbed />
      </div>
    </>
  );
}
