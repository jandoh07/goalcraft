import {
  InProgressNonNegotiableWithTasks,
  NonNegotiable,
  NonNegotiableTask,
} from "@/types/goal";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  collectionGroup,
} from "firebase/firestore";
import { db } from "./firebase";
import { writeBatch } from "firebase/firestore";
import { getTodaySearchTags } from "../utils/non-negotiable-recurrence";

const userNonNegotiablesCollectionRef = (userId: string) =>
  collection(db, "users", userId, "nonNegotiables");
const nonNegotiableTasksCollectionRef = (
  userId: string,
  nonNegotiableId: string,
) =>
  collection(db, "users", userId, "nonNegotiables", nonNegotiableId, "tasks");

export const subscribeTodayNonNegotiablesWithTasks = (
  userId: string,
  onData: (data: InProgressNonNegotiableWithTasks[]) => void,
  onError?: (error: Error) => void,
) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  let allNNs: NonNegotiable[] = [];
  let latestInProgTasks: (NonNegotiableTask & { nonNegotiableId: string })[] =
    [];
  let latestCompTasks: (NonNegotiableTask & { nonNegotiableId: string })[] = [];

  const emitUpdate = () => {
    const allTasks = [...latestInProgTasks, ...latestCompTasks];

    const combined = allNNs.map((nn) => ({
      goalId: nn.goalId,
      nonNegotiable: {
        ...nn,
        nonegotiableId: nn.id,
      },
      tasks: allTasks.filter((task) => task.nonNegotiableId === nn.id),
    }));

    onData(combined as InProgressNonNegotiableWithTasks[]);
  };

  const frequencyTags = getTodaySearchTags();
  const unsubscribeToNN = onSnapshot(
    query(
      userNonNegotiablesCollectionRef(userId),
      where("status", "!=", "end"),
      where("frequency", "array-contains-any", frequencyTags),
    ),
    (snap) => {
      allNNs = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NonNegotiable[];
      emitUpdate();
    },
    onError,
  );

  const unsubscribeInProgTasks = onSnapshot(
    query(
      collectionGroup(db, "tasks"),
      where("userId", "==", userId),
      where("status", "==", "in-progress"),
    ),
    (snap) => {
      latestInProgTasks = snap.docs.map((doc) => ({
        id: doc.id,
        nonNegotiableId: doc.ref.parent.parent?.id,
        ...doc.data(),
      })) as (NonNegotiableTask & { nonNegotiableId: string })[];
      emitUpdate();
    },
    onError,
  );

  const unsubscribeCompTasks = onSnapshot(
    query(
      collectionGroup(db, "tasks"),
      where("userId", "==", userId),
      where("status", "==", "completed"),
      where("completedAt", ">=", Timestamp.fromDate(startOfToday)),
      where("completedAt", "<", Timestamp.fromDate(startOfTomorrow)),
    ),
    (snap) => {
      latestCompTasks = snap.docs.map((doc) => ({
        id: doc.id,
        nonNegotiableId: doc.ref.parent.parent?.id,
        ...doc.data(),
      })) as (NonNegotiableTask & { nonNegotiableId: string })[];
      emitUpdate();
    },
    onError,
  );

  return () => {
    unsubscribeToNN();
    unsubscribeInProgTasks();
    unsubscribeCompTasks();
  };
};

export const getGoalNonNegotiables = async (
  userId: string,
  goalId: string,
): Promise<NonNegotiable[]> => {
  const nonNegotiablesSnapshot = await getDocs(
    query(
      userNonNegotiablesCollectionRef(userId),
      where("goalId", "==", goalId),
    ),
  );

  return nonNegotiablesSnapshot.docs.map((nonNegotiableDoc) => {
    const data = nonNegotiableDoc.data();

    return {
      id: nonNegotiableDoc.id,
      title: (data.title as string) ?? "",
      goalId: (data.goalId as string) ?? goalId,
      status: ((data.status as NonNegotiable["status"]) ??
        "in-progress") as NonNegotiable["status"],
      frequency: ((data.frequency as NonNegotiable["frequency"]) ??
        "weekly") as NonNegotiable["frequency"],
      lastCompletedAt: data.lastCompletedAt
        ? (data.lastCompletedAt as Timestamp).toDate()
        : null,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate(),
    };
  });
};

export const createNonNegotiable = async (
  userId: string,
  goalId: string,
  nonNegotiableData: Omit<NonNegotiable, "id">,
) => {
  const nonNegotiableRef = doc(userNonNegotiablesCollectionRef(userId));
  const now = Timestamp.now();

  await setDoc(nonNegotiableRef, {
    ...nonNegotiableData,
    goalId,
    status: nonNegotiableData.status,
    createdAt: now,
    updatedAt: now,
  });
};

export const updateNonNegotiable = async (
  userId: string,
  goalId: string,
  nonNegotiableId: string,
  updates: Partial<Omit<NonNegotiable, "id">>,
) => {
  const nonNegotiableRef = doc(
    db,
    "users",
    userId,
    "nonNegotiables",
    nonNegotiableId,
  );

  const { lastCompletedAt, ...restUpdates } = updates;

  const updatePayload: Record<string, unknown> & {
    goalId: string;
    updatedAt: Timestamp;
  } = {
    ...restUpdates,
    goalId,
    updatedAt: Timestamp.now(),
  };

  if (lastCompletedAt) {
    updatePayload.lastCompletedAt = lastCompletedAt
      ? Timestamp.fromDate(lastCompletedAt)
      : null;
  }

  await updateDoc(nonNegotiableRef, updatePayload);
};

export const createNonNegotiableTask = async (
  userId: string,
  goalId: string,
  nonNegotiableId: string,
  taskData: Pick<NonNegotiableTask, "title" | "duration">,
) => {
  const taskRef = doc(nonNegotiableTasksCollectionRef(userId, nonNegotiableId));
  const now = Timestamp.now();

  await setDoc(taskRef, {
    userId,
    goalId,
    title: taskData.title,
    duration: taskData.duration,
    status: "in-progress",
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  });
};

export const updateNonNegotiableTask = async (
  userId: string,
  goalId: string,
  nonNegotiableId: string,
  taskId: string,
  updates: Partial<Pick<NonNegotiableTask, "title" | "duration" | "status">>,
) => {
  const taskRef = doc(
    db,
    "users",
    userId,
    "nonNegotiables",
    nonNegotiableId,
    "tasks",
    taskId,
  );

  const updatePayload: Record<string, unknown> & {
    goalId: string;
    updatedAt: Timestamp;
  } = {
    ...updates,
    goalId,
    updatedAt: Timestamp.now(),
  };

  if (updates.status === "completed") {
    updatePayload.completedAt = Timestamp.now();
  }

  if (updates.status === "in-progress") {
    updatePayload.completedAt = null;
  }

  await updateDoc(taskRef, updatePayload);
};

export const deleteNonNegotiableTask = async (
  userId: string,
  nonNegotiableId: string,
  taskId: string,
) => {
  const taskRef = doc(
    db,
    "users",
    userId,
    "nonNegotiables",
    nonNegotiableId,
    "tasks",
    taskId,
  );

  await deleteDoc(taskRef);
};

export const deleteNonNegotiable = async (
  userId: string,
  goalId: string,
  nonNegotiableId: string,
) => {
  const nonNegotiableRef = doc(
    db,
    "users",
    userId,
    "nonNegotiables",
    nonNegotiableId,
  );

  const tasksSnapshot = await getDocs(
    nonNegotiableTasksCollectionRef(userId, nonNegotiableId),
  );

  const refsToDelete = [
    ...tasksSnapshot.docs.map((taskDoc) => taskDoc.ref),
    nonNegotiableRef,
  ];

  for (let start = 0; start < refsToDelete.length; start += 450) {
    const batch = writeBatch(db);
    const refsInChunk = refsToDelete.slice(start, start + 450);
    refsInChunk.forEach((ref) => {
      batch.delete(ref);
    });
    await batch.commit();
  }

  void goalId;
};
