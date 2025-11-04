"use client";

import { cn } from "@/lib/utils";
import React from "react";

const filterItems = [
  { label: "All Goals", value: "all" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
  { label: "Overdue", value: "overdue" },
] as const;

const GoalsHeader = ({
  className,
  goalFilter,
  setGoalFilter,
}: {
  className?: string;
  goalFilter: "all" | "in-progress" | "completed" | "overdue";
  setGoalFilter: React.Dispatch<
    React.SetStateAction<"all" | "in-progress" | "completed" | "overdue">
  >;
}) => {
  return (
    <div
      className={cn(
        "mb-4 mt-4 md:mt-0 flex items-center justify-between",
        className
      )}
    >
      <div className="hidden md:flex justify-between items-center">
        <p className="md:text-lg font-semibold mr-8">Your Goals</p>
        <div className="space-x-2"></div>
      </div>
      <div>
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex space-x-2 pb-2 min-w-max">
            {filterItems.map((item) => (
              <div
                key={item.value}
                onClick={() => setGoalFilter(item.value)}
                className={`rounded-3xl shrink-0 px-3 py-1 text-sm border border-border cursor-pointer ${
                  goalFilter === item.value
                    ? "bg-accent text-accent-foreground hover:bg-accent/70"
                    : "hover:bg-secondary"
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsHeader;
