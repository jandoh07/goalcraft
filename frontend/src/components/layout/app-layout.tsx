"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLayout from "./mobile/mobile-layout";
import DesktopLayout from "./desktop/desktop-layout";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  return <DesktopLayout>{children}</DesktopLayout>;
}
