import {
  Check,
  ChevronRight,
  CirclePlus,
  EllipsisVertical,
} from "lucide-react";
import { useState } from "react";
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
import { updateNonNegotiable } from "@/lib/firebase/non-negotiable";
import { useAuth } from "@/contexts/auth-context";

interface NonNegotiableCardProps {
  data: InProgressNonNegotiableWithTasks;
}

export function NonNegotiableCard({ data }: NonNegotiableCardProps) {
  const [isExpanded, setIsExpanded] = useState(data.tasks.length > 0);
  const { user } = useAuth();
  const mutation = useMutation(
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

  const toggleExpanded = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const handleNonNegotiableClick = () => {
    console.log("Non-negotiable clicked");
  };

  const toggleCompleted = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    mutation.mutate();
  };

  return (
    <div
      className={`p-2 rounded-lg cursor-pointer overflow-hidden transition-colors ${
        data.nonNegotiable.status === "completed"
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
            }`}
            disabled={mutation.loading}
          >
            {data.nonNegotiable.status === "completed" ? (
              <Check size={12} />
            ) : null}
          </button>
          <p
            className={`text-[0.95rem] font-semibold ${data.nonNegotiable.status === "completed" ? "line-through text-muted-foreground" : ""}`}
          >
            {data.nonNegotiable.title || "Untitled non-negotiable"}
          </p>
        </div>
        <div className="flex items-center">
          <EllipsisVertical
            size={15}
            className="cursor-pointer hover:text-primary hidden md:block"
          />
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

          <AddTaskInline />
        </div>
      )}
    </div>
  );
}

function NonNegotiableTask({ task }: { task: NonNegotiableTaskItem }) {
  return (
    <div className="flex items-center justify-between gap-2 bg-card rounded-md p-2 border border-border">
      <div className="flex gap-2">
        <button className="rounded-full size-6 border border-border flex items-center justify-center cursor-pointer hover:bg-primary/30">
          <Check size={12} />
        </button>
        <p className="ml-2 text-sm">{task.title || "Untitled task"}</p>
      </div>
      <Badge variant={"outline"}>{task.duration} min</Badge>
    </div>
  );
}

function AddTaskInline() {
  const [isAdding, setIsAdding] = useState(false);

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
        <Input placeholder="Task title" aria-label="Task title" autoFocus />

        <div className="flex items-center gap-2">
          <Input
            placeholder="Duration"
            aria-label="Task duration"
            type="number"
          />
          <Select defaultValue="min">
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
            onClick={() => setIsAdding(false)}
          >
            Cancel
          </Button>
          <Button type="button" size="sm">
            Add
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
