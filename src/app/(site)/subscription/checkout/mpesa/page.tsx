import type { Metadata } from "next";
import { MpesaCheckout } from "./mpesa-checkout";

export const metadata: Metadata = { title: "M-Pesa Payment" };

export default function MpesaPage() {
  return <MpesaCheckout />;
}
