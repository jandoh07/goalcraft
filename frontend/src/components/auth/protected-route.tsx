"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/lib/firebase/session";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!loading && !authUser && isOnline) {
      const redirectToLogin = async () => {
        await clearSession();
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      };

      void redirectToLogin();
    }
  }, [isOnline, loading, authUser, pathname, router]);

  if ((loading && !authUser) || (!authUser && !isOnline)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!loading && !authUser) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
