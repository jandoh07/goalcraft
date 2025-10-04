"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLayout from "./MobileLayout";
import DesktopLayout from "./DesktopLayout";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  return <DesktopLayout>{children}</DesktopLayout>;
}
