import { ThemeToggle } from "@/components/theme/theme-toggle";
import React from "react";

interface MobileHeaderProps {
  title: string;
}

const MobileHeader = ({ title }: MobileHeaderProps) => {
  return (
    <div>
      <div className="md:hidden flex items-center justify-between py-2 px-3 border-b border-b-border fixed top-0 left-0 w-full bg-background">
        <p className="text-lg font-semibold">{title}</p>
        <div>
          {/* <Bell className="size-5" /> */}
          <ThemeToggle />
        </div>
      </div>
      <div className="w-full h-10 md:hidden"></div>
    </div>
  );
};

export default MobileHeader;
