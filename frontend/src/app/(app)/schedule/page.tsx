"use client";

import { useState } from "react";
import {
  startOfWeek,
  addWeeks,
  subWeeks,
  setHours,
  setMinutes,
} from "date-fns";
import { ScheduleHeader } from "../../../components/schedule/schedule-header";
import { TimeGrid } from "../../../components/schedule/time-grid";
import { ScheduleModal } from "../../../components/schedule/schedule-modal";
import { useScheduleModal } from "../../../hooks/use-schedule-modal";
import { generateDummyBlocks } from "./data";
import { TimeBlock } from "../../../types/schedule";

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blocks, setBlocks] = useState<TimeBlock[]>(generateDummyBlocks);
  const { state, openCreateModal, openEditModal, closeModal } =
    useScheduleModal();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate((d) =>
      direction === "next" ? addWeeks(d, 1) : subWeeks(d, 1)
    );
  };

  const goToToday = () => setCurrentDate(new Date());

  const handleSaveBlock = (data: TimeBlock | Omit<TimeBlock, "id">) => {
    if (state.mode === "create") {
      setBlocks([...blocks, data as TimeBlock]);
    } else {
      setBlocks(
        blocks.map((block) =>
          block.id === (data as TimeBlock).id ? (data as TimeBlock) : block
        )
      );
    }
    closeModal();
  };

  const handleBlockMove = (blockId: string, newDate: Date, newHour: number) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;

        const duration = block.end.getTime() - block.start.getTime();
        const hour = Math.floor(newHour);
        const minutes = (newHour % 1) * 60;

        const newStart = setMinutes(setHours(newDate, hour), minutes);
        const newEnd = new Date(newStart.getTime() + duration);

        return { ...block, start: newStart, end: newEnd };
      })
    );
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] md:h-[calc(100dvh-56px-48px)] md:-m-6 overflow-hidden">
      <ScheduleHeader
        weekStart={weekStart}
        onNavigate={navigateWeek}
        onToday={goToToday}
      />
      <TimeGrid
        weekStart={weekStart}
        blocks={blocks}
        onCreateClick={openCreateModal}
        onEditClick={openEditModal}
        onBlockMove={handleBlockMove}
      />
      <ScheduleModal
        state={state}
        onSubmit={handleSaveBlock}
        onClose={closeModal}
      />
    </div>
  );
}
