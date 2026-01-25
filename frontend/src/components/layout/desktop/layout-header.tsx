"use client";

import { useNotification } from "@/contexts/notification-context";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell } from "lucide-react";
import { StreakBadge } from "@/components/layout/streak-badge";

export function LayoutHeader() {
  const { openNotifications, notifications } = useNotification();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex items-center justify-between p-4">
      <SidebarTrigger />
      <div className="flex items-center gap-3">
        <StreakBadge />
        <button
          onClick={openNotifications}
          className="p-2 hover:bg-accent rounded-lg transition-colors relative"
          aria-label="Open notifications"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center size-5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
