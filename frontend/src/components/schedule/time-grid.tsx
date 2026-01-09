"use client";

import { useEffect, useRef, useState } from "react";
import { addDays, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { TimeBlock, HOUR_HEIGHT, HOURS } from "../../types/schedule";
import { TimeBlockCard } from "./time-block-card";

interface TimeGridProps {
  weekStart: Date;
  blocks: TimeBlock[];
}

export function TimeGrid({ weekStart, blocks }: TimeGridProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollContainerRef.current && !hasScrolled.current) {
      const currentHour = new Date().getHours();
      const scrollPosition = Math.max(0, (currentHour - 1) * HOUR_HEIGHT);
      scrollContainerRef.current.scrollTop = scrollPosition;
      hasScrolled.current = true;
    }
  }, []);

  const getBlocksForDay = (date: Date) => {
    return blocks.filter((block) => isSameDay(block.start, date));
  };

  const currentTimePosition =
    (currentTime.getHours() + currentTime.getMinutes() / 60) * HOUR_HEIGHT;

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-auto custom-scrollbar scrollbar-gutter-stable"
    >
      <div className="flex min-h-full">
        <TimeLabelsColumn />

        <div className="flex flex-1 min-w-0">
          {Array.from({ length: 7 }).map((_, dayIndex) => {
            const date = addDays(weekStart, dayIndex);
            const isCurrentDay = isToday(date);
            const dayBlocks = getBlocksForDay(date);

            return (
              <DayColumn
                key={dayIndex}
                isCurrentDay={isCurrentDay}
                blocks={dayBlocks}
                currentTimePosition={currentTimePosition}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TimeLabelsColumn() {
  return (
    <div className="w-14 md:w-16 shrink-0 sticky left-0 z-20 border-r pt-2">
      <div className="relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="absolute right-2 text-[10px] md:text-xs text-muted-foreground tabular-nums -translate-y-1/2"
            style={{ top: `${hour * HOUR_HEIGHT}px` }}
          >
            {formatHour(hour)}
          </div>
        ))}
      </div>
    </div>
  );
}

interface DayColumnProps {
  isCurrentDay: boolean;
  blocks: TimeBlock[];
  currentTimePosition: number;
}

function DayColumn({
  isCurrentDay,
  blocks,
  currentTimePosition,
}: DayColumnProps) {
  return (
    <div
      className={cn(
        "flex-1 min-w-25 border-r last:border-r-0 relative",
        isCurrentDay && "bg-primary/2"
      )}
      style={{ height: `${24 * HOUR_HEIGHT}px` }}
    >
      <HourGridLines />
      <HalfHourLines />

      {blocks.map((block) => (
        <TimeBlockCard key={block.id} block={block} />
      ))}

      {isCurrentDay && <CurrentTimeIndicator position={currentTimePosition} />}
    </div>
  );
}

function HourGridLines() {
  return (
    <>
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="absolute inset-x-0 border-t border-border/40 hover:bg-muted/30 transition-colors cursor-pointer"
          style={{
            top: `${hour * HOUR_HEIGHT}px`,
            height: `${HOUR_HEIGHT}px`,
          }}
        />
      ))}
    </>
  );
}

function HalfHourLines() {
  return (
    <>
      {HOURS.map((hour) => (
        <div
          key={`half-${hour}`}
          className="absolute inset-x-0 border-t border-border/20 pointer-events-none"
          style={{
            top: `${hour * HOUR_HEIGHT + HOUR_HEIGHT / 2}px`,
          }}
        />
      ))}
    </>
  );
}

function CurrentTimeIndicator({ position }: { position: number }) {
  return (
    <div
      className="absolute left-0 right-0 z-30 pointer-events-none"
      style={{ top: `${position}px` }}
    >
      <div className="relative flex items-center">
        <div className="absolute -left-1.5 h-3 w-3 rounded-full bg-red-500 shadow-sm" />
        <div className="w-full h-0.5 bg-red-500 shadow-sm" />
      </div>
    </div>
  );
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}
