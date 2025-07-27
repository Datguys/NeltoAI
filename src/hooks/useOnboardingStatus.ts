import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirebaseUser } from './useFirebaseUser';

export function useOnboardingStatus() {
  const { user, loading } = useFirebaseUser();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const db = getFirestore();

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().onboarded) {
        setOnboarded(true);
      } else {
        setOnboarded(false);
      }
    };
    check();
  }, [user]);

  const setOnboardedTrue = async (answers: any) => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    await setDoc(ref, { onboarded: true, onboardingAnswers: answers }, { merge: true });
    setOnboarded(true);
  };

  return { onboarded, setOnboardedTrue, loading };
}
