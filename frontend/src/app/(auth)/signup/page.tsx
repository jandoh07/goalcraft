"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthLayout, SignUpForm } from "@/components/auth";

const SignUpContent = () => {
  const searchParams = useSearchParams();

  // Get redirect URL from query params (set by middleware when redirecting from protected routes)
  const redirectTo = searchParams.get("redirect") || "/goals";

  // Note: Auth state checking is handled by edge middleware in proxy.ts
  // If user reaches this page, they are definitely not authenticated

  return (
    <AuthLayout
      title="Create Account"
      description="Start your goal tracking journey with GoalCraft"
    >
      <SignUpForm redirectTo={redirectTo} />
    </AuthLayout>
  );
};

const SignUp = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
};

export default SignUp;
