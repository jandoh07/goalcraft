import React from "react";
import BottomTab from "./bottom-tab";

const MobileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      {children}
      <BottomTab />
    </div>
  );
};

export default MobileLayout;
