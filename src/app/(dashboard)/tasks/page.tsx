"use client";

import MobileHeader from "@/components/layout/mobile/header";
import QuickAddTask from "@/components/tasks/quick-add-task";
import TaskCard from "@/components/tasks/task-card";
import AddButton from "@/components/ui/add-button";
import ResponsiveDialog from "@/components/ui/responsive-dialog";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import TaskForm from "@/components/tasks/task-form/task-form";
import { useUserTasks } from "@/hooks/use-tasks";
import { useTaskDialog } from "@/hooks/use-task-dialog";
import { useAuth } from "@/contexts/auth-context";
import useTasksForm from "@/hooks/use-tasks-form";

const Tasks = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const tasks = useUserTasks(user?.uid || "");
  const taskDialog = useTaskDialog(setOpen);
  const taskForm = useTasksForm({
    initialData: taskDialog.activeTask,
    mode: taskDialog.activeTask ? "edit" : "add",
    openDialog: setOpen,
  });

  return (
    <div className="max-w-7xl h-full mx-auto p-3 relative">
      <p className="hidden md:block text-lg font-semibold">My Tasks</p>
      <MobileHeader title="My Tasks" />
      <QuickAddTask />
      <div className="pb-50 md:pb-5">
        {/* <div className="flex items-center gap-2 text-destructive mb-5">
          <TriangleAlert className="text-destructive" strokeWidth={2.5} />
          <p className="font-semibold">Overdue (3)</p>
        </div> */}
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
          tasks.data?.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => taskDialog.handleTaskClick(task)}
              type="today"
            />
          ))
        )}
      </div>
      <AddButton onClick={taskDialog.handleAddNew} />
      <ResponsiveDialog
        open={open}
        setOpen={taskDialog.handleClose}
        title={taskDialog.activeTask ? "Edit Task" : "Add Task"}
        submitLabel={taskDialog.activeTask ? "Update Task" : "Add Task"}
        onSubmit={taskDialog.handleExternalFormSubmit}
        isSubmitting={taskForm.mutation.isPending}
      >
        <TaskForm
          mode={taskDialog.activeTask ? "edit" : "add"}
          taskForm={taskForm}
        />
      </ResponsiveDialog>
    </div>
  );
};

export default Tasks;
