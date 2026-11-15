const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usdRound = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number) {
  return Number.isInteger(value) ? usdRound.format(value) : usd.format(value);
}

export function formatMoney(value: number) {
  return usd.format(value);
}

export function discountOf(price: number, originalPrice?: number) {
  if (!originalPrice || originalPrice <= price) return null;
  return {
    percent: Math.round(((originalPrice - price) / originalPrice) * 100),
    savings: originalPrice - price,
  };
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
