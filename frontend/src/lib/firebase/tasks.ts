import { SubTask, Task } from "@/types";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { calculateNextRun } from "../utils/calculate-next-run-date";

const userTasksQuery = (
  userId: string,
  filters?: { status?: string; goalId?: string }
) => {
  let q;
  const tasksCollection = collection(db, "tasks");
  const baseQuery = query(
    tasksCollection,
    where("userId", "==", userId),
    where("isRecurring", "==", false)
  );

  if (filters?.status) {
    q = query(
      baseQuery,
      where("status", "==", filters.status),
      orderBy("createdAt", "desc")
    );
  } else if (filters?.goalId) {
    q = query(
      baseQuery,
      where("goalId", "==", filters.goalId),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(baseQuery, orderBy("createdAt", "desc"));
  }
  return q;
};

export const fetchUserTasks = async (
  userId: string,
  filters?: { status?: string; goalId?: string }
) => {
  try {
    const q = userTasksQuery(userId, filters);
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        ...data,
        dueDate: data.dueDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Task);
    });

    return tasks;
  } catch (error) {
    console.error("Error getting tasks:", error);
    throw error;
  }
};

export const subscribeToUserTasks = (
  userId: string,
  filters: { status?: string; goalId?: string } | undefined,
  callback: (tasks: Task[]) => void,
  onError?: (error: Error) => void
) => {
  const q = userTasksQuery(userId, filters);

  // onSnapshot returns an unsubscribe function
  return onSnapshot(
    q,
    (querySnapshot) => {
      const tasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          dueDate: data.dueDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Task);
      });
      callback(tasks);
    },
    (error) => {
      console.error("Error in tasks subscription:", error);
      onError?.(error);
    }
  );
};

export const addTask = async (
  taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
) => {
  const now = Timestamp.now();

  if (taskData.isRecurring) {
    if (!taskData.dueDate || !taskData.frequency) {
      throw new Error(
        "Recurring tasks must have an initial dueDate and a frequency."
      );
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const nextRunDate = calculateNextRun(
      taskData.frequency,
      taskData.dueDate,
      timeZone
    );

    const batch = writeBatch(db);
    const masterTaskRef = doc(collection(db, "tasks"));
    const instanceTaskRef = doc(collection(db, "tasks"));

    const masterTask = {
      ...taskData,
      recurringStatus: "active",
      timeZone: timeZone,
      nextRun: Timestamp.fromDate(nextRunDate),
      createdAt: now,
      updatedAt: now,
    };

    delete masterTask.dueDate;
    masterTask.isRecurring = true;

    const instanceTask = {
      ...taskData,
      isRecurring: false,
      recurringMasterId: masterTaskRef.id,
      dueDate: Timestamp.fromDate(taskData.dueDate),
      createdAt: now,
      updatedAt: now,
    };

    delete instanceTask.nextRun;
    delete instanceTask.timeZone;

    batch.set(masterTaskRef, masterTask);
    batch.set(instanceTaskRef, instanceTask);
    await batch.commit();

    return instanceTaskRef.id;
  } else {
    const docRef = await addDoc(collection(db, "tasks"), {
      ...taskData,
      isRecurring: false,
      dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : null,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  const docRef = doc(db, "tasks", taskId);
  const updateData: DocumentData = {
    ...updates,
    updatedAt: Timestamp.now(),
  };
  if (updates.dueDate) {
    updateData.dueDate = Timestamp.fromDate(updates.dueDate);
  }
  await updateDoc(docRef, updateData);
};

export const removeTask = async (taskId: string) => {
  await deleteDoc(doc(db, "tasks", taskId));
};

export const toggleTaskStatus = async (
  taskId: string,
  currentStatus: string
) => {
  const newStatus = currentStatus === "completed" ? "in-progress" : "completed";
  await updateTask(taskId, {
    status: newStatus as "in-progress" | "completed",
  });
};

export const addSubtask = async (taskId: string, subtask: SubTask) => {
  const taskRef = doc(db, "tasks", taskId);

  await updateDoc(taskRef, {
    subtasks: arrayUnion(subtask),
    updatedAt: Timestamp.now(),
  });
};

export const deleteSubtask = async (taskId: string, subtask: SubTask) => {
  const taskRef = doc(db, "tasks", taskId);

  await updateDoc(taskRef, {
    subtasks: arrayRemove(subtask),
    updatedAt: Timestamp.now(),
  });
};
