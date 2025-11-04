import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { addDays, addWeeks, addMonths, startOfDay } from "date-fns";

/**
 * Calculates the next run time, normalized to 12:00 AM
 * in the task's specific time zone.
 */
export const calculateNextRun = (
  frequency: string,
  fromDate: Date,
  timeZone: string
): Date => {
  // 1. Convert the JS Date to a "zoned time" object
  const zonedDate = toZonedTime(fromDate, timeZone);

  // 2. Find the start of the *next* day in that time zone
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

  // 3. Normalize to the start of that day (00:00) *in that time zone*
  const normalizedNextRun = startOfDay(nextRun);

  // 4. Convert back to a standard JS Date (which is always UTC)
  return fromZonedTime(normalizedNextRun, timeZone);
};
