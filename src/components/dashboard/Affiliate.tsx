import React, { useState } from "react";
import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Info, TrendingUp, UserCheck, DollarSign, RefreshCw, Lock, Zap, CheckCircle, AlertTriangle, CreditCard, Clock, ArrowRight, Briefcase } from "lucide-react";
import { AffiliateTierIcon } from "./AffiliateTierIcon";

export function Affiliate() {
  // Real referral data
  const { user, loading: userLoading } = useFirebaseUser();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Calculate tier and commission
  const signups = referralStats?.signups || 0;
  let tier: "Bronze" | "Silver" | "Gold" | "Diamond" = "Bronze";
  let commission = 0.10;
  let nextTier: "Silver" | "Gold" | "Diamond" | null = "Silver";
  let nextTierReferrals = 5 - signups;
  if (signups >= 30) {
    tier = "Diamond";
    commission = 0.25;
    nextTier = null;
    nextTierReferrals = 0;
  } else if (signups >= 15) {
    tier = "Gold";
    commission = 0.20;
    nextTier = "Diamond";
    nextTierReferrals = 30 - signups;
  } else if (signups >= 5) {
    tier = "Silver";
    commission = 0.15;
    nextTier = "Gold";
    nextTierReferrals = 15 - signups;
  } else {
    tier = "Bronze";
    commission = 0.10;
    nextTier = "Silver";
    nextTierReferrals = 5 - signups;
  }
  const impact = {
    businessesLaunched: referralStats?.businessesLaunched || 0,
    revenueGenerated: referralStats?.revenueGenerated || 0,
    avgLaunchTime: referralStats?.avgLaunchTime || 0,
    launchTimeImprovement: referralStats?.launchTimeImprovement || 0
  };

  // Referral link generation
  const referralLink = referralCode ? `${window.location.origin}/?ref=${referralCode}` : "";

  // Fetch referral code and stats
  React.useEffect(() => {
    if (!user) return;
    setLoading(true);
    import("@/lib/firestoreReferrals").then(({ getOrCreateReferralCode, getReferralStats }) => {
      getOrCreateReferralCode(user.uid).then(code => {
        setReferralCode(code);
        getReferralStats(code).then(stats => {
          setReferralStats(stats);
          setLoading(false);
        });
      });
    });
  }, [user]);
  const toolboxTabs = ["Twitter", "Instagram", "YouTube Shorts", "Blog"];
  const [toolboxTab, setToolboxTab] = useState(toolboxTabs[0]);
  // Earnings: Use real data if available
  const available = referralStats?.earningsAvailable ?? 0;
  const pending = referralStats?.earningsPending ?? 0;
  const nextPayout = referralStats?.nextPayout ?? "-";
  const payoutMethod = referralStats?.payoutMethod ?? "Stripe";
  const payoutThreshold = referralStats?.payoutThreshold ?? 100; // default $100
  const onboarding = [
    { step: "Customize your referral link", done: true },
    { step: "Share your first post (auto-post option)", done: false },
    { step: "Hit your first signup and unlock a reward!", done: false }
  ];

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96 text-xl text-muted-foreground">Loading affiliate data…</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      <h1 className="text-4xl font-extrabold text-white mb-2">Affiliate Program</h1>
      <p className="text-lg text-muted-foreground mb-6">Earn up to 25% commission and unlock exclusive rewards as you level up your affiliate journey. Track your impact, manage payouts, and access high-converting content below.</p>
      {/* Tier Card + Progress */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <Card className="flex-1 bg-card/70 border border-border p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <AffiliateTierIcon tier={tier} animated size={64} />
          <div className="mt-3 mb-1 text-xl font-bold text-white">{tier} Tier</div>
          <div className="text-sm text-muted-foreground mb-2">{Math.round(commission * 100)}% commission</div>
          <div className="flex gap-2 justify-center">
            <Badge className="bg-gradient-to-r from-gray-400 to-white text-black">{Math.round(commission * 100)}% Commission</Badge>
            {tier === "Diamond" && <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-200 text-black">Top Tier</Badge>}
            {tier === "Gold" && <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-200 text-black">High Earner</Badge>}
            {tier === "Silver" && <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white">Level Up</Badge>}
            {tier === "Bronze" && <Badge className="bg-gradient-to-r from-gray-400 to-white text-black">Starter</Badge>}
          </div>
        </Card>
        {/* Next Tier Progress */}
        {nextTier && (
        <Card className="flex-1 bg-card/70 border border-border p-6 flex flex-col justify-center items-center text-center">
          <div className="mb-2 text-lg font-semibold text-white">Next Tier: {nextTier}</div>
          <AffiliateTierIcon tier={nextTier} animated size={48} />
          <div className="mt-2 text-sm text-muted-foreground">You're <span className="font-bold text-white">{nextTierReferrals} referrals</span> away from hitting <span className="font-bold text-white">{nextTier === "Silver" ? "15%" : nextTier === "Gold" ? "20%" : "25%"} commission</span>!</div>
          <div className="w-full mt-3 bg-muted-foreground/10 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-200 h-2 rounded-full" style={{ width: `${Math.min(100, (signups / (nextTier === "Silver" ? 5 : nextTier === "Gold" ? 15 : 30)) * 100)}%` }} />
          </div>
        </Card>
        )}
      </div>
      {/* Funnel Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card className="flex flex-col items-center bg-card/60 border border-border p-4">
          <TrendingUp className="w-5 h-5 text-primary mb-1" />
          <span className="text-xs text-muted-foreground">Link Clicks</span>
          <span className="text-lg font-bold text-white">{referralStats?.clicks ?? 0}</span>
        </Card>
        <Card className="flex flex-col items-center bg-card/60 border border-border p-4">
          <UserCheck className="w-5 h-5 text-primary mb-1" />
          <span className="text-xs text-muted-foreground">Signups</span>
          <span className="text-lg font-bold text-white">{referralStats?.signups ?? 0}</span>
        </Card>
        <Card className="flex flex-col items-center bg-card/60 border border-border p-4">
          <DollarSign className="w-5 h-5 text-primary mb-1" />
          <span className="text-xs text-muted-foreground">Conversions</span>
          <span className="text-lg font-bold text-white">{referralStats?.conversions ?? 0}</span>
        </Card>
        <Card className="flex flex-col items-center bg-card/60 border border-border p-4">
          <RefreshCw className="w-5 h-5 text-warning mb-1" />
          <span className="text-xs text-muted-foreground">Refunded</span>
          <span className="text-lg font-bold text-white">{referralStats?.refunds ?? 0}</span>
        </Card>
        <Card className="flex flex-col items-center bg-card/60 border border-border p-4">
          <Lock className="w-5 h-5 text-muted-foreground mb-1" />
          <span className="text-xs text-muted-foreground">Pending</span>
          <span className="text-lg font-bold text-yellow-300">${referralStats?.earningsPending ?? 0}</span>
        </Card>
        <Card className="flex flex-col items-center bg-card/60 border border-border p-4">
          <DollarSign className="w-5 h-5 text-green-500 mb-1" />
          <span className="text-xs text-muted-foreground">Available</span>
          <span className="text-lg font-bold text-green-400">${referralStats?.earningsAvailable ?? 0}</span>
        </Card>
      </div>
      {/* Referral Link */}
      <Card className="bg-card/70 border border-border p-6 mb-6">
        <div className="mb-2 text-sm font-medium text-white">Your Referral Link</div>
        <div className="flex items-center gap-2">
          <input
            className="flex-1 bg-background/80 border border-border rounded-md px-3 py-2 text-white text-sm focus:outline-none"
            value={referralLink}
            readOnly
            style={{ minWidth: 0 }}
          />
          <Button onClick={handleCopy} className="bg-purple-600 hover:bg-purple-700 text-white px-4">
            {copied ? "Copied!" : <><Copy className="w-4 h-4 mr-1" /> Copy</>}
          </Button>
        </div>
      </Card>
      {/* Your Impact Widget */}
      <Card className="bg-card/70 border border-border p-6 mb-6">
        <div className="mb-2 text-lg font-semibold text-white">Your Impact</div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col items-center">
            <Briefcase className="w-7 h-7 text-primary mb-1" />
            <span className="text-xl font-bold text-white">{impact.businessesLaunched}</span>
            <span className="text-xs text-muted-foreground">Businesses Launched</span>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <TrendingUp className="w-7 h-7 text-primary mb-1" />
            <span className="text-xl font-bold text-white">${impact.revenueGenerated.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">Revenue Generated</span>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <Zap className="w-7 h-7 text-primary mb-1" />
            <span className="text-xl font-bold text-white">{impact.avgLaunchTime} days</span>
            <span className="text-xs text-muted-foreground">Avg Launch Time <span className="text-green-400">({impact.launchTimeImprovement}% better)</span></span>
          </div>
        </div>
      </Card>
      {/* Affiliate Toolbox */}
      <Card className="bg-card/70 border border-border p-6 mb-6">
        <div className="mb-2 text-lg font-semibold text-white">Affiliate Toolbox</div>
        <div className="flex gap-2 mb-4">
          {toolboxTabs.map(tab => (
            <Button key={tab} variant={toolboxTab === tab ? "default" : "secondary"} className={toolboxTab === tab ? "glow-primary" : ""} onClick={() => setToolboxTab(tab)}>{tab}</Button>
          ))}
        </div>
        <div className="space-y-3">
          {toolboxTab === "Twitter" && (
            <div className="bg-background/80 rounded-lg p-4">
              <div className="font-mono text-sm text-white mb-2">Pre-written Tweet</div>
              <div className="text-muted-foreground">🚀 Launch your startup with @StartupCoPilot — get AI-powered ideas, business plans, and more. Try it free: {referralLink}</div>
            </div>
          )}
          {toolboxTab === "Instagram" && (
            <div className="bg-background/80 rounded-lg p-4">
              <div className="font-mono text-sm text-white mb-2">Instagram Caption</div>
              <div className="text-muted-foreground">Turn your ideas into reality! 💡 Use my link for exclusive access to StartupCoPilot. #startup #founder</div>
            </div>
          )}
          {toolboxTab === "YouTube Shorts" && (
            <div className="bg-background/80 rounded-lg p-4">
              <div className="font-mono text-sm text-white mb-2">YouTube Shorts Hook</div>
              <div className="text-muted-foreground">"What if you could launch a business in 1 week? Here’s how I did it with StartupCoPilot… [link in bio]"</div>
            </div>
          )}
          {toolboxTab === "Blog" && (
            <div className="bg-background/80 rounded-lg p-4">
              <div className="font-mono text-sm text-white mb-2">Blog Intro</div>
              <div className="text-muted-foreground">Starting a business is hard. Here’s how StartupCoPilot makes it easier — and how you can get a head start.</div>
            </div>
          )}
        </div>
      </Card>
      {/* Payout Management */}
      <Card className="bg-card/70 border border-border p-6 mb-6">
        <div className="mb-2 text-lg font-semibold text-white">Earnings & Payouts</div>
        <div className="flex flex-col md:flex-row gap-6 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-white font-bold text-lg">${available}</span>
              <span className="text-xs text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Lock className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-bold text-lg">${pending}</span>
              <span className="text-xs text-muted-foreground">Pending (36h hold)</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="text-white">Payout Method:</span>
              <span className="text-muted-foreground">{payoutMethod}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-white">Threshold:</span>
              <span className="text-muted-foreground">${payoutThreshold}+</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-white">Next Payout:</span>
              <span className="text-muted-foreground">{nextPayout}</span>
            </div>
          </div>
        </div>
        {/* No payout history shown, as mock data is removed and real history is not implemented */}
      </Card>
      {/* Trust-Building Rules Panel */}
      <Card className="bg-card/70 border border-border p-6 mb-6">
        <div className="mb-2 text-lg font-semibold text-white">Rules & Trust</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2"><CheckCircle className="text-green-400 w-5 h-5" /> <span>No self-referrals allowed</span></div>
          <div className="flex items-center gap-2"><AlertTriangle className="text-yellow-400 w-5 h-5" /> <span>Chargebacks cancel commission</span></div>
          <div className="flex items-center gap-2"><CreditCard className="text-primary w-5 h-5" /> <span>Valid payout method required (Stripe or PayPal)</span></div>
          <div className="flex items-center gap-2"><Clock className="text-blue-400 w-5 h-5" /> <span>Commissions clear after 36 hours</span></div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">We protect you from fraud &amp; make sure your referrals are real.</div>
      </Card>
      {/* Onboarding Quests */}
      <Card className="bg-card/70 border border-border p-6 mb-6">
        <div className="mb-2 text-lg font-semibold text-white">Affiliate Missions</div>
        <ol className="list-decimal pl-6 space-y-2">
          {onboarding.map((q, i) => (
            <li key={i} className={q.done ? "text-green-400" : "text-muted-foreground"}>
              {q.step} {q.done && <CheckCircle className="inline w-4 h-4 ml-1 text-green-400" />}
            </li>
          ))}
        </ol>
        <div className="mt-4 text-xs text-muted-foreground">Complete missions to unlock higher commissions, banners, and early access!</div>
      </Card>
    </div>
  );
}
