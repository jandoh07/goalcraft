"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TaskViewMode = "list" | "matrix";

interface TaskViewToggleProps {
  mode: TaskViewMode;
  onModeChange: (mode: TaskViewMode) => void;
}

export function TaskViewToggle({ mode, onModeChange }: TaskViewToggleProps) {
  return (
    <div className={cn("flex justify-end md:justify-start my-3 md:my-0")}>
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-21 md:w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onModeChange("list")}
          className={cn(
            "h-7 px-2 gap-1.5",
            mode === "list" && "bg-background shadow-sm",
          )}
        >
          <List className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">List</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onModeChange("matrix")}
          className={cn(
            "h-7 px-2 gap-1.5",
            mode === "matrix" && "bg-background shadow-sm",
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Matrix</span>
        </Button>
      </div>
    </div>
  );
}
