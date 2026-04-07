import MobileHeader from "@/components/layout/mobile/header";
import ObjectiveCard from "@/components/objectives/objective-card";
import GoalModeDialog from "@/components/goals/goal-mode-dialog";
import OpenGoalDialogButton from "@/components/goals/open-goal-dialog-button";
import { GoalProvider } from "@/contexts/goal-context";

const Goals = () => {
  return (
    <GoalProvider>
      <div>
        <div className="max-w-7xl h-full mx-auto p-2 md:p-3 relative flex flex-col">
          <MobileHeader title="Goals" />

          <div>
            <ObjectiveCard />
          </div>
        </div>
        <OpenGoalDialogButton />
        <GoalModeDialog />
      </div>
    </GoalProvider>
  );
};

export default Goals;
