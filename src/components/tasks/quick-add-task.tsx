import { Plus } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

const QuickAddTask = () => {
  return (
    <div className="my-5 border border-border rounded-2xl p-3 flex justify-between items-center gap-3 shadow-sm bg-secondary">
      <Plus />
      <input
        type="text"
        placeholder="Add a new task.."
        className="w-full outline-none px-1"
      />
      <Button className="bg-accent text-accent-foreground hover:bg-accent/80">
        Add Task
      </Button>
    </div>
  );
};

export default QuickAddTask;
