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
  const addGoalMutation = useAddGoal();
  const updateGoalMutation = useUpdateGoal();

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
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const goalData = {
      title,
      description,
      category,
      dueDate,
    };

    if (mode === "add") {
      addGoalMutation.mutate({ userId: user?.uid || "", goalData });

      toast.success(
        isOnline
          ? "Goal created successfully"
          : "Goal created! Will sync when online."
      );
      setOpen(false);
    } else {
      if (!initialData?.id) return;
      updateGoalMutation.mutate({ goalId: initialData.id, updates: goalData });

      toast.success(
        isOnline
          ? "Goal updated successfully"
          : "Goal updated! Will sync when online."
      );
      setOpen(false);
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
