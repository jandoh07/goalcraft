"use client";

import { cn } from "@/lib/utils";
import { useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DateStripProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  className?: string;
}

const DateStrip = ({
  selectedDate,
  onDateSelect,
  className,
}: DateStripProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);

  // Generate dates: 14 days before and 30 days after today
  const getDates = useCallback(() => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = -14; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  const dates = getDates();

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short" });
  };

  // Scroll to today on mount
  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const todayElement = todayRef.current;
      const containerWidth = container.offsetWidth;
      const elementLeft = todayElement.offsetLeft;
      const elementWidth = todayElement.offsetWidth;

      // Center the today element
      container.scrollLeft =
        elementLeft - containerWidth / 2 + elementWidth / 2;
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleDateClick = (date: Date) => {
    // If clicking the same date, deselect it
    if (selectedDate && isSelected(date)) {
      onDateSelect(null);
    } else {
      onDateSelect(date);
    }
  };

  return (
    <div
      className={cn("relative flex items-center gap-1 mt-7 md:mt-0", className)}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0 hidden sm:flex"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {dates.map((date, index) => {
          const today = isToday(date);
          const selected = isSelected(date);
          const showMonth = index === 0 || date.getDate() === 1;

          return (
            <button
              key={date.toISOString()}
              ref={today ? todayRef : undefined}
              onClick={() => handleDateClick(date)}
              className={cn(
                "flex flex-col items-center justify-center size-12 md:size-15 py-1 px-4 md:px-5 rounded-full transition-all",
                "hover:bg-accent hover:text-accent-foreground",
                today && !selected && "bg-primary/10 text-primary",
                selected && "bg-primary text-primary-foreground",
                !today && !selected && "text-muted-foreground"
              )}
            >
              <span className="text-[10px] uppercase font-medium">
                {getDayName(date)}
              </span>
              <span className="md:text-lg font-semibold">{date.getDate()}</span>
              {showMonth && (
                <span className="text-[10px] uppercase">
                  {getMonthName(date)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0 hidden sm:flex"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DateStrip;
