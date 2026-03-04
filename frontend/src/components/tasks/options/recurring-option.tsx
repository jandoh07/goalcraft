"use client";

import { Repeat, X, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

const DAYS_OF_WEEK = [
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
  { key: "sun", label: "S" },
];

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

interface RecurringOptionProps {
  isRecurring: boolean;
  frequency: string;
  customDays: string[];
  onRecurringChange: (isRecurring: boolean) => void;
  onFrequencyChange: (frequency: string) => void;
  onToggleCustomDay: (day: string) => void;
}

export default function RecurringOption({
  isRecurring,
  frequency,
  customDays,
  onRecurringChange,
  onFrequencyChange,
  onToggleCustomDay,
}: RecurringOptionProps) {
  const [open, setOpen] = useState(false);

  const handleFrequencySelect = (value: string) => {
    onFrequencyChange(value);
    onRecurringChange(true);
    if (value !== "custom") {
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRecurringChange(false);
    onFrequencyChange("");
  };

  const frequencyLabel = FREQUENCY_OPTIONS.find(
    (f) => f.value === frequency,
  )?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1 hover:bg-muted p-1 rounded cursor-pointer transition-all text-muted-foreground",
            isRecurring &&
              "bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 pr-1.5",
          )}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Repeat className="size-4.5 md:size-3.5" />
          {isRecurring && (
            <>
              <span className="text-[10px] font-medium">
                {frequencyLabel || "Repeat"}
              </span>
              <X
                className="size-3 hover:text-destructive"
                onClick={handleClear}
              />
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="start">
        <div className="space-y-1">
          <p className="text-sm font-medium px-2 py-1">Repeat</p>
          {FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={cn(
                "w-full text-left text-sm px-2 py-1.5 rounded-md flex items-center justify-between transition-colors",
                frequency === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
              onClick={() => handleFrequencySelect(opt.value)}
            >
              {opt.label}
              {frequency === opt.value && <Check className="size-3.5" />}
            </button>
          ))}

          {/* Custom days selection */}
          {frequency === "custom" && (
            <div className="pt-2 px-1 border-t mt-2">
              <p className="text-xs text-muted-foreground mb-2">Select days</p>
              <div className="flex gap-1">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.key}
                    type="button"
                    className={cn(
                      "size-7 rounded-full text-xs font-medium transition-colors",
                      customDays.includes(day.key)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80",
                    )}
                    onClick={() => onToggleCustomDay(day.key)}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Remove repeat option */}
          {isRecurring && (
            <button
              type="button"
              className="w-full text-left text-sm px-2 py-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors mt-1 border-t pt-2"
              onClick={() => {
                onRecurringChange(false);
                onFrequencyChange("");
                setOpen(false);
              }}
            >
              Remove repeat
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
