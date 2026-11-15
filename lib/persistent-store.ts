"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed store for front-end-only state (cart, favorites,
 * recent searches, demo account, orders). Server renders use `initial`, the
 * client hydrates from storage. Replace with real API calls later.
 */
export function createPersistentStore<T>(key: string, initial: T) {
  let value: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) value = JSON.parse(raw) as T;
    } catch {
      /* storage unavailable or corrupt — fall back to initial */
    }
  }

  function get() {
    load();
    return value;
  }

  function set(next: T | ((prev: T) => T)) {
    load();
    value = typeof next === "function" ? (next as (prev: T) => T)(value) : next;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore quota / private mode errors */
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      try {
        value = event.newValue ? (JSON.parse(event.newValue) as T) : initial;
      } catch {
        value = initial;
      }
      listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function useValue() {
    return useSyncExternalStore(subscribe, get, () => initial);
  }

  return { get, set, subscribe, useValue };
}

const noopSubscribe = () => () => {};

/** False during SSR / hydration, true once running in the browser. */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
