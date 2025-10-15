import AiCoachTip from "@/components/ai/ai-coach-tip";
import React from "react";
import GoalCard from "@/components/goals/goal-card";
import GoalsHeader from "@/components/goals/goals-header";
import MobileHeader from "@/components/layout/mobile/header";
import AddButton from "@/components/ui/add-button";

const Goals = () => {
  return (
    <div className="max-w-7xl h-full mx-auto p-4 relative">
      <MobileHeader title="Your Goals" />
      <AiCoachTip />
      <GoalsHeader />
      <GoalCard />
      <AddButton />
    </div>
  );
};

export default Goals;
