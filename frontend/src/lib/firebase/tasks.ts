import { SubTask, Task } from "@/types";
import {
  collection,
  getDocs,
  getDocsFromCache,
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
  deleteField,
  getDoc,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import { calculateNextRun } from "../utils/calculate-next-run-date";

const userTasksQuery = (
  userId: string,
  filters?: { status?: string; goalId?: string },
) => {
  let q;
  const tasksCollection = collection(db, "tasks");
  const baseQuery = query(tasksCollection, where("userId", "==", userId));

  if (filters?.status) {
    q = query(
      baseQuery,
      where("status", "==", filters.status),
      orderBy("createdAt", "desc"),
    );
  } else if (filters?.goalId) {
    q = query(
      baseQuery,
      where("goalId", "==", filters.goalId),
      orderBy("createdAt", "desc"),
    );
  } else {
    q = query(baseQuery, orderBy("createdAt", "desc"));
  }
  return q;
};

export const fetchUserTasks = async (
  userId: string,
  filters?: { status?: string; goalId?: string },
) => {
  try {
    const q = userTasksQuery(userId, filters);

    try {
      const querySnapshot = await getDocsFromCache(q);
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
    } catch {
      return [];
    }
  } catch (error) {
    console.error("Error fetching tasks from cache:", error);
    return [];
  }
};

export const subscribeToUserTasks = (
  userId: string,
  filters: { status?: string; goalId?: string } | undefined,
  callback: (tasks: Task[]) => void,
  onError?: (error: Error) => void,
) => {
  const q = userTasksQuery(userId, filters);

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
    },
  );
};

export const addTask = async (
  taskData: Omit<Task, "id" | "createdAt" | "updatedAt"> & {
    isRecurring?: boolean;
  },
) => {
  const now = Timestamp.now();

  if (taskData.isRecurring) {
    if (!taskData.dueDate || !taskData.frequency) {
      throw new Error(
        "Recurring tasks must have an initial dueDate and a frequency.",
      );
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const nextRunDate = calculateNextRun(
      taskData.frequency,
      taskData.dueDate,
      timeZone,
    );

    const batch = writeBatch(db);
    const masterTaskRef = doc(collection(db, "masterTasks"));
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

    // Update goal task counts if task has a goalId
    if (taskData.goalId) {
      const goalRef = doc(db, "goals", taskData.goalId);
      batch.update(goalRef, {
        totalTasks: increment(1),
      });
    }

    await batch.commit();

    return instanceTaskRef.id;
  } else {
    const batch = writeBatch(db);
    const taskRef = doc(collection(db, "tasks"));

    batch.set(taskRef, {
      ...taskData,
      isRecurring: false,
      dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : null,
      createdAt: now,
      updatedAt: now,
    });

    // Update goal task counts if task has a goalId
    if (taskData.goalId) {
      const goalRef = doc(db, "goals", taskData.goalId);
      batch.update(goalRef, {
        totalTasks: increment(1),
      });
    }

    await batch.commit();
    return taskRef.id;
  }
};

export const updateTask = async (
  taskId: string,
  updates: Partial<Task> & { stopRecurring?: boolean },
) => {
  const docRef = doc(db, "tasks", taskId);
  const updateData: DocumentData = {
    ...updates,
    updatedAt: Timestamp.now(),
  };

  if (updates.dueDate) {
    updateData.dueDate = Timestamp.fromDate(updates.dueDate);
  }

  if (updates.priority === null) {
    updateData.priority = deleteField();
  }
  if (updates.dueDate === null) {
    updateData.dueDate = deleteField();
  }

  if (updates.stopRecurring && updates.recurringMasterId) {
    const batch = writeBatch(db);
    const masterTaskRef = doc(db, "masterTasks", updates.recurringMasterId);

    batch.update(docRef, updateData);
    batch.update(masterTaskRef, {
      recurringStatus: "stopped",
      updatedAt: Timestamp.now(),
    });

    await batch.commit();
  } else {
    await updateDoc(docRef, updateData);
  }
};

export const removeTask = async (taskId: string) => {
  // First get the task to check if it has a goalId
  const taskRef = doc(db, "tasks", taskId);
  const taskSnap = await getDoc(taskRef);

  if (taskSnap.exists()) {
    const taskData = taskSnap.data();

    if (taskData.goalId) {
      // Use batch to delete task and update goal counts
      const batch = writeBatch(db);
      const goalRef = doc(db, "goals", taskData.goalId);

      batch.delete(taskRef);
      batch.update(goalRef, {
        totalTasks: increment(-1),
        ...(taskData.status === "completed" && {
          completedTasks: increment(-1),
        }),
      });

      await batch.commit();
    } else {
      await deleteDoc(taskRef);
    }
  } else {
    await deleteDoc(taskRef);
  }
};

export const toggleTaskStatus = async (
  taskId: string,
  currentStatus: string,
  goalId?: string,
) => {
  const newStatus = currentStatus === "completed" ? "in-progress" : "completed";
  const taskRef = doc(db, "tasks", taskId);

  if (goalId) {
    // Use batch to update task and goal counts
    const batch = writeBatch(db);
    const goalRef = doc(db, "goals", goalId);

    batch.update(taskRef, {
      status: newStatus,
      updatedAt: Timestamp.now(),
    });

    // If completing, increment completedTasks; if uncompleting, decrement
    batch.update(goalRef, {
      completedTasks: increment(newStatus === "completed" ? 1 : -1),
    });

    await batch.commit();
  } else {
    await updateDoc(taskRef, {
      status: newStatus,
      updatedAt: Timestamp.now(),
    });
  }
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

export const getMasterTask = async (masterTaskId: string) => {
  const docRef = doc(db, "masterTasks", masterTaskId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
    nextRun: data.nextRun?.toDate(),
  } as Task;
};

export const getMasterTasksByIds = async (masterTaskIds: string[]) => {
  if (!masterTaskIds.length) return [];

  const masterTasks: Task[] = [];

  // Firestore 'in' query supports max 30 items, so we batch if needed
  const chunks = [];
  for (let i = 0; i < masterTaskIds.length; i += 30) {
    chunks.push(masterTaskIds.slice(i, i + 30));
  }

  for (const chunk of chunks) {
    const q = query(
      collection(db, "masterTasks"),
      where("__name__", "in", chunk),
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      masterTasks.push({
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        nextRun: data.nextRun?.toDate(),
      } as Task);
    });
  }

  return masterTasks;
};

export const updateTaskRecurrence = async (
  masterTaskId: string,
  recurringStatus: string,
) => {
  const masterTaskRef = doc(db, "masterTasks", masterTaskId);
  await updateDoc(masterTaskRef, {
    recurringStatus: recurringStatus,
    pausedReason: recurringStatus === "paused" ? "manual-pause" : "",
    updatedAt: Timestamp.now(),
  });
};

export const getNonNegotiablesByGoalId = async (
  goalId: string,
  userId: string,
) => {
  if (!goalId || !userId) return [];

  try {
    const q = query(
      collection(db, "masterTasks"),
      where("userId", "==", userId),
      where("goalId", "==", goalId),
    );

    const querySnapshot = await getDocs(q);
    const masterTasks: Task[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      masterTasks.push({
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        nextRun: data.nextRun?.toDate(),
      } as Task);
    });

    return masterTasks;
  } catch (error) {
    console.error("Error fetching non-negotiables:", error);
    throw error;
  }
};
