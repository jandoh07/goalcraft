import { AppLayout } from "@/components/layout/app-layout";
import ProtectedRoute from "@/components/auth/protected-route";
import NetworkStatus from "@/components/ui/network-status";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <NetworkStatus />
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}
