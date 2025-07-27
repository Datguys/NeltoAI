import { useState, useEffect } from 'react';
import { TIERS, Tier, getUserTier, getTokenLimit } from '@/lib/tiers';
import { useFirebaseUser } from './useFirebaseUser';
import { getUserTier as getFirebaseUserTier, setUserTier as setFirebaseUserTier } from '@/lib/firestoreProjects';

const STORAGE_KEY = 'ai_credits_v1';

interface CreditsState {
  tier: Tier;
  credits: number;
  usedThisMonth: number;
  inputTokensUsed?: number;
  outputTokensUsed?: number;
  lastReset: string; // ISO date
  subscriptionStartDate?: string; // ISO date when subscription started
  lastPaymentDate?: string; // ISO date of last successful payment
  paymentStatus?: 'active' | 'failed' | 'cancelled'; // Payment status
}

// Default: Free tier, 10k tokens, 0 used
const defaultCredits: CreditsState = {
  tier: 'free',
  credits: getTokenLimit('free'),
  usedThisMonth: 0,
  inputTokensUsed: 0,
  outputTokensUsed: 0,
  lastReset: new Date().toISOString().slice(0, 7), // YYYY-MM
  paymentStatus: 'active', // Free tier is always active
};

export const CREDIT_PACKAGES = [
  { credits: 1000, price: 5 },
  { credits: 5000, price: 20 },
  { credits: 20000, price: 60 },
];

export function useCredits() {
  const { user, loading: userLoading } = useFirebaseUser();
  const userKey = user?.uid || user?.email || 'anonymous';
  const userStorageKey = `${STORAGE_KEY}_${userKey}`;
  const [loading, setLoading] = useState(true);

  const [state, setState] = useState<CreditsState>(() => {
    // For new users, always start with 0 credits used
    if (!user && !userLoading) return { ...defaultCredits, usedThisMonth: 0 };
    
    const raw = localStorage.getItem(userStorageKey);
    if (!raw) {
      // New user, start fresh
      return { ...defaultCredits, usedThisMonth: 0 };
    }
    
    try {
      const parsed = JSON.parse(raw);
      const tier = parsed.tier || 'free';
      // Reset if new month
      const now = new Date().toISOString().slice(0, 7);
      if (parsed.lastReset !== now) {
        return { ...defaultCredits, credits: getTokenLimit(tier), tier, lastReset: now, usedThisMonth: 0 };
      }
      return { ...parsed, tier };
    } catch {
      return { ...defaultCredits, usedThisMonth: 0 };
    }
  });

  // Load user data from Firebase when user logs in
  useEffect(() => {
    if (userLoading) return;
    
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadUserData = async () => {
      try {
        setLoading(true);
        const firebaseUserData = await getFirebaseUserTier(user.uid);
        if (firebaseUserData) {
          // Use Firebase data as source of truth, but check for monthly reset
          let baseState = {
            tier: firebaseUserData.tier,
            credits: firebaseUserData.credits,
            usedThisMonth: firebaseUserData.usedThisMonth,
            inputTokensUsed: firebaseUserData.inputTokensUsed || 0,
            outputTokensUsed: firebaseUserData.outputTokensUsed || 0,
            lastReset: firebaseUserData.lastReset,
            subscriptionStartDate: firebaseUserData.subscriptionStartDate,
            lastPaymentDate: firebaseUserData.lastPaymentDate,
            paymentStatus: (firebaseUserData.paymentStatus as 'active' | 'failed' | 'cancelled') || 'active'
          };
          
          // Check if monthly reset is needed
          const resetState = await checkMonthlyReset(baseState);
          
          setState(resetState);
          // Also update localStorage for offline access
          localStorage.setItem(userStorageKey, JSON.stringify(resetState));
          console.log('Loaded user data from Firebase with reset check:', resetState);
          
          // If reset was applied, save back to Firebase
          if (JSON.stringify(baseState) !== JSON.stringify(resetState)) {
            await setFirebaseUserTier(user.uid, resetState);
            console.log('Monthly reset applied and saved to Firebase');
          }
        } else {
          // No Firebase data, create new user with default credits
          const newState = { ...defaultCredits, usedThisMonth: 0, inputTokensUsed: 0, outputTokensUsed: 0 };
          setState(newState);
          localStorage.setItem(userStorageKey, JSON.stringify(newState));
          console.log('New user created with default credits:', newState);
        }
      } catch (error) {
        console.error('Failed to load user data from Firebase:', error);
        // Fallback to localStorage
        const raw = localStorage.getItem(userStorageKey);
        if (raw) {
          try {
            setState(JSON.parse(raw));
          } catch {
            setState({ ...defaultCredits, usedThisMonth: 0 });
          }
        } else {
          setState({ ...defaultCredits, usedThisMonth: 0 });
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.uid, userStorageKey, userLoading]);

  // Reset state when user changes (but only when user actually changes, not on every render)
  useEffect(() => {
    if (!user) {
      setState({ ...defaultCredits, usedThisMonth: 0 });
      return;
    }

    // Only update if we don't already have data for this user in our current state
    const raw = localStorage.getItem(userStorageKey);
    if (!raw) {
      // New user, start fresh - but only if we don't already have state
      const newState = { ...defaultCredits, usedThisMonth: 0 };
      setState(currentState => {
        // Only update if current state is default/different user
        if (currentState.tier === 'free' && currentState.usedThisMonth === 0) {
          return newState;
        }
        return currentState;
      });
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const tier = parsed.tier || 'free';
      // Reset if new month
      const now = new Date().toISOString().slice(0, 7);
      let newState;
      if (parsed.lastReset !== now) {
        newState = { ...defaultCredits, credits: getTokenLimit(tier), tier, lastReset: now, usedThisMonth: 0, inputTokensUsed: 0, outputTokensUsed: 0 };
      } else {
        newState = { ...parsed, tier, inputTokensUsed: parsed.inputTokensUsed || 0, outputTokensUsed: parsed.outputTokensUsed || 0 };
      }
      
      setState(currentState => {
        // Only update if the state has actually changed
        if (JSON.stringify(currentState) !== JSON.stringify(newState)) {
          return newState;
        }
        return currentState;
      });
    } catch {
      // Only fallback if we don't have valid current state
      setState(currentState => {
        if (currentState.tier !== 'free' || currentState.usedThisMonth !== 0) {
          return currentState;
        }
        return { ...defaultCredits, usedThisMonth: 0 };
      });
    }
  }, [user?.uid, user?.email]); // Only depend on actual user ID/email, not the full user object

  // Persist to localStorage with user-specific key
  useEffect(() => {
    if (user) {
      localStorage.setItem(userStorageKey, JSON.stringify(state));
    }
  }, [state, userStorageKey, user]);

  // Listen for storage events to update state when AI deducts tokens or tier changes
  useEffect(() => {
    if (loading || !user?.uid) return; // Don't listen to events while loading or no user
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === userStorageKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setState(current => {
            // STABILITY FIX: Only update tokens/usage, preserve tier unless explicitly changed
            // This prevents tier flipping from storage events
            if (current.tier !== parsed.tier) {
              console.warn(`Ignoring tier change from storage event: ${current.tier} -> ${parsed.tier}`);
              // Keep current tier but update other fields
              return {
                ...current,
                credits: parsed.credits,
                usedThisMonth: parsed.usedThisMonth,
                inputTokensUsed: parsed.inputTokensUsed,
                outputTokensUsed: parsed.outputTokensUsed,
                lastReset: parsed.lastReset
              };
            }
            
            // Only update if there's an actual change in usage/credits
            if (current.usedThisMonth !== parsed.usedThisMonth || current.credits !== parsed.credits) {
              console.log('Storage event: updating token usage only, keeping tier', current.tier);
              return { ...current, ...parsed, tier: current.tier }; // Explicitly preserve tier
            }
            return current;
          });
        } catch (e) {
          console.warn('Failed to parse storage update:', e);
        }
      }
    };

    // Debounce storage events to prevent rapid firing
    let debounceTimer: number;
    const debouncedStorageChange = (e: StorageEvent) => {
      clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => handleStorageChange(e), 100);
    };

    window.addEventListener('storage', debouncedStorageChange);
    
    // Also listen for manual storage events (for same-window updates)
    const handleManualStorageChange = (e: CustomEvent) => {
      if (e.detail && e.detail.key === userStorageKey && e.detail.newValue) {
        try {
          const parsed = JSON.parse(e.detail.newValue);
          setState(current => {
            // Same logic - preserve tier, only update usage
            if (current.tier !== parsed.tier) {
              console.warn(`Ignoring tier change from manual storage event: ${current.tier} -> ${parsed.tier}`);
              return {
                ...current,
                credits: parsed.credits,
                usedThisMonth: parsed.usedThisMonth,
                inputTokensUsed: parsed.inputTokensUsed,
                outputTokensUsed: parsed.outputTokensUsed,
                lastReset: parsed.lastReset
              };
            }
            
            if (current.usedThisMonth !== parsed.usedThisMonth || current.credits !== parsed.credits) {
              console.log('Manual storage event: updating token usage only, keeping tier', current.tier);
              return { ...current, ...parsed, tier: current.tier };
            }
            return current;
          });
        } catch (e) {
          console.warn('Failed to parse manual storage update:', e);
        }
      }
    };

    window.addEventListener('storage-manual', handleManualStorageChange as EventListener);
    
    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener('storage', debouncedStorageChange);
      window.removeEventListener('storage-manual', handleManualStorageChange as EventListener);
    };
  }, [userStorageKey]);

  // Deduct credits and save to Firebase
  const deductCredits = async (amount: number) => {
    const newState = {
      ...state,
      credits: Math.max(0, state.credits - amount),
      usedThisMonth: state.usedThisMonth + amount
    };
    
    setState(newState);
    
    // Save to Firebase immediately to persist across refreshes
    if (user?.uid) {
      try {
        await setFirebaseUserTier(user.uid, newState);
        console.log('Credits deducted and saved to Firebase:', amount);
      } catch (error) {
        console.error('Failed to save credit deduction to Firebase:', error);
      }
    }
  };

  // Add credits (after Stripe) and save to Firebase
  const addCredits = async (amount: number) => {
    const newState = {
      ...state,
      credits: state.credits + amount
    };
    
    setState(newState);
    
    // Save to Firebase
    if (user?.uid) {
      try {
        await setFirebaseUserTier(user.uid, newState);
        console.log('Credits added and saved to Firebase:', amount);
      } catch (error) {
        console.error('Failed to save credit addition to Firebase:', error);
      }
    }
  };

  // Set tier and reset credits if tier changes (also save to Firebase)
  const setTier = async (tier: Tier, isPayment: boolean = false) => {
    const now = new Date().toISOString();
    const nowMonth = now.slice(0, 7);
    
    const newState = {
      tier,
      credits: getTokenLimit(tier),
      usedThisMonth: 0,
      inputTokensUsed: 0,
      outputTokensUsed: 0,
      lastReset: nowMonth,
      // If upgrading to paid tier, record subscription start
      ...(tier !== 'free' && state.tier === 'free' ? {
        subscriptionStartDate: now,
        lastPaymentDate: now,
        paymentStatus: 'active' as const
      } : {}),
      // If this is a payment for existing subscription, update payment date
      ...(isPayment && tier !== 'free' ? {
        lastPaymentDate: now,
        paymentStatus: 'active' as const
      } : {}),
      // If downgrading to free, clear subscription data
      ...(tier === 'free' && state.tier !== 'free' ? {
        subscriptionStartDate: undefined,
        lastPaymentDate: undefined,
        paymentStatus: 'active' as const
      } : {})
    };
    
    setState(newState);
    
    // Save to Firebase if user is logged in
    if (user?.uid) {
      try {
        await setFirebaseUserTier(user.uid, newState);
        console.log('Tier saved to Firebase:', tier);
      } catch (error) {
        console.error('Failed to save tier to Firebase:', error);
      }
    }
  };

  // Check if monthly reset is needed and verify payment status
  const checkMonthlyReset = async (currentState: CreditsState): Promise<CreditsState> => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
    const lastResetMonth = currentState.lastReset;
    
    // If same month, no reset needed
    if (lastResetMonth === currentMonth) {
      return currentState;
    }
    
    // Month changed, check if reset is needed
    const lastResetDate = new Date(lastResetMonth + '-01');
    const daysSinceReset = Math.floor((now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // If it's been 30+ days since last reset
    if (daysSinceReset >= 30) {
      // STABILITY FIX: Don't auto-downgrade tiers based on payment dates
      // This was causing ultra users to randomly flip to free tier
      // Keep the current tier unless explicitly changed through setTier()
      let newTier = currentState.tier;
      
      // Only downgrade if we have explicit evidence of cancellation
      // This prevents the random flipping between ultra/free
      console.log(`Monthly reset: keeping tier ${newTier} (was causing instability)`);
      
      // NOTE: Payment validation should be handled by Stripe webhooks or backend
      // not by the client-side credit system
      
      const newState = {
        ...currentState,
        tier: newTier,
        credits: getTokenLimit(newTier),
        usedThisMonth: 0,
        lastReset: currentMonth,
        // If downgraded to free, clear subscription data
        ...(newTier === 'free' && currentState.tier !== 'free' ? {
          subscriptionStartDate: undefined,
          lastPaymentDate: undefined,
          paymentStatus: 'active' as const
        } : {})
      };
      
      console.log(`Monthly reset applied. Tier: ${newTier}, Credits: ${newState.credits}`);
      return newState;
    }
    
    return currentState;
  };

  // Reset for new month
  const resetMonthly = async () => {
    const newState = await checkMonthlyReset(state);
    setState(newState);
    
    // Save to Firebase
    if (user?.uid) {
      try {
        await setFirebaseUserTier(user.uid, newState);
        console.log('Monthly reset saved to Firebase');
      } catch (error) {
        console.error('Failed to save monthly reset to Firebase:', error);
      }
    }
  };

  // Add helper functions for token tracking
  const getMaxTokens = () => getTokenLimit(state.tier || 'free');
  const getRemainingTokens = () => Math.max(0, getMaxTokens() - state.usedThisMonth);
  const getUsagePercentage = () => Math.min(100, (state.usedThisMonth / getMaxTokens()) * 100);

  return {
    ...state,
    loading,
    deductCredits,
    addCredits,
    setTier,
    resetMonthly,
    checkMonthlyReset,
    getMaxTokens,
    getRemainingTokens,
    getUsagePercentage,
    CREDIT_PACKAGES
  };

}
