export const HOUR_HEIGHT = 60; // pixels per hour
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export interface TimeBlock {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
}
