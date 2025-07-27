import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SessionService } from '@/lib/aiServices';
import { useFirebaseUser } from './useFirebaseUser';

interface UserAction {
  action_type: string;
  timestamp: Date;
  details: Record<string, any>;
}

interface SessionData {
  sessionId: string;
  startTime: Date;
  currentProject?: string;
  totalTokensUsed: number;
  aiInteractions: number;
  pagesVisited: string[];
  featuresUsed: string[];
  userActions: UserAction[];
}

export function useSession() {
  const { user } = useFirebaseUser();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<Date>(new Date());
  const actionsRef = useRef<UserAction[]>([]);
  const pagesVisitedRef = useRef<Set<string>>(new Set());
  const featuresUsedRef = useRef<Set<string>>(new Set());
  const tokenUsageRef = useRef<number>(0);
  const aiInteractionsRef = useRef<number>(0);

  // Initialize session when user is available
  useEffect(() => {
    if (user && !sessionIdRef.current) {
      initializeSession();
    }
  }, [user]);

  // Track page visits
  useEffect(() => {
    if (sessionIdRef.current) {
      pagesVisitedRef.current.add(location.pathname);
      trackUserAction('page_visit', { path: location.pathname });
    }
  }, [location.pathname]);

  // Auto-save session data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionIdRef.current) {
        updateSessionData();
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // End session on window close/navigation away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionIdRef.current) {
        endSession();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && sessionIdRef.current) {
        updateSessionData();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // End session on component unmount
      if (sessionIdRef.current) {
        endSession();
      }
    };
  }, []);

  const initializeSession = async () => {
    if (!user) return;

    try {
      const currentProjectId = location.pathname.includes('/project/') 
        ? location.pathname.split('/project/')[1] 
        : undefined;

      const sessionId = await SessionService.startSession(user.uid, currentProjectId);
      sessionIdRef.current = sessionId;
      startTimeRef.current = new Date();

      setSessionData({
        sessionId,
        startTime: startTimeRef.current,
        currentProject: currentProjectId,
        totalTokensUsed: 0,
        aiInteractions: 0,
        pagesVisited: [location.pathname],
        featuresUsed: [],
        userActions: []
      });

      console.log('Session initialized:', sessionId);
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  };

  const trackUserAction = async (actionType: string, details: Record<string, any> = {}) => {
    if (!sessionIdRef.current) return;

    const action: UserAction = {
      action_type: actionType,
      timestamp: new Date(),
      details
    };

    actionsRef.current.push(action);

    // Update session data locally
    setSessionData(prev => prev ? {
      ...prev,
      userActions: [...prev.userActions, action]
    } : null);

    // Batch update to database (don't await to avoid blocking UI)
    try {
      await SessionService.updateSession(sessionIdRef.current, {
        user_actions: actionsRef.current.slice(-100) // Keep last 100 actions
      });
    } catch (error) {
      console.error('Failed to track user action:', error);
    }
  };

  const trackFeatureUsage = (featureName: string) => {
    featuresUsedRef.current.add(featureName);
    trackUserAction('feature_used', { feature: featureName });
  };

  const trackAIInteraction = (tokensUsed: number = 0) => {
    aiInteractionsRef.current += 1;
    tokenUsageRef.current += tokensUsed;
    
    setSessionData(prev => prev ? {
      ...prev,
      aiInteractions: aiInteractionsRef.current,
      totalTokensUsed: tokenUsageRef.current
    } : null);

    trackUserAction('ai_interaction', { 
      tokens_used: tokensUsed,
      total_interactions: aiInteractionsRef.current
    });
  };

  const updateSessionData = async () => {
    if (!sessionIdRef.current) return;

    try {
      await SessionService.updateSession(sessionIdRef.current, {
        session_duration: Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000 / 60), // minutes
        total_tokens_used: tokenUsageRef.current,
        ai_interactions_count: aiInteractionsRef.current,
        pages_visited: Array.from(pagesVisitedRef.current),
        features_used: Array.from(featuresUsedRef.current)
      });
    } catch (error) {
      console.error('Failed to update session data:', error);
    }
  };

  const endSession = async () => {
    if (!sessionIdRef.current) return;

    try {
      await SessionService.endSession(sessionIdRef.current);
      console.log('Session ended:', sessionIdRef.current);
    } catch (error) {
      console.error('Failed to end session:', error);
    } finally {
      sessionIdRef.current = null;
      setSessionData(null);
    }
  };

  const getSessionDuration = (): number => {
    if (!startTimeRef.current) return 0;
    return Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000 / 60); // minutes
  };

  const getSessionSummary = () => {
    if (!sessionData) return null;

    return {
      duration: getSessionDuration(),
      pagesVisited: sessionData.pagesVisited.length,
      featuresUsed: sessionData.featuresUsed.length,
      aiInteractions: sessionData.aiInteractions,
      tokensUsed: sessionData.totalTokensUsed,
      actions: sessionData.userActions.length
    };
  };

  return {
    sessionData,
    trackUserAction,
    trackFeatureUsage,
    trackAIInteraction,
    getSessionDuration,
    getSessionSummary,
    endSession
  };
}