"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthLayout, LoginForm } from "@/components/auth";

const LoginContent = () => {
  const searchParams = useSearchParams();

  // Get redirect URL from query params (set by middleware when redirecting from protected routes)
  const redirectTo = searchParams.get("redirect") || "/goals";

  // Note: Auth state checking is handled by edge middleware in proxy.ts
  // If user reaches this page, they are definitely not authenticated

  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to your GoalCraft account to continue"
    >
      <LoginForm redirectTo={redirectTo} />
    </AuthLayout>
  );
};

const Login = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
};

export default Login;
