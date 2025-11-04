import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const RecurringTask = ({
  isRecurring,
  setIsRecurring,
  frequency,
  setFrequency,
  recurringMasterId,
  setRecurringMasterId,
}: {
  isRecurring: boolean;
  setIsRecurring: (value: boolean) => void;
  frequency: string;
  setFrequency: (value: string) => void;
  recurringMasterId?: string;
  setRecurringMasterId: (value: string) => void;
}) => {
  const isSwitchOn = !!recurringMasterId || isRecurring;

  const handleCheckedChange = (checked: boolean) => {
    if (checked) {
      // --- When turning ON ---
      // This is for "add mode"
      setIsRecurring(true);
      // Default to daily if no frequency is set
      if (!frequency) {
        setFrequency("daily");
      }
    } else {
      // --- When turning OFF ---
      // This is for "edit mode"
      // You must clear both states to stop the recurrence.
      // Your parent component should see this change and show a
      // "Stop Recurrence?" confirmation dialog.
      setIsRecurring(false);
      setRecurringMasterId("");
    }
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="recurring">Repeat Task</Label>
        <Switch
          id="recurring"
          checked={isSwitchOn}
          onCheckedChange={handleCheckedChange}
        />
      </div>
      {isSwitchOn && (
        <div className="grid gap-3 pl-4 border-l-2 border-primary">
          <Label htmlFor="frequency">Frequency</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default RecurringTask;
