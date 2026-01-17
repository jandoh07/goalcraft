import { useState } from "react";
import { TimeBlock } from "../types/schedule";

export interface ScheduleModalState {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: {
    date: Date;
    hour: number;
    block?: TimeBlock;
  };
}

export function useScheduleModal() {
  const [state, setState] = useState<ScheduleModalState>({
    isOpen: false,
    mode: "create",
  });

  const openCreateModal = (date: Date, hour: number) => {
    setState({
      isOpen: true,
      mode: "create",
      initialData: { date, hour },
    });
  };

  const openEditModal = (block: TimeBlock) => {
    setState({
      isOpen: true,
      mode: "edit",
      initialData: { date: block.start, hour: block.start.getHours(), block },
    });
  };

  const closeModal = () => {
    setState({ isOpen: false, mode: "create" });
  };

  return {
    state,
    openCreateModal,
    openEditModal,
    closeModal,
  };
}
