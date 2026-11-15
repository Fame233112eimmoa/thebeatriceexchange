import type { Metadata } from "next";

import { LegalPage } from "@/components/ui/content";
import { fullAddress, site } from "@/data/site";

export const metadata: Metadata = { title: "Accessibility Statement" };

export default function Page() {
  return (
    <LegalPage title="Accessibility Statement" updated="[DATE]">
      <p>{site.name} is committed to making our website usable by everyone, including people with disabilities.</p>
      <h2>Our standard</h2>
      <p>We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.2, Level AA. This site uses semantic HTML, keyboard-navigable menus and carousels, visible focus states, text alternatives for images, sufficient color contrast and support for reduced-motion preferences.</p>
      <h2>Ongoing work</h2>
      <p>We regularly review the site and fix issues as we find them. Some third-party content (such as maps or payment widgets) may not be fully within our control.</p>
      <h2>Need help?</h2>
      <p>If you have trouble using any part of this site, call <a href={`tel:${site.phone.tel}`}>{site.phone.display}</a>, email <a href={`mailto:${site.email}`}>{site.email}</a>, or visit us at {fullAddress}. We&apos;ll be glad to help you shop, get an estimate or make a payment another way.</p>
    </LegalPage>
  );
}
