import { collection, addDoc, serverTimestamp, updateDoc, doc, getFirestore } from 'firebase/firestore';

const db = getFirestore();

export interface UserInteraction {
  userId: string;
  sessionId: string;
  feature: string; // 'timeline', 'idea-generator', 'budget-planner', etc.
  question: string;
  aiResponse: string;
  timestamp: any;
  feedback?: 'thumbs-up' | 'thumbs-down';
  metadata?: {
    tier: string;
    model: string;
    tokens?: number;
    projectId?: string;
  };
}

export interface FeatureRequest {
  userId: string;
  visitCount: number;
  requestedFeature: string;
  timestamp: any;
  userEmail?: string;
}

export interface UserVisitCount {
  userId: string;
  visitCount: number;
  lastVisit: any;
}

// Generate a session ID for tracking related interactions
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Log user interactions with AI
export const logUserInteraction = async (interaction: Omit<UserInteraction, 'timestamp'>) => {
  try {
    const docRef = await addDoc(collection(db, 'userInteractions'), {
      ...interaction,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error logging user interaction:', error);
    return null;
  }
};

// Update interaction with feedback
export const updateInteractionFeedback = async (
  interactionId: string, 
  feedback: 'thumbs-up' | 'thumbs-down'
) => {
  try {
    const interactionRef = doc(db, 'userInteractions', interactionId);
    await updateDoc(interactionRef, {
      feedback,
      feedbackTimestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating interaction feedback:', error);
    return false;
  }
};

// Log feature requests from 5th visit users
export const logFeatureRequest = async (request: Omit<FeatureRequest, 'timestamp'>) => {
  try {
    const docRef = await addDoc(collection(db, 'featureRequests'), {
      ...request,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error logging feature request:', error);
    return null;
  }
};

// Track user visit count
export const updateUserVisitCount = async (userId: string): Promise<number> => {
  try {
    const visitRef = doc(db, 'userVisits', userId);
    const currentCount = await getCurrentVisitCount(userId);
    const newCount = currentCount + 1;
    
    await updateDoc(visitRef, {
      userId,
      visitCount: newCount,
      lastVisit: serverTimestamp()
    }).catch(async () => {
      // Document doesn't exist, create it
      await addDoc(collection(db, 'userVisits'), {
        userId,
        visitCount: newCount,
        lastVisit: serverTimestamp()
      });
    });
    
    return newCount;
  } catch (error) {
    console.error('Error updating visit count:', error);
    return 1;
  }
};

// Get current visit count for user
export const getCurrentVisitCount = async (userId: string): Promise<number> => {
  try {
    // This would normally use getDoc, but for now we'll track in localStorage as fallback
    const stored = localStorage.getItem(`visitCount_${userId}`);
    return stored ? parseInt(stored) : 0;
  } catch (error) {
    console.error('Error getting visit count:', error);
    return 0;
  }
};

// Store visit count in localStorage as backup
export const storeVisitCountLocally = (userId: string, count: number) => {
  localStorage.setItem(`visitCount_${userId}`, count.toString());
};