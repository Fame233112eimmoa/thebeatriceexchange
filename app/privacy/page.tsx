import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/ui/content";
import { fullAddress, site } from "@/data/site";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Page() {
  return (
    <LegalPage title="Privacy Policy" updated="[DATE]">
      <p>{site.name} (&ldquo;we,&rdquo; &ldquo;us&rdquo;) respects your privacy. This policy explains what information we collect, how we use it, and your choices.</p>
      <h2>Information we collect</h2>
      <ul>
        <li><strong>Information you provide:</strong> name, email, phone, shipping address, estimate details and photos, and messages you send us.</li>
        <li><strong>Transaction information:</strong> purchases, pawn and sale records, including government ID details required by Alabama law.</li>
        <li><strong>Payment information:</strong> processed by our payment providers. We do not store full card numbers.</li>
        <li><strong>Device and usage data:</strong> browser type, pages viewed and cookies used to keep your cart and favorites.</li>
      </ul>
      <h2>How we use information</h2>
      <ul>
        <li>To process orders, loans, purchases and returns.</li>
        <li>To comply with pawn-reporting and law-enforcement requirements under Alabama law.</li>
        <li>To send order updates and, with your consent, marketing emails or texts.</li>
        <li>To improve our website and services.</li>
      </ul>
      <h2>Sharing</h2>
      <p>We do not sell your personal information. We share it only with service providers (payments, shipping, email), as required by law, or to protect our rights.</p>
      <h2>Text messages</h2>
      <p>If you opt in to SMS, message frequency varies. Msg &amp; data rates may apply. Reply STOP to cancel or HELP for help.</p>
      <h2>Your choices</h2>
      <p>You can unsubscribe from marketing at any time and may request access to or deletion of your information, subject to legal record-keeping obligations. [Add state-specific privacy rights as applicable.]</p>
      <h2>Contact</h2>
      <p>{site.name}, {fullAddress}. Email <a href={`mailto:${site.email}`}>{site.email}</a> or see our <Link href={routes.contact}>contact page</Link>.</p>
    </LegalPage>
  );
}
