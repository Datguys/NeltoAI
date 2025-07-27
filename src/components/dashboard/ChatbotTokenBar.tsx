import React from 'react';
import { useCredits } from '@/hooks/useCredits';

export function ChatbotTokenBar() {
  const { tier, usedThisMonth, inputTokensUsed = 0, outputTokensUsed = 0, getMaxTokens, getUsagePercentage, loading } = useCredits();
  
  if (loading) {
    return (
      <div className="w-full flex flex-col gap-1 px-2 pb-1">
        <div className="text-xs text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  const maxTokens = getMaxTokens();
  const percent = Math.round(getUsagePercentage());
  let color = 'bg-primary';
  if (percent >= 80) color = 'bg-warning';
  if (percent >= 100) color = 'bg-destructive';

  return (
    <div className="w-full flex flex-col gap-1 px-2 pb-1">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Tier: <b className="text-foreground">{tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Free'}</b></span>
        <span>{(usedThisMonth || 0).toLocaleString()} / {maxTokens.toLocaleString()} tokens</span>
      </div>
      <div className="relative w-full h-2 rounded bg-border overflow-hidden">
        <div className={`absolute left-0 top-0 h-2 rounded ${color}`} style={{ width: `${percent}%` }} />
      </div>
      {percent >= 80 && percent < 100 && (
        <div className="text-warning text-xs mt-1">⚠️ You are at {percent}% of your monthly limit!</div>
      )}
      {percent >= 100 && (
        <div className="text-destructive text-xs mt-1 font-semibold">⛔ Limit reached. Please upgrade or purchase more credits.</div>
      )}
    </div>
  );
}
