import {
  Check,
  ChevronRight,
  CirclePlus,
  EllipsisVertical,
  Pause,
} from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type {
  InProgressNonNegotiableWithTasks,
  NonNegotiableTask as NonNegotiableTaskItem,
} from "@/types/goal";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { SelectValue } from "@radix-ui/react-select";
import useMutation from "@/hooks/use-mutation";
import {
  createNonNegotiableTask,
  deleteNonNegotiable,
  updateNonNegotiable,
} from "@/lib/firebase/non-negotiable";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface NonNegotiableCardProps {
  data: InProgressNonNegotiableWithTasks;
}

export function NonNegotiableCard({ data }: NonNegotiableCardProps) {
  const [isExpanded, setIsExpanded] = useState(data.tasks.length > 0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openNonNegotiableMode = (mode: "view" | "edit") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", mode);
    params.set("type", "non-negotiable");
    params.set("nonNegotiableId", data.nonNegotiable.id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleCompleteMutation = useMutation(
    () =>
      updateNonNegotiable(user!.uid, data.goalId, data.nonNegotiable.id, {
        status:
          data.nonNegotiable.status === "completed"
            ? "in-progress"
            : "completed",
      }),
    {
      onError: "Error updating non-negotiable status",
    },
  );

  const pauseMutation = useMutation(
    () => {
      const nextStatus =
        data.nonNegotiable.status === "paused" ? "in-progress" : "paused";

      return updateNonNegotiable(
        user!.uid,
        data.goalId,
        data.nonNegotiable.id,
        {
          status: nextStatus,
        },
      );
    },
    {
      onSuccess:
        data.nonNegotiable.status === "paused"
          ? "Non-negotiable resumed"
          : "Non-negotiable paused",
      onError: "Failed to update non-negotiable status",
    },
  );

  const deleteMutation = useMutation(
    () => deleteNonNegotiable(user!.uid, data.goalId, data.nonNegotiable.id),
    {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        toast.success("Non-negotiable deleted");
      },
      onError: "Failed to delete non-negotiable",
    },
  );

  const toggleExpanded = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const handleNonNegotiableClick = () => {
    openNonNegotiableMode("view");
  };

  const toggleCompleted = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    toggleCompleteMutation.mutate();
  };

  const handleDeleteNonNegotiable = async () => {
    await deleteMutation.mutate();
  };

  return (
    <div
      className={`px-2 py-3 rounded-lg cursor-pointer overflow-hidden transition-colors ${
        data.nonNegotiable.status === "completed" ||
        data.nonNegotiable.status === "paused"
          ? "bg-sidebar/20"
          : "bg-sidebar/30"
      }`}
      onClick={handleNonNegotiableClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleNonNegotiableClick();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse objective" : "Expand objective"}
            className="mr-2 rounded-sm transition-colors hover:bg-sidebar/60 cursor-pointer"
          >
            <ChevronRight
              size={20}
              className={`transition-transform ${isExpanded ? "rotate-90" : "rotate-0"}`}
            />
          </button>
          <button
            type="button"
            onClick={toggleCompleted}
            aria-pressed={data.nonNegotiable.status === "completed"}
            aria-label={
              data.nonNegotiable.status === "completed"
                ? "Mark non-negotiable as in progress"
                : "Mark non-negotiable as completed"
            }
            className={`mr-2 size-5.5 rounded-sm border flex items-center justify-center transition-colors ${
              data.nonNegotiable.status === "completed"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-sidebar/60"
            } ${data.nonNegotiable.status === "paused" ? "hidden" : ""}`}
            disabled={toggleCompleteMutation.loading}
          >
            {data.nonNegotiable.status === "completed" ? (
              <Check size={12} />
            ) : null}
          </button>
          <Pause
            className={`size-4 mr-2 text-muted-foreground ${data.nonNegotiable.status === "paused" ? "block" : "hidden"}`}
          />
          <p
            className={`text-[0.95rem] font-semibold ${data.nonNegotiable.status === "completed" ? "line-through text-muted-foreground" : ""} ${data.nonNegotiable.status === "paused" ? "text-muted-foreground" : ""}`}
          >
            {data.nonNegotiable.title || "Untitled non-negotiable"}
          </p>
        </div>
        <div className="hidden md:flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="cursor-pointer hover:text-primary"
                onClick={(event) => {
                  event.stopPropagation();
                }}
                aria-label="Non-negotiable options"
              >
                <EllipsisVertical size={15} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <DropdownMenuItem
                onSelect={() => {
                  openNonNegotiableMode("edit");
                }}
              >
                Edit
              </DropdownMenuItem>
              {data.nonNegotiable.status !== "completed" ? (
                <DropdownMenuItem
                  onSelect={() => {
                    pauseMutation.mutate();
                  }}
                >
                  {data.nonNegotiable.status === "paused" ? "Resume" : "Pause"}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  setIsDeleteDialogOpen(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {isExpanded && (
        <div
          className="pl-2 pt-3 space-y-3"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.stopPropagation();
            }
          }}
        >
          {data.tasks.length > 0 ? (
            data.tasks.map((task) => (
              <NonNegotiableTask key={task.id} task={task} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No active tasks yet.
            </p>
          )}

          <AddTaskInline
            userId={user?.uid ?? null}
            goalId={data.goalId}
            nonNegotiableId={data.nonNegotiable.id}
          />
        </div>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
        }}
      >
        <AlertDialogContent
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this non-negotiable?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this non-negotiable and its linked
              tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.loading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.loading}
              onClick={async (event) => {
                event.preventDefault();
                event.stopPropagation();
                await handleDeleteNonNegotiable();
              }}
            >
              {deleteMutation.loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NonNegotiableTask({ task }: { task: NonNegotiableTaskItem }) {
  return (
    <div className="flex items-center justify-between gap-2 bg-card rounded-md p-2 border border-border">
      <div className="flex gap-2">
        <button className="rounded-full size-6 border border-border flex items-center justify-center cursor-pointer hover:bg-primary/20">
          <Check
            size={12}
            className={task.status === "completed" ? "block" : "hidden"}
          />
        </button>
        <p className="ml-2 text-sm">{task.title || "Untitled task"}</p>
      </div>
      <Badge variant={"outline"}>{task.duration} min</Badge>
    </div>
  );
}

function AddTaskInline({
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
        className=" border border-dashed md:border-solid border-border"
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
