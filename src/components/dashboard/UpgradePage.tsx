import { Button } from '@/components/ui/button';
import { Check, X, Star } from 'lucide-react';
import { useState } from 'react';
import { FAQSection } from '@/components/FAQSection';
import { useNavigate } from 'react-router-dom';
import { getStripe } from '@/lib/stripe';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useCredits } from '@/hooks/useCredits';

export default function UpgradePage() {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user } = useFirebaseUser();
  const { setTier } = useCredits();

  // Admin user UIDs - only these users can see tier management buttons
  const ADMIN_UIDS = ['NKYaWpg21RQ1UyADlTylA0NuVaj2']; // Add your specific UID here
  const isAdmin = user && ADMIN_UIDS.includes(user.uid);

  // Helper function to set tier with Firebase and localStorage storage
  const setUserTier = async (tier: 'free' | 'starter' | 'ultra', credits: number) => {
    try {
      if (!user) {
        alert('Please login first to set tier');
        return;
      }
      
      console.log('Setting tier to:', tier, 'for user:', user.uid);
      await setTier(tier);
      alert(`Successfully set tier to ${tier.toUpperCase()}!`);
      
    } catch (e) {
      alert('Failed to set tier: ' + e);
      console.error('Error setting tier:', e);
    }
  };

  // Use real Stripe price IDs from .env
  const STRIPE_PRICES = {
    starter: {
      monthly: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
    },
    ultra: {
      monthly: import.meta.env.VITE_STRIPE_ULTRA_PRICE_ID,
    },
  };


  const handleStripeCheckout = async (plan: 'starter' | 'ultra' , isAnnual: boolean = false) => {
    setLoadingPlan(plan);
    try {
      const stripe = await getStripe();
      if (!stripe) {
        alert('Stripe failed to initialize. Please check your Stripe publishable key and internet connection.');
        setLoadingPlan(null);
        return;
      }
      // Only monthly plans are supported
      const priceId = STRIPE_PRICES[plan]['monthly'];
      if (!priceId) {
        alert('Stripe checkout failed: No price ID set for this plan. Please contact support.');
        setLoadingPlan(null);
        return;
      }
      const mode = 'subscription';
      const result = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode,
        successUrl: window.location.origin + '/dashboard?checkout=success',
        cancelUrl: window.location.href,
      });
      if (result.error) {
        alert('Stripe error: ' + result.error.message);
      }
    } catch (err: any) {
      alert('Stripe checkout failed: ' + (err?.message || err));
    } finally {
      setLoadingPlan(null);
    }
  };

  // Back to Dashboard button
  // Place above the plans
  const plans = [

  // --- UI ---
  // Add this button at the top of the returned JSX
  // (Insert in your return statement as desired)
  // <button onClick={() => navigate('/dashboard')} className="mb-6 px-4 py-2 rounded bg-muted text-foreground font-semibold hover:bg-primary/10 transition">← Back to Dashboard</button>

    {
      name: 'Basic',
      description: 'Perfect for exploring startup ideas',
      price: { monthly: 0, annual: 0 },
      features: [
        '10 AI-generated ideas per month',
        'Basic market analysis',
        'Simple business plan creation',
        'Limited planning tools',
        'Community support',
        'Basic templates access',
      ],
      cta: 'Get Started Free',
      variant: 'outline' as const,
    },
    {
      name: 'Pro',
      description: 'Best for serious entrepreneurs',
      price: { monthly: 29.99, annual: 22.99 },
      features: [
        '50 AI-generated ideas per month',
        'Full launch plans & roadmaps',
        'Advanced market research',
        'BOM & budget builder',
        'Comprehensive business plans',
        'Financial forecasting tools',
        'Export capabilities (PDF/Excel)',
        'Premium templates library',
        'Priority email support',
        'Competitor analysis reports',
      ],
      cta: 'Start Pro Trial',
      variant: 'primary' as const,
      badge: 'Most Popular',
      popular: true,
    },
    {
      name: 'Ultra',
      description: 'For teams and scaling startups',
      price: { monthly: 59.99, annual: 44.99 },
      features: [
        'Unlimited AI generations',
        'AI business agents & assistants',
        'Investor deck creation & optimization',
        'Team collaboration workspace',
        'Advanced analytics & insights',
        'Custom AI model training',
        'API access & integrations',
        'White-label solutions',
        'Dedicated account manager',
        'Legal document templates',
        'Fundraising toolkit',
        'Multi-language support',
      ],
      cta: 'Upgrade to Ultra',
      variant: 'secondary' as const,
    },

  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1024] to-[#181024] text-white">
      <div className="py-12 px-4 sm:px-8">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => window.location.href = '/dashboard'} className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/80 transition">← Back to Dashboard</button>
          <h1 className="text-4xl font-bold text-center flex-1">Upgrade Your Plan</h1>
        </div>
        <div className="text-center mb-16">
          <p className="text-xl max-w-2xl mx-auto mb-8 text-purple-200">
            Start free and scale as you grow. All plans include our core AI features.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 glass-card p-2 rounded-full">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !isAnnual
                  ? 'bg-primary text-primary-foreground shadow-glow-primary'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
                isAnnual
                  ? 'bg-primary text-primary-foreground shadow-glow-primary'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              Annual
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                -25%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* All pricing cards use a more neutral dark background for consistency */}
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`glass-card p-8 rounded-2xl relative transition-all duration-300 bg-[#181024] ${
                plan.popular
                  ? 'border-primary/50 shadow-[0_0_60px_16px_rgba(139,92,246,0.5)] scale-105 glow-primary'
                  : 'hover:shadow-[0_0_40px_8px_rgba(139,92,246,0.3)] hover:scale-105'
              }`}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-1 rounded-full text-sm font-medium text-white flex items-center gap-1 shadow-glow-primary">
                    <Star className="w-3 h-3" />
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-2 text-white">{plan.name}</h3>
                <p className="text-purple-200 text-sm mb-4">{plan.description}</p>

                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">
                    ${isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-purple-300">/month</span>
                </div>

                {isAnnual && plan.price.monthly > 0 && (
                  <p className="text-sm text-green-400 mt-2">
                    Save ${(plan.price.monthly - plan.price.annual) * 12}/year
                  </p>
                )}
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-purple-200">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {/* CTA Button: Free plan routes to login, paid plans use Stripe */}
              {plan.name === 'Basic' ? (
                <Button
                  variant={plan.variant}
                  className={`w-full text-lg font-semibold py-3 ${plan.popular ? 'glow-primary' : 'hover:glow-primary'}`}
                  size="lg"
                  onClick={() => window.location.href = '/login'}
                >
                  {plan.cta}
                </Button>
              ) : (
                <Button
                  variant={plan.variant}
                  className={`w-full text-lg font-semibold py-3 ${plan.popular ? 'glow-primary' : 'hover:glow-primary'}`}
                  size="lg"
                  disabled={loadingPlan === plan.name.toLowerCase()}
                  onClick={() => handleStripeCheckout(plan.name.toLowerCase() as 'starter' | 'ultra', isAnnual)}
                >
                  {loadingPlan === plan.name.toLowerCase() ? 'Redirecting…' : plan.cta}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-5xl mx-auto mt-20 mb-20">
          <div className="glass-card rounded-2xl overflow-hidden shadow-lg bg-[#181024]">
            <h3 className="text-2xl font-semibold text-center py-6 text-white bg-[#181024] border-b border-border">Compare Plans</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-purple-100">
                <thead className="bg-[#181024] border-b border-border">
                  <tr>
                    <th className="py-4 px-6 font-bold">Feature</th>
                    <th className="py-4 px-6 font-bold">Basic</th>
                    <th className="py-4 px-6 font-bold">Pro</th>
                    <th className="py-4 px-6 font-bold">Ultra</th>
                  </tr>
                </thead>
                <tbody className="bg-[#181024] divide-y divide-border">
                  {[{
                    feature: 'AI-generated ideas per month',
                    values: ['10', '50', 'Unlimited']
                  },
                  {
                    feature: 'Market analysis',
                    values: ['Basic', 'Advanced', 'Advanced + Custom AI']
                  },
                  {
                    feature: 'Business plan creation',
                    values: ['Simple', 'Comprehensive', 'AI-Optimized + Investor Ready']
                  },
                  {
                    feature: 'Financial forecasting',
                    values: [false, true, true]
                  },
                  {
                    feature: 'Export capabilities',
                    values: [false, 'PDF/Excel', 'All formats + API']
                  },
                  {
                    feature: 'Templates library',
                    values: ['Basic', 'Premium', 'Custom + White-label']
                  },
                  {
                    feature: 'Support',
                    values: ['Community', 'Priority Email', 'Dedicated Manager']
                  },
                  {
                    feature: 'Team collaboration',
                    values: [false, false, true]
                  },
                  {
                    feature: 'AI business agents',
                    values: [false, false, true]
                  },
                  {
                    feature: 'Investor deck creation',
                    values: [false, false, true]
                  },
                  {
                    feature: 'API access',
                    values: [false, false, true]
                  },
                  {
                    feature: 'Custom AI training',
                    values: [false, false, true]
                  },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 px-6">{row.feature}</td>
                      {row.values.map((value, j) => (
                        <td key={j} className="py-3 px-6">
                          {typeof value === 'boolean' ? (value ? <Check className="w-5 h-5 text-green-400 inline" /> : <X className="w-5 h-5 text-red-400 inline" />) : value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="text-center mt-16">
          <div className="glass-card p-8 rounded-2xl max-w-2xl mx-auto bg-[#181024]">
            <h3 className="text-xl font-semibold mb-2 text-white">Need a custom solution?</h3>
            <p className="text-purple-200 mb-6">
              Enterprise plans with custom AI models, dedicated infrastructure, and white-label options.
            </p>
            <Button variant="outline" className="text-white border-purple-400 hover:bg-purple-800/40">
              Contact Enterprise Sales
            </Button>
          </div>
        </div>

        {/* FAQ Section - styled like landing page */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="glass-card rounded-2xl overflow-hidden">
            {/* Import and render the FAQSection */}
            {/* @ts-ignore: FAQSection is default export */}
            <FAQSection />
          </div>
        </div>

        {/* Tier Management Buttons - only visible to admin users */}
        {isAdmin && (
          <div className="mt-12 flex flex-col items-center">
            <div className="text-lg font-semibold text-white mb-4">Admin Tier Management</div>
            <div className="text-sm text-purple-300 mb-4">User ID: {user?.uid}</div>
            <div className="flex gap-4 mb-4">
              <button
                id="set-free-tier-btn"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition"
                onClick={() => setUserTier('free', 10000)}
              >
                Set Free Tier
              </button>
              <button
                id="set-pro-tier-btn"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition"
                onClick={() => setUserTier('starter', 50000)}
              >
                Set Pro Tier
              </button>
              <button
                id="set-ultra-tier-btn"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition"
                onClick={() => setUserTier('ultra', 250000)}
              >
                Set Ultra Tier
              </button>
            </div>
            
            {/* Additional Test Buttons */}
            <div className="flex gap-4 mb-4">
              <button
                id="test-stripe-pro-btn"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition"
                onClick={() => handleStripeCheckout('starter', false)}
                disabled={loadingPlan === 'starter'}
              >
                {loadingPlan === 'starter' ? 'Testing...' : 'Test Stripe Starter'}
              </button>
              <button
                id="test-stripe-ultra-btn"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition"
                onClick={() => handleStripeCheckout('ultra', false)}
                disabled={loadingPlan === 'ultra'}
              >
                {loadingPlan === 'ultra' ? 'Testing...' : 'Test Stripe Ultra'}
              </button>
            </div>
            
            <div className="text-xs text-muted-foreground">(Admin access only)</div>
          </div>
        )}
      </div>
    </div>
  );
}
