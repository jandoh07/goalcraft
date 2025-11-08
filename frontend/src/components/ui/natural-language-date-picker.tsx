"use client";

import { parseDate } from "chrono-node";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface NaturalLanguageDatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  defaultValue?: string;
}

export function NaturalLanguageDatePicker({
  date,
  setDate,
  defaultValue,
}: NaturalLanguageDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue || formatDate(date) || "");
  const [month, setMonth] = useState<Date | undefined>(date);

  useEffect(() => {
    if (defaultValue && !date) {
      const parsedDate = parseDate(defaultValue);
      if (parsedDate) {
        setDate(parsedDate);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shouldShowDueText = () => {
    if (typeof value !== "string") return false;

    if (!date) return false;

    const lowercaseValue = value.toLowerCase().trim();

    // 1. Don't show for "today" or "tomorrow"
    if (lowercaseValue === "today" || lowercaseValue === "tomorrow") {
      return false;
    }

    // 2. Try to parse the value as a specific date
    const timestamp = Date.parse(value);

    // If timestamp is NOT NaN, it's a specific date (e.g., "11/29/2025")
    // We want to HIDE the text for specific dates, so return false.
    if (!isNaN(timestamp)) {
      return false;
    }

    // 3. If it's not "today", "tomorrow", or a specific date,
    // it must be a relative phrase (like "next 3 months"). Show the text.
    return true;
  };

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">
        Due Date
      </Label>
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={value}
          placeholder="Tomorrow or next week"
          className="bg-background pr-10"
          onChange={(e) => {
            setValue(e.target.value);
            const parsedDate = parseDate(e.target.value);
            if (parsedDate) {
              setDate(parsedDate);
              setMonth(parsedDate);
            } else {
              setDate(undefined);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                setDate(date);
                setValue(formatDate(date));
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      {shouldShowDueText() && (
        <div className="text-muted-foreground px-1 text-sm -mt-2">
          Due on <span className="font-medium">{formatDate(date)}</span>.
        </div>
      )}
    </div>
  );
}
