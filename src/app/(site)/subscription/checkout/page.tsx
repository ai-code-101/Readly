import type { Metadata } from "next";
import { AirtimeCheckout } from "./airtime-checkout";

export const metadata: Metadata = { title: "Confirm Subscription" };

export default function CheckoutPage() {
  return <AirtimeCheckout />;
}
