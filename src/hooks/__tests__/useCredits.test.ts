import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCredits } from '../useCredits';
import { mockLocalStorage } from '../../test/test-utils';

// Mock the Firebase user hook
vi.mock('../useFirebaseUser', () => ({
  useFirebaseUser: vi.fn(() => ({
    user: { uid: 'test-user', email: 'test@example.com' },
    loading: false
  }))
}));

// Mock Firebase operations
vi.mock('../../lib/firestoreProjects', () => ({
  getUserTier: vi.fn(),
  setUserTier: vi.fn(),
  updateUserCredits: vi.fn()
}));

describe('useCredits Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage();
  });

  describe('Initial State', () => {
    it('should initialize with default free tier credits', async () => {
      const { result } = renderHook(() => useCredits());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.tier).toBe('free');
      expect(result.current.credits).toBe(10000);
      expect(result.current.usedThisMonth).toBe(0);
      expect(result.current.getMaxTokens()).toBe(10000);
      expect(result.current.getRemainingTokens()).toBe(10000);
      expect(result.current.getUsagePercentage()).toBe(0);
    });

    it('should load existing data from localStorage', async () => {
      const existingData = {
        tier: 'starter',
        credits: 8000,
        usedThisMonth: 2000,
        lastReset: new Date().toISOString().slice(0, 7)
      };
      
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify(existingData)
      });

      const { result } = renderHook(() => useCredits());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.tier).toBe('starter');
      expect(result.current.credits).toBe(8000);
      expect(result.current.usedThisMonth).toBe(2000);
    });
  });

  describe('Credit Operations', () => {
    it('should deduct credits correctly', async () => {
      const { result } = renderHook(() => useCredits());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deductCredits(500);
      });

      expect(result.current.credits).toBe(9500);
      expect(result.current.usedThisMonth).toBe(500);
    });

    it('should not allow negative credits', async () => {
      const { result } = renderHook(() => useCredits());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deductCredits(15000); // More than available
      });

      expect(result.current.credits).toBe(0);
      expect(result.current.usedThisMonth).toBe(15000);
    });

    it('should add credits correctly', async () => {
      const { result } = renderHook(() => useCredits());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addCredits(5000);
      });

      expect(result.current.credits).toBe(15000);
    });
  });

  describe('Tier Management', () => {
    it('should set tier and reset credits appropriately', async () => {
      const { result } = renderHook(() => useCredits());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.setTier('starter');
      });

      expect(result.current.tier).toBe('starter');
      expect(result.current.credits).toBe(50000); // Starter tier limit
      expect(result.current.usedThisMonth).toBe(0);
    });

    it('should handle tier upgrade with subscription tracking', async () => {
      const { result } = renderHook(() => useCredits());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.setTier('ultra', true); // isPayment = true
      });

      expect(result.current.tier).toBe('ultra');
      expect(result.current.credits).toBe(250000); // Ultra tier limit
      expect(result.current.subscriptionStartDate).toBeDefined();
      expect(result.current.lastPaymentDate).toBeDefined();
      expect(result.current.paymentStatus).toBe('active');
    });

    it('should handle downgrade to free tier', async () => {
      // Start with pro tier
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({
          tier: 'starter',
          credits: 50000,
          usedThisMonth: 0,
          subscriptionStartDate: '2024-01-01T00:00:00.000Z',
          lastPaymentDate: '2024-01-01T00:00:00.000Z',
          paymentStatus: 'active'
        })
      });

      const { result } = renderHook(() => useCredits());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.setTier('free');
      });

      expect(result.current.tier).toBe('free');
      expect(result.current.credits).toBe(10000); // Free tier limit
      expect(result.current.subscriptionStartDate).toBeUndefined();
      expect(result.current.lastPaymentDate).toBeUndefined();
    });
  });

  describe('Monthly Reset', () => {
    it('should reset credits for new month', async () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 2);
      
      const oldData = {
        tier: 'starter',
        credits: 1000,
        usedThisMonth: 49000,
        lastReset: lastMonth.toISOString().slice(0, 7)
      };
      
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify(oldData)
      });

      const { result } = renderHook(() => useCredits());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.resetMonthly();
      });

      expect(result.current.credits).toBe(50000); // Reset to pro tier limit
      expect(result.current.usedThisMonth).toBe(0);
    });

    it('should not reset if same month', async () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const currentData = {
        tier: 'starter',
        credits: 30000,
        usedThisMonth: 20000,
        lastReset: currentMonth
      };
      
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify(currentData)
      });

      const { result } = renderHook(() => useCredits());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.resetMonthly();
      });

      // Should remain unchanged
      expect(result.current.credits).toBe(30000);
      expect(result.current.usedThisMonth).toBe(20000);
    });
  });

  describe('Helper Functions', () => {
    it('should calculate usage percentage correctly', async () => {
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({
          tier: 'free',
          credits: 7500,
          usedThisMonth: 2500,
          lastReset: new Date().toISOString().slice(0, 7)
        })
      });

      const { result } = renderHook(() => useCredits());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.getMaxTokens()).toBe(10000);
      expect(result.current.getRemainingTokens()).toBe(7500);
      expect(result.current.getUsagePercentage()).toBe(25); // 2500/10000 * 100
    });

    it('should handle 100% usage correctly', async () => {
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({
          tier: 'free',
          credits: 0,
          usedThisMonth: 10000,
          lastReset: new Date().toISOString().slice(0, 7)
        })
      });

      const { result } = renderHook(() => useCredits());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.getRemainingTokens()).toBe(0);
      expect(result.current.getUsagePercentage()).toBe(100);
    });

    it('should cap usage percentage at 100%', async () => {
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({
          tier: 'free',
          credits: 0,
          usedThisMonth: 15000, // Over limit
          lastReset: new Date().toISOString().slice(0, 7)
        })
      });

      const { result } = renderHook(() => useCredits());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.getUsagePercentage()).toBe(100); // Capped at 100%
    });
  });

  describe('Credit Packages', () => {
    it('should expose credit packages', async () => {
      const { result } = renderHook(() => useCredits());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.CREDIT_PACKAGES).toBeDefined();
      expect(Array.isArray(result.current.CREDIT_PACKAGES)).toBe(true);
      expect(result.current.CREDIT_PACKAGES.length).toBeGreaterThan(0);
      
      result.current.CREDIT_PACKAGES.forEach(pkg => {
        expect(pkg).toHaveProperty('credits');
        expect(pkg).toHaveProperty('price');
        expect(typeof pkg.credits).toBe('number');
        expect(typeof pkg.price).toBe('number');
      });
    });
  });
});