"use client";

import { TaskDateFilter } from "./task-date-filter";
import { TaskStatusFilter } from "./task-status-filter";

export type TaskStatusFilterType = "completed" | "archived" | null;

interface TaskFiltersProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  statusFilter: TaskStatusFilterType;
  onStatusFilterChange: (status: TaskStatusFilterType) => void;
}

export function TaskFilters({
  selectedDate,
  onDateChange,
  statusFilter,
  onStatusFilterChange,
}: TaskFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <TaskDateFilter selectedDate={selectedDate} onDateChange={onDateChange} />
      <TaskStatusFilter
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
      />
    </div>
  );
}
