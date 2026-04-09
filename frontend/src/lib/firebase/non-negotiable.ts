import { NonNegotiable } from "@/types/goal";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const userNonNegotiablesCollectionRef = (userId: string) =>
  collection(db, "users", userId, "nonNegotiables");

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
