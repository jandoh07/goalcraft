/**
 * Parse a duration string like "3 months", "6 weeks", "1 year" into a Date
 */
export function parseDurationToDate(duration: string): Date | undefined {
  if (!duration) return undefined;

  const now = new Date();
  const lowerDuration = duration.toLowerCase().trim();

  // Parse patterns like "3 months", "6 weeks", "1 year", "30 days"
  const match = lowerDuration.match(/^(\d+)\s*(day|week|month|year)s?$/);

  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "day":
        now.setDate(now.getDate() + value);
        break;
      case "week":
        now.setDate(now.getDate() + value * 7);
        break;
      case "month":
        now.setMonth(now.getMonth() + value);
        break;
      case "year":
        now.setFullYear(now.getFullYear() + value);
        break;
    }
    return now;
  }

  // Handle special cases
  if (lowerDuration.includes("quarter")) {
    const match = lowerDuration.match(/^(\d+)/);
    const quarters = match ? parseInt(match[1], 10) : 1;
    now.setMonth(now.getMonth() + quarters * 3);
    return now;
  }

  // Default: try to parse as a number of months
  const numMatch = lowerDuration.match(/^(\d+)/);
  if (numMatch) {
    now.setMonth(now.getMonth() + parseInt(numMatch[1], 10));
    return now;
  }

  // If we can't parse it, return undefined (no due date)
  return undefined;
}

/**
 * Format a duration for display (e.g., "3 months")
 */
export function formatDuration(duration: string): string {
  const date = parseDurationToDate(duration);
  if (!date) return duration;

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  } else if (diffDays < 30) {
    const weeks = Math.round(diffDays / 7);
    return `${weeks} week${weeks !== 1 ? "s" : ""}`;
  } else if (diffDays < 365) {
    const months = Math.round(diffDays / 30);
    return `${months} month${months !== 1 ? "s" : ""}`;
  } else {
    const years = Math.round(diffDays / 365);
    return `${years} year${years !== 1 ? "s" : ""}`;
  }
}
