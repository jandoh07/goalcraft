import TaskGroupHeader from "./task-group-header";
import { cn } from "@/lib/utils";
import {DragDropProvider, DragEndEvent} from '@dnd-kit/react';
import { isSortableOperation } from '@dnd-kit/react/sortable';
import { generateKeyBetween } from 'fractional-indexing';
import { TaskCard } from "./task-card";
import { useBatchArchiveTasks, useUpdateTask } from "@/hooks/use-tasks";
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

  const updateTask = useUpdateTask();
  const handleDragEnd: DragEndEvent = (event) => {
    const { operation, canceled } = event;
    if (canceled || !isSortableOperation(operation)) return;

    const { source, target } = operation;
    if (!source || !target) return;

    const fromIndex = source.initialIndex;
    const toIndex = target.index;
    if (fromIndex === toIndex) return;

    const task = source.data?.task as Task | undefined;
    if (!task?.id) return;

    // Build the new sorted array with the item moved to its new position
    const reordered = [...sortedTasks];
    reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, task);

    const prevOrder = reordered[toIndex - 1]?.order ?? null;
    const nextOrder = reordered[toIndex + 1]?.order ?? null;

    const newOrder = generateKeyBetween(
      prevOrder ? String(prevOrder) : null,
      nextOrder ? String(nextOrder) : null,
    );

    console.log("Drag end:", { fromIndex, toIndex, task: task.title, prevOrder, nextOrder, newOrder });

    updateTask.mutate({ taskId: task.id, updates: { order: newOrder } });
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
      <DragDropProvider onDragEnd={handleDragEnd}>
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