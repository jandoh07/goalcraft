import { useState, useCallback, useRef, useMemo } from "react";
import {
  isToday,
  isTomorrow,
  format,
  addDays,
  addWeeks,
  setDate,
  nextMonday,
  nextTuesday,
  nextWednesday,
  nextThursday,
  nextFriday,
  nextSaturday,
  nextSunday,
} from "date-fns";
import { Task } from "@/types";

export interface HighlightRange {
  start: number;
  end: number;
  type: "keyword" | "exclamation" | "date";
}

const RECURRING_KEYWORDS: Record<string, string> = {
  "every day": "daily",
  everyday: "daily",
  daily: "daily",
  "every week": "weekly",
  weekly: "weekly",
  "every month": "monthly",
  monthly: "monthly",
};

// Date keywords that map to date values (processed in order, longest first)
const DATE_KEYWORDS: Record<string, () => Date> = {
  "day after tomorrow": () => addDays(new Date(), 2),
  "next week": () => addWeeks(new Date(), 1),
  "next monday": () => nextMonday(new Date()),
  "next tuesday": () => nextTuesday(new Date()),
  "next wednesday": () => nextWednesday(new Date()),
  "next thursday": () => nextThursday(new Date()),
  "next friday": () => nextFriday(new Date()),
  "next saturday": () => nextSaturday(new Date()),
  "next sunday": () => nextSunday(new Date()),
  tomorrow: () => addDays(new Date(), 1),
  today: () => new Date(),
};

// Ordinal date regex: "1st", "2nd", "3rd", "4th"..."31st"
const ORDINAL_REGEX = /\b(([12]?\d|3[01])(st|nd|rd|th))\b/i;

function parseDateFromOrdinal(match: string): Date | null {
  const dayNum = parseInt(match.replace(/(st|nd|rd|th)/i, ""), 10);
  if (dayNum < 1 || dayNum > 31) return null;
  const now = new Date();
  let target = setDate(now, dayNum);
  // If the date has passed this month, go to next month
  if (target < now) {
    target = setDate(
      new Date(now.getFullYear(), now.getMonth() + 1, 1),
      dayNum,
    );
  }
  return target;
}

export function useAddTaskOptions() {
  const [dueDate, setDueDateRaw] = useState<Date | undefined>(undefined);
  const [dueDateExplicit, setDueDateExplicit] = useState(false);
  const [dueDateFromTitle, setDueDateFromTitle] = useState(false);
  const [time, setTime] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isRecurring, setIsRecurringRaw] = useState(false);
  const [frequency, setFrequencyRaw] = useState("");
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [isImportant, setIsImportant] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Track previous auto-detected values to avoid re-setting on every keystroke
  const prevExcCountRef = useRef(0);
  const prevKeywordRef = useRef<string | null>(null);
  const prevDateKeywordRef = useRef<string | null>(null);

  const setDueDate = useCallback((date: Date | undefined) => {
    setDueDateRaw(date);
    setDueDateExplicit(true);
    setDueDateFromTitle(false);
  }, []);

  // Wrappers that track whether recurring was set manually vs from title
  const recurringFromTitleRef = useRef(false);

  const setIsRecurring = useCallback((val: boolean) => {
    setIsRecurringRaw(val);
    if (!val) {
      // When user manually clears recurring, also clear the keyword tracking
      // so highlights are removed
      recurringFromTitleRef.current = false;
      prevKeywordRef.current = null;
    }
  }, []);

  const setFrequency = useCallback((val: string) => {
    setFrequencyRaw(val);
  }, []);

  // When focused and user hasn't explicitly set a date, default to today
  const effectiveDueDate = useMemo(() => {
    if (dueDateExplicit || dueDateFromTitle) return dueDate;
    if (isFocused) return new Date();
    return undefined;
  }, [dueDate, dueDateExplicit, dueDateFromTitle, isFocused]);

  const getDateLabel = useCallback((date: Date | undefined): string => {
    if (!date) return "";
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  }, []);

  // Parse title for auto-detection of exclamation marks, recurring keywords, and dates
  const parseTitle = useCallback(
    (title: string) => {
      // --- Exclamation mark detection ---
      const excMatch = title.match(/!{1,3}/);
      const excCount = excMatch ? excMatch[0].length : 0;

      if (excCount !== prevExcCountRef.current) {
        if (excCount >= 3) {
          setIsImportant(true);
          setIsUrgent(true);
        } else if (excCount === 2) {
          setIsImportant(false);
          setIsUrgent(true);
        } else if (excCount === 1) {
          setIsImportant(true);
          setIsUrgent(false);
        } else {
          setIsImportant(false);
          setIsUrgent(false);
        }
        prevExcCountRef.current = excCount;
      }

      // --- Recurring keyword detection ---
      const lowerTitle = title.toLowerCase();
      let keyword: string | null = null;
      let freq = "";

      const sortedKeywords = Object.entries(RECURRING_KEYWORDS).sort(
        (a, b) => b[0].length - a[0].length,
      );

      for (const [kw, f] of sortedKeywords) {
        if (lowerTitle.includes(kw)) {
          keyword = kw;
          freq = f;
          break;
        }
      }

      if (keyword !== prevKeywordRef.current) {
        if (keyword) {
          setIsRecurringRaw(true);
          setFrequencyRaw(freq);
          recurringFromTitleRef.current = true;
        } else if (recurringFromTitleRef.current) {
          // Only auto-clear if recurring was set by title (not manually)
          setIsRecurringRaw(false);
          setFrequencyRaw("");
          recurringFromTitleRef.current = false;
        }
        prevKeywordRef.current = keyword;
      }

      // --- Date keyword detection ---
      if (!dueDateExplicit) {
        let dateKeyword: string | null = null;
        let detectedDate: Date | null = null;

        // Check keyword dates (sorted longest first)
        const sortedDateKeywords = Object.entries(DATE_KEYWORDS).sort(
          (a, b) => b[0].length - a[0].length,
        );
        for (const [kw, dateFn] of sortedDateKeywords) {
          if (lowerTitle.includes(kw)) {
            dateKeyword = kw;
            detectedDate = dateFn();
            break;
          }
        }

        // Check ordinal dates like "3rd", "15th"
        if (!dateKeyword) {
          const ordinalMatch = title.match(ORDINAL_REGEX);
          if (ordinalMatch) {
            dateKeyword = ordinalMatch[0];
            detectedDate = parseDateFromOrdinal(ordinalMatch[0]);
          }
        }

        if (dateKeyword !== prevDateKeywordRef.current) {
          if (detectedDate) {
            setDueDateRaw(detectedDate);
            setDueDateFromTitle(true);
          } else {
            // Date keyword removed from title
            setDueDateRaw(undefined);
            setDueDateFromTitle(false);
          }
          prevDateKeywordRef.current = dateKeyword;
        }
      }
    },
    [dueDateExplicit],
  );

  // Get ranges to highlight in the input text
  // Now respects the isRecurring state — if user manually cleared recurring,
  // keyword won't highlight even if present in text
  const getHighlightRanges = useCallback(
    (title: string): HighlightRange[] => {
      const ranges: HighlightRange[] = [];
      const lowerTitle = title.toLowerCase();

      // Highlight exclamation marks (only if important or urgent is active)
      const excMatch = title.match(/!{1,3}/);
      if (
        excMatch &&
        excMatch.index !== undefined &&
        (isImportant || isUrgent)
      ) {
        ranges.push({
          start: excMatch.index,
          end: excMatch.index + excMatch[0].length,
          type: "exclamation",
        });
      }

      // Highlight recurring keywords only if isRecurring is active
      if (isRecurring) {
        const sortedKeywords = Object.entries(RECURRING_KEYWORDS).sort(
          (a, b) => b[0].length - a[0].length,
        );
        for (const [kw] of sortedKeywords) {
          const idx = lowerTitle.indexOf(kw);
          if (idx !== -1) {
            ranges.push({
              start: idx,
              end: idx + kw.length,
              type: "keyword",
            });
            break;
          }
        }
      }

      // Highlight date keywords
      if (dueDateFromTitle) {
        const sortedDateKeywords = Object.entries(DATE_KEYWORDS).sort(
          (a, b) => b[0].length - a[0].length,
        );
        for (const [kw] of sortedDateKeywords) {
          const idx = lowerTitle.indexOf(kw);
          if (idx !== -1) {
            ranges.push({ start: idx, end: idx + kw.length, type: "date" });
            break;
          }
        }

        // Ordinal date highlight
        if (!ranges.some((r) => r.type === "date")) {
          const ordinalMatch = title.match(ORDINAL_REGEX);
          if (ordinalMatch && ordinalMatch.index !== undefined) {
            ranges.push({
              start: ordinalMatch.index,
              end: ordinalMatch.index + ordinalMatch[0].length,
              type: "date",
            });
          }
        }
      }

      return ranges.sort((a, b) => a.start - b.start);
    },
    [isRecurring, isImportant, isUrgent, dueDateFromTitle],
  );

  // Remove exclamation mark syntax from the title for clean submission
  const getCleanTitle = useCallback((title: string): string => {
    return title.replace(/\s*!{1,3}\s*/, " ").trim();
  }, []);

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (trimmed && !tags.includes(trimmed)) {
        setTags((prev) => [...prev, trimmed]);
      }
    },
    [tags],
  );

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const toggleCustomDay = useCallback((day: string) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }, []);

  // Prefill from an existing task (for editing)
  const prefillFromTask = useCallback((task: Task) => {
    setDueDateRaw(task.dueDate ? new Date(task.dueDate) : undefined);
    setDueDateExplicit(!!task.dueDate);
    setDueDateFromTitle(false);
    setTime(task.time || "");
    setTags(task.tags || []);
    setIsRecurringRaw(!!task.recurringMasterId || !!task.frequency);
    setFrequencyRaw(task.frequency || "");
    setIsImportant(task.isImportant || false);
    setIsUrgent(task.isUrgent || false);
    prevExcCountRef.current = 0;
    prevKeywordRef.current = null;
    prevDateKeywordRef.current = null;
    recurringFromTitleRef.current = false;
  }, []);

  const reset = useCallback(() => {
    setDueDateRaw(undefined);
    setDueDateExplicit(false);
    setDueDateFromTitle(false);
    setTime("");
    setTags([]);
    setIsRecurringRaw(false);
    setFrequencyRaw("");
    setCustomDays([]);
    setIsImportant(false);
    setIsUrgent(false);
    prevExcCountRef.current = 0;
    prevKeywordRef.current = null;
    prevDateKeywordRef.current = null;
    recurringFromTitleRef.current = false;
  }, []);

  return {
    // Computed option values
    options: {
      dueDate: effectiveDueDate,
      time,
      tags,
      isRecurring,
      frequency,
      customDays,
      isImportant,
      isUrgent,
    },
    isFocused,

    // Setters
    getDateLabel,
    setDueDate,
    setTime,
    addTag,
    removeTag,
    setTags,
    setIsRecurring,
    setFrequency,
    setCustomDays,
    toggleCustomDay,
    setIsImportant,
    setIsUrgent,
    setIsFocused,

    // Parsing & utilities
    parseTitle,
    getHighlightRanges,
    getCleanTitle,
    prefillFromTask,
    reset,
  };
}

export type UseAddTaskOptionsReturn = ReturnType<typeof useAddTaskOptions>;
