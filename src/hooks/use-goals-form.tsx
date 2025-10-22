import { useAuth } from "@/contexts/auth-context";
import React, { useEffect, useState } from "react";
import { useAddGoal, useUpdateGoal } from "./use-goals";
import { toast } from "sonner";
import { Goal } from "@/types";

const useGoalsForm = ({
  initialData,
  mode,
  setOpen,
}: {
  initialData?: Goal;
  mode: "add" | "edit";
  setOpen: (open: boolean) => void;
}) => {
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

  return {
    formData: {
      title,
      description,
      category,
      dueDate,
    },
    setters: {
      setTitle,
      setDescription,
      setCategory,
      setDueDate,
    },
    handleSubmit,
    mutation: mode === "add" ? addGoalMutation : updateGoalMutation,
  };
};

export default useGoalsForm;
