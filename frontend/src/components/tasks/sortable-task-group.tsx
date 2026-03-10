import TaskGroupHeader from "./task-group-header";
import { cn } from "@/lib/utils";
import { TaskCard } from "./task-card";
import { useBatchArchiveTasks } from "@/hooks/use-tasks";
import { useCallback, useMemo } from "react";
import { Task, TaskGroup } from "@/types";



interface SortableTaskGroupProps {
  groupKey: TaskGroup;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  showLoading?: boolean;
}

export function SortableTaskGroup({
  groupKey,
  tasks,
  onTaskClick,
  showLoading,
}: SortableTaskGroupProps) {

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const orderA = a.order;
      const orderB = b.order;

      if (orderA == null && orderB == null) return 0;
      if (orderA == null) return 1;
      if (orderB == null) return -1;

      if (typeof orderA === "number" && typeof orderB === "number") {
        return orderA - orderB;
      }

      const strA = String(orderA);
      const strB = String(orderB);
      if (strA < strB) return -1;
      if (strA > strB) return 1;
      return 0;
    });
  }, [tasks]);

  const batchArchive = useBatchArchiveTasks();
  const handleArchiveOverdue = useCallback(() => {
    if (groupKey === "overdue") return;
    const overdueIds = sortedTasks
      .map((t) => t.id)
      .filter((id): id is string => !!id);
    if (overdueIds.length > 0) {
      batchArchive.mutate(overdueIds);
    }
  }, [batchArchive, groupKey, sortedTasks]);

  return (
    <div
      className={cn(
        "transition-colors rounded-lg",
        groupKey !== "overdue"
      )}
    >
      <TaskGroupHeader
        group={groupKey}
        count={tasks.length}
        showLoading={showLoading}
        onArchiveAll={handleArchiveOverdue}
        isArchiving={batchArchive.isPending}
      />
      <div className="space-y-2 pb-2">
          {sortedTasks.map((task, index) => (
            <TaskCard
              key={task.id}
              index={index}
              group={groupKey}
              task={task}
              onClick={() => onTaskClick(task)}
              showQuadrantBadges={true}
            />
          ))}
        </div>
    </div>
  );
}