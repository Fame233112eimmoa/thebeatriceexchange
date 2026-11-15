/**
 * Every site URL goes through `bx()`.
 *
 * BASE_PATH is "" because the site runs at the domain root. To serve it under
 * a sub-path instead (e.g. "/shop"), set BASE_PATH and move the app folder.
 */
export const BASE_PATH = "";

export function bx(path = "/") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return BASE_PATH || "/";
  return `${BASE_PATH}${clean}`;
}

export const routes = {
  home: bx("/"),
  shop: bx("/shop"),
  category: (slug: string) => bx(`/shop?category=${slug}`),
  search: (q: string) => bx(`/shop?q=${encodeURIComponent(q)}`),
  newArrivals: bx("/shop?sort=newest"),
  deals: bx("/shop?deals=1"),
  rareFinds: bx("/shop?rare=1"),
  product: (slug: string) => bx(`/product/${slug}`),
  cart: bx("/cart"),
  checkout: bx("/checkout"),
  howToPawn: bx("/how-to-pawn"),
  howToSell: bx("/how-to-sell"),
  estimate: bx("/#estimate"),
  faq: bx("/faq"),
  stores: bx("/stores"),
  about: bx("/about"),
  contact: bx("/contact"),
  payment: bx("/make-a-payment"),
  rewards: bx("/rewards"),
  blog: bx("/blog"),
  post: (slug: string) => bx(`/blog/${slug}`),
  account: bx("/account"),
  favorites: bx("/account/favorites"),
  orders: bx("/account/orders"),
  shipping: bx("/shipping"),
  returns: bx("/returns"),
  privacy: bx("/privacy"),
  terms: bx("/terms"),
  loanTerms: bx("/pawn-loan-terms"),
  accessibility: bx("/accessibility"),
  photoCredits: bx("/photo-credits"),
} as const;
