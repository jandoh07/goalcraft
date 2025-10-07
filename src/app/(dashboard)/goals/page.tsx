import AiCoachTip from "@/components/ai/ai-coach-tip";
import React from "react";
import GoalCard from "@/components/goals/goal-card";
import GoalsHeader from "@/components/goals/goals-header";
import MobileHeader from "@/components/layout/mobile/header";

const Goals = () => {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <MobileHeader title="Your Goals" />
      <AiCoachTip />
      <GoalsHeader />
      <GoalCard />
    </div>
  );
};

export default Goals;
