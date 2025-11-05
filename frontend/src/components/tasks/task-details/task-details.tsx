"use client";

import { Task } from "@/types";
import { Repeat } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <Header task={currentTask} setMode={setMode} />
      <SubTasks
        subtasks={currentTask.subtasks || []}
        taskId={currentTask.id || ""}
      />
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
