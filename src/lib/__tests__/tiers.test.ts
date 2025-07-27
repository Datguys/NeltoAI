import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  TIERS,
  getUserTier,
  getTokenLimit,
  hasPremiumAccess,
  hasFeatureAccess,
  canAccessFeature,
  getProjectLimit,
  canCreateMoreProjects,
  getAIModelTier,
  FEATURE_ACCESS,
  PROJECT_LIMITS,
  type Tier
} from '../tiers';

describe('Tiers Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear window.UserContext
    if (typeof window !== 'undefined') {
      delete (window as any).UserContext;
    }
  });

  describe('TIERS constant', () => {
    it('should have all required tier definitions', () => {
      expect(TIERS).toHaveProperty('free');
      expect(TIERS).toHaveProperty('starter');
      expect(TIERS).toHaveProperty('ultra');
      expect(TIERS).toHaveProperty('lifetime');
      
      Object.values(TIERS).forEach(tier => {
        expect(tier).toHaveProperty('name');
        expect(tier).toHaveProperty('tokenLimit');
        expect(tier).toHaveProperty('description');
        expect(tier).toHaveProperty('price');
        expect(tier).toHaveProperty('aiModel');
      });
    });

    it('should have ascending token limits', () => {
      expect(TIERS.free.tokenLimit).toBeLessThan(TIERS.starter.tokenLimit);
      expect(TIERS.starter.tokenLimit).toBeLessThan(TIERS.ultra.tokenLimit);
      expect(TIERS.ultra.tokenLimit).toBeLessThan(TIERS.lifetime.tokenLimit);
    });
  });

  describe('getUserTier', () => {
    it('should return free tier by default', () => {
      const tier = getUserTier();
      expect(tier).toBe('free');
    });

    it('should return tier from window.UserContext when available', () => {
      (window as any).UserContext = { tier: 'ultra' };
      const tier = getUserTier();
      expect(tier).toBe('ultra');
    });
  });

  describe('getTokenLimit', () => {
    it('should return correct token limits for each tier', () => {
      expect(getTokenLimit('free')).toBe(10000);
      expect(getTokenLimit('starter')).toBe(50000);
      expect(getTokenLimit('ultra')).toBe(250000);
      expect(getTokenLimit('lifetime')).toBe(999999999);
    });

    it('should default to free tier for invalid tier', () => {
      expect(getTokenLimit('invalid' as Tier)).toBe(10000);
      expect(getTokenLimit(undefined as any)).toBe(10000);
    });
  });

  describe('hasPremiumAccess', () => {
    it('should always return false (as per current implementation)', () => {
      expect(hasPremiumAccess('free')).toBe(false);
      expect(hasPremiumAccess('starter')).toBe(false);
      expect(hasPremiumAccess('ultra')).toBe(false);
      expect(hasPremiumAccess('lifetime')).toBe(false);
    });
  });

  describe('hasFeatureAccess', () => {
    it('should grant access to lower tier requirements', () => {
      expect(hasFeatureAccess('ultra', 'free')).toBe(true);
      expect(hasFeatureAccess('ultra', 'starter')).toBe(true);
      expect(hasFeatureAccess('starter', 'free')).toBe(true);
    });

    it('should deny access to higher tier requirements', () => {
      expect(hasFeatureAccess('free', 'starter')).toBe(false);
      expect(hasFeatureAccess('free', 'ultra')).toBe(false);
      expect(hasFeatureAccess('starter', 'ultra')).toBe(false);
    });

    it('should grant access to same tier requirements', () => {
      expect(hasFeatureAccess('free', 'free')).toBe(true);
      expect(hasFeatureAccess('starter', 'starter')).toBe(true);
      expect(hasFeatureAccess('ultra', 'ultra')).toBe(true);
      expect(hasFeatureAccess('lifetime', 'lifetime')).toBe(true);
    });
  });

  describe('canAccessFeature', () => {
    it('should correctly check access to free features', () => {
      expect(canAccessFeature('free', 'chatbot')).toBe(true);
      expect(canAccessFeature('starter', 'chatbot')).toBe(true);
      expect(canAccessFeature('ultra', 'chatbot')).toBe(true);
      expect(canAccessFeature('lifetime', 'chatbot')).toBe(true);
    });

    it('should correctly check access to starter features', () => {
      expect(canAccessFeature('free', 'timelineAssistant')).toBe(false);
      expect(canAccessFeature('starter', 'timelineAssistant')).toBe(true);
      expect(canAccessFeature('ultra', 'timelineAssistant')).toBe(true);
      expect(canAccessFeature('lifetime', 'timelineAssistant')).toBe(true);
    });

    it('should correctly check access to ultra features', () => {
      expect(canAccessFeature('free', 'storeSync')).toBe(false);
      expect(canAccessFeature('starter', 'storeSync')).toBe(false);
      expect(canAccessFeature('ultra', 'storeSync')).toBe(true);
      expect(canAccessFeature('lifetime', 'storeSync')).toBe(true);
    });
  });

  describe('getProjectLimit', () => {
    it('should return correct project limits', () => {
      expect(getProjectLimit('free')).toBe(1);
      expect(getProjectLimit('starter')).toBe(999999);
      expect(getProjectLimit('ultra')).toBe(999999);
      expect(getProjectLimit('lifetime')).toBe(999999);
    });

    it('should default to free limit for invalid tier', () => {
      expect(getProjectLimit('invalid' as Tier)).toBe(1);
    });
  });

  describe('canCreateMoreProjects', () => {
    it('should allow creation within limits', () => {
      expect(canCreateMoreProjects('free', 0)).toBe(true);
      expect(canCreateMoreProjects('starter', 50)).toBe(true);
      expect(canCreateMoreProjects('ultra', 1000)).toBe(true);
    });

    it('should deny creation when at limit', () => {
      expect(canCreateMoreProjects('free', 1)).toBe(false);
      expect(canCreateMoreProjects('free', 2)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(canCreateMoreProjects('starter', 999998)).toBe(true);
      expect(canCreateMoreProjects('starter', 999999)).toBe(false);
    });
  });

  describe('getAIModelTier', () => {
    it('should return correct AI model tiers', () => {
      expect(getAIModelTier('free')).toBe('basic');
      expect(getAIModelTier('starter')).toBe('advanced');
      expect(getAIModelTier('ultra')).toBe('premium');
      expect(getAIModelTier('lifetime')).toBe('premium');
    });
  });

  describe('FEATURE_ACCESS constant', () => {
    it('should have all expected features defined', () => {
      const expectedFeatures = [
        'chatbot',
        'timelineAssistant',
        'legalCompliance',
        'ideaGenerator',
        'budgetPlanner',
        'bomAnalysis',
        'deepAnalysis',
        'integrations',
        'storeSync',
        'pdfExport',
        'analytics',
        'teamCollaboration',
        'advancedAI'
      ];

      expectedFeatures.forEach(feature => {
        expect(FEATURE_ACCESS).toHaveProperty(feature);
        expect(['free', 'starter', 'ultra', 'lifetime']).toContain(FEATURE_ACCESS[feature as keyof typeof FEATURE_ACCESS]);
      });
    });
  });

  describe('PROJECT_LIMITS constant', () => {
    it('should have limits for all tiers', () => {
      expect(PROJECT_LIMITS).toHaveProperty('free');
      expect(PROJECT_LIMITS).toHaveProperty('starter');
      expect(PROJECT_LIMITS).toHaveProperty('ultra');
      expect(PROJECT_LIMITS).toHaveProperty('lifetime');
      
      expect(typeof PROJECT_LIMITS.free).toBe('number');
      expect(typeof PROJECT_LIMITS.starter).toBe('number');
      expect(typeof PROJECT_LIMITS.ultra).toBe('number');
      expect(typeof PROJECT_LIMITS.lifetime).toBe('number');
    });
  });
});