"use client";

import { cn } from "@/lib/utils";
import { ComponentProps } from "react";
import useGoalsForm from "@/hooks/use-goals-form";
import Milestones from "./milestones";
import GoalTitle from "./goal-title";
import { NaturalLanguageDatePicker } from "@/components/ui/natural-language-date-picker";
import GoalCategories from "./goal-categories";
import Tasks from "./tasks";
import GoalRelevance from "./goal-relevance";
import { Form } from "@/components/ui/form";

interface GoalFormProps extends ComponentProps<"form"> {
  setOpen: (isOpen: boolean) => void;
  goalForm: ReturnType<typeof useGoalsForm>;
}

export default function GoalForm({ className, goalForm }: GoalFormProps) {
  const { form, onSubmit, handleTasksChange, initialData, mode } = goalForm;

  const title = form.watch("title");
  const relevance = form.watch("relevance");
  const category = form.watch("category");
  const dueDate = form.watch("dueDate");
  const milestones = form.watch("milestones");

  return (
    <Form {...form}>
      <form
        id="goal-form"
        className={cn("grid items-start gap-6", className)}
        onSubmit={onSubmit}
      >
        <GoalTitle
          title={title}
          setTitle={(value) => form.setValue("title", value)}
          initialTitle={initialData?.title}
        />
        <GoalRelevance
          relevance={relevance || ""}
          setRelevance={(value) => form.setValue("relevance", value)}
          title={title}
        />
        <GoalCategories
          category={category}
          setCategory={(value) => form.setValue("category", value)}
          onNewCategory={(value) => form.setValue("newCategory", value)}
        />
        <NaturalLanguageDatePicker
          date={dueDate}
          setDate={(value) => form.setValue("dueDate", value)}
          defaultValue={mode === "add" ? "In 3 months" : ""}
        />
        <Milestones
          milestones={milestones || []}
          setMilestones={(value) => form.setValue("milestones", value)}
          goalTitle={title}
        />
        <Tasks
          goalTitle={title}
          relevance={relevance}
          milestones={milestones}
          onTasksChange={handleTasksChange}
        />
      </form>
    </Form>
  );
}
