import { User } from "firebase/auth";

export interface AppUser extends User {
  name?: string;
  subscription?: "free" | "premium";
  createdAt?: Date;
  theme?: "dark" | "light" | "system";
  pushNotifications?: boolean;
  customCategories?: string[];
  timezone?: string;
  notificationTime?: number; // Hour in 24h format (0-23), default 20 (8 PM)
}

export interface FcmToken {
  id: string;
  token: string;
  deviceType: "desktop" | "mobile" | "tablet";
  userAgent: string;
  createdAt: Date;
}
