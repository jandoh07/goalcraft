import { AppLayout } from "@/components/layout/app-layout";
import NetworkStatus from "@/components/ui/network-status";
import { NotificationHandler } from "@/components/notifications/notification-handler";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NetworkStatus />
      <NotificationHandler />
      <AppLayout>{children}</AppLayout>
    </>
  );
}
