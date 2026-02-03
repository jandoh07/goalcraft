"use client";

import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task } from "@/types";
import { SortableTaskCard } from "./sortable-task-card";
import TaskGroupHeader from "./task-group-header";
import { cn } from "@/lib/utils";

export type GroupKey =
  | "overdue"
  | "today"
  | "tomorrow"
  | "this-week"
  | "later"
  | "no-date";

interface GroupedTasks {
  overdue: Task[];
  today: Task[];
  tomorrow: Task[];
  "this-week": Task[];
  later: Task[];
  "no-date": Task[];
}

interface SortableTaskListProps {
  groupedTasks: GroupedTasks;
  onTaskClick: (task: Task) => void;
  isFetching?: boolean;
}

export function SortableTaskList({
  groupedTasks,
  onTaskClick,
  isFetching,
}: SortableTaskListProps) {
  const groups: { key: GroupKey; tasks: Task[] }[] = [
    { key: "overdue", tasks: groupedTasks.overdue },
    { key: "today", tasks: groupedTasks.today },
    { key: "tomorrow", tasks: groupedTasks.tomorrow },
    { key: "this-week", tasks: groupedTasks["this-week"] },
    { key: "later", tasks: groupedTasks.later },
    { key: "no-date", tasks: groupedTasks["no-date"] },
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
            groupKey={key}
            tasks={tasks}
            onTaskClick={onTaskClick}
            showLoading={showLoading}
          />
        );
      })}
    </div>
  );
}

interface SortableTaskGroupProps {
  groupKey: GroupKey;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  showLoading?: boolean;
}

function SortableTaskGroup({
  groupKey,
  tasks,
  onTaskClick,
  showLoading,
}: SortableTaskGroupProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `group-${groupKey}`,
    data: { type: "group", group: groupKey },
  });

  const taskIds = useMemo(() => tasks.map((t) => `task-${t.id}`), [tasks]);

  // Sort tasks by order within each group
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [tasks]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-colors rounded-lg",
        isOver && "bg-primary/5 ring-2 ring-primary/20",
      )}
    >
      <TaskGroupHeader
        group={groupKey}
        count={tasks.length}
        showLoading={showLoading}
      />
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 pb-2">
          {sortedTasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              showQuadrantBadges={true}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
