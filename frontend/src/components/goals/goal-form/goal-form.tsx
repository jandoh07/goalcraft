"use client";

import { cn } from "@/lib/utils";
import { ComponentProps } from "react";
import useGoalsForm from "@/hooks/use-goals-form";
import Milestones from "./milestones";
import GoalTitle from "./goal-title";
import GoalDescription from "./goal-description";
import { NaturalLanguageDatePicker } from "@/components/ui/natural-language-date-picker";
import GoalCategories from "./goal-categories";
import Tasks from "./tasks";

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
      <GoalCategories
        category={formData.category}
        setCategory={setters.setCategory}
        onNewCategory={setters.setNewCategory}
      />
      <NaturalLanguageDatePicker
        date={formData.dueDate}
        setDate={setters.setDueDate}
        defaultValue={goalForm.mode === "add" ? "In 3 months" : ""}
      />
      <Milestones
        milestones={formData.milestones}
        setMilestones={setters.setMilestones}
        goalTitle={formData.title}
      />
      <Tasks
        goalTitle={formData.title}
        description={formData.description}
        milestones={formData.milestones}
      />
    </form>
  );
}
