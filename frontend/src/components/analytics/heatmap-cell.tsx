"use client";

import React, { useCallback } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, getShortMonthName } from "@/lib/utils/analytics";

export interface DayData {
  date: Date;
  day: number;
  month: number;
  year: number;
  isToday: boolean;
  isFuture: boolean;
}

interface HeatmapCellProps {
  dayData: DayData;
  count: number;
  maxCount: number;
  showMonthLabel: boolean;
}

export const HeatmapCell: React.FC<HeatmapCellProps> = ({
  dayData,
  count,
  maxCount,
  showMonthLabel,
}) => {
  const { date, day, isToday, isFuture } = dayData;

  const getIntensityClass = useCallback((): string => {
    if (isFuture) return "bg-muted/20";
    if (count === 0) return "bg-muted/50";

    const ratio = count / Math.max(maxCount, 1);
    if (ratio <= 0.25) return "bg-emerald-200 dark:bg-emerald-900/70";
    if (ratio <= 0.5) return "bg-emerald-300 dark:bg-emerald-800";
    if (ratio <= 0.75) return "bg-emerald-400 dark:bg-emerald-600";
    return "bg-emerald-500 dark:bg-emerald-500";
  }, [count, maxCount, isFuture]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`
            aspect-square rounded-sm flex items-center justify-center text-xs font-medium
            transition-all cursor-pointer hover:ring-1 hover:ring-primary relative h-6 w-7
            ${getIntensityClass()}
            ${isFuture ? "text-muted-foreground/30" : "text-foreground"}
            ${count > 0 && !isFuture ? "text-emerald-900 dark:text-emerald-100" : ""}
          `}
        >
          {showMonthLabel && (
            <span
              className={`absolute -top-5 -left-2 text-sm text-muted-foreground font-semibold whitespace-nowrap`}
            >
              {getShortMonthName(date)}
            </span>
          )}
          {day}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-semibold">{formatDate(date)}</p>
        {!isFuture && (
          <p>
            {count} task{count !== 1 ? "s" : ""} completed
          </p>
        )}
        {isFuture && <p className="text-muted-foreground">Future date</p>}
      </TooltipContent>
    </Tooltip>
  );
};
