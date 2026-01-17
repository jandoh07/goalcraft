import { AppLayout } from "@/components/layout/app-layout";
import NetworkStatus from "@/components/ui/network-status";
import ReviewDialogWrapper from "@/components/layout/review-dialog-wrapper";
import ProtectedRoute from "@/components/auth/protected-route";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <NetworkStatus />
      <InstallPrompt />
      <AppLayout>{children}</AppLayout>
      <ReviewDialogWrapper />
    </ProtectedRoute>
  );
}
