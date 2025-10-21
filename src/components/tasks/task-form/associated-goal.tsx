import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target } from "lucide-react";

const AssociatedGoal = ({
  associatedGoal,
  setAssociatedGoal,
}: {
  associatedGoal: string;
  setAssociatedGoal: (goal: string) => void;
}) => {
  return (
    <div className="grid gap-3">
      <Label htmlFor="goal">
        <Target className="size-4 inline mr-2" />
        Associated Goal
      </Label>
      <Select value={associatedGoal} onValueChange={setAssociatedGoal}>
        <SelectTrigger>
          <SelectValue placeholder="Select a goal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fitness">Get Fit & Healthy</SelectItem>
          <SelectItem value="career">Advance My Career</SelectItem>
          <SelectItem value="finance">Save $10,000</SelectItem>
          <SelectItem value="education">Learn Web Development</SelectItem>
          <SelectItem value="none">No Goal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AssociatedGoal;
