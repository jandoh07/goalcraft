import React from "react";
import BottomTab from "./bottom-tab";

const MobileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen bg-background">
      {children}
      <BottomTab />
    </div>
  );
};

export default MobileLayout;
