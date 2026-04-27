"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SignUpForm } from "@/components/auth/signup-form";
import { AuthLayout } from "@/components/auth/auth-layout";

const SignUpContent = () => {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/today";

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
