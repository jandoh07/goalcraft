"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Progress } from "../ui/progress";
import { Activity, EllipsisVertical } from "lucide-react";
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
import { useDeleteGoal } from "@/hooks/use-goals";

interface GoalCardProps {
  goalId: string;
  title: string;
  dueDate?: Date;
  progress: number;
}

const GoalCard = ({ goalId, title, dueDate, progress }: GoalCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteGoalMutation = useDeleteGoal();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openGoalMode = (mode: "view" | "edit") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", mode);
    params.set("type", "goal");
    params.set("goalId", goalId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleDeleteGoal = async () => {
    await deleteGoalMutation.mutate(goalId);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card
        className="gap-2 py-3 cursor-pointer"
        onClick={(event) => {
          event.stopPropagation();
          openGoalMode("view");
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            openGoalMode("view");
          }
        }}
      >
        <CardHeader className="px-3 flex items-center justify-between">
          <p className="text-[0.95rem] font-semibold">{title}</p>
          <div className="hidden md:flex items-center">
            <button
              type="button"
              className="cursor-pointer hover:text-primary"
              onClick={(event) => {
                event.stopPropagation();
              }}
              aria-label="Goal activity"
            >
              <Activity size={15} />
            </button>
            <p className="opacity-10 pl-1 -mt-1 cursor-default">|</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="cursor-pointer hover:text-primary"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                  aria-label="Goal options"
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
                    openGoalMode("edit");
                  }}
                >
                  Edit goal
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => {
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  Delete goal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="px-3">
          <Progress value={progress} className="w-full h-1" />
        </CardContent>
        <CardFooter className="px-3 flex items-center justify-between">
          <p className="text-xs">
            Due:{" "}
            {dueDate?.toLocaleDateString("en-us", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-xs">{progress}% complete</p>
        </CardFooter>
      </Card>

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
            <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the goal and its linked milestones
              and non-negotiables.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteGoalMutation.loading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteGoalMutation.loading}
              onClick={async (event) => {
                event.preventDefault();
                event.stopPropagation();
                await handleDeleteGoal();
              }}
            >
              {deleteGoalMutation.loading ? "Deleting..." : "Delete goal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GoalCard;
