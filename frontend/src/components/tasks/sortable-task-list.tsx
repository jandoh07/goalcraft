"use client";

import { TaskGroup, Task } from "@/types";
import { SortableTaskGroup } from "./sortable-task-group";
import { useMemo } from "react";

interface GroupedTasks {
  overdue: Task[];
  today: Task[];
  tomorrow: Task[];
  upcoming: Task[];
  "no-date": Task[];
  completed: Task[];
}

interface SortableTaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  isFetching?: boolean;
}

export function SortableTaskList({
  onTaskClick,
  isFetching,
  tasks
}: SortableTaskListProps) {
  const groupTasksByDate = (tasks: Task[]): GroupedTasks => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    const grouped: GroupedTasks = {
      overdue: [],
      today: [],
      tomorrow: [],
      upcoming: [],
      "no-date": [],
      completed: [],
    };
  
    tasks.forEach((task) => {
      if (task.status === "completed") {
        grouped.completed.push(task);
        return;
      }
  
      // Handle tasks without due dates
      if (!task.dueDate) {
        grouped["no-date"].push(task);
        return;
      }
  
      const dueDate = new Date(task.dueDate);
      const dueDateOnly = new Date(
        dueDate.getFullYear(),
        dueDate.getMonth(),
        dueDate.getDate(),
      );
  
      if (dueDateOnly < today) {
        grouped.overdue.push(task);
      } else if (dueDateOnly.getTime() === today.getTime()) {
        grouped.today.push(task);
      } else if (dueDateOnly.getTime() === tomorrow.getTime()) {
        grouped.tomorrow.push(task);
      } else {
        grouped.upcoming.push(task);
      }
    });
  
    return grouped;
  };

  const groupedTasks = useMemo(() => {
    if (!tasks) return null;
    return groupTasksByDate(tasks);
  }, [tasks]); 

  const groups = [
    { key: "overdue", tasks: groupedTasks?.overdue || [] },
    { key: "today", tasks: groupedTasks?.today || [] },
    { key: "tomorrow", tasks: groupedTasks?.tomorrow || [] },
    { key: "upcoming", tasks: groupedTasks?.upcoming || [] },
    { key: "no-date", tasks: groupedTasks?.["no-date"] || [] },
    { key: "completed", tasks: groupedTasks?.completed || [] },
  ];

  let hasShownLoading = false;

  return (
    <div className="space-y-2">
      {groups.map(({ key, tasks }) => {
        if (!tasks || tasks.length === 0) return null;

        const showLoading = isFetching && !hasShownLoading && tasks.length > 0;
        if (showLoading) hasShownLoading = true;

        return (
          <SortableTaskGroup
            key={key}
            groupKey={key as TaskGroup}
            tasks={tasks}
            onTaskClick={onTaskClick}
            showLoading={showLoading}
          />
        );
      })}
    </div>
  );
}


