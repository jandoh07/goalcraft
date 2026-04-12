import { NonNegotiable } from "@/types/goal";
import {
  Timestamp,
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const userNonNegotiablesCollectionRef = (userId: string) =>
  collection(db, "users", userId, "nonNegotiables");

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

  await updateDoc(nonNegotiableRef, {
    ...updates,
    goalId,
    updatedAt: Timestamp.now(),
  });
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
