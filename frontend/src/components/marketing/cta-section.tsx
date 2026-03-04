"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export function CTASection() {
  const { user } = useAuth();

  return (
    <section className="py-20 sm:py-32">
      <div>
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-16">
          {/* Decorative background */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(255,255,255,0.1)_0%,transparent_100%)]" />

          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Achieve More?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
            Join thousands of people who are already using GoalCraft to turn
            their dreams into reality. Start your journey today.
          </p>

          {user ? (
            <Button size="lg" variant="secondary" asChild>
              <Link href="/goals">
                Go to Your Goals
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                asChild
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
