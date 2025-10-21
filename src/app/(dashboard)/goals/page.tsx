"use client";

import AiCoachTip from "@/components/ai/ai-coach-tip";
import React, { useState } from "react";
import GoalCard from "@/components/goals/goal-card";
import GoalsHeader from "@/components/goals/goals-header";
import MobileHeader from "@/components/layout/mobile/header";
import AddButton from "@/components/ui/add-button";
import ResponsiveDialog from "@/components/ui/responsive-dialog";
import GoalForm from "@/components/goals/goal-form";
import { Spinner } from "@/components/ui/spinner";
import { useGoals } from "@/hooks/use-goals";
import { useAuth } from "@/contexts/auth-context";
import { Goal } from "@/types";

const Goals = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { data: goals, isLoading } = useGoals(user?.uid || "");
  const [initialData, setInitialData] = useState<Goal | undefined>(undefined);

  const handleAddNew = () => {
    setInitialData(undefined);
    setOpen(true);
  };

  return (
    <div className="max-w-7xl h-full mx-auto p-3 relative">
      <MobileHeader title="Your Goals" />
      <AiCoachTip />
      {goals && goals.length > 0 && <GoalsHeader />}
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center w-full h-32">
            <Spinner />
          </div>
        ) : goals && goals.length > 0 ? (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              setOpen={setOpen}
              setInitialData={setInitialData}
            />
          ))
        ) : (
          <p className="text-center text-muted-foreground mt-20">
            You have no goals yet. Click the + button to add your first goal!
          </p>
        )}
      </div>
      <AddButton onClick={handleAddNew} />
      <ResponsiveDialog
        open={open}
        setOpen={setOpen}
        title={initialData ? "Edit Goal" : "Add Goal"}
        submitLabel={initialData ? "Update Goal" : "Add Goal"}
        onSubmit={() => {}}
      >
        {initialData && (
          <GoalForm initialData={initialData} setOpen={setOpen} mode="edit" />
        )}
        {!initialData && <GoalForm setOpen={setOpen} />}
      </ResponsiveDialog>
    </div>
  );
};

export default Goals;
