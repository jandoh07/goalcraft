import { BrainDumpTask } from "@/types/goal";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
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
  const tasksQuery = query(
    brainDumpTasksCollectionRef(userId),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    tasksQuery,
    (tasksSnapshot) => {
      const tasks = tasksSnapshot.docs.map(mapBrainDumpTaskDoc);
      onTasksChange(tasks);
    },
    (error) => {
      onError?.(error);
    },
  );
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

  // Handle completedAt: if we're setting status to completed, set completedAt to now if not provided
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
