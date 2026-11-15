"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { cx } from "../../lib/format";
import { siteImage } from "../../lib/images";
import { routes } from "../../lib/routes";
import { SectionHeading } from "../ui/section-heading";
import { container } from "../ui/styles";

const flows: Record<"pawn" | "sell", { steps: Array<{ title: string; text: string }>; href: string; cta: string }> = {
  pawn: {
    steps: [
      { title: "Bring your item and a valid ID", text: "Any valuables, plus a government-issued photo ID. No appointment needed." },
      { title: "Get a free appraisal", text: "We test and value your item in minutes and explain our offer. No obligation." },
      { title: "Walk out with cash", text: "Accept the loan and leave with cash. Repay to get your item back." },
    ],
    href: routes.howToPawn,
    cta: "More about pawn loans",
  },
  sell: {
    steps: [
      { title: "Get an estimate", text: "Send a few photos online, or bring your item straight to the store." },
      { title: "Receive a fair offer", text: "We confirm condition and authenticity in person and make a firm offer." },
      { title: "Get paid on the spot", text: "Accept and get paid immediately. There's no loan to repay." },
    ],
    href: routes.howToSell,
    cta: "More about selling",
  },
};

export function HowItWorks() {
  const [mode, setMode] = useState<"pawn" | "sell">("pawn");
  const flow = flows[mode];
  const photo = siteImage("about", mode === "pawn" ? "how-pawning" : "how-selling");

  return (
    <section className="border-t border-bx-line" aria-labelledby="how-it-works">
      <div className={`${container} py-16`}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading id="how-it-works" title="How it works" />
          <div role="tablist" aria-label="Choose a process" className="mb-8 flex gap-6 border-b border-bx-line">
            {(["pawn", "sell"] as const).map((key) => (
              <button
                key={key}
                role="tab"
                id={`hiw-tab-${key}`}
                aria-selected={mode === key}
                aria-controls="hiw-panel"
                onClick={() => setMode(key)}
                className={cx(
                  "-mb-px border-b pb-2 text-[14px]",
                  mode === key ? "border-bx-ink font-medium text-bx-ink" : "border-transparent text-bx-muted hover:text-bx-ink",
                )}
              >
                {key === "pawn" ? "Pawning" : "Selling"}
              </button>
            ))}
          </div>
        </div>
        <div id="hiw-panel" role="tabpanel" aria-labelledby={`hiw-tab-${mode}`}>
          {photo ? (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden bg-[#f4f4f3] sm:aspect-[21/8]">
              <Image key={photo.src} src={photo.src} alt={photo.alt} fill sizes="(min-width: 1280px) 1216px, 100vw" className="object-cover" />
            </div>
          ) : null}
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
            {flow.steps.map((step, i) => (
              <li key={step.title} className="border-t border-bx-ink pt-5">
                <span className="text-[13px] text-bx-muted">Step {i + 1}</span>
                <h3 className="mt-2 font-bx-serif text-2xl font-normal text-bx-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-bx-muted">{step.text}</p>
              </li>
            ))}
          </ol>
          <Link href={flow.href} className="mt-10 inline-block border-b border-bx-ink pb-0.5 text-[13px] font-medium text-bx-ink hover:opacity-60">
            {flow.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
