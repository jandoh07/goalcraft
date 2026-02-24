"use client";

import { TaskDateFilter } from "./task-date-filter";

interface TaskFiltersProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
}

export function TaskFilters({ selectedDate, onDateChange }: TaskFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <TaskDateFilter selectedDate={selectedDate} onDateChange={onDateChange} />
    </div>
  );
}
