"use client";

import { useDraggable } from "@dnd-kit/core";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TimeBlock, HOUR_HEIGHT } from "../../types/schedule";

// Helper to ensure we have a Date object (handles Firestore Timestamps)
function ensureDate(value: Date | { toDate: () => Date } | unknown): Date {
  if (value instanceof Date) {
    return value;
  }
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return new Date(value as string | number);
}

interface DraggableTimeBlockProps {
  block: TimeBlock;
  onEdit: (block: TimeBlock) => void;
}

export function DraggableTimeBlock({ block, onEdit }: DraggableTimeBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: block.id,
      data: { block },
    });

  // Ensure dates are properly converted
  const startDate = ensureDate(block.start);
  const endDate = ensureDate(block.end);

  const style = getBlockStyle(startDate, endDate, transform, isDragging);
  const durationMinutes = (endDate.getTime() - startDate.getTime()) / 60000;
  const isShort = durationMinutes <= 30;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onEdit(block);
        }
      }}
      className={cn(
        "absolute left-1 right-1 rounded-md border-l-4 px-2 py-1 cursor-grab transition-shadow",
        "hover:shadow-md hover:z-10",
        "overflow-hidden touch-none",
        isDragging && "cursor-grabbing shadow-lg z-50 opacity-90",
        block.color,
      )}
      style={style}
    >
      <p
        className={cn(
          "font-medium truncate",
          isShort ? "text-[10px]" : "text-xs",
        )}
      >
        {block.title}
      </p>
      {!isShort && (
        <p className="text-[10px] opacity-70 truncate">
          {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
        </p>
      )}
    </div>
  );
}

function getBlockStyle(
  start: Date,
  end: Date,
  transform: { x: number; y: number } | null,
  isDragging: boolean,
) {
  const startHour = start.getHours() + start.getMinutes() / 60;
  let endHour = end.getHours() + end.getMinutes() / 60;

  // Handle midnight case: if end is at 00:00, treat it as 24:00 for display
  // This happens when a block ends at midnight (12 AM)
  if (endHour === 0 && end.getTime() > start.getTime()) {
    endHour = 24;
  }

  // Handle blocks that cross midnight (end time appears before start time)
  // For same-day display, cap at midnight (24)
  const duration = endHour > startHour ? endHour - startHour : 24 - startHour;

  return {
    top: `${startHour * HOUR_HEIGHT}px`,
    height: `${Math.max(duration * HOUR_HEIGHT - 2, 20)}px`,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition: isDragging ? undefined : "transform 200ms ease",
  };
}
