"use client";

import { useCallback, useMemo } from "react";

import { site } from "../data/site";
import { getProductById } from "./catalog";
import { createPersistentStore } from "./persistent-store";
import type { CartLine, FulfillmentMethod, Order } from "./types";

const cartStore = createPersistentStore<CartLine[]>("bx:cart", []);
const favoritesStore = createPersistentStore<string[]>("bx:favorites", []);
const recentSearchStore = createPersistentStore<string[]>("bx:recent-searches", []);
const ordersStore = createPersistentStore<Order[]>("bx:orders", []);
const accountStore = createPersistentStore<{ name: string; email: string; rewards: boolean } | null>(
  "bx:account",
  null,
);

/* ---------- Cart ---------- */

export function useCart() {
  const lines = cartStore.useValue();

  const items = useMemo(
    () =>
      lines
        .map((line) => ({ ...line, product: getProductById(line.productId) }))
        .filter((line): line is CartLine & { product: NonNullable<ReturnType<typeof getProductById>> } =>
          Boolean(line.product),
        ),
    [lines],
  );

  const count = items.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = items.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const hasPickupOnly = items.some((line) => !line.product.shippable);

  const add = useCallback((productId: string, quantity = 1) => {
    cartStore.set((prev) => {
      const existing = prev.find((line) => line.productId === productId);
      // Most pawn inventory is one-of-a-kind, so cap at 1 per SKU.
      if (existing) return prev;
      return [...prev, { productId, quantity: Math.min(quantity, 1) }];
    });
  }, []);

  const remove = useCallback((productId: string) => {
    cartStore.set((prev) => prev.filter((line) => line.productId !== productId));
  }, []);

  const clear = useCallback(() => cartStore.set([]), []);

  const has = useCallback((productId: string) => lines.some((l) => l.productId === productId), [lines]);

  return { items, count, subtotal, hasPickupOnly, add, remove, clear, has };
}

export function calculateTotals(subtotal: number, fulfillment: FulfillmentMethod) {
  const { freeShippingThreshold, flatShipping, estimatedTaxRate } = site.commerce;
  const shipping =
    fulfillment === "pickup" || subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : flatShipping;
  const tax = Math.round(subtotal * estimatedTaxRate * 100) / 100;
  return { shipping, tax, total: Math.round((subtotal + shipping + tax) * 100) / 100 };
}

/* ---------- Favorites ---------- */

export function useFavorites() {
  const ids = favoritesStore.useValue();
  const toggle = useCallback((productId: string) => {
    favoritesStore.set((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }, []);
  const has = useCallback((productId: string) => ids.includes(productId), [ids]);
  return { ids, count: ids.length, toggle, has };
}

/* ---------- Recent searches ---------- */

export function useRecentSearches() {
  const searches = recentSearchStore.useValue();
  const push = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    recentSearchStore.set((prev) =>
      [clean, ...prev.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, 6),
    );
  }, []);
  const clear = useCallback(() => recentSearchStore.set([]), []);
  return { searches, push, clear };
}

/* ---------- Orders (front-end only) ---------- */

export function useOrders() {
  const orders = ordersStore.useValue();
  const addOrder = useCallback((order: Order) => ordersStore.set((prev) => [order, ...prev]), []);
  return { orders, addOrder };
}

/* ---------- Demo account (no passwords are ever stored) ---------- */

export function useAccount() {
  const account = accountStore.useValue();
  const signIn = useCallback(
    (name: string, email: string) =>
      accountStore.set((prev) => ({ name, email, rewards: prev?.rewards ?? false })),
    [],
  );
  const joinRewards = useCallback(
    (name: string, email: string) => accountStore.set({ name, email, rewards: true }),
    [],
  );
  const signOut = useCallback(() => accountStore.set(null), []);
  return { account, signIn, signOut, joinRewards };
}
