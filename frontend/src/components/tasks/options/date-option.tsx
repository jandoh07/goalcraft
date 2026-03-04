"use client";

import { CalendarDays, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DateOptionProps {
  date: Date | undefined;
  time: string;
  dateLabel: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  isFocused: boolean;
}

export default function DateOption({
  date,
  time,
  dateLabel,
  onDateChange,
  onTimeChange,
  isFocused,
}: DateOptionProps) {
  const [open, setOpen] = useState(false);
  const hasDate = !!date;
  const showLabel = isFocused || hasDate;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1 hover:bg-muted p-1 rounded cursor-pointer transition-all text-muted-foreground",
            hasDate &&
              "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 pr-1.5",
          )}
          onMouseDown={(e) => e.preventDefault()}
        >
          <CalendarDays className="size-5 md:size-4" />
          {showLabel && (
            <span className="text-[10px] font-medium">
              {dateLabel || "Today"}
            </span>
          )}
          {hasDate && (
            <X
              className="size-3 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDateChange(undefined);
              }}
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2 space-y-3">
          {/* Quick date options */}
          <div className="flex gap-1">
            {["Today", "Tomorrow", "No date"].map((opt) => (
              <button
                key={opt}
                type="button"
                className={cn(
                  "text-xs px-2.5 py-1 rounded-md border transition-colors",
                  (opt === "Today" && dateLabel === "Today") ||
                    (opt === "Tomorrow" && dateLabel === "Tomorrow") ||
                    (opt === "No date" && !date)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted",
                )}
                onClick={() => {
                  if (opt === "Today") {
                    onDateChange(new Date());
                  } else if (opt === "Tomorrow") {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    onDateChange(tomorrow);
                  } else {
                    onDateChange(undefined);
                  }
                  setOpen(false);
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              onDateChange(selectedDate);
              setOpen(false);
            }}
          />

          {/* Time input */}
          <div className="px-1 pb-1">
            <Label
              htmlFor="task-time"
              className="text-xs text-muted-foreground mb-1 block"
            >
              Time
            </Label>
            <Input
              type="time"
              id="task-time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
