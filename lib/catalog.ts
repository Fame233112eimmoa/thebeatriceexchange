import { categories, getCategory } from "../data/categories";
import { products } from "../data/products";
import type { ConditionGrade, Product } from "./types";

/**
 * The single read layer for inventory. Swap these implementations for a
 * database / Shopify / Stripe Products call without touching the UI.
 */

export const conditionGrades: ConditionGrade[] = ["Like New", "Excellent", "Good", "Fair"];

export function getAllProducts() {
  return products;
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getHotDeals() {
  return products.filter((product) => product.hotDeal);
}

export function getNewArrivals(limit = 10) {
  return [...products].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, limit);
}

export function getRareFinds() {
  return products.filter((product) => product.rareFind);
}

export function getRelatedProducts(product: Product, limit = 8) {
  const sameCategory = products.filter((p) => p.category === product.category && p.id !== product.id);
  const others = products.filter((p) => p.category !== product.category && p.brand === product.brand);
  return [...sameCategory, ...others].slice(0, limit);
}

export function getBrands() {
  return Array.from(new Set(products.map((product) => product.brand))).sort();
}

export function categoryName(slug: string) {
  return getCategory(slug)?.name ?? "Shop";
}

export function searchProducts(query: string, limit?: number) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const matches = products.filter((product) => {
    const haystack = [
      product.name,
      product.brand,
      product.subcategory,
      getCategory(product.category)?.name ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
  return typeof limit === "number" ? matches.slice(0, limit) : matches;
}

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "discount";

export const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "discount", label: "Biggest Savings" },
];

export type ShopFilters = {
  q: string;
  categories: string[];
  subcategory: string | null;
  brands: string[];
  conditions: ConditionGrade[];
  minPrice: number | null;
  maxPrice: number | null;
  pickupOnly: boolean;
  deals: boolean;
  rare: boolean;
  sort: SortKey;
};

function savingsRatio(product: Product) {
  if (!product.originalPrice) return 0;
  return (product.originalPrice - product.price) / product.originalPrice;
}

export function filterProducts(filters: ShopFilters) {
  let list = filters.q ? searchProducts(filters.q) : [...products];

  if (filters.categories.length) list = list.filter((p) => filters.categories.includes(p.category));
  if (filters.subcategory) list = list.filter((p) => p.subcategory === filters.subcategory);
  if (filters.brands.length) list = list.filter((p) => filters.brands.includes(p.brand));
  if (filters.conditions.length) list = list.filter((p) => filters.conditions.includes(p.condition));
  if (filters.minPrice !== null) list = list.filter((p) => p.price >= filters.minPrice!);
  if (filters.maxPrice !== null) list = list.filter((p) => p.price <= filters.maxPrice!);
  if (filters.pickupOnly) list = list.filter((p) => p.pickupAvailable);
  if (filters.deals) list = list.filter((p) => p.originalPrice && p.originalPrice > p.price);
  if (filters.rare) list = list.filter((p) => p.rareFind);

  switch (filters.sort) {
    case "newest":
      list.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
      break;
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "discount":
      list.sort((a, b) => savingsRatio(b) - savingsRatio(a));
      break;
    default:
      list.sort((a, b) => Number(Boolean(b.hotDeal)) - Number(Boolean(a.hotDeal)));
  }
  return list;
}

export { categories };

type Params = Record<string, string | string[] | undefined>;

function many(value: string | string[] | undefined) {
  if (!value) return [];
  return (Array.isArray(value) ? value : value.split(",")).filter(Boolean);
}

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const PAGE_SIZE = 12;

/** Parse shop URL search params into filters (URL is the source of truth). */
export function parseShopParams(params: Params) {
  const sort = one(params.sort) as SortKey | undefined;
  const num = (v: string | undefined) => (v && !Number.isNaN(Number(v)) ? Number(v) : null);
  const filters: ShopFilters = {
    q: one(params.q) ?? "",
    categories: many(params.category),
    subcategory: one(params.sub) ?? null,
    brands: many(params.brand),
    conditions: many(params.condition) as ConditionGrade[],
    minPrice: num(one(params.min)),
    maxPrice: num(one(params.max)),
    pickupOnly: one(params.pickup) === "1",
    deals: one(params.deals) === "1",
    rare: one(params.rare) === "1",
    sort: sortOptions.some((o) => o.value === sort) ? sort! : "featured",
  };
  const page = Math.max(1, Number(one(params.page)) || 1);
  const view = one(params.view) === "list" ? ("list" as const) : ("grid" as const);
  return { filters, page, view };
}
