import { useState, useEffect, useCallback } from 'react';
import { 
  logUserInteraction, 
  updateInteractionFeedback, 
  logFeatureRequest,
  updateUserVisitCount,
  generateSessionId,
  storeVisitCountLocally,
  getCurrentVisitCount
} from '@/lib/dataCollection';
import { useFirebaseUser } from './useFirebaseUser';
import { useCredits } from './useCredits';

export const useDataCollection = () => {
  const { user } = useFirebaseUser();
  const { tier } = useCredits();
  const [sessionId] = useState(() => generateSessionId());
  const [visitCount, setVisitCount] = useState<number>(0);
  const [showFeatureRequest, setShowFeatureRequest] = useState(false);

  // Track visit count on mount
  useEffect(() => {
    if (user?.uid) {
      const trackVisit = async () => {
        const count = await updateUserVisitCount(user.uid);
        setVisitCount(count);
        storeVisitCountLocally(user.uid, count);
        
        // Show feature request dialog on 5th visit
        if (count === 5) {
          setShowFeatureRequest(true);
        }
      };
      
      trackVisit();
    }
  }, [user?.uid]);

  // Log AI interaction
  const logInteraction = useCallback(async (
    feature: string,
    question: string,
    aiResponse: string,
    metadata?: any
  ): Promise<string | null> => {
    if (!user?.uid) return null;
    
    return await logUserInteraction({
      userId: user.uid,
      sessionId,
      feature,
      question,
      aiResponse,
      metadata: {
        tier: tier || 'free',
        ...metadata
      }
    });
  }, [user?.uid, sessionId, tier]);

  // Update interaction feedback
  const provideFeedback = useCallback(async (
    interactionId: string,
    feedback: 'thumbs-up' | 'thumbs-down'
  ): Promise<boolean> => {
    return await updateInteractionFeedback(interactionId, feedback);
  }, []);

  // Log feature request
  const submitFeatureRequest = useCallback(async (
    requestedFeature: string
  ): Promise<string | null> => {
    if (!user?.uid) return null;
    
    const result = await logFeatureRequest({
      userId: user.uid,
      visitCount,
      requestedFeature,
      userEmail: user.email || undefined
    });
    
    setShowFeatureRequest(false);
    return result;
  }, [user?.uid, user?.email, visitCount]);

  const dismissFeatureRequest = useCallback(() => {
    setShowFeatureRequest(false);
  }, []);

  return {
    logInteraction,
    provideFeedback,
    submitFeatureRequest,
    dismissFeatureRequest,
    visitCount,
    showFeatureRequest,
    sessionId
  };
};