"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/types";
import { useDeleteGoal } from "@/hooks/use-goals";
import DeleteAlertDialog from "../ui/confirmation-dialog";
import { toast } from "sonner";
import ResponsiveDialog from "../ui/responsive-dialog";
import GoalDetails from "./goal-details/goal-details";
import GoalIcon from "./goal-icon";

const GoalCard = ({
  goal,
  setInitialData,
  setOpen,
}: {
  goal: Goal;
  setInitialData: React.Dispatch<React.SetStateAction<Goal | undefined>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const deleteGoalMutation = useDeleteGoal();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Use embedded task counts from goal document
  const totalTasks = goal.totalTasks || 0;
  const completedTasks = goal.completedTasks || 0;

  const isOverdue = goal.dueDate
    ? new Date(goal.dueDate) < new Date() && goal.status !== "completed"
    : false;

  const handleGoalDeletion = () => {
    if (!goal.id) return;
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    deleteGoalMutation.mutate(goal.id);
    setIsDeleteDialogOpen(false);
    toast.success(
      isOnline
        ? "Goal deleted successfully"
        : "Goal deleted! Will sync when online."
    );
  };

  const handleGoalEdit = () => {
    setInitialData(goal);
    setOpen(true);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent opening details when clicking on dropdown menu
    if ((e.target as HTMLElement).closest('[role="button"]')) {
      return;
    }
    setIsDetailsOpen(true);
  };

  return (
    <div>
      <Card
        className={`w-full mb-3 gap-3 cursor-pointer hover:shadow-md transition-shadow ${
          isOverdue ? "bg-destructive/10 border-destructive" : ""
        }`}
        onClick={handleCardClick}
      >
        <CardHeader className="[.border-b]:pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div>
                <h3 className="font-semibold">{goal.title}</h3>
                <div className="flex items-center gap-2">
                  {goal.category && <GoalIcon category={goal.category} />}
                  {isOverdue && (
                    <span className="text-xs text-destructive font-medium">
                      Overdue
                    </span>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="Goal options"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem onSelect={handleGoalEdit}>
                  Edit Goal
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => console.log("Share")}>
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  Delete Goal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{goal.progress || 0}%</span>
            </div>
            <Progress value={goal.progress || 0} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {totalTasks === 0
                ? "No tasks for this goal yet"
                : `${completedTasks} of ${totalTasks} tasks completed`}
            </p>
          </div>
        </CardContent>
      </Card>
      <ResponsiveDialog
        title="Goal Details"
        description="View the details of your goal."
        open={isDetailsOpen}
        setOpen={setIsDetailsOpen}
        hideSubmitButton={true}
      >
        <GoalDetails goal={goal} />
      </ResponsiveDialog>
      <DeleteAlertDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleGoalDeletion}
        onCancel={() => setIsDeleteDialogOpen(false)}
        preset="deleteGoal"
      />
    </div>
  );
};

export default GoalCard;
