import { Button } from "@/components/ui/button";
import generateFrequencyTags, {
  days,
  describeFrequencyTags,
  parseInitialState,
  QuickFrequency,
} from "@/lib/utils/non-negotiable-recurrence";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Separator } from "../ui/separator";
import { CalendarDays, Minus, Plus } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface NonNegotiableFrequencyPickerProps {
  value: string[];
  onChange: (nextFrequency: string[]) => void;
}

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

const areSameTags = (a: string[], b: string[]) => {
  if (a.length !== b.length) {
    return false;
  }

  const bSet = new Set(b);
  return a.every((entry) => bSet.has(entry));
};

export function NonNegotiableFrequencyPicker({
  value,
  onChange,
}: NonNegotiableFrequencyPickerProps) {
  const [state, setState] = useState(() => parseInitialState(value));

  const selectedMonthDates = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return state.selectedMonthDayNumbers
      .filter((day) => day >= 1 && day <= daysInMonth)
      .map((day) => new Date(year, month, day));
  }, [state.selectedMonthDayNumbers]);

  const frequencyInterpretation = useMemo(
    () => describeFrequencyTags(value),
    [value],
  );

  const repeatEveryLabel =
    frequencyInterpretation === "choose a schedule" ||
    frequencyInterpretation === "custom schedule"
      ? "Repeat every"
      : `Repeat every ${frequencyInterpretation}`;

  const updateCustomState = (updates: Partial<typeof state>) => {
    const next = { ...state, ...updates };
    setState(next);

    if (next.active !== "custom" || !next.customFrequency) return;

    let newTags: string[] = [];
    if (next.customFrequency === "Xdays") {
      newTags = generateFrequencyTags("Xdays", next.interval);
    } else if (
      next.customFrequency === "Xweeks" &&
      next.selectedDays.length > 0
    ) {
      newTags = generateFrequencyTags(
        "Xweeks",
        next.selectedDays,
        next.interval,
      );
    } else if (
      next.customFrequency === "Xmonths" &&
      next.selectedMonthDayNumbers.length > 0
    ) {
      newTags = generateFrequencyTags(
        "Xmonths",
        next.selectedMonthDayNumbers,
        next.interval,
      );
    }

    if (!areSameTags(newTags, value)) {
      onChange(newTags);
    }
  };

  const handleFrequencyClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    val: string,
  ) => {
    event.preventDefault();

    if (val === "custom") {
      const nextCustomFreq = state.customFrequency || "Xdays";
      updateCustomState({ active: val, customFrequency: nextCustomFreq });
      return;
    }

    setState({ ...state, active: val });
    onChange(generateFrequencyTags(val as QuickFrequency));
  };

  return (
    <div className="space-y-3">
      <div className="space-x-2 space-y-2">
        {frequencyOptions.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            type="button"
            size={"sm"}
            className={cn("rounded-2xl", {
              "bg-primary dark:bg-primary text-primary-foreground hover:bg-primary/70 dark:hover:bg-primary/70":
                option.value === state.active,
            })}
            onClick={(event) => handleFrequencyClick(event, option.value)}
          >
            {option.label}
          </Button>
        ))}
        {state.active === "custom" && (
          <div className="py-2">
            <Separator />
            <p className="text-sm text-muted-foreground my-2">
              {repeatEveryLabel}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={() =>
                  updateCustomState({
                    interval: Math.max(1, state.interval - 1),
                  })
                }
              >
                <Minus />
              </Button>
              <p className="px-2">{state.interval}</p>
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={() =>
                  updateCustomState({ interval: state.interval + 1 })
                }
              >
                <Plus />
              </Button>
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={() => updateCustomState({ customFrequency: "Xdays" })}
                className={cn({
                  "bg-primary dark:bg-primary text-primary-foreground hover:bg-primary/70 dark:hover:bg-primary/70":
                    state.customFrequency === "Xdays",
                })}
              >
                Days
              </Button>
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={() => updateCustomState({ customFrequency: "Xweeks" })}
                className={cn({
                  "bg-primary dark:bg-primary text-primary-foreground hover:bg-primary/70 dark:hover:bg-primary/70":
                    state.customFrequency === "Xweeks",
                })}
              >
                Weeks
              </Button>
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={() =>
                  updateCustomState({ customFrequency: "Xmonths" })
                }
                className={cn({
                  "bg-primary dark:bg-primary text-primary-foreground hover:bg-primary/70 dark:hover:bg-primary/70":
                    state.customFrequency === "Xmonths",
                })}
              >
                Months
              </Button>
              {state.customFrequency === "Xmonths" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size={"sm"} type="button">
                      <CalendarDays />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="multiple"
                      selected={selectedMonthDates}
                      onSelect={(dates) => {
                        const monthDays = [
                          ...new Set(
                            (dates ?? []).map((date) => date.getDate()),
                          ),
                        ].sort((a, b) => a - b);

                        updateCustomState({
                          selectedMonthDayNumbers: monthDays,
                        });
                      }}
                      classNames={{
                        today: "rounded-md",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        )}
        {state.active === "custom" && state.customFrequency === "Xweeks" && (
          <div className="">
            <p className="text-sm text-muted-foreground my-2">On days</p>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <Button
                  key={day}
                  variant="outline"
                  size={"sm"}
                  className={cn("", {
                    "bg-primary dark:bg-primary text-primary-foreground hover:bg-primary/70 dark:hover:bg-primary/70":
                      state.selectedDays.includes(day),
                  })}
                  onClick={() => {
                    if (state.selectedDays.includes(day)) {
                      updateCustomState({
                        selectedDays: state.selectedDays.filter(
                          (d) => d !== day,
                        ),
                      });
                    } else {
                      updateCustomState({
                        selectedDays: [...state.selectedDays, day],
                      });
                    }
                  }}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
