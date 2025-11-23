export interface Notification {
  id: string;
  userId: string;
  type: "auto_pause" | "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  resourceId: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
