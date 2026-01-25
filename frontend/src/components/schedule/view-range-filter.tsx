"use client";

import { Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ViewRangeType, VIEW_RANGE_OPTIONS } from "@/hooks/use-view-range";

interface ViewRangeFilterProps {
  currentType: ViewRangeType;
  onTypeChange: (type: ViewRangeType) => void;
}

export function ViewRangeFilter({
  currentType,
  onTypeChange,
}: ViewRangeFilterProps) {
  const currentOption = VIEW_RANGE_OPTIONS.find(
    (opt) => opt.type === currentType,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-sm font-medium"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">{currentOption?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {VIEW_RANGE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.type}
            onClick={() => onTypeChange(option.type)}
            className={cn(
              "flex flex-col items-start gap-1 cursor-pointer",
              currentType === option.type && "bg-card",
            )}
          >
            <div className="flex items-center gap-2 w-full">
              <span className="font-medium">{option.label}</span>
              {currentType === option.type && (
                <Check className="h-4 w-4 ml-auto" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {option.description}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
