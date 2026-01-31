import type { Metadata } from "next";
import { PricingHero } from "./pricing-hero";
import { PricingPlans } from "./pricing-plans";
import { PricingFAQ } from "./pricing-faq";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Choose the perfect GoalCraft plan for your needs. Free tier available with generous limits.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <>
      <PricingHero />
      <PricingPlans />
      <PricingFAQ />
    </>
  );
}
