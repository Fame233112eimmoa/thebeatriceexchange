export type CategoryIcon =
  | "ring"
  | "bullion"
  | "coin"
  | "handbag"
  | "shirt"
  | "phone"
  | "laptop"
  | "gamepad"
  | "tv"
  | "guitar"
  | "camera"
  | "drill"
  | "bike";

export type Category = {
  slug: string;
  name: string;
  shortName: string;
  icon: CategoryIcon;
  blurb: string;
  subcategories: string[];
};

export type ConditionGrade = "Like New" | "Excellent" | "Good" | "Fair";

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  category: string; // Category.slug
  subcategory: string;
  price: number;
  originalPrice?: number;
  condition: ConditionGrade;
  description: string;
  specs: Record<string, string>;
  /** Merchandising flags used by the homepage sliders. */
  hotDeal?: boolean;
  rareFind?: boolean;
  /** ISO date the item hit the floor — drives "New Arrivals" + "Newest" sort. */
  addedAt: string;
  pickupAvailable: boolean;
  shippable: boolean;
  /** Placeholder art until real photography is wired in. */
  art: { hue: number; accent?: string };
  /** Optional real photo URLs; when present they replace the placeholder art. */
  images?: string[];
};

export type CartLine = {
  productId: string;
  quantity: number;
};

export type FulfillmentMethod = "ship" | "pickup";

export type PaymentMethod =
  | "card"
  | "apple-pay"
  | "google-pay"
  | "paypal"
  | "bnpl"
  | "cash-pickup";

export type Order = {
  id: string;
  placedAt: string;
  lines: Array<{ productId: string; name: string; price: number; quantity: number }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  fulfillment: FulfillmentMethod;
  payment: PaymentMethod;
  email: string;
  status: "Processing" | "Ready for Pickup" | "Shipped" | "Delivered";
};

export type Review = {
  id: string;
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  text: string;
  topic: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readMinutes: number;
  category: string;
  icon: CategoryIcon;
  body: Array<{ heading?: string; paragraphs: string[] }>;
};
