"use client";

import { useId, useState } from "react";

import { cx } from "../../lib/format";
import { Icon } from "../ui/icon";

/** Front-end only. Hook `onSubmit` up to Klaviyo / Mailchimp / your ESP later. */
export function NewsletterForm({ tone = "dark", compact = false }: { tone?: "dark" | "light"; compact?: boolean }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const light = tone === "light";

  if (done) {
    return (
      <p role="status" className={cx("flex items-center gap-2 text-sm font-medium", light ? "text-white" : "text-bx-ink")}>
        <Icon name="check" size={18} /> You&apos;re on the list. Watch your inbox for new arrivals and members-only deals.
      </p>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
        if (smsOptIn && phone.replace(/\D/g, "").length < 10) return setError("Please enter a 10-digit mobile number for texts.");
        setError("");
        setDone(true);
      }}
      className="w-full"
    >
      <div className={cx("flex gap-2", compact ? "flex-col sm:flex-row" : "flex-col sm:flex-row")}>
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-invalid={Boolean(error) && !/^\S+@\S+\.\S+$/.test(email)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cx(
            "h-12 min-w-0 flex-1 border px-4 text-base focus:outline-none focus:border-bx-ink",
            light ? "border-white/15 bg-white/5 text-bx-ivory placeholder:text-bx-ivory/50" : "border-bx-line bg-white text-bx-ink placeholder:text-bx-muted",
          )}
        />
        <button
          type="submit"
          className={cx(
            "h-12 shrink-0 px-7 text-[13px] font-semibold uppercase tracking-[0.08em]",
            light ? "bg-white text-bx-ink hover:bg-white/85" : "bg-bx-ink text-white hover:bg-black/80",
          )}
        >
          Subscribe
        </button>
      </div>
      <label className={cx("mt-3 flex items-start gap-2.5 text-xs leading-relaxed", light ? "text-bx-ivory/70" : "text-bx-muted")}>
        <input
          type="checkbox"
          checked={smsOptIn}
          onChange={(e) => setSmsOptIn(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#111111]"
        />
        <span>
          Text me exclusive deals too (optional). Msg &amp; data rates may apply. Reply STOP to cancel.
        </span>
      </label>
      {smsOptIn ? (
        <div className="mt-2">
          <label htmlFor={`${id}-phone`} className="sr-only">
            Mobile number
          </label>
          <input
            id={`${id}-phone`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile number"
            className={cx(
              "h-11 w-full border px-4 text-base focus:outline-none focus:border-bx-ink sm:w-72",
              light ? "border-white/15 bg-white/5 text-bx-ivory placeholder:text-bx-ivory/50" : "border-bx-line bg-white text-bx-ink",
            )}
          />
        </div>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className={cx("mt-2 text-xs font-medium", light ? "text-red-300" : "text-bx-ruby")}>
          {error}
        </p>
      ) : null}
    </form>
  );
}
