"use client";
// import { useNotifications } from "@/hooks/use-notifications";
import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./auth-context";
import { Notification as NotificationType } from "@/types";

interface NotificationContextType {
  isNotificationOpen: boolean;
  setIsNotificationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openNotifications: () => void;
  closeNotifications: () => void;
  notifications: NotificationType[];
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { user } = useAuth();
  // const { data: notifications = [], isLoading } = useNotifications(
  //   user?.uid || ""
  // );
  const { data: notifications = [], isLoading } = {
    data: [],
    isLoading: false,
  }; // TODO: Remove when notifications are implemented

  const openNotifications = () => setIsNotificationOpen(true);
  const closeNotifications = () => setIsNotificationOpen(false);

  return (
    <NotificationContext.Provider
      value={{
        isNotificationOpen,
        setIsNotificationOpen,
        openNotifications,
        closeNotifications,
        notifications,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
}
