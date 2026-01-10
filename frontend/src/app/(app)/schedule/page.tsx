"use client";

import { useMemo, useState } from "react";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  setHours,
  setMinutes,
} from "date-fns";
import { ScheduleHeader } from "../../../components/schedule/schedule-header";
import { TimeGrid } from "../../../components/schedule/time-grid";
import { ScheduleModal } from "../../../components/schedule/schedule-modal";
import { useScheduleModal } from "../../../hooks/use-schedule-modal";
import { useSyncedScroll } from "../../../hooks/use-synced-scroll";
import {
  useGetTimeBlocks,
  useAddTimeBlock,
  useUpdateTimeBlock,
  useMoveTimeBlock,
  useDeleteTimeBlock,
} from "../../../hooks/use-schedule";
import { useAuth } from "../../../contexts/auth-context";
import { TimeBlock } from "../../../types/schedule";
import { Loader2 } from "lucide-react";

export default function SchedulePage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { state, openCreateModal, openEditModal, closeModal } =
    useScheduleModal();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

  const {
    headerScrollRef,
    gridScrollRef,
    handleHeaderScroll,
    handleGridScroll,
  } = useSyncedScroll(weekStart);

  const weekStartTime = weekStart.getTime();
  const weekEndTime = weekEnd.getTime();

  const filters = useMemo(
    () => ({
      startDate: new Date(weekStartTime),
      endDate: new Date(weekEndTime),
    }),
    [weekStartTime, weekEndTime]
  );

  const { data: blocks = [], isLoading } = useGetTimeBlocks(
    user?.uid ?? "",
    filters
  );
  const addTimeBlock = useAddTimeBlock();
  const updateTimeBlock = useUpdateTimeBlock();
  const moveTimeBlock = useMoveTimeBlock();
  const deleteTimeBlock = useDeleteTimeBlock();

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate((d) =>
      direction === "next" ? addWeeks(d, 1) : subWeeks(d, 1)
    );
  };

  const goToToday = () => setCurrentDate(new Date());

  const handleSaveBlock = (
    data: TimeBlock | Omit<TimeBlock, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!user) return;

    if (state.mode === "create") {
      addTimeBlock.mutate({
        ...data,
        userId: user.uid,
      } as Omit<TimeBlock, "id" | "createdAt" | "updatedAt">);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, userId, createdAt, ...updates } = data as TimeBlock;
      updateTimeBlock.mutate({ timeBlockId: id, updates });
    }
    closeModal();
  };

  const handleBlockDelete = (blockId: string) => {
    deleteTimeBlock.mutate(blockId);
    closeModal();
  };

  const handleBlockMove = (blockId: string, newDate: Date, newHour: number) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;

    const duration = block.end.getTime() - block.start.getTime();
    const hour = Math.floor(newHour);
    const minutes = (newHour % 1) * 60;

    const newStart = setMinutes(setHours(newDate, hour), minutes);
    const newEnd = new Date(newStart.getTime() + duration);

    moveTimeBlock.mutate({ timeBlockId: blockId, newStart, newEnd });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-4rem)] md:h-[calc(100dvh-56px-48px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] md:h-[calc(100dvh-56px-48px)] md:-m-6 overflow-hidden">
      <ScheduleHeader
        weekStart={weekStart}
        onNavigate={navigateWeek}
        onToday={goToToday}
        scrollRef={headerScrollRef}
        onScroll={handleHeaderScroll}
      />
      <TimeGrid
        weekStart={weekStart}
        blocks={blocks}
        onCreateClick={openCreateModal}
        onEditClick={openEditModal}
        onBlockMove={handleBlockMove}
        horizontalScrollRef={gridScrollRef}
        onHorizontalScroll={handleGridScroll}
      />
      <ScheduleModal
        state={state}
        onSubmit={handleSaveBlock}
        onClose={closeModal}
        onDelete={handleBlockDelete}
      />
    </div>
  );
}
