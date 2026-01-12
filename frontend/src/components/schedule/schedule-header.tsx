import { format, addDays, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MobileHeader from "@/components/layout/mobile/header";
import { RefObject, ReactNode } from "react";

interface ScheduleHeaderProps {
  weekStart: Date;
  onNavigate: (direction: "prev" | "next") => void;
  onToday: () => void;
  scrollRef?: RefObject<HTMLDivElement | null>;
  onScroll?: () => void;
  aiButton?: ReactNode;
}

export function ScheduleHeader({
  weekStart,
  onNavigate,
  onToday,
  scrollRef,
  onScroll,
  aiButton,
}: ScheduleHeaderProps) {
  return (
    <header className="shrink-0 border-b">
      <MobileHeader title="Schedule" />
      <div className="flex items-center justify-between p-3 md:p-4 pt-9 md:pt-0">
        <div className="flex items-center gap-2 md:gap-4">
          <h1 className="text-xl md:text-2xl font-bold hidden md:block">
            Schedule
          </h1>

          <NavigationControls onNavigate={onNavigate} onToday={onToday} />

          <span className="text-sm md:text-base font-medium text-muted-foreground hidden sm:block">
            {format(weekStart, "MMMM yyyy")}
          </span>
        </div>

        {aiButton}
      </div>

      <DaysHeader
        weekStart={weekStart}
        scrollRef={scrollRef}
        onScroll={onScroll}
      />
    </header>
  );
}

function NavigationControls({
  onNavigate,
  onToday,
}: {
  onNavigate: (direction: "prev" | "next") => void;
  onToday: () => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onNavigate("prev")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-3 text-sm font-medium"
        onClick={onToday}
      >
        Today Yet
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onNavigate("next")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function DaysHeader({
  weekStart,
  scrollRef,
  onScroll,
}: {
  weekStart: Date;
  scrollRef?: RefObject<HTMLDivElement | null>;
  onScroll?: () => void;
}) {
  return (
    <div className="flex border-t overflow-hidden md:pr-2.5">
      <div className="w-14 md:w-16 shrink-0 border-r bg-transparent" />

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex flex-1 overflow-x-auto no-scrollbar"
      >
        {Array.from({ length: 7 }).map((_, i) => {
          const date = addDays(weekStart, i);
          const isCurrentDay = isToday(date);

          return (
            <div
              key={i}
              className={cn(
                "flex-1 min-w-50 md:min-w-25 py-2 px-1 text-center border-r last:border-r-0 transition-colors",
                isCurrentDay && "bg-primary/5"
              )}
            >
              <p
                className={cn(
                  "text-[10px] md:text-xs font-medium uppercase tracking-wide",
                  isCurrentDay ? "text-primary" : "text-muted-foreground"
                )}
              >
                {format(date, "EEE")}
              </p>
              <div
                className={cn(
                  "mx-auto mt-1 h-7 w-7 md:h-8 md:w-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                  isCurrentDay
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {format(date, "d")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
