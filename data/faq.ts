export type FaqGroup = { title: string; items: Array<{ q: string; a: string }> };

export const faqGroups: FaqGroup[] = [
  {
    title: "Pawn Loans",
    items: [
      {
        q: "How does a pawn loan work?",
        a: "You bring in an item of value and a valid government-issued photo ID. We appraise it for free and offer a loan based on its value. If you accept, you leave with cash and we keep your item safe until you repay the loan plus the finance charge. Rates, fees and terms follow Alabama law.",
      },
      {
        q: "Does a pawn loan affect my credit?",
        a: "No. There is no credit check, and pawn loans are not reported to credit bureaus. Your item is the only collateral.",
      },
      {
        q: "What happens if I can't repay on time?",
        a: "You can usually extend your loan by paying the finance charge due. If a loan isn't repaid or extended by the end of the term and any grace period allowed by Alabama law, the item becomes the property of The Beatrice Exchange. You owe nothing further, and it won't affect your credit.",
      },
      {
        q: "How do I make a payment or extend my loan?",
        a: "Visit the store, call us, or use the Make a Loan Payment page with your ticket number and last name.",
      },
    ],
  },
  {
    title: "Selling",
    items: [
      {
        q: "What do you buy?",
        a: "Gold, silver and platinum jewelry, diamonds, luxury watches, coins and bullion, designer handbags, and quality electronics, instruments, cameras, tools and sporting goods.",
      },
      {
        q: "How do you decide what to offer?",
        a: "We look at the item's current market value, condition, completeness (box, papers, accessories) and demand. Precious metals are priced against the day's spot price.",
      },
      {
        q: "Can I get an estimate before coming in?",
        a: "Yes. Use our Free Online Estimate form with a few photos. Final offers are confirmed in store after an in-person inspection.",
      },
    ],
  },
  {
    title: "Shopping & Orders",
    items: [
      {
        q: "Is everything authentic?",
        a: "Every designer item, watch and piece of fine jewelry is inspected by our in-house specialists before it's listed. If an item we sold is ever found not to be authentic, we'll refund it in full.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes, on orders over $99 within the contiguous U.S. High-value items ship fully insured with signature confirmation.",
      },
      {
        q: "How does Buy Online, Pick Up In Store work?",
        a: "Choose “Pick Up In Store” at checkout. We'll email you when your order is ready, usually within one business day. Bring a photo ID that matches the order name.",
      },
      {
        q: "What payment methods do you accept?",
        a: "Major credit and debit cards, Apple Pay, Google Pay, PayPal, Buy Now, Pay Later through Affirm or Klarna, and cash for in-store pickup orders.",
      },
      {
        q: "What is your return policy?",
        a: "Most items can be returned within 14 days in the same condition. Bullion, coins and final-sale items are excluded. See our Returns Policy for details.",
      },
    ],
  },
];
