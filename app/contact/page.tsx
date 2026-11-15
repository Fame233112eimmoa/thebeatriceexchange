import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/simple-forms";
import { CallTextButtons, HoursList, MapEmbed } from "@/components/ui/content";
import { Icon } from "@/components/ui/icon";
import { PageHero } from "@/components/ui/page-hero";
import { container } from "@/components/ui/styles";
import { fullAddress, site } from "@/data/site";

export const metadata: Metadata = { title: "Contact Us", description: "Call, text, email or visit The Beatrice Exchange." };

export default function ContactPage() {
  return (
    <>
      <PageHero title="Contact Us" crumbs={[{ label: "Contact" }]} description="Questions about an item, a loan or an order? Reach out. A real person will get back to you.">
        <div className="mt-6"><CallTextButtons /></div>
      </PageHero>
      <div className={`${container} grid gap-10 py-14 lg:grid-cols-[1fr_380px]`}>
        <ContactForm />
        <aside className="space-y-6">
          <div className="border border-bx-line bg-white p-6">
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3"><Icon name="phone" className="text-bx-ink" /><a href={`tel:${site.phone.tel}`} className="font-semibold text-bx-ink">{site.phone.display}</a></li>
              <li className="flex gap-3"><Icon name="mail" className="text-bx-ink" /><a href={`mailto:${site.email}`} className="font-semibold text-bx-ink">{site.email}</a></li>
              <li className="flex gap-3"><Icon name="pin" className="text-bx-ink" /><span className="text-bx-charcoal">{fullAddress}</span></li>
            </ul>
            <div className="mt-5 border-t border-bx-line pt-3"><HoursList /></div>
          </div>
          <MapEmbed className="!min-h-[260px]" />
        </aside>
      </div>
    </>
  );
}
