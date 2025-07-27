import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Copy, 
  Share,
  Gift,
  CheckCircle
} from 'lucide-react';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

export default function AffiliatePage() {
  const [activeSection, setActiveSection] = useState('affiliate');
  const { user } = useFirebaseUser();
  const [copied, setCopied] = useState(false);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  // Generate affiliate link based on user
  const affiliateCode = user?.uid ? user.uid.slice(0, 8) : 'demo123';
  const affiliateLink = `https://founderlauncher.com/?ref=${affiliateCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: 'Referrals', value: '0', icon: Users, color: 'text-blue-500' },
    { label: 'Earnings', value: '$0.00', icon: DollarSign, color: 'text-green-500' },
    { label: 'Conversion Rate', value: '0%', icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <div className="h-screen w-full flex bg-background">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 flex flex-col">
        <Header onSectionChange={handleSectionChange} />
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-8 h-8 text-primary" />
                  <h1 className="text-3xl font-bold text-foreground">Affiliate Program</h1>
                </div>
                <p className="text-muted-foreground">Earn 20% commission by referring new users to Founder Launch</p>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                20% Commission
              </Badge>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        </div>
                        <Icon className={`w-8 h-8 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Affiliate Link */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share className="w-5 h-5" />
                  Your Affiliate Link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input 
                    value={affiliateLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={copyToClipboard} variant="outline">
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Share this link with potential users. You'll earn 20% commission on their first purchase.
                </p>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h3 className="font-semibold mb-2">Share Your Link</h3>
                    <p className="text-sm text-muted-foreground">
                      Share your unique affiliate link with friends, social media, or your audience.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <h3 className="font-semibold mb-2">User Signs Up</h3>
                    <p className="text-sm text-muted-foreground">
                      When someone clicks your link and makes a purchase, they're tracked as your referral.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <h3 className="font-semibold mb-2">Earn Commission</h3>
                    <p className="text-sm text-muted-foreground">
                      You earn 20% commission on their first purchase, paid monthly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coming Soon Features */}
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Detailed analytics and conversion tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Custom promotional materials and banners</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Real-time commission tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Automated monthly payouts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}