import { Goal, GoalData, Milestone } from "@/types/goal";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDocs,
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

export const getGoals = async (userId: string): Promise<Goal[]> => {
  const goalsSnapshot = await getDocs(
    query(goalsCollectionRef(userId), orderBy("updatedAt", "desc")),
  );

  return goalsSnapshot.docs.map((goalDoc) => {
    const data = goalDoc.data();
    return {
      id: goalDoc.id,
      title: data.title,
      progress: data.progress ?? 0,
      dueDate: data.dueDate?.toDate?.() ?? new Date(),
      why: data.why ?? "",
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    } as Goal;
  });
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
