"use client";

import { TaskGroup, Task } from "@/types";
import TaskGroupHeader from "./task-group-header";
import { TaskCard } from "./task-card";
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { DragDropProvider, DragEndEvent } from "@dnd-kit/react";
import { isSortableOperation } from "@dnd-kit/react/sortable";
import { sortByOrder, computeOrderForIndex, computeGroupFromIndex } from "@/lib/utils/task-order";
import { useUpdateTask } from "@/hooks/use-tasks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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

interface PendingDrop {
  task: Task;
  toGroup: TaskGroup;
  toIndex: number;
  targetGroupTasks: Task[]; // sorted tasks in the target group, without the dragged task
}

function groupTasksByDate(tasks: Task[]): GroupedTasks {
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
}

function resolvedDueDate(group: TaskGroup): Date | null | undefined {
  if (group === "no-date") return null;
  if (group === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (group === "tomorrow") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d;
  }
  // "overdue" and "upcoming" need user input — return undefined as signal
  return undefined;
}

function groupLabel(group: TaskGroup): string {
  const labels: Record<TaskGroup, string> = {
    overdue: "Overdue",
    today: "Today",
    tomorrow: "Tomorrow",
    upcoming: "Upcoming",
    "no-date": "No date",
    completed: "Completed",
  };
  return labels[group];
}

function resolveGroupByCoordinates(
  pointerY: number,
  headerRefs: Map<TaskGroup, HTMLElement>,
  groupOrder: TaskGroup[],
): TaskGroup | undefined {
  let resolved: TaskGroup | undefined;
  for (const group of groupOrder) {
    const el = headerRefs.get(group);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    // First visible group is the default (pointer above all headers)
    if (resolved === undefined) resolved = group;
    if (rect.top <= pointerY) {
      resolved = group;
    } else {
      break;
    }
  }
  return resolved;
}

const GROUP_ORDER: TaskGroup[] = ["overdue", "today", "tomorrow", "upcoming", "no-date"];

export function SortableTaskList({
  onTaskClick,
  isFetching,
  tasks,
}: SortableTaskListProps) {
  const updateTask = useUpdateTask();
  const isMobile = useIsMobile();
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);
  const [pickedDate, setPickedDate] = useState<Date | undefined>(undefined);
  const [resetKey, setResetKey] = useState(0);

  const groupedTasks = useMemo(() => groupTasksByDate(tasks), [tasks]);
  const headerRefsMap = useRef(new Map<TaskGroup, HTMLElement>());

  const flatTasks = useMemo(() =>
    GROUP_ORDER.flatMap((group) =>
      sortByOrder(groupedTasks[group]).map((task) => ({ task, group }))
    ),
    [groupedTasks]
  );

  const commitDrop = useCallback(
    (drop: PendingDrop, dueDate: Date | null) => {
      if (!drop.task.id) return;
      const newOrder = computeOrderForIndex(drop.targetGroupTasks, drop.toIndex);
      updateTask.mutate({
        taskId: drop.task.id,
        updates: { order: newOrder, dueDate },
      });
    },
    [updateTask],
  );

  const handleDragEnd: DragEndEvent = useCallback(
    (event) => {
      const { operation, canceled } = event;
      if (canceled || !isSortableOperation(operation)) return;

      const { source, target } = operation;
      if (!source || !target) return;

      const fromFlatIndex = source.initialIndex;
      const toFlatIndex = source.index;

      const fromGroup = source.data?.group as TaskGroup | undefined;
      const pointerY = event.operation.position?.current?.y;
      let toGroup: TaskGroup | undefined;

      if (pointerY != null) {
        toGroup = resolveGroupByCoordinates(pointerY, headerRefsMap.current, GROUP_ORDER);
      }

      if (!toGroup) {
        toGroup = computeGroupFromIndex(toFlatIndex, flatTasks);
      }

      if (!fromGroup || !toGroup) return;

      if (fromGroup === toGroup && fromFlatIndex === toFlatIndex) return;

      const task = source.data?.task as Task | undefined;
      if (!task?.id) return;

      const reordered = [...flatTasks];
      const [moved] = reordered.splice(fromFlatIndex, 1);
      reordered.splice(toFlatIndex, 0, { ...moved, group: toGroup });

      const sameGroupItems = reordered.filter((item) => item.group === toGroup);
      const posInGroup = sameGroupItems.findIndex((item) => item.task.id === task.id);
      const targetGroupTasks = sameGroupItems
        .filter((item) => item.task.id !== task.id)
        .map((item) => item.task);
      const toIndex = posInGroup;

      if (fromGroup === toGroup) {
        commitDrop({ task, toGroup, toIndex, targetGroupTasks }, task.dueDate ? new Date(task.dueDate) : null);
        return;
      }

      const dueDate = resolvedDueDate(toGroup);
      if (dueDate === undefined) {
        setPickedDate(undefined);
        setPendingDrop({ task, toGroup, toIndex, targetGroupTasks });
        return;
      }

      commitDrop({ task, toGroup, toIndex, targetGroupTasks }, dueDate);
    },
    [flatTasks, commitDrop],
  );

  const handleConfirmDrop = useCallback(() => {
    if (!pendingDrop || !pickedDate) return;
    commitDrop(pendingDrop, pickedDate);
    setPendingDrop(null);
    setPickedDate(undefined);
  }, [pendingDrop, pickedDate, commitDrop]);

  const handleCancelDrop = useCallback(() => {
    setPendingDrop(null);
    setPickedDate(undefined);
    setResetKey((k) => k + 1);
  }, []);

  let hasShownLoading = false;

  const dialogTitle = pendingDrop
    ? `Move to ${groupLabel(pendingDrop.toGroup)}`
    : "";
  const dialogDescription = pendingDrop
    ? `Pick a date for "${pendingDrop.task.title}"`
    : "";
  const calendarDisabled =
    pendingDrop?.toGroup === "overdue"
      ? (d: Date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return d >= today;
        }
      : pendingDrop?.toGroup === "upcoming"
        ? (d: Date) => {
            const dayAfterTomorrow = new Date();
            dayAfterTomorrow.setHours(0, 0, 0, 0);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
            return d < dayAfterTomorrow;
          }
        : undefined;

  const confirmContent = (
    <>
      <Calendar
        mode="single"
        selected={pickedDate}
        onSelect={setPickedDate}
        disabled={calendarDisabled}
        className="mx-auto"
      />
    </>
  );

  const confirmFooter = (
    <div className="flex gap-2 justify-end">
      <Button variant="outline" onClick={handleCancelDrop}>
        Cancel
      </Button>
      <Button onClick={handleConfirmDrop} disabled={!pickedDate}>
        Move task
      </Button>
    </div>
  );

  return (
    <>
      <DragDropProvider key={resetKey} onDragEnd={handleDragEnd}  >
        <div className="space-y-2">
          {flatTasks.flatMap(({ task, group }, flatIndex) => {
            const prevGroup = flatIndex > 0 ? flatTasks[flatIndex - 1].group : null;
            const showHeader = group !== prevGroup;
            const showLoading = isFetching && showHeader && !hasShownLoading;
            if (showLoading) hasShownLoading = true;

            const items: ReactNode[] = [];
            if (showHeader) {
              items.push(
                <div
                  key={`header-${group}`}
                  ref={(el) => {
                    if (el) headerRefsMap.current.set(group, el);
                    else headerRefsMap.current.delete(group);
                  }}
                >
                  <TaskGroupHeader
                    group={group}
                    count={groupedTasks[group].length}
                    showLoading={showLoading}
                  />
                </div>
              );
            }
            items.push(
              <TaskCard
                key={task.id}
                task={task}
                index={flatIndex}
                group={group}
                groupStart={showHeader}
                onClick={() => onTaskClick(task)}
                showQuadrantBadges
              />
            );
            return items;
          })}
        </div>

        {/* Completed tasks — non-draggable, rendered separately */}
        {groupedTasks.completed.length > 0 && (
          <div className="space-y-2 mt-2">
            <TaskGroupHeader
              group="completed"
              count={groupedTasks.completed.length}
            />
            {sortByOrder(groupedTasks.completed).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                index={-1}
                group="completed"
                onClick={() => onTaskClick(task)}
                showQuadrantBadges
              />
            ))}
          </div>
        )}
      </DragDropProvider>

      {isMobile ? (
        <Drawer
          open={!!pendingDrop}
          onOpenChange={(open) => !open && handleCancelDrop()}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{dialogTitle}</DrawerTitle>
              <DrawerDescription>{dialogDescription}</DrawerDescription>
            </DrawerHeader>
            <div className="px-4">{confirmContent}</div>
            <DrawerFooter>{confirmFooter}</DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          open={!!pendingDrop}
          onOpenChange={(open) => !open && handleCancelDrop()}
        >
          <DialogContent className="w-auto">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>{dialogDescription}</DialogDescription>
            </DialogHeader>
            {confirmContent}
            <DialogFooter>{confirmFooter}</DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}



