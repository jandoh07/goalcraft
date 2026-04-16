import { describe, expect, it } from "vitest";
import { getNextNonNegotiableDate } from "./non-negotiable-recurrence";

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

describe("getNextNonNegotiableDate", () => {
  it("returns the next day for daily frequency", () => {
    const completedAt = new Date(2026, 3, 15, 18, 45, 20);

    const result = getNextNonNegotiableDate(
      { frequency: "daily", customDays: [] },
      completedAt,
    );

    expect(formatLocalDate(result)).toBe("2026-04-16");
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });

  it("returns 7 days later for weekly frequency", () => {
    const completedAt = new Date(2026, 3, 15, 10, 30, 0);

    const result = getNextNonNegotiableDate(
      { frequency: "weekly", customDays: [] },
      completedAt,
    );

    expect(formatLocalDate(result)).toBe("2026-04-22");
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });

  it("keeps the day of month for monthly frequency when valid", () => {
    const completedAt = new Date(2026, 3, 15, 9, 0, 0);

    const result = getNextNonNegotiableDate(
      { frequency: "monthly", customDays: [] },
      completedAt,
    );

    expect(formatLocalDate(result)).toBe("2026-05-15");
  });

  it("clamps monthly frequency to last day of next month", () => {
    const completedAt = new Date(2026, 0, 31, 13, 12, 0);

    const result = getNextNonNegotiableDate(
      { frequency: "monthly", customDays: [] },
      completedAt,
    );

    expect(formatLocalDate(result)).toBe("2026-02-28");
    expect(result.getHours()).toBe(0);
  });

  it("returns the nearest upcoming selected weekday for custom frequency", () => {
    const completedAt = new Date(2026, 3, 15, 16, 0, 0);

    const result = getNextNonNegotiableDate(
      { frequency: "custom", customDays: ["fri", "sun"] },
      completedAt,
    );

    expect(formatLocalDate(result)).toBe("2026-04-17");
  });

  it("schedules to next week when the same custom weekday is selected", () => {
    const completedAt = new Date(2026, 3, 15, 8, 30, 0);

    const result = getNextNonNegotiableDate(
      { frequency: "custom", customDays: ["wed"] },
      completedAt,
    );

    expect(formatLocalDate(result)).toBe("2026-04-22");
  });

  it("falls back to tomorrow when customDays is empty", () => {
    const completedAt = new Date(2026, 3, 15, 11, 20, 0);

    const result = getNextNonNegotiableDate(
      { frequency: "custom", customDays: [] },
      completedAt,
    );

    expect(formatLocalDate(result)).toBe("2026-04-16");
  });
});
