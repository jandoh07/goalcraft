"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
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
  isFetching,
}: {
  className?: string;
  goalFilter: "all" | "in-progress" | "completed" | "overdue";
  setGoalFilter: React.Dispatch<
    React.SetStateAction<"all" | "in-progress" | "completed" | "overdue">
  >;
  isFetching?: boolean;
}) => {
  const LoadingIndicator = () =>
    isFetching ? (
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
    ) : null;

  return (
    <div
      className={cn(
        "mb-4 mt-4 md:mt-0 flex items-center justify-between overflow-x-hidden",
        className,
      )}
    >
      <div className="hidden md:flex justify-between items-center">
        <p className="md:text-lg font-semibold mr-8">Your Goals</p>
        <div className="space-x-2"></div>
      </div>
      <div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Mobile: Loading indicator at the beginning */}
          <div className="md:hidden">
            <LoadingIndicator />
          </div>
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
          {/* Desktop: Loading indicator at the end */}
          <div className="hidden md:block">
            <LoadingIndicator />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsHeader;
