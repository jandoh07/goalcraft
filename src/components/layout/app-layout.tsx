"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLayout from "./mobile-layout";
import DesktopLayout from "./desktop-layout";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  return <DesktopLayout>{children}</DesktopLayout>;
}
