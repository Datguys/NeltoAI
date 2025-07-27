// src/lib/tokenUtils.ts
// Utility for accurate token counting, using tiktoken or fallback estimation

// If tiktoken is not available, fallback to a rough word/char count
export function countTokens(text: string): number {
  // Try to use tiktoken if available (dynamic import)
  try {
    // @ts-expect-error - tiktoken may not be available
    if (window.tiktoken) {
      // @ts-expect-error - tiktoken not typed globally
      const encoder = window.tiktoken.get_encoding('cl100k_base');
      return encoder.encode(text).length;
    }
  } catch {
    // Ignore tiktoken errors and use fallback
  }
  // Fallback: estimate 1 token ≈ 4 chars (OpenAI rule-of-thumb)
  return Math.ceil(text.length / 4);
}

// Count tokens for all messages in OpenAI/Chat format
export function countMessagesTokens(messages: { role: string; content: string }[]): number {
  if (!messages || !Array.isArray(messages)) {
    return 0;
  }
  return messages.reduce((sum, msg) => sum + countTokens(msg.content || ''), 0);
}
