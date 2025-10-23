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
import { useAuth } from "@/contexts/auth-context";
import { useDeleteGoal } from "@/hooks/use-goals";
import DeleteAlertDialog from "../ui/confirmation-dialog";
import { toast } from "sonner";
import ResponsiveDialog from "../ui/responsive-dialog";
import GoalDetails from "./goal-details";
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
  const { user } = useAuth();
  const deleteGoalMutation = useDeleteGoal(user?.uid || "");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleGoalDeletion = () => {
    if (!goal.id) return;

    deleteGoalMutation.mutate(goal.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        toast.success("Goal deleted successfully");
      },
      onError: (error) => {
        console.error("Error deleting goal:", error);
        toast.error("Failed to delete goal. Please try again.");
      },
    });
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
        className="w-full mb-3 gap-3 cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleCardClick}
      >
        <CardHeader className="[.border-b]:pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div>
                <h3 className="font-semibold">{goal.title}</h3>
                {goal.category && <GoalIcon category={goal.category} />}
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
              <DropdownMenuContent align="end">
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
              <span className="font-semibold">65%</span>
            </div>
            <Progress value={65} className="h-2" />
            <p className="text-xs text-muted-foreground">
              13 of 20 tasks completed
            </p>
          </div>
        </CardContent>
        {/* <CardFooter className="flex items-center justify-between border-t">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Next Task</p>
            <p className="text-xs text-muted-foreground">
              Complete 30-minute run
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          View Tasks
        </Button>
      </CardFooter> */}
      </Card>

      {/* Goal Details Dialog */}
      <ResponsiveDialog
        open={isDetailsOpen}
        setOpen={setIsDetailsOpen}
        title="Goal Details"
        hideSubmitButton={true}
      >
        <GoalDetails goal={goal} />
      </ResponsiveDialog>

      {/* Delete Confirmation Dialog */}
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
