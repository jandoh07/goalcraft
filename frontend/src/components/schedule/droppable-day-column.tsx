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
  return (
    <div
      className={cn(
        "flex-1 min-w-50 md:min-w-25 border-r last:border-r-0 relative",
        isCurrentDay && "bg-primary/2",
      )}
      style={{ height: `${24 * HOUR_HEIGHT}px` }}
    >
      {/* Hour-level drop zones */}
      {HOURS.map((hour) => (
        <DroppableHourSlot
          key={`${dayIndex}-${hour}`}
          dayIndex={dayIndex}
          hour={hour}
          date={date}
          onClick={() => onCreateClick(date, hour)}
        />
      ))}

      {/* Time blocks */}
      {blocks.map((block) => (
        <DraggableTimeBlock key={block.id} block={block} onEdit={onEditClick} />
      ))}

      {isCurrentDay && <CurrentTimeIndicator position={currentTimePosition} />}
    </div>
  );
}

// Each hour is its own droppable zone
function DroppableHourSlot({
  dayIndex,
  hour,
  date,
  onClick,
}: {
  dayIndex: number;
  hour: number;
  date: Date;
  onClick: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dayIndex}-hour-${hour}`,
    data: { date, dayIndex, hour },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        "absolute inset-x-0 border-t border-border/40 hover:bg-muted/30 transition-colors cursor-pointer",
        isOver && "bg-primary/20",
      )}
      style={{
        top: `${hour * HOUR_HEIGHT}px`,
        height: `${HOUR_HEIGHT}px`,
      }}
    >
      {/* Half-hour line */}
      <div
        className="absolute inset-x-0 border-t border-border/20 pointer-events-none"
        style={{ top: `${HOUR_HEIGHT / 2}px` }}
      />
    </div>
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
