import { useRef, useCallback, useEffect } from "react";
import { isSameDay, startOfDay } from "date-fns";

const DAY_COLUMN_WIDTH_MOBILE = 200; // min-w-50 = 200px

export function useSyncedScroll(days?: Date[]) {
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);
  const hasScrolledToToday = useRef(false);

  const handleHeaderScroll = useCallback(() => {
    if (isSyncing.current) return;
    if (!headerScrollRef.current || !gridScrollRef.current) return;

    isSyncing.current = true;
    gridScrollRef.current.scrollLeft = headerScrollRef.current.scrollLeft;
    requestAnimationFrame(() => {
      isSyncing.current = false;
    });
  }, []);

  const handleGridScroll = useCallback(() => {
    if (isSyncing.current) return;
    if (!headerScrollRef.current || !gridScrollRef.current) return;

    isSyncing.current = true;
    headerScrollRef.current.scrollLeft = gridScrollRef.current.scrollLeft;
    requestAnimationFrame(() => {
      isSyncing.current = false;
    });
  }, []);

  // Scroll to today's column on mobile
  useEffect(() => {
    if (hasScrolledToToday.current || !days || days.length === 0) return;
    if (!headerScrollRef.current || !gridScrollRef.current) return;

    // Check if on mobile (container is scrollable)
    const container = gridScrollRef.current;
    if (container.scrollWidth <= container.clientWidth) return;

    const today = startOfDay(new Date());

    // Find index of today in the days array
    const todayIndex = days.findIndex((day) => isSameDay(day, today));

    // Only scroll if today is within the visible days
    if (todayIndex >= 0) {
      // Calculate scroll position to center today's column
      const containerWidth = container.clientWidth;
      const scrollPosition = Math.max(
        0,
        todayIndex * DAY_COLUMN_WIDTH_MOBILE -
          (containerWidth - DAY_COLUMN_WIDTH_MOBILE) / 2,
      );

      // Scroll both containers
      isSyncing.current = true;
      headerScrollRef.current.scrollLeft = scrollPosition;
      gridScrollRef.current.scrollLeft = scrollPosition;
      requestAnimationFrame(() => {
        isSyncing.current = false;
      });

      hasScrolledToToday.current = true;
    }
  }, [days]);

  // Reset scroll flag when days change
  useEffect(() => {
    hasScrolledToToday.current = false;
  }, [days]);

  return {
    headerScrollRef,
    gridScrollRef,
    handleHeaderScroll,
    handleGridScroll,
  };
}
