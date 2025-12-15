import { AppLayout } from "@/components/layout/app-layout";
import NetworkStatus from "@/components/ui/network-status";
import ReviewDialogWrapper from "@/components/layout/review-dialog-wrapper";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NetworkStatus />
      <AppLayout>{children}</AppLayout>
      <ReviewDialogWrapper />
    </>
  );
}
