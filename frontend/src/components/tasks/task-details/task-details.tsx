"use client";

import { Task } from "@/types";
import { Repeat, AlertCircle } from "lucide-react";
import Header from "./header";
import SubTasks from "./sub-tasks";
import {
  useGetMasterTask,
  useGetTasks,
  useUpdateTaskRecurrence,
} from "@/hooks/use-tasks";
import { useAuth } from "@/contexts/auth-context";
import { useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TaskDetailsProps {
  setMode: (mode: "view" | "edit") => void;
  task?: Task;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TaskDetails = ({ setMode, task, setDialogOpen }: TaskDetailsProps) => {
  const { user } = useAuth();
  const { data: tasks } = useGetTasks(user?.uid || "");

  // Get the latest task data from the query cache
  const currentTask = useMemo(() => {
    if (!task?.id || !tasks) return task;
    return tasks.find((t) => t.id === task.id) || task;
  }, [tasks, task]);

  // Fetch master task if this task is recurring and not completed
  const { data: masterTask } = useGetMasterTask(
    currentTask?.status !== "completed" && currentTask?.recurringMasterId
      ? currentTask.recurringMasterId
      : ""
  );

  const isAutoPaused =
    (masterTask as { recurringStatus?: string; pausedReason?: string })
      ?.recurringStatus === "paused" &&
    (masterTask as { recurringStatus?: string; pausedReason?: string })
      ?.pausedReason === "auto-pause-inactivity";

  const { mutate: updateRecurrence, isPending } = useUpdateTaskRecurrence();

  if (!currentTask) return null;

  return (
    <div className="space-y-6">
      <Header
        task={currentTask}
        setMode={setMode}
        setDialogOpen={setDialogOpen}
      />
      <SubTasks
        subtasks={currentTask.subtasks || []}
        taskId={currentTask.id || ""}
      />

      {task?.recurringMasterId && (
        <div className="space-y-3">
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
            {masterTask && (
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="recurrence-status"
                  className="text-xs text-muted-foreground"
                >
                  {(masterTask as { recurringStatus?: string })
                    .recurringStatus === "active"
                    ? "Active"
                    : "Paused"}
                </Label>
                <Switch
                  id="recurrence-status"
                  checked={
                    (masterTask as { recurringStatus?: string })
                      .recurringStatus === "active"
                  }
                  disabled={isPending}
                  onCheckedChange={(checked) => {
                    updateRecurrence(
                      {
                        masterTaskId: masterTask.id!,
                        recurringStatus: checked ? "active" : "paused",
                      },
                      {
                        onSuccess: () => {
                          toast.success(
                            checked
                              ? "Recurring task resumed"
                              : "Recurring task paused"
                          );
                        },
                        onError: () => {
                          toast.error("Failed to update recurring task");
                        },
                      }
                    );
                  }}
                />
              </div>
            )}
          </div>

          {isAutoPaused && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  This task was automatically paused after 4 consecutive missed
                  completions. Toggle the switch above to resume.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskDetails;
