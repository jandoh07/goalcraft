import { User } from "firebase/auth";

export interface AppUser extends User {
  name?: string;
  subscription?: "free" | "premium";
  createdAt?: Date;
  theme?: "dark" | "light" | "system";
  pushNotifications?: boolean;
  customCategories?: string[];
  timezone?: string;
}
