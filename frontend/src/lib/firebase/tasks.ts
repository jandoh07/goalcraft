import { Task } from "@/types";
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
} from "firebase/firestore";
import { db } from "./firebase";

const userTasksQuery = (
  userId: string,
  filters?: { status?: string; goalId?: string }
) => {
  let q = query(
    collection(db, "tasks"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  if (filters?.status) {
    q = query(
      collection(db, "tasks"),
      where("userId", "==", userId),
      where("status", "==", filters.status),
      orderBy("createdAt", "desc")
    );
  }

  if (filters?.goalId) {
    q = query(
      collection(db, "tasks"),
      where("userId", "==", userId),
      where("goalId", "==", filters.goalId),
      orderBy("createdAt", "desc")
    );
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
  const docRef = await addDoc(collection(db, "tasks"), {
    ...taskData,
    dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : null,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const editTask = async (taskId: string, updates: Partial<Task>) => {
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
  await editTask(taskId, { status: newStatus as "in-progress" | "completed" });
};
