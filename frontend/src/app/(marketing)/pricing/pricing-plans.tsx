"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BillingPeriod = "monthly" | "yearly";

const plans = {
  free: {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for getting started with goal tracking.",
    features: [
      "Up to 3 active goals",
      "Unlimited tasks",
      "Basic AI suggestions",
      "Offline support",
      "7-day analytics",
    ],
    cta: "Get Started",
    href: "/signup",
    popular: false,
  },
  pro: {
    name: "Pro",
    monthlyPrice: 9,
    yearlyPrice: 76, // ~30% discount from $108/year
    description: "For individuals serious about achieving their goals.",
    features: [
      "Unlimited goals",
      "Unlimited tasks",
      "Advanced AI suggestions",
      "Intelligent scheduling",
      "30-day analytics",
      "Priority support",
      "Recurring tasks",
    ],
    cta: "Start Free Trial",
    href: "/signup?plan=pro",
    popular: true,
  },
};

export function PricingPlans() {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

  const getPrice = (plan: (typeof plans)["free" | "pro"]) => {
    if (plan.monthlyPrice === 0) return "$0";
    return billingPeriod === "monthly"
      ? `$${plan.monthlyPrice}`
      : `$${plan.yearlyPrice}`;
  };

  const getPeriodLabel = (plan: (typeof plans)["free" | "pro"]) => {
    if (plan.monthlyPrice === 0) return "forever";
    return billingPeriod === "monthly" ? "per month" : "per year";
  };

  const planList = [plans.free, plans.pro];

  return (
    <section className="pb-20 sm:pb-32">
      <div className="mx-auto max-w-4xl">
        {/* Billing Toggle */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex items-center rounded-full border bg-muted/50 p-1">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "rounded-full px-6 py-2 text-sm font-medium transition-all",
                billingPeriod === "monthly"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={cn(
                "relative rounded-full px-6 py-2 text-sm font-medium transition-all",
                billingPeriod === "yearly"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Yearly
              <span className="absolute -right-2 -top-2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                -30%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {planList.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border bg-card p-8",
                plan.popular && "border-primary shadow-lg",
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-2 text-xl font-bold">{plan.name}</h3>
                <div className="mb-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{getPrice(plan)}</span>
                  <span className="text-muted-foreground">
                    /{getPeriodLabel(plan)}
                  </span>
                </div>
                {plan.monthlyPrice > 0 && billingPeriod === "yearly" && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Save ${plan.monthlyPrice * 12 - plan.yearlyPrice}/year
                  </p>
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                asChild
              >
                <Link href={user ? "/goals" : plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
