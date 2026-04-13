"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthLayout, LoginForm } from "@/components/auth";
import { useAuth } from "@/contexts/auth-context";
import { createSession } from "@/lib/firebase/session";

const DEFAULT_REDIRECT = "/today";

function getSafeRedirectPath(path: string | null): string {
  if (!path) {
    return DEFAULT_REDIRECT;
  }

  if (!path.startsWith("/") || path.startsWith("//")) {
    return DEFAULT_REDIRECT;
  }

  return path;
}

const LoginContent = () => {
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("redirect"));
  const { loading, authUser } = useAuth();
  const [sessionRecoveryFailed, setSessionRecoveryFailed] = useState(false);
  const hasAttemptedSessionRecovery = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (loading || !authUser || hasAttemptedSessionRecovery.current) {
      return;
    }

    const authenticatedUser = authUser;
    hasAttemptedSessionRecovery.current = true;

    const createSessionCookie = async () => {
      try {
        const idToken = await authenticatedUser.getIdToken();
        const sessionCreated = await createSession(idToken);
        if (!sessionCreated) {
          console.error("Failed to create session cookie");
          setSessionRecoveryFailed(true);
          hasAttemptedSessionRecovery.current = false;
          return;
        }

        router.refresh();
        router.replace(redirectTo);
      } catch (error) {
        console.error("Failed to recover session cookie", error);
        setSessionRecoveryFailed(true);
        hasAttemptedSessionRecovery.current = false;
      }
    };

    void createSessionCookie();
  }, [loading, authUser, redirectTo, router]);

  if (loading || (authUser && !sessionRecoveryFailed)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
