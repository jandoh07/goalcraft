"use client";
import { Bell } from "lucide-react";
import { useNotification } from "@/contexts/notification-context";

interface MobileHeaderProps {
  title: string;
}

const MobileHeader = ({ title }: MobileHeaderProps) => {
  const { openNotifications, notifications } = useNotification();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between py-3 px-3 border-b border-b-border fixed top-0 left-0 w-full bg-background shadow-sm z-10">
        <p className="text-lg font-semibold">{title}</p>
        <div className="flex items-center gap-2">
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
      <div className="w-full h-10"></div>
    </div>
  );
};

export default MobileHeader;
