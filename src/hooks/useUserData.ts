// src/hooks/useUserData.ts
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export const useUserData = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", currentUser.uid);
      const unsubDoc = onSnapshot(userRef, (snap) => {
        setUser({ uid: currentUser.uid, ...snap.data() });
        setLoading(false);
      });

      return () => unsubDoc();
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};
