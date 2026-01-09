import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TimeBlock, HOUR_HEIGHT } from "../../types/schedule";

interface TimeBlockCardProps {
  block: TimeBlock;
}

export function TimeBlockCard({ block }: TimeBlockCardProps) {
  const style = getBlockStyle(block);
  const durationMinutes = (block.end.getTime() - block.start.getTime()) / 60000;
  const isShort = durationMinutes <= 30;

  return (
    <div
      className={cn(
        "absolute left-1 right-1 rounded-md border-l-4 px-2 py-1 cursor-pointer transition-all",
        "hover:shadow-md hover:scale-[1.02] hover:z-10",
        "overflow-hidden",
        block.color
      )}
      style={style}
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

function getBlockStyle(block: TimeBlock) {
  const startHour = block.start.getHours() + block.start.getMinutes() / 60;
  const endHour = block.end.getHours() + block.end.getMinutes() / 60;
  const duration = endHour - startHour;

  return {
    top: `${startHour * HOUR_HEIGHT}px`,
    height: `${Math.max(duration * HOUR_HEIGHT - 2, 20)}px`,
  };
}
