"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLayout from "./mobile/mobile-layout";
import DesktopLayout from "./desktop/desktop-layout";
import { NotificationProvider } from "@/contexts/notification-context";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <NotificationProvider>
      {isMobile ? (
        <MobileLayout>{children}</MobileLayout>
      ) : (
        <DesktopLayout>{children}</DesktopLayout>
      )}
    </NotificationProvider>
  );
}
