"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EllipsisVertical } from "lucide-react";
import {
  deleteBrainDumpTask,
  updateBrainDumpTask,
} from "@/lib/firebase/brain-dump";
import { useAuth } from "@/contexts/auth-context";
import { BrainDumpTask } from "@/types/brain-dump";

interface BrainDumpTaskCardProps {
  task: BrainDumpTask;
  onClick: (task: BrainDumpTask) => void;
}

export const BrainDumpTaskCard = ({
  task,
  onClick,
}: BrainDumpTaskCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuth();

  const handleComplete = async () => {
    if (!user?.uid) return;
    const isCompleted = task.status === "completed";

    await updateBrainDumpTask(user.uid, task.id, {
      status: isCompleted ? "pending" : "completed",
    });
  };

  const handleDelete = async () => {
    if (!user?.uid) return;
    setIsDeleteDialogOpen(false);
    await deleteBrainDumpTask(user?.uid, task.id);
  };

  return (
    <>
      <div
        className="px-3 flex items-center justify-between gap-2 py-2 cursor-pointer hover:bg-secondary border-b border-border"
        role="button"
        tabIndex={0}
        onClick={() => onClick && onClick(task)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick(task);
          }
        }}
      >
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium wrap-break-word ${
              task.status === "completed"
                ? "line-through text-muted-foreground"
                : ""
            }`}
          >
            {task.title}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="cursor-pointer hover:text-primary shrink-0"
              onClick={(e) => {
                e.stopPropagation();
              }}
              aria-label="Task options"
            >
              <EllipsisVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <DropdownMenuItem onSelect={handleComplete}>
              {task.status === "completed"
                ? "Mark as incomplete"
                : "Mark complete"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onClick(task)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setIsDeleteDialogOpen(true)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
