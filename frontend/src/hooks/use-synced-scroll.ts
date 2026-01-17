import { useRef, useCallback, useEffect } from "react";

const DAY_COLUMN_WIDTH_MOBILE = 200; // min-w-50 = 200px

export function useSyncedScroll(weekStart?: Date) {
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
    if (hasScrolledToToday.current || !weekStart) return;
    if (!headerScrollRef.current || !gridScrollRef.current) return;

    // Check if on mobile (container is scrollable)
    const container = gridScrollRef.current;
    if (container.scrollWidth <= container.clientWidth) return;

    const today = new Date();
    const weekStartDate = new Date(weekStart);

    // Calculate days difference
    const diffTime = today.getTime() - weekStartDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Only scroll if today is within this week (0-6)
    if (diffDays >= 0 && diffDays <= 6) {
      // Calculate scroll position to center today's column
      const containerWidth = container.clientWidth;
      const scrollPosition = Math.max(
        0,
        diffDays * DAY_COLUMN_WIDTH_MOBILE -
          (containerWidth - DAY_COLUMN_WIDTH_MOBILE) / 2
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
  }, [weekStart]);

  // Reset scroll flag when week changes
  useEffect(() => {
    hasScrolledToToday.current = false;
  }, [weekStart]);

  return {
    headerScrollRef,
    gridScrollRef,
    handleHeaderScroll,
    handleGridScroll,
  };
}
