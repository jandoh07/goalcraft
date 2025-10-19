"use client";

import AiCoachTip from "@/components/ai/ai-coach-tip";
import React, { useState } from "react";
import GoalCard from "@/components/goals/goal-card";
import GoalsHeader from "@/components/goals/goals-header";
import MobileHeader from "@/components/layout/mobile/header";
import AddButton from "@/components/ui/add-button";
import ResponsiveDialog from "@/components/ui/responsive-dialog";
import GoalForm from "@/components/goals/goal-form";

const Goals = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="max-w-7xl h-full mx-auto p-4 relative">
      <MobileHeader title="Your Goals" />
      <AiCoachTip />
      <GoalsHeader />
      <GoalCard />
      <AddButton onClick={() => setOpen(true)} />
      <ResponsiveDialog
        open={open}
        setOpen={setOpen}
        title="Add Goal"
        submitLabel="Add Goal"
        onSubmit={() => {}}
      >
        <GoalForm />
      </ResponsiveDialog>
    </div>
  );
};

export default Goals;
