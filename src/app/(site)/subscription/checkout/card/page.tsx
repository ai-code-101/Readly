import type { Metadata } from "next";
import { CardCheckout } from "./card-checkout";

export const metadata: Metadata = { title: "Bank Payment" };

export default function CardPage() {
  return <CardCheckout />;
}
