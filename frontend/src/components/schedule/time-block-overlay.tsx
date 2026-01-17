import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TimeBlock, HOUR_HEIGHT } from "../../types/schedule";

interface TimeBlockOverlayProps {
  block: TimeBlock;
}

export function TimeBlockOverlay({ block }: TimeBlockOverlayProps) {
  const durationMinutes = (block.end.getTime() - block.start.getTime()) / 60000;
  const durationHours = durationMinutes / 60;
  const isShort = durationMinutes <= 30;

  return (
    <div
      className={cn(
        "rounded-md border-l-4 px-2 py-1 cursor-grabbing shadow-xl",
        "overflow-hidden opacity-95",
        block.color
      )}
      style={{
        width: "140px",
        height: `${Math.max(durationHours * HOUR_HEIGHT - 2, 20)}px`,
      }}
    >
      <p
        className={cn(
          "font-medium truncate",
          isShort ? "text-[10px]" : "text-xs"
        )}
      >
        {block.title}
      </p>
      {!isShort && (
        <p className="text-[10px] opacity-70 truncate">
          {format(block.start, "h:mm a")} - {format(block.end, "h:mm a")}
        </p>
      )}
    </div>
  );
}
