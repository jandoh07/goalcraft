"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ComponentProps, useState, useEffect } from "react";
import { DatePicker } from "../ui/date-picker";
import AiCoachTip from "../ai/ai-coach-tip";
import { Goal } from "@/types";
import { goalCategoryOptions } from "@/constants";
import { useAddGoal, useUpdateGoal } from "@/hooks/use-goals";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

interface GoalFormProps extends ComponentProps<"form"> {
  initialData?: Goal;
  mode?: "add" | "edit";
  setOpen: (isOpen: boolean) => void;
}

export default function GoalForm({
  className,
  initialData,
  mode = "add",
  setOpen,
}: GoalFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [category, setCategory] = useState(initialData?.category || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.dueDate
  );
  const { user } = useAuth();
  const addGoalMutation = useAddGoal(user?.uid || "");
  const updateGoalMutation = useUpdateGoal(user?.uid || "");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || "");
      setDueDate(initialData.dueDate);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const goalData = {
      title,
      description,
      category,
      dueDate,
    };

    if (mode === "add") {
      addGoalMutation.mutate(goalData, {
        onSuccess: () => {
          toast.success("Goal created successfully");
          setOpen(false);
        },
        onError: (error) => {
          console.error("Error creating goal:", error);
          toast.error("Failed to create goal. Please try again.");
        },
      });
    } else {
      if (!initialData?.id) return;

      updateGoalMutation.mutate(
        { goalId: initialData.id, updates: goalData },
        {
          onSuccess: () => {
            toast.success("Goal updated successfully");
            setOpen(false);
          },
          onError: (error) => {
            console.error("Error updating goal:", error);
            toast.error("Failed to update goal. Please try again.");
          },
        }
      );
    }
  };
  return (
    <form
      className={cn("grid items-start gap-6", className)}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3">
        <AiCoachTip />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="title">Goal Title</Label>
        <Input
          type="text"
          id="title"
          placeholder="Enter your goal title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Add goal description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="category">Category</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {goalCategoryOptions.map((categoryOption) => {
            const IconComponent = categoryOption.icon;
            const isSelected = category === categoryOption.label;
            return (
              <Button
                key={categoryOption.label}
                type="button"
                variant="outline"
                onClick={() => setCategory(categoryOption.label)}
                className={cn(
                  "w-full h-12 justify-start text-left font-normal gap-2 border-0",
                  categoryOption.bgColor,
                  isSelected &&
                    "ring-2 ring-offset-2 ring-offset-background ring-primary"
                )}
              >
                <IconComponent
                  className={cn(
                    "size-5 flex-shrink-0",
                    categoryOption.iconColor
                  )}
                />
                <span className="truncate font-medium">
                  {categoryOption.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-3">
        <Label htmlFor="due-date">Due Date</Label>
        <DatePicker date={dueDate} onDateChange={setDueDate} />
      </div>
      <Button
        type="submit"
        className="hidden md:block"
        disabled={addGoalMutation.isPending || updateGoalMutation.isPending}
      >
        {addGoalMutation.isPending || updateGoalMutation.isPending ? (
          <div className="flex items-center justify-center gap-2 animate-pulse">
            {mode === "edit" ? "Updating..." : "Adding..."}
          </div>
        ) : mode === "edit" ? (
          "Update Goal"
        ) : (
          "Add Goal"
        )}
      </Button>
    </form>
  );
}
