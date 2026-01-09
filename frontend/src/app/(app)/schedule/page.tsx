"use client";

import { useState } from "react";
import { startOfWeek, addWeeks, subWeeks } from "date-fns";
import { ScheduleHeader } from "../../../components/schedule/schedule-header";
import { TimeGrid } from "../../../components/schedule/time-grid";
import { generateDummyBlocks } from "./data";
import { TimeBlock } from "../../../types/schedule";

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blocks] = useState<TimeBlock[]>(generateDummyBlocks);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate((d) =>
      direction === "next" ? addWeeks(d, 1) : subWeeks(d, 1)
    );
  };

  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] md:h-[calc(100dvh-56px-48px)] md:-m-6 overflow-hidden">
      <ScheduleHeader
        weekStart={weekStart}
        onNavigate={navigateWeek}
        onToday={goToToday}
      />
      <TimeGrid weekStart={weekStart} blocks={blocks} />
    </div>
  );
}
