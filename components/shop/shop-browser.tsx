"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { categories, getCategory } from "../../data/categories";
import {
  conditionGrades,
  filterProducts,
  getBrands,
  PAGE_SIZE,
  parseShopParams,
  sortOptions,
} from "../../lib/catalog";
import { cx } from "../../lib/format";
import { routes } from "../../lib/routes";
import { Icon } from "../ui/icon";
import { ProductCard } from "../ui/product-card";
import { btn, container } from "../ui/styles";

const priceRanges = [
  { label: "Under $100", min: null, max: 100 },
  { label: "$100 – $500", min: 100, max: 500 },
  { label: "$500 – $1,000", min: 500, max: 1000 },
  { label: "$1,000 – $5,000", min: 1000, max: 5000 },
  { label: "$5,000+", min: 5000, max: null },
];

export function ShopBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const params = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const { filters, page, view } = parseShopParams(params);
  const brands = useMemo(() => getBrands(), []);
  const results = useMemo(() => filterProducts(filters), [filters]);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const [minDraft, setMinDraft] = useState(filters.minPrice?.toString() ?? "");
  const [maxDraft, setMaxDraft] = useState(filters.maxPrice?.toString() ?? "");

  function update(changes: Record<string, string | null>, resetPage = true) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    if (resetPage && !("page" in changes)) next.delete("page");
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  function toggleList(key: string, current: string[], value: string) {
    const nextList = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    const changes: Record<string, string | null> = { [key]: nextList.join(",") || null };
    if (key === "category") changes.sub = null;
    update(changes);
  }

  const activeCategory = filters.categories.length === 1 ? getCategory(filters.categories[0]) : undefined;
  const heading = filters.q
    ? `Results for “${filters.q}”`
    : filters.subcategory
      ? filters.subcategory
      : activeCategory
        ? activeCategory.name
        : filters.deals
          ? "Hot Deals"
          : filters.rare
            ? "Rare Finds"
            : filters.sort === "newest"
              ? "New Arrivals"
              : "Shop All";

  const chips: Array<{ label: string; clear: () => void }> = [
    ...(filters.q ? [{ label: `“${filters.q}”`, clear: () => update({ q: null }) }] : []),
    ...filters.categories.map((slug) => ({
      label: getCategory(slug)?.shortName ?? slug,
      clear: () => toggleList("category", filters.categories, slug),
    })),
    ...(filters.subcategory ? [{ label: filters.subcategory, clear: () => update({ sub: null }) }] : []),
    ...filters.brands.map((b) => ({ label: b, clear: () => toggleList("brand", filters.brands, b) })),
    ...filters.conditions.map((c) => ({ label: c, clear: () => toggleList("condition", filters.conditions, c) })),
    ...(filters.minPrice !== null || filters.maxPrice !== null
      ? [
          {
            label: `$${filters.minPrice ?? 0} – ${filters.maxPrice !== null ? `$${filters.maxPrice}` : "any"}`,
            clear: () => {
              setMinDraft("");
              setMaxDraft("");
              update({ min: null, max: null });
            },
          },
        ]
      : []),
    ...(filters.pickupOnly ? [{ label: "In-store pickup", clear: () => update({ pickup: null }) }] : []),
    ...(filters.deals ? [{ label: "Deals", clear: () => update({ deals: null }) }] : []),
    ...(filters.rare ? [{ label: "Rare finds", clear: () => update({ rare: null }) }] : []),
  ];

  const checkbox = "h-4 w-4 shrink-0 accent-[#15161b]";
  const groupTitle = "mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-bx-ink";

  const filterPanel = (
    <div className="space-y-8">
      <fieldset>
        <legend className={groupTitle}>Category</legend>
        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c.slug}>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-bx-charcoal hover:text-bx-ink">
                <input type="checkbox" className={checkbox} checked={filters.categories.includes(c.slug)} onChange={() => toggleList("category", filters.categories, c.slug)} />
                {c.name}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {activeCategory ? (
        <fieldset>
          <legend className={groupTitle}>{activeCategory.shortName}</legend>
          <ul className="flex flex-wrap gap-2">
            {activeCategory.subcategories.map((sub) => (
              <li key={sub}>
                <button
                  type="button"
                  aria-pressed={filters.subcategory === sub}
                  onClick={() => update({ sub: filters.subcategory === sub ? null : sub })}
                  className={cx(
                    "border px-3 py-1 text-xs font-medium",
                    filters.subcategory === sub ? "border-bx-ink bg-bx-ink text-white" : "border-bx-line bg-white text-bx-charcoal hover:border-bx-ink",
                  )}
                >
                  {sub}
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
      ) : null}

      <fieldset>
        <legend className={groupTitle}>Price Range</legend>
        <ul className="space-y-2">
          {priceRanges.map((range) => {
            const checked = filters.minPrice === range.min && filters.maxPrice === range.max;
            return (
              <li key={range.label}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-bx-charcoal hover:text-bx-ink">
                  <input
                    type="radio"
                    name="price-range"
                    className={checkbox}
                    checked={checked}
                    onChange={() => {
                      setMinDraft(range.min?.toString() ?? "");
                      setMaxDraft(range.max?.toString() ?? "");
                      update({ min: range.min?.toString() ?? null, max: range.max?.toString() ?? null });
                    }}
                  />
                  {range.label}
                </label>
              </li>
            );
          })}
        </ul>
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update({ min: minDraft || null, max: maxDraft || null });
          }}
        >
          <label className="sr-only" htmlFor="bx-min">Minimum price</label>
          <input id="bx-min" inputMode="numeric" placeholder="$ Min" value={minDraft} onChange={(e) => setMinDraft(e.target.value.replace(/\D/g, ""))} className="w-full min-w-0 border border-bx-line bg-white px-3 py-2 text-base sm:text-sm" />
          <span aria-hidden="true" className="text-bx-muted">–</span>
          <label className="sr-only" htmlFor="bx-max">Maximum price</label>
          <input id="bx-max" inputMode="numeric" placeholder="$ Max" value={maxDraft} onChange={(e) => setMaxDraft(e.target.value.replace(/\D/g, ""))} className="w-full min-w-0 border border-bx-line bg-white px-3 py-2 text-base sm:text-sm" />
          <button type="submit" className="bg-bx-ink px-3 py-2 text-sm font-semibold text-white" aria-label="Apply price range">
            Go
          </button>
        </form>
      </fieldset>

      <fieldset>
        <legend className={groupTitle}>Condition</legend>
        <ul className="space-y-2">
          {conditionGrades.map((c) => (
            <li key={c}>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-bx-charcoal hover:text-bx-ink">
                <input type="checkbox" className={checkbox} checked={filters.conditions.includes(c)} onChange={() => toggleList("condition", filters.conditions, c)} />
                {c}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend className={groupTitle}>Availability</legend>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-bx-charcoal">
            <input type="checkbox" className={checkbox} checked={filters.pickupOnly} onChange={() => update({ pickup: filters.pickupOnly ? null : "1" })} />
            In-store pickup available
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-bx-charcoal">
            <input type="checkbox" className={checkbox} checked={filters.deals} onChange={() => update({ deals: filters.deals ? null : "1" })} />
            On sale
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-bx-charcoal">
            <input type="checkbox" className={checkbox} checked={filters.rare} onChange={() => update({ rare: filters.rare ? null : "1" })} />
            Rare finds
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className={groupTitle}>Brand</legend>
        <ul className="max-h-64 space-y-2 overflow-y-auto pr-2">
          {brands.map((b) => (
            <li key={b}>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-bx-charcoal hover:text-bx-ink">
                <input type="checkbox" className={checkbox} checked={filters.brands.includes(b)} onChange={() => toggleList("brand", filters.brands, b)} />
                {b}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  );

  return (
    <div className={`${container} py-10`}>
      <div className="mb-6 flex flex-col gap-2">
        <nav aria-label="Breadcrumb" className="text-xs text-bx-muted">
          <Link href={routes.home} className="hover:text-bx-ink">Home</Link> / <Link href={pathname} className="hover:text-bx-ink">Shop</Link>
          {activeCategory ? <> / <span className="text-bx-ink">{activeCategory.name}</span></> : null}
        </nav>
        <h1 className="font-bx-serif text-4xl font-normal text-bx-ink sm:text-5xl">{heading}</h1>
        {activeCategory && !filters.subcategory ? <p className="text-bx-muted">{activeCategory.blurb}</p> : null}
      </div>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside aria-label="Filters" className="hidden lg:block">
          {filterPanel}
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-bx-line pb-4">
            <button type="button" onClick={() => setFiltersOpen(true)} className={`${btn.outline} !px-4 !py-2 lg:hidden`}>
              <Icon name="filter" size={18} /> Filters{chips.length ? ` (${chips.length})` : ""}
            </button>
            <p className="text-sm text-bx-muted" aria-live="polite">
              <strong className="text-bx-ink">{results.length}</strong> {results.length === 1 ? "item" : "items"}
              {isPending ? " · updating…" : ""}
            </p>
            <div className="ml-auto flex items-center gap-2">
              <label htmlFor="bx-sort" className="sr-only">Sort by</label>
              <select
                id="bx-sort"
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value === "featured" ? null : e.target.value })}
                className="border border-bx-line bg-white py-2 pl-4 pr-8 text-sm font-medium text-bx-ink"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <div className="hidden border border-bx-line bg-white p-1 sm:flex" role="group" aria-label="Layout">
                {(["grid", "list"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={view === v}
                    aria-label={`${v === "grid" ? "Grid" : "List"} view`}
                    onClick={() => update({ view: v === "grid" ? null : "list" }, false)}
                    className={cx("flex h-8 w-8 items-center justify-center", view === v ? "bg-bx-ink text-white" : "text-bx-muted hover:text-bx-ink")}
                  >
                    <Icon name={v} size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {chips.length ? (
            <ul className="mb-6 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <li key={chip.label}>
                  <button type="button" onClick={chip.clear} className="inline-flex items-center gap-1.5 bg-bx-cream px-3 py-1.5 text-xs font-medium text-bx-ink hover:bg-bx-line" aria-label={`Remove filter ${chip.label}`}>
                    {chip.label} <Icon name="close" size={12} />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={() => { setMinDraft(""); setMaxDraft(""); startTransition(() => router.replace(pathname, { scroll: false })); }} className="text-xs font-semibold text-bx-ink underline underline-offset-2">
                  Clear all
                </button>
              </li>
            </ul>
          ) : null}

          {pageItems.length ? (
            <ul className={cx(isPending && "opacity-60 transition-opacity", view === "grid" ? "grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4" : "space-y-4")}>
              {pageItems.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} layout={view} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="border border-dashed border-bx-line bg-white p-12 text-center">
              <Icon name="search" size={32} className="mx-auto text-bx-ink" />
              <h2 className="mt-4 font-bx-serif text-2xl text-bx-ink">No matches. Yet.</h2>
              <p className="mt-2 text-sm text-bx-muted">New inventory arrives every day. Try removing a filter, or let us know what you&apos;re looking for.</p>
              <button type="button" onClick={() => router.replace(pathname)} className={`${btn.primary} mt-6`}>Clear filters</button>
            </div>
          )}

          {pageCount > 1 ? (
            <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
              <button type="button" disabled={currentPage === 1} onClick={() => update({ page: String(currentPage - 1) }, false)} className={`${btn.icon} disabled:opacity-30`} aria-label="Previous page">
                <Icon name="chevronLeft" />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-current={n === currentPage ? "page" : undefined}
                  onClick={() => {
                    update({ page: n === 1 ? null : String(n) }, false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={cx("h-10 min-w-10 px-3 text-sm font-semibold", n === currentPage ? "bg-bx-ink text-white" : "text-bx-ink hover:bg-bx-cream")}
                >
                  {n}
                </button>
              ))}
              <button type="button" disabled={currentPage === pageCount} onClick={() => update({ page: String(currentPage + 1) }, false)} className={`${btn.icon} disabled:opacity-30`} aria-label="Next page">
                <Icon name="chevronRight" />
              </button>
            </nav>
          ) : null}
        </div>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-bx-ink/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[min(90vw,380px)] flex-col bg-bx-ivory">
            <div className="flex items-center justify-between border-b border-bx-line px-5 py-4">
              <h2 className="font-bx-serif text-2xl text-bx-ink">Filters</h2>
              <button type="button" onClick={() => setFiltersOpen(false)} className={btn.icon} aria-label="Close filters">
                <Icon name="close" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">{filterPanel}</div>
            <div className="border-t border-bx-line p-4">
              <button type="button" onClick={() => setFiltersOpen(false)} className={`${btn.primary} w-full`}>
                Show {results.length} {results.length === 1 ? "item" : "items"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
