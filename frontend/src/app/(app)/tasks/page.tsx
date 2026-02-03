"use client";

import MobileHeader from "@/components/layout/mobile/header";
import AddButton from "@/components/ui/add-button";
import ResponsiveDialog from "@/components/ui/responsive-dialog";
import { Loader2 } from "lucide-react";
import { useState, useMemo, Suspense, useCallback } from "react";
import TaskForm from "@/components/tasks/task-form/task-form";
import { useGetTasks, useUpdateTask } from "@/hooks/use-tasks";
import { useTaskDialog } from "@/hooks/use-task-dialog";
import { useAuth } from "@/contexts/auth-context";
import useTasksForm from "@/hooks/use-tasks-form";
import { groupTasksByDate } from "@/lib/utils/task-grouping";
import TaskDetails from "@/components/tasks/task-details/task-details";
import QuickAddTask from "@/components/tasks/quick-add-task";
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
import { arrayMove } from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { Task } from "@/types";
import {
  TaskViewToggle,
  TaskViewMode,
} from "@/components/tasks/task-view-toggle";
import { SortableTaskList } from "@/components/tasks/sortable-task-list";
import {
  EisenhowerMatrix,
  MatrixQuadrant,
} from "@/components/tasks/eisenhower-matrix";
import { TaskSortableOverlay } from "@/components/tasks/sortable-task-card";

const TasksContent = () => {
  const [viewMode, setViewMode] = useState<TaskViewMode>("list");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { user } = useAuth();
  const tasks = useGetTasks(user?.uid || "");
  const updateTask = useUpdateTask();
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

  // Filter out completed tasks for display (optional)
  const activeTasks = useMemo(() => {
    if (!tasks.data) return [];
    return tasks.data.filter((t) => t.status !== "completed");
  }, [tasks.data]);

  const groupedTasks = useMemo(() => {
    if (!activeTasks) return null;
    return groupTasksByDate(activeTasks);
  }, [activeTasks]);

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

      if (!over || !user?.uid || !tasks.data) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Extract task ID from sortable ID (e.g., "task-abc123" -> "abc123")
      const activeTaskId = activeId.replace("task-", "");
      const task = tasks.data.find((t) => t.id === activeTaskId);
      if (!task) return;

      // Handle dropping on a quadrant (Eisenhower Matrix)
      if (over.data.current?.type === "quadrant") {
        const quadrant = over.data.current.quadrant as MatrixQuadrant;
        let isImportant = false;
        let isUrgent = false;

        switch (quadrant) {
          case "important-urgent":
            isImportant = true;
            isUrgent = true;
            break;
          case "important-not-urgent":
            isImportant = true;
            isUrgent = false;
            break;
          case "not-important-urgent":
            isImportant = false;
            isUrgent = true;
            break;
          case "not-important-not-urgent":
            isImportant = false;
            isUrgent = false;
            break;
        }

        // Only update if tags changed
        if (task.isImportant !== isImportant || task.isUrgent !== isUrgent) {
          updateTask.mutate({
            taskId: activeTaskId,
            updates: { isImportant, isUrgent },
          });
        }
        return;
      }

      // Handle reordering within same container
      if (activeId !== overId && overId.startsWith("task-")) {
        const overTaskId = overId.replace("task-", "");
        const activeIndex = tasks.data.findIndex((t) => t.id === activeTaskId);
        const overIndex = tasks.data.findIndex((t) => t.id === overTaskId);

        if (activeIndex !== -1 && overIndex !== -1) {
          // Calculate new order values
          const reordered = arrayMove(tasks.data, activeIndex, overIndex);

          // Update order for affected tasks
          reordered.forEach((t: Task, index: number) => {
            if (t.order !== index) {
              updateTask.mutate({
                taskId: t.id!,
                updates: { order: index },
              });
            }
          });
        }
      }
    },
    [tasks.data, user?.uid, updateTask],
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
          <div className="hidden md:block">
            <TaskViewToggle mode={viewMode} onModeChange={setViewMode} />
          </div>
        </div>

        {/* Loading state */}
        {!isFullyLoaded ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="md:hidden">
              <TaskViewToggle mode={viewMode} onModeChange={setViewMode} />
            </div>
            {/* {viewMode === "list" && <QuickAddTask />} */}

            <div className="flex-1 mb-13 md:mb-5 overflow-auto">
              {activeTasks.length === 0 ? (
                <div className="text-center text-muted-foreground mt-10">
                  <p className="mb-2">No tasks found.</p>
                </div>
              ) : viewMode === "list" && groupedTasks ? (
                <SortableTaskList
                  groupedTasks={groupedTasks}
                  onTaskClick={taskDialog.handleTaskClick}
                  isFetching={tasks.isFetching}
                />
              ) : (
                <EisenhowerMatrix
                  tasks={activeTasks}
                  onTaskClick={taskDialog.handleTaskClick}
                />
              )}
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
