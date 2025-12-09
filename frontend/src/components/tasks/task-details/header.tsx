import { Task } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Flag,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import GoalIcon from "@/components/goals/goal-icon";
import { format } from "date-fns";
import { useDeleteTask, useToggleTaskStatus } from "@/hooks/use-tasks";
import { useState } from "react";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";

interface HeaderProps {
  task: Task;
  setMode: (mode: "view" | "edit") => void;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ task, setMode, setDialogOpen }: HeaderProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const toggleTaskStatus = useToggleTaskStatus();
  const deleteTaskMutation = useDeleteTask();

  return (
    <div>
      <div className="flex justify-between items-start mt-1">
        <div>
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 size-5"
              checked={task.status === "completed"}
              onChange={() =>
                toggleTaskStatus.mutate({
                  taskId: task.id || "",
                  currentStatus: task.status,
                  goalId: task.goalId,
                })
              }
            />
            <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
          </div>
        </div>
        <div className="flex justify-between items-start">
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setMode("edit")}>
                <Pencil className="h-4 w-4" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setShowConfirmDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {task.goalId && task.goalTitle && (
        <div className="flex items-center gap-2 overflow-x-auto">
          {task.priority && (
            <Badge
              className={`capitalize text-xs ${
                task.priority === "high"
                  ? "bg-red-400"
                  : task.priority === "medium"
                  ? "bg-yellow-600"
                  : "bg-green-600"
              }`}
            >
              <Flag />
            </Badge>
          )}
          <Badge
            variant="outline"
            className="text-xs line-clamp-1 flex items-center"
          >
            <GoalIcon category={task.goalCategory || ""} onlyIcon={true} />
            {task.goalTitle}
          </Badge>
        </div>
      )}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
        <div className="flex items-center gap-2">
          <Calendar className="size-4" />
          <span>Created: {format(task.createdAt, "MMM dd, yyyy")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4" />
          <span>
            Due:{" "}
            {task.dueDate
              ? format(task.dueDate, "MMM dd, yyyy")
              : "No due date"}
          </span>
        </div>
      </div>
      {task.description && (
        <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
      )}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          setShowConfirmDialog(false);
          deleteTaskMutation.mutate(task.id || "");
          setDialogOpen(false);
        }}
      />
    </div>
  );
};

export default Header;
