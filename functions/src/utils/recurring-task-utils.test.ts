import { describe, it, expect } from "@jest/globals";
import { calculateNextRun, calculateTaskDueDate } from "./recurring-task-utils";
import { addDays, startOfDay, differenceInDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";

describe("calculateNextRun", () => {
  const timeZone = "America/New_York";

  it("should calculate next run for daily frequency", () => {
    const startDate = new Date("2025-11-24T10:00:00Z");
    const result = calculateNextRun("daily", startDate, timeZone);

    // Convert both to the timezone for comparison
    const resultInZone = toZonedTime(result, timeZone);
    const startInZone = toZonedTime(startDate, timeZone);

    // Should be at least 1 day later (accounting for DST and timezone shifts)
    const daysDiff = differenceInDays(
      startOfDay(resultInZone),
      startOfDay(startInZone)
    );
    expect(daysDiff).toBeGreaterThanOrEqual(1);
    expect(daysDiff).toBeLessThanOrEqual(2);

    // Should be at start of day in the timezone
    expect(resultInZone.getHours()).toBe(0);
    expect(resultInZone.getMinutes()).toBe(0);
    expect(resultInZone.getSeconds()).toBe(0);
  });

  it("should calculate next run for weekly frequency", () => {
    const startDate = new Date("2025-11-24T10:00:00Z");
    const result = calculateNextRun("weekly", startDate, timeZone);

    const resultInZone = toZonedTime(result, timeZone);
    const startInZone = toZonedTime(startDate, timeZone);

    // Should be roughly 7 days later (accounting for DST)
    const daysDiff = differenceInDays(
      startOfDay(resultInZone),
      startOfDay(startInZone)
    );
    expect(daysDiff).toBeGreaterThanOrEqual(6);
    expect(daysDiff).toBeLessThanOrEqual(8);

    // Should be at start of day in the timezone
    expect(resultInZone.getHours()).toBe(0);
    expect(resultInZone.getMinutes()).toBe(0);
  });

  it("should calculate next run for monthly frequency", () => {
    const startDate = new Date("2025-11-24T10:00:00Z");
    const result = calculateNextRun("monthly", startDate, timeZone);

    const resultInZone = toZonedTime(result, timeZone);

    // Should be roughly 30 days later (between 28-31)
    const daysDiff = differenceInDays(
      resultInZone,
      toZonedTime(startDate, timeZone)
    );
    expect(daysDiff).toBeGreaterThanOrEqual(28);
    expect(daysDiff).toBeLessThanOrEqual(31);

    // Should be at start of day in the timezone
    expect(resultInZone.getHours()).toBe(0);
    expect(resultInZone.getMinutes()).toBe(0);
  });

  it("should normalize to start of day in the timezone", () => {
    const startDate = new Date("2025-11-24T15:30:45Z");
    const result = calculateNextRun("daily", startDate, timeZone);

    const resultInZone = toZonedTime(result, timeZone);

    expect(resultInZone.getHours()).toBe(0);
    expect(resultInZone.getMinutes()).toBe(0);
    expect(resultInZone.getSeconds()).toBe(0);
    expect(resultInZone.getMilliseconds()).toBe(0);
  });
});

describe("calculateTaskDueDate", () => {
  const timeZone = "America/New_York";

  it("should use original date if it's today", () => {
    const now = new Date();
    const todayInZone = startOfDay(toZonedTime(now, timeZone));

    const result = calculateTaskDueDate(todayInZone, timeZone);
    const resultInZone = toZonedTime(result, timeZone);

    expect(startOfDay(resultInZone)).toEqual(todayInZone);
  });

  it("should use original date if it's in the future", () => {
    const now = new Date();
    const todayInZone = startOfDay(toZonedTime(now, timeZone));
    const futureDate = addDays(todayInZone, 5);

    const result = calculateTaskDueDate(futureDate, timeZone);
    const resultInZone = toZonedTime(result, timeZone);

    // Check that the dates are the same (within the same day)
    const daysDiff = differenceInDays(
      startOfDay(resultInZone),
      startOfDay(futureDate)
    );
    expect(Math.abs(daysDiff)).toBeLessThanOrEqual(1);
  });

  it("should use today if original date is in the past", () => {
    const now = new Date();
    const todayInZone = startOfDay(toZonedTime(now, timeZone));
    const pastDate = addDays(todayInZone, -5);

    const result = calculateTaskDueDate(pastDate, timeZone);
    const resultInZone = toZonedTime(result, timeZone);

    expect(startOfDay(resultInZone)).toEqual(todayInZone);
  });

  it("should normalize to start of day in the timezone", () => {
    const futureDate = new Date("2025-12-01T15:30:45Z");
    const result = calculateTaskDueDate(futureDate, timeZone);

    const resultInZone = toZonedTime(result, timeZone);

    expect(resultInZone.getHours()).toBe(0);
    expect(resultInZone.getMinutes()).toBe(0);
    expect(resultInZone.getSeconds()).toBe(0);
    expect(resultInZone.getMilliseconds()).toBe(0);
  });

  it("should handle timezone correctly for edge cases", () => {
    // 11 PM UTC on Nov 24 is 6 PM EST on Nov 24 (same day in EST)
    const date = new Date("2025-11-24T23:00:00Z");
    const result = calculateTaskDueDate(date, "America/New_York");

    const resultInZone = toZonedTime(result, timeZone);

    // Should be normalized to start of day in EST
    expect(resultInZone.getHours()).toBe(0);
    expect(resultInZone.getMinutes()).toBe(0);

    // Should be Nov 24 in EST
    expect(resultInZone.getDate()).toBe(24);
  });
});
