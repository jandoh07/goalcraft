import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function avatarFallbackInitial(name?: string, displayName?: string) {
  const fullName = name || displayName;

  if (!fullName || fullName.trim() === "") return "U";

  const names = fullName
    .trim()
    .split(/\s+/)
    .filter((n) => n.length > 0);

  if (names.length === 0) return "U";

  if (names.length > 1) {
    return names
      .map((n) => n.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  }

  return names[0].charAt(0).toUpperCase();
}

interface InputObject<T = unknown> {
  [key: string]: T;
}

export const removeEmptyFields = <T extends InputObject>(
  obj: T
): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => {
      // Keep the value if it's not an empty string
      // Also handles null/undefined and keeps falsy values like 0 or false
      return value !== "" && value !== null && value !== undefined;
    })
  ) as Partial<T>;
};
