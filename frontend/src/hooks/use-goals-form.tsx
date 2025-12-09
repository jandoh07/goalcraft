import { useAuth } from "@/contexts/auth-context";
import { useCallback, useEffect } from "react";
import { useAddGoal, useUpdateGoal } from "./use-goals";
import { toast } from "sonner";
import { Goal, Milestone, Task } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define the form schema with zod
const goalFormSchema = z.object({
  title: z.string().min(1, "Goal title is required"),
  relevance: z.string().default(""),
  category: z.string().min(1, "Category is required"),
  dueDate: z.date().optional(),
  milestones: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string(),
        weight: z.number(),
        completed: z.boolean().optional(),
      })
    )
    .default([]),
  newCategory: z.string().optional(),
  tasks: z
    .array(
      z.object({
        title: z.string(),
        dueDate: z.date().optional(),
        time: z.string().optional(),
        isRecurring: z.boolean(),
        frequency: z.string().optional(),
        status: z.enum(["in-progress", "completed", "pending"]),
      })
    )
    .default([]),
});

export type GoalFormValues = z.infer<typeof goalFormSchema>;

const useGoalsForm = ({
  initialData,
  setInitialData,
  mode,
  setOpen,
}: {
  initialData?: Goal;
  setInitialData: React.Dispatch<React.SetStateAction<Goal | undefined>>;
  mode: "add" | "edit";
  setOpen: (open: boolean) => void;
}) => {
  const { user, refreshUser } = useAuth();
  const addGoalMutation = useAddGoal();
  const updateGoalMutation = useUpdateGoal();

  const form = useForm({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      relevance: initialData?.relevance || "",
      category: initialData?.category || "",
      dueDate: initialData?.dueDate,
      milestones: initialData?.milestones || [],
      newCategory: undefined as string | undefined,
      tasks: [] as GoalFormValues["tasks"],
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        relevance: initialData.relevance || "",
        category: initialData.category || "",
        dueDate: initialData.dueDate,
        milestones: initialData.milestones || [],
        newCategory: undefined,
        tasks: [],
      });
    }
  }, [initialData, form]);

  // Handler to update tasks from Tasks component
  const handleTasksChange = useCallback(
    (
      acceptedTasks: Array<{
        id: string;
        title: string;
        dueDate?: Date;
        time?: string;
        isRecurring: boolean;
        frequency: string;
        reason: string;
      }>
    ) => {
      const formattedTasks = acceptedTasks.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ id, reason, ...task }) => ({
          ...task,
          time: task.time || "",
          status: "in-progress" as const,
        })
      );
      form.setValue("tasks", formattedTasks);
    },
    [form]
  );

  const resetForm = useCallback(() => {
    form.reset({
      title: "",
      relevance: "",
      category: "",
      dueDate: undefined,
      milestones: [],
      newCategory: undefined,
      tasks: [],
    });
  }, [form]);

  const onSubmit = form.handleSubmit((data) => {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const goalData = {
      title: data.title,
      relevance: data.relevance,
      category: data.category,
      dueDate: data.dueDate,
      milestones: data.milestones as Milestone[],
    };

    if (mode === "add") {
      addGoalMutation.mutate(
        {
          userId: user?.uid || "",
          goalData,
          newCategory: data.newCategory,
          tasks: data.tasks as Omit<
            Task,
            "id" | "createdAt" | "updatedAt" | "userId" | "goalId"
          >[],
        },
        {
          onSuccess: () => {
            if (data.newCategory) refreshUser();
          },
        }
      );

      toast.success(
        isOnline
          ? "Goal created successfully"
          : "Goal created! Will sync when online."
      );
      setOpen(false);
      resetForm();
    } else {
      if (!initialData?.id) return;
      updateGoalMutation.mutate({ goalId: initialData.id, updates: goalData });

      toast.success(
        isOnline
          ? "Goal updated successfully"
          : "Goal updated! Will sync when online."
      );
      setOpen(false);
      resetForm();
    }
  });

  const handleAddNew = () => {
    setInitialData(undefined);
    resetForm();
    setOpen(true);
  };

  // For external form submission (e.g., from dialog submit button)
  const handleExternalFormSubmit = () => {
    onSubmit();
  };

  return {
    form,
    handleTasksChange,
    onSubmit,
    handleAddNew,
    handleExternalFormSubmit,
    mutation: mode === "add" ? addGoalMutation : updateGoalMutation,
    resetFormData: resetForm,
    initialData,
    mode,
  };
};

export default useGoalsForm;
