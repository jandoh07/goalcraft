import { addDays, setHours, setMinutes } from "date-fns";
import { TimeBlock } from "../../../types/schedule";

export const generateDummyBlocks = (): TimeBlock[] => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(today, 2);

  return [
    {
      id: "1",
      title: "Morning Routine",
      start: setHours(setMinutes(today, 0), 7),
      end: setHours(setMinutes(today, 30), 8),
      color:
        "bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300",
    },
    {
      id: "2",
      title: "Deep Work: Project Alpha",
      start: setHours(setMinutes(today, 0), 9),
      end: setHours(setMinutes(today, 0), 12),
      color: "bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300",
    },
    {
      id: "3",
      title: "Lunch Break",
      start: setHours(setMinutes(today, 0), 12),
      end: setHours(setMinutes(today, 0), 13),
      color:
        "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300",
    },
    {
      id: "4",
      title: "Team Standup",
      start: setHours(setMinutes(today, 0), 14),
      end: setHours(setMinutes(today, 30), 14),
      color:
        "bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-300",
    },
    {
      id: "5",
      title: "Code Review",
      start: setHours(setMinutes(today, 30), 14),
      end: setHours(setMinutes(today, 30), 16),
      color:
        "bg-indigo-500/20 border-indigo-500 text-indigo-700 dark:text-indigo-300",
    },
    {
      id: "6",
      title: "Gym Session",
      start: setHours(setMinutes(tomorrow, 0), 6),
      end: setHours(setMinutes(tomorrow, 30), 7),
      color: "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300",
    },
    {
      id: "7",
      title: "Client Meeting",
      start: setHours(setMinutes(tomorrow, 0), 10),
      end: setHours(setMinutes(tomorrow, 0), 11),
      color: "bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-300",
    },
    {
      id: "8",
      title: "Sprint Planning",
      start: setHours(setMinutes(tomorrow, 0), 14),
      end: setHours(setMinutes(tomorrow, 0), 16),
      color:
        "bg-violet-500/20 border-violet-500 text-violet-700 dark:text-violet-300",
    },
    {
      id: "9",
      title: "Design Review",
      start: setHours(setMinutes(dayAfter, 0), 11),
      end: setHours(setMinutes(dayAfter, 0), 12),
      color: "bg-pink-500/20 border-pink-500 text-pink-700 dark:text-pink-300",
    },
    {
      id: "10",
      title: "Focus Time",
      start: setHours(setMinutes(dayAfter, 0), 14),
      end: setHours(setMinutes(dayAfter, 0), 17),
      color: "bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300",
    },
  ];
};
