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
  setStopRecurring,
  stopRecurring,
}: {
  isRecurring: boolean;
  setIsRecurring: (value: boolean) => void;
  frequency: string;
  setFrequency: (value: string) => void;
  recurringMasterId?: string;
  setStopRecurring: (value: boolean) => void;
  stopRecurring: boolean;
}) => {
  // For new tasks: show switch based on isRecurring
  // For existing recurring tasks: show switch as on if not stopped
  const isSwitchOn = recurringMasterId 
    ? !stopRecurring 
    : isRecurring;

  const handleCheckedChange = (checked: boolean) => {
    if (checked) {
      setIsRecurring(true);
      setStopRecurring(false);
      if (!frequency) {
        setFrequency("daily");
      }
    } else {
      setIsRecurring(false);
      // Only set stopRecurring if this is an existing recurring task
      if (recurringMasterId) {
        setStopRecurring(true);
      }
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
