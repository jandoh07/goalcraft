import useMutation from "@/hooks/use-mutation";
import { createNonNegotiableTask } from "@/lib/firebase/non-negotiable";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Button } from "../ui/button";
import { CirclePlus } from "lucide-react";

export function AddTaskInline({
  userId,
  goalId,
  nonNegotiableId,
}: {
  userId: string | null;
  goalId: string;
  nonNegotiableId: string;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState<"min" | "hr">("min");

  const createTaskMutation = useMutation(
    async () => {
      if (!userId) {
        throw new Error("You must be signed in to add a task.");
      }

      const title = taskTitle.trim();
      const parsedDuration = Number(durationValue);
      const computedDuration =
        durationUnit === "hr"
          ? Math.round(parsedDuration * 60)
          : Math.round(parsedDuration);

      if (!title) {
        throw new Error("Task title is required.");
      }

      if (!Number.isFinite(computedDuration) || computedDuration <= 0) {
        throw new Error("Task duration must be greater than zero.");
      }

      await createNonNegotiableTask(userId, goalId, nonNegotiableId, {
        title,
        duration: computedDuration,
      });
    },
    {
      onSuccess: () => {
        setTaskTitle("");
        setDurationValue("");
        setDurationUnit("min");
        setIsAdding(false);
        toast.success("Task added");
      },
      onError: "Failed to add task",
    },
  );

  const normalizedTitle = taskTitle.trim();
  const normalizedDuration = Number(durationValue);
  const canSubmit =
    normalizedTitle.length > 0 &&
    Number.isFinite(normalizedDuration) &&
    normalizedDuration > 0;

  if (isAdding) {
    return (
      <div
        className="rounded-md border border-border bg-card p-3 space-y-3"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.stopPropagation();
          }
        }}
      >
        <Input
          placeholder="Task title"
          aria-label="Task title"
          autoFocus
          value={taskTitle}
          onChange={(event) => setTaskTitle(event.target.value)}
        />

        <div className="flex items-center gap-2">
          <Input
            placeholder="Duration"
            aria-label="Task duration"
            type="number"
            min={1}
            value={durationValue}
            onChange={(event) => setDurationValue(event.target.value)}
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

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsAdding(false);
              setTaskTitle("");
              setDurationValue("");
              setDurationUnit("min");
            }}
            disabled={createTaskMutation.loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!canSubmit || createTaskMutation.loading}
            onClick={async () => {
              await createTaskMutation.mutate();
            }}
          >
            {createTaskMutation.loading ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <Button
        variant={"ghost"}
        size={"sm"}
        className="w-full md:w-30 border border-solid border-border"
        onClick={(event) => {
          event.stopPropagation();
          setIsAdding(true);
        }}
      >
        <CirclePlus className="md:hidden" /> Add Task
      </Button>
    </div>
  );
}
