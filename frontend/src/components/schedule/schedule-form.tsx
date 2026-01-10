import { useState } from "react";
import { setHours, setMinutes } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimeBlock } from "../../types/schedule";

interface ScheduleFormProps {
  mode: "create" | "edit";
  initialBlock?: TimeBlock;
  initialDate?: Date;
  initialHour?: number;
  onSubmit: (data: TimeBlock | Omit<TimeBlock, "id">) => void;
  onCancel: () => void;
}

export function ScheduleForm({
  mode,
  initialBlock,
  initialDate,
  initialHour = 9,
  onSubmit,
  onCancel,
}: ScheduleFormProps) {
  const [title, setTitle] = useState(initialBlock?.title || "");
  const [startHour, setStartHour] = useState(
    initialBlock?.start.getHours() || initialHour
  );
  const [startMinute, setStartMinute] = useState(
    initialBlock?.start.getMinutes() || 0
  );
  const [endHour, setEndHour] = useState(
    initialBlock?.end.getHours() || initialHour + 1
  );
  const [endMinute, setEndMinute] = useState(
    initialBlock?.end.getMinutes() || 0
  );
  const [color, setColor] = useState(
    initialBlock?.color ||
      "bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300"
  );

  const colors = [
    "bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300",
    "bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300",
    "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300",
    "bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-300",
    "bg-indigo-500/20 border-indigo-500 text-indigo-700 dark:text-indigo-300",
    "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300",
    "bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-300",
    "bg-violet-500/20 border-violet-500 text-violet-700 dark:text-violet-300",
    "bg-pink-500/20 border-pink-500 text-pink-700 dark:text-pink-300",
    "bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    const date = initialDate || new Date();
    const start = setMinutes(setHours(date, startHour), startMinute);
    const end = setMinutes(setHours(date, endHour), endMinute);

    if (mode === "edit" && initialBlock) {
      onSubmit({
        ...initialBlock,
        title,
        start,
        end,
        color,
      });
    } else {
      onSubmit({
        id: Date.now().toString(),
        title,
        start,
        end,
        color,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title" className="text-sm font-medium">
          Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter block title"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-hour" className="text-sm font-medium">
            Start Time
          </Label>
          <div className="flex gap-2 mt-1">
            <select
              id="start-hour"
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
              className="flex-1 px-2 py-1 border rounded-md text-sm"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
            <select
              value={startMinute}
              onChange={(e) => setStartMinute(Number(e.target.value))}
              className="flex-1 px-2 py-1 border rounded-md text-sm"
            >
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>
                  {m.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="end-hour" className="text-sm font-medium">
            End Time
          </Label>
          <div className="flex gap-2 mt-1">
            <select
              id="end-hour"
              value={endHour}
              onChange={(e) => setEndHour(Number(e.target.value))}
              className="flex-1 px-2 py-1 border rounded-md text-sm"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
            <select
              value={endMinute}
              onChange={(e) => setEndMinute(Number(e.target.value))}
              className="flex-1 px-2 py-1 border rounded-md text-sm"
            >
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>
                  {m.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Color</Label>
        <div className="grid grid-cols-5 gap-2 mt-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 rounded-md border-2 transition-all ${c} ${
                color === c ? "border-foreground" : "border-transparent"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {mode === "create" ? "Create Block" : "Update Block"}
        </Button>
      </div>
    </form>
  );
}
