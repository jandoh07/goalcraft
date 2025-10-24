import { Bell } from "lucide-react";
import React from "react";

interface MobileHeaderProps {
  title: string;
}

const MobileHeader = ({ title }: MobileHeaderProps) => {
  return (
    <div>
      <div className="md:hidden flex items-center justify-between py-3 px-3 border-b border-b-border fixed top-0 left-0 w-full bg-background shadow-sm z-10">
        <p className="text-lg font-semibold">{title}</p>
        <div>
          <Bell className="size-5" />
        </div>
      </div>
      <div className="w-full h-10 md:hidden"></div>
    </div>
  );
};

export default MobileHeader;
