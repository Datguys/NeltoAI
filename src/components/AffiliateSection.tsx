import { Button } from '@/components/ui/button';
import { DollarSign, Users, TrendingUp } from 'lucide-react';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useNavigate } from 'react-router-dom';

export function AffiliateSection() {
  const { user } = useFirebaseUser();
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-gradient-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="mb-4">Earn with VeltoAI</h2>
          <p className="text-subtitle max-w-2xl mx-auto">
            Join our affiliate program and earn 20% commission by sharing VeltoAI with your network
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="glass-card p-6 rounded-2xl text-center">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 mb-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">20% Commission</h3>
            <p className="text-muted-foreground">
              Earn recurring commissions on every referral that converts to a paid plan
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
            <p className="text-muted-foreground">
              Get your unique link and start sharing with your audience immediately
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
            <p className="text-muted-foreground">
              Monitor your referrals and earnings with our comprehensive dashboard
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="glass-card p-8 rounded-2xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">Ready to Start Earning?</h3>
            <p className="text-muted-foreground mb-6">
              Perfect for content creators, business coaches, and entrepreneurship communities
            </p>
            {/* Button logic: if not signed in, sign in and redirect to /affiliate; if signed in, go straight to /affiliate */}
            <Button
              size="lg"
              className="mr-4"
              onClick={() => {
                if (!user) {
                  navigate('/login?redirect=/affiliate');
                } else {
                  navigate('/affiliate');
                }
              }}
            >
              Join Affiliate Program
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}