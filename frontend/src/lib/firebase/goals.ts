import {
  Goal,
  GoalData,
  Milestone,
  UpdateGoalWithRelationsPayload,
} from "@/types/goal";
import {
  areSameMilestone,
  areSameNonNegotiable,
} from "@/lib/utils/goal-comparators";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

const goalsCollectionRef = (userId: string) =>
  collection(db, "users", userId, "goals");
const goalDocRef = (userId: string, goalId: string) =>
  doc(db, "users", userId, "goals", goalId);
const milestonesCollectionRef = (userId: string, goalId: string) =>
  collection(db, "users", userId, "goals", goalId, "milestones");
const userNonNegotiablesCollectionRef = (userId: string) =>
  collection(db, "users", userId, "nonNegotiables");

const toDueDate = (dueDate: string) => {
  const parsed = new Date(dueDate);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export const createGoal = async (userId: string, goalData: GoalData) => {
  const batch = writeBatch(db);
  const now = Timestamp.now();

  const newGoalRef = doc(goalsCollectionRef(userId));

  batch.set(newGoalRef, {
    title: goalData.title,
    progress: 0,
    dueDate: Timestamp.fromDate(toDueDate(goalData.dueDate)),
    why: goalData.why,
    createdAt: now,
    updatedAt: now,
  });

  goalData.milestones.forEach((milestone) => {
    const milestoneRef = milestone.id
      ? doc(
          db,
          "users",
          userId,
          "goals",
          newGoalRef.id,
          "milestones",
          milestone.id,
        )
      : doc(milestonesCollectionRef(userId, newGoalRef.id));

    batch.set(milestoneRef, {
      title: milestone.title,
      weight: milestone.weight,
      status: milestone.status,
      createdAt: now,
      updatedAt: now,
    });
  });

  goalData.nonNegotiables.forEach((nonNegotiable) => {
    const nonNegotiableRef = nonNegotiable.id
      ? doc(db, "users", userId, "nonNegotiables", nonNegotiable.id)
      : doc(userNonNegotiablesCollectionRef(userId));

    batch.set(nonNegotiableRef, {
      title: nonNegotiable.title,
      goalId: newGoalRef.id,
      frequency: nonNegotiable.frequency,
      customDays: nonNegotiable.customDays,
      createdAt: now,
      updatedAt: now,
    });
  });

  await batch.commit();
};

export const updateGoal = async (userId: string, goal: Goal) => {
  const goalRef = goalDocRef(userId, goal.id);

  await updateDoc(goalRef, {
    title: goal.title,
    progress: goal.progress,
    dueDate: Timestamp.fromDate(goal.dueDate),
    why: goal.why,
    updatedAt: Timestamp.now(),
  });
};

export const deleteGoal = async (userId: string, goalId: string) => {
  const batch = writeBatch(db);

  const milestonesSnapshot = await getDocs(
    milestonesCollectionRef(userId, goalId),
  );
  milestonesSnapshot.forEach((milestoneDoc) => {
    batch.delete(milestoneDoc.ref);
  });

  const linkedNonNegotiables = await getDocs(
    query(
      userNonNegotiablesCollectionRef(userId),
      where("goalId", "==", goalId),
    ),
  );
  linkedNonNegotiables.forEach((nonNegotiableDoc) => {
    batch.delete(nonNegotiableDoc.ref);
  });

  batch.delete(goalDocRef(userId, goalId));
  await batch.commit();
};

const mapGoalDoc = (goalDoc: {
  id: string;
  data: () => Record<string, unknown>;
}): Goal => {
  const data = goalDoc.data();
  return {
    id: goalDoc.id,
    title: (data.title as string) ?? "",
    progress: (data.progress as number) ?? 0,
    dueDate:
      (data.dueDate as { toDate?: () => Date })?.toDate?.() ?? new Date(),
    why: (data.why as string) ?? "",
    createdAt:
      (data.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
    updatedAt:
      (data.updatedAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
  };
};

export const getGoals = (
  userId: string,
  onGoalsChange: (goals: Goal[]) => void,
  onError?: (error: Error) => void,
) => {
  const goalsQuery = query(
    goalsCollectionRef(userId),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    goalsQuery,
    (goalsSnapshot) => {
      const goals = goalsSnapshot.docs.map(mapGoalDoc);
      onGoalsChange(goals);
    },
    (error) => {
      onError?.(error);
    },
  );
};

export const getGoal = async (
  userId: string,
  goalId: string,
): Promise<Goal | null> => {
  const goalSnapshot = await getDoc(goalDocRef(userId, goalId));
  if (!goalSnapshot.exists()) {
    return null;
  }

  return mapGoalDoc({
    id: goalSnapshot.id,
    data: () => goalSnapshot.data() as Record<string, unknown>,
  });
};

export const getGoalMilestones = async (
  userId: string,
  goalId: string,
): Promise<Milestone[]> => {
  const milestonesSnapshot = await getDocs(
    milestonesCollectionRef(userId, goalId),
  );

  return milestonesSnapshot.docs.map((milestoneDoc) => {
    const data = milestoneDoc.data();

    return {
      id: milestoneDoc.id,
      title: (data.title as string) ?? "",
      weight: String((data.weight as string | number) ?? ""),
      status: ((data.status as "in-progress" | "completed") ??
        "in-progress") as "in-progress" | "completed",
    };
  });
};

export const updateGoalWithRelations = async (
  userId: string,
  payload: UpdateGoalWithRelationsPayload,
) => {
  const { goalId, originalData, nextData } = payload;
  const batch = writeBatch(db);
  const now = Timestamp.now();

  batch.update(goalDocRef(userId, goalId), {
    title: nextData.title,
    dueDate: Timestamp.fromDate(toDueDate(nextData.dueDate)),
    why: nextData.why,
    updatedAt: now,
  });

  const originalMilestonesById = new Map(
    originalData.milestones.map((milestone) => [milestone.id, milestone]),
  );
  const nextMilestonesById = new Map(
    nextData.milestones.map((milestone) => [milestone.id, milestone]),
  );

  originalMilestonesById.forEach((_, id) => {
    if (!nextMilestonesById.has(id)) {
      batch.delete(doc(db, "users", userId, "goals", goalId, "milestones", id));
    }
  });

  nextMilestonesById.forEach((nextMilestone, id) => {
    const milestoneRef = doc(
      db,
      "users",
      userId,
      "goals",
      goalId,
      "milestones",
      id,
    );
    const originalMilestone = originalMilestonesById.get(id);

    if (!originalMilestone) {
      batch.set(milestoneRef, {
        title: nextMilestone.title,
        weight: nextMilestone.weight,
        status: nextMilestone.status,
        createdAt: now,
        updatedAt: now,
      });
      return;
    }

    if (!areSameMilestone(originalMilestone, nextMilestone)) {
      batch.update(milestoneRef, {
        title: nextMilestone.title,
        weight: nextMilestone.weight,
        status: nextMilestone.status,
        updatedAt: now,
      });
    }
  });

  const originalNonNegotiablesById = new Map(
    originalData.nonNegotiables.map((item) => [item.id, item]),
  );
  const nextNonNegotiablesById = new Map(
    nextData.nonNegotiables.map((item) => [item.id, item]),
  );

  originalNonNegotiablesById.forEach((_, id) => {
    if (!nextNonNegotiablesById.has(id)) {
      batch.delete(doc(db, "users", userId, "nonNegotiables", id));
    }
  });

  nextNonNegotiablesById.forEach((nextItem, id) => {
    const nonNegotiableRef = doc(db, "users", userId, "nonNegotiables", id);
    const originalItem = originalNonNegotiablesById.get(id);

    if (!originalItem) {
      batch.set(nonNegotiableRef, {
        title: nextItem.title,
        goalId,
        frequency: nextItem.frequency,
        customDays: nextItem.customDays,
        createdAt: now,
        updatedAt: now,
      });
      return;
    }

    if (!areSameNonNegotiable(originalItem, nextItem)) {
      batch.update(nonNegotiableRef, {
        title: nextItem.title,
        goalId,
        frequency: nextItem.frequency,
        customDays: nextItem.customDays,
        updatedAt: now,
      });
    }
  });

  await batch.commit();
};

export const updateMilestone = async (
  userId: string,
  goalId: string,
  milestoneId: string,
  updates: Partial<Milestone>,
) => {
  const milestoneRef = doc(
    db,
    "users",
    userId,
    "goals",
    goalId,
    "milestones",
    milestoneId,
  );

  const updateData: Partial<Milestone> & { updatedAt: Timestamp } = {
    ...updates,
    updatedAt: Timestamp.now(),
  };

  await updateDoc(milestoneRef, updateData);
};

export const deleteMilestone = async (
  userId: string,
  goalId: string,
  milestoneId: string,
) => {
  const milestoneRef = doc(
    db,
    "users",
    userId,
    "goals",
    goalId,
    "milestones",
    milestoneId,
  );
  await deleteDoc(milestoneRef);
};

export const addMilestone = async (
  userId: string,
  goalId: string,
  milestoneData: Omit<Milestone, "id">,
) => {
  const milestonesRef = milestonesCollectionRef(userId, goalId);
  const newMilestoneRef = doc(milestonesRef);

  await setDoc(newMilestoneRef, {
    ...milestoneData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};
