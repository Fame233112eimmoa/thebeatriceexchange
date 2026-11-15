import type { FulfillmentMethod, PaymentMethod } from "./types";

/**
 * Payment adapter.
 *
 * Checkout only talks to `paymentProvider`, so wiring in Stripe later means
 * replacing `mockProvider` with an implementation that:
 *   1. POSTs the cart to a route handler (e.g. app/api/checkout/route.ts)
 *      that creates a Stripe PaymentIntent / Checkout Session server-side.
 *   2. Confirms it on the client with Stripe Elements (card, Apple Pay,
 *      Google Pay via the Payment Request Button, Affirm/Klarna as Stripe
 *      payment methods). PayPal can run via Stripe or the PayPal JS SDK.
 * Never send raw card numbers to your own server.
 */

export type CheckoutRequest = {
  lines: Array<{ productId: string; quantity: number }>;
  fulfillment: FulfillmentMethod;
  method: PaymentMethod;
  email: string;
  amount: number;
};

export type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export interface PaymentProvider {
  name: string;
  checkout(request: CheckoutRequest): Promise<CheckoutResult>;
}

const mockProvider: PaymentProvider = {
  name: "demo",
  async checkout(request) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    if (!request.lines.length) return { ok: false, error: "Your cart is empty." };
    const orderId = `BX${Date.now().toString().slice(-8)}`;
    return { ok: true, orderId };
  },
};

export const paymentProvider: PaymentProvider = mockProvider;

export const paymentOptions: Array<{
  value: PaymentMethod;
  label: string;
  hint: string;
  pickupOnly?: boolean;
}> = [
  { value: "card", label: "Credit / Debit Card", hint: "Visa, Mastercard, Amex, Discover" },
  { value: "apple-pay", label: "Apple Pay", hint: "Pay with Face ID or Touch ID" },
  { value: "google-pay", label: "Google Pay", hint: "Fast checkout with your Google account" },
  { value: "paypal", label: "PayPal", hint: "You'll confirm in a PayPal window" },
  { value: "bnpl", label: "Buy Now, Pay Later", hint: "Split it with Affirm or Klarna (subject to approval)" },
  { value: "cash-pickup", label: "Cash at Pickup", hint: "Pay in store when you collect", pickupOnly: true },
];
