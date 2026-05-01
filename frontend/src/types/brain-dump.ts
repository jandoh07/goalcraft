export interface BrainDumpTask {
  id: string;
  title: string;
  status: "pending" | "completed";
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
