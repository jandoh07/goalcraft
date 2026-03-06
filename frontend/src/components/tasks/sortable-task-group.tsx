import TaskGroupHeader from "./task-group-header";
import { cn } from "@/lib/utils";
import {DragDropProvider, DragEndEvent} from '@dnd-kit/react';
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


  // Sort tasks by order within each group (string comparison for fractional indexing)
  // Handle both string and legacy number orders during migration
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const orderA = a.order;
      const orderB = b.order;

      // Handle undefined/null orders - put them at the end
      if (orderA == null && orderB == null) return 0;
      if (orderA == null) return 1;
      if (orderB == null) return -1;

      // If both are numbers (legacy), compare numerically
      if (typeof orderA === "number" && typeof orderB === "number") {
        return orderA - orderB;
      }

      // Convert to strings for comparison
      const strA = String(orderA);
      const strB = String(orderB);
      return strA.localeCompare(strB);
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

  const handleDragEnd = (event: DragEndEvent) => {

  }

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
      <DragDropProvider onDragEnd={(event) => handleDragEnd(event)}>
        <div className="space-y-2 pb-2">
          {sortedTasks.map((task, index) => (
            <TaskCard
              key={task.id}
              index={index}
              task={task}
              onClick={() => onTaskClick(task)}
              showQuadrantBadges={true}
            />
          ))}
        </div>
      </DragDropProvider>
    </div>
  );
}