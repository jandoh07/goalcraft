import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GoalTitleProps {
  title: string;
  setTitle: (title: string) => void;
  initialTitle?: string;
}

const GoalTitle = ({ title, setTitle, initialTitle }: GoalTitleProps) => {
  return (
    <div className="space-y-3">
      <Label htmlFor="title">Goal Title</Label>
      <Input
        type="text"
        id="title"
        placeholder="Enter your goal title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
    </div>
  );
};

export default GoalTitle;
