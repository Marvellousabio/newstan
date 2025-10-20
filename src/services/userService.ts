// src/services/userService.ts
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const getUserData = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? snapshot.data() : null;
};

export const createUserData = async (uid: string, data: any) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { ...data, createdAt: new Date() });
};

export const updateUserData = async (uid: string, data: any) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { ...data, updatedAt: new Date() });
};
