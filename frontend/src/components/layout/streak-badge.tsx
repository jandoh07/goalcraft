import { Flame } from "lucide-react";

interface StreakBadgeProps {
  streak?: number;
  size?: "sm" | "md";
}

export function StreakBadge({ streak = 12, size = "md" }: StreakBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 gap-1",
    md: "px-3 py-1.5 gap-1.5",
  };

  const isStreakActive = streak > 0;
  const colorClasses = {
    bg: isStreakActive
      ? "bg-orange-100 dark:bg-orange-950"
      : "bg-gray-200 dark:bg-gray-800",
    border: isStreakActive
      ? "border border-orange-300 dark:border-orange-500"
      : "border border-gray-300 dark:border-gray-700",
    text: isStreakActive
      ? "text-orange-600 dark:text-orange-400"
      : "text-gray-600 dark:text-gray-400",
    iconColor: isStreakActive ? "red" : "gray",
    iconFill: isStreakActive ? "orange" : "gray",
  };

  const iconSize = size === "sm" ? "size-4" : "size-4";

  return (
    <div
      className={`flex items-center ${sizeClasses[size]} ${colorClasses.bg} rounded-full ${colorClasses.border} ${colorClasses.text} font-medium`}
    >
      <Flame
        className={`${iconSize}`}
        color={colorClasses.iconColor}
        fill={colorClasses.iconFill}
      />
      <span className={`text-sm font-semibold ${colorClasses.text}`}>
        {streak}
      </span>
    </div>
  );
}
