// src/lib/openrouter.ts
import axios from 'axios';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function getOpenRouterCompletion({
  messages,
  model = 'mistralai/mistral-large',
  temperature = 0.7,
  max_tokens = 512
}: {
  messages: OpenRouterMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}): Promise<string> {
  if (!OPENROUTER_API_KEY) throw new Error('Missing OpenRouter API key');

  const headers = {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': window.location.origin,
    'X-Title': 'VeltoAI',
  };

  const data = {
    model,
    messages,
    temperature,
    max_tokens,
  };

  const response = await axios.post(OPENROUTER_API_URL, data, { headers });
  return response.data.choices[0].message.content.trim();
}
