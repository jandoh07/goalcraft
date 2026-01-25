"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  startOfDay,
  endOfDay,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from "date-fns";

export type ViewRangeType = "week" | "yesterday-forward" | "centered";

export interface ViewRangeConfig {
  type: ViewRangeType;
  label: string;
  description: string;
}

export const VIEW_RANGE_OPTIONS: ViewRangeConfig[] = [
  {
    type: "week",
    label: "Full Week",
    description: "Sunday to Saturday",
  },
  {
    type: "yesterday-forward",
    label: "Yesterday + Rest of Week",
    description: "From yesterday to Saturday",
  },
  {
    type: "centered",
    label: "3 Days Around Today",
    description: "3 days before and after today",
  },
];

const STORAGE_KEY = "goalcraft-schedule-view-range";

function getStoredViewRange(): ViewRangeType {
  if (typeof window === "undefined") return "week";

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ["week", "yesterday-forward", "centered"].includes(stored)) {
      return stored as ViewRangeType;
    }
  } catch {
    // localStorage not available
  }
  return "week";
}

function storeViewRange(type: ViewRangeType) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, type);
  } catch {
    // localStorage not available
  }
}

export interface ViewRangeDates {
  startDate: Date;
  endDate: Date;
  days: Date[];
  dayCount: number;
}

export function calculateViewRangeDates(
  type: ViewRangeType,
  referenceDate: Date,
): ViewRangeDates {
  const today = startOfDay(referenceDate);

  switch (type) {
    case "week": {
      // Full week: Sunday to Saturday
      const weekStart = startOfWeek(today, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
      const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
      return { startDate: weekStart, endDate: weekEnd, days, dayCount: 7 };
    }

    case "yesterday-forward": {
      // Yesterday + rest of week (until Saturday)
      const yesterday = subDays(today, 1);
      const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
      const dayCount =
        Math.ceil(
          (weekEnd.getTime() - yesterday.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;
      const days = Array.from({ length: dayCount }, (_, i) =>
        addDays(yesterday, i),
      );
      return { startDate: yesterday, endDate: weekEnd, days, dayCount };
    }

    case "centered": {
      // 3 days before + today + 3 days after = 7 days
      const startDate = subDays(today, 3);
      const endDate = addDays(today, 3);
      const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
      return {
        startDate,
        endDate: endOfDay(endDate),
        days,
        dayCount: 7,
      };
    }

    default:
      return calculateViewRangeDates("week", referenceDate);
  }
}

export function useViewRange(initialDate?: Date) {
  const [viewRangeType, setViewRangeTypeState] =
    useState<ViewRangeType>("week");
  const [isHydrated, setIsHydrated] = useState(false);
  const [referenceDate, setReferenceDate] = useState<Date | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = getStoredViewRange();
    setViewRangeTypeState(stored);
    setReferenceDate(initialDate ?? new Date());
    setIsHydrated(true);
  }, [initialDate]);

  const setViewRangeType = useCallback((type: ViewRangeType) => {
    setViewRangeTypeState(type);
    storeViewRange(type);
    // Reset to today when changing view type
    setReferenceDate(new Date());
  }, []);

  const viewRangeDates = useMemo(() => {
    if (!referenceDate) return null;
    return calculateViewRangeDates(viewRangeType, referenceDate);
  }, [viewRangeType, referenceDate]);

  const navigateForward = useCallback(() => {
    setReferenceDate((current) => {
      if (!current) return new Date();

      switch (viewRangeType) {
        case "week":
          return addDays(current, 7);
        case "yesterday-forward":
          // Move forward by the current day count
          const { dayCount } = calculateViewRangeDates(viewRangeType, current);
          return addDays(current, dayCount);
        case "centered":
          return addDays(current, 7);
        default:
          return addDays(current, 7);
      }
    });
  }, [viewRangeType]);

  const navigateBackward = useCallback(() => {
    setReferenceDate((current) => {
      if (!current) return new Date();

      switch (viewRangeType) {
        case "week":
          return subDays(current, 7);
        case "yesterday-forward":
          const { dayCount } = calculateViewRangeDates(viewRangeType, current);
          return subDays(current, dayCount);
        case "centered":
          return subDays(current, 7);
        default:
          return subDays(current, 7);
      }
    });
  }, [viewRangeType]);

  const goToToday = useCallback(() => {
    setReferenceDate(new Date());
  }, []);

  const navigate = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "next") {
        navigateForward();
      } else {
        navigateBackward();
      }
    },
    [navigateForward, navigateBackward],
  );

  const isTodayInView = useMemo(() => {
    if (!viewRangeDates) return false;
    const today = startOfDay(new Date());
    return viewRangeDates.days.some((day) => isSameDay(day, today));
  }, [viewRangeDates]);

  return {
    viewRangeType,
    setViewRangeType,
    viewRangeDates,
    navigate,
    goToToday,
    isTodayInView,
    isHydrated,
    referenceDate,
  };
}
