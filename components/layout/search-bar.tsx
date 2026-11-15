"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";

import { categories } from "../../data/categories";
import { popularSearches } from "../../data/navigation";
import { searchProducts } from "../../lib/catalog";
import { cx, formatPrice } from "../../lib/format";
import { routes } from "../../lib/routes";
import { useRecentSearches } from "../../lib/store";
import { Icon } from "../ui/icon";
import { ProductArt } from "../ui/product-art";

type Option =
  | { kind: "term"; label: string; group: string }
  | { kind: "product"; label: string; href: string; group: string; productSlug: string }
  | { kind: "category"; label: string; href: string; group: string };

export function SearchBar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const router = useRouter();
  const recent = useRecentSearches();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  const productMatches = useMemo(() => (trimmed.length > 1 ? searchProducts(trimmed, 5) : []), [trimmed]);

  const options: Option[] = useMemo(() => {
    if (!trimmed) {
      return [
        ...recent.searches.map((term) => ({ kind: "term" as const, label: term, group: "Recent searches" })),
        ...popularSearches.map((term) => ({ kind: "term" as const, label: term, group: "Popular searches" })),
      ];
    }
    const lower = trimmed.toLowerCase();
    const categoryMatches = categories
      .filter((c) => c.name.toLowerCase().includes(lower) || c.subcategories.some((s) => s.toLowerCase().includes(lower)))
      .slice(0, 3)
      .map((c) => ({ kind: "category" as const, label: c.name, href: routes.category(c.slug), group: "Categories" }));
    return [
      { kind: "term" as const, label: trimmed, group: "Search" },
      ...productMatches.map((p) => ({
        kind: "product" as const,
        label: p.name,
        href: routes.product(p.slug),
        group: "Products",
        productSlug: p.slug,
      })),
      ...categoryMatches,
      ...popularSearches
        .filter((t) => t.toLowerCase().includes(lower) && t.toLowerCase() !== lower)
        .slice(0, 3)
        .map((term) => ({ kind: "term" as const, label: term, group: "Popular searches" })),
    ];
  }, [trimmed, recent.searches, productMatches]);

  function go(option: Option) {
    setOpen(false);
    setActive(-1);
    onNavigate?.();
    if (option.kind === "term") {
      recent.push(option.label);
      setQuery(option.label);
      router.push(routes.search(option.label));
    } else {
      if (trimmed) recent.push(trimmed);
      router.push(option.href);
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (active >= 0 && options[active]) return go(options[active]);
    if (!trimmed) return;
    go({ kind: "term", label: trimmed, group: "Search" });
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (options.length ? (i + 1) % options.length : -1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (options.length ? (i <= 0 ? options.length - 1 : i - 1) : -1));
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  let lastGroup = "";
  const productBySlug = new Map(productMatches.map((p) => [p.slug, p]));

  return (
    <div
      ref={wrapperRef}
      className={cx("relative", className)}
      onBlur={(event) => {
        if (!wrapperRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <form role="search" onSubmit={submit} className="relative">
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search BHS Premier Pawn and Jewelry
        </label>
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-bx-muted" />
        <input
          id={`${listId}-input`}
          type="search"
          value={query}
          autoComplete="off"
          placeholder="Search watches, gold, handbags, electronics…"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="h-12 w-full border border-bx-line bg-white pl-12 pr-28 text-base text-bx-ink placeholder:text-bx-muted/80 focus:border-bx-ink focus:bg-white focus:outline-none"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 bg-bx-ink px-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-black/80"
        >
          Search
        </button>
      </form>

      {open && options.length ? (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden border border-bx-line bg-white">
          <ul id={listId} role="listbox" aria-label="Search suggestions" className="max-h-[70vh] overflow-y-auto py-2">
            {options.map((option, index) => {
              const showGroup = option.group !== lastGroup;
              lastGroup = option.group;
              const product = option.kind === "product" ? productBySlug.get(option.productSlug) : undefined;
              return (
                <li key={`${option.group}-${option.label}`} role="presentation">
                  {showGroup ? (
                    <div className="flex items-center justify-between px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-bx-muted">
                      {option.group}
                      {option.group === "Recent searches" ? (
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={recent.clear}
                          className="normal-case tracking-normal text-bx-ink hover:underline"
                        >
                          Clear
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  <div
                    id={`${listId}-opt-${index}`}
                    role="option"
                    aria-selected={active === index}
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(option)}
                    onMouseEnter={() => setActive(index)}
                    className={cx(
                      "flex cursor-pointer items-center gap-3 px-4 py-2 text-sm text-bx-ink",
                      active === index && "bg-bx-cream",
                    )}
                  >
                    {product ? (
                      <>
                        <span className="h-10 w-10 shrink-0 overflow-hidden">
                          <ProductArt product={product} sizes="48px" />
                        </span>
                        <span className="min-w-0 flex-1 truncate">{option.label}</span>
                        <span className="font-semibold">{formatPrice(product.price)}</span>
                      </>
                    ) : (
                      <>
                        <Icon
                          name={option.group === "Recent searches" ? "history" : option.kind === "category" ? "grid" : "search"}
                          size={16}
                          className="text-bx-muted"
                        />
                        <span className="flex-1 truncate">
                          {option.group === "Search" ? (
                            <>
                              Search for <strong>“{option.label}”</strong>
                            </>
                          ) : (
                            option.label
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {trimmed && !productMatches.length ? (
            <p className="border-t border-bx-line px-4 py-3 text-xs text-bx-muted">
              No exact product matches. New items arrive daily, so{" "}
              <Link href={routes.contact} className="font-semibold text-bx-ink underline">
                ask us to watch for it
              </Link>
              .
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
