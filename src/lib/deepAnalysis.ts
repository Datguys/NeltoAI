import { getAICompletion } from './ai';

export async function getOrCreateDeepAnalysis(project: { id: string; name: string; description: string; investment?: string; timeframe?: string; difficulty?: string; }) {
  const cacheKey = `deep_analysis_${project.id}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // corrupted cache, ignore
    }
  }

  // Build prompt from project info
  const prompt = `
You are an AI business analyst.\n\nYour ONLY task is to output a valid JSON object. You MUST return only a pure, strict JSON object without any markdown, formatting, commentary, or extra text. No headings. No code fences. No explanations. No intro. No wrapping. No quotes around the entire object. No \`\`\`. No text before or after the JSON. No exceptions.\n\nIf you cannot fill a value, use an empty string ("") or empty array ([]). Use correct syntax. Use double quotes for all keys and string values. Do not include comments.\n\nThe following is a business project to analyze:\n\nTitle: ${project.name}\nDescription: ${project.description}\nInvestment: ${project.investment || ''}\nTimeframe: ${project.timeframe || ''}\nDifficulty: ${project.difficulty || ''}\n\nYour output MUST follow this JSON structure:\n{\n  "opportunity": "Summary paragraph",\n  "pros": ["Pro 1", "Pro 2"],\n  "cons": ["Con 1", "Con 2"],\n  "budget": {\n    "breakdown": [\n      { "category": "Software", "amount": 500, "type": "One-time" },\n      { "category": "Legal", "amount": 300, "type": "One-time" },\n      { "category": "Contingency", "amount": 200, "type": "Buffer" }\n    ],\n    "total": ""\n  },\n  "billOfMaterials": [\n    { "item": "Tool name", "purpose": "What it does", "cost": 99, "type": "Monthly" }\n  ],\n  "timeline": [\n    { "weekRange": "Week 1–2", "milestone": "Planning", "summary": "Define strategy" },\n    { "weekRange": "Week 3–4", "milestone": "Prototype", "summary": "Build MVP" }\n  ],\n  "market": {\n    "audience": "Target market",\n    "size": "Market size in dollars",\n    "location": "Local / National / Global",\n    "competitors": [\n      { "name": "Competitor", "description": "Their product", "strength": "Advantage", "weakness": "Flaw" }\n    ],\n    "differentiation": "How this idea stands out"\n  },\n  "forecast": {\n    "customerValue": 20,\n    "monthlyBurn": 1000,\n    "breakEvenMonth": "Month 6",\n    "12MonthProjection": [\n      { "month": "Month 1", "revenue": 0, "expenses": 1000, "profitLoss": -1000 },\n      { "month": "Month 2", "revenue": 200, "expenses": 1000, "profitLoss": -800 }\n    ]\n  },\n  "marketing": {\n    "freeChannels": ["Reddit", "TikTok"],\n    "paidChannels": ["Meta Ads", "Google Ads"],\n    "retention": ["Email", "Referral"]\n  },\n  "legal": {\n    "businessRegistration": "Details",\n    "taxObligations": "Details",\n    "privacy": "Data concerns",\n    "other": "IP, contracts"\n  },\n  "recommendations": [\n    "Start with...", "Avoid...", "Double your success by..."\n  ]\n}\n\nREMINDER: Output ONLY the raw JSON object. No intro. No \`\`\`. No text. No notes.`;

  const aiResponse = await getAICompletion({
    messages: [
      { role: 'system', content: 'You are a business analyst assistant.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 5000,
    model: 'deepseek/deepseek-r1:free',
    provider: 'openrouter',
  });
  // Robust fallback parser for extracting JSON
  function extractJSON(str: string): any | null {
    try {
      str = str.replace(/```json|```/g, '').trim();
      const match = str.match(/{[\s\S]*}/);
      if (match) return JSON.parse(match[0]);
      return JSON.parse(str);
    } catch {
      return null;
    }
  }
  let parsed = null;
  if (typeof aiResponse === 'string') {
    parsed = extractJSON(aiResponse);
  } else {
    parsed = aiResponse;
  }
  if (parsed) {
    localStorage.setItem(cacheKey, JSON.stringify(parsed));
    return parsed;
  }
  throw new Error('AI did not return valid JSON.');
}
