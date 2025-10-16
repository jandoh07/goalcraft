import MobileHeader from "@/components/layout/mobile/header";
import QuickAddTask from "@/components/tasks/quick-add-task";
import TaskCard from "@/components/tasks/task-card";
import AddButton from "@/components/ui/add-button";
import { TriangleAlert } from "lucide-react";
import React from "react";

const Tasks = () => {
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
        <TaskCard type="overdue" />
        <TaskCard type="today" />
        <TaskCard type="tomorrow" />
        <TaskCard type="this-week" />
      </div>
      <AddButton />
    </div>
  );
};

export default Tasks;
