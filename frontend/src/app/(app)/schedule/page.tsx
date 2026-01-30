"use client";

import { useMemo, useCallback } from "react";
import { format, setHours, setMinutes } from "date-fns";
import { ScheduleHeader } from "../../../components/schedule/schedule-header";
import { TimeGrid } from "../../../components/schedule/time-grid";
import { ScheduleModal } from "../../../components/schedule/schedule-modal";
import { AIScheduleSheet } from "../../../components/schedule/ai-schedule-sheet";
import { ViewRangeFilter } from "../../../components/schedule/view-range-filter";
import { useScheduleModal } from "../../../hooks/use-schedule-modal";
import { useSyncedScroll } from "../../../hooks/use-synced-scroll";
import { useAISchedule } from "../../../hooks/use-ai-schedule";
import { useViewRange } from "../../../hooks/use-view-range";
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

  const {
    viewRangeType,
    setViewRangeType,
    viewRangeDates,
    navigate,
    goToToday,
    isTodayInView,
    isHydrated,
  } = useViewRange();

  const { state, openCreateModal, openEditModal, closeModal } =
    useScheduleModal();

  const {
    headerScrollRef,
    gridScrollRef,
    handleHeaderScroll,
    handleGridScroll,
  } = useSyncedScroll(viewRangeDates?.days);

  const filters = useMemo(
    () =>
      viewRangeDates
        ? {
            startDate: viewRangeDates.startDate,
            endDate: viewRangeDates.endDate,
          }
        : null,
    [viewRangeDates],
  );

  const {
    data: blocks = [],
    isLoading,
    isFetching,
  } = useGetTimeBlocks(
    user?.uid ?? "",
    filters ?? { startDate: new Date(), endDate: new Date() },
  );
  const addTimeBlock = useAddTimeBlock();
  const updateTimeBlock = useUpdateTimeBlock();
  const moveTimeBlock = useMoveTimeBlock();
  const deleteTimeBlock = useDeleteTimeBlock();

  // AI Schedule integration with callbacks for create/update/delete operations
  const {
    generateSchedule,
    isLoading: isAILoading,
    error: aiError,
    clearError: clearAIError,
  } = useAISchedule({
    userId: user?.uid ?? "",
    existingBlocks: blocks,
    callbacks: {
      onCreate: (block) => addTimeBlock.mutate(block),
      onUpdate: (blockId, updates) =>
        updateTimeBlock.mutate({ timeBlockId: blockId, updates }),
      onDelete: (blockId) => deleteTimeBlock.mutate(blockId),
    },
  });

  const handleAISendMessage = useCallback(
    async (message: string) => {
      const result = await generateSchedule(message);
      if (result) {
        return {
          message: result.message,
          stats: result.stats,
        };
      }
      return null;
    },
    [generateSchedule],
  );

  const handleSaveBlock = (
    data: TimeBlock | Omit<TimeBlock, "id" | "createdAt" | "updatedAt">,
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

  // Generate date label for the header
  const dateLabel = useMemo(() => {
    if (!viewRangeDates) return "";
    const { startDate, endDate } = viewRangeDates;

    // If same month, show "Month Year"
    // If different months, show "Month - Month Year" or "Month Year - Month Year"
    const startMonth = format(startDate, "MMMM");
    const endMonth = format(endDate, "MMMM");
    const startYear = format(startDate, "yyyy");
    const endYear = format(endDate, "yyyy");

    if (startYear !== endYear) {
      return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
    } else if (startMonth !== endMonth) {
      return `${startMonth} - ${endMonth} ${startYear}`;
    } else {
      return `${startMonth} ${startYear}`;
    }
  }, [viewRangeDates]);

  // Show loading while hydrating or fetching data
  if (!isHydrated || !viewRangeDates || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-4rem)] md:h-[calc(100dvh-56px-48px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] md:h-[calc(100dvh-56px-48px)] md:-m-6 overflow-hidden">
      <ScheduleHeader
        days={viewRangeDates.days}
        dateLabel={dateLabel}
        onNavigate={navigate}
        onToday={goToToday}
        isTodayInView={isTodayInView}
        scrollRef={headerScrollRef}
        onScroll={handleHeaderScroll}
        isFetching={isFetching}
        filterButton={
          <ViewRangeFilter
            currentType={viewRangeType}
            onTypeChange={setViewRangeType}
          />
        }
        aiButton={
          <AIScheduleSheet
            isLoading={isAILoading}
            error={aiError}
            onSendMessage={handleAISendMessage}
            onClearError={clearAIError}
          />
        }
      />
      <TimeGrid
        days={viewRangeDates.days}
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
