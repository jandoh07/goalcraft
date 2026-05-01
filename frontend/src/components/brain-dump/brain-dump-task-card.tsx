"use client";

import { useState } from "react";
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
import { Check, X } from "lucide-react";
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
  const isCompleted = task.status === "completed";

  const handleComplete = async () => {
    if (!user?.uid) return;

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
        <button
          type="button"
          role="checkbox"
          aria-checked={isCompleted}
          aria-label={
            isCompleted ? "Mark task as incomplete" : "Mark task as complete"
          }
          className={`flex size-4.5 shrink-0 cursor-pointer items-center justify-center rounded-sm border transition-colors ${
            isCompleted
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-transparent"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            void handleComplete();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
        >
          {isCompleted && <Check size={12} strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium wrap-break-word ${
              isCompleted ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.title}
          </p>
        </div>
        <button
          type="button"
          className="cursor-pointer hover:text-destructive shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setIsDeleteDialogOpen(true);
          }}
          aria-label="Delete task"
        >
          <X size={16} />
        </button>
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
