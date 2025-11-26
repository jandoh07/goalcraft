"use client";
import React from "react";
import BottomTab from "./bottom-tab";
import NotificationSidebar from "@/components/notifications/notifications-sidebar";

type MobileLayoutProps = {
  children: React.ReactNode;
};

const MobileLayout = ({ children }: MobileLayoutProps) => {
  return (
    <div className="h-screen bg-background">
      {children}
      <NotificationSidebar />
      <BottomTab />
    </div>
  );
};

export default MobileLayout;
