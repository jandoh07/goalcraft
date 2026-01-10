import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScheduleForm } from "./schedule-form";
import { TimeBlock } from "../../types/schedule";
import { ScheduleModalState } from "../../hooks/use-schedule-modal";

interface ScheduleModalProps {
  state: ScheduleModalState;
  onSubmit: (data: TimeBlock | Omit<TimeBlock, "id">) => void;
  onClose: () => void;
}

export function ScheduleModal({
  state,
  onSubmit,
  onClose,
}: ScheduleModalProps) {
  if (!state.isOpen || !state.initialData) {
    return null;
  }

  const { date, hour, block } = state.initialData;
  const dateStr = format(date, "EEEE, MMMM d, yyyy");
  const title =
    state.mode === "create"
      ? `Create Block for ${dateStr} at ${hour}:00`
      : `Edit Block`;

  return (
    <Dialog open={state.isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScheduleForm
          mode={state.mode}
          initialBlock={block}
          initialDate={date}
          initialHour={hour}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
