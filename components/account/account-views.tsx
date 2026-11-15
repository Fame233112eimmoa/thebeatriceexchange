"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { getProductById } from "../../lib/catalog";
import { cx, formatDate, formatMoney } from "../../lib/format";
import { useHydrated } from "../../lib/persistent-store";
import { routes } from "../../lib/routes";
import { useAccount, useFavorites, useOrders } from "../../lib/store";
import type { Product } from "../../lib/types";
import { Icon } from "../ui/icon";
import { ProductCard } from "../ui/product-card";
import { btn, field } from "../ui/styles";

function Loading() {
  return <p className="py-16 text-center text-sm text-bx-muted">Loading…</p>;
}

/**
 * Front-end-only auth demo. No passwords are stored; replace with NextAuth /
 * Clerk / Supabase Auth etc. before launch.
 */
export function AuthPanel() {
  const id = useId();
  const hydrated = useHydrated();
  const { account, signIn, signOut, joinRewards } = useAccount();
  const { orders } = useOrders();
  const favorites = useFavorites();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  if (!hydrated) return <Loading />;

  if (account) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        <div className="border border-bx-line bg-white p-8 md:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bx-ink">Welcome back</p>
          <h2 className="mt-1 font-bx-serif text-3xl text-bx-ink">{account.name}</h2>
          <p className="text-sm text-bx-muted">{account.email}</p>
          {account.rewards ? (
            <p className="mt-4 inline-flex items-center gap-2 border border-bx-ink px-3 py-1 text-xs font-medium text-bx-ink">
              <Icon name="gift" size={14} /> BHS Rewards member
            </p>
          ) : (
            <Link href={routes.rewards} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-bx-ink underline">
              Join BHS Rewards →
            </Link>
          )}
          <button type="button" onClick={signOut} className={`${btn.outline} mt-6 !py-2`}>Sign out</button>
        </div>
        {[
          { href: routes.favorites, icon: "heart" as const, title: "Favorites", text: `${favorites.count} saved items` },
          { href: routes.orders, icon: "history" as const, title: "Order History", text: `${orders.length} orders` },
          { href: routes.payment, icon: "cash" as const, title: "Make a Loan Payment", text: "Pay or extend a pawn loan" },
        ].map((card) => (
          <Link key={card.title} href={card.href} className="group border border-bx-line bg-white p-6 hover:border-bx-ink">
            <Icon name={card.icon} size={26} className="text-bx-ink" />
            <h3 className="mt-4 font-bx-serif text-2xl text-bx-ink">{card.title}</h3>
            <p className="text-sm text-bx-muted">{card.text}</p>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md border border-bx-line bg-white p-6 sm:p-10">
      <div role="tablist" aria-label="Account" className="mb-8 grid grid-cols-2 bg-bx-cream p-1">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={mode === m}
            onClick={() => { setMode(m); setError(""); }}
            className={cx("py-2.5 text-sm font-semibold", mode === m ? "bg-bx-ink text-white" : "text-bx-charcoal")}
          >
            {m === "login" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const email = String(data.get("email") ?? "").trim();
          const password = String(data.get("password") ?? "");
          const name = mode === "register" ? String(data.get("name") ?? "").trim() : email.split("@")[0];
          if (mode === "register" && !name) return setError("Please enter your name.");
          if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email.");
          if (password.length < 8) return setError("Password must be at least 8 characters.");
          setError("");
          // Password is intentionally discarded: demo only.
          if (mode === "register" && data.get("rewards")) joinRewards(name, email);
          else signIn(name, email);
        }}
        className="space-y-4"
      >
        {mode === "register" ? (
          <div>
            <label htmlFor={`${id}-name`} className={field.label}>Full name</label>
            <input id={`${id}-name`} name="name" autoComplete="name" className={field.input} />
          </div>
        ) : null}
        <div>
          <label htmlFor={`${id}-email`} className={field.label}>Email</label>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" className={field.input} />
        </div>
        <div>
          <label htmlFor={`${id}-pw`} className={field.label}>Password</label>
          <input id={`${id}-pw`} name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} className={field.input} />
          {mode === "register" ? <p className={field.hint}>At least 8 characters.</p> : null}
        </div>
        {mode === "login" ? (
          <p className="text-right text-xs"><a href="#" className="font-semibold text-bx-ink underline">Forgot password?</a></p>
        ) : (
          <label className="flex items-start gap-2 text-xs text-bx-muted">
            <input type="checkbox" name="rewards" className="mt-0.5 h-4 w-4 accent-[#15161b]" defaultChecked />
            Enroll me in BHS Rewards (free).
          </label>
        )}
        {error ? <p role="alert" className={field.error}>{error}</p> : null}
        <button type="submit" className={`${btn.primary} w-full !py-3.5`}>{mode === "login" ? "Sign In" : "Create Account"}</button>
        <p className="text-center text-xs text-bx-muted">Demo only: accounts are stored in this browser and passwords are never saved.</p>
      </form>
    </div>
  );
}

export function FavoritesView() {
  const hydrated = useHydrated();
  const favorites = useFavorites();
  if (!hydrated) return <Loading />;
  const items = favorites.ids.map(getProductById).filter(Boolean) as Product[];
  if (!items.length) {
    return (
      <div className="border border-dashed border-bx-line bg-white p-12 text-center">
        <Icon name="heart" size={36} className="mx-auto text-bx-ink" />
        <h2 className="mt-4 font-bx-serif text-2xl text-bx-ink">No favorites yet</h2>
        <p className="mt-1 text-sm text-bx-muted">Tap the heart on any item to save it here.</p>
        <Link href={routes.shop} className={`${btn.primary} mt-6`}>Browse the Shop</Link>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => (
        <li key={p.id}><ProductCard product={p} /></li>
      ))}
    </ul>
  );
}

export function OrdersView() {
  const hydrated = useHydrated();
  const { orders } = useOrders();
  if (!hydrated) return <Loading />;
  if (!orders.length) {
    return (
      <div className="border border-dashed border-bx-line bg-white p-12 text-center">
        <Icon name="history" size={36} className="mx-auto text-bx-ink" />
        <h2 className="mt-4 font-bx-serif text-2xl text-bx-ink">No orders yet</h2>
        <p className="mt-1 text-sm text-bx-muted">Orders you place on this device will appear here.</p>
        <Link href={routes.shop} className={`${btn.primary} mt-6`}>Start Shopping</Link>
      </div>
    );
  }
  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li key={order.id} className="border border-bx-line bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bx-line pb-4">
            <div>
              <p className="font-semibold text-bx-ink">Order #{order.id}</p>
              <p className="text-xs text-bx-muted">Placed {formatDate(order.placedAt)} · {order.fulfillment === "pickup" ? "In-store pickup" : "Shipping"}</p>
            </div>
            <span className="bg-bx-cream px-3 py-1 text-xs font-semibold text-bx-ink">{order.status}</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {order.lines.map((line) => {
              const product = getProductById(line.productId);
              return (
                <li key={line.productId} className="flex justify-between gap-4">
                  {product ? <Link href={routes.product(product.slug)} className="text-bx-charcoal hover:underline">{line.name}</Link> : <span>{line.name}</span>}
                  <span className="text-bx-ink">{formatMoney(line.price)}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-right text-sm font-semibold text-bx-ink">Total {formatMoney(order.total)}</p>
        </li>
      ))}
    </ul>
  );
}
