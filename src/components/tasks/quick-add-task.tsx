import React from "react";
import { Button } from "../ui/button";

const QuickAddTask = () => {
  return (
    <div className="my-5 border border-border rounded-xl flex justify-between items-center gap-3 px-2 shadow-sm bg-secondary overflow-hidden">
      <input
        type="text"
        placeholder="Quick add task.."
        className="w-full outline-none px-1 py-3"
      />
      <Button className="bg-accent text-accent-foreground hover:bg-accent/80 cursor-pointer">
        Add Task
      </Button>
    </div>
  );
};

export default QuickAddTask;
