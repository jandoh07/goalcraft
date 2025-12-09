import { AppLayout } from "@/components/layout/app-layout";
import NetworkStatus from "@/components/ui/network-status";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NetworkStatus />
      <AppLayout>{children}</AppLayout>
    </>
  );
}
