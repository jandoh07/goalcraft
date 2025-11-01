import { useAuth } from "@/contexts/auth-context";
import React, { useEffect, useState } from "react";
import { useAddGoal, useUpdateGoal } from "./use-goals";
import { toast } from "sonner";
import { Goal, Milestone } from "@/types";

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
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [category, setCategory] = useState(initialData?.category || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.dueDate
  );
  const [milestones, setMilestones] = useState<Milestone[]>(
    initialData?.milestones || []
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
      setMilestones(initialData.milestones || []);
    }
  }, [initialData]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setDueDate(undefined);
    setMilestones([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const goalData = {
      title,
      description,
      category,
      dueDate,
      milestones,
    };

    if (mode === "add") {
      addGoalMutation.mutate({ userId: user?.uid || "", goalData });

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
  };

  const handleAddNew = () => {
    setInitialData(undefined);
    resetForm();
    setOpen(true);
  };

  const handleExternalFormSubmit = () => {
    if (typeof document === "undefined") return;

    const form = document.getElementById("goal-form");

    if (form) {
      form.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  };

  return {
    formData: {
      title,
      description,
      category,
      dueDate,
      milestones,
    },
    setters: {
      setTitle,
      setDescription,
      setCategory,
      setDueDate,
      setMilestones,
    },
    handleSubmit,
    handleAddNew,
    handleExternalFormSubmit,
    mutation: mode === "add" ? addGoalMutation : updateGoalMutation,
    resetFormData: resetForm,
    initialData,
  };
};

export default useGoalsForm;
