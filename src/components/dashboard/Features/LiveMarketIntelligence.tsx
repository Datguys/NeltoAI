import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAICompletion } from "@/lib/ai";
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { 
  AlertTriangle, 
  TrendingUp, 
  Building2, 
  Eye, 
  Plus, 
  RotateCcw,
  Bell,
  BarChart3,
  Target,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Star,
  ExternalLink,
  Settings,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "../Sidebar";

interface MarketAlert {
  id: string;
  type: 'warning' | 'info' | 'opportunity';
  title: string;
  description: string;
  time: string;
  location?: string;
  priority: 'high' | 'medium' | 'low';
}

interface Competitor {
  id: string;
  name: string;
  type: string;
  distance: string;
  rating: number;
  changes: {
    price?: { from: string; to: string; trend: 'up' | 'down' };
    features?: string[];
    rating?: { from: number; to: number; trend: 'up' | 'down' };
    popularity?: { followers: string; growth: string };
  };
}

interface Opportunity {
  id: string;
  title: string;
  type: 'contract' | 'location' | 'partnership' | 'expansion';
  description: string;
  value: string;
  deadline?: string;
  matchScore: number;
  requirements?: string[];
  actionable: boolean;
}

const mockAlerts: MarketAlert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'New coffee shop permit filed for downtown Austin',
    description: 'Location: 2 blocks from your planned location',
    time: '2 hours ago',
    location: 'Downtown Austin',
    priority: 'high'
  },
  {
    id: '2',
    type: 'info',
    title: 'Austin coffee market grows 8% in Q4',
    description: 'Industry report shows strong local demand',
    time: 'Yesterday',
    priority: 'medium'
  }
];

const mockCompetitors: Competitor[] = [
  {
    id: '1',
    name: 'Downtown Brew',
    type: 'Coffee Shop',
    distance: '0.3 miles',
    rating: 4.2,
    changes: {
      price: { from: '$4.25', to: '$4.50', trend: 'up' },
      features: ['New loyalty program launched'],
      rating: { from: 4.4, to: 4.2, trend: 'down' }
    }
  },
  {
    id: '2',
    name: 'Austin Coffee Collective',
    type: 'Coffee Chain',
    distance: '0.7 miles',
    rating: 4.6,
    changes: {
      features: ['Expanded to 2nd location'],
      popularity: { followers: '12.5K', growth: '↑ 8% this month' }
    }
  }
];

const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Corporate Catering Contract',
    type: 'contract',
    description: 'TechHub Austin seeking coffee catering service',
    value: '$15K+ monthly potential',
    deadline: 'Applications due in 5 days',
    matchScore: 95,
    requirements: ['200+ employees', 'Daily service needed', 'Premium coffee preferred'],
    actionable: true
  },
  {
    id: '2',
    title: 'Prime Location Available',
    type: 'location',
    description: 'Corner spot downtown, 1,200 sq ft',
    value: 'Rent: $4,200/month (15% below market)',
    matchScore: 88,
    requirements: ['Available March 1st', 'High foot traffic area'],
    actionable: true
  },
  {
    id: '3',
    title: 'Mobile Coffee Cart',
    type: 'expansion',
    description: 'Target: UT campus, estimated $3K/month revenue',
    value: 'Investment: $15K setup cost, 5 months payback',
    matchScore: 82,
    actionable: false
  }
];

export function LiveMarketIntelligence() {
  const { user } = useFirebaseUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [trackedCompetitors, setTrackedCompetitors] = useState(mockCompetitors);
  const [opportunities, setOpportunities] = useState(mockOpportunities);
  const [activeSection, setActiveSection] = useState("market-intelligence");
  const [businessType, setBusinessType] = useState("");
  const [location, setLocation] = useState("");
  const [keywords, setKeywords] = useState("");
  const [marketData, setMarketData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'opportunity':
        return <Target className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case 'contract':
        return <Building2 className="w-5 h-5 text-purple-500" />;
      case 'location':
        return <MapPin className="w-5 h-5 text-blue-500" />;
      case 'partnership':
        return <Users className="w-5 h-5 text-green-500" />;
      default:
        return <Target className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleGenerateMarketData = async () => {
    if (!businessType || !location || !keywords) {
      alert("Please fill in all fields: Business Type, Location, and Keywords.");
      return;
    }

    setIsLoading(true);
    setMarketData(null);

    const prompt = `Generate live market intelligence for a ${businessType} business in ${location}, focusing on ${keywords}. Provide data on:
- Market Size (annual, in USD)
- Growth Rate (annual percentage)
- Number of Competitors (in a 5-mile radius)
- Average Price for a key product/service
- 3-5 Key Insights/Trends (bullet points)

Format the output as a JSON object with keys: marketSize, growthRate, numCompetitors, averagePrice, keyInsights (array of strings). Ensure all numerical values are pure numbers (no currency symbols or percentage signs).`;

    try {
      const response = await getAICompletion({
        messages: [{ role: 'user', content: prompt }],
        model: 'google/gemini-1.5-flash', // Using a capable model for data extraction
        temperature: 0.2,
        max_tokens: 1000,
        userKey: user?.uid || 'anonymous',
        userId: user?.uid,
      });

      const parsedResponse = JSON.parse(response);
      setMarketData(parsedResponse);
    } catch (error) {
      console.error('Error generating market data:', error);
      alert('Failed to generate market data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4",
          i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
        )}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                📊 Live Market Intelligence
              </h1>
              <p className="text-muted-foreground mt-1">
                Connected to your Austin Coffee Co. business plan
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Alert Settings
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Market Overview</TabsTrigger>
            <TabsTrigger value="alerts">Live Alerts</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Market Data Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  GENERATE MARKET DATA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Input
                      id="businessType"
                      placeholder="e.g., Coffee Shop"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Austin, TX"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      placeholder="e.g., local trends, pricing"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleGenerateMarketData} disabled={isLoading} className="w-full">
                  {isLoading ? "Generating..." : "Generate Market Data"}
                </Button>
              </CardContent>
            </Card>

            {/* Market Overview */}
            {marketData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Market Stats */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📈 MARKET OVERVIEW FOR {businessType.toUpperCase()} IN {location.toUpperCase()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Market Size</p>
                        <p className="text-2xl font-bold text-foreground">${marketData.marketSize}M annually</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Growth Rate</p>
                        <p className="text-2xl font-bold text-green-600 flex items-center gap-1">
                          {marketData.growthRate}% <ArrowUp className="w-4 h-4" />
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Competition</p>
                        <p className="text-2xl font-bold text-foreground">{marketData.numCompetitors} shops</p>
                        <p className="text-xs text-muted-foreground">in 5-mile radius</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Average Price</p>
                        <p className="text-2xl font-bold text-foreground">${marketData.averagePrice}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <h4 className="font-semibold text-foreground mb-3">🎯 KEY INSIGHTS:</h4>
                      <div className="space-y-2 text-sm">
                        {marketData.keyInsights.map((insight: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Full Market Report
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Refresh Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Alerts</p>
                          <p className="text-2xl font-bold text-red-500">2</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Tracked Competitors</p>
                          <p className="text-2xl font-bold text-foreground">5</p>
                        </div>
                        <Eye className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Opportunities</p>
                          <p className="text-2xl font-bold text-green-500">3</p>
                        </div>
                        <Target className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            {/* Live Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔴 LIVE ALERTS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-4 rounded-lg border-l-4 space-y-2",
                      alert.type === 'warning' && "bg-red-50 dark:bg-red-950/20 border-l-red-500",
                      alert.type === 'info' && "bg-blue-50 dark:bg-blue-950/20 border-l-blue-500",
                      alert.type === 'opportunity' && "bg-green-50 dark:bg-green-950/20 border-l-green-500"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{alert.title}</h4>
                            <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                              {alert.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {alert.time}
                            </span>
                            {alert.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {alert.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button size="sm">
                          Update Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-6">
            {/* Competitor Monitoring */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    🏢 COMPETITOR MONITORING
                  </CardTitle>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Manage List
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {trackedCompetitors.map((competitor) => (
                  <div key={competitor.id} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-foreground">☕ {competitor.name}</h4>
                          <Badge variant="outline">{competitor.type}</Badge>
                          <span className="text-sm text-muted-foreground">{competitor.distance}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            {renderStars(competitor.rating)}
                          </div>
                          <span className="text-sm font-medium">{competitor.rating}/5</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {competitor.changes.price && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span>Price increase: {competitor.changes.price.from} → {competitor.changes.price.to}</span>
                          <Badge variant="secondary">Last week</Badge>
                        </div>
                      )}
                      {competitor.changes.features?.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Plus className="w-4 h-4 text-blue-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {competitor.changes.rating && (
                        <div className="flex items-center gap-2 text-sm">
                          {competitor.changes.rating.trend === 'down' ? (
                            <ArrowDown className="w-4 h-4 text-red-500" />
                          ) : (
                            <ArrowUp className="w-4 h-4 text-green-500" />
                          )}
                          <span>
                            Yelp rating: {competitor.changes.rating.from}/5 → {competitor.changes.rating.to}/5
                          </span>
                        </div>
                      )}
                      {competitor.changes.popularity && (
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-purple-500" />
                          <span>Instagram followers: {competitor.changes.popularity.followers} ({competitor.changes.popularity.growth})</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="text-center">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View All Competitors
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            {/* Opportunities */}
            <div className="space-y-6">
              {/* High Priority */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🔥 HIGH PRIORITY OPPORTUNITIES
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {opportunities.filter(opp => opp.matchScore >= 90).map((opportunity) => (
                    <div key={opportunity.id} className="p-6 border-2 border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50/50 dark:bg-orange-950/20">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-orange-500 rounded-lg text-white">
                            {getOpportunityIcon(opportunity.type)}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-foreground mb-1">{opportunity.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{opportunity.description}</p>
                            <p className="text-sm font-medium text-green-600 mb-2">{opportunity.value}</p>
                            {opportunity.deadline && (
                              <p className="text-sm text-red-600 font-medium">{opportunity.deadline}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-2">
                            <span className="text-sm text-muted-foreground">Match Score:</span>
                            <span className="font-bold text-orange-600">{opportunity.matchScore}%</span>
                            <div className="flex">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "w-4 h-4",
                                    i < Math.ceil(opportunity.matchScore / 20) ? "text-orange-400 fill-current" : "text-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {opportunity.requirements && (
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-foreground mb-2">Requirements:</h5>
                          <ul className="space-y-1">
                            {opportunity.requirements.map((req, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {opportunity.actionable ? (
                          <>
                            <Button className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              View Requirements
                            </Button>
                            <Button variant="outline" className="flex items-center gap-2">
                              <Plus className="w-4 h-4" />
                              Apply Now
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline" className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Analyze Opportunity
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Bell className="w-4 h-4" />
                          Remind Me
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Growth Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📊 GROWTH OPPORTUNITIES
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {opportunities.filter(opp => opp.matchScore < 90).map((opportunity) => (
                    <div key={opportunity.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-500 rounded-lg text-white">
                            {getOpportunityIcon(opportunity.type)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">{opportunity.title}</h4>
                            <p className="text-sm text-muted-foreground mb-1">{opportunity.description}</p>
                            <p className="text-sm text-green-600">{opportunity.value}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Match: {opportunity.matchScore}%</span>
                          <Button variant="outline" size="sm">
                            <Target className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Analyze All
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Save Favorites
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Plan Timeline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
}