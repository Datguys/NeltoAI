import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TIERS = [
  {
    name: 'Free',
    price: 'Free',
    description: 'Perfect for exploring startup ideas',
    features: [
      '1 project',
      '3 AI ideas per day',
      '1 deep analysis per day',
      '25,000 credits/month',
      'Basic market analysis',
      'Community support',
      'Upgrade anytime',
    ],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$9/mo',
    description: 'Best for serious entrepreneurs',
    features: [
      'Unlimited projects',
      'Unlimited AI ideas',
      'Unlimited deep analysis',
      '250,000 credits/month',
      'Advanced market analysis',
      'Priority support',
      'All Free features',
    ],
    highlight: true,
  },
  {
    name: 'Ultra',
    price: '$29/mo',
    description: 'For power users & teams',
    features: [
      'Everything in Pro',
      '2,500,000 credits/month',
      'Team collaboration',
      'Early access to new features',
      'Personal onboarding',
      'White-glove support',
    ],
    highlight: false,
  },
];

export function TierExplanation({ onUpgrade }: { onUpgrade?: () => void }) {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-extrabold text-center mb-2 text-primary drop-shadow-lg">
        Compare Plans & Unlock More
      </h2>
      <p className="text-lg text-muted-foreground text-center mb-10">
        See what you get with Free, Pro, and Ultra. Upgrade to unlock more power, features, and support.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-2xl border border-border bg-card/80 shadow-lg p-8 flex flex-col items-center ${
              tier.highlight ? 'border-primary shadow-glow-primary scale-105 z-10' : ''
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {tier.highlight && <Star className="w-5 h-5 text-primary animate-bounce" />}
              <span className="text-2xl font-bold text-foreground">{tier.name}</span>
            </div>
            <div className="text-3xl font-extrabold mb-2 text-primary">
              {tier.price}
            </div>
            <div className="mb-4 text-muted-foreground text-center">
              {tier.description}
            </div>
            <ul className="mb-6 space-y-2 w-full max-w-xs mx-auto">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-base text-foreground">
                  <Check className="w-4 h-4 text-success" /> {f}
                </li>
              ))}
            </ul>
            {tier.name !== 'Free' && (
              <Button
                className="w-full mt-auto bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-glow-primary hover:scale-105 transition"
                onClick={onUpgrade}
              >
                Upgrade to {tier.name}
              </Button>
            )}
          </div>
        ))}
      </div>
      <div className="text-center mt-10 text-muted-foreground text-sm">
        💳 Converts curious users into paying ones. Pairs perfectly with upgrade prompts.<br/>
        <span className="text-primary font-semibold">Why?</span> Once users hit the free limit, they’ll want to know what “Pro” or “Ultra” gets them.<br/>
        <span className="text-success">✅ Supports revenue</span> &nbsp; <span className="text-success">✅ Makes value ladder visible</span> &nbsp; <span className="text-success">✅ Adds polish to the product experience</span>
      </div>
    </div>
  );
}
