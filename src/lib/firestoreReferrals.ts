// src/lib/firestoreReferrals.ts
// Firestore utility for referral links and tracking
import { getFirestore, collection, addDoc, getDoc, getDocs, doc, query, where, setDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "@/firebase";

const db = getFirestore();
const REFERRALS_COLLECTION = "referrals";

export async function getOrCreateReferralCode(userId: string): Promise<string> {
  // Use userId as code for simplicity, or generate a short hash if you want privacy
  const docRef = doc(db, REFERRALS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return userId;
  } else {
    await setDoc(docRef, { userId, createdAt: serverTimestamp(), clicks: 0, signups: 0 });
    return userId;
  }
}

export async function recordReferralClick(referralCode: string) {
  const docRef = doc(db, REFERRALS_COLLECTION, referralCode);
  await setDoc(docRef, { clicks: (await getDoc(docRef)).data()?.clicks + 1 || 1 }, { merge: true });
}

export async function recordReferralSignup(referralCode: string, referredUserId: string) {
  const docRef = doc(db, REFERRALS_COLLECTION, referralCode);
  const snap = await getDoc(docRef);
  const prevSignups = snap.data()?.signups || 0;
  await setDoc(docRef, { signups: prevSignups + 1 }, { merge: true });
  // Optionally, record referred users in a subcollection
  const subCol = collection(docRef, "referredUsers");
  await addDoc(subCol, { referredUserId, createdAt: serverTimestamp() });
}

export async function getReferralStats(userId: string) {
  const docRef = doc(db, REFERRALS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}
