import React from "react";

const MobileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen bg-red-500">
      <div>MobileLayout</div>
      {children}
    </div>
  );
};

export default MobileLayout;
