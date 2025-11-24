import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { addDays, addWeeks, addMonths, startOfDay, isBefore } from "date-fns";

/**
 * Calculates the next run date for a recurring task
 * @param frequency - The frequency of the task (daily, weekly, monthly)
 * @param fromDate - The date to calculate from
 * @param timeZone - The timezone to use for calculations
 * @returns The next run date
 */
export const calculateNextRun = (
  frequency: string,
  fromDate: Date,
  timeZone: string
): Date => {
  const zonedDate = toZonedTime(fromDate, timeZone);

  let nextRun: Date;
  switch (frequency) {
    case "weekly":
      nextRun = addWeeks(zonedDate, 1);
      break;
    case "monthly":
      nextRun = addMonths(zonedDate, 1);
      break;
    case "daily":
    default:
      nextRun = addDays(zonedDate, 1);
  }

  const normalizedNextRun = startOfDay(nextRun);

  return fromZonedTime(normalizedNextRun, timeZone);
};

/**
 * Calculates the due date for a task instance
 * If the originalDueDate is today or in the future, use it as-is
 * If it's in the past, use today
 * @param originalDueDate - The original due date from the master task's nextRun
 * @param timeZone - The timezone to use for calculations
 * @returns The calculated due date for the task instance
 */
export const calculateTaskDueDate = (
  originalDueDate: Date,
  timeZone: string
): Date => {
  const now = new Date();
  const zonedNow = toZonedTime(now, timeZone);
  const zonedOriginal = toZonedTime(originalDueDate, timeZone);

  const todayStart = startOfDay(zonedNow);
  const originalStart = startOfDay(zonedOriginal);

  // If the original due date is today or in the future, use it
  if (!isBefore(originalStart, todayStart)) {
    return fromZonedTime(originalStart, timeZone);
  }

  // If it's in the past, use today
  return fromZonedTime(todayStart, timeZone);
};
