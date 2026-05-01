import type { Weekday } from "@/types/goal";

const MS_PER_DAY = 86400000;

export type Frequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "weekdays"
  | "weekends"
  | "Xdays"
  | "Xweeks"
  | "Xmonths";
type Day = Weekday;
export type QuickFrequency = Exclude<Frequency, "Xdays" | "Xweeks" | "Xmonths">;

export const getLocalUniversalDay = (date = new Date()) => {
  const localTimeMs = date.getTime() - date.getTimezoneOffset() * 60000;
  return Math.floor(localTimeMs / MS_PER_DAY);
};

export const getLocalUniversalWeek = (date = new Date()) => {
  return Math.floor((getLocalUniversalDay(date) + 4) / 7);
};

export const getLocalUniversalMonth = (date = new Date()) => {
  return (date.getFullYear() - 1970) * 12 + date.getMonth();
};

const getDayName = (date = new Date()): Weekday => {
  return date
    .toLocaleDateString("en-US", { weekday: "short" })
    .toLowerCase() as Weekday;
};

const WEEKDAY_ORDER: Weekday[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

const DAY_LABELS: Record<Weekday, string> = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

const joinWithAnd = (items: string[]) => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
};

const toOrdinal = (value: number) => {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) return `${value}st`;
  if (mod10 === 2 && mod100 !== 12) return `${value}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${value}rd`;
  return `${value}th`;
};

const isWeekdayTag = (tag: string): tag is Weekday => {
  return WEEKDAY_ORDER.includes(tag as Weekday);
};

const sortWeekdays = (days: Weekday[]) => {
  const unique = [...new Set(days)];
  return unique.sort(
    (a, b) => WEEKDAY_ORDER.indexOf(a) - WEEKDAY_ORDER.indexOf(b),
  );
};

export const describeFrequencyTags = (tags: string[]) => {
  if (tags.length === 0) {
    return "choose a schedule";
  }

  const uniqueTags = [...new Set(tags)];
  const tagSet = new Set(uniqueTags);
  const weekdaysSet = new Set(["mon", "tue", "wed", "thu", "fri"]);
  const weekendsSet = new Set(["sat", "sun"]);

  if (
    WEEKDAY_ORDER.every((day) => tagSet.has(day)) &&
    tagSet.size === WEEKDAY_ORDER.length
  ) {
    return "day";
  }

  if (
    [...weekdaysSet].every((day) => tagSet.has(day)) &&
    tagSet.size === weekdaysSet.size
  ) {
    return "weekday";
  }

  if (
    [...weekendsSet].every((day) => tagSet.has(day)) &&
    tagSet.size === weekendsSet.size
  ) {
    return "weekend";
  }

  if (uniqueTags.length === 1 && isWeekdayTag(uniqueTags[0])) {
    return DAY_LABELS[uniqueTags[0]];
  }

  const xDaysMatches = uniqueTags.map((tag) => tag.match(/^(\d+)D_\d+$/));
  if (xDaysMatches.every((match) => !!match)) {
    const interval = Number(xDaysMatches[0]?.[1] ?? 1);
    return interval === 1 ? "day" : `${interval} days`;
  }

  const xWeeksMatches = uniqueTags.map((tag) =>
    tag.match(/^(sun|mon|tue|wed|thu|fri|sat)_(\d+)W_\d+$/),
  );
  if (xWeeksMatches.every((match) => !!match)) {
    const interval = Number(xWeeksMatches[0]?.[2] ?? 1);
    const dayNames = sortWeekdays(
      xWeeksMatches
        .map((match) => match?.[1])
        .filter((day): day is Weekday => !!day),
    ).map((day) => DAY_LABELS[day]);
    const dayText = joinWithAnd(dayNames);

    return interval === 1 ? dayText : `${interval} weeks on ${dayText}`;
  }

  const isLastDayOnly = uniqueTags.length === 1 && uniqueTags[0] === "last_day";
  if (isLastDayOnly) {
    return "last day of the month";
  }

  const hasOnlyMonthlyTags = uniqueTags.every(
    (tag) => /^\d+M$/.test(tag) || tag === "last_day",
  );
  if (hasOnlyMonthlyTags) {
    const monthDays = uniqueTags
      .filter((tag) => /^\d+M$/.test(tag))
      .map((tag) => Number(tag.replace("M", "")))
      .sort((a, b) => a - b)
      .map((day) => toOrdinal(day));

    const labels =
      tagSet.has("last_day") && !monthDays.includes("last day")
        ? [...monthDays, "last day"]
        : monthDays;

    return `${joinWithAnd(labels)} of the month`;
  }

  const xMonthsMatches = uniqueTags
    .map((tag) => tag.match(/^(\d+)M_\d+_(\d+)$/))
    .filter((match): match is RegExpMatchArray => !!match);

  if (
    xMonthsMatches.length > 0 &&
    xMonthsMatches.length === uniqueTags.length
  ) {
    const interval = Number(xMonthsMatches[0][1]);
    const dateLabels = [
      ...new Set(xMonthsMatches.map((match) => Number(match[2]))),
    ]
      .sort((a, b) => a - b)
      .map((day) => toOrdinal(day));

    const dateText = joinWithAnd(dateLabels);

    return interval === 1
      ? `${dateText} of the month`
      : `${interval} months on ${dateText}`;
  }

  return "custom schedule";
};

export const getTodaySearchTags = (date = new Date()) => {
  const uDay = getLocalUniversalDay(date);
  const uWeek = getLocalUniversalWeek(date);
  const uMonth = getLocalUniversalMonth(date);

  const dayName = date
    .toLocaleDateString("en-US", { weekday: "short" })
    .toLowerCase();
  const dateNum = date.getDate();

  const tags = [dayName, `${dateNum}M`];

  [2, 3, 4, 5, 10, 14].forEach((interval) => {
    tags.push(`${interval}D_${uDay % interval}`);
  });

  [2, 3, 4, 5, 6].forEach((interval) => {
    tags.push(`${dayName}_${interval}W_${uWeek % interval}`);
  });

  [2, 3, 4, 5, 6, 12].forEach((interval) => {
    tags.push(`${interval}M_${uMonth % interval}_${dateNum}`);
  });

  const isLastDay = new Date(date.getTime() + 86400000).getDate() === 1;
  if (isLastDay) tags.push("last_day");

  return tags;
};

function generateFrequencyTags(frequency: QuickFrequency): string[];
function generateFrequencyTags(frequency: "Xdays", interval: number): string[];
function generateFrequencyTags(
  frequency: "Xweeks",
  days: Day[],
  interval: number,
): string[];
function generateFrequencyTags(
  frequency: "Xmonths",
  days: number[],
  interval: number,
): string[];

function generateFrequencyTags(
  frequency: Frequency,
  daysOrInterval?: Day[] | number[] | number,
  interval?: number,
  date = new Date(),
): string[] {
  const uDay = getLocalUniversalDay(date);
  const uWeek = getLocalUniversalWeek(date);
  const uMonth = getLocalUniversalMonth(date);

  if (frequency === "daily") {
    return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  }

  if (frequency === "weekdays") {
    return ["mon", "tue", "wed", "thu", "fri"];
  }

  if (frequency === "weekends") {
    return ["sat", "sun"];
  }

  if (frequency === "weekly") {
    return [getDayName(date)];
  }

  if (frequency === "monthly") {
    const dateNum = date.getDate();
    return [`${dateNum}M`];
  }

  if (frequency === "Xdays") {
    const i = Number(daysOrInterval);

    return [`${i}D_${uDay % i}`];
  }

  if (frequency === "Xweeks") {
    const days = daysOrInterval as Day[];
    const i = Number(interval);

    return days.map((day) => `${day}_${i}W_${uWeek % i}`);
  }

  if (frequency === "Xmonths") {
    const dates = daysOrInterval as number[];
    const i = Number(interval);

    return dates.map((dateNum) => {
      return dateNum === -1 ? "last_day" : `${i}M_${uMonth % i}_${dateNum}`;
    });
  }

  throw new Error("Invalid frequency");
}

export default generateFrequencyTags;
