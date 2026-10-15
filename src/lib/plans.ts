// The Readly Premium plan shown on the subscription / checkout screens.
// One plan: Ksh 10 per day. Change it here in one place.
// NOTE: the checkout screens are presentation-only; no payment is processed.
// Safaricom subscriptions (DSDP) will replace the demo checkout.

export const PLAN = {
  name: "Readly Premium",
  short: "Daily Payment",
  price: 10, // KES
  period: "day",
  blurb: "Full premium access, priority releases",
  badge: "Best Value",
} as const;

export const PREMIUM_FEATURES = [
  "Unlimited e-book titles",
  "Personalized recommendations",
  "Offline reading mode",
  "Early access to staff picks",
  "Priority reader support",
];

export const FREE_FEATURES = ["Up to 5 e-books", "Access to classical literature", "Basic book recommendations", "Standard web reading view"];

export const PRICE_LABEL = `Ksh ${PLAN.price}`;
export const PRICE_PER_DAY = `Ksh ${PLAN.price}/day`;
