export const HOUR_HEIGHT = 60; // pixels per hour
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export interface TimeBlock {
  id: string;
  userId: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  description?: string;
  taskId?: string; // Optional link to a task
  // Recurrence fields
  rrule?: string; // RRule string (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR")
  isRecurring?: boolean;
  masterBlockId?: string; // For instances, reference to the master block
  originalStart?: Date; // Original start time for this instance (for exceptions)
  createdAt: Date;
  updatedAt: Date;
}

// A computed instance of a recurring block (not stored in DB)
export interface TimeBlockInstance extends Omit<TimeBlock, "id"> {
  id: string; // Generated ID: `${masterBlockId}_${instanceDate.toISOString()}`
  instanceDate: Date; // The specific date this instance is for
  masterBlockId: string;
}
