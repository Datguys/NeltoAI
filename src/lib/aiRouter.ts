import { getAICompletion } from './ai';

export type AITask = 'content-generation' | 'coaching' | 'research' | 'general-qa' | 'bulk-generation' | 'custom-research';

export interface AIRouterConfig {
  task: AITask;
  prompt: string;
  userTier?: 'free' | 'starter' | 'industry' | 'ultra' | 'lifetime';
}

/**
 * AI Router - Routes different tasks to PREMIUM AI models ONLY
 * 
 * NO WEAK MODELS - ONLY TOP TIER:
 * Gemini 2.5 Flash: Ultra tier - best performance
 * Claude 3.5 Haiku: Pro tier - excellent for content
 * Gemini 2.0 Flash: Free tier - solid baseline
 * Gemini 1.5 Flash: Research tasks - fast data retrieval
 */
export async function routeAIRequest(config: AIRouterConfig & { modelOverride?: string }): Promise<string> {
  const { task, prompt, userTier = 'free', modelOverride } = config;
  
  // Use model override if provided (from advanced options)
  if (modelOverride) {
    console.log(`🎯 Using model override: ${modelOverride}`);
    
    try {
      const response = await getAICompletion({
        messages: [{ role: 'user', content: prompt }],
        model: modelOverride,
        temperature: task === 'research' ? 0.1 : 0.7,
        max_tokens: task === 'bulk-generation' ? 4000 : 2000,
        tier: userTier
      });
      return response;
    } catch (error) {
      console.warn(`Model override ${modelOverride} failed, falling back to router logic`);
    }
  }
  
  // Determine which PREMIUM AI model to use based on task and tier
  let modelToUse: string;
  
  switch (task) {
    case 'content-generation':
    case 'bulk-generation':
      // Premium content generation models only
      if (userTier === 'ultra' || userTier === 'lifetime') {
        modelToUse = 'google/gemini-2.5-flash';
      } else if (userTier === 'industry' || userTier === 'starter') {
        modelToUse = 'anthropic/claude-3.5-haiku';
      } else {
        modelToUse = 'google/gemini-2.0-flash-001';
      }
      break;
      
    case 'coaching':
      // Claude Haiku excels at feedback and coaching
      if (userTier === 'ultra' || userTier === 'lifetime') {
        modelToUse = 'anthropic/claude-3.5-haiku';
      } else if (userTier === 'industry' || userTier === 'starter') {
        modelToUse = 'anthropic/claude-3.5-haiku';
      } else {
        modelToUse = 'google/gemini-2.0-flash-001';
      }
      break;
      
    case 'research':
    case 'custom-research':
      // Use smarter models for reports - need quality analysis over speed
      if (userTier === 'ultra' || userTier === 'lifetime') {
        modelToUse = 'google/gemini-2.5-flash'; // Best quality for reports
      } else if (userTier === 'industry' || userTier === 'starter') {
        modelToUse = 'anthropic/claude-3.5-haiku'; // Smarter than 1.5 Flash
      } else {
        modelToUse = 'google/gemini-2.0-flash-001';
      }
      break;
      
    case 'general-qa':
      // General Q&A - use tier-appropriate premium models
      if (userTier === 'ultra' || userTier === 'lifetime') {
        modelToUse = 'google/gemini-2.5-flash';
      } else if (userTier === 'industry' || userTier === 'starter') {
        modelToUse = 'anthropic/claude-3.5-haiku';
      } else {
        modelToUse = 'google/gemini-2.0-flash-001';
      }
      break;
      
    default:
      // Default to tier-appropriate premium models
      if (userTier === 'ultra' || userTier === 'lifetime') {
        modelToUse = 'google/gemini-2.5-flash';
      } else if (userTier === 'industry' || userTier === 'starter') {
        modelToUse = 'anthropic/claude-3.5-haiku';
      } else {
        modelToUse = 'google/gemini-2.0-flash-001';
      }
  }
  
  try {
    console.log(`🤖 Routing ${task} to ${modelToUse} (User tier: ${userTier})`);
    
    // Make the AI request with the selected model
    const response = await getAICompletion({
      messages: [{ role: 'user', content: prompt }],
      model: modelToUse,
      temperature: task === 'research' ? 0.1 : 0.7, // Lower temperature for research tasks
      max_tokens: task === 'bulk-generation' ? 4000 : 2000,
      tier: userTier
    });
    
    return response;
  } catch (error) {
    console.error(`AI Router Error for ${task}:`, error);
    
    // Fallback to Gemini 2.0 Flash if paid model fails
    if (userTier !== 'free') {
      console.log('🔄 Falling back to Gemini 2.0 Flash...');
      try {
        const fallbackResponse = await getAICompletion({
          messages: [{ role: 'user', content: prompt }],
          model: 'google/gemini-2.0-flash-001',
          temperature: 0.7,
          max_tokens: 2000,
          tier: 'free'
        });
        return fallbackResponse;
      } catch (fallbackError) {
        console.error('Fallback AI request also failed:', fallbackError);
        throw new Error('AI service temporarily unavailable. Please try again later.');
      }
    }
    
    throw error;
  }
}

/**
 * Get AI model info for display purposes
 */
export function getAIModelInfo(task: AITask, userTier: 'free' | 'starter' | 'industry' | 'ultra' | 'lifetime' = 'free') {
  if (userTier === 'free') {
    return {
      name: 'Gemini 2.0 Flash',
      provider: 'Google',
      tier: 'Free'
    };
  }
  
  if (userTier === 'ultra' || userTier === 'lifetime') {
    switch (task) {
      case 'content-generation':
      case 'bulk-generation':
      case 'general-qa':
        return {
          name: 'Gemini 2.5 Flash',
          provider: 'Google',
          tier: 'Ultra'
        };
      case 'coaching':
        return {
          name: 'Claude 3.5 Haiku',
          provider: 'Anthropic',
          tier: 'Ultra'
        };
      case 'research':
      case 'custom-research':
        return {
          name: 'Gemini 2.5 Flash',
          provider: 'Google',
          tier: 'Ultra'
        };
      default:
        return {
          name: 'Gemini 2.5 Flash',
          provider: 'Google',
          tier: 'Ultra'
        };
    }
  }
  
  // Pro/Industry/Starter tier
  const tierDisplayName = userTier === 'starter' ? 'Starter' : 
                          userTier === 'industry' ? 'Industry' : 'Starter';
  
  switch (task) {
    case 'content-generation':
    case 'bulk-generation':
    case 'coaching':
    case 'general-qa':
      return {
        name: 'Claude 3.5 Haiku',
        provider: 'Anthropic',
        tier: tierDisplayName
      };
      
    case 'research':
    case 'custom-research':
      return {
        name: 'Claude 3.5 Haiku',
        provider: 'Anthropic',
        tier: tierDisplayName
      };
      
    default:
      return {
        name: 'Claude 3.5 Haiku',
        provider: 'Anthropic',
        tier: tierDisplayName
      };
  }
}