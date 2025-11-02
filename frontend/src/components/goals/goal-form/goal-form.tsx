"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ComponentProps } from "react";
import { DatePicker } from "../../ui/date-picker";
import { goalCategoryOptions } from "@/constants";
import useGoalsForm from "@/hooks/use-goals-form";
import Milestones from "./milestones";
import GoalTitle from "./goal-title";
import GoalDescription from "./goal-description";

interface GoalFormProps extends ComponentProps<"form"> {
  setOpen: (isOpen: boolean) => void;
  goalForm: ReturnType<typeof useGoalsForm>;
}

export default function GoalForm({ className, goalForm }: GoalFormProps) {
  const { handleSubmit, formData, setters, initialData } = goalForm;

  return (
    <form
      id="goal-form"
      className={cn("grid items-start gap-6", className)}
      onSubmit={handleSubmit}
    >
      <GoalTitle
        title={formData.title}
        setTitle={setters.setTitle}
        initialTitle={initialData?.title}
      />
      <GoalDescription
        description={formData.description}
        setDescription={setters.setDescription}
        title={formData.title}
      />
      <div className="grid gap-3">
        <Label htmlFor="category">Category</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {goalCategoryOptions.map((categoryOption) => {
            const IconComponent = categoryOption.icon;
            const isSelected = formData.category === categoryOption.label;
            return (
              <Button
                key={categoryOption.label}
                type="button"
                variant="outline"
                onClick={() => setters.setCategory(categoryOption.label)}
                className={cn(
                  "w-full h-12 justify-start text-left font-normal gap-2 border-0",
                  categoryOption.bgColor,
                  isSelected &&
                    "ring-2 ring-offset-2 ring-offset-background ring-primary"
                )}
              >
                <IconComponent
                  className={cn("size-5 shrink-0", categoryOption.iconColor)}
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
        <DatePicker date={formData.dueDate} onDateChange={setters.setDueDate} />
      </div>
      <Milestones
        milestones={formData.milestones}
        setMilestones={setters.setMilestones}
        goalTitle={formData.title}
      />
    </form>
  );
}
