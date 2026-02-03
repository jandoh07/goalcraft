"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { isSameDay, isToday } from "date-fns";
import { TimeBlock, HOUR_HEIGHT } from "../../types/schedule";
import { TimeLabelsColumn } from "./time-labels-column";
import { DroppableDayColumn } from "./droppable-day-column";

interface TimeGridProps {
  days: Date[];
  blocks: TimeBlock[];
  onCreateClick: (date: Date, hour: number) => void;
  onEditClick: (block: TimeBlock) => void;
  horizontalScrollRef?: React.RefObject<HTMLDivElement | null>;
  onHorizontalScroll?: () => void;
}

export function TimeGrid({
  days,
  blocks,
  onCreateClick,
  onEditClick,
  horizontalScrollRef,
  onHorizontalScroll,
}: TimeGridProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current && !hasScrolled.current) {
      const currentHour = new Date().getHours();
      const scrollPosition = Math.max(0, (currentHour - 1) * HOUR_HEIGHT);
      scrollContainerRef.current.scrollTop = scrollPosition;
      hasScrolled.current = true;
    }
  }, []);

  const getBlocksForDay = useCallback(
    (date: Date) => {
      return blocks.filter((block) => isSameDay(block.start, date));
    },
    [blocks],
  );

  const currentTimePosition =
    (currentTime.getHours() + currentTime.getMinutes() / 60) * HOUR_HEIGHT;

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-auto custom-scrollbar scrollbar-gutter-stable"
    >
      <div className="flex min-h-full">
        <TimeLabelsColumn />

        <div
          ref={horizontalScrollRef}
          onScroll={onHorizontalScroll}
          className="flex flex-1 min-w-0 overflow-x-auto no-scrollbar"
        >
          {days.map((date, dayIndex) => {
            const isCurrentDay = isToday(date);
            const dayBlocks = getBlocksForDay(date);

            return (
              <DroppableDayColumn
                key={date.toISOString()}
                dayIndex={dayIndex}
                isCurrentDay={isCurrentDay}
                blocks={dayBlocks}
                currentTimePosition={currentTimePosition}
                date={date}
                onCreateClick={onCreateClick}
                onEditClick={onEditClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
