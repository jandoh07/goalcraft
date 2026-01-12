import { useState } from "react";
import { setHours, setMinutes } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TimeBlock } from "../../types/schedule";
import { Trash2, Repeat, Check } from "lucide-react";
import {
  RECURRENCE_PRESETS,
  getRecurrenceDescription,
} from "@/lib/utils/recurrence";

interface ScheduleFormProps {
  mode: "create" | "edit";
  initialBlock?: TimeBlock;
  initialDate?: Date;
  initialHour?: number;
  onSubmit: (
    data: TimeBlock | Omit<TimeBlock, "id" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

type RecurrenceOption = "none" | "daily" | "weekdays" | "weekly" | "custom";

const COLOR_OPTIONS = [
  {
    bg: "bg-amber-500/20",
    border: "border-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    ring: "ring-amber-500",
  },
  {
    bg: "bg-blue-500/20",
    border: "border-blue-500",
    text: "text-blue-700 dark:text-blue-300",
    ring: "ring-blue-500",
  },
  {
    bg: "bg-green-500/20",
    border: "border-green-500",
    text: "text-green-700 dark:text-green-300",
    ring: "ring-green-500",
  },
  {
    bg: "bg-purple-500/20",
    border: "border-purple-500",
    text: "text-purple-700 dark:text-purple-300",
    ring: "ring-purple-500",
  },
  {
    bg: "bg-indigo-500/20",
    border: "border-indigo-500",
    text: "text-indigo-700 dark:text-indigo-300",
    ring: "ring-indigo-500",
  },
  {
    bg: "bg-rose-500/20",
    border: "border-rose-500",
    text: "text-rose-700 dark:text-rose-300",
    ring: "ring-rose-500",
  },
  {
    bg: "bg-cyan-500/20",
    border: "border-cyan-500",
    text: "text-cyan-700 dark:text-cyan-300",
    ring: "ring-cyan-500",
  },
  {
    bg: "bg-violet-500/20",
    border: "border-violet-500",
    text: "text-violet-700 dark:text-violet-300",
    ring: "ring-violet-500",
  },
  {
    bg: "bg-pink-500/20",
    border: "border-pink-500",
    text: "text-pink-700 dark:text-pink-300",
    ring: "ring-pink-500",
  },
  {
    bg: "bg-teal-500/20",
    border: "border-teal-500",
    text: "text-teal-700 dark:text-teal-300",
    ring: "ring-teal-500",
  },
];

function getColorString(option: (typeof COLOR_OPTIONS)[number]): string {
  return `${option.bg} ${option.border} ${option.text}`;
}

function parseColorString(
  colorString: string
): (typeof COLOR_OPTIONS)[number] | undefined {
  return COLOR_OPTIONS.find(
    (opt) => colorString.includes(opt.bg) && colorString.includes(opt.border)
  );
}

function getRecurrenceOption(rrule?: string): RecurrenceOption {
  if (!rrule) return "none";
  if (rrule === RECURRENCE_PRESETS.daily) return "daily";
  if (rrule === RECURRENCE_PRESETS.weekdays) return "weekdays";
  if (rrule === RECURRENCE_PRESETS.weekly) return "weekly";
  return "custom";
}

export function ScheduleForm({
  mode,
  initialBlock,
  initialDate,
  initialHour = 9,
  onSubmit,
  onCancel,
  onDelete,
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

  const initialColorOption =
    parseColorString(initialBlock?.color || "") || COLOR_OPTIONS[1];
  const [selectedColor, setSelectedColor] = useState(initialColorOption);

  // Recurrence state
  const [isRecurring, setIsRecurring] = useState(
    initialBlock?.isRecurring || false
  );
  const [recurrenceOption, setRecurrenceOption] = useState<RecurrenceOption>(
    getRecurrenceOption(initialBlock?.rrule)
  );
  const [customRrule, setCustomRrule] = useState(
    recurrenceOption === "custom" ? initialBlock?.rrule || "" : ""
  );

  const getRruleString = (): string | undefined => {
    if (!isRecurring) return undefined;
    switch (recurrenceOption) {
      case "daily":
        return RECURRENCE_PRESETS.daily;
      case "weekdays":
        return RECURRENCE_PRESETS.weekdays;
      case "weekly":
        return RECURRENCE_PRESETS.weekly;
      case "custom":
        return customRrule || undefined;
      default:
        return undefined;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    const date = initialDate || new Date();
    const start = setMinutes(setHours(date, startHour), startMinute);
    const end = setMinutes(setHours(date, endHour), endMinute);
    const colorString = getColorString(selectedColor);
    const rrule = getRruleString();

    if (mode === "edit" && initialBlock) {
      onSubmit({
        ...initialBlock,
        title,
        start,
        end,
        color: colorString,
        isRecurring,
        rrule,
      });
    } else {
      // userId will be added by the page component
      onSubmit({
        title,
        start,
        end,
        color: colorString,
        userId: "", // placeholder, will be set in page
        isRecurring,
        rrule,
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
          {COLOR_OPTIONS.map((colorOption, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedColor(colorOption)}
              className={`h-8 rounded-md border-2 transition-all ${
                colorOption.bg
              } ${
                selectedColor === colorOption
                  ? `ring-2 ${colorOption.ring} ring-offset-2 ${colorOption.border}`
                  : "border-transparent hover:border-muted-foreground/30"
              }`}
            >
              {selectedColor === colorOption && (
                <Check className={`h-4 w-4 mx-auto ${colorOption.text}`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Recurrence Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="recurring" className="text-sm font-medium">
              Repeat
            </Label>
          </div>
          <Switch
            id="recurring"
            checked={isRecurring}
            onCheckedChange={(checked) => {
              setIsRecurring(checked);
              if (!checked) {
                setRecurrenceOption("none");
              } else if (recurrenceOption === "none") {
                setRecurrenceOption("weekly");
              }
            }}
          />
        </div>

        {isRecurring && (
          <div className="space-y-3 pl-6 border-l-2 border-muted">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRecurrenceOption("daily")}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  recurrenceOption === "daily"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 border-border hover:bg-muted"
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setRecurrenceOption("weekdays")}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  recurrenceOption === "weekdays"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 border-border hover:bg-muted"
                }`}
              >
                Weekdays
              </button>
              <button
                type="button"
                onClick={() => setRecurrenceOption("weekly")}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  recurrenceOption === "weekly"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 border-border hover:bg-muted"
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setRecurrenceOption("custom")}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  recurrenceOption === "custom"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 border-border hover:bg-muted"
                }`}
              >
                Custom
              </button>
            </div>

            {recurrenceOption === "custom" && (
              <div>
                <Label
                  htmlFor="custom-rrule"
                  className="text-xs text-muted-foreground"
                >
                  RRule (e.g., FREQ=WEEKLY;BYDAY=MO,WE,FR)
                </Label>
                <Input
                  id="custom-rrule"
                  value={customRrule}
                  onChange={(e) => setCustomRrule(e.target.value)}
                  placeholder="FREQ=WEEKLY;BYDAY=MO,WE,FR"
                  className="mt-1 text-sm font-mono"
                />
              </div>
            )}

            {recurrenceOption !== "none" && recurrenceOption !== "custom" && (
              <p className="text-xs text-muted-foreground">
                {getRecurrenceDescription(
                  recurrenceOption === "daily"
                    ? RECURRENCE_PRESETS.daily
                    : recurrenceOption === "weekdays"
                    ? RECURRENCE_PRESETS.weekdays
                    : RECURRENCE_PRESETS.weekly
                )}
              </p>
            )}

            {recurrenceOption === "custom" && customRrule && (
              <p className="text-xs text-muted-foreground">
                {getRecurrenceDescription(customRrule)}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-between pt-4">
        <div>
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {mode === "create" ? "Create Block" : "Update Block"}
          </Button>
        </div>
      </div>
    </form>
  );
}
