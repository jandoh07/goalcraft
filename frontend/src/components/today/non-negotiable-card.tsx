import { Check, ChevronRight, EllipsisVertical, Pause } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { InProgressNonNegotiableWithTasks } from "@/types/goal";
import {
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
import { NonNegotiableTask } from "./non-negotiable-task";
import { AddTaskInline } from "./add-task-inline";
import useMutation from "@/hooks/use-mutation";
import ConfirmationDialog from "../ui/confirmation-dialog";

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
          className="md:pl-3 pt-3 space-y-3"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.stopPropagation();
            }
          }}
        >
          {data.tasks.length > 0 ? (
            data.tasks.map((task) => (
              <NonNegotiableTask
                key={task.id}
                task={task}
                userId={user?.uid ?? null}
                goalId={data.goalId}
                nonNegotiableId={data.nonNegotiable.id}
              />
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

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteNonNegotiable}
        isLoading={deleteMutation.loading}
        title="Delete this non-negotiable?"
        description="This will permanently delete this non-negotiable and its linked tasks."
        preset="deleteTask"
      />
    </div>
  );
}
