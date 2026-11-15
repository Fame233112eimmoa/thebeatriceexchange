import { fullAddress, site } from "../../data/site";
import type { FaqGroup } from "../../data/faq";
import { Icon } from "./icon";
import { PageHero } from "./page-hero";
import { btn, container } from "./styles";

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl text-[15px] leading-relaxed text-bx-charcoal [&_a]:font-semibold [&_a]:text-bx-ink [&_a]:underline [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:font-bx-serif [&_h2]:text-3xl [&_h2]:font-normal [&_h2]:text-bx-ink [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-bx-ink [&_li]:mb-1.5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6">
      {children}
    </div>
  );
}

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <PageHero title={title} crumbs={[{ label: title }]} description={`Last updated ${updated}`} />
      <div className={`${container} py-12`}>
        <p className="mb-8 max-w-3xl border-l-2 border-bx-ink py-1 pl-4 text-sm text-bx-charcoal">
          <strong>Placeholder text.</strong> This page is a starting template only and is not legal advice. Have it reviewed by a licensed attorney in [STATE] before publishing.
        </p>
        <Prose>{children}</Prose>
      </div>
    </>
  );
}

export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.title} aria-labelledby={`faq-${group.title}`}>
          <h2 id={`faq-${group.title}`} className="mb-4 font-bx-serif text-3xl font-normal text-bx-ink">
            {group.title}
          </h2>
          <div className="divide-y divide-bx-line border-y border-bx-line">
            {group.items.map((item) => (
              <details key={item.q} className="group [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold text-bx-ink">
                  {item.q}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center transition group-open:rotate-45">
                    <Icon name="plus" size={16} />
                  </span>
                </summary>
                <p className="max-w-3xl pb-6 pr-12 text-[15px] leading-relaxed text-bx-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function MapEmbed({ className = "" }: { className?: string }) {
  const q = encodeURIComponent(site.mapQuery);
  return (
    <iframe
      title={`Map showing ${site.name} at ${fullAddress}`}
      src={`https://www.google.com/maps?q=${q}&output=embed`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={`h-full min-h-[320px] w-full border border-bx-line grayscale ${className}`}
    />
  );
}

export function directionsUrl() {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.mapQuery)}`;
}

export function HoursList() {
  return (
    <dl className="divide-y divide-bx-line">
      {site.hours.map((row) => (
        <div key={row.days} className="flex justify-between gap-4 py-3 text-sm">
          <dt className="text-bx-charcoal">{row.days}</dt>
          <dd className="font-semibold text-bx-ink">{row.time}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CallTextButtons() {
  return (
    <div className="flex flex-wrap gap-3">
      <a href={`tel:${site.phone.tel}`} className={btn.primary}>
        <Icon name="phone" size={18} /> Call {site.phone.display}
      </a>
      <a href={`sms:${site.phone.sms}`} className={btn.outline}>
        <Icon name="message" size={18} /> Text Us
      </a>
    </div>
  );
}

export function StepList({ steps }: { steps: Array<{ title: string; text: string }> }) {
  return (
    <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
      {steps.map((s, i) => (
        <li key={s.title} className="border-t border-bx-ink pt-5">
          <span className="text-[13px] text-bx-muted">Step {i + 1}</span>
          <h3 className="mt-2 font-bx-serif text-2xl font-normal text-bx-ink">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-bx-muted">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
