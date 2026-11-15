import Link from "next/link";

import { categories } from "../../data/categories";
import { fullAddress, site } from "../../data/site";
import { routes } from "../../lib/routes";
import { NewsletterForm } from "../forms/newsletter-form";
import { Icon } from "../ui/icon";
import { Logo } from "../ui/logo";
import { PaymentBadges } from "../ui/payment-badges";
import { container } from "../ui/styles";

const linkClass = "text-sm text-bx-muted hover:text-bx-ink";
const headingClass = "mb-4 text-[13px] font-semibold text-bx-ink";

export function SiteFooter() {
  return (
    <footer className="border-t border-bx-line bg-white text-bx-ink">
      <div className="border-b border-bx-line">
        <div className={`${container} grid gap-6 py-10 md:grid-cols-[1fr_1.2fr] md:items-center`}>
          <div>
            <h2 className="font-bx-serif text-2xl font-normal sm:text-3xl">Be first to the best finds.</h2>
            <p className="mt-1 text-sm text-bx-muted">New arrivals, rare pieces and members-only deals, about twice a month.</p>
          </div>
          <NewsletterForm compact />
        </div>
      </div>

      <div className={`${container} grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]`}>
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-bx-muted">
            {site.tagline} A boutique exchange for fine jewelry, gold, designer goods and quality electronics. Pawn, sell or shop with confidence.
          </p>
          <ul className="mt-6 flex gap-2" aria-label="Social media">
            {(
              [
                ["instagram", "Instagram", site.social.instagram],
                ["facebook", "Facebook", site.social.facebook],
                ["tiktok", "TikTok", site.social.tiktok],
              ] as const
            ).map(([icon, label, href]) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`BHS Premier Pawn and Jewelry on ${label}`}
                  className="flex h-9 w-9 items-center justify-center text-bx-ink hover:opacity-60"
                >
                  <Icon name={icon} size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={headingClass}>Shop</h2>
          <ul className="space-y-2.5">
            {categories.slice(0, 8).map((category) => (
              <li key={category.slug}>
                <Link href={routes.category(category.slug)} className={linkClass}>
                  {category.shortName}
                </Link>
              </li>
            ))}
            <li>
              <Link href={routes.shop} className="text-sm font-medium text-bx-ink hover:opacity-60">
                Shop all →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className={headingClass}>Customer Service</h2>
          <ul className="space-y-2.5">
            {[
              ["FAQ", routes.faq],
              ["Make a Payment", routes.payment],
              ["Shipping", routes.shipping],
              ["Returns", routes.returns],
              ["How to Pawn", routes.howToPawn],
              ["How to Sell", routes.howToSell],
              ["BHS Rewards", routes.rewards],
              ["About Us", routes.about],
              ["Blog", routes.blog],
              ["Contact Us", routes.contact],
            ].map(([label, href]) => (
              <li key={label}>
                <Link href={href} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={headingClass}>Visit the Store</h2>
          <address className="not-italic">
            <Link href={routes.stores} className="text-sm leading-relaxed text-bx-muted hover:text-bx-ink">
              {fullAddress}
            </Link>
          </address>
          <dl className="mt-4 space-y-1.5 text-sm">
            {site.hours.map((row) => (
              <div key={row.days} className="flex justify-between gap-4">
                <dt className="text-bx-muted">{row.days}</dt>
                <dd className="text-bx-ink">{row.time}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={`tel:${site.phone.tel}`} className="inline-flex items-center gap-1.5 bg-bx-ink px-4 py-2 text-[13px] font-medium text-white hover:bg-black/80">
              <Icon name="phone" size={16} /> Call
            </a>
            <a href={`sms:${site.phone.sms}`} className="inline-flex items-center gap-1.5 border border-bx-ink px-4 py-2 text-[13px] font-medium hover:bg-bx-ink hover:text-white">
              <Icon name="message" size={16} /> Text Us
            </a>
          </div>
          <p className="mt-3 text-sm text-bx-muted">{site.phone.display}</p>
        </div>
      </div>

      <div className="border-t border-bx-line">
        <div className={`${container} flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between`}>
          <PaymentBadges tone="dark" />
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-bx-muted">
            {[
              ["Privacy Policy", routes.privacy],
              ["Terms of Service", routes.terms],
              ["Returns Policy", routes.returns],
              ["Pawn Loan Terms & Disclosures", routes.loanTerms],
              ["Accessibility", routes.accessibility],
              ["Photo Credits", routes.photoCredits],
            ].map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="hover:text-bx-ink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className={`${container} flex flex-col gap-2 pb-8 text-xs text-bx-muted sm:flex-row sm:justify-between`}>
          <p>© {new Date().getFullYear()} BHS Premier Pawn and Jewelry. All rights reserved.</p>
          <p>
            Photography by independent photographers under open licenses.{" "}
            <Link href={routes.photoCredits} className="underline underline-offset-2 hover:text-bx-ink">
              Photo credits
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
