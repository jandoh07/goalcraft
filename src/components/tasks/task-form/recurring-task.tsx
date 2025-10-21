import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import React from "react";

const RecurringTask = ({
  isRecurring,
  setIsRecurring,
  frequency,
  setFrequency,
}: {
  isRecurring: boolean;
  setIsRecurring: (value: boolean) => void;
  frequency: string;
  setFrequency: (value: string) => void;
}) => {
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="recurring">Repeat Task</Label>
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
        />
      </div>
      {isRecurring && (
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
