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
  createdAt: Date;
  updatedAt: Date;
}
