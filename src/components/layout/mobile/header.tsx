import { ThemeToggle } from "@/components/theme/theme-toggle";
import React from "react";

interface MobileHeaderProps {
  title: string;
}

const MobileHeader = ({ title }: MobileHeaderProps) => {
  return (
    <div className="md:hidden flex items-center justify-between mb-4 pb-2 border-b border-b-muted">
      <p className="text-lg font-semibold">{title}</p>
      <div>
        {/* <Bell className="size-5" /> */}
        <ThemeToggle />
      </div>
    </div>
  );
};

export default MobileHeader;
