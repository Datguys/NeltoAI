// src/lib/tiers.ts
// Centralized tier logic for Velto AI

export type Tier = 'free' | 'starter' | 'industry' | 'ultra' | 'lifetime';

export const TIERS = {
  free: {
    name: 'Free',
    tokenLimit: 10000, // 10k tokens/month
    description: 'Get started with all basic features and Gemini 2.0 Flash AI.',
    price: '$0',
    aiModel: 'Gemini 2.0 Flash'
  },
  starter: {
    name: 'Starter',
    tokenLimit: 50000, // 50k tokens/month
    description: 'Unlock advanced features with Claude 3.5 Haiku AI.',
    price: '$29.99',
    aiModel: 'Claude 3.5 Haiku + Gemini 1.5 Flash'
  },
  industry: {
    name: 'Industry',
    tokenLimit: 150000, // 150k tokens/month
    description: 'Advanced features for growing businesses.',
    price: '$59.99',
    aiModel: 'Claude 3.5 Haiku + Gemini 1.5 Flash'
  },
  ultra: {
    name: 'Ultra',
    tokenLimit: 250000, // 250k tokens/month
    description: 'All features unlocked with premium AI models.',
    price: '$79.99',
    aiModel: 'Claude 3.5 Haiku + Gemini 1.5 Flash'
  },
  lifetime: {
    name: 'Lifetime',
    tokenLimit: 999999999, // effectively unlimited
    description: 'Lifetime unlimited access with all premium features.',
    price: '$299',
    aiModel: 'All Premium AI Models'
  }
};

/**
 * Returns the current tier for a user.
 * If UserContext is available on window, use it; else fallback to 'free'.
 * (In production, connect to Stripe/lifetime logic.)
 */
declare global {
  interface Window {
    UserContext?: {
      tier: Tier;
    };
  }
}

export function getUserTier(user?: { uid?: string }): Tier {
  // If window.UserContext is set (injected by app), use it
  if (typeof window !== 'undefined' && window.UserContext?.tier) {
    return window.UserContext.tier;
  }
  // Fallback to 'free' (legacy)
  return 'free';
}

/**
 * Returns the token limit for a given tier.
 */
export function getTokenLimit(tier: Tier): number {
  if (!tier || !TIERS[tier]) {
    console.warn('Invalid tier provided to getTokenLimit:', tier, 'defaulting to free tier');
    return TIERS.free.tokenLimit;
  }
  return TIERS[tier].tokenLimit;
}

/**
 * Returns true if the user has access to premium features (always false for now).
 */
export function hasPremiumAccess(tier: Tier): boolean {
  return false;
}

/**
 * Check if user has access to specific features based on tier
 */
export function hasFeatureAccess(userTier: Tier, requiredTier: Tier): boolean {
  const tierHierarchy: Tier[] = ['free', 'starter', 'industry', 'ultra', 'lifetime'];
  const userIndex = tierHierarchy.indexOf(userTier);
  const requiredIndex = tierHierarchy.indexOf(requiredTier);
  
  return userIndex >= requiredIndex;
}

/**
 * Feature access definitions based on your tier structure
 */
export const FEATURE_ACCESS = {
  chatbot: 'free' as Tier,          // Chatbot available to all (Gemini 2.0 Flash for free)
  legalCompliance: 'starter' as Tier,   // Legal & Compliance requires Starter+
  ideaGenerator: 'free' as Tier,    // Idea Generator is free (basic prompts)
  budgetPlanner: 'free' as Tier,    // Business Summary Tool is free
  bomAnalysis: 'free' as Tier,      // BOM Analysis is free
  deepAnalysis: 'starter' as Tier,  // Deep Analysis requires Starter+
  integrations: 'starter' as Tier,  // Integrations require Starter+
  timelineAssistant: 'starter' as Tier, // Timeline Assistant requires Starter+
  storeSync: 'ultra' as Tier,       // Store Sync requires Ultra (Shopify AI insights)
  pdfExport: 'starter' as Tier,     // PDF export requires Starter+
  analytics: 'ultra' as Tier,       // Analytics dashboard requires Ultra
  teamCollaboration: 'ultra' as Tier, // Team features require Ultra
  advancedAI: 'ultra' as Tier,      // Advanced AI features require Ultra
} as const;

/**
 * Project limits per tier
 */
export const PROJECT_LIMITS = {
  free: 1,      // Free: 1 project only
  starter: 999999,  // Starter: Unlimited projects  
  industry: 999999, // Industry: Unlimited projects
  ultra: 999999, // Ultra: Unlimited projects
  lifetime: 999999 // Lifetime: Unlimited projects
} as const;

/**
 * Check if user can access a specific feature
 */
export function canAccessFeature(userTier: Tier, feature: keyof typeof FEATURE_ACCESS): boolean {
  const requiredTier = FEATURE_ACCESS[feature];
  return hasFeatureAccess(userTier, requiredTier);
}

/**
 * Get project limit for a tier
 */
export function getProjectLimit(tier: Tier): number {
  return PROJECT_LIMITS[tier] || PROJECT_LIMITS.free;
}

/**
 * Check if user can create more projects
 */
export function canCreateMoreProjects(userTier: Tier, currentProjectCount: number): boolean {
  const limit = getProjectLimit(userTier);
  return currentProjectCount < limit;
}

/**
 * Get AI model tier for user
 */
export function getAIModelTier(userTier: Tier): 'basic' | 'advanced' | 'premium' {
  if (userTier === 'free') return 'basic';      // Gemini 2.0 Flash
  if (userTier === 'starter') return 'advanced'; // Claude 3.5 Haiku + Gemini 1.5 Flash
  if (userTier === 'industry') return 'advanced'; // Claude 3.5 Haiku + Gemini 1.5 Flash
  return 'premium';                             // Claude 3.5 Haiku + Gemini 1.5 Flash (Ultra+)
}
