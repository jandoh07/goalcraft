import { HOUR_HEIGHT, HOURS } from "../../types/schedule";

export function TimeLabelsColumn() {
  return (
    <div className="w-14 md:w-16 shrink-0 sticky left-0 z-20 border-r pt-2 bg-background">
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

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}
