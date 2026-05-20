import { User } from "firebase/auth";

export interface AppUser extends User {
  name?: string;
  createdAt?: Date;
  theme?: "dark" | "light" | "system";
  pushNotifications?: boolean;
  customCategories?: string[];
  timezone?: string;
  notificationTime?: number;
}

export interface FcmToken {
  id: string;
  token: string;
  deviceType: "desktop" | "mobile" | "tablet";
  userAgent: string;
  createdAt: Date;
}
