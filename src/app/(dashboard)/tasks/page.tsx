"use client";

import MobileHeader from "@/components/layout/mobile/header";
import { TaskFormData } from "@/components/tasks/task-form";
import QuickAddTask from "@/components/tasks/quick-add-task";
import TaskCard from "@/components/tasks/task-card";
import AddButton from "@/components/ui/add-button";
import ResponsiveDialog from "@/components/ui/responsive-dialog";
import { TriangleAlert } from "lucide-react";
import React, { useState } from "react";
import TaskForm from "@/components/tasks/task-form";

const Tasks = () => {
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState<TaskFormData | undefined>(undefined);

  const handleTaskClick = (data: TaskFormData) => {
    setTask(data);
    setOpen(true);
  };

  const handleAddNew = () => {
    setTask(undefined);
    setOpen(true);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => setTask(undefined), 300);
    }
  };

  return (
    <div className="max-w-7xl h-full mx-auto p-4 relative">
      <p className="hidden md:block text-lg font-semibold">My Tasks</p>
      <MobileHeader title="My Tasks" />
      <QuickAddTask />
      <div>
        <div className="flex items-center gap-2 text-destructive mb-5">
          <TriangleAlert className="text-destructive" strokeWidth={2.5} />
          <p className="font-semibold">Overdue (3)</p>
        </div>
        <TaskCard
          type="overdue"
          onClick={() =>
            handleTaskClick({
              title: "Overdue Task",
              description: "This task is overdue",
              associatedGoal: "fitness",
              dueDate: new Date(),
              time: "09:00",
              priority: "high",
              subtasks: [],
              isRecurring: false,
              frequency: "",
            })
          }
        />
      </div>
      <AddButton onClick={handleAddNew} />
      <ResponsiveDialog
        open={open}
        setOpen={handleClose}
        title={task ? "Edit Task" : "Add Task"}
        submitLabel={task ? "Update Task" : "Add Task"}
        onSubmit={() => {}}
      >
        <TaskForm initialData={task} mode={task ? "edit" : "add"} />
      </ResponsiveDialog>
    </div>
  );
};

export default Tasks;
