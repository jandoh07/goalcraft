import { NonNegotiable, Weekday } from "@/types/goal";

const WEEKDAY_TO_INDEX: Record<Weekday, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const toStartOfDay = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const getNextMonthlyDate = (completedAt: Date) => {
  const base = toStartOfDay(completedAt);
  const year = base.getFullYear();
  const month = base.getMonth();
  const day = base.getDate();

  const daysInNextMonth = new Date(year, month + 2, 0).getDate();
  const targetDay = Math.min(day, daysInNextMonth);

  return new Date(year, month + 1, targetDay);
};

const getNextCustomDate = (completedAt: Date, customDays: Weekday[]) => {
  const base = toStartOfDay(completedAt);
  const currentDay = base.getDay();
  const allowedDays = new Set(customDays.map((day) => WEEKDAY_TO_INDEX[day]));

  if (allowedDays.size === 0) {
    const fallback = new Date(base);
    fallback.setDate(fallback.getDate() + 1);
    return fallback;
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const candidateDay = (currentDay + offset) % 7;
    if (allowedDays.has(candidateDay)) {
      const nextDate = new Date(base);
      nextDate.setDate(nextDate.getDate() + offset);
      return nextDate;
    }
  }

  const fallback = new Date(base);
  fallback.setDate(fallback.getDate() + 1);
  return fallback;
};

export const getNextNonNegotiableDate = (
  nonNegotiable: Pick<NonNegotiable, "frequency" | "customDays">,
  completedAt: Date,
) => {
  const base = toStartOfDay(completedAt);

  if (nonNegotiable.frequency === "daily") {
    const nextDate = new Date(base);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  }

  if (nonNegotiable.frequency === "weekly") {
    const nextDate = new Date(base);
    nextDate.setDate(nextDate.getDate() + 7);
    return nextDate;
  }

  if (nonNegotiable.frequency === "monthly") {
    return getNextMonthlyDate(base);
  }

  return getNextCustomDate(base, nonNegotiable.customDays);
};
