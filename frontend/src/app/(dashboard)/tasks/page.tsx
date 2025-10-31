"use client";

import MobileHeader from "@/components/layout/mobile/header";
import QuickAddTask from "@/components/tasks/quick-add-task";
import TaskCard from "@/components/tasks/task-card";
import AddButton from "@/components/ui/add-button";
import ResponsiveDialog from "@/components/ui/responsive-dialog";
import { Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import TaskForm from "@/components/tasks/task-form/task-form";
import { useGetTasks } from "@/hooks/use-tasks";
import { useTaskDialog } from "@/hooks/use-task-dialog";
import { useAuth } from "@/contexts/auth-context";
import useTasksForm from "@/hooks/use-tasks-form";
import { groupTasksByDate, getTaskType } from "@/lib/utils/task-grouping";
import TaskGroupHeader from "@/components/tasks/task-group-header";
import TaskDetails from "@/components/tasks/task-details/task-details";

type Groupkey =
  | "overdue"
  | "today"
  | "tomorrow"
  | "this-week"
  | "later"
  | "no-date";

const Tasks = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const tasks = useGetTasks(user?.uid || "");
  const taskDialog = useTaskDialog(setOpen);
  const taskForm = useTasksForm({
    initialData: taskDialog.activeTask,
    mode: taskDialog.activeTask ? "edit" : "add",
    openDialog: setOpen,
  });

  const groupedTasks = useMemo(() => {
    if (!tasks.data) return null;
    return groupTasksByDate(tasks.data);
  }, [tasks.data]);

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
    <div className="max-w-7xl h-full mx-auto p-3 relative">
      <p className="hidden md:block text-lg font-semibold">My Tasks</p>
      <MobileHeader title="My Tasks" />
      <QuickAddTask />
      <div className="pb-50 md:pb-5">
        {tasks.isLoading && (
          <div className="w-full h-32">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        )}
        {tasks.isSuccess && tasks.data?.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
            <p className="mb-2">No tasks found.</p>
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
        open={open}
        setOpen={taskDialog.handleClose}
        title={""}
        submitLabel={taskDialog.getSubmitLabel()}
        onSubmit={taskDialog.handleExternalFormSubmit}
        isSubmitting={taskForm.mutation.isPending}
        hideSubmitButton={taskDialog.hideSubmitButton()}
        onDelete={taskDialog.deleteTask(() =>
          taskForm.handleDeleteTask(
            taskDialog.activeTask?.id || "",
            taskDialog.handleClose
          )
        )}
      >
        {taskDialog.mode === "view" ? (
          <TaskDetails
            setMode={taskDialog.setMode}
            task={taskDialog.activeTask}
          />
        ) : (
          <TaskForm taskForm={taskForm} />
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default Tasks;
