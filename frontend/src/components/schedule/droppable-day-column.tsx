"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { TimeBlock, HOUR_HEIGHT, HOURS } from "../../types/schedule";
import { DraggableTimeBlock } from "./draggable-time-block";

interface DroppableDayColumnProps {
  dayIndex: number;
  isCurrentDay: boolean;
  blocks: TimeBlock[];
  currentTimePosition: number;
  date: Date;
  onCreateClick: (date: Date, hour: number) => void;
  onEditClick: (block: TimeBlock) => void;
}

export function DroppableDayColumn({
  dayIndex,
  isCurrentDay,
  blocks,
  currentTimePosition,
  date,
  onCreateClick,
  onEditClick,
}: DroppableDayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dayIndex}`,
    data: { date, dayIndex },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 min-w-50 md:min-w-25 border-r last:border-r-0 relative",
        isCurrentDay && "bg-primary/2",
        isOver && "bg-primary/10"
      )}
      style={{ height: `${24 * HOUR_HEIGHT}px` }}
    >
      <HourGridLines onClick={(hour) => onCreateClick(date, hour)} />
      <HalfHourLines />

      {blocks.map((block) => (
        <DraggableTimeBlock key={block.id} block={block} onEdit={onEditClick} />
      ))}

      {isCurrentDay && <CurrentTimeIndicator position={currentTimePosition} />}
    </div>
  );
}

function HourGridLines({ onClick }: { onClick: (hour: number) => void }) {
  return (
    <>
      {HOURS.map((hour) => (
        <div
          key={hour}
          onClick={() => onClick(hour)}
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
