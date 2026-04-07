export interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
