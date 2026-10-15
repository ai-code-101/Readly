import type { Metadata } from "next";
import { ManageSubscription } from "./manage";

export const metadata: Metadata = { title: "My Subscription" };

export default function ManagePage() {
  return <ManageSubscription />;
}
