"use client";

import MobileHeader from "@/components/layout/mobile/header";
import AddTaskButtonMobile from "@/components/ui/add-button";
import { Loader2 } from "lucide-react";
import { useState, useMemo, Suspense, useCallback } from "react";
import TaskForm from "@/components/tasks/task-form/task-form";
import TaskEditDialog from "@/components/tasks/task-form/task-edit-dialog";
import {
  useGetTasks,
  useUpdateTask,
  useBatchArchiveTasks,
} from "@/hooks/use-tasks";
import { useTaskDialog } from "@/hooks/use-task-dialog";
import { useAuth } from "@/contexts/auth-context";
import {
  groupTasksByDate,
  getDateForGroup,
  TaskGroup,
} from "@/lib/utils/task-grouping";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { Task } from "@/types";
import { SortableTaskList } from "@/components/tasks/sortable-task-list";
import { SortableTaskCard } from "@/components/tasks/sortable-task-card";
import { isSameDay } from "date-fns";
import { generateKeyBetween } from "fractional-indexing";
import DateStrip from "@/components/tasks/date-strip";
import { TaskFilters } from "@/components/tasks/filters/task-filters";
import AddTaskDesktop from "@/components/tasks/add-task-desktop";

const InboxContent = () => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { user } = useAuth();
  const tasks = useGetTasks(user?.uid || "");
  const updateTask = useUpdateTask();
  const batchArchive = useBatchArchiveTasks();

  const taskDialog = useTaskDialog();
  const isMobile = useIsMobile();

  // DnD sensors
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const isFullyLoaded = !tasks.isLoading;

  // Filter out completed and archived tasks for display
  const activeTasks = useMemo(() => {
    if (!tasks.data) return [];
    let filtered = tasks.data.filter(
      (t) => t.status !== "completed" && t.status !== "archived",
    );

    // Apply date filter if selected
    if (selectedDate) {
      filtered = filtered.filter((t) => {
        if (!t.dueDate) return false;
        return isSameDay(new Date(t.dueDate), selectedDate);
      });
    }

    return filtered;
  }, [tasks.data, selectedDate]);

  const groupedTasks = useMemo(() => {
    if (!activeTasks) return null;
    return groupTasksByDate(activeTasks);
  }, [activeTasks]);

  // Handler for archiving all overdue tasks
  const handleArchiveOverdue = useCallback(() => {
    if (!groupedTasks?.overdue.length) return;
    const overdueIds = groupedTasks.overdue
      .map((t) => t.id)
      .filter((id): id is string => !!id);
    if (overdueIds.length > 0) {
      batchArchive.mutate(overdueIds);
    }
  }, [groupedTasks?.overdue, batchArchive]);

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "task") {
      setActiveTask(active.data.current.task);
    }
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over || !user?.uid || !tasks.data || !groupedTasks) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Extract task ID from sortable ID (e.g., "task-abc123" -> "abc123")
      const activeTaskId = activeId.replace("task-", "");
      const task = tasks.data.find((t) => t.id === activeTaskId);
      if (!task) return;

      // Determine source group from task's current date
      const getTaskGroup = (t: Task): TaskGroup => {
        if (!t.dueDate) return "no-date";
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));

        const dueDate = new Date(t.dueDate);
        const dueDateOnly = new Date(
          dueDate.getFullYear(),
          dueDate.getMonth(),
          dueDate.getDate(),
        );

        if (dueDateOnly < today) return "overdue";
        if (dueDateOnly.getTime() === today.getTime()) return "today";
        if (dueDateOnly.getTime() === tomorrow.getTime()) return "tomorrow";
        if (dueDateOnly <= endOfWeek) return "this-week";
        return "later";
      };

      const sourceGroup = getTaskGroup(task);

      // Handle dropping on a group
      if (over.data.current?.type === "group") {
        const targetGroup = over.data.current.group as TaskGroup;

        // Prevent dropping into overdue
        if (targetGroup === "overdue") return;

        // If same group, no action needed
        if (sourceGroup === targetGroup) return;

        // Get new date for the target group
        const newDate = getDateForGroup(targetGroup);

        // Get tasks in target group sorted by order
        const targetTasks = groupedTasks[targetGroup]
          .slice()
          .sort((a, b) => (a.order ?? "").localeCompare(b.order ?? ""));

        // Generate order for end of list
        const lastOrder =
          targetTasks.length > 0
            ? targetTasks[targetTasks.length - 1].order
            : null;
        const newOrder = generateKeyBetween(lastOrder ?? null, null);

        updateTask.mutate({
          taskId: activeTaskId,
          updates: { dueDate: newDate, order: newOrder },
        });
        return;
      }

      // Handle dropping on another task
      if (overId.startsWith("task-")) {
        const overTaskId = overId.replace("task-", "");
        const overTask = tasks.data.find((t) => t.id === overTaskId);
        if (!overTask || overTaskId === activeTaskId) return;

        const targetGroup = getTaskGroup(overTask);

        // Prevent dropping into overdue
        if (targetGroup === "overdue") return;

        // Get tasks in target group sorted by order
        const targetTasks = groupedTasks[targetGroup]
          .slice()
          .sort((a, b) => (a.order ?? "").localeCompare(b.order ?? ""));

        // Find the index where we're dropping
        const overIndex = targetTasks.findIndex((t) => t.id === overTaskId);
        if (overIndex === -1) return;

        // Calculate the new fractional order
        const prevOrder =
          overIndex > 0 ? targetTasks[overIndex - 1].order : null;
        const nextOrder = targetTasks[overIndex].order ?? null;
        const newOrder = generateKeyBetween(prevOrder ?? null, nextOrder);

        // Prepare updates
        const updates: Partial<Task> = { order: newOrder };

        // If moving to a different group, also update the date
        if (sourceGroup !== targetGroup) {
          updates.dueDate = getDateForGroup(targetGroup);
        }

        updateTask.mutate({
          taskId: activeTaskId,
          updates,
        });
      }
    },
    [tasks.data, user?.uid, updateTask, groupedTasks],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-7xl h-full mx-auto p-3 relative flex flex-col">
        <div className="md:flex items-center justify-between mb-3">
          <div>
            <p className="hidden md:block text-lg font-semibold">Inbox</p>
            <MobileHeader title="Inbox" />
          </div>
          <div className="hidden md:flex items-center gap-2">
            <TaskFilters
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
          <DateStrip
            className="md:hidden"
            selectedDate={selectedDate}
            onDateSelect={() => {}}
          />
        </div>

        {!isFullyLoaded ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex-1 mb-13 md:mb-5 overflow-auto">
              <AddTaskDesktop />
              {activeTasks.length === 0 ? (
                <div className="text-center text-muted-foreground mt-10">
                  <p className="mb-2">
                    {selectedDate
                      ? "No tasks for this date."
                      : "No tasks yet. Add your first task!"}
                  </p>
                </div>
              ) : groupedTasks ? (
                <SortableTaskList
                  groupedTasks={groupedTasks}
                  onTaskClick={taskDialog.handleTaskClick}
                  isFetching={tasks.isFetching}
                  onArchiveOverdue={handleArchiveOverdue}
                  isArchivingOverdue={batchArchive.isPending}
                />
              ) : null}
            </div>

            <AddTaskButtonMobile
              className="md:hidden"
              onClick={taskDialog.handleAddNew}
            />

            {/* Mobile: Drawer-based form for add & edit */}
            <TaskForm
              open={taskDialog.open && isMobile}
              setOpen={taskDialog.handleClose}
              task={taskDialog.activeTask}
              mode={taskDialog.mode as "add" | "view"}
            />

            {/* Desktop: Dialog for editing existing tasks */}
            <TaskEditDialog
              task={taskDialog.activeTask}
              open={taskDialog.open && !isMobile && taskDialog.mode === "view"}
              onClose={() => taskDialog.handleClose(false)}
            />
          </>
        )}
      </div>

      <DragOverlay>
        {activeTask ? <SortableTaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

const Inbox = () => {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <InboxContent />
    </Suspense>
  );
};

export default Inbox;
