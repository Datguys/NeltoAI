import { cn } from "@/lib/utils";

export function AffiliateTierIcon({ tier, animated = true, size = 48 }: { tier: "Bronze" | "Silver" | "Gold" | "Diamond", animated?: boolean, size?: number }) {
  const tierStyles = {
    Bronze: "from-yellow-700 to-yellow-400 shadow-yellow-400/70",
    Silver: "from-gray-400 to-white shadow-gray-300/70",
    Gold: "from-yellow-400 to-yellow-200 shadow-yellow-200/70",
    Diamond: "from-blue-400 to-white shadow-blue-200/70",
  };
  const icon = {
    Bronze: "🥉",
    Silver: "🥈",
    Gold: "🥇",
    Diamond: "💎",
  }[tier];
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full border-2 border-white",
        animated && "animate-glow",
        `bg-gradient-to-br ${tierStyles[tier]}`
      )}
      style={{ width: size, height: size, boxShadow: animated ? `0 0 24px 6px var(--tw-shadow-color)` : undefined }}
    >
      <span style={{ fontSize: size * 0.6 }}>{icon}</span>
    </div>
  );
}

// Add this to your global CSS or Tailwind config:
// .animate-glow { animation: glowPulse 2s infinite alternate; }
// @keyframes glowPulse { 0% { filter: drop-shadow(0 0 0px #fff); } 100% { filter: drop-shadow(0 0 12px #fff); } }
