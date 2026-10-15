import type { Metadata } from "next";
import { ChoosePlan } from "./choose-plan";

export const metadata: Metadata = { title: "Choose Your Plan" };

export default function SubscriptionPage() {
  return <ChoosePlan />;
}
