"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/lib/firebase/session";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const redirectToLogin = async () => {
        await clearSession();
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      };

      void redirectToLogin();
    }
  }, [loading, user, pathname, router]);

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!loading && !user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
