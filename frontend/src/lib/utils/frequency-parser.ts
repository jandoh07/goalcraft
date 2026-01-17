/**
 * Parse a natural language frequency string into a normalized frequency string
 * Handles strings like "twice a week", "every day", "3 times per week", "daily", "weekly"
 * Returns normalized format that can be used by the task system
 */
export function parseFrequency(frequencyStr: string): string | null {
  if (!frequencyStr) return null;

  const lower = frequencyStr.toLowerCase().trim();

  // Handle "daily" or "every day"
  if (lower === "daily" || lower === "every day" || lower === "everyday") {
    return "daily";
  }

  // Handle "weekly" or "every week" or "once a week"
  if (
    lower === "weekly" ||
    lower === "every week" ||
    lower === "once a week" ||
    lower === "once per week"
  ) {
    return "weekly";
  }

  // Handle "X times a week" or "X times per week" or "twice a week"
  const timesPerWeekMatch = lower.match(
    /(\d+|twice|three|four|five|six|seven)\s*times?\s*(a|per)\s*week/
  );
  if (timesPerWeekMatch) {
    let times = 1;
    const numStr = timesPerWeekMatch[1];
    if (numStr === "twice") times = 2;
    else if (numStr === "three") times = 3;
    else if (numStr === "four") times = 4;
    else if (numStr === "five") times = 5;
    else if (numStr === "six") times = 6;
    else if (numStr === "seven") times = 7;
    else times = parseInt(numStr, 10);

    if (times === 7) return "daily";
    return `${times}x per week`;
  }

  // Handle "twice a week" without "times"
  if (lower === "twice a week" || lower === "twice per week") {
    return "2x per week";
  }

  // Handle "every X days"
  const everyDaysMatch = lower.match(/every\s*(\d+)\s*days?/);
  if (everyDaysMatch) {
    const interval = parseInt(everyDaysMatch[1], 10);
    if (interval === 1) {
      return "daily";
    }
    return `every ${interval} days`;
  }

  // Handle "monthly" or "every month" or "once a month"
  if (
    lower === "monthly" ||
    lower === "every month" ||
    lower === "once a month"
  ) {
    return "monthly";
  }

  // Handle "X times a month"
  const timesPerMonthMatch = lower.match(
    /(\d+|twice|three|four)\s*times?\s*(a|per)\s*month/
  );
  if (timesPerMonthMatch) {
    let times = 1;
    const numStr = timesPerMonthMatch[1];
    if (numStr === "twice") times = 2;
    else if (numStr === "three") times = 3;
    else if (numStr === "four") times = 4;
    else times = parseInt(numStr, 10);

    return `${times}x per month`;
  }

  // Handle weekday names - return the original for specific days
  const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  for (let i = 0; i < weekdays.length; i++) {
    if (
      lower.includes(weekdays[i]) ||
      lower.includes(weekdays[i].slice(0, 3))
    ) {
      return frequencyStr; // Keep original if it specifies days
    }
  }

  // Default: return the original string if we can't normalize it
  return frequencyStr;
}

/**
 * Format a frequency string for display
 */
export function formatFrequency(freq: string): string {
  if (!freq) return "";

  const lower = freq.toLowerCase();

  if (lower === "daily") return "Every day";
  if (lower === "weekly") return "Once a week";
  if (lower === "monthly") return "Once a month";

  // Already formatted
  return freq;
}
