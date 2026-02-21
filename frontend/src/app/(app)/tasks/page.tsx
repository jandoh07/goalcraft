"use client";

import MobileHeader from "@/components/layout/mobile/header";
import AddButton from "@/components/ui/add-button";
import ResponsiveDialog from "@/components/ui/responsive-dialog";
import { Loader2 } from "lucide-react";
import { useState, useMemo, Suspense, useCallback } from "react";
import TaskForm from "@/components/tasks/task-form/task-form";
import {
  useGetTasks,
  useUpdateTask,
  useBatchArchiveTasks,
  useGetTasksByStatus,
} from "@/hooks/use-tasks";
import { useTaskDialog } from "@/hooks/use-task-dialog";
import { useAuth } from "@/contexts/auth-context";
import useTasksForm from "@/hooks/use-tasks-form";
import {
  groupTasksByDate,
  getDateForGroup,
  TaskGroup,
} from "@/lib/utils/task-grouping";
import TaskDetails from "@/components/tasks/task-details/task-details";
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
import { TaskSortableOverlay } from "@/components/tasks/sortable-task-card";
import { TaskFilters, TaskStatusFilterType } from "@/components/tasks/filters";
import { FilteredTasksList } from "@/components/tasks/filtered-tasks-list";
import { isSameDay } from "date-fns";
import { generateKeyBetween } from "fractional-indexing";

const TasksContent = () => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilterType>(null);

  const { user } = useAuth();
  const tasks = useGetTasks(user?.uid || "");
  const updateTask = useUpdateTask();
  const batchArchive = useBatchArchiveTasks();
  const filteredTasks = useGetTasksByStatus(user?.uid || "", statusFilter);

  const taskDialog = useTaskDialog();
  const taskForm = useTasksForm({
    initialData: taskDialog.activeTask,
    mode: taskDialog.activeTask ? "edit" : "add",
    openDialog: (open) => taskDialog.handleClose(open),
  });

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

  // Flatten paginated filtered tasks
  const flatFilteredTasks = useMemo(() => {
    if (!filteredTasks.data?.pages) return [];
    return filteredTasks.data.pages.flat();
  }, [filteredTasks.data?.pages]);

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
        {/* Header */}
        <div className="md:flex items-center justify-between mb-3">
          <div>
            <p className="hidden md:block text-lg font-semibold">My Tasks</p>
            <MobileHeader title="My Tasks" />
          </div>
          <div className="hidden md:flex items-center gap-2">
            <TaskFilters
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </div>
        </div>

        {/* Loading state */}
        {!isFullyLoaded ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Mobile controls */}
            <div className="md:hidden flex items-center justify-end gap-2 mb-2">
              <TaskFilters
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />
            </div>

            <div className="flex-1 mb-13 md:mb-5 overflow-auto">
              {/* Show filtered tasks when status filter is active */}
              {statusFilter ? (
                <FilteredTasksList
                  tasks={flatFilteredTasks}
                  statusFilter={statusFilter}
                  onTaskClick={taskDialog.handleTaskClick}
                  hasNextPage={!!filteredTasks.hasNextPage}
                  isFetchingNextPage={filteredTasks.isFetchingNextPage}
                  onLoadMore={() => filteredTasks.fetchNextPage()}
                  isLoading={filteredTasks.isLoading}
                />
              ) : activeTasks.length === 0 ? (
                <div className="text-center text-muted-foreground mt-10">
                  <p className="mb-2">
                    {selectedDate
                      ? "No tasks for this date."
                      : "No tasks found."}
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

            <AddButton onClick={taskDialog.handleAddNew} />

            <ResponsiveDialog
              open={taskDialog.open}
              setOpen={taskDialog.handleClose}
              title={taskDialog.getTitle()}
              description={taskDialog.getDescription()}
              submitLabel={taskDialog.getSubmitLabel()}
              onSubmit={taskDialog.handleExternalFormSubmit}
              isSubmitting={taskForm.mutation.isPending}
              hideSubmitButton={taskDialog.hideSubmitButton()}
              backIconAction={
                taskDialog.mode === "edit"
                  ? () => taskDialog.setMode("view")
                  : undefined
              }
            >
              {taskDialog.mode === "view" ? (
                <TaskDetails
                  setMode={taskDialog.setMode}
                  task={taskDialog.activeTask}
                  setDialogOpen={(open) => {
                    const value =
                      typeof open === "function" ? open(taskDialog.open) : open;
                    taskDialog.handleClose(value);
                  }}
                />
              ) : (
                <TaskForm taskForm={taskForm} />
              )}
            </ResponsiveDialog>
          </>
        )}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTask ? <TaskSortableOverlay task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

const Tasks = () => {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <TasksContent />
    </Suspense>
  );
};

export default Tasks;
