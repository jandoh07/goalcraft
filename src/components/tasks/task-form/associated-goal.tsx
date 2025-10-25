import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { useGoals } from "@/hooks/use-goals";
import type { AssociatedGoal } from "@/types";
import { Target } from "lucide-react";

const AssociatedGoal = ({
  associatedGoal,
  setAssociatedGoal,
}: {
  associatedGoal: AssociatedGoal;
  setAssociatedGoal: React.Dispatch<React.SetStateAction<AssociatedGoal>>;
}) => {
  const { user } = useAuth();
  const { data: goals, isLoading } = useGoals(user?.uid || "", "in-progress");

  const handleSelectChange = (value: string) => {
    const selectedGoal = goals?.find((goal) => goal.id === value);
    setAssociatedGoal({
      goalId: value,
      goalTitle: selectedGoal?.title || "",
    });
  };

  return (
    <div className="grid gap-3">
      <Label htmlFor="goal">
        <Target className="size-4 inline mr-2" />
        Associated Goal
      </Label>
      <Select
        value={associatedGoal?.goalId || ""}
        onValueChange={handleSelectChange}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={
              goals && goals.length > 0
                ? "Select a goal"
                : "No goals in progress"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {isLoading && (
            <div className="flex w-full justify-center items-center">
              Loading...
            </div>
          )}
          {goals &&
            goals.length > 0 &&
            goals.map((goal) => (
              <SelectItem key={goal.id} value={goal.id || ""}>
                {goal.title}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AssociatedGoal;
