// src/lib/analytics.ts
// Utility for logging events and AI training data to Firestore
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "@/firebase";

const db = getFirestore();

export type AnalyticsEvent = {
  type: string; // e.g. 'ai_query', 'ai_response', 'feedback', 'feature_usage', 'referral', 'success_metric'
  userId?: string;
  sessionId?: string;
  event: string;
  data?: any;
  createdAt?: any;
};

export async function logEvent(event: AnalyticsEvent) {
  try {
    const user = auth.currentUser;
    const userId = event.userId || user?.uid;
    await addDoc(collection(db, "analytics"), {
      ...event,
      userId,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    // Fail silently in prod
    if (process.env.NODE_ENV === "development") {
      console.error("Analytics logging failed", e);
    }
  }
}

// Usage examples:
// logEvent({ type: 'ai_query', event: 'IdeaGenerator', data: { prompt: '...' } })
// logEvent({ type: 'ai_response', event: 'DeepAnalysis', data: { response: {...} } })
// logEvent({ type: 'feedback', event: 'IdeaFeedback', data: { ideaId, rating, comment } })
// logEvent({ type: 'feature_usage', event: 'ClickedGenerateIdea' })
// logEvent({ type: 'referral', event: 'ReferralSignup', data: { referrerId, referredUserId } })
// logEvent({ type: 'success_metric', event: 'ProjectCompleted', data: { projectId } })
