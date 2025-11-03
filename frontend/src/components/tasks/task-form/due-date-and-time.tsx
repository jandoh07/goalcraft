import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NaturalLanguageDatePicker } from "@/components/ui/natural-language-date-picker";
import { Clock } from "lucide-react";

const DueDateAndTime = ({
  time,
  setTime,
  date,
  setDate,
}: {
  time: string;
  setTime: (value: string) => void;
  date: Date | undefined;
  setDate: (value: Date | undefined) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {/* <Label htmlFor="due-date">Due Date</Label> */}
        {/* <DatePicker date={date} onDateChange={setDate} /> */}
        <NaturalLanguageDatePicker date={date} setDate={setDate} />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="time">
          <Clock className="size-4 inline mr-2" />
          Time
        </Label>
        <Input
          type="time"
          id="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
    </div>
  );
};

export default DueDateAndTime;
