"use client";

import MobileHeader from "@/components/layout/mobile/header";
import TaskCard from "@/components/tasks/task-card";
import AddButton from "@/components/ui/add-button";
import ResponsiveDialog from "@/components/ui/responsive-dialog";
import { Loader2 } from "lucide-react";
import { useState, useMemo, Suspense } from "react";
import TaskForm from "@/components/tasks/task-form/task-form";
import { useGetTasks } from "@/hooks/use-tasks";
import { useTaskDialog } from "@/hooks/use-task-dialog";
import { useAuth } from "@/contexts/auth-context";
import useTasksForm from "@/hooks/use-tasks-form";
import { groupTasksByDate, getTaskType } from "@/lib/utils/task-grouping";
import TaskGroupHeader from "@/components/tasks/task-group-header";
import TaskDetails from "@/components/tasks/task-details/task-details";
import DateStrip from "@/components/tasks/date-strip";

type Groupkey =
  | "overdue"
  | "today"
  | "tomorrow"
  | "this-week"
  | "later"
  | "no-date";

const TasksContent = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { user, loading: authLoading } = useAuth();
  const tasks = useGetTasks(user?.uid || "");
  const taskDialog = useTaskDialog();
  const taskForm = useTasksForm({
    initialData: taskDialog.activeTask,
    mode: taskDialog.activeTask ? "edit" : "add",
    openDialog: (open) => taskDialog.handleClose(open),
  });

  const isFullyLoaded = !authLoading && !tasks.isLoading;

  // Filter tasks by selected date
  const filteredTasks = useMemo(() => {
    if (!tasks.data) return null;
    if (!selectedDate) return tasks.data;

    return tasks.data.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === selectedDate.getDate() &&
        taskDate.getMonth() === selectedDate.getMonth() &&
        taskDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [tasks.data, selectedDate]);

  const groupedTasks = useMemo(() => {
    if (!filteredTasks) return null;
    return groupTasksByDate(filteredTasks);
  }, [filteredTasks]);

  const renderTaskGroup = (
    groupKey: Groupkey,
    groupTasks: typeof tasks.data
  ) => {
    if (!groupTasks || groupTasks.length === 0) return null;

    return (
      <div key={groupKey}>
        <TaskGroupHeader group={groupKey} count={groupTasks.length} />
        {groupTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => taskDialog.handleTaskClick(task)}
            type={getTaskType(task.dueDate)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl h-full mx-auto p-3 relative flex flex-col">
      <p className="hidden md:block text-lg font-semibold">My Tasks</p>
      <MobileHeader title="My Tasks" />

      {/* Show loading state while auth or tasks are loading */}
      {!isFullyLoaded ? (
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <DateStrip
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            className="mb-3"
          />
          {/* <QuickAddTask /> */}
          <div className="pb-50 md:pb-5">
            {tasks.isSuccess && filteredTasks?.length === 0 ? (
              <div className="text-center text-muted-foreground mt-10">
                <p className="mb-2">
                  {selectedDate ? "No tasks for this date." : "No tasks found."}
                </p>
              </div>
            ) : (
              groupedTasks && (
                <div className="">
                  {renderTaskGroup("overdue", groupedTasks.overdue)}
                  {renderTaskGroup("today", groupedTasks.today)}
                  {renderTaskGroup("tomorrow", groupedTasks.tomorrow)}
                  {renderTaskGroup("this-week", groupedTasks["this-week"])}
                  {renderTaskGroup("later", groupedTasks.later)}
                  {renderTaskGroup("no-date", groupedTasks["no-date"])}
                </div>
              )
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
