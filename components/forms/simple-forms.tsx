"use client";

import { useId, useState } from "react";

import { site } from "../../data/site";
import { formatMoney } from "../../lib/format";
import { useAccount } from "../../lib/store";
import { Icon } from "../ui/icon";
import { btn, field } from "../ui/styles";

function Success({ title, children, onReset }: { title: string; children: React.ReactNode; onReset?: () => void }) {
  return (
    <div role="status" className="border border-bx-line bg-white p-8 text-center sm:p-10">
      <span className="mx-auto flex h-12 w-12 items-center justify-center border border-bx-ink text-bx-ink"><Icon name="check" size={22} /></span>
      <h2 className="mt-4 font-bx-serif text-3xl text-bx-ink">{title}</h2>
      <div className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bx-muted">{children}</div>
      {onReset ? <button type="button" onClick={onReset} className={`${btn.outline} mt-6`}>Start over</button> : null}
    </div>
  );
}

/** Placeholder: connect to your pawn management system's payment API. */
export function LoanPaymentForm() {
  const id = useId();
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ ticket: string; amount: number } | null>(null);

  if (done) {
    return (
      <Success title="Payment received (demo)" onReset={() => setDone(null)}>
        <p>
          We&apos;ve recorded a {formatMoney(done.amount)} payment toward ticket <strong className="text-bx-ink">#{done.ticket}</strong>. You&apos;ll get a confirmation email shortly.
        </p>
        <p className="mt-2 text-xs">Demo only. No payment was processed.</p>
      </Success>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const ticket = String(data.get("ticket") ?? "").trim();
        const last = String(data.get("last") ?? "").trim();
        const amount = Number(String(data.get("amount") ?? "").replace(/[^0-9.]/g, ""));
        if (!/^[A-Za-z0-9-]{4,}$/.test(ticket)) return setError("Enter the ticket number printed on your pawn ticket.");
        if (!last) return setError("Enter the last name on the loan.");
        if (!amount || amount <= 0) return setError("Enter a payment amount.");
        setError("");
        setDone({ ticket, amount });
      }}
      className="space-y-5 border border-bx-line bg-white p-6 sm:p-10"
    >
      <div>
        <label htmlFor={`${id}-ticket`} className={field.label}>Pawn ticket number</label>
        <input id={`${id}-ticket`} name="ticket" placeholder="e.g. 204518" className={field.input} />
        <p className={field.hint}>Printed at the top right of your pawn ticket.</p>
      </div>
      <div>
        <label htmlFor={`${id}-last`} className={field.label}>Last name on loan</label>
        <input id={`${id}-last`} name="last" autoComplete="family-name" className={field.input} />
      </div>
      <div>
        <label htmlFor={`${id}-amount`} className={field.label}>Payment amount (USD)</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-bx-muted">$</span>
          <input id={`${id}-amount`} name="amount" inputMode="decimal" placeholder="0.00" className={`${field.input} pl-8`} />
        </div>
        <p className={field.hint}>Pay the finance charge to extend, or the full balance to redeem your item.</p>
      </div>
      {error ? <p role="alert" className={field.error}>{error}</p> : null}
      <button type="submit" className={`${btn.primary} w-full !py-3.5`}><Icon name="lock" size={18} /> Continue to Payment</button>
      <p className="text-center text-xs text-bx-muted">
        Need your balance? Call <a href={`tel:${site.phone.tel}`} className="font-semibold text-bx-ink underline">{site.phone.display}</a>.
      </p>
    </form>
  );
}

export function ContactForm() {
  const id = useId();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  if (done) {
    return (
      <Success title="Message sent" onReset={() => setDone(false)}>
        Thanks for reaching out. We reply to most messages within one business day.
      </Success>
    );
  }
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        if (!String(data.get("name") ?? "").trim()) return setError("Please enter your name.");
        if (!/^\S+@\S+\.\S+$/.test(String(data.get("email") ?? ""))) return setError("Please enter a valid email.");
        if (String(data.get("message") ?? "").trim().length < 5) return setError("Please enter a message.");
        setError("");
        setDone(true);
      }}
      className="grid gap-5 border border-bx-line bg-white p-6 sm:grid-cols-2 sm:p-10"
    >
      <div>
        <label htmlFor={`${id}-name`} className={field.label}>Name</label>
        <input id={`${id}-name`} name="name" autoComplete="name" className={field.input} />
      </div>
      <div>
        <label htmlFor={`${id}-email`} className={field.label}>Email</label>
        <input id={`${id}-email`} name="email" type="email" autoComplete="email" className={field.input} />
      </div>
      <div>
        <label htmlFor={`${id}-phone`} className={field.label}>Phone (optional)</label>
        <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" className={field.input} />
      </div>
      <div>
        <label htmlFor={`${id}-topic`} className={field.label}>Topic</label>
        <select id={`${id}-topic`} name="topic" className={field.input}>
          {["General question", "Pawn loan", "Selling an item", "An online order", "Item search request", "Other"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-message`} className={field.label}>Message</label>
        <textarea id={`${id}-message`} name="message" rows={5} className={field.input} />
      </div>
      {error ? <p role="alert" className={`${field.error} sm:col-span-2`}>{error}</p> : null}
      <div className="sm:col-span-2">
        <button type="submit" className={btn.primary}>Send Message</button>
      </div>
    </form>
  );
}

export function RewardsJoinForm() {
  const id = useId();
  const { account, joinRewards } = useAccount();
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);

  if (joined || account?.rewards) {
    return (
      <Success title="Welcome to Beatrice Rewards">
        You&apos;re in{account ? `, ${account.name.split(" ")[0]}` : ""}! You&apos;ll earn 1 point per $1 on purchases and 25 bonus points on every loan renewal. Show your email at the counter to earn in store.
      </Success>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const name = String(data.get("name") ?? "").trim();
        const email = String(data.get("email") ?? "").trim();
        if (!name) return setError("Please enter your name.");
        if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email.");
        setError("");
        joinRewards(name, email);
        setJoined(true);
      }}
      className="space-y-4 border border-bx-line bg-white p-6 sm:p-8"
    >
      <h2 className="font-bx-serif text-2xl text-bx-ink">Join free in 30 seconds</h2>
      <div>
        <label htmlFor={`${id}-name`} className={field.label}>Full name</label>
        <input id={`${id}-name`} name="name" autoComplete="name" defaultValue={account?.name} className={field.input} />
      </div>
      <div>
        <label htmlFor={`${id}-email`} className={field.label}>Email</label>
        <input id={`${id}-email`} name="email" type="email" autoComplete="email" defaultValue={account?.email} className={field.input} />
      </div>
      <div>
        <label htmlFor={`${id}-bday`} className={field.label}>Birthday (optional)</label>
        <input id={`${id}-bday`} name="birthday" type="date" className={field.input} />
        <p className={field.hint}>For a birthday treat.</p>
      </div>
      {error ? <p role="alert" className={field.error}>{error}</p> : null}
      <button type="submit" className={`${btn.gold} w-full !py-3.5`}>Join Now</button>
    </form>
  );
}
