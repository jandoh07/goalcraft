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
import { useAuth } from "@/contexts/auth-context";
import { Task } from "@/types";

const Tasks = () => {
  const [open, setOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | undefined>(undefined);
  const [triggerSubmit, setTriggerSubmit] = useState(false);
  const { user } = useAuth();
  const tasks = useUserTasks(user?.uid || "");

  const handleTaskClick = (data: Task) => {
    setActiveTask(data);
    setOpen(true);
  };

  const handleAddNew = () => {
    setActiveTask(undefined);
    setOpen(true);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => setActiveTask(undefined), 300);
    }
  };

  return (
    <div className="max-w-7xl h-full mx-auto p-3 relative">
      <p className="hidden md:block text-lg font-semibold">My Tasks</p>
      <MobileHeader title="My Tasks" />
      <QuickAddTask />
      <div>
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
              onClick={() => handleTaskClick(task)}
              type="today"
            />
          ))
        )}
      </div>
      <AddButton onClick={handleAddNew} />
      <ResponsiveDialog
        open={open}
        setOpen={handleClose}
        title={activeTask ? "Edit Task" : "Add Task"}
        submitLabel={activeTask ? "Update Task" : "Add Task"}
        onSubmit={() => setTriggerSubmit(true)}
        triggerSubmit={triggerSubmit}
      >
        <TaskForm
          initialData={activeTask}
          mode={activeTask ? "edit" : "add"}
          openDialog={handleClose}
          triggerSubmit={triggerSubmit}
          setTriggerSubmit={setTriggerSubmit}
        />
      </ResponsiveDialog>
    </div>
  );
};

export default Tasks;
