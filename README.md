# The Beatrice Exchange: Storefront

*Where Value Meets Trust.*

A responsive pawnshop e-commerce front end for **The Beatrice Exchange**, built with Next.js (App Router), TypeScript and Tailwind CSS v4.

It is a standalone Next.js project and runs at the site root.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint
npm run build && npm start
```

Requirements: Node 20+.

## Folder structure

```
app/                              ← routes (App Router)
  layout.tsx                      ← root layout: header, footer, fonts, SEO metadata, favicon
  globals.css                     ← Tailwind + theme import
  page.tsx                        ← homepage (13 sections)
  shop/                           ← filters, sort, grid/list, pagination (state lives in the URL)
  product/[slug]/                 ← gallery + zoom, condition grade, specs, pickup, related
  cart/  checkout/                ← cart, checkout, order confirmation
  how-to-pawn/ how-to-sell/ faq/ stores/ about/ contact/
  make-a-payment/ rewards/ blog/ blog/[slug]/ photo-credits/
  account/ account/favorites/ account/orders/
  privacy/ terms/ returns/ pawn-loan-terms/ accessibility/ shipping/

data/        site.ts (business info), products.ts, categories.ts, blog.ts, faq.ts, reviews.ts,
             navigation.ts, image-credits.json
lib/         catalog.ts (inventory read layer), store.ts (cart/favorites/orders), images.ts,
             payments.ts (payment adapter), routes.ts (URL helper), format.ts, types.ts
components/  layout/ (header, search, mega menu, drawer, footer), home/, shop/, product/,
             cart/, forms/, account/, ui/ (logo, icons, cards, slider, buttons…)
styles/      theme.css (design tokens, imported from app/globals.css)
scripts/     fetch-images.ts (npm run fetch-images)

public/      logo-light.svg, logo-dark.svg, favicon.svg, images/
```

## Before launch: replace the placeholders

Everything in `[BRACKETS]` is a placeholder.

| What | Where |
| --- | --- |
| City, state, ZIP, phone, email, hours, socials, Google reviews link | `data/site.ts` |
| State (Alabama) in loan terms, legal pages and trust badges | `app/**`, `components/home/sections.tsx`, `data/faq.ts`, `data/blog.ts` |
| Beatrice's bio and portrait | `app/about/page.tsx` |
| **Sample reviews.** Replace with genuine reviews or a Google widget, then set `reviewsAreSamples: false` | `data/reviews.ts`, `data/site.ts` |
| Legal copy (have an attorney in your state review it) | `app/{privacy,terms,returns,pawn-loan-terms,accessibility,shipping}` |
| Stock photos | already downloaded (openly licensed, hand-picked). `npm run fetch-images` keeps them in sync; see "Photos" below |
| Real product photos | add `images: ["/products/…jpg"]` to a product; these override the stock photos |
| Estimated sales tax rate | `site.commerce.estimatedTaxRate` |

The store phone number is set in `data/site.ts` (`display`, `tel`, `sms`).

## Photos

All imagery lives in `public/images/` and is listed, with photographer and license, in `data/image-credits.json`. The site reads that file to place images, and `/photo-credits` displays it (CC BY and CC BY-SA photos require that credit, so keep the page linked from the footer).

`scripts/fetch-images.ts` (`npm run fetch-images`) manages the set:

- With no API key it uses Wikimedia Commons (products, searched by model name) and Openverse's CC0 stock sources (StockSnap, rawpixel) for everything else. With `PEXELS_API_KEY` in `.env.local` it uses Pexels.
- `PINNED` holds the reviewed photo list for every item. Pinned items are never re-searched, so re-running is safe. Remove an entry to let the script search for that item again; new products are searched automatically.
- `ALT_TEXT` holds hand-written alt text for non-product images. Product images use the product name.
- `-- --plan` prints the queries without downloading anything.

Product photos are representative, not the actual item, and the product page says so. Replace them with your own photos by adding `images: [...]` to a product in `data/products.ts`.

## Inventory

The UI reads products only through `lib/catalog.ts`. To move to a database, Shopify or Stripe Products, change the functions in that file:

- `getAllProducts`
- `getProductBySlug`
- `filterProducts`
- …

Keep the same `Product` shape from `lib/types.ts` and nothing else needs to change.

## Payments (Stripe-ready)

Checkout calls `paymentProvider.checkout()` in `lib/payments.ts`, which is currently a mock. To go live:

1. Run `npm i stripe @stripe/stripe-js @stripe/react-stripe-js`.
2. Add a route handler, e.g. `app/api/checkout/route.ts`. It should re-price the cart server-side from `lib/catalog.ts` (never trust client prices) and create a PaymentIntent or Checkout Session.
3. Swap the placeholder card fields in `components/cart/checkout-view.tsx` for `<PaymentElement />`. This covers:
   - cards
   - Apple Pay and Google Pay
   - Affirm and Klarna (BNPL)
4. Handle PayPal through Stripe or the PayPal JS SDK. "Cash at pickup" needs no processor.
5. Replace `mockProvider` with your Stripe implementation. Add a webhook to mark orders as paid.

## Front-end-only features (connect a backend later)

These are wired up in the UI but don't save to a server yet:

- **Cart, favorites, recent searches, orders and the demo account** are kept in `localStorage` (see `lib/store.ts`). Passwords are never stored. Swap in a real auth provider such as NextAuth, Clerk or Supabase.
- **The forms don't send anywhere yet:** Free Estimate (with photo upload), Contact, Loan Payment, Newsletter (with SMS opt-in) and Rewards. Each has a comment marking where to POST to a route handler or service (email/CRM, Klaviyo, your pawn management system).

## Accessibility

The storefront has:

- semantic landmarks and a skip link
- keyboard-operable mega menu, drawer, search combobox and carousels
- carousels that pause on hover and focus
- visible focus states
- `prefers-reduced-motion` support
- labelled form fields with inline errors
- 16px inputs, so iOS doesn't zoom in on them
