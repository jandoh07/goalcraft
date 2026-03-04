import { MarketingNavbar } from "@/components/marketing/marketing-navbar";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNavbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4">{children}</main>
      <MarketingFooter />
    </div>
  );
}
