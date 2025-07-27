import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAICompletion } from '../../lib/ai';
import { mockLocalStorage, mockFetchResponse } from '../test-utils';

describe('AI Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage();
    
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('End-to-End AI Workflows', () => {
    it('should complete full AI request cycle with token tracking', async () => {
      // Setup user with credits
      const userCredits = {
        tier: 'pro',
        credits: 50000,
        usedThisMonth: 1000,
        lastReset: new Date().toISOString().slice(0, 7)
      };
      
      const localStorage = mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify(userCredits)
      });
      
      // Mock successful API response
      const mockResponse = {
        choices: [{ message: { content: 'AI generated response for testing' } }],
        usage: { prompt_tokens: 50, completion_tokens: 100 }
      };
      
      mockFetchResponse(mockResponse);
      
      // Make AI request
      const result = await getAICompletion({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Generate a business plan outline' }
        ],
        userKey: 'test-user'
      });
      
      // Verify response
      expect(result).toBe('AI generated response for testing');
      
      // Verify API call was made correctly
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('openrouter.ai'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer'),
            'Content-Type': 'application/json',
            'HTTP-Referer': expect.any(String),
            'X-Title': 'Founder Launch Pilot'
          }),
          body: expect.stringContaining('anthropic/claude-3.5-haiku') // Pro tier model
        })
      );
      
      // Verify token usage was updated
      expect(localStorage.setItem).toHaveBeenCalled();
      const lastCall = localStorage.setItem.mock.calls.slice(-1)[0];
      const updatedState = JSON.parse(lastCall[1]);
      expect(updatedState.usedThisMonth).toBe(1150); // 1000 + 50 + 100
      expect(updatedState.credits).toBe(48850); // 50000 - 150
    });

    it('should handle tier-based model selection correctly', async () => {
      const testCases = [
        { tier: 'free', expectedModel: 'google/gemini-2.0-flash-001' },
        { tier: 'pro', expectedModel: 'anthropic/claude-3.5-haiku' },
        { tier: 'ultra', expectedModel: 'google/gemini-2.5-flash' },
        { tier: 'lifetime', expectedModel: 'google/gemini-2.5-flash' }
      ];
      
      for (const testCase of testCases) {
        // Reset mocks for each test case
        vi.clearAllMocks();
        global.fetch = vi.fn();
        
        mockLocalStorage({
          [`ai_credits_v1_${testCase.tier}-user`]: JSON.stringify({
            tier: testCase.tier,
            credits: 10000,
            usedThisMonth: 0
          })
        });
        
        mockFetchResponse({
          choices: [{ message: { content: `Response for ${testCase.tier}` } }],
          usage: { prompt_tokens: 10, completion_tokens: 20 }
        });
        
        await getAICompletion({
          messages: [{ role: 'user', content: 'Test message' }],
          userKey: `${testCase.tier}-user`
        });
        
        // Verify correct model was used
        const fetchCall = (global.fetch as any).mock.calls[0];
        const requestBody = JSON.parse(fetchCall[1].body);
        expect(requestBody.model).toBe(testCase.expectedModel);
      }
    });

    it('should handle API failures gracefully with proper error messages', async () => {
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({
          tier: 'free',
          credits: 10000,
          usedThisMonth: 0
        })
      });
      
      // Mock API error
      const errorResponse = {
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Rate limit exceeded' } })
      };
      (global.fetch as any).mockResolvedValueOnce(errorResponse);
      
      await expect(
        getAICompletion({
          messages: [{ role: 'user', content: 'Test' }],
          userKey: 'test-user'
        })
      ).rejects.toThrow('Rate limit exceeded');
      
      // Verify no tokens were deducted on error
      const localStorage = (window.localStorage as any);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should enforce token limits across multiple requests', async () => {
      const localStorage = mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({
          tier: 'free',
          credits: 100, // Very low credits
          usedThisMonth: 9900 // Near limit (10k for free tier)
        })
      });
      
      // First request should succeed (within limit)
      mockFetchResponse({
        choices: [{ message: { content: 'First response' } }],
        usage: { prompt_tokens: 30, completion_tokens: 50 }
      });
      
      const firstResult = await getAICompletion({
        messages: [{ role: 'user', content: 'Small request' }],
        userKey: 'test-user'
      });
      
      expect(firstResult).toBe('First response');
      
      // Second request should fail (would exceed limit)
      await expect(
        getAICompletion({
          messages: [{ role: 'user', content: 'Large request that would exceed token limit'.repeat(50) }],
          userKey: 'test-user'
        })
      ).rejects.toThrow(/tokens left this month/);
    });

    it('should handle fallback from premium to basic models', async () => {
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({
          tier: 'ultra',
          credits: 100000,
          usedThisMonth: 1000
        })
      });
      
      // Mock Gemini 2.5 failure
      const errorResponse = { ok: false, status: 404 };
      (global.fetch as any).mockResolvedValueOnce(errorResponse);
      
      // Mock Gemini 2.0 success
      mockFetchResponse({
        choices: [{ message: { content: 'Fallback response' } }],
        usage: { prompt_tokens: 20, completion_tokens: 40 }
      });
      
      const result = await getAICompletion({
        messages: [{ role: 'user', content: 'Test fallback' }],
        userKey: 'test-user'
      });
      
      expect(result).toBe('Fallback response');
      expect(global.fetch).toHaveBeenCalledTimes(2); // First call failed, second succeeded
      
      // Verify second call used fallback model
      const secondCall = (global.fetch as any).mock.calls[1];
      const secondRequestBody = JSON.parse(secondCall[1].body);
      expect(secondRequestBody.model).toBe('google/gemini-2.0-flash-001');
    });
  });

  describe('Cross-Component AI Integration', () => {
    it('should maintain consistent token tracking across different features', async () => {
      const initialCredits = {
        tier: 'pro',
        credits: 50000,
        usedThisMonth: 0,
        lastReset: new Date().toISOString().slice(0, 7)
      };
      
      const localStorage = mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify(initialCredits)
      });
      
      // Simulate BOM generation request
      mockFetchResponse({
        choices: [{ message: { content: JSON.stringify([{ category: 'Test', items: [] }]) } }],
        usage: { prompt_tokens: 100, completion_tokens: 200 }
      });
      
      await getAICompletion({
        messages: [
          { role: 'system', content: 'You are a helpful startup bill of materials generator.' },
          { role: 'user', content: 'Generate BOM for electronics project' }
        ],
        userKey: 'test-user'
      });
      
      // Simulate budget planner request
      mockFetchResponse({
        choices: [{ message: { content: JSON.stringify([{ category: 'Marketing', amount: 5000 }]) } }],
        usage: { prompt_tokens: 80, completion_tokens: 150 }
      });
      
      await getAICompletion({
        messages: [
          { role: 'system', content: 'You are a helpful budget planner.' },
          { role: 'user', content: 'Generate budget for SaaS startup' }
        ],
        userKey: 'test-user'
      });
      
      // Verify cumulative token usage
      const finalCall = localStorage.setItem.mock.calls.slice(-1)[0];
      const finalState = JSON.parse(finalCall[1]);
      expect(finalState.usedThisMonth).toBe(530); // (100+200) + (80+150)
      expect(finalState.credits).toBe(49470); // 50000 - 530
    });

    it('should handle concurrent AI requests properly', async () => {
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({
          tier: 'ultra',
          credits: 100000,
          usedThisMonth: 1000
        })
      });
      
      // Mock responses for concurrent requests
      const responses = [
        { choices: [{ message: { content: 'Response 1' } }], usage: { prompt_tokens: 50, completion_tokens: 100 } },
        { choices: [{ message: { content: 'Response 2' } }], usage: { prompt_tokens: 60, completion_tokens: 120 } },
        { choices: [{ message: { content: 'Response 3' } }], usage: { prompt_tokens: 40, completion_tokens: 80 } }
      ];
      
      responses.forEach(response => mockFetchResponse(response));
      
      // Make concurrent requests
      const promises = [
        getAICompletion({
          messages: [{ role: 'user', content: 'Request 1' }],
          userKey: 'test-user'
        }),
        getAICompletion({
          messages: [{ role: 'user', content: 'Request 2' }],
          userKey: 'test-user'
        }),
        getAICompletion({
          messages: [{ role: 'user', content: 'Request 3' }],
          userKey: 'test-user'
        })
      ];
      
      const results = await Promise.all(promises);
      
      expect(results).toEqual(['Response 1', 'Response 2', 'Response 3']);
      expect(global.fetch).toHaveBeenCalledTimes(3);
      
      // Note: Due to the async nature, exact token tracking might vary
      // but all requests should complete successfully
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from network errors', async () => {
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({
          tier: 'free',
          credits: 10000,
          usedThisMonth: 0
        })
      });
      
      // Mock network error
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      await expect(
        getAICompletion({
          messages: [{ role: 'user', content: 'Test' }],
          userKey: 'test-user'
        })
      ).rejects.toThrow('Network error');
      
      // Subsequent request should work
      mockFetchResponse({
        choices: [{ message: { content: 'Recovery successful' } }],
        usage: { prompt_tokens: 10, completion_tokens: 20 }
      });
      
      const result = await getAICompletion({
        messages: [{ role: 'user', content: 'Test recovery' }],
        userKey: 'test-user'
      });
      
      expect(result).toBe('Recovery successful');
    });

    it('should handle malformed API responses', async () => {
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({
          tier: 'free',
          credits: 10000,
          usedThisMonth: 0
        })
      });
      
      // Mock malformed response
      const malformedResponse = {
        ok: true,
        status: 200,
        json: async () => ({ invalid: 'structure' }) // Missing choices array
      };
      (global.fetch as any).mockResolvedValueOnce(malformedResponse);
      
      const result = await getAICompletion({
        messages: [{ role: 'user', content: 'Test' }],
        userKey: 'test-user'
      });
      
      // Should return empty string for malformed response
      expect(result).toBe('');
    });
  });

  describe('Performance and Optimization', () => {
    it('should complete AI requests within reasonable time', async () => {
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({
          tier: 'pro',
          credits: 50000,
          usedThisMonth: 0
        })
      });
      
      mockFetchResponse({
        choices: [{ message: { content: 'Fast response' } }],
        usage: { prompt_tokens: 20, completion_tokens: 30 }
      });
      
      const startTime = Date.now();
      
      const result = await getAICompletion({
        messages: [{ role: 'user', content: 'Quick test' }],
        userKey: 'test-user'
      });
      
      const duration = Date.now() - startTime;
      
      expect(result).toBe('Fast response');
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle large prompt efficiently', async () => {
      mockLocalStorage({
        'ai_credits_v1_test-user': JSON.stringify({
          tier: 'ultra',
          credits: 250000,
          usedThisMonth: 0
        })
      });
      
      mockFetchResponse({
        choices: [{ message: { content: 'Large prompt response' } }],
        usage: { prompt_tokens: 1000, completion_tokens: 500 }
      });
      
      const largePrompt = 'This is a very long prompt. '.repeat(200);
      
      const result = await getAICompletion({
        messages: [{ role: 'user', content: largePrompt }],
        userKey: 'test-user'
      });
      
      expect(result).toBe('Large prompt response');
      
      // Verify request was made with appropriate parameters
      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.messages[0].content).toBe(largePrompt);
    });
  });
});