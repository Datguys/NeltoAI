import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAICompletion, getCurrentAIModel } from '../ai';
import { mockFetchResponse, mockLocalStorage } from '../../test/test-utils';

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage
    mockLocalStorage();
  });

  describe('getAICompletion', () => {
    it('should successfully get AI completion with default parameters', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Test AI response' } }],
        usage: { prompt_tokens: 10, completion_tokens: 20 }
      };
      
      mockFetchResponse(mockResponse);
      
      const result = await getAICompletion({
        messages: [{ role: 'user', content: 'Test prompt' }],
        userKey: 'test-user'
      });
      
      expect(result).toBe('Test AI response');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('openrouter.ai'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer'),
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should use tier-appropriate models', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Test response' } }],
        usage: { prompt_tokens: 10, completion_tokens: 20 }
      };
      
      // Test free tier
      mockFetchResponse(mockResponse);
      await getAICompletion({
        messages: [{ role: 'user', content: 'Test' }],
        tier: 'free',
        userKey: 'test-user'
      });
      
      const lastCall = (global.fetch as any).mock.calls.slice(-1)[0];
      const requestBody = JSON.parse(lastCall[1].body);
      expect(requestBody.model).toBe('google/gemini-2.0-flash-001');
      
      // Test pro tier
      mockFetchResponse(mockResponse);
      await getAICompletion({
        messages: [{ role: 'user', content: 'Test' }],
        tier: 'starter',
        userKey: 'test-user'
      });
      
      const proCall = (global.fetch as any).mock.calls.slice(-1)[0];
      const proRequestBody = JSON.parse(proCall[1].body);
      expect(proRequestBody.model).toBe('anthropic/claude-3.5-haiku');
      
      // Test ultra tier
      mockFetchResponse(mockResponse);
      await getAICompletion({
        messages: [{ role: 'user', content: 'Test' }],
        tier: 'ultra',
        userKey: 'test-user'
      });
      
      const ultraCall = (global.fetch as any).mock.calls.slice(-1)[0];
      const ultraRequestBody = JSON.parse(ultraCall[1].body);
      expect(ultraRequestBody.model).toBe('google/gemini-2.5-flash');
    });

    it('should handle token limit validation', async () => {
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({
          tier: 'free',
          usedThisMonth: 9950,
          credits: 50
        })
      });
      
      await expect(
        getAICompletion({
          messages: [{ role: 'user', content: 'This is a very long prompt that will exceed token limits for testing purposes. '.repeat(100) }],
          userKey: 'test-user'
        })
      ).rejects.toThrow(/tokens left this month/);
    });

    it('should fallback from Gemini 2.5 to 2.0 on error', async () => {
      // Mock first call to fail (Gemini 2.5)
      const errorResponse = { ok: false, status: 404 };
      (global.fetch as any).mockResolvedValueOnce(errorResponse);
      
      // Mock second call to succeed (Gemini 2.0)
      const successResponse = {
        choices: [{ message: { content: 'Fallback response' } }],
        usage: { prompt_tokens: 10, completion_tokens: 20 }
      };
      mockFetchResponse(successResponse);
      
      const result = await getAICompletion({
        messages: [{ role: 'user', content: 'Test' }],
        tier: 'ultra',
        userKey: 'test-user'
      });
      
      expect(result).toBe('Fallback response');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should update token usage after successful completion', async () => {
      const localStorage = mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({
          tier: 'free',
          credits: 10000,
          usedThisMonth: 0
        })
      });
      
      const mockResponse = {
        choices: [{ message: { content: 'Test response' } }],
        usage: { prompt_tokens: 50, completion_tokens: 100 }
      };
      
      mockFetchResponse(mockResponse);
      
      await getAICompletion({
        messages: [{ role: 'user', content: 'Test prompt' }],
        userKey: 'test-user'
      });
      
      // Check that token usage was updated
      expect(localStorage.setItem).toHaveBeenCalled();
      const setItemCalls = localStorage.setItem.mock.calls;
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const updatedState = JSON.parse(lastCall[1]);
      expect(updatedState.usedThisMonth).toBe(150); // 50 + 100
    });

    it('should throw error on API failure', async () => {
      const errorResponse = {
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'API Error' } })
      };
      (global.fetch as any).mockResolvedValueOnce(errorResponse);
      
      await expect(
        getAICompletion({
          messages: [{ role: 'user', content: 'Test' }],
          userKey: 'test-user'
        })
      ).rejects.toThrow('API Error');
    });
  });

  describe('getCurrentAIModel', () => {
    it('should return correct model info for each tier', () => {
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({ tier: 'free' })
      });
      
      const freeModel = getCurrentAIModel('test-user');
      expect(freeModel.tier).toBe('free');
      expect(freeModel.model).toBe('google/gemini-2.0-flash-001');
      expect(freeModel.display).toContain('Free');
      
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({ tier: 'pro' })
      });
      
      const proModel = getCurrentAIModel('test-user');
      expect(proModel.tier).toBe('pro');
      expect(proModel.model).toBe('anthropic/claude-3.5-haiku');
      expect(proModel.display).toContain('Pro');
      
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({ tier: 'ultra' })
      });
      
      const ultraModel = getCurrentAIModel('test-user');
      expect(ultraModel.tier).toBe('ultra');
      expect(ultraModel.model).toBe('google/gemini-2.5-flash');
      expect(ultraModel.display).toContain('Ultra');
    });

    it('should default to free tier when no storage data', () => {
      const model = getCurrentAIModel('new-user');
      expect(model.tier).toBe('free');
      expect(model.model).toBe('google/gemini-2.0-flash-001');
    });
  });
});