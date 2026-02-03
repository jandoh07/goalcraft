"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TaskDateFilterProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
}

export function TaskDateFilter({
  selectedDate,
  onDateChange,
}: TaskDateFilterProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    onDateChange(date ?? null);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 text-xs",
            selectedDate && "bg-primary/10 border-primary/30",
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          {selectedDate ? (
            <>
              <span className="hidden sm:inline">
                {format(selectedDate, "MMM d, yyyy")}
              </span>
              <span className="sm:hidden">{format(selectedDate, "M/d")}</span>
              <X
                className="h-3 w-3 ml-1 hover:text-destructive"
                onClick={handleClear}
              />
            </>
          ) : (
            <span className="hidden sm:inline">Filter by Date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate ?? undefined}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
