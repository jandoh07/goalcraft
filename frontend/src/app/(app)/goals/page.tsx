import MobileHeader from "@/components/layout/mobile/header";
import GoalModeDialog from "@/components/goals/goal-mode-dialog";
import OpenGoalDialogButton from "@/components/goals/open-goal-dialog-button";
import { GoalProvider } from "@/contexts/goal-context";
import GoalCard from "@/components/goals/goal-card";

const Goals = () => {
  return (
    <GoalProvider>
      <div>
        <div className="max-w-7xl h-full mx-auto p-2 md:p-3 relative flex flex-col">
          <MobileHeader title="Goals" />

          <div>
            <GoalCard goalId="goal-1" title="Run 10km without stopping" />
          </div>
        </div>
        <OpenGoalDialogButton />
        <GoalModeDialog />
      </div>
    </GoalProvider>
  );
};

export default Goals;
