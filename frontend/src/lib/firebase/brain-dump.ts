import { BrainDumpTask } from "@/types/brain-dump";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const brainDumpTasksCollectionRef = (userId: string) =>
  collection(db, "users", userId, "brainDumpTasks");

const brainDumpTaskDocRef = (userId: string, taskId: string) =>
  doc(db, "users", userId, "brainDumpTasks", taskId);

const mapBrainDumpTaskDoc = (taskDoc: {
  id: string;
  data: () => Record<string, unknown>;
}): BrainDumpTask => {
  const data = taskDoc.data();
  return {
    id: taskDoc.id,
    title: (data.title as string) ?? "",
    status: ((data.status as BrainDumpTask["status"]) ??
      "pending") as BrainDumpTask["status"],
    completedAt:
      (data.completedAt as { toDate?: () => Date })?.toDate?.() ?? null,
    createdAt:
      (data.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
    updatedAt:
      (data.updatedAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
  };
};

export const getBrainDumpTasks = (
  userId: string,
  onTasksChange: (tasks: BrainDumpTask[]) => void,
  onError?: (error: Error) => void,
) => {
  const pendingTasksQuery = query(
    brainDumpTasksCollectionRef(userId),
    where("status", "==", "pending"),
  );

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const completedTodayTasksQuery = query(
    brainDumpTasksCollectionRef(userId),
    where("completedAt", ">", Timestamp.fromDate(startOfToday)),
    where("completedAt", "<", Timestamp.fromDate(startOfTomorrow)),
  );

  let pendingTasks: BrainDumpTask[] = [];
  let completedTodayTasks: BrainDumpTask[] = [];

  const emitCombinedTasks = () => {
    const uniqueTasks = new Map<string, BrainDumpTask>();

    for (const task of pendingTasks) {
      uniqueTasks.set(task.id, task);
    }

    for (const task of completedTodayTasks) {
      uniqueTasks.set(task.id, task);
    }

    const sortedTasks = Array.from(uniqueTasks.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    onTasksChange(sortedTasks);
  };

  const unsubscribePendingTasks = onSnapshot(
    pendingTasksQuery,
    (tasksSnapshot) => {
      pendingTasks = tasksSnapshot.docs.map(mapBrainDumpTaskDoc);
      emitCombinedTasks();
    },
    (error) => {
      onError?.(error);
    },
  );

  const unsubscribeCompletedTodayTasks = onSnapshot(
    completedTodayTasksQuery,
    (tasksSnapshot) => {
      completedTodayTasks = tasksSnapshot.docs.map(mapBrainDumpTaskDoc);
      emitCombinedTasks();
    },
    (error) => {
      onError?.(error);
    },
  );

  return () => {
    unsubscribePendingTasks();
    unsubscribeCompletedTodayTasks();
  };
};

export const createBrainDumpTask = async (userId: string, title: string) => {
  const now = Timestamp.now();
  const taskRef = doc(brainDumpTasksCollectionRef(userId));

  await setDoc(taskRef, {
    title,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });

  return taskRef.id;
};

export const updateBrainDumpTask = async (
  userId: string,
  taskId: string,
  updates: Partial<Omit<BrainDumpTask, "id" | "createdAt">>,
) => {
  const taskRef = brainDumpTaskDocRef(userId, taskId);

  const updateData: Record<string, unknown> = {
    ...updates,
    updatedAt: Timestamp.now(),
  };

  if (updates.status === "completed" && !updates.completedAt) {
    updateData.completedAt = Timestamp.now();
  } else if (updates.status === "pending") {
    updateData.completedAt = null;
  }

  await updateDoc(taskRef, updateData);
};

export const deleteBrainDumpTask = async (userId: string, taskId: string) => {
  const taskRef = brainDumpTaskDocRef(userId, taskId);
  await deleteDoc(taskRef);
};
