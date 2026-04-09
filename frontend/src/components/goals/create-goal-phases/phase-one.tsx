import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateGoalPhaseHeader } from "./phase-header";
import { useEffect, useState } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type DurationUnit = "days" | "weeks" | "months" | "years";

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseInputDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);
  const parsed = new Date(year, month, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return startOfDay(parsed);
};

const toPreviewDate = (date: Date) =>
  `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

const addDuration = (base: Date, value: number, unit: DurationUnit) => {
  const next = new Date(base);

  if (unit === "days") {
    next.setDate(next.getDate() + value);
  } else if (unit === "weeks") {
    next.setDate(next.getDate() + value * 7);
  } else if (unit === "months") {
    next.setMonth(next.getMonth() + value);
  } else {
    next.setFullYear(next.getFullYear() + value);
  }

  return startOfDay(next);
};

const isSameCalendarDate = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getDurationFromDueDate = (dueDate: string) => {
  const target = parseInputDate(dueDate);
  const today = startOfDay(new Date());

  if (!target || target <= today) {
    return { value: "", unit: "weeks" as DurationUnit };
  }

  const yearsDiff = target.getFullYear() - today.getFullYear();
  if (
    yearsDiff > 0 &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate() &&
    isSameCalendarDate(addDuration(today, yearsDiff, "years"), target)
  ) {
    return { value: String(yearsDiff), unit: "years" as DurationUnit };
  }

  const monthsDiff =
    (target.getFullYear() - today.getFullYear()) * 12 +
    (target.getMonth() - today.getMonth());
  if (
    monthsDiff > 0 &&
    today.getDate() === target.getDate() &&
    isSameCalendarDate(addDuration(today, monthsDiff, "months"), target)
  ) {
    return { value: String(monthsDiff), unit: "months" as DurationUnit };
  }

  const dayDiff = Math.round((target.getTime() - today.getTime()) / DAY_MS);
  if (dayDiff % 7 === 0) {
    return { value: String(dayDiff / 7), unit: "weeks" as DurationUnit };
  }

  return { value: String(dayDiff), unit: "days" as DurationUnit };
};

interface CreateGoalPhaseOneProps {
  title: string;
  setTitle: (title: string) => void;
  dueDate: string;
  setDueDate: (date: string) => void;
}

export const CreateGoalPhaseOne = ({
  title,
  setTitle,
  dueDate,
  setDueDate,
}: CreateGoalPhaseOneProps) => {
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("weeks");
  const [durationValue, setDurationValue] = useState("");

  useEffect(() => {
    const parsedValue = Number(durationValue);

    if (!durationValue || !Number.isInteger(parsedValue) || parsedValue <= 0) {
      if (dueDate !== "") {
        setDueDate("");
      }
      return;
    }

    const nextDueDate = toInputDate(
      addDuration(startOfDay(new Date()), parsedValue, durationUnit),
    );

    if (dueDate !== nextDueDate) {
      setDueDate(nextDueDate);
    }
  }, [durationUnit, durationValue, dueDate, setDueDate]);

  useEffect(() => {
    const nextDuration = getDurationFromDueDate(dueDate);

    setDurationValue((prev) =>
      prev === nextDuration.value ? prev : nextDuration.value,
    );
    setDurationUnit((prev) =>
      prev === nextDuration.unit ? prev : nextDuration.unit,
    );
  }, [dueDate]);

  const parsedDueDate = parseInputDate(dueDate);

  return (
    <div className="flex-1 space-y-5">
      <CreateGoalPhaseHeader
        title="Set your goal"
        subheading="Give your goal a name and a timeframe."
      />

      <div className="space-y-2">
        <Label htmlFor="goal-title">Goal name</Label>
        <Input
          id="goal-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Describe the goal you want to complete"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal-duration-value">Duration</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_170px]">
          <Input
            id="goal-duration-value"
            inputMode="numeric"
            value={durationValue}
            onChange={(event) =>
              setDurationValue(event.target.value.replace(/[^0-9]/g, ""))
            }
            placeholder="12"
          />
          <Select
            value={durationUnit}
            onValueChange={(value) => setDurationUnit(value as DurationUnit)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="weeks">Weeks</SelectItem>
              <SelectItem value="months">Months</SelectItem>
              <SelectItem value="years">Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          {parsedDueDate && `Due date: ${toPreviewDate(parsedDueDate)}`}
        </p>
      </div>
    </div>
  );
};
