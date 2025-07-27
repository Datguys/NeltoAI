import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { useState } from 'react';

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for exploring startup ideas',
      price: { monthly: 0, annual: 0 },
      features: [
        '5 AI-generated ideas per month',
        'Basic market analysis',
        'Limited planning tools',
        'Community support'
      ],
      cta: 'Get Started',
      variant: 'outline' as const
    },
    {
      name: 'Pro',
      description: 'Best for serious entrepreneurs',
      price: { monthly: 19.99, annual: 14.99 },
      features: [
        '20 AI-generated ideas per month',
        'Full launch plans & roadmaps',
        'Advanced market research',
        'BOM & budget builder',
        'Export capabilities',
        'Priority support'
      ],
      cta: 'Start Pro Trial',
      variant: 'primary' as const,
      badge: 'Best Value',
      popular: true
    },
    {
      name: 'Ultra',
      description: 'For teams and scaling startups',
      price: { monthly: 39.99, annual: 29.99 },
      features: [
        'Unlimited AI generations',
        'AI business agents',
        'Investor deck creation',
        'Team collaboration',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated support'
      ],
      cta: 'Contact Sales',
      variant: 'secondary' as const
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="mb-4">Choose Your Plan</h2>
          <p className="text-subtitle max-w-2xl mx-auto mb-8">
            Start free and scale as you grow. All plans include our core AI features.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 glass-card p-2 rounded-full">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !isAnnual 
                  ? 'bg-primary text-primary-foreground shadow-glow-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
                isAnnual 
                  ? 'bg-primary text-primary-foreground shadow-glow-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
              <span className="absolute -top-1 -right-1 bg-success text-success-foreground text-xs px-1.5 py-0.5 rounded-full">
                -25%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`glass-card p-8 rounded-2xl relative transition-all duration-300 ${
  plan.popular 
    ? 'border-primary/50 shadow-[0_0_40px_10px_rgba(139,92,246,0.5)] scale-105' // Stronger glow for popular
    : 'hover:shadow-[0_0_32px_8px_rgba(139,92,246,0.4)] hover:scale-105' // Glow on hover for others
}`}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-primary px-4 py-1 rounded-full text-sm font-medium text-primary-foreground flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">
                    ${isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                
                {isAnnual && plan.price.monthly > 0 && (
                  <p className="text-sm text-success mt-2">
                    Save ${(plan.price.monthly - plan.price.annual) * 12}/year
                  </p>
                )}
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button 
                variant={plan.variant} 
                className="w-full"
                size="lg"
                onClick={plan.name === 'Free' ? () => window.location.href = '/login' : undefined}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="text-center mt-16">
          <div className="glass-card p-8 rounded-2xl max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-2">Need a custom solution?</h3>
            <p className="text-muted-foreground mb-6">
              Enterprise plans with custom AI models, dedicated infrastructure, and white-label options.
            </p>
            <Button variant="outline">
              Contact Enterprise Sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}