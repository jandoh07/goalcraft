import { AppLayout } from "@/components/layout/app-layout";
import NetworkStatus from "@/components/ui/network-status";
import ProtectedRoute from "@/components/auth/protected-route";
import { NotificationHandler } from "@/components/notifications/notification-handler";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <NetworkStatus />
      <NotificationHandler />
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}
