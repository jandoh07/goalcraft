import { useState } from "react";
import { Button } from "../ui/button";
import { useAddTask } from "@/hooks/use-tasks";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

const QuickAddTask = () => {
  const [taskTitle, setTaskTitle] = useState("");
  const { user } = useAuth();
  const addTaskMutation = useAddTask();

  const handleQuickAddTask = async () => {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    addTaskMutation.mutate({
      userId: user?.uid || "",
      title: taskTitle,
      status: "in-progress",
      dueDate: new Date(),
    });

    toast.success(
      isOnline
        ? "Task added successfully"
        : "Task added! Will sync when online."
    );
    setTaskTitle("");
  };

  return (
    <div className="my-5 border border-border rounded-xl flex justify-between items-center gap-3 px-2 shadow-sm bg-secondary overflow-hidden">
      <input
        type="text"
        placeholder="Quick add task.."
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
        className="w-full outline-none px-1 py-3"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleQuickAddTask();
          }
        }}
      />
      <Button
        className="bg-accent text-accent-foreground hover:bg-accent/80 cursor-pointer"
        onClick={handleQuickAddTask}
      >
        Add Task
      </Button>
    </div>
  );
};

export default QuickAddTask;
