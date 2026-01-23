// Analytics date helper functions

// Helper to get date string in YYYY-MM-DD format
export const getDateKey = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Helper to get start of day
export const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper to subtract days from a date
export const subDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
};

// Helper to add days to a date
export const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Helper to format date for display
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Helper to get month name
export const getMonthName = (date: Date): string => {
  return date.toLocaleDateString("en-US", { month: "long" });
};

// Helper to get short month name
export const getShortMonthName = (date: Date): string => {
  return date.toLocaleDateString("en-US", { month: "short" });
};

// Get number of days in a month
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

// Get the day of week for the first day of a month (0 = Sunday)
export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

// Dummy data for demonstration
export const DUMMY_CONTRIBUTION_DATA = {
  "2026-01-01": 3,
  "2026-01-02": 1,
  "2026-01-03": 5,
  "2026-01-05": 2,
  "2026-01-07": 4,
  "2026-01-08": 1,
  "2026-01-10": 6,
  "2026-01-12": 2,
  "2026-01-13": 3,
  "2026-01-14": 1,
  "2026-01-15": 4,
  "2026-01-17": 2,
  "2026-01-18": 5,
  "2026-01-19": 3,
  "2025-12-25": 2,
  "2025-12-26": 4,
  "2025-12-28": 1,
  "2025-12-30": 3,
  "2025-12-31": 5,
  "2025-11-10": 2,
  "2025-11-15": 4,
  "2025-11-20": 6,
  "2025-11-25": 3,
  "2025-10-05": 1,
  "2025-10-12": 3,
  "2025-10-18": 2,
  "2025-10-22": 4,
};

export interface DayData {
  date: Date;
  day: number;
  month: number;
  year: number;
  isToday: boolean;
  isFuture: boolean;
}

/**
 * Generates weeks of day data for the heatmap starting from a specific date
 * @param startDate - The first date to show in the heatmap (e.g., Jan 1st)
 * @param endDate - The last date to show in the heatmap
 * @param today - Current date for comparison
 * @returns Array of weeks, where each week is an array of 7 DayData objects
 */
export const generateHeatmapWeeks = (
  startDate: Date,
  endDate: Date,
  today: Date,
): DayData[][] => {
  // Align start to the Sunday before or on the start date
  const startDayOfWeek = startDate.getDay();
  const alignedStart = subDays(startDate, startDayOfWeek);

  // Calculate actual number of days from aligned start to end date
  const totalDays =
    Math.ceil(
      (endDate.getTime() - alignedStart.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;

  // Round up to complete weeks
  const totalWeeks = Math.ceil(totalDays / 7);
  const actualTotalDays = totalWeeks * 7;

  const daysArray: DayData[] = [];

  for (let i = 0; i < actualTotalDays; i++) {
    const date = addDays(alignedStart, i);
    daysArray.push({
      date,
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isToday: getDateKey(date) === getDateKey(today),
      isFuture: date > today,
    });
  }

  // Group into weeks (columns)
  const weeksArray: DayData[][] = [];
  for (let i = 0; i < daysArray.length; i += 7) {
    weeksArray.push(daysArray.slice(i, i + 7));
  }

  return weeksArray;
};
