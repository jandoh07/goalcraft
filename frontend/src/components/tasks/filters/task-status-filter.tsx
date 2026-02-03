"use client";

import { useState } from "react";
import { Filter, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TaskStatusFilterType } from "./task-filters";

interface TaskStatusFilterProps {
  statusFilter: TaskStatusFilterType;
  onStatusFilterChange: (status: TaskStatusFilterType) => void;
}

const STATUS_OPTIONS = [
  { value: "completed" as const, label: "Completed", icon: Check },
  { value: "archived" as const, label: "Archived", icon: X },
] as const;

export function TaskStatusFilter({
  statusFilter,
  onStatusFilterChange,
}: TaskStatusFilterProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: TaskStatusFilterType) => {
    if (statusFilter === value) {
      // Toggle off if already selected
      onStatusFilterChange(null);
    } else {
      onStatusFilterChange(value);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusFilterChange(null);
  };

  const activeOption = STATUS_OPTIONS.find((opt) => opt.value === statusFilter);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 text-xs",
            statusFilter && "bg-primary/10 border-primary/30",
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          {activeOption ? (
            <>
              <span>{activeOption.label}</span>
              <X
                className="h-3 w-3 ml-1 hover:text-destructive"
                onClick={handleClear}
              />
            </>
          ) : (
            <span className="hidden sm:inline">Filter</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground px-2 py-1 font-medium">
            Show Tasks
          </p>
          {STATUS_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = statusFilter === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{option.label}</span>
                {isActive && <Check className="h-3 w-3 ml-auto" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
