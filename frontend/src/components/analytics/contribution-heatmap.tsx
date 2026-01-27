"use client";

import React, { useMemo } from "react";
import { ContributionData, ContributionHeatmapProps } from "@/types";
import {
  getDateKey,
  startOfDay,
  DUMMY_CONTRIBUTION_DATA,
  generateHeatmapWeeks,
} from "@/lib/utils/analytics";
import { HeatmapCell } from "./heatmap-cell";

export const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({
  tasks,
  useDummyData = true,
  year,
}) => {
  const today = startOfDay(new Date());

  // Calculate start and end dates for the year inside useMemo to avoid dependency issues
  const weeks = useMemo(() => {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    return generateHeatmapWeeks(yearStart, yearEnd, today);
  }, [year, today]);

  const contributionData = useMemo(() => {
    if (useDummyData) {
      return DUMMY_CONTRIBUTION_DATA;
    }

    const data: ContributionData = {};
    tasks.forEach((task) => {
      if (task.status === "completed" && task.updatedAt) {
        const dateKey = getDateKey(new Date(task.updatedAt));
        data[dateKey] = (data[dateKey] || 0) + 1;
      }
    });
    return data;
  }, [tasks, useDummyData]);

  const maxCount = useMemo(() => {
    return Math.max(...Object.values(contributionData), 1);
  }, [contributionData]);

  const daysLeftInYear = useMemo(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Only calculate for current year
    if (year !== currentYear) {
      return null;
    }

    const endOfYear = new Date(year, 11, 31); // December 31st
    const diffTime = endOfYear.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }, [year]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full">
      <div className="overflow-x-auto no-scrollbar hover:scrollbar">
        <div className="min-w-fit">
          <div className="flex gap-0.5 py-1 pr-1">
            {/* Day labels */}
            <div className="flex flex-col justify-between gap-0.5 pt-5 sticky left-0 bg-card z-10">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="h-5 w-7 text-[10px] text-muted-foreground flex items-center justify-center"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Continuous calendar grid - weeks as columns */}
            <div className="flex gap-0.5 pt-5 pl-1">
              {weeks.map((week, weekIdx) => {
                return (
                  <div key={weekIdx} className="flex flex-col gap-0.5">
                    {week.map((dayData, dayIdx) => {
                      const dateKey = getDateKey(dayData.date);
                      const count =
                        (contributionData as Record<string, number>)[dateKey] ||
                        0;

                      let showMonthLabel = false;

                      if (dayIdx === 0) {
                        if (dayData.day === 1) {
                          showMonthLabel = true;
                        } else if (dayData.day <= 7) {
                          showMonthLabel = true;
                        }
                      }

                      return (
                        <HeatmapCell
                          key={dateKey}
                          dayData={dayData}
                          count={count}
                          maxCount={maxCount}
                          showMonthLabel={showMonthLabel}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-3">
        <div>
          {daysLeftInYear !== null && (
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {daysLeftInYear}
              </span>{" "}
              days left in {year}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted/50" />
            <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/70" />
            <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-800" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-600" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-500" />
          </div>
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  );
};
