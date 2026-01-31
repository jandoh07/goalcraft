"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,var(--tw-gradient-from)_0%,transparent_100%)] from-primary/10" />

      <div>
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-sm">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span>AI-Powered Goal Achievement</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Transform Your Goals Into{" "}
            <span className="text-primary">Achievements</span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
            GoalCraft uses AI to break down your ambitious goals into actionable
            tasks, schedule them intelligently, and keep you on track to
            success. Works offline, syncs everywhere.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {user ? (
              <Button size="lg" asChild>
                <Link href="/goals">
                  Continue to App
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
              </>
            )}
          </div>

          {/* Social proof */}
          <p className="mt-8 text-sm text-muted-foreground">
            Join thousands of achievers already using GoalCraft
          </p>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mt-16 flex justify-center">
          <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl border bg-muted/50 shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4 text-6xl">🎯</div>
                <p className="text-muted-foreground">
                  App Screenshot Placeholder
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
