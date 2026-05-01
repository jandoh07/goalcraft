import type { NonNegotiableTask as NonNegotiableTaskItem } from "@/types/goal";
import { Check, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import useMutation from "@/hooks/use-mutation";
import {
  deleteNonNegotiableTask,
  updateNonNegotiableTask,
} from "@/lib/firebase/non-negotiable";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import ConfirmationDialog from "../ui/confirmation-dialog";

export function NonNegotiableTask({
  task,
  userId,
  goalId,
  nonNegotiableId,
}: {
  task: NonNegotiableTaskItem;
  userId: string | null;
  goalId: string;
  nonNegotiableId: string;
}) {
  const initialDurationUnit =
    task.duration >= 60 && task.duration % 60 === 0 ? "hr" : "min";
  const initialDurationValue =
    initialDurationUnit === "hr"
      ? String(task.duration / 60)
      : String(task.duration);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [durationValue, setDurationValue] = useState(initialDurationValue);
  const [durationUnit, setDurationUnit] = useState<"min" | "hr">(
    initialDurationUnit,
  );

  const normalizedTitle = title.trim();
  const parsedDuration = Number(durationValue);
  const computedDuration =
    durationUnit === "hr"
      ? Math.round(parsedDuration * 60)
      : Math.round(parsedDuration);
  const canSubmit =
    normalizedTitle.length > 0 &&
    Number.isFinite(computedDuration) &&
    computedDuration > 0;

  const hasChanges = useMemo(() => {
    if (!canSubmit) {
      return false;
    }

    return normalizedTitle !== task.title || computedDuration !== task.duration;
  }, [canSubmit, computedDuration, normalizedTitle, task.duration, task.title]);

  const updateTaskMutation = useMutation(
    async () => {
      if (!userId) {
        throw new Error("You must be signed in to update a task.");
      }

      if (!canSubmit) {
        throw new Error("Please provide a valid title and duration.");
      }

      await updateNonNegotiableTask(userId, goalId, nonNegotiableId, task.id, {
        title: normalizedTitle,
        duration: computedDuration,
      });
    },
    {
      onSuccess: () => {
        setIsEditing(false);
        toast.success("Task updated");
      },
      onError: "Failed to update task",
    },
  );

  const deleteTaskMutation = useMutation(
    async () => {
      if (!userId) {
        throw new Error("You must be signed in to delete a task.");
      }

      await deleteNonNegotiableTask(userId, nonNegotiableId, task.id);
    },
    {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setIsEditing(false);
        toast.success("Task deleted");
      },
      onError: "Failed to delete task",
    },
  );

  const toggleStatusMutation = useMutation(
    async () => {
      if (!userId) {
        throw new Error("You must be signed in to update a task.");
      }

      const nextStatus =
        task.status === "completed" ? "in-progress" : "completed";

      await updateNonNegotiableTask(userId, goalId, nonNegotiableId, task.id, {
        status: nextStatus,
      });
    },
    {
      onError: "Failed to update task status",
    },
  );

  const resetEditState = () => {
    setTitle(task.title);
    setDurationValue(initialDurationValue);
    setDurationUnit(initialDurationUnit);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <>
        <div
          className="space-y-3 rounded-md border border-border bg-card p-3"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.stopPropagation();
            }
          }}
        >
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Task title"
            aria-label="Task title"
            autoFocus
          />

          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              value={durationValue}
              onChange={(event) => setDurationValue(event.target.value)}
              placeholder="Duration"
              aria-label="Task duration"
            />
            <Select
              value={durationUnit}
              onValueChange={(value) => setDurationUnit(value as "min" | "hr")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="min">Minutes</SelectItem>
                <SelectItem value="hr">Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap justify-between gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={
                deleteTaskMutation.loading || updateTaskMutation.loading
              }
            >
              Delete
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetEditState}
                disabled={
                  updateTaskMutation.loading || deleteTaskMutation.loading
                }
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={
                  !hasChanges || !canSubmit || updateTaskMutation.loading
                }
                onClick={async () => {
                  await updateTaskMutation.mutate();
                }}
              >
                {updateTaskMutation.loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>

        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            await deleteTaskMutation.mutate();
          }}
          isLoading={deleteTaskMutation.loading}
          preset="deleteTask"
        />
      </>
    );
  }

  return (
    <>
      <div
        className="flex items-center justify-between gap-2 bg-card py-1 px-2 border-t border-b border-border cursor-pointer"
        onClick={(event) => {
          event.stopPropagation();
          setIsEditing(true);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            setIsEditing(true);
          }
        }}
      >
        <div className="flex items-center">
          <button
            type="button"
            className="rounded-full size-6 border border-border flex items-center justify-center cursor-pointer hover:bg-primary/20"
            onClick={(event) => {
              event.stopPropagation();
              toggleStatusMutation.mutate();
            }}
            disabled={toggleStatusMutation.loading}
          >
            <Check
              size={12}
              className={task.status === "completed" ? "block" : "hidden"}
            />
          </button>
          <p
            className={`ml-2 text-sm ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
          >
            {task.title || "Untitled task"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={"outline"}>{task.duration} min</Badge>
          <button
            type="button"
            className="hidden md:block cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              setIsDeleteDialogOpen(true);
            }}
            aria-label="Delete task"
          >
            <Trash2 size={15} />
          </button>
          <button
            type="button"
            className="hidden md:block cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              setIsEditing(true);
            }}
            aria-label="Edit task"
          >
            <Pencil size={15} />
          </button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={async () => {
          await deleteTaskMutation.mutate();
        }}
        isLoading={deleteTaskMutation.loading}
        preset="deleteTask"
      />
    </>
  );
}
