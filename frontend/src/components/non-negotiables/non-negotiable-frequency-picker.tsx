import { Button } from "@/components/ui/button";
import generateFrequencyTags, {
  describeFrequencyTags,
  Frequency,
  QuickFrequency,
} from "@/lib/utils/non-negotiable-recurrence";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
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

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const weekdayDays = ["mon", "tue", "wed", "thu", "fri"] as const;
const weekendDays = ["sat", "sun"] as const;

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
  const [active, setActive] = useState<string | null>(null);
  const [interval, setInterval] = useState(1);
  const [customFrequency, setCustomFrequency] = useState<Exclude<
    Frequency,
    QuickFrequency
  > | null>(null);
  const [selectedDays, setSelectedDays] = useState<(typeof days)[number][]>([]);
  const [selectedMonthDayNumbers, setSelectedMonthDayNumbers] = useState<
    number[]
  >([]);

  const selectedMonthDates = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return selectedMonthDayNumbers
      .filter((day) => day >= 1 && day <= daysInMonth)
      .map((day) => new Date(year, month, day));
  }, [selectedMonthDayNumbers]);

  const frequencyInterpretation = useMemo(
    () => describeFrequencyTags(value),
    [value],
  );

  const repeatEveryLabel =
    frequencyInterpretation === "choose a schedule" ||
    frequencyInterpretation === "custom schedule"
      ? "Repeat every"
      : `Repeat every ${frequencyInterpretation}`;

  const emitFrequencyChange = useCallback(
    (nextFrequency: string[]) => {
      if (areSameTags(nextFrequency, value)) {
        return;
      }

      onChange(nextFrequency);
    },
    [onChange, value],
  );

  useEffect(() => {
    const uniqueTags = [...new Set(value)];
    const tagSet = new Set(uniqueTags);

    const isDaily =
      tagSet.size === days.length && days.every((day) => tagSet.has(day));
    if (isDaily) {
      setActive("daily");
      setCustomFrequency(null);
      return;
    }

    const isWeekdays =
      tagSet.size === weekdayDays.length &&
      weekdayDays.every((day) => tagSet.has(day));
    if (isWeekdays) {
      setActive("weekdays");
      setCustomFrequency(null);
      return;
    }

    const isWeekends =
      tagSet.size === weekendDays.length &&
      weekendDays.every((day) => tagSet.has(day));
    if (isWeekends) {
      setActive("weekends");
      setCustomFrequency(null);
      return;
    }

    if (
      uniqueTags.length === 1 &&
      days.includes(uniqueTags[0] as (typeof days)[number])
    ) {
      setActive("weekly");
      setCustomFrequency(null);
      return;
    }

    if (uniqueTags.length === 1 && /^\d+M$/.test(uniqueTags[0])) {
      setActive("monthly");
      setCustomFrequency(null);
      return;
    }

    const xDaysMatches = uniqueTags
      .map((tag) => tag.match(/^(\d+)D_\d+$/))
      .filter((match): match is RegExpMatchArray => !!match);

    if (xDaysMatches.length > 0 && xDaysMatches.length === uniqueTags.length) {
      setActive("custom");
      setCustomFrequency("Xdays");
      setInterval(Number(xDaysMatches[0][1]));
      setSelectedDays([]);
      setSelectedMonthDayNumbers([]);
      return;
    }

    const xWeeksMatches = uniqueTags
      .map((tag) => tag.match(/^(sun|mon|tue|wed|thu|fri|sat)_(\d+)W_\d+$/))
      .filter((match): match is RegExpMatchArray => !!match);

    if (
      xWeeksMatches.length > 0 &&
      xWeeksMatches.length === uniqueTags.length
    ) {
      setActive("custom");
      setCustomFrequency("Xweeks");
      setInterval(Number(xWeeksMatches[0][2]));
      setSelectedDays(
        [
          ...new Set(
            xWeeksMatches.map((match) => match[1] as (typeof days)[number]),
          ),
        ].sort((a, b) => days.indexOf(a) - days.indexOf(b)),
      );
      setSelectedMonthDayNumbers([]);
      return;
    }

    const xMonthsMatches = uniqueTags
      .map((tag) => tag.match(/^(\d+)M_\d+_(\d+)$/))
      .filter((match): match is RegExpMatchArray => !!match);
    const isXMonths =
      uniqueTags.length > 0 &&
      uniqueTags.every(
        (tag) => tag === "last_day" || /^(\d+)M_\d+_(\d+)$/.test(tag),
      );

    if (isXMonths) {
      setActive("custom");
      setCustomFrequency("Xmonths");
      setInterval(Number(xMonthsMatches[0]?.[1] ?? 1));
      setSelectedDays([]);
      setSelectedMonthDayNumbers(
        [...new Set(xMonthsMatches.map((match) => Number(match[2])))].sort(
          (a, b) => a - b,
        ),
      );
      return;
    }

    setActive(null);
    setCustomFrequency(null);
    setSelectedDays([]);
    setSelectedMonthDayNumbers([]);
    setInterval(1);
  }, [value]);

  useEffect(() => {
    if (active !== "custom" || !customFrequency) {
      return;
    }

    if (customFrequency === "Xdays") {
      emitFrequencyChange(generateFrequencyTags("Xdays", interval));
      return;
    }

    if (customFrequency === "Xweeks") {
      if (selectedDays.length === 0) {
        emitFrequencyChange([]);
        return;
      }

      emitFrequencyChange(
        generateFrequencyTags("Xweeks", selectedDays, interval),
      );
      return;
    }

    if (selectedMonthDayNumbers.length === 0) {
      emitFrequencyChange([]);
      return;
    }

    emitFrequencyChange(
      generateFrequencyTags("Xmonths", selectedMonthDayNumbers, interval),
    );
  }, [
    active,
    customFrequency,
    emitFrequencyChange,
    interval,
    selectedDays,
    selectedMonthDayNumbers,
  ]);

  const handleFrequencyClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    value: string,
  ) => {
    event.preventDefault();

    if (value === "custom") {
      setActive(value);
      setCustomFrequency(customFrequency || "Xdays");
      return;
    }

    setActive(value);
    onChange(generateFrequencyTags(value as QuickFrequency));
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
                option.value === active,
            })}
            onClick={(event) => handleFrequencyClick(event, option.value)}
          >
            {option.label}
          </Button>
        ))}
        {active === "custom" && (
          <div className="py-2">
            <Separator />
            <p className="text-sm text-muted-foreground my-2">
              {repeatEveryLabel}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={() => setInterval((prev) => Math.max(1, prev - 1))}
              >
                <Minus />
              </Button>
              <p className="px-2">{interval}</p>
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={() => setInterval((prev) => prev + 1)}
              >
                <Plus />
              </Button>
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={() => setCustomFrequency("Xdays")}
                className={cn({
                  "bg-primary dark:bg-primary text-primary-foreground hover:bg-primary/70 dark:hover:bg-primary/70":
                    customFrequency === "Xdays",
                })}
              >
                Days
              </Button>
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={() => setCustomFrequency("Xweeks")}
                className={cn({
                  "bg-primary dark:bg-primary text-primary-foreground hover:bg-primary/70 dark:hover:bg-primary/70":
                    customFrequency === "Xweeks",
                })}
              >
                Weeks
              </Button>
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={() => setCustomFrequency("Xmonths")}
                className={cn({
                  "bg-primary dark:bg-primary text-primary-foreground hover:bg-primary/70 dark:hover:bg-primary/70":
                    customFrequency === "Xmonths",
                })}
              >
                Months
              </Button>
              {customFrequency === "Xmonths" && (
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

                        setSelectedMonthDayNumbers(monthDays);
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
        {active === "custom" && customFrequency === "Xweeks" && (
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
                      selectedDays.includes(day),
                  })}
                  onClick={() => {
                    if (selectedDays.includes(day)) {
                      setSelectedDays(selectedDays.filter((d) => d !== day));
                    } else {
                      setSelectedDays([...selectedDays, day]);
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
