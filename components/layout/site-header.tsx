"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { categories } from "../../data/categories";
import { mainNav } from "../../data/navigation";
import { site } from "../../data/site";
import { cx } from "../../lib/format";
import { bx, routes } from "../../lib/routes";
import { useAccount, useCart, useFavorites } from "../../lib/store";
import { Icon } from "../ui/icon";
import { Logo } from "../ui/logo";
import { btn, container } from "../ui/styles";
import { SearchBar } from "./search-bar";

function CountBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-bx-ink px-1 text-[10px] font-semibold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function subcategoryHref(slug: string, sub: string) {
  return bx(`/shop?category=${slug}&sub=${encodeURIComponent(sub)}`);
}

export function SiteHeader() {
  const cart = useCart();
  const favorites = useFavorites();
  const { account } = useAccount();
  const pathname = usePathname();
  const [megaOpen, setMegaOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openedPath, setOpenedPath] = useState(pathname);
  const closeTimer = useRef<number | undefined>(undefined);

  // Close menus when the route changes (derived during render, no effect needed).
  if (openedPath !== pathname) {
    setOpenedPath(pathname);
    setMegaOpen(false);
    setDrawerOpen(false);
  }

  const openMega = () => {
    window.clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const closeMegaSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMegaOpen(false), 140);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-bx-line bg-white">
        <div className={`${container} flex items-center gap-3 py-3 lg:gap-8 lg:py-4`}>
          <button
            type="button"
            className={`${btn.icon} -ml-2 lg:hidden`}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <Icon name="menu" size={22} />
          </button>
          <Logo compact className="flex sm:hidden" />
          <Logo className="hidden sm:flex" />
          <SearchBar className="hidden flex-1 lg:block" />
          <nav aria-label="Account" className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <Link href={routes.account} className={`${btn.icon} hidden sm:inline-flex`} aria-label={account ? `Account — ${account.name}` : "Sign in or create account"}>
              <Icon name="user" size={22} />
            </Link>
            <Link href={routes.favorites} className={`${btn.icon} relative`} aria-label={`Favorites (${favorites.count})`}>
              <Icon name="heart" size={22} />
              <CountBadge count={favorites.count} />
            </Link>
            <Link href={routes.cart} className={`${btn.icon} relative`} aria-label={`Cart (${cart.count} items)`}>
              <Icon name="bag" size={22} />
              <CountBadge count={cart.count} />
            </Link>
          </nav>
        </div>

        <div className={`${container} pb-3 lg:hidden`}>
          <SearchBar />
        </div>

        {/* Desktop primary navigation */}
        <nav aria-label="Main" className="relative hidden border-t border-bx-line lg:block" onMouseLeave={closeMegaSoon}>
          <div className={`${container} flex h-12 items-center gap-1`}>
            <button
              type="button"
              aria-expanded={megaOpen}
              aria-controls="bx-mega-menu"
              onMouseEnter={openMega}
              onClick={() => setMegaOpen((v) => !v)}
              className={cx(
                "inline-flex h-full items-center gap-1 border-b-2 px-3 text-sm font-semibold tracking-wide",
                megaOpen ? "border-bx-ink text-bx-ink" : "border-transparent text-bx-charcoal hover:text-bx-ink",
              )}
            >
              Shop <Icon name="chevronDown" size={16} className={cx("transition", megaOpen && "rotate-180")} />
            </button>
            {mainNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onMouseEnter={closeMegaSoon}
                className="inline-flex h-full items-center border-b-2 border-transparent px-3 text-sm font-semibold tracking-wide text-bx-charcoal hover:border-bx-line hover:text-bx-ink"
              >
                {item.label}
              </Link>
            ))}
            <Link href={routes.howToSell + "#estimate"} className={`${btn.primary} ml-auto !px-5 !py-2.5`}>
              Sell Your Stuff
            </Link>
          </div>

          {megaOpen ? (
            <div
              id="bx-mega-menu"
              onMouseEnter={openMega}
              onKeyDown={(e) => e.key === "Escape" && setMegaOpen(false)}
              className="absolute inset-x-0 top-full border-t border-bx-line bg-white"
            >
              <div className={`${container} grid grid-cols-4 gap-x-8 gap-y-6 py-8 xl:grid-cols-6`}>
                {categories.map((category) => (
                  <div key={category.slug}>
                    <Link
                      href={routes.category(category.slug)}
                      className="mb-2 flex items-center gap-2 text-sm font-semibold text-bx-ink hover:text-bx-ink"
                    >
                      <Icon name={category.icon} size={18} className="text-bx-ink" />
                      {category.shortName}
                    </Link>
                    <ul className="space-y-1.5">
                      {category.subcategories.map((sub) => (
                        <li key={sub}>
                          <Link href={subcategoryHref(category.slug, sub)} className="text-sm text-bx-muted hover:text-bx-ink">
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="border-t border-bx-line">
                <div className={`${container} flex items-center justify-between py-3 text-sm`}>
                  <span className="text-bx-muted">New inventory arrives daily, and every item is inspected and authenticated.</span>
                  <Link href={routes.shop} className="font-semibold text-bx-ink underline-offset-4 hover:underline">
                    Shop everything →
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </nav>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      aria-label="Menu"
      className="m-0 h-dvh max-h-none w-[min(88vw,380px)] max-w-none bg-white p-0 backdrop:bg-bx-ink/50 open:animate-[bx-drawer_260ms_ease]"
    >
      <style>{`@keyframes bx-drawer{from{transform:translateX(-100%)}to{transform:translateX(0)}}@media (prefers-reduced-motion: reduce){dialog{animation:none!important}}`}</style>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-bx-line px-4 py-3">
          <Logo compact />
          <button type="button" onClick={onClose} className={btn.icon} aria-label="Close menu" autoFocus>
            <Icon name="close" size={22} />
          </button>
        </div>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-2 py-3">
          <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-bx-muted">Shop by Category</p>
          <ul>
            {categories.map((category) => {
              const isOpen = expanded === category.slug;
              return (
                <li key={category.slug}>
                  <div className="flex items-center">
                    <Link
                      href={routes.category(category.slug)}
                      onClick={onClose}
                      className="flex flex-1 items-center gap-3 px-3 py-2.5 text-[15px] text-bx-ink hover:bg-bx-cream"
                    >
                      <Icon name={category.icon} size={20} className="text-bx-ink" />
                      {category.name}
                    </Link>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Hide" : "Show"} ${category.name} subcategories`}
                      onClick={() => setExpanded(isOpen ? null : category.slug)}
                      className={btn.icon}
                    >
                      <Icon name="chevronDown" size={18} className={cx("transition", isOpen && "rotate-180")} />
                    </button>
                  </div>
                  {isOpen ? (
                    <ul className="mb-2 ml-12 space-y-1 border-l border-bx-line pl-3">
                      {category.subcategories.map((sub) => (
                        <li key={sub}>
                          <Link href={subcategoryHref(category.slug, sub)} onClick={onClose} className="block py-1.5 text-sm text-bx-muted hover:text-bx-ink">
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <hr className="my-3 border-bx-line" />
          <ul>
            {[...mainNav, { label: "Make a Loan Payment", href: routes.payment }, { label: "Store Locator & Hours", href: routes.stores }, { label: "My Account", href: routes.account }].map((item) => (
              <li key={item.label}>
                <Link href={item.href} onClick={onClose} className="block px-3 py-2.5 text-[15px] font-medium text-bx-ink hover:bg-bx-cream">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-2 border-t border-bx-line p-4">
          <Link href={routes.howToSell + "#estimate"} onClick={onClose} className={`${btn.primary} w-full`}>
            Sell Your Stuff
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <a href={`tel:${site.phone.tel}`} className={`${btn.outline} !px-3`}>
              <Icon name="phone" size={16} /> Call
            </a>
            <a href={`sms:${site.phone.sms}`} className={`${btn.outline} !px-3`}>
              <Icon name="message" size={16} /> Text Us
            </a>
          </div>
        </div>
      </div>
    </dialog>
  );
}
