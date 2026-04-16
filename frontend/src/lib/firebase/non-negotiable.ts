import {
  InProgressNonNegotiableWithTasks,
  NonNegotiable,
  NonNegotiableTask,
} from "@/types/goal";
import { getNextNonNegotiableDate } from "@/lib/utils/non-negotiable-recurrence";
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

const userNonNegotiablesCollectionRef = (userId: string) =>
  collection(db, "users", userId, "nonNegotiables");

export const subscribeTodayNonNegotiablesWithTasks = (
  userId: string,
  onData: (data: InProgressNonNegotiableWithTasks[]) => void,
  onError?: (error: Error) => void,
) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  let latestInProgNNs: NonNegotiable[] = [];
  let latestCompNNs: NonNegotiable[] = [];
  let latestInProgTasks: (NonNegotiableTask & { nonNegotiableId: string })[] =
    [];
  let latestCompTasks: (NonNegotiableTask & { nonNegotiableId: string })[] = [];

  const emitUpdate = () => {
    const allNNs = [...latestInProgNNs, ...latestCompNNs];
    const allTasks = [...latestInProgTasks, ...latestCompTasks];

    const combined = allNNs.map((nn) => ({
      goalId: nn.goalId,
      nonNegotiable: {
        ...nn,
        nonegotiableId: nn.id,
      },
      tasks: allTasks.filter(
        (task) =>
          task.nonNegotiableId === nn.id ||
          task.nonNegotiableId === nn?.previousInstanceId,
      ),
    }));

    onData(combined as InProgressNonNegotiableWithTasks[]);
  };

  const unsubscribeInProgressNN = onSnapshot(
    query(
      userNonNegotiablesCollectionRef(userId),
      where("status", "==", "in-progress"),
      where("showAfter", "<", Timestamp.fromDate(startOfTomorrow)),
    ),
    (snap) => {
      latestInProgNNs = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NonNegotiable[];
      emitUpdate();
    },
    onError,
  );

  const unsubscribeCompletedNN = onSnapshot(
    query(
      userNonNegotiablesCollectionRef(userId),
      where("status", "==", "completed"),
      where("completedAt", ">=", Timestamp.fromDate(startOfToday)),
      where("completedAt", "<", Timestamp.fromDate(startOfTomorrow)),
    ),
    (snap) => {
      latestCompNNs = snap.docs.map((doc) => ({
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
    unsubscribeInProgressNN();
    unsubscribeCompletedNN();
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
      customDays: Array.isArray(data.customDays)
        ? (data.customDays as NonNegotiable["customDays"])
        : [],
    };
  });
};

export const createNonNegotiable = async (
  userId: string,
  goalId: string,
  nonNegotiableData: Omit<NonNegotiable, "id">,
) => {
  const nonNegotiableRef = doc(userNonNegotiablesCollectionRef(userId));

  await setDoc(nonNegotiableRef, {
    ...nonNegotiableData,
    goalId,
    status: nonNegotiableData.status,
    completedAt:
      nonNegotiableData.status === "completed" ? Timestamp.now() : null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
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

  const { completedAt, ...restUpdates } = updates;

  const updatePayload: Record<string, unknown> & {
    goalId: string;
    updatedAt: Timestamp;
  } = {
    ...restUpdates,
    goalId,
    updatedAt: Timestamp.now(),
  };

  if (updates.status === "completed") {
    updatePayload.completedAt = Timestamp.now();
  }

  if (updates.status === "in-progress") {
    updatePayload.completedAt = null;
  }

  if (updates.status === undefined && completedAt !== undefined) {
    updatePayload.completedAt = completedAt
      ? Timestamp.fromDate(completedAt)
      : null;
  }

  await updateDoc(nonNegotiableRef, updatePayload);
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
  void goalId;
  await deleteDoc(nonNegotiableRef);
};

export const completeNonNegotiableAndSpawnNext = async (
  userId: string,
  nonNegotiable: NonNegotiable,
  nonNegotiableId: string,
) => {
  const nonNegotiableRef = doc(
    db,
    "users",
    userId,
    "nonNegotiables",
    nonNegotiableId,
  );

  const batch = writeBatch(db);
  const completedAt = new Date();
  const completedAtTimestamp = Timestamp.fromDate(completedAt);

  batch.update(nonNegotiableRef, {
    status: "completed",
    completedAt: completedAtTimestamp,
    updatedAt: completedAtTimestamp,
  });

  const nextDate = getNextNonNegotiableDate(nonNegotiable, completedAt);

  const newNonNegotiableRef = doc(userNonNegotiablesCollectionRef(userId));
  batch.set(newNonNegotiableRef, {
    title: nonNegotiable.title,
    goalId: nonNegotiable.goalId,
    status: "in-progress",
    previousInstanceId: nonNegotiableId,
    frequency: nonNegotiable.frequency,
    customDays: nonNegotiable.customDays,
    showAfter: Timestamp.fromDate(nextDate),
    createdAt: completedAtTimestamp,
    updatedAt: completedAtTimestamp,
  });

  await batch.commit();
};
