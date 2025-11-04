"use client";

import { Task } from "@/types";
import { Badge } from "../../ui/badge";
import { Flag, Repeat } from "lucide-react";
import Header from "./header";
import SubTasks from "./sub-tasks";
import { useGetTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/contexts/auth-context";
import { useMemo } from "react";

interface TaskDetailsProps {
  setMode: (mode: "view" | "edit") => void;
  task?: Task;
}

const TaskDetails = ({ setMode, task }: TaskDetailsProps) => {
  const { user } = useAuth();
  const { data: tasks } = useGetTasks(user?.uid || "");

  // Get the latest task data from the query cache
  const currentTask = useMemo(() => {
    if (!task?.id || !tasks) return task;
    return tasks.find((t) => t.id === task.id) || task;
  }, [tasks, task]);

  if (!currentTask) return null;

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-600 text-white";
      case "low":
        return "bg-green-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <Header task={currentTask} setMode={setMode} />
      <SubTasks
        subtasks={currentTask.subtasks || []}
        taskId={currentTask.id || ""}
      />

      {/* Priority */}
      {currentTask.priority && (
        <div className="flex items-center gap-3">
          <Flag className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Priority:</span>
          <Badge
            className={`capitalize ${getPriorityColor(currentTask.priority)}`}
          >
            {currentTask.priority}
          </Badge>
        </div>
      )}

      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          <Repeat className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Recurring Task</p>
            {currentTask.frequency && (
              <p className="text-xs text-muted-foreground">
                {currentTask.frequency.charAt(0).toUpperCase() +
                  currentTask.frequency.slice(1)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
