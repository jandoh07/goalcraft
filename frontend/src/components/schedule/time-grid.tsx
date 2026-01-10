"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { addDays, isSameDay, isToday } from "date-fns";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { TimeBlock, HOUR_HEIGHT } from "../../types/schedule";
import { TimeLabelsColumn } from "./time-labels-column";
import { DroppableDayColumn } from "./droppable-day-column";
import { TimeBlockOverlay } from "@/components/schedule/time-block-overlay";

interface TimeGridProps {
  weekStart: Date;
  blocks: TimeBlock[];
  onCreateClick: (date: Date, hour: number) => void;
  onEditClick: (block: TimeBlock) => void;
  onBlockMove: (blockId: string, newDate: Date, newHour: number) => void;
  horizontalScrollRef?: React.RefObject<HTMLDivElement | null>;
  onHorizontalScroll?: () => void;
}

export function TimeGrid({
  weekStart,
  blocks,
  onCreateClick,
  onEditClick,
  onBlockMove,
  horizontalScrollRef,
  onHorizontalScroll,
}: TimeGridProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeBlock, setActiveBlock] = useState<TimeBlock | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
    [blocks]
  );

  const currentTimePosition =
    (currentTime.getHours() + currentTime.getMinutes() / 60) * HOUR_HEIGHT;

  const handleDragStart = (event: {
    active: { data: { current?: { block?: TimeBlock } } };
  }) => {
    const block = event.active.data.current?.block;
    if (block) {
      setActiveBlock(block);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveBlock(null);
    const { active, over, delta } = event;

    if (!over || !active.data.current?.block) return;

    const block = active.data.current.block as TimeBlock;
    const targetDate = over.data.current?.date as Date;

    if (!targetDate) return;

    // Calculate new hour based on drag delta
    const currentStartHour =
      block.start.getHours() + block.start.getMinutes() / 60;
    const hourDelta = Math.round((delta.y / HOUR_HEIGHT) * 2) / 2; // Snap to 30-min
    const newHour = Math.max(0, Math.min(23.5, currentStartHour + hourDelta));

    onBlockMove(block.id, targetDate, newHour);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const date = addDays(weekStart, dayIndex);
              const isCurrentDay = isToday(date);
              const dayBlocks = getBlocksForDay(date);

              return (
                <DroppableDayColumn
                  key={dayIndex}
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

      <DragOverlay>
        {activeBlock && <TimeBlockOverlay block={activeBlock} />}
      </DragOverlay>
    </DndContext>
  );
}
