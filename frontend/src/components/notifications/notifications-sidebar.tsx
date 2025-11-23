"use client";
import {
  X,
  ArrowLeft,
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotification } from "@/contexts/notification-context";
import {
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { Notification as NotificationType } from "@/types";

const NotificationSidebar = () => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { isNotificationOpen, closeNotifications, notifications, isLoading } =
    useNotification();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();

  const getNotificationIcon = (type: NotificationType["type"]) => {
    switch (type) {
      case "error":
        return <AlertCircle className="size-5 text-destructive" />;
      case "success":
        return <CheckCircle className="size-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="size-5 text-yellow-500" />;
      case "info":
      default:
        return <Info className="size-5 text-blue-500" />;
    }
  };

  const handleMarkAllAsRead = () => {
    const userId = notifications[0]?.userId;
    if (userId) {
      markAllAsRead(userId);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isNotificationOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        closeNotifications();
      }
    };

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen, closeNotifications]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isNotificationOpen) {
        closeNotifications();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isNotificationOpen, closeNotifications]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-500 ${
          isNotificationOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeNotifications}
      />
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full bg-background border-l border-border shadow-lg z-50 transition-all duration-500 ease-in-out origin-right ${
          isMobile ? "w-full" : "w-96"
        } ${
          isNotificationOpen
            ? "translate-x-0 scale-x-100 opacity-100"
            : "translate-x-full scale-x-0 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={closeNotifications}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Close notifications"
          >
            {isMobile ? (
              <ArrowLeft className="size-5" />
            ) : (
              <X className="size-5" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center p-4">
              <Bell className="size-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`w-full p-4 text-left transition-colors hover:bg-accent/10 ${
                    !notification.isRead ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="shrink-0 size-2 bg-primary rounded-full mt-1.5"></span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(notification.createdAt, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <button
                      className="bg-accent text-accent-foreground hover:bg-accent/50 text-center p-1 mt-1 w-full text-xs rounded cursor-pointer"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="p-4 border-t border-border">
            <button
              onClick={handleMarkAllAsRead}
              className="w-full text-sm text-primary hover:underline"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationSidebar;
