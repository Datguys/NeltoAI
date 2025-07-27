// src/lib/ai.ts (Final version with correct model names and token events)

// No default model - always use tier-appropriate premium models
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

import { countMessagesTokens, countTokens } from './tokenUtils';
import { updateUserCredits } from './firestoreProjects';
import type { Tier } from './tiers';

/**
 * Update token usage and trigger UI refresh (user-specific)
 */
async function updateTokenUsage(inputTokens: number, outputTokens: number, userKey?: string, userId?: string) {
  if (typeof window !== 'undefined') {
    try {
      // If no userKey provided, try to get it from context or default to anonymous
      const key = userKey || 'anonymous';
      const storageKey = `ai_credits_v1_${key}`;
      
      const totalTokens = inputTokens + outputTokens;
      
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const state = JSON.parse(raw);
        state.usedThisMonth = (state.usedThisMonth || 0) + totalTokens;
        state.inputTokensUsed = (state.inputTokensUsed || 0) + inputTokens;
        state.outputTokensUsed = (state.outputTokensUsed || 0) + outputTokens;
        
        // Calculate remaining credits
        const maxTokens = getMaxTokensForTier(state.tier || 'free');
        state.credits = Math.max(0, maxTokens - state.usedThisMonth);
        
        localStorage.setItem(storageKey, JSON.stringify(state));
        
        // Trigger storage event to refresh UI components
        window.dispatchEvent(new StorageEvent('storage', {
          key: storageKey,
          newValue: JSON.stringify(state),
          oldValue: raw,
          storageArea: localStorage
        }));
        
        // Also trigger custom event for immediate UI updates
        window.dispatchEvent(new CustomEvent('storage-manual', {
          detail: {
            key: storageKey,
            newValue: JSON.stringify(state)
          }
        }));
        
        console.log(`💰 Used ${totalTokens} tokens (${inputTokens} input + ${outputTokens} output) for user ${key}. Total used: ${state.usedThisMonth}/${maxTokens}`);
        
        // Also save to Firebase if userId is provided
        if (userId) {
          try {
            await updateUserCredits(userId, state.credits, state.usedThisMonth);
            console.log(`🔄 Token usage saved to Firebase for user ${userId}`);
          } catch (firebaseError) {
            console.error('Failed to save token usage to Firebase:', firebaseError);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to update token usage:', e);
    }
  }
}

/**
 * Get maximum tokens for a tier
 */
function getMaxTokensForTier(tier: string): number {
  switch (tier) {
    case 'starter': return 50000;
    case 'industry': return 150000;
    case 'ultra': return 250000;
    case 'lifetime': return 999999999;
    default: return 10000; // free tier
  }
}

/**
 * Get current user tier from localStorage (user-specific)
 */
function getCurrentTier(userKey?: string): Tier {
  if (typeof window !== 'undefined') {
    try {
      const key = userKey || 'anonymous';
      const storageKey = `ai_credits_v1_${key}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const state = JSON.parse(raw);
        return state.tier || 'free';
      }
    } catch (e) {
      console.warn('Failed to read tier from localStorage:', e);
    }
  }
  return 'free';
}

/**
 * Get current usage from localStorage (user-specific)
 */
function getCurrentUsage(userKey?: string): { usedThisMonth: number; credits: number } {
  if (typeof window !== 'undefined') {
    try {
      const key = userKey || 'anonymous';
      const storageKey = `ai_credits_v1_${key}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const state = JSON.parse(raw);
        return {
          usedThisMonth: state.usedThisMonth || 0,
          credits: state.credits || 0
        };
      }
    } catch (e) {
      console.warn('Failed to read usage from localStorage:', e);
    }
  }
  return { usedThisMonth: 0, credits: 10000 };
}

/**
 * Get AI completion with automatic tier detection and token tracking
 */
export async function getAICompletion({
  messages,
  tier,
  usedThisMonth,
  model,
  temperature = 0.7,
  max_tokens = 512,
  provider = 'openrouter',
  userKey,
  userId,
}: {
  messages: { role: string; content: string }[];
  tier?: Tier;
  usedThisMonth?: number;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  provider?: 'openrouter' | 'groq';
  userKey?: string;
  userId?: string;
}): Promise<string> {
  
  // Auto-detect tier and usage if not provided (user-specific)
  const userTier = tier || getCurrentTier(userKey);
  const currentUsage = getCurrentUsage(userKey);
  const userUsedThisMonth = usedThisMonth ?? currentUsage.usedThisMonth;
  
  // Model selection based on tier (PREMIUM MODELS ONLY)
  let selectedModel = model;
  if (!selectedModel) {
    if (userTier === 'ultra' || userTier === 'lifetime') {
      // Ultra users get Gemini 2.5 Flash (highest tier)
      selectedModel = 'google/gemini-2.5-flash';
    } else if (userTier === 'starter' || userTier === 'industry') {
      // Starter/Industry users get Claude 3.5 Haiku
      selectedModel = 'anthropic/claude-3.5-haiku';
    } else {
      // Free users get Gemini 2.0 Flash (NO experimental models)
      selectedModel = 'google/gemini-2.0-flash-001';
    }
  }

  console.log(`🤖 AI Request: ${userTier} tier using ${selectedModel}`);
  
  // Token usage estimation
  const promptTokens = countMessagesTokens(messages);
  const estimatedTotalTokens = promptTokens + (max_tokens || 0);
  
  // Tier limits
  const limits = {
    free: 10000,
    starter: 50000,
    industry: 150000,
    ultra: 250000,
    lifetime: 999999999,
  };
  const tierLimit = limits[userTier] ?? limits['free'];

  // Check if user has enough tokens
  if (userUsedThisMonth + estimatedTotalTokens > tierLimit) {
    throw new Error(
      `You have ${tierLimit - userUsedThisMonth} tokens left this month, but this request may use up to ${estimatedTotalTokens}. ${userTier === 'free' ? 'Upgrade to Pro for 50,000 tokens/month!' : 'Please wait for your monthly reset.'}`
    );
  }

  // API call logic
  try {
    let response;
    
    if (provider === 'groq') {
      if (!GROQ_API_KEY) throw new Error('Missing GROQ API key');
      
      response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content.trim()
          })),
          temperature,
          max_tokens,
        })
      });
    } else {
      if (!OPENROUTER_API_KEY) throw new Error('Missing OpenRouter API key');
      
      response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Founder Launch Pilot',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content.trim()
          })),
          temperature,
          max_tokens,
        })
      });
    }

    if (!response.ok) {
      let errorData: { error?: { message?: string } } = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // Ignore JSON parsing errors
      }
      
      // If Gemini 2.5 fails and we're using Ultra, fallback to 2.0
      if (selectedModel === 'google/gemini-2.5-flash' && (response.status === 400 || response.status === 404)) {
        console.log('🔄 Gemini 2.5 not available, falling back to Gemini 2.0');
        return getAICompletion({
          messages,
          tier: userTier,
          usedThisMonth: userUsedThisMonth,
          model: 'google/gemini-2.0-flash-001', // Fallback model
          temperature,
          max_tokens,
          provider
        });
      }
      
      throw new Error(
        errorData.error?.message || `API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';
    
    // Calculate actual token usage
    const actualInputTokens = promptTokens;
    const actualOutputTokens = countTokens(result);
    
    // Use API reported usage if available, otherwise use our calculations
    const reportedInputTokens = data.usage?.prompt_tokens || actualInputTokens;
    const reportedOutputTokens = data.usage?.completion_tokens || actualOutputTokens;
    
    // Success! Update token usage and refresh UI (user-specific)
    await updateTokenUsage(reportedInputTokens, reportedOutputTokens, userKey, userId);
    
    console.log(`✅ AI Response received using ${selectedModel} for ${userTier} tier. Tokens: ${reportedInputTokens} input + ${reportedOutputTokens} output = ${reportedInputTokens + reportedOutputTokens} total`);
    
    return result;
    
  } catch (error) {
    // Don't deduct tokens on error
    console.error('❌ AI request failed:', error);
    throw error;
  }
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Helper function to get model info for UI display (user-specific)
export function getCurrentAIModel(userKey?: string): { tier: string; model: string; display: string } {
  const tier = getCurrentTier(userKey);
  
  if (tier === 'ultra' || tier === 'lifetime') {
    return {
      tier,
      model: 'google/gemini-2.5-flash',
      display: '⭐ Gemini 2.5 Flash (Ultra)'
    };
  } else if (tier === 'starter') {
    return {
      tier,
      model: 'anthropic/claude-3.5-haiku', 
      display: '🧠 Claude 3.5 Haiku (Starter)'
    };
  } else if (tier === 'industry') {
    return {
      tier,
      model: 'anthropic/claude-3.5-haiku',
      display: '🏭 Claude 3.5 Haiku (Industry)'
    };
  } else {
    return {
      tier,
      model: 'google/gemini-2.0-flash-001',
      display: '💎 Gemini 2.0 Flash (Free)'
    };
  }
}